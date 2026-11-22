import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { AtlasCameraPreset, AtlasSceneMode } from '../types/medical';
import { ThemeMode } from '../context/MedicalArchiveContext';
import { BRAIN_MRI_LANDMARKS } from '../data/brainFindingsData';
import { buildProceduralSpineScene, SpineSceneHandle } from '../three/spineAnatomyBuilder';
import { buildProceduralBrainScene, BrainSceneHandle } from '../three/brainAnatomyBuilder';
import { disposeObject3D, tryLoadOptionalGlb } from '../three/optionalGlbLoader';

export interface SpineLayersState {
  vertebrae: boolean;
  discs: boolean;
  muscles: boolean;
}

export interface BrainLayersState {
  hemispheres: boolean;
  vessels: boolean;
  markers: boolean;
}

export interface Atlas3DViewportProps {
  sceneMode: AtlasSceneMode;
  theme: ThemeMode;
  selectedSegmentId: string;
  selectedBrainId: string;
  focusTriggerNonce: number;
  cameraPresetRequest: { preset: AtlasCameraPreset; nonce: number } | null;
  spineLayers: SpineLayersState;
  brainLayers: BrainLayersState;
  onSelectSegment: (segmentId: string) => void;
  onSelectBrainFinding: (findingId: string) => void;
  onModelSourceChange: (scene: AtlasSceneMode, source: 'procedural' | 'glb') => void;
}

// Reusable math helpers outside animation loop (zero per-frame GC)
const _mouse = new THREE.Vector2();
const _raycaster = new THREE.Raycaster();

function detectSoftwareWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return false;
  }
}

function createContactShadowPlane(): THREE.Mesh {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(128, 128, 12, 128, 128, 120);
    grad.addColorStop(0, 'rgba(15, 23, 42, 0.34)');
    grad.addColorStop(0.55, 'rgba(15, 23, 42, 0.12)');
    grad.addColorStop(1, 'rgba(15, 23, 42, 0.0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const geo = new THREE.PlaneGeometry(5.6, 5.6);
  geo.rotateX(-Math.PI / 2);
  const mat = new THREE.MeshBasicMaterial({
    map: tex,
    transparent: true,
    depthWrite: false,
    opacity: 0.7,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = -4.2;
  mesh.renderOrder = 0;
  return mesh;
}

function getDefaultCameraForScene(mode: AtlasSceneMode): {
  pos: THREE.Vector3;
  target: THREE.Vector3;
} {
  if (mode === 'spine') {
    return {
      pos: new THREE.Vector3(-4.2, 0.5, 7.2),
      target: new THREE.Vector3(-0.15, 0.0, -0.1),
    };
  }
  return {
    pos: new THREE.Vector3(-2.8, 0.75, 3.65),
    target: new THREE.Vector3(0, -0.1, 0.05),
  };
}

function getPresetCameraForScene(
  mode: AtlasSceneMode,
  preset: AtlasCameraPreset,
): { pos: THREE.Vector3; target: THREE.Vector3 } {
  if (preset === 'reset') {
    return getDefaultCameraForScene(mode);
  }
  if (mode === 'spine') {
    const target = new THREE.Vector3(-0.1, 0.0, -0.1);
    if (preset === 'front') return { pos: new THREE.Vector3(0, 0.25, 8.6), target };
    if (preset === 'side') return { pos: new THREE.Vector3(-8.4, 0.25, 0.1), target };
    return { pos: new THREE.Vector3(0, 0.25, -8.6), target };
  }
  const target = new THREE.Vector3(0, -0.1, 0.05);
  if (preset === 'front') return { pos: new THREE.Vector3(0, 0.15, 4.4), target };
  if (preset === 'side') return { pos: new THREE.Vector3(-4.4, 0.15, 0.1), target };
  return { pos: new THREE.Vector3(0, 0.15, -4.4), target };
}

export const Atlas3DViewport: React.FC<Atlas3DViewportProps> = ({
  sceneMode,
  theme,
  selectedSegmentId,
  selectedBrainId,
  focusTriggerNonce,
  cameraPresetRequest,
  spineLayers,
  brainLayers,
  onSelectSegment,
  onSelectBrainFinding,
  onModelSourceChange,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Latest callbacks & reactive props in refs so WebGL lifecycle never tears down
  const callbacksRef = useRef({
    onSelectSegment,
    onSelectBrainFinding,
    onModelSourceChange,
  });
  callbacksRef.current = {
    onSelectSegment,
    onSelectBrainFinding,
    onModelSourceChange,
  };

  const sceneModeRef = useRef<AtlasSceneMode>(sceneMode);
  sceneModeRef.current = sceneMode;

  // Imperative Three.js controller handle
  const engineRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    controls: OrbitControls;
    spineHandle: SpineSceneHandle;
    brainHandle: BrainSceneHandle;
    spineGlbGroup: THREE.Group | null;
    brainGlbGroup: THREE.Group | null;
    contactPlane: THREE.Mesh;
    hemiLight: THREE.HemisphereLight;
    requestRender: () => void;
    flyTo: (pos: THREE.Vector3, target: THREE.Vector3) => void;
  } | null>(null);

  // Initialize Three.js WebGLRenderer & Scenes ONCE on mount
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareWebGL();
    const width = Math.max(container.clientWidth, 300);
    const height = Math.max(container.clientHeight, 360);

    const scene = new THREE.Scene();
    const initialBg = theme === 'dark' ? 0x0b1222 : 0xe8eef6;
    scene.background = new THREE.Color(initialBg);
    scene.fog = new THREE.Fog(initialBg, 14, 34);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    const initialCam = getDefaultCameraForScene(sceneMode);
    camera.position.copy(initialCam.pos);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);

    // Mandatory procedural studio reflections (RoomEnvironment)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmremGenerator.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    roomEnv.dispose();
    pmremGenerator.dispose();

    // Balanced 3-point warm/cool studio lighting rig
    const hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x334155, 0.85);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff7ed, 1.85);
    keyLight.position.set(5.5, 8.5, 6.5);
    if (!isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.camera.near = 1;
      keyLight.shadow.camera.far = 26;
      keyLight.shadow.camera.left = -5.5;
      keyLight.shadow.camera.right = 5.5;
      keyLight.shadow.camera.top = 5.5;
      keyLight.shadow.camera.bottom = -5.5;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x7dd3fc, 0.9);
    rimLight.position.set(-6, 3.5, -6.5);
    scene.add(rimLight);

    const contactPlane = createContactShadowPlane();
    scene.add(contactPlane);

    // Build both procedural anatomical scenes immediately (zero blank flash)
    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const spineHandle = buildProceduralSpineScene(maxAniso);
    const brainHandle = buildProceduralBrainScene(maxAniso);

    spineHandle.root.visible = sceneMode === 'spine';
    brainHandle.root.visible = sceneMode === 'brain';
    scene.add(spineHandle.root);
    scene.add(brainHandle.root);

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.copy(initialCam.target);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.075;
    controls.minDistance = 1.6;
    controls.maxDistance = 16.0;
    controls.enablePan = true;
    controls.update();

    // Smooth camera transition state
    let transitionActive = false;
    const goalPos = new THREE.Vector3().copy(initialCam.pos);
    const goalTarget = new THREE.Vector3().copy(initialCam.target);
    let lastTimestamp = performance.now();

    let disposed = false;
    let frameId = 0;
    let renderBusy = false;
    let renderDirty = false;

    const afterDraw = (cb: () => void) => {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (!gl || typeof gl.fenceSync !== 'function') {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) {
          if (sync) gl.deleteSync(sync);
          return;
        }
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    };

    const requestRender = () => {
      if (disposed) return;
      if (renderBusy) {
        renderDirty = true;
        return;
      }
      renderBusy = true;
      frameId = requestAnimationFrame((now) => {
        if (disposed) return;
        renderDirty = false;

        const dt = Math.min((now - lastTimestamp) / 1000, 0.08);
        lastTimestamp = now;

        let needsMoreFrames = false;

        if (transitionActive) {
          const lambda = isSoftwareGl ? 18 : 7.5;
          camera.position.x = THREE.MathUtils.damp(camera.position.x, goalPos.x, lambda, dt);
          camera.position.y = THREE.MathUtils.damp(camera.position.y, goalPos.y, lambda, dt);
          camera.position.z = THREE.MathUtils.damp(camera.position.z, goalPos.z, lambda, dt);

          controls.target.x = THREE.MathUtils.damp(controls.target.x, goalTarget.x, lambda, dt);
          controls.target.y = THREE.MathUtils.damp(controls.target.y, goalTarget.y, lambda, dt);
          controls.target.z = THREE.MathUtils.damp(controls.target.z, goalTarget.z, lambda, dt);

          const posDist = camera.position.distanceTo(goalPos);
          const tgtDist = controls.target.distanceTo(goalTarget);
          if (posDist < 0.015 && tgtDist < 0.015) {
            camera.position.copy(goalPos);
            controls.target.copy(goalTarget);
            transitionActive = false;
          } else {
            needsMoreFrames = true;
          }
        }

        const dampingChanged = controls.update();
        if (dampingChanged && !isSoftwareGl) {
          needsMoreFrames = true;
        }

        renderer.render(scene, camera);

        const done = () => {
          renderBusy = false;
          if (renderDirty || needsMoreFrames) {
            requestRender();
          }
        };

        if (isSoftwareGl) afterDraw(done);
        else done();
      });
    };

    const flyTo = (pos: THREE.Vector3, target: THREE.Vector3) => {
      goalPos.copy(pos);
      goalTarget.copy(target);
      transitionActive = true;
      lastTimestamp = performance.now();
      requestRender();
    };

    // Cancel scripted camera flyTo immediately when user starts orbiting/panning
    const onControlsStart = () => {
      transitionActive = false;
    };
    const onControlsChange = () => {
      requestRender();
    };
    controls.addEventListener('start', onControlsStart);
    controls.addEventListener('change', onControlsChange);

    // Pre-warm shaders on real GPUs
    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Raycasting: click to select disc or brain marker (ignore drag gestures)
    let downX = 0;
    let downY = 0;
    let lastHoverTime = 0;

    const getActiveClickables = (): THREE.Object3D[] => {
      return sceneModeRef.current === 'spine' ? spineHandle.clickables : brainHandle.clickables;
    };

    const updateMouseNdc = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      _mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      _mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onPointerDown = (e: PointerEvent) => {
      downX = e.clientX;
      downY = e.clientY;
    };

    const onPointerUp = (e: PointerEvent) => {
      const moved = Math.hypot(e.clientX - downX, e.clientY - downY);
      if (moved > 6) return;

      updateMouseNdc(e);
      _raycaster.setFromCamera(_mouse, camera);
      const hits = _raycaster.intersectObjects(getActiveClickables(), false);
      if (hits.length > 0) {
        const hitObj = hits[0].object;
        if (sceneModeRef.current === 'spine' && typeof hitObj.userData.segmentId === 'string') {
          callbacksRef.current.onSelectSegment(hitObj.userData.segmentId);
        } else if (
          sceneModeRef.current === 'brain' &&
          typeof hitObj.userData.findingId === 'string'
        ) {
          callbacksRef.current.onSelectBrainFinding(hitObj.userData.findingId);
        }
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - lastHoverTime < 65) return;
      lastHoverTime = now;

      updateMouseNdc(e);
      _raycaster.setFromCamera(_mouse, camera);
      const hits = _raycaster.intersectObjects(getActiveClickables(), false);
      renderer.domElement.style.cursor = hits.length > 0 ? 'pointer' : 'grab';
    };

    renderer.domElement.style.cursor = 'grab';
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);
    renderer.domElement.addEventListener('pointermove', onPointerMove);

    // Responsive ResizeObserver
    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry || disposed) return;
      const w = Math.max(Math.floor(entry.contentRect.width), 240);
      const h = Math.max(Math.floor(entry.contentRect.height), 320);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
      requestRender();
    });
    resizeObserver.observe(container);

    const engineObj = {
      scene,
      camera,
      controls,
      spineHandle,
      brainHandle,
      spineGlbGroup: null as THREE.Group | null,
      brainGlbGroup: null as THREE.Group | null,
      contactPlane,
      hemiLight,
      requestRender,
      flyTo,
    };
    engineRef.current = engineObj;

    // Hybrid optional GLB loading (silently checks ./models/spine.glb & ./models/brain_vessels.glb)
    const abortController = new AbortController();
    void (async () => {
      const [spineGlb, brainGlb] = await Promise.all([
        tryLoadOptionalGlb('./models/spine.glb', 6.8, abortController.signal),
        tryLoadOptionalGlb('./models/brain_vessels.glb', 3.1, abortController.signal),
      ]);
      if (disposed) {
        if (spineGlb) disposeObject3D(spineGlb);
        if (brainGlb) disposeObject3D(brainGlb);
        return;
      }

      if (spineGlb) {
        spineHandle.vertebraeGroup.visible = false;
        spineGlb.name = 'Loaded_Spine_GLB';
        spineHandle.root.add(spineGlb);
        engineObj.spineGlbGroup = spineGlb;
        callbacksRef.current.onModelSourceChange('spine', 'glb');
        requestRender();
      } else {
        callbacksRef.current.onModelSourceChange('spine', 'procedural');
      }

      if (brainGlb) {
        brainHandle.hemispheresGroup.visible = false;
        brainGlb.name = 'Loaded_Brain_GLB';
        brainHandle.root.add(brainGlb);
        engineObj.brainGlbGroup = brainGlb;
        callbacksRef.current.onModelSourceChange('brain', 'glb');
        requestRender();
      } else {
        callbacksRef.current.onModelSourceChange('brain', 'procedural');
      }
    })();

    requestRender();

    return () => {
      disposed = true;
      abortController.abort();
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      resizeObserver.disconnect();
      controls.removeEventListener('start', onControlsStart);
      controls.removeEventListener('change', onControlsChange);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      controls.dispose();

      spineHandle.dispose();
      brainHandle.dispose();
      disposeObject3D(contactPlane);
      envTarget.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
      engineRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync light / dark theme background & fog cleanly without recreating WebGL
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    const bgHex = theme === 'dark' ? 0x0b1222 : 0xe8eef6;
    engine.scene.background = new THREE.Color(bgHex);
    engine.scene.fog = new THREE.Fog(bgHex, 14, 34);
    engine.hemiLight.intensity = theme === 'dark' ? 0.72 : 0.95;
    (engine.contactPlane.material as THREE.MeshBasicMaterial).opacity =
      theme === 'dark' ? 0.45 : 0.68;
    engine.requestRender();
  }, [theme]);

  // Sync active scene visibility (Spine vs Brain) & reset default camera smoothly
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.spineHandle.root.visible = sceneMode === 'spine';
    engine.brainHandle.root.visible = sceneMode === 'brain';
    engine.contactPlane.position.y = sceneMode === 'spine' ? -4.2 : -1.95;

    const defaults = getDefaultCameraForScene(sceneMode);
    engine.flyTo(defaults.pos, defaults.target);
  }, [sceneMode]);

  // Sync Spine layer toggles
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    if (engine.spineGlbGroup) {
      engine.spineGlbGroup.visible = spineLayers.vertebrae;
      engine.spineHandle.vertebraeGroup.visible = false;
    } else {
      engine.spineHandle.vertebraeGroup.visible = spineLayers.vertebrae;
    }
    engine.spineHandle.discsGroup.visible = spineLayers.discs;
    engine.spineHandle.musclesGroup.visible = spineLayers.muscles;
    engine.requestRender();
  }, [spineLayers]);

  // Sync Brain layer toggles
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    if (engine.brainGlbGroup) {
      engine.brainGlbGroup.visible = brainLayers.hemispheres;
      engine.brainHandle.hemispheresGroup.visible = false;
    } else {
      engine.brainHandle.hemispheresGroup.visible = brainLayers.hemispheres;
    }
    engine.brainHandle.vesselsGroup.visible = brainLayers.vessels;
    engine.brainHandle.markersGroup.visible = brainLayers.markers;
    engine.requestRender();
  }, [brainLayers]);

  // Highlight & smoothly glide camera to selected Spine segment
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.spineHandle.setHighlightedSegment(selectedSegmentId);
    if (sceneMode === 'spine') {
      const targetPos = engine.spineHandle.segmentPositions.get(selectedSegmentId);
      if (targetPos) {
        const isLumbar = selectedSegmentId.startsWith('L');
        const isCervical = selectedSegmentId.startsWith('C');
        const offsetX = selectedSegmentId === 'L4-L5' ? 1.85 : -2.15;
        const offsetZ = isLumbar ? 3.25 : isCervical ? 2.65 : 3.05;
        const camGoal = new THREE.Vector3(
          targetPos.x + offsetX,
          targetPos.y + 0.35,
          targetPos.z + offsetZ,
        );
        engine.flyTo(camGoal, targetPos);
      } else {
        engine.requestRender();
      }
    }
  }, [selectedSegmentId, focusTriggerNonce, sceneMode]);

  // Highlight & smoothly glide camera to selected Brain MRI finding
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.brainHandle.setHighlightedFinding(selectedBrainId);
    if (sceneMode === 'brain') {
      const landmark = BRAIN_MRI_LANDMARKS.find((lm) => lm.id === selectedBrainId);
      if (landmark) {
        const target = new THREE.Vector3(...landmark.position);
        const camGoal = new THREE.Vector3(
          target.x + landmark.cameraOffset[0],
          target.y + landmark.cameraOffset[1],
          target.z + landmark.cameraOffset[2],
        );
        engine.flyTo(camGoal, target);
      } else {
        engine.requestRender();
      }
    }
  }, [selectedBrainId, sceneMode]);

  // Handle explicit camera preset buttons (Front / Side / Back / Reset)
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine || !cameraPresetRequest) return;
    const { pos, target } = getPresetCameraForScene(sceneMode, cameraPresetRequest.preset);
    engine.flyTo(pos, target);
  }, [cameraPresetRequest, sceneMode]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full overflow-hidden rounded-xl"
      aria-label="Interactive 3D Anatomy Viewport"
    />
  );
};
