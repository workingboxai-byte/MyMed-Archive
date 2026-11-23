import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { AtlasCameraPreset, AtlasSceneMode } from '../types/medical';
import { ThemeMode } from '../context/MedicalArchiveContext';
import { BRAIN_MRI_LANDMARKS } from '../data/brainFindingsData';
import { buildProceduralSpineScene, SpineSceneHandle } from '../three/spineAnatomyBuilder';
import { buildProceduralBrainScene, BrainSceneHandle } from '../three/brainAnatomyBuilder';
import {
  buildGlbBrainMarkers,
  buildGlbSpineMarkers,
  computeCameraDistanceForBox,
  disposeObject3D,
  GlbBrainMarkersHandle,
  GlbSpineMarkersHandle,
  LoadedGlbResult,
  tryLoadOptionalGlb,
} from '../three/optionalGlbLoader';

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

/**
 * Applies layer visibility toggles to a loaded spine.glb without ever re-showing
 * any procedural geometry. If meshes inside the GLB have semantic names
 * (muscle/trapezius/disc), they respond selectively; otherwise vertebrae toggles the GLB.
 */
function applySpineGlbLayerVisibility(
  glbGroup: THREE.Group,
  markersGroup: THREE.Group,
  layers: SpineLayersState,
): void {
  let hasNamedMuscles = false;
  let hasNamedDiscs = false;

  glbGroup.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;
    const name = `${mesh.name} ${mesh.parent?.name || ''}`.toLowerCase();
    if (/muscle|trapez|levator|erector|latiss|rhomb|myo/.test(name)) {
      hasNamedMuscles = true;
    } else if (/disc|disk|intervert|cartil/.test(name)) {
      hasNamedDiscs = true;
    }
  });

  glbGroup.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;
    const name = `${mesh.name} ${mesh.parent?.name || ''}`.toLowerCase();
    if (hasNamedMuscles && /muscle|trapez|levator|erector|latiss|rhomb|myo/.test(name)) {
      mesh.visible = layers.muscles;
    } else if (hasNamedDiscs && /disc|disk|intervert|cartil/.test(name)) {
      mesh.visible = layers.discs;
    } else {
      mesh.visible = layers.vertebrae;
    }
  });

  // Clinical segment markers follow the Discs toggle
  markersGroup.visible = layers.discs;
}

/**
 * Applies layer visibility toggles to a loaded brain_vessels.glb without ever
 * re-showing any procedural geometry.
 */
function applyBrainGlbLayerVisibility(
  glbGroup: THREE.Group,
  markersGroup: THREE.Group,
  layers: BrainLayersState,
): void {
  let hasNamedVessels = false;

  glbGroup.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;
    const name = `${mesh.name} ${mesh.parent?.name || ''}`.toLowerCase();
    if (/vessel|arter|vein|vascular|willis|carotid|basilar|vertebr|nerve|optic/.test(name)) {
      hasNamedVessels = true;
    }
  });

  glbGroup.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;
    const name = `${mesh.name} ${mesh.parent?.name || ''}`.toLowerCase();
    if (
      hasNamedVessels &&
      /vessel|arter|vein|vascular|willis|carotid|basilar|vertebr|nerve|optic/.test(name)
    ) {
      mesh.visible = layers.vessels;
    } else {
      mesh.visible = layers.hemispheres;
    }
  });

  markersGroup.visible = layers.markers;
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

  const selectedSegmentRef = useRef<string>(selectedSegmentId);
  selectedSegmentRef.current = selectedSegmentId;

  const selectedBrainRef = useRef<string>(selectedBrainId);
  selectedBrainRef.current = selectedBrainId;

  const spineLayersRef = useRef<SpineLayersState>(spineLayers);
  spineLayersRef.current = spineLayers;

  const brainLayersRef = useRef<BrainLayersState>(brainLayers);
  brainLayersRef.current = brainLayers;

  const lastFocusedNonceRef = useRef<number>(0);

  // Imperative Three.js controller handle
  const engineRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    controls: OrbitControls;
    spineContainer: THREE.Group;
    brainContainer: THREE.Group;
    spineProcedural: SpineSceneHandle | null;
    brainProcedural: BrainSceneHandle | null;
    spineGlb: LoadedGlbResult | null;
    spineGlbMarkers: GlbSpineMarkersHandle | null;
    brainGlb: LoadedGlbResult | null;
    brainGlbMarkers: GlbBrainMarkersHandle | null;
    contactPlane: THREE.Mesh;
    hemiLight: THREE.HemisphereLight;
    requestRender: () => void;
    flyTo: (pos: THREE.Vector3, target: THREE.Vector3) => void;
    frameActiveModel: (mode: AtlasSceneMode, preset: AtlasCameraPreset, instant?: boolean) => void;
    focusSpineSegment: (segmentId: string) => void;
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
    scene.fog = new THREE.Fog(initialBg, 16, 42);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 120);

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
    const hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x334155, 0.9);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff7ed, 1.85);
    keyLight.position.set(5.5, 8.5, 6.5);
    if (!isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.camera.near = 1;
      keyLight.shadow.camera.far = 28;
      keyLight.shadow.camera.left = -6;
      keyLight.shadow.camera.right = 6;
      keyLight.shadow.camera.top = 6;
      keyLight.shadow.camera.bottom = -6;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x7dd3fc, 0.9);
    rimLight.position.set(-6, 3.5, -6.5);
    scene.add(rimLight);

    const contactPlane = createContactShadowPlane();
    scene.add(contactPlane);

    // Separate top-level containers for Spine and Brain scenes
    const spineContainer = new THREE.Group();
    spineContainer.name = 'Spine_Scene_Container';
    const brainContainer = new THREE.Group();
    brainContainer.name = 'Brain_Scene_Container';
    scene.add(spineContainer);
    scene.add(brainContainer);

    // Build fallback procedural models immediately (zero blank flash while checking GLBs)
    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const spineProcedural = buildProceduralSpineScene(maxAniso);
    const brainProcedural = buildProceduralBrainScene(maxAniso);
    spineContainer.add(spineProcedural.root);
    brainContainer.add(brainProcedural.root);

    spineContainer.visible = sceneMode === 'spine';
    brainContainer.visible = sceneMode === 'brain';

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.075;
    controls.minDistance = 1.2;
    controls.maxDistance = 24.0;
    controls.enablePan = true;

    // Smooth camera transition state
    let transitionActive = false;
    const goalPos = new THREE.Vector3(0, 0, 10);
    const goalTarget = new THREE.Vector3(0, 0, 0);
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

    const engineObj: NonNullable<typeof engineRef.current> = {
      scene,
      camera,
      controls,
      spineContainer,
      brainContainer,
      spineProcedural,
      brainProcedural,
      spineGlb: null,
      spineGlbMarkers: null,
      brainGlb: null,
      brainGlbMarkers: null,
      contactPlane,
      hemiLight,
      requestRender,
      flyTo,
      frameActiveModel: () => {},
      focusSpineSegment: () => {},
    };

    const getActiveBoundingBox = (mode: AtlasSceneMode): THREE.Box3 => {
      if (mode === 'spine') {
        if (engineObj.spineGlb) return engineObj.spineGlb.box;
        if (engineObj.spineProcedural) {
          return new THREE.Box3().setFromObject(engineObj.spineProcedural.root);
        }
      } else {
        if (engineObj.brainGlb) return engineObj.brainGlb.box;
        if (engineObj.brainProcedural) {
          return new THREE.Box3().setFromObject(engineObj.brainProcedural.root);
        }
      }
      return new THREE.Box3(new THREE.Vector3(-1, -2, -1), new THREE.Vector3(1, 2, 1));
    };

    const frameActiveModel = (
      mode: AtlasSceneMode,
      preset: AtlasCameraPreset,
      instant = false,
    ) => {
      const box = getActiveBoundingBox(mode);
      const center = new THREE.Vector3();
      const size = new THREE.Vector3();
      box.getCenter(center);
      box.getSize(size);

      // Ground contact plane neatly below active Box3
      contactPlane.position.y = box.min.y - Math.max(size.y * 0.04, 0.14);

      const axis = preset === 'reset' ? 'threeQuarter' : preset;
      // Fit model to ~75% of viewport height and completely within frame
      const dist = computeCameraDistanceForBox(box, camera, 0.75, axis);
      const pos = new THREE.Vector3();

      if (preset === 'front') {
        pos.set(center.x, center.y + size.y * 0.02, center.z + dist);
      } else if (preset === 'side') {
        pos.set(center.x - dist, center.y + size.y * 0.02, center.z);
      } else if (preset === 'back') {
        pos.set(center.x, center.y + size.y * 0.02, center.z - dist);
      } else {
        // Default ergonomic three-quarter clinical angle
        const az = mode === 'spine' ? -0.46 : -0.58;
        const elev = mode === 'spine' ? 0.06 : 0.18;
        pos.set(
          center.x + Math.sin(az) * Math.cos(elev) * dist,
          center.y + Math.sin(elev) * dist,
          center.z + Math.cos(az) * Math.cos(elev) * dist,
        );
      }

      if (instant) {
        transitionActive = false;
        camera.position.copy(pos);
        controls.target.copy(center);
        goalPos.copy(pos);
        goalTarget.copy(center);
        controls.update();
        requestRender();
      } else {
        flyTo(pos, center);
      }
    };

    const focusSpineSegment = (segmentId: string) => {
      const targetPos =
        engineObj.spineGlbMarkers?.segmentPositions.get(segmentId) ??
        engineObj.spineProcedural?.segmentPositions.get(segmentId);
      if (!targetPos) return;

      const modelHeight = engineObj.spineGlb ? engineObj.spineGlb.size.y : 6.5;
      const zoomDist = Math.max(modelHeight * 0.44, 2.5);
      const sideSign = segmentId === 'L4-L5' ? 0.55 : -0.62;
      const camGoal = new THREE.Vector3(
        targetPos.x + zoomDist * sideSign,
        targetPos.y + modelHeight * 0.05,
        targetPos.z + zoomDist * 0.85,
      );
      flyTo(camGoal, targetPos);
    };

    engineObj.frameActiveModel = frameActiveModel;
    engineObj.focusSpineSegment = focusSpineSegment;
    engineRef.current = engineObj;

    // Set initial camera to frame the active scene cleanly at ~75% height
    frameActiveModel(sceneMode, 'reset', true);

    const onControlsStart = () => {
      transitionActive = false;
    };
    const onControlsChange = () => {
      requestRender();
    };
    controls.addEventListener('start', onControlsStart);
    controls.addEventListener('change', onControlsChange);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Raycasting: click to select active disc/pin or brain marker (ignore drag gestures)
    let downX = 0;
    let downY = 0;
    let lastHoverTime = 0;

    const getActiveClickables = (): THREE.Object3D[] => {
      if (sceneModeRef.current === 'spine') {
        if (engineObj.spineGlbMarkers) return engineObj.spineGlbMarkers.clickables;
        return engineObj.spineProcedural ? engineObj.spineProcedural.clickables : [];
      }
      if (engineObj.brainGlbMarkers) return engineObj.brainGlbMarkers.clickables;
      return engineObj.brainProcedural ? engineObj.brainProcedural.clickables : [];
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

    // Hybrid optional GLB loading:
    // Checks ./models/spine.glb & ./models/brain_vessels.glb via GLTFLoader + DRACOLoader.
    // Whenever a GLB succeeds, COMPLETELY removes & disposes the procedural fallback model
    // so there is zero overlap, centers & scales it to ~75% height, and anchors markers to its Box3.
    const abortController = new AbortController();
    void (async () => {
      const [spineGlbResult, brainGlbResult] = await Promise.all([
        tryLoadOptionalGlb('./models/spine.glb', 6.4, abortController.signal),
        tryLoadOptionalGlb('./models/brain_vessels.glb', 3.4, abortController.signal),
      ]);

      if (disposed) {
        if (spineGlbResult) disposeObject3D(spineGlbResult.group);
        if (brainGlbResult) disposeObject3D(brainGlbResult.group);
        return;
      }

      if (spineGlbResult) {
        // 1. Completely remove and dispose ALL procedural spine geometry (vertebrae, discs, muscles)
        if (engineObj.spineProcedural) {
          engineObj.spineProcedural.root.visible = false;
          spineContainer.remove(engineObj.spineProcedural.root);
          engineObj.spineProcedural.dispose();
          engineObj.spineProcedural = null;
        }

        // 2. Mount centered & scaled GLB + Box3-anchored clinical markers
        spineGlbResult.group.name = 'Loaded_Spine_GLB';
        const glbMarkers = buildGlbSpineMarkers(spineGlbResult.group, spineGlbResult.box);
        glbMarkers.setHighlightedSegment(selectedSegmentRef.current);
        applySpineGlbLayerVisibility(
          spineGlbResult.group,
          glbMarkers.group,
          spineLayersRef.current,
        );

        spineContainer.add(spineGlbResult.group);
        spineContainer.add(glbMarkers.group);
        engineObj.spineGlb = spineGlbResult;
        engineObj.spineGlbMarkers = glbMarkers;

        callbacksRef.current.onModelSourceChange('spine', 'glb');

        // 3. Auto-frame centered GLB to ~75% viewport height (or focus jumped segment)
        if (sceneModeRef.current === 'spine') {
          const box = spineGlbResult.box;
          contactPlane.position.y = box.min.y - Math.max(spineGlbResult.size.y * 0.04, 0.14);
          if (lastFocusedNonceRef.current > 0) {
            focusSpineSegment(selectedSegmentRef.current);
          } else {
            frameActiveModel('spine', 'reset', false);
          }
        } else {
          requestRender();
        }
      } else {
        callbacksRef.current.onModelSourceChange('spine', 'procedural');
      }

      if (brainGlbResult) {
        // 1. Completely remove and dispose ALL procedural brain geometry (hemispheres, vessels, markers)
        if (engineObj.brainProcedural) {
          engineObj.brainProcedural.root.visible = false;
          brainContainer.remove(engineObj.brainProcedural.root);
          engineObj.brainProcedural.dispose();
          engineObj.brainProcedural = null;
        }

        // 2. Mount centered & scaled GLB + Box3-anchored brain MRI markers
        brainGlbResult.group.name = 'Loaded_Brain_GLB';
        const glbMarkers = buildGlbBrainMarkers(brainGlbResult.box);
        glbMarkers.setHighlightedFinding(selectedBrainRef.current);
        applyBrainGlbLayerVisibility(
          brainGlbResult.group,
          glbMarkers.group,
          brainLayersRef.current,
        );

        brainContainer.add(brainGlbResult.group);
        brainContainer.add(glbMarkers.group);
        engineObj.brainGlb = brainGlbResult;
        engineObj.brainGlbMarkers = glbMarkers;

        callbacksRef.current.onModelSourceChange('brain', 'glb');

        // 3. Auto-frame centered GLB to ~75% viewport height when active
        if (sceneModeRef.current === 'brain') {
          frameActiveModel('brain', 'reset', false);
        } else {
          requestRender();
        }
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

      if (engineObj.spineProcedural) engineObj.spineProcedural.dispose();
      if (engineObj.brainProcedural) engineObj.brainProcedural.dispose();
      if (engineObj.spineGlb) disposeObject3D(engineObj.spineGlb.group);
      if (engineObj.spineGlbMarkers) engineObj.spineGlbMarkers.dispose();
      if (engineObj.brainGlb) disposeObject3D(engineObj.brainGlb.group);
      if (engineObj.brainGlbMarkers) engineObj.brainGlbMarkers.dispose();
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
    engine.scene.fog = new THREE.Fog(bgHex, 16, 42);
    engine.hemiLight.intensity = theme === 'dark' ? 0.75 : 0.95;
    (engine.contactPlane.material as THREE.MeshBasicMaterial).opacity =
      theme === 'dark' ? 0.45 : 0.68;
    engine.requestRender();
  }, [theme]);

  // Sync active scene visibility (Spine vs Brain) & frame cleanly at ~75% height
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.spineContainer.visible = sceneMode === 'spine';
    engine.brainContainer.visible = sceneMode === 'brain';
    engine.frameActiveModel(sceneMode, 'reset', false);
  }, [sceneMode]);

  // Sync Spine layer toggles (strictly respects GLB vs Procedural mode — never revives hidden procedural)
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    if (engine.spineGlb && engine.spineGlbMarkers) {
      applySpineGlbLayerVisibility(engine.spineGlb.group, engine.spineGlbMarkers.group, spineLayers);
    } else if (engine.spineProcedural) {
      engine.spineProcedural.vertebraeGroup.visible = spineLayers.vertebrae;
      engine.spineProcedural.discsGroup.visible = spineLayers.discs;
      engine.spineProcedural.musclesGroup.visible = spineLayers.muscles;
    }
    engine.requestRender();
  }, [spineLayers]);

  // Sync Brain layer toggles (strictly respects GLB vs Procedural mode)
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    if (engine.brainGlb && engine.brainGlbMarkers) {
      applyBrainGlbLayerVisibility(engine.brainGlb.group, engine.brainGlbMarkers.group, brainLayers);
    } else if (engine.brainProcedural) {
      engine.brainProcedural.hemispheresGroup.visible = brainLayers.hemispheres;
      engine.brainProcedural.vesselsGroup.visible = brainLayers.vessels;
      engine.brainProcedural.markersGroup.visible = brainLayers.markers;
    }
    engine.requestRender();
  }, [brainLayers]);

  // Highlight & smoothly glide camera to selected Spine segment (only zoom when user explicitly selects/jumps)
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;

    if (engine.spineGlbMarkers) {
      engine.spineGlbMarkers.setHighlightedSegment(selectedSegmentId);
    } else if (engine.spineProcedural) {
      engine.spineProcedural.setHighlightedSegment(selectedSegmentId);
    }

    const shouldZoom = focusTriggerNonce !== lastFocusedNonceRef.current;
    lastFocusedNonceRef.current = focusTriggerNonce;

    if (sceneMode === 'spine' && shouldZoom) {
      engine.focusSpineSegment(selectedSegmentId);
      return;
    }

    engine.requestRender();
  }, [selectedSegmentId, focusTriggerNonce, sceneMode]);

  // Highlight & smoothly glide camera to selected Brain MRI finding
  const lastBrainFocusRef = useRef<number>(0);
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;

    if (engine.brainGlbMarkers) {
      engine.brainGlbMarkers.setHighlightedFinding(selectedBrainId);
    } else if (engine.brainProcedural) {
      engine.brainProcedural.setHighlightedFinding(selectedBrainId);
    }

    const shouldZoom = focusTriggerNonce !== lastBrainFocusRef.current;
    lastBrainFocusRef.current = focusTriggerNonce;

    if (sceneMode === 'brain' && shouldZoom) {
      const targetPos =
        engine.brainGlbMarkers?.markerPositions.get(selectedBrainId) ??
        engine.brainProcedural?.markerPositions.get(selectedBrainId);
      const landmark = BRAIN_MRI_LANDMARKS.find((lm) => lm.id === selectedBrainId);

      if (targetPos && landmark) {
        const scaleFactor = engine.brainGlb
          ? Math.max(engine.brainGlb.size.x, engine.brainGlb.size.y, engine.brainGlb.size.z) / 3.4
          : 1.0;
        const camGoal = new THREE.Vector3(
          targetPos.x + landmark.cameraOffset[0] * scaleFactor,
          targetPos.y + landmark.cameraOffset[1] * scaleFactor,
          targetPos.z + landmark.cameraOffset[2] * scaleFactor,
        );
        engine.flyTo(camGoal, targetPos);
        return;
      }
    }

    engine.requestRender();
  }, [selectedBrainId, focusTriggerNonce, sceneMode]);

  // Handle explicit camera preset buttons (Front / Side / Back / Reset)
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine || !cameraPresetRequest) return;
    engine.frameActiveModel(sceneMode, cameraPresetRequest.preset, false);
  }, [cameraPresetRequest, sceneMode]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full overflow-hidden rounded-xl"
      aria-label="Interactive 3D Anatomy Viewport"
    />
  );
};
