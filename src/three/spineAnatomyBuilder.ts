import * as THREE from 'three';
import { DETAILED_SPINE_SEGMENTS } from '../data/spineSegmentsData';
import { SegmentStatus } from '../types/medical';
import { disposeObject3D } from './optionalGlbLoader';

export interface SpineSceneHandle {
  root: THREE.Group;
  vertebraeGroup: THREE.Group;
  discsGroup: THREE.Group;
  musclesGroup: THREE.Group;
  selectionRing: THREE.Mesh;
  segmentPositions: Map<string, THREE.Vector3>;
  clickables: THREE.Object3D[];
  setHighlightedSegment: (segmentId: string) => void;
  dispose: () => void;
}

const VERTEBRA_NAMES = [
  'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7',
  'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9', 'D10', 'D11', 'D12',
  'L1', 'L2', 'L3', 'L4', 'L5',
] as const;

// Maps disc index i (between vertebra i and i+1, with index 23 = L5-S1) to DETAILED_SPINE_SEGMENTS id
const DISC_INDEX_TO_SEGMENT: Record<number, string> = {
  1: 'C2-C3',
  2: 'C3-C4',
  3: 'C4-C5',
  4: 'C5-C6',
  5: 'C6-C7',
  6: 'C7-D1',
  7: 'D1-D2',
  8: 'D2-D3',
  9: 'D3-D4',
  10: 'D4-D5',
  12: 'D6-D9',
  13: 'D6-D9',
  14: 'D6-D9',
  16: 'D10-D12',
  17: 'D10-D12',
  19: 'L1-L3',
  20: 'L1-L3',
  21: 'L3-L4',
  22: 'L4-L5',
  23: 'L5-S1',
};

function statusHex(status: SegmentStatus): number {
  if (status === 'negative') return 0xe11d48;
  if (status === 'new') return 0xd97706;
  return 0x10b981;
}

function createBoneTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#ebe3d3';
    ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 900; i++) {
      const x = (i * 73) % 256;
      const y = (i * 137) % 256;
      const w = 2 + (i % 5);
      const h = 1 + (i % 3);
      ctx.fillStyle = i % 2 === 0 ? 'rgba(180, 165, 140, 0.14)' : 'rgba(255, 252, 245, 0.18)';
      ctx.fillRect(x, y, w, h);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function createMuscleFiberTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createLinearGradient(0, 0, 256, 256);
    grad.addColorStop(0, '#be4b5a');
    grad.addColorStop(0.55, '#c95a63');
    grad.addColorStop(1, '#9f3b49');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    // Striated muscle fibers converging laterally
    ctx.lineWidth = 1.6;
    for (let i = -30; i < 290; i += 6) {
      ctx.strokeStyle = i % 12 === 0 ? 'rgba(255, 224, 226, 0.28)' : 'rgba(95, 20, 34, 0.22)';
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.quadraticCurveTo(128, i * 0.72 + 28, 256, i * 0.55 + 64);
      ctx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}

/**
 * Computes anatomical spinal centerline point at normalized progress t in [0, 1]
 * (t = 0 at C1 top, t = 1 at S1 base).
 * Anterior faces +Z, posterior faces -Z, patient RIGHT is -X, patient LEFT is +X.
 */
function getSpineCenterline(t: number): THREE.Vector3 {
  const y = THREE.MathUtils.lerp(3.42, -3.15, t);

  // Anatomical sagittal S-curve:
  // Cervical lordosis (+Z forward around t=0.14), thoracic kyphosis (-Z back around t=0.52),
  // lumbar lordosis (+Z forward around t=0.84), sacral slope back at t=1.0
  const cervical = Math.exp(-Math.pow((t - 0.13) / 0.11, 2)) * 0.24;
  const thoracic = -Math.exp(-Math.pow((t - 0.49) / 0.21, 2)) * 0.52;
  const lumbar = Math.exp(-Math.pow((t - 0.83) / 0.12, 2)) * 0.36;
  const sacral = -Math.exp(-Math.pow((t - 1.02) / 0.08, 2)) * 0.22;
  const z = cervical + thoracic + lumbar + sacral;

  // Mild physiological / SOR S-scoliosis curvature in thoracic-lumbar region
  const x =
    Math.sin((t - 0.28) * Math.PI * 2.15) *
    0.11 *
    THREE.MathUtils.smoothstep(t, 0.18, 0.92);

  return new THREE.Vector3(x, y, z);
}

function createKidneyBodyShape(width: number, depth: number): THREE.Shape {
  const shape = new THREE.Shape();
  const hw = width * 0.5;
  const hd = depth * 0.5;
  // Kidney-bean cross-section (anterior rounded at +Y in 2D shape, posterior concave at -Y)
  shape.moveTo(0, hd);
  shape.bezierCurveTo(hw * 0.85, hd, hw * 1.05, hd * 0.35, hw * 0.98, -hd * 0.25);
  shape.bezierCurveTo(hw * 0.9, -hd * 0.9, hw * 0.38, -hd * 0.95, 0, -hd * 0.68);
  shape.bezierCurveTo(-hw * 0.38, -hd * 0.95, -hw * 0.9, -hd * 0.9, -hw * 0.98, -hd * 0.25);
  shape.bezierCurveTo(-hw * 1.05, hd * 0.35, -hw * 0.85, hd, 0, hd);
  return shape;
}

function buildVertebraGroup(
  index: number,
  boneMat: THREE.MeshPhysicalMaterial,
  accentBoneMat: THREE.MeshPhysicalMaterial,
): THREE.Group {
  const group = new THREE.Group();
  const isCervical = index < 7;
  const isThoracic = index >= 7 && index < 19;

  // Progressive anatomical dimensions from C1 to L5
  const progress = index / 23;
  const bodyW = isCervical
    ? THREE.MathUtils.lerp(0.36, 0.48, index / 6)
    : isThoracic
    ? THREE.MathUtils.lerp(0.49, 0.68, (index - 7) / 11)
    : THREE.MathUtils.lerp(0.72, 0.88, (index - 19) / 4);

  const bodyD = isCervical
    ? THREE.MathUtils.lerp(0.28, 0.36, index / 6)
    : isThoracic
    ? THREE.MathUtils.lerp(0.38, 0.54, (index - 7) / 11)
    : THREE.MathUtils.lerp(0.56, 0.66, (index - 19) / 4);

  const bodyH = isCervical
    ? THREE.MathUtils.lerp(0.11, 0.145, index / 6)
    : isThoracic
    ? THREE.MathUtils.lerp(0.155, 0.21, (index - 7) / 11)
    : THREE.MathUtils.lerp(0.22, 0.265, (index - 19) / 4);

  // 1. Primary Silhouette: Kidney-shaped beveled vertebral body
  const bodyShape = createKidneyBodyShape(bodyW, bodyD);
  const bodyGeo = new THREE.ExtrudeGeometry(bodyShape, {
    depth: bodyH,
    bevelEnabled: true,
    bevelThickness: 0.022,
    bevelSize: 0.018,
    bevelSegments: 2,
    curveSegments: 14,
  });
  bodyGeo.rotateX(-Math.PI / 2);
  bodyGeo.translate(0, -bodyH * 0.5, 0);
  const bodyMesh = new THREE.Mesh(bodyGeo, boneMat);
  bodyMesh.castShadow = true;
  bodyMesh.receiveShadow = true;
  group.add(bodyMesh);

  // 2. Secondary Read: Pedicles + Posterior Lamina Arch (forming the spinal canal)
  const canalDepth = bodyD * 0.52 + 0.12;
  const pedicleOffsetX = bodyW * 0.34;
  const pedicleGeo = new THREE.CylinderGeometry(bodyH * 0.28, bodyH * 0.28, canalDepth, 8);
  pedicleGeo.rotateX(Math.PI / 2);

  const leftPedicle = new THREE.Mesh(pedicleGeo, accentBoneMat);
  leftPedicle.position.set(pedicleOffsetX, 0, -bodyD * 0.48);
  leftPedicle.rotation.y = -0.14;
  group.add(leftPedicle);

  const rightPedicle = new THREE.Mesh(pedicleGeo, accentBoneMat);
  rightPedicle.position.set(-pedicleOffsetX, 0, -bodyD * 0.48);
  rightPedicle.rotation.y = 0.14;
  group.add(rightPedicle);

  // Posterior neural arch curving around spinal canal
  const archCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-pedicleOffsetX * 1.05, 0, -bodyD * 0.52),
    new THREE.Vector3(-pedicleOffsetX * 0.72, 0, -bodyD * 0.82),
    new THREE.Vector3(0, 0, -bodyD * 0.96),
    new THREE.Vector3(pedicleOffsetX * 0.72, 0, -bodyD * 0.82),
    new THREE.Vector3(pedicleOffsetX * 1.05, 0, -bodyD * 0.52),
  ]);
  const archGeo = new THREE.TubeGeometry(archCurve, 14, bodyH * 0.26, 7, false);
  const archMesh = new THREE.Mesh(archGeo, accentBoneMat);
  archMesh.castShadow = true;
  group.add(archMesh);

  // 3. Secondary Read: Transverse Processes (Left & Right)
  const tpLength = isCervical
    ? 0.22 + progress * 0.12
    : isThoracic
    ? 0.38 - Math.abs(index - 11) * 0.012
    : 0.42;
  const tpGeo = new THREE.CapsuleGeometry(bodyH * 0.21, tpLength, 4, 8);
  tpGeo.rotateZ(Math.PI / 2);

  const leftTp = new THREE.Mesh(tpGeo, accentBoneMat);
  leftTp.position.set(pedicleOffsetX + tpLength * 0.42, 0.01, -bodyD * 0.58);
  leftTp.rotation.y = -0.32;
  group.add(leftTp);

  const rightTp = new THREE.Mesh(tpGeo, accentBoneMat);
  rightTp.position.set(-(pedicleOffsetX + tpLength * 0.42), 0.01, -bodyD * 0.58);
  rightTp.rotation.y = 0.32;
  group.add(rightTp);

  // 4. Accent Detail: Spinous Process (posterior dorsal ridge)
  const spinousLen = isCervical ? 0.24 : isThoracic ? 0.42 : 0.34;
  const spinousTilt = isCervical ? -0.35 : isThoracic ? -0.68 : -0.18;
  const spinousGeo = new THREE.CapsuleGeometry(bodyH * 0.2, spinousLen, 4, 8);
  spinousGeo.rotateX(Math.PI / 2);
  const spinous = new THREE.Mesh(spinousGeo, boneMat);
  spinous.position.set(0, spinousTilt * 0.16, -bodyD * 0.96 - spinousLen * 0.42);
  spinous.rotation.x = spinousTilt;
  spinous.castShadow = true;
  group.add(spinous);

  group.name = `Vertebra_${VERTEBRA_NAMES[index]}`;
  return group;
}

function buildSacrumGroup(
  boneMat: THREE.MeshPhysicalMaterial,
  accentBoneMat: THREE.MeshPhysicalMaterial,
): THREE.Group {
  const sacrum = new THREE.Group();
  sacrum.name = 'Sacrum_S1_S5';

  // Curved triangular sacral shield
  const shape = new THREE.Shape();
  shape.moveTo(-0.62, 0.38);
  shape.quadraticCurveTo(0, 0.46, 0.62, 0.38);
  shape.bezierCurveTo(0.68, 0.1, 0.42, -0.32, 0.14, -0.78);
  shape.quadraticCurveTo(0, -0.88, -0.14, -0.78);
  shape.bezierCurveTo(-0.42, -0.32, -0.68, 0.1, -0.62, 0.38);

  const sacrumGeo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.26,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.04,
    bevelSegments: 3,
    curveSegments: 16,
  });
  sacrumGeo.translate(0, 0, -0.13);
  const mainBody = new THREE.Mesh(sacrumGeo, boneMat);
  mainBody.rotation.x = 0.24;
  mainBody.castShadow = true;
  mainBody.receiveShadow = true;
  sacrum.add(mainBody);

  // Median sacral crest (posterior detail)
  const crestGeo = new THREE.CapsuleGeometry(0.055, 0.66, 4, 8);
  const crest = new THREE.Mesh(crestGeo, accentBoneMat);
  crest.position.set(0, -0.14, -0.19);
  crest.rotation.x = 0.28;
  sacrum.add(crest);

  // Bilateral sacral alae accents (highlighting Castellvi IIb right zone subtly via sculpted wing)
  const wingGeo = new THREE.SphereGeometry(0.24, 14, 10);
  wingGeo.scale(1.45, 0.72, 0.78);
  const rightAla = new THREE.Mesh(wingGeo, accentBoneMat);
  rightAla.position.set(-0.48, 0.25, 0.02);
  sacrum.add(rightAla);

  const leftAla = new THREE.Mesh(wingGeo, accentBoneMat);
  leftAla.position.set(0.48, 0.25, 0.02);
  sacrum.add(leftAla);

  return sacrum;
}

/**
 * Builds the translucent right trapezius + levator scapulae contour sheet
 * positioned on patient's RIGHT side (-X) and posterior surface (-Z)
 * spanning from upper cervical (C1–C7) & thoracic (D1–D10) out to the right shoulder.
 */
function buildRightTrapeziusMuscleGroup(fiberTexture: THREE.CanvasTexture): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Right_Trapezius_Musculature';

  const muscleMat = new THREE.MeshPhysicalMaterial({
    map: fiberTexture,
    color: 0xe15c6d,
    roughness: 0.55,
    metalness: 0.0,
    clearcoat: 0.18,
    transparent: true,
    opacity: 0.44,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  // Parametric curved triangular trapezius sheet (patient right = -X, posterior = -Z)
  const uSegs = 22;
  const vSegs = 16;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let iv = 0; iv <= vSegs; iv++) {
    const v = iv / vSegs; // 0 = medial spinal attachment, 1 = lateral acromion/scapula apex
    for (let iu = 0; iu <= uSegs; iu++) {
      const u = iu / uSegs; // 0 = upper occiput/C1, 1 = lower D10 attachment

      // Spine attachment height from C1 (y ~ 3.35) down to D10 (y ~ -0.75)
      const medialY = THREE.MathUtils.lerp(3.38, -0.78, u);
      const lateralY = THREE.MathUtils.lerp(1.92, 1.42, u); // converges toward right acromion/scapular spine
      const y = THREE.MathUtils.lerp(medialY, lateralY, Math.pow(v, 0.88));

      // Lateral flare out to patient RIGHT (-X)
      const flareProfile = Math.sin(Math.pow(u, 0.72) * Math.PI);
      const maxReachX = 2.08 * (0.28 + 0.72 * flareProfile);
      const x = -0.14 - v * maxReachX;

      // Follow posterior spine contour and wrap slightly anteriorly near shoulder
      const tApprox = THREE.MathUtils.clamp((3.42 - y) / 6.57, 0, 1);
      const center = getSpineCenterline(tApprox);
      const posteriorOffset = -0.62 - Math.sin(v * Math.PI) * 0.24 + Math.pow(v, 2) * 0.52;
      const z = center.z + posteriorOffset;

      positions.push(x, y, z);
      uvs.push(v, u);
    }
  }

  for (let iv = 0; iv < vSegs; iv++) {
    for (let iu = 0; iu < uSegs; iu++) {
      const a = iv * (uSegs + 1) + iu;
      const b = a + 1;
      const c = (iv + 1) * (uSegs + 1) + iu;
      const d = c + 1;
      indices.push(a, b, d, a, d, c);
    }
  }

  const trapGeo = new THREE.BufferGeometry();
  trapGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  trapGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  trapGeo.setIndex(indices);
  trapGeo.computeVertexNormals();

  const trapMesh = new THREE.Mesh(trapGeo, muscleMat);
  trapMesh.renderOrder = 3;
  group.add(trapMesh);

  // Subtle wireframe/contour outline of right trapezius for crisp anatomical readability
  const trapEdgeMat = new THREE.MeshBasicMaterial({
    color: 0xf43f5e,
    wireframe: true,
    transparent: true,
    opacity: 0.12,
    depthWrite: false,
  });
  const trapWire = new THREE.Mesh(trapGeo, trapEdgeMat);
  trapWire.renderOrder = 3;
  group.add(trapWire);

  // Focused highlight ribbon for right upper trapezius & levator scapulae (SOR 2026 signal change zone)
  const levatorCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.34, 3.05, -0.34),
    new THREE.Vector3(-0.72, 2.48, -0.58),
    new THREE.Vector3(-1.12, 1.92, -0.68),
    new THREE.Vector3(-1.38, 1.48, -0.56),
  ]);
  const levatorGeo = new THREE.TubeGeometry(levatorCurve, 24, 0.145, 12, false);
  const levatorMat = new THREE.MeshPhysicalMaterial({
    color: 0xf43f5e,
    emissive: 0x9f1239,
    emissiveIntensity: 0.35,
    roughness: 0.42,
    transparent: true,
    opacity: 0.58,
    depthWrite: false,
  });
  const levatorMesh = new THREE.Mesh(levatorGeo, levatorMat);
  levatorMesh.renderOrder = 4;
  group.add(levatorMesh);

  // Subtle ghost bilateral paraspinal erector spinae ribbons along lumbar/thoracic flanks
  const paraspinalMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.65,
    transparent: true,
    opacity: 0.16,
    depthWrite: false,
  });
  for (const side of [-1, 1]) {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 14; i++) {
      const t = 0.25 + (i / 14) * 0.72;
      const c = getSpineCenterline(t);
      pts.push(new THREE.Vector3(c.x + side * 0.44, c.y, c.z - 0.42));
    }
    const paraCurve = new THREE.CatmullRomCurve3(pts);
    const paraGeo = new THREE.TubeGeometry(paraCurve, 24, 0.11, 8, false);
    const paraMesh = new THREE.Mesh(paraGeo, paraspinalMat);
    paraMesh.renderOrder = 2;
    group.add(paraMesh);
  }

  return group;
}

export function buildProceduralSpineScene(maxAnisotropy: number): SpineSceneHandle {
  const root = new THREE.Group();
  root.name = 'Procedural_Spine_Anatomy';

  const vertebraeGroup = new THREE.Group();
  vertebraeGroup.name = 'Vertebrae_Layer';
  const discsGroup = new THREE.Group();
  discsGroup.name = 'Discs_Layer';

  const boneTexture = createBoneTexture();
  boneTexture.anisotropy = maxAnisotropy;
  const muscleTexture = createMuscleFiberTexture();
  muscleTexture.anisotropy = maxAnisotropy;

  const boneMat = new THREE.MeshPhysicalMaterial({
    map: boneTexture,
    color: 0xf3ece0,
    roughness: 0.44,
    metalness: 0.02,
    clearcoat: 0.14,
    clearcoatRoughness: 0.45,
  });

  const accentBoneMat = new THREE.MeshPhysicalMaterial({
    color: 0xded5c5,
    roughness: 0.68,
    metalness: 0.01,
  });

  const segmentStatusMap = new Map<string, SegmentStatus>();
  const segmentProtrusionMap = new Map<string, number>();
  DETAILED_SPINE_SEGMENTS.forEach((seg) => {
    segmentStatusMap.set(seg.id, seg.status);
    segmentProtrusionMap.set(seg.id, seg.metrics.protrusion2026 ?? 0);
  });

  // Compute all 24 vertebral positions + sacrum base
  const vertebraPositions: THREE.Vector3[] = [];
  for (let i = 0; i < 24; i++) {
    const t = i / 24.5;
    vertebraPositions.push(getSpineCenterline(t));
  }
  const sacrumTopPos = getSpineCenterline(24.15 / 24.5);

  // Build 24 articulated vertebrae oriented along curve tangent
  for (let i = 0; i < 24; i++) {
    const pos = vertebraPositions[i];
    const prev = i > 0 ? vertebraPositions[i - 1] : pos.clone().add(new THREE.Vector3(0, 0.25, 0));
    const next = i < 23 ? vertebraPositions[i + 1] : sacrumTopPos;
    const tangent = new THREE.Vector3().subVectors(prev, next).normalize();

    const vGroup = buildVertebraGroup(i, boneMat, accentBoneMat);
    vGroup.position.copy(pos);
    // Align local +Y to spinal tangent (facing superior)
    const up = new THREE.Vector3(0, 1, 0);
    const quat = new THREE.Quaternion().setFromUnitVectors(up, tangent);
    vGroup.quaternion.copy(quat);
    vertebraeGroup.add(vGroup);
  }

  // Add Sacrum below L5
  const sacrumGroup = buildSacrumGroup(boneMat, accentBoneMat);
  sacrumGroup.position.set(sacrumTopPos.x, sacrumTopPos.y - 0.46, sacrumTopPos.z - 0.16);
  vertebraeGroup.add(sacrumGroup);

  // Build Intervertebral Discs (indices 0..23; 23 = L5-S1)
  const clickables: THREE.Object3D[] = [];
  const discEntries: {
    segmentId: string | null;
    mesh: THREE.Mesh;
    material: THREE.MeshStandardMaterial;
    baseColor: THREE.Color;
    bulgeMesh?: THREE.Mesh;
  }[] = [];

  const segmentAccumPos = new Map<string, { sum: THREE.Vector3; count: number }>();

  for (let i = 0; i < 24; i++) {
    const upperPos = vertebraPositions[i];
    const lowerPos = i < 23 ? vertebraPositions[i + 1] : sacrumTopPos;
    const discPos = new THREE.Vector3().addVectors(upperPos, lowerPos).multiplyScalar(0.5);
    const tangent = new THREE.Vector3().subVectors(upperPos, lowerPos).normalize();

    const segId = DISC_INDEX_TO_SEGMENT[i] || null;
    const status = segId ? segmentStatusMap.get(segId) || 'stable' : null;
    const baseHex = status ? statusHex(status) : 0x94a3b8;

    const isCervical = i < 7;
    const isThoracic = i >= 7 && i < 19;
    const discW = isCervical
      ? THREE.MathUtils.lerp(0.36, 0.49, i / 6)
      : isThoracic
      ? THREE.MathUtils.lerp(0.5, 0.69, (i - 7) / 11)
      : THREE.MathUtils.lerp(0.73, 0.89, (i - 19) / 4);

    const discD = isCervical
      ? THREE.MathUtils.lerp(0.28, 0.37, i / 6)
      : isThoracic
      ? THREE.MathUtils.lerp(0.39, 0.55, (i - 7) / 11)
      : THREE.MathUtils.lerp(0.57, 0.67, (i - 19) / 4);

    const discH = isCervical ? 0.072 : isThoracic ? 0.08 : 0.115;

    const discShape = createKidneyBodyShape(discW * 1.03, discD * 1.03);
    const discGeo = new THREE.ExtrudeGeometry(discShape, {
      depth: discH,
      bevelEnabled: true,
      bevelThickness: 0.015,
      bevelSize: 0.014,
      bevelSegments: 2,
      curveSegments: 14,
    });
    discGeo.rotateX(-Math.PI / 2);
    discGeo.translate(0, -discH * 0.5, 0);

    const discMat = new THREE.MeshStandardMaterial({
      color: baseHex,
      emissive: new THREE.Color(baseHex),
      emissiveIntensity: status ? 0.16 : 0.02,
      roughness: 0.38,
      metalness: 0.05,
    });

    const discMesh = new THREE.Mesh(discGeo, discMat);
    discMesh.position.copy(discPos);
    discMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tangent);
    discMesh.castShadow = true;
    discMesh.receiveShadow = true;

    let bulgeMesh: THREE.Mesh | undefined;
    if (segId) {
      discMesh.userData.segmentId = segId;
      clickables.push(discMesh);

      const acc = segmentAccumPos.get(segId) || { sum: new THREE.Vector3(), count: 0 };
      acc.sum.add(discPos);
      acc.count += 1;
      segmentAccumPos.set(segId, acc);

      // Add subtle focal posterior/foraminal extrusion nodule for clinically prominent levels
      const prot = segmentProtrusionMap.get(segId) ?? 0;
      if (prot >= 2.8) {
        const bulgeRadius = THREE.MathUtils.clamp(0.055 + prot * 0.014, 0.08, 0.16);
        const bulgeGeo = new THREE.SphereGeometry(bulgeRadius, 12, 10);
        bulgeGeo.scale(1.1, 0.72, 1.35);
        bulgeMesh = new THREE.Mesh(bulgeGeo, discMat);
        // L4-L5 is left paramedian-foraminal (+X), D1-D2 & D6-D9 right-sided (-X)
        const latX =
          segId === 'L4-L5'
            ? discW * 0.28
            : segId === 'D1-D2' || segId === 'D6-D9' || segId === 'C2-C3'
            ? -discW * 0.25
            : 0;
        bulgeMesh.position.set(latX, 0, -discD * 0.54);
        bulgeMesh.userData.segmentId = segId;
        discMesh.add(bulgeMesh);
        clickables.push(bulgeMesh);
      }
    }

    discsGroup.add(discMesh);
    discEntries.push({
      segmentId: segId,
      mesh: discMesh,
      material: discMat,
      baseColor: new THREE.Color(baseHex),
      bulgeMesh,
    });
  }

  // Average positions for grouped segments (D6-D9, D10-D12, L1-L3)
  const segmentPositions = new Map<string, THREE.Vector3>();
  segmentAccumPos.forEach((acc, segId) => {
    segmentPositions.set(segId, acc.sum.divideScalar(acc.count));
  });

  // Precision Selection Halo Ring around active segment
  const ringGeo = new THREE.TorusGeometry(0.68, 0.022, 12, 48);
  ringGeo.rotateX(Math.PI / 2);
  const ringMat = new THREE.MeshStandardMaterial({
    color: 0x06b6d4,
    emissive: 0x06b6d4,
    emissiveIntensity: 0.75,
    roughness: 0.2,
    metalness: 0.4,
    transparent: true,
    opacity: 0.9,
  });
  const selectionRing = new THREE.Mesh(ringGeo, ringMat);
  selectionRing.renderOrder = 5;
  discsGroup.add(selectionRing);

  const musclesGroup = buildRightTrapeziusMuscleGroup(muscleTexture);

  root.add(vertebraeGroup);
  root.add(discsGroup);
  root.add(musclesGroup);

  const setHighlightedSegment = (segmentId: string) => {
    const pos = segmentPositions.get(segmentId);
    const status = segmentStatusMap.get(segmentId) || 'stable';
    const highlightHex = statusHex(status);

    discEntries.forEach((entry) => {
      const isSelected = entry.segmentId === segmentId;
      if (isSelected) {
        entry.material.color.setHex(highlightHex).lerp(new THREE.Color(0xffffff), 0.18);
        entry.material.emissive.setHex(highlightHex);
        entry.material.emissiveIntensity = 0.85;
        entry.mesh.scale.set(1.09, 1.15, 1.09);
      } else {
        entry.material.color.copy(entry.baseColor);
        entry.material.emissive.copy(entry.baseColor);
        entry.material.emissiveIntensity = entry.segmentId ? 0.14 : 0.02;
        entry.mesh.scale.set(1, 1, 1);
      }
    });

    if (pos) {
      selectionRing.visible = true;
      selectionRing.position.copy(pos);
      const isLumbar = segmentId.startsWith('L');
      const isCervical = segmentId.startsWith('C');
      const ringScale = isLumbar ? 1.15 : isCervical ? 0.68 : 0.9;
      selectionRing.scale.setScalar(ringScale);
      (selectionRing.material as THREE.MeshStandardMaterial).color.setHex(highlightHex);
      (selectionRing.material as THREE.MeshStandardMaterial).emissive.setHex(highlightHex);
    } else {
      selectionRing.visible = false;
    }
  };

  setHighlightedSegment('L4-L5');

  return {
    root,
    vertebraeGroup,
    discsGroup,
    musclesGroup,
    selectionRing,
    segmentPositions,
    clickables,
    setHighlightedSegment,
    dispose: () => disposeObject3D(root),
  };
}
