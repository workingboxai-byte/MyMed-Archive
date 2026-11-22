import * as THREE from 'three';
import { BRAIN_MRI_LANDMARKS } from '../data/brainFindingsData';
import { disposeObject3D } from './optionalGlbLoader';

export interface BrainSceneHandle {
  root: THREE.Group;
  hemispheresGroup: THREE.Group;
  vesselsGroup: THREE.Group;
  markersGroup: THREE.Group;
  markerPositions: Map<string, THREE.Vector3>;
  clickables: THREE.Object3D[];
  setHighlightedFinding: (findingId: string) => void;
  dispose: () => void;
}

function createCortexTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#d8e3f0';
    ctx.fillRect(0, 0, 512, 256);

    // Subtle organic cortical sulci contours
    ctx.lineWidth = 2.4;
    for (let i = 0; i < 42; i++) {
      const startX = (i * 37) % 512;
      const startY = (i * 53) % 256;
      ctx.strokeStyle = i % 2 === 0 ? 'rgba(71, 85, 105, 0.24)' : 'rgba(255, 255, 255, 0.35)';
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.bezierCurveTo(
        startX + 26,
        startY - 18,
        startX + 48,
        startY + 26,
        startX + 76,
        startY + 6,
      );
      ctx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

/**
 * Sculpts a single cerebral hemisphere (side = -1 for anatomical right, +1 for anatomical left)
 * with realistic frontal, parietal, temporal, and occipital lobe contours + cortical undulations.
 */
function createHemisphereGeometry(side: -1 | 1): THREE.BufferGeometry {
  const geo = new THREE.SphereGeometry(1, 44, 34);
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);

    // Base oval cerebral envelope: narrower X, tall Y, elongated front-to-back Z
    let x = v.x * 0.72;
    let y = v.y * 1.04;
    let z = v.z * 1.38;

    // Flatten the medial longitudinal fissure face cleanly
    if (side === 1 && x < 0) {
      x *= 0.14;
    } else if (side === -1 && x > 0) {
      x *= 0.14;
    }

    // Taper frontal pole (+Z) slightly narrower than parietal/occipital (-Z)
    if (z > 0) {
      x *= 1 - z * 0.12;
      y *= 1 - z * 0.08;
    }

    // Temporal lobe lateral-inferior bulge
    const temporalMask =
      Math.exp(-Math.pow((z - 0.08) / 0.52, 2)) *
      Math.exp(-Math.pow((y + 0.35) / 0.42, 2));
    x += side * temporalMask * 0.16;
    y -= temporalMask * 0.09;

    // Carve subtle inferior orbital & cerebellar fossa concavity
    if (y < -0.35 && z < -0.25) {
      y += 0.24 * Math.exp(-Math.pow((z + 0.72) / 0.55, 2));
    }

    // Gentle organic gyri/sulci surface ripple
    const ripple =
      (Math.sin(v.x * 11 + v.z * 9) * Math.cos(v.y * 10 - v.z * 7)) * 0.022;
    const len = Math.hypot(x, y, z) || 1;
    x += (x / len) * ripple;
    y += (y / len) * ripple;
    z += (z / len) * ripple;

    pos.setXYZ(i, x + side * 0.54, y + 0.24, z);
  }

  geo.computeVertexNormals();
  return geo;
}

function buildTube(
  points: [number, number, number][],
  radius: number,
  material: THREE.Material,
  tubularSegments = 28,
): THREE.Mesh {
  const curve = new THREE.CatmullRomCurve3(points.map(([x, y, z]) => new THREE.Vector3(x, y, z)));
  const geo = new THREE.TubeGeometry(curve, tubularSegments, radius, 10, false);
  return new THREE.Mesh(geo, material);
}

export function buildProceduralBrainScene(maxAnisotropy: number): BrainSceneHandle {
  const root = new THREE.Group();
  root.name = 'Procedural_Brain_Anatomy';

  const hemispheresGroup = new THREE.Group();
  hemispheresGroup.name = 'Hemispheres_Layer';

  const vesselsGroup = new THREE.Group();
  vesselsGroup.name = 'Vessels_Nerves_Layer';

  const markersGroup = new THREE.Group();
  markersGroup.name = 'Markers_Layer';

  const cortexTexture = createCortexTexture();
  cortexTexture.anisotropy = maxAnisotropy;

  // 1. Translucent Cerebral Hemispheres
  const cortexMat = new THREE.MeshPhysicalMaterial({
    map: cortexTexture,
    color: 0xcbd5e1,
    roughness: 0.34,
    metalness: 0.0,
    clearcoat: 0.42,
    clearcoatRoughness: 0.28,
    transparent: true,
    opacity: 0.26,
    depthWrite: false,
    side: THREE.FrontSide,
  });

  const rightHemi = new THREE.Mesh(createHemisphereGeometry(-1), cortexMat);
  rightHemi.renderOrder = 3;
  const leftHemi = new THREE.Mesh(createHemisphereGeometry(1), cortexMat);
  leftHemi.renderOrder = 3;
  hemispheresGroup.add(rightHemi, leftHemi);

  // 2. Cerebellum (bilobed posterior-inferior structure)
  const cerebellumMat = new THREE.MeshPhysicalMaterial({
    color: 0xaab9cd,
    roughness: 0.52,
    metalness: 0.0,
    transparent: true,
    opacity: 0.44,
    depthWrite: false,
  });
  for (const side of [-1, 1]) {
    const lobeGeo = new THREE.SphereGeometry(0.42, 24, 18);
    lobeGeo.scale(1.12, 0.76, 0.92);
    const lobe = new THREE.Mesh(lobeGeo, cerebellumMat);
    lobe.position.set(side * 0.36, -0.68, -0.78);
    lobe.renderOrder = 2;
    hemispheresGroup.add(lobe);
  }

  // 3. Brainstem (Midbrain + Pons + Medulla)
  const stemMat = new THREE.MeshPhysicalMaterial({
    color: 0xd6d3d1,
    roughness: 0.46,
    metalness: 0.0,
    clearcoat: 0.14,
  });
  const stemCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.04, -0.04),
    new THREE.Vector3(0, -0.48, -0.14),
    new THREE.Vector3(0, -1.06, -0.22),
    new THREE.Vector3(0, -1.64, -0.26),
  ]);
  const stemGeo = new THREE.TubeGeometry(stemCurve, 24, 0.21, 14, false);
  const stemMesh = new THREE.Mesh(stemGeo, stemMat);
  stemMesh.castShadow = true;
  hemispheresGroup.add(stemMesh);

  // Bulging Pons
  const ponsGeo = new THREE.SphereGeometry(0.28, 20, 16);
  ponsGeo.scale(1.12, 0.92, 1.02);
  const ponsMesh = new THREE.Mesh(ponsGeo, stemMat);
  ponsMesh.position.set(0, -0.58, -0.06);
  hemispheresGroup.add(ponsMesh);

  // 4. Ventricular System (C-shaped lateral ventricles + 3rd ventricle)
  const ventricleMat = new THREE.MeshPhysicalMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.2,
    roughness: 0.22,
    transparent: true,
    opacity: 0.42,
    depthWrite: false,
  });
  for (const side of [-1, 1]) {
    const ventPoints: [number, number, number][] = [
      [side * 0.14, 0.32, 0.48],
      [side * 0.18, 0.48, 0.05],
      [side * 0.24, 0.36, -0.44],
      [side * 0.38, 0.02, -0.22],
      [side * 0.34, -0.08, 0.18],
    ];
    const ventMesh = buildTube(ventPoints, 0.085, ventricleMat, 26);
    ventMesh.renderOrder = 1;
    hemispheresGroup.add(ventMesh);
  }

  // 5. Pituitary Gland & Infundibular Stalk
  const pituitaryMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xb45309,
    emissiveIntensity: 0.35,
    roughness: 0.35,
  });
  const pituitaryBody = new THREE.Mesh(new THREE.SphereGeometry(0.115, 18, 14), pituitaryMat);
  pituitaryBody.scale.set(1.22, 0.85, 1.0);
  pituitaryBody.position.set(0, -0.52, 0.34);
  vesselsGroup.add(pituitaryBody);

  const stalk = buildTube(
    [
      [0, -0.22, 0.22],
      [0, -0.37, 0.29],
      [0, -0.48, 0.34],
    ],
    0.032,
    pituitaryMat,
    12,
  );
  vesselsGroup.add(stalk);

  // 6. Optic Chiasm & Optic Nerves (with translucent CSF sheath cuffs for VChG signs)
  const opticMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    emissive: 0x06b6d4,
    emissiveIntensity: 0.18,
    roughness: 0.36,
  });
  const sheathMat = new THREE.MeshPhysicalMaterial({
    color: 0x22d3ee,
    roughness: 0.2,
    transparent: true,
    opacity: 0.34,
    depthWrite: false,
  });

  // Optic chiasm bridge
  const chiasm = new THREE.Mesh(new THREE.SphereGeometry(0.085, 14, 12), opticMat);
  chiasm.scale.set(1.7, 0.65, 0.95);
  chiasm.position.set(0, -0.34, 0.48);
  vesselsGroup.add(chiasm);

  for (const side of [-1, 1]) {
    const opticCurvePts: [number, number, number][] = [
      [side * 0.08, -0.34, 0.48],
      [side * 0.22, -0.34, 0.86],
      [side * 0.34, -0.35, 1.24],
    ];
    vesselsGroup.add(buildTube(opticCurvePts, 0.038, opticMat, 18));
    // Expanded perineural CSF sheath sleeve
    const sheath = buildTube(
      [
        [side * 0.15, -0.34, 0.72],
        [side * 0.28, -0.35, 1.08],
      ],
      0.072,
      sheathMat,
      14,
    );
    sheath.renderOrder = 2;
    vesselsGroup.add(sheath);

    // Posterior optic tracts
    vesselsGroup.add(
      buildTube(
        [
          [side * 0.08, -0.34, 0.48],
          [side * 0.22, -0.24, 0.16],
          [side * 0.26, -0.16, -0.14],
        ],
        0.03,
        opticMat,
        14,
      ),
    );
  }

  // 7. Arterial Circle of Willis & Vertebrobasilar System
  const arteryMat = new THREE.MeshPhysicalMaterial({
    color: 0xdc2626,
    emissive: 0x7f1d1d,
    emissiveIntensity: 0.24,
    roughness: 0.26,
    clearcoat: 0.38,
  });

  // Left vertebral artery (curving close to brainstem — neurovascular contact zone!)
  vesselsGroup.add(
    buildTube(
      [
        [0.34, -1.68, -0.26],
        [0.24, -1.32, -0.19],
        [0.19, -1.12, -0.14], // focal contact against anterolateral medulla/pons
        [0.12, -0.94, -0.05],
        [0.0, -0.82, 0.04],
      ],
      0.044,
      arteryMat,
      26,
    ),
  );

  // Right vertebral artery (standard lateral path)
  vesselsGroup.add(
    buildTube(
      [
        [-0.36, -1.68, -0.28],
        [-0.34, -1.32, -0.22],
        [-0.26, -1.04, -0.11],
        [0.0, -0.82, 0.04],
      ],
      0.04,
      arteryMat,
      22,
    ),
  );

  // Basilar artery ascending along anterior pons
  vesselsGroup.add(
    buildTube(
      [
        [0.0, -0.82, 0.04],
        [0.0, -0.56, 0.14],
        [0.0, -0.28, 0.18],
      ],
      0.052,
      arteryMat,
      18,
    ),
  );

  // Circle of Willis + Bilateral ICAs, MCAs, ACAs, PCAs
  for (const side of [-1, 1]) {
    // Internal Carotid Artery (ICA)
    vesselsGroup.add(
      buildTube(
        [
          [side * 0.22, -0.95, 0.28],
          [side * 0.24, -0.58, 0.36],
          [side * 0.22, -0.34, 0.34],
        ],
        0.044,
        arteryMat,
        18,
      ),
    );
    // Posterior Communicating + Posterior Cerebral Artery (PCA)
    vesselsGroup.add(
      buildTube(
        [
          [0.0, -0.28, 0.18],
          [side * 0.16, -0.29, 0.24],
          [side * 0.22, -0.34, 0.34],
        ],
        0.025,
        arteryMat,
        14,
      ),
    );
    vesselsGroup.add(
      buildTube(
        [
          [0.0, -0.28, 0.18],
          [side * 0.32, -0.25, -0.12],
          [side * 0.56, -0.15, -0.58],
        ],
        0.03,
        arteryMat,
        18,
      ),
    );
    // Middle Cerebral Artery (MCA) branching laterally
    vesselsGroup.add(
      buildTube(
        [
          [side * 0.22, -0.34, 0.34],
          [side * 0.58, -0.24, 0.3],
          [side * 0.88, 0.02, 0.14],
          [side * 0.94, 0.32, -0.1],
        ],
        0.036,
        arteryMat,
        22,
      ),
    );
    // Anterior Cerebral Artery (ACA)
    vesselsGroup.add(
      buildTube(
        [
          [side * 0.22, -0.34, 0.34],
          [side * 0.09, -0.22, 0.56],
          [side * 0.06, 0.16, 0.72],
          [side * 0.07, 0.56, 0.42],
        ],
        0.03,
        arteryMat,
        20,
      ),
    );
  }
  // Anterior Communicating Artery
  vesselsGroup.add(
    buildTube(
      [
        [-0.09, -0.22, 0.56],
        [0.09, -0.22, 0.56],
      ],
      0.024,
      arteryMat,
      8,
    ),
  );

  // 8. Right Developmental Venous Anomaly (Venous Angioma, 10 mm) in Right Hemisphere (-X)
  const venousMat = new THREE.MeshPhysicalMaterial({
    color: 0x2563eb,
    emissive: 0x1d4ed8,
    emissiveIntensity: 0.42,
    roughness: 0.28,
  });
  const dvaCenter = new THREE.Vector3(-0.72, 0.42, 0.28);
  const dvaBranches: [number, number, number][] = [
    [-0.98, 0.66, 0.44],
    [-0.95, 0.56, 0.05],
    [-0.86, 0.22, 0.54],
    [-0.62, 0.68, 0.46],
    [-0.56, 0.52, -0.02],
  ];
  dvaBranches.forEach((tip) => {
    vesselsGroup.add(
      buildTube(
        [
          tip,
          [
            (tip[0] + dvaCenter.x) * 0.5,
            (tip[1] + dvaCenter.y) * 0.5 + 0.04,
            (tip[2] + dvaCenter.z) * 0.5,
          ],
          [dvaCenter.x, dvaCenter.y, dvaCenter.z],
        ],
        0.02,
        venousMat,
        12,
      ),
    );
  });
  // Draining collector vein toward superficial cortical vein
  vesselsGroup.add(
    buildTube(
      [
        [dvaCenter.x, dvaCenter.y, dvaCenter.z],
        [-0.52, 0.74, 0.22],
        [-0.22, 0.96, 0.14],
      ],
      0.036,
      venousMat,
      14,
    ),
  );

  // 9. Subcortical Vascular Gliosis Foci (small luminous clusters in white matter)
  const gliosisMat = new THREE.MeshStandardMaterial({
    color: 0x10b981,
    emissive: 0x059669,
    emissiveIntensity: 0.55,
    roughness: 0.3,
  });
  const gliosisOffsets: [number, number, number][] = [
    [0.56, 0.72, 0.14],
    [0.44, 0.64, 0.34],
    [0.64, 0.58, -0.08],
    [-0.48, 0.68, -0.18],
  ];
  gliosisOffsets.forEach(([gx, gy, gz], idx) => {
    const spot = new THREE.Mesh(new THREE.SphereGeometry(idx === 0 ? 0.065 : 0.045, 12, 10), gliosisMat);
    spot.position.set(gx, gy, gz);
    vesselsGroup.add(spot);
  });

  // 10. Interactive Composite 3D Landmark Markers for all 5 findings
  const clickables: THREE.Object3D[] = [];
  const markerPositions = new Map<string, THREE.Vector3>();
  const markerHandles: {
    id: string;
    group: THREE.Group;
    coreMat: THREE.MeshStandardMaterial;
    ringMat: THREE.MeshStandardMaterial;
    baseColor: THREE.Color;
  }[] = [];

  BRAIN_MRI_LANDMARKS.forEach((lm) => {
    const pos = new THREE.Vector3(...lm.position);
    markerPositions.set(lm.id, pos);

    const markerGroup = new THREE.Group();
    markerGroup.position.copy(pos);

    const baseColor = new THREE.Color(lm.colorHex);
    const coreMat = new THREE.MeshStandardMaterial({
      color: baseColor,
      emissive: baseColor,
      emissiveIntensity: 0.45,
      roughness: 0.25,
      metalness: 0.15,
    });
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.095, 18, 14), coreMat);
    core.userData.findingId = lm.id;
    core.renderOrder = 6;
    markerGroup.add(core);
    clickables.push(core);

    const ringMat = new THREE.MeshStandardMaterial({
      color: baseColor,
      emissive: baseColor,
      emissiveIntensity: 0.5,
      roughness: 0.2,
      transparent: true,
      opacity: 0.82,
    });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.165, 0.018, 10, 32), ringMat);
    ring.userData.findingId = lm.id;
    ring.rotation.x = Math.PI * 0.35;
    ring.renderOrder = 6;
    markerGroup.add(ring);
    clickables.push(ring);

    // Invisible slightly larger hit sphere for effortless mouse/touch picking
    const hitSphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 10, 8),
      new THREE.MeshBasicMaterial({ visible: false }),
    );
    hitSphere.userData.findingId = lm.id;
    markerGroup.add(hitSphere);
    clickables.push(hitSphere);

    markersGroup.add(markerGroup);
    markerHandles.push({
      id: lm.id,
      group: markerGroup,
      coreMat,
      ringMat,
      baseColor,
    });
  });

  root.add(hemispheresGroup);
  root.add(vesselsGroup);
  root.add(markersGroup);

  const setHighlightedFinding = (findingId: string) => {
    markerHandles.forEach((h) => {
      const isSelected = h.id === findingId;
      if (isSelected) {
        h.group.scale.setScalar(1.32);
        h.coreMat.emissiveIntensity = 1.05;
        h.ringMat.opacity = 1.0;
        h.ringMat.emissiveIntensity = 1.0;
      } else {
        h.group.scale.setScalar(0.92);
        h.coreMat.emissiveIntensity = 0.35;
        h.ringMat.opacity = 0.55;
        h.ringMat.emissiveIntensity = 0.35;
      }
    });
  };

  setHighlightedFinding(BRAIN_MRI_LANDMARKS[0].id);

  return {
    root,
    hemispheresGroup,
    vesselsGroup,
    markersGroup,
    markerPositions,
    clickables,
    setHighlightedFinding,
    dispose: () => disposeObject3D(root),
  };
}
