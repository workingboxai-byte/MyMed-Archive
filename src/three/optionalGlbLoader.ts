import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { DETAILED_SPINE_SEGMENTS } from '../data/spineSegmentsData';
import { BRAIN_MRI_LANDMARKS } from '../data/brainFindingsData';
import { SegmentStatus } from '../types/medical';

const DRACO_DECODER_URL = 'https://www.gstatic.com/draco/versioned/decoders/1.5.7/';

export interface LoadedGlbResult {
  group: THREE.Group;
  box: THREE.Box3;
  size: THREE.Vector3;
}

export interface GlbSpineMarkersHandle {
  group: THREE.Group;
  segmentPositions: Map<string, THREE.Vector3>;
  clickables: THREE.Object3D[];
  setHighlightedSegment: (segmentId: string) => void;
  dispose: () => void;
}

export interface GlbBrainMarkersHandle {
  group: THREE.Group;
  markerPositions: Map<string, THREE.Vector3>;
  clickables: THREE.Object3D[];
  setHighlightedFinding: (findingId: string) => void;
  dispose: () => void;
}

function statusHex(status: SegmentStatus): number {
  if (status === 'negative') return 0xe11d48;
  if (status === 'new') return 0xd97706;
  return 0x10b981;
}

/**
 * Checks if an optional .glb file actually exists at the given relative URL
 * and contains valid binary glTF magic bytes ("glTF" = 0x67 0x6C 0x54 0x46).
 * After loading, computes THREE.Box3(), centers the model at (0, 0, 0), and
 * scales it cleanly to the target world height.
 */
export async function tryLoadOptionalGlb(
  url: string,
  targetHeight: number,
  signal?: AbortSignal,
): Promise<LoadedGlbResult | null> {
  try {
    const response = await fetch(url, { signal, cache: 'no-cache' });
    if (!response.ok) return null;

    const contentType = (response.headers.get('content-type') || '').toLowerCase();
    if (contentType.includes('text/html')) {
      return null;
    }

    const buffer = await response.arrayBuffer();
    if (buffer.byteLength < 12) return null;

    // Verify binary GLB magic header: 'g', 'l', 'T', 'F'
    const header = new Uint8Array(buffer, 0, 4);
    const isBinaryGlb =
      header[0] === 0x67 &&
      header[1] === 0x6c &&
      header[2] === 0x54 &&
      header[3] === 0x46;

    if (!isBinaryGlb) {
      return null;
    }

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(DRACO_DECODER_URL);

    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);

    const gltf = await new Promise<{ scene: THREE.Group }>((resolve, reject) => {
      gltfLoader.parse(
        buffer,
        '',
        (parsed) => resolve(parsed),
        (err) => reject(err),
      );
    });

    dracoLoader.dispose();

    const model = gltf.scene;
    model.updateMatrixWorld(true);

    // 1. Measure raw bounding box
    const rawBox = new THREE.Box3().setFromObject(model);
    if (rawBox.isEmpty()) return null;

    const rawSize = new THREE.Vector3();
    const rawCenter = new THREE.Vector3();
    rawBox.getSize(rawSize);
    rawBox.getCenter(rawCenter);

    // 2. Scale uniformly to target world height (guard against degenerate flat meshes)
    const refHeight = rawSize.y > 0.0001 ? rawSize.y : Math.max(rawSize.x, rawSize.y, rawSize.z, 1);
    const scale = targetHeight / refHeight;

    // 3. Place inside wrapper, apply uniform scale, and center exact Box3 at (0, 0, 0)
    const wrapper = new THREE.Group();
    model.scale.setScalar(scale);
    model.position.set(-rawCenter.x * scale, -rawCenter.y * scale, -rawCenter.z * scale);

    model.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });

    wrapper.add(model);
    wrapper.updateMatrixWorld(true);

    // 4. Recompute exact post-transform Box3 and verify center == (0, 0, 0)
    const fittedBox = new THREE.Box3().setFromObject(wrapper);
    const postCenter = new THREE.Vector3();
    fittedBox.getCenter(postCenter);
    if (postCenter.lengthSq() > 1e-6) {
      model.position.sub(postCenter);
      wrapper.updateMatrixWorld(true);
      fittedBox.setFromObject(wrapper);
    }

    const fittedSize = new THREE.Vector3();
    fittedBox.getSize(fittedSize);

    return {
      group: wrapper,
      box: fittedBox,
      size: fittedSize,
    };
  } catch {
    // Gracefully fall back to procedural 3D anatomy without console errors
    return null;
  }
}

/**
 * Computes the perspective camera distance from origin so that the given Box3
 * occupies ~fillRatio (default 0.75 = 75%) of the viewport height and also
 * fits completely horizontally without clipping.
 */
export function computeCameraDistanceForBox(
  box: THREE.Box3,
  camera: THREE.PerspectiveCamera,
  fillRatio = 0.75,
  viewAxis: 'front' | 'side' | 'back' | 'threeQuarter' = 'threeQuarter',
): number {
  const size = new THREE.Vector3();
  box.getSize(size);

  const fovRad = THREE.MathUtils.degToRad(camera.fov);
  const tanHalfFov = Math.tan(fovRad / 2);
  const aspect = Math.max(camera.aspect, 0.5);

  const horizontalSpan =
    viewAxis === 'side'
      ? size.z
      : viewAxis === 'threeQuarter'
      ? Math.hypot(size.x, size.z) * 0.82
      : size.x;

  const depthSpan =
    viewAxis === 'side'
      ? size.x
      : viewAxis === 'threeQuarter'
      ? Math.max(size.x, size.z)
      : size.z;

  const distForHeight = size.y / fillRatio / (2 * tanHalfFov);
  const distForWidth = horizontalSpan / (fillRatio * 1.05) / (2 * tanHalfFov * aspect);

  return Math.max(distForHeight, distForWidth) + depthSpan * 0.55;
}

/**
 * Samples world-space vertices of a loaded spine GLB inside a thin horizontal
 * band around targetY to find the true local centerline (X, Z) and radial width
 * of the real anatomical mesh at that height.
 */
function sampleGlbHorizontalSlice(
  glbGroup: THREE.Object3D,
  targetY: number,
  halfBand: number,
  fallbackCenter: THREE.Vector3,
  fallbackRadius: number,
): { centerX: number; centerZ: number; maxZ: number; minZ: number; radius: number } {
  let minX = Infinity;
  let maxX = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;
  let sumX = 0;
  let sumZ = 0;
  let count = 0;

  const v = new THREE.Vector3();
  glbGroup.updateMatrixWorld(true);

  glbGroup.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh || !mesh.geometry) return;
    const posAttr = mesh.geometry.attributes.position;
    if (!posAttr) return;

    // Stride sampling for very high-poly anatomical GLBs to stay instantaneous
    const stride = posAttr.count > 12000 ? Math.ceil(posAttr.count / 6000) : 1;
    for (let i = 0; i < posAttr.count; i += stride) {
      v.fromBufferAttribute(posAttr, i).applyMatrix4(mesh.matrixWorld);
      if (Math.abs(v.y - targetY) <= halfBand) {
        sumX += v.x;
        sumZ += v.z;
        if (v.x < minX) minX = v.x;
        if (v.x > maxX) maxX = v.x;
        if (v.z < minZ) minZ = v.z;
        if (v.z > maxZ) maxZ = v.z;
        count += 1;
      }
    }
  });

  if (count === 0) {
    return {
      centerX: fallbackCenter.x,
      centerZ: fallbackCenter.z,
      maxZ: fallbackCenter.z + fallbackRadius,
      minZ: fallbackCenter.z - fallbackRadius,
      radius: fallbackRadius,
    };
  }

  const centerX = sumX / count;
  const centerZ = sumZ / count;
  const halfW = (maxX - minX) * 0.5;
  const halfD = (maxZ - minZ) * 0.5;
  const radius = Math.max(halfW, halfD, fallbackRadius * 0.45);

  return { centerX, centerZ, maxZ, minZ, radius };
}

/**
 * Anatomical vertical fractions along a spine Box3 (0 = top edge, 1 = bottom edge)
 * mapping all 16 clinical segments from C2-C3 down to L5-S1 accurately along the real model.
 */
const SPINE_SEGMENT_VERTICAL_FRACTIONS: Record<string, number> = {
  'C2-C3': 0.06,
  'C3-C4': 0.105,
  'C4-C5': 0.15,
  'C5-C6': 0.195,
  'C6-C7': 0.24,
  'C7-D1': 0.285,
  'D1-D2': 0.335,
  'D2-D3': 0.385,
  'D3-D4': 0.435,
  'D4-D5': 0.485,
  'D6-D9': 0.57,
  'D10-D12': 0.675,
  'L1-L3': 0.755,
  'L3-L4': 0.815,
  'L4-L5': 0.868,
  'L5-S1': 0.918,
};

/**
 * Builds clean interactive 3D clinical markers anchored directly to the real
 * loaded spine.glb Box3 & local mesh slices (zero procedural spine geometry!).
 */
export function buildGlbSpineMarkers(
  glbGroup: THREE.Group,
  box: THREE.Box3,
): GlbSpineMarkersHandle {
  const group = new THREE.Group();
  group.name = 'GLB_Spine_Clinical_Markers';

  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);

  const height = Math.max(size.y, 1);
  const fallbackRadius = Math.max(Math.min(size.x, size.z) * 0.36, height * 0.055);
  const pinRadius = Math.max(height * 0.0155, 0.07);
  const halfBand = height * 0.032;

  const segmentPositions = new Map<string, THREE.Vector3>();
  const segmentRadii = new Map<string, number>();
  const clickables: THREE.Object3D[] = [];
  const pinHandles: {
    id: string;
    status: SegmentStatus;
    pinGroup: THREE.Group;
    coreMat: THREE.MeshStandardMaterial;
    haloMat: THREE.MeshStandardMaterial;
  }[] = [];

  DETAILED_SPINE_SEGMENTS.forEach((seg, idx) => {
    const frac =
      SPINE_SEGMENT_VERTICAL_FRACTIONS[seg.id] ??
      THREE.MathUtils.lerp(0.08, 0.92, idx / Math.max(DETAILED_SPINE_SEGMENTS.length - 1, 1));

    const y = THREE.MathUtils.lerp(box.max.y, box.min.y, frac);
    const slice = sampleGlbHorizontalSlice(glbGroup, y, halfBand, center, fallbackRadius);

    // Center focus point sits directly inside the real spine segment at height y
    const focusPos = new THREE.Vector3(slice.centerX, y, slice.centerZ);
    segmentPositions.set(seg.id, focusPos);
    segmentRadii.set(seg.id, slice.radius);

    // Place a crisp clickable clinical beacon slightly proud of the anterior/right contour
    // so it stays unmistakably readable without burying inside dense bone meshes
    const beaconX = slice.centerX;
    const beaconZ = slice.maxZ + pinRadius * 1.15;

    const pinGroup = new THREE.Group();
    pinGroup.position.set(beaconX, y, beaconZ);

    const colorHex = statusHex(seg.status);
    const coreMat = new THREE.MeshStandardMaterial({
      color: colorHex,
      emissive: colorHex,
      emissiveIntensity: 0.45,
      roughness: 0.25,
      metalness: 0.15,
    });
    const coreMesh = new THREE.Mesh(new THREE.SphereGeometry(pinRadius, 16, 12), coreMat);
    coreMesh.userData.segmentId = seg.id;
    coreMesh.renderOrder = 6;
    pinGroup.add(coreMesh);
    clickables.push(coreMesh);

    const haloMat = new THREE.MeshStandardMaterial({
      color: colorHex,
      emissive: colorHex,
      emissiveIntensity: 0.55,
      roughness: 0.2,
      transparent: true,
      opacity: 0.72,
    });
    const haloMesh = new THREE.Mesh(
      new THREE.TorusGeometry(pinRadius * 1.65, pinRadius * 0.2, 8, 24),
      haloMat,
    );
    haloMesh.userData.segmentId = seg.id;
    haloMesh.renderOrder = 6;
    pinGroup.add(haloMesh);
    clickables.push(haloMesh);

    // Invisible generous hit-target sphere for easy selection on pointer/touch
    const hitMesh = new THREE.Mesh(
      new THREE.SphereGeometry(pinRadius * 2.6, 10, 8),
      new THREE.MeshBasicMaterial({ visible: false }),
    );
    hitMesh.userData.segmentId = seg.id;
    pinGroup.add(hitMesh);
    clickables.push(hitMesh);

    group.add(pinGroup);
    pinHandles.push({
      id: seg.id,
      status: seg.status,
      pinGroup,
      coreMat,
      haloMat,
    });
  });

  // Precision anatomical level ring encircling the active segment on the GLB spine
  const selectionRingMat = new THREE.MeshStandardMaterial({
    color: 0xe11d48,
    emissive: 0xe11d48,
    emissiveIntensity: 0.85,
    roughness: 0.2,
    metalness: 0.3,
    transparent: true,
    opacity: 0.88,
  });
  const selectionRing = new THREE.Mesh(
    new THREE.TorusGeometry(1, Math.max(height * 0.0045, 0.022), 12, 48),
    selectionRingMat,
  );
  selectionRing.rotation.x = Math.PI / 2;
  selectionRing.renderOrder = 7;
  group.add(selectionRing);

  const setHighlightedSegment = (segmentId: string) => {
    const pos = segmentPositions.get(segmentId);
    const radius = segmentRadii.get(segmentId) ?? fallbackRadius;
    const segObj = DETAILED_SPINE_SEGMENTS.find((s) => s.id === segmentId);
    const highlightHex = statusHex(segObj?.status ?? 'stable');

    pinHandles.forEach((h) => {
      const isSelected = h.id === segmentId;
      if (isSelected) {
        h.pinGroup.scale.setScalar(1.45);
        h.coreMat.emissiveIntensity = 1.15;
        h.haloMat.opacity = 1.0;
        h.haloMat.emissiveIntensity = 1.05;
      } else {
        h.pinGroup.scale.setScalar(0.92);
        h.coreMat.emissiveIntensity = 0.35;
        h.haloMat.opacity = 0.55;
        h.haloMat.emissiveIntensity = 0.35;
      }
    });

    if (pos) {
      selectionRing.visible = true;
      selectionRing.position.copy(pos);
      const ringRadius = THREE.MathUtils.clamp(radius * 1.16, height * 0.05, height * 0.19);
      selectionRing.scale.set(ringRadius, ringRadius, 1);
      selectionRingMat.color.setHex(highlightHex);
      selectionRingMat.emissive.setHex(highlightHex);
    } else {
      selectionRing.visible = false;
    }
  };

  setHighlightedSegment('L4-L5');

  return {
    group,
    segmentPositions,
    clickables,
    setHighlightedSegment,
    dispose: () => disposeObject3D(group),
  };
}

/**
 * Normalized anatomical Box3 offsets (in fraction of width, height, depth from center)
 * for the 5 key Brain MRI landmarks so markers align directly to any loaded brain_vessels.glb.
 */
const BRAIN_LANDMARK_BOX_OFFSETS: Record<string, [number, number, number]> = {
  pituitary: [0.0, -0.2, 0.12],
  'venous-angioma': [-0.24, 0.16, 0.08],
  'optic-nerves': [0.0, -0.14, 0.34],
  'left-vertebral-artery': [0.09, -0.34, -0.06],
  'vascular-gliosis': [0.2, 0.24, 0.06],
};

/**
 * Builds proportional interactive 3D clinical markers anchored directly to the
 * loaded brain_vessels.glb Box3 (zero procedural brain/vessel geometry!).
 */
export function buildGlbBrainMarkers(box: THREE.Box3): GlbBrainMarkersHandle {
  const group = new THREE.Group();
  group.name = 'GLB_Brain_Clinical_Markers';

  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);

  const minDim = Math.max(Math.min(size.x, size.y, size.z), 0.5);
  const coreRadius = Math.max(minDim * 0.032, 0.06);

  const markerPositions = new Map<string, THREE.Vector3>();
  const clickables: THREE.Object3D[] = [];
  const handles: {
    id: string;
    markerGroup: THREE.Group;
    coreMat: THREE.MeshStandardMaterial;
    ringMat: THREE.MeshStandardMaterial;
  }[] = [];

  BRAIN_MRI_LANDMARKS.forEach((lm) => {
    const [nx, ny, nz] = BRAIN_LANDMARK_BOX_OFFSETS[lm.id] ?? [0, 0, 0];
    const pos = new THREE.Vector3(
      center.x + nx * size.x,
      center.y + ny * size.y,
      center.z + nz * size.z,
    );
    markerPositions.set(lm.id, pos);

    const markerGroup = new THREE.Group();
    markerGroup.position.copy(pos);

    const color = new THREE.Color(lm.colorHex);
    const coreMat = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.55,
      roughness: 0.22,
      metalness: 0.15,
      depthTest: false,
    });
    const core = new THREE.Mesh(new THREE.SphereGeometry(coreRadius, 18, 14), coreMat);
    core.userData.findingId = lm.id;
    core.renderOrder = 10;
    markerGroup.add(core);
    clickables.push(core);

    const ringMat = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      transparent: true,
      opacity: 0.85,
      depthTest: false,
    });
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(coreRadius * 1.75, coreRadius * 0.2, 10, 32),
      ringMat,
    );
    ring.rotation.x = Math.PI * 0.35;
    ring.userData.findingId = lm.id;
    ring.renderOrder = 10;
    markerGroup.add(ring);
    clickables.push(ring);

    const hitSphere = new THREE.Mesh(
      new THREE.SphereGeometry(coreRadius * 2.8, 10, 8),
      new THREE.MeshBasicMaterial({ visible: false }),
    );
    hitSphere.userData.findingId = lm.id;
    markerGroup.add(hitSphere);
    clickables.push(hitSphere);

    group.add(markerGroup);
    handles.push({
      id: lm.id,
      markerGroup,
      coreMat,
      ringMat,
    });
  });

  const setHighlightedFinding = (findingId: string) => {
    handles.forEach((h) => {
      const isSelected = h.id === findingId;
      if (isSelected) {
        h.markerGroup.scale.setScalar(1.38);
        h.coreMat.emissiveIntensity = 1.15;
        h.ringMat.opacity = 1.0;
        h.ringMat.emissiveIntensity = 1.05;
      } else {
        h.markerGroup.scale.setScalar(0.92);
        h.coreMat.emissiveIntensity = 0.4;
        h.ringMat.opacity = 0.58;
        h.ringMat.emissiveIntensity = 0.4;
      }
    });
  };

  setHighlightedFinding(BRAIN_MRI_LANDMARKS[0].id);

  return {
    group,
    markerPositions,
    clickables,
    setHighlightedFinding,
    dispose: () => disposeObject3D(group),
  };
}

export function disposeObject3D(root: THREE.Object3D): void {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();

  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.geometry) {
      geometries.add(mesh.geometry);
    }
    if (mesh.material) {
      const matList = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      matList.forEach((mat) => {
        materials.add(mat);
        const stdMat = mat as THREE.MeshStandardMaterial;
        if (stdMat.map) textures.add(stdMat.map);
        if (stdMat.normalMap) textures.add(stdMat.normalMap);
        if (stdMat.roughnessMap) textures.add(stdMat.roughnessMap);
        if (stdMat.bumpMap) textures.add(stdMat.bumpMap);
      });
    }
  });

  geometries.forEach((g) => g.dispose());
  textures.forEach((t) => t.dispose());
  materials.forEach((m) => m.dispose());
}
