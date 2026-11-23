import { AtlasSceneMode } from '../types/medical';

/**
 * Relative path to exported @authorod/svitylo-3d-anatomy-data release.
 * Works both on Vite dev server and on GitHub Pages with base: './'.
 */
export const SVITYLO_DATA_VERSION = '1.2.0';
export const SVITYLO_DATA_URL = `./anatomy-data/${SVITYLO_DATA_VERSION}/`;

/** Clean anatomical human body outer surface silhouette (excluding hair). */
export const BODY_SILHOUETTE_IDS: string[] = [
  'regions.regions_of_head',
  'regions.regions_of_neck',
  'regions.regions_of_thorax',
  'regions.regions_of_back',
  'regions.regions_of_abdomen',
  'regions.regions_of_perineum',
  'regions.regions_of_upper_limb',
  'regions.regions_of_lower_limb',
];

/** Head & neck translucent silhouette for the Brain & Vessels scene. */
export const HEAD_SILHOUETTE_IDS: string[] = [
  'regions.regions_of_head',
  'regions.regions_of_neck',
];

/** Core spine structures shown opaque in the initial overview of the Spine scene. */
export const SPINE_CORE_IDS: string[] = [
  'skeletal.vertebral_column',
  'joints.intervertebral_symphysis',
];

/** Back & right shoulder girdle musculature referenced in SOR 2026. */
export const SPINE_MUSCLE_IDS: string[] = [
  'muscular.trapezius_muscle',
  'muscular.levator_scapulae_r',
  'muscular.levator_scapulae_l',
];

/** Core brain & cranial vessels structures for the Brain & Vessels scene. */
export const BRAIN_CORE_IDS: string[] = [
  'nervous.brain',
  'visceral.hypophysis',
  'nervous.optic_nerve_ii_l',
  'nervous.optic_nerve_ii_r',
  'nervous.optic_chiasm_l',
  'nervous.optic_chiasm_r',
];

export const BRAIN_VESSEL_IDS: string[] = [
  'cardiovascular.cerebral_arterial_circle',
  'cardiovascular.vertebral_artery_l',
  'cardiovascular.vertebral_artery_r',
  'cardiovascular.basilar_artery',
  'cardiovascular.dural_venous_sinuses',
];

/** Exact mapping of all 16 SOR MRI segments -> Svitylo vertebrae & disc IDs. */
export const SPINE_SEGMENT_SVITYLO_MAP: Record<string, string[]> = {
  'C2-C3': [
    'skeletal.axis_c2',
    'joints.intervertebral_disc_c2_c3',
    'skeletal.vertebra_c3',
  ],
  'C3-C4': [
    'skeletal.vertebra_c3',
    'joints.intervertebral_disc_c3_c4',
    'skeletal.vertebra_c4',
  ],
  'C4-C5': [
    'skeletal.vertebra_c4',
    'joints.intervertebral_disc_c4_c5',
    'skeletal.vertebra_c5',
  ],
  'C5-C6': [
    'skeletal.vertebra_c5',
    'joints.intervertebral_disc_c5_c6',
    'skeletal.vertebra_c6',
  ],
  'C6-C7': [
    'skeletal.vertebra_c6',
    'joints.intervertebral_disc_c6_c7',
    'skeletal.vertebra_c7',
  ],
  'C7-D1': [
    'skeletal.vertebra_c7',
    'joints.intervertebral_disc_c7_t1',
    'skeletal.vertebra_t1',
  ],
  'D1-D2': [
    'skeletal.vertebra_t1',
    'joints.intervertebral_disc_t1_t2',
    'skeletal.vertebra_t2',
  ],
  'D2-D3': [
    'skeletal.vertebra_t2',
    'joints.intervertebral_disc_t2_t3',
    'skeletal.vertebra_t3',
  ],
  'D3-D4': [
    'skeletal.vertebra_t3',
    'joints.intervertebral_disc_t3_t4',
    'skeletal.vertebra_t4',
  ],
  'D4-D5': [
    'skeletal.vertebra_t4',
    'joints.intervertebral_disc_t4_t5',
    'skeletal.vertebra_t5',
  ],
  'D6-D9': [
    'skeletal.vertebra_t6',
    'joints.intervertebral_disc_t6_t7',
    'skeletal.vertebra_t7',
    'joints.intervertebral_disc_t7_t8',
    'skeletal.vertebra_t8',
    'joints.intervertebral_disc_t8_t9',
    'skeletal.vertebra_t9',
  ],
  'D10-D12': [
    'skeletal.vertebra_t10',
    'joints.intervertebral_disc_t10_t11',
    'skeletal.vertebra_t11',
    'joints.intervertebral_disc_t11_t12',
    'skeletal.vertebra_t12',
  ],
  'L1-L3': [
    'skeletal.vertebra_l1',
    'joints.intervertebral_disc_l1_l2',
    'skeletal.vertebra_l2',
    'joints.intervertebral_disc_l2_l3',
    'skeletal.vertebra_l3',
  ],
  'L3-L4': [
    'skeletal.vertebra_l3',
    'joints.intervertebral_disc_l3_l4',
    'skeletal.vertebra_l4',
  ],
  'L4-L5': [
    'skeletal.vertebra_l4',
    'joints.intervertebral_disc_l4_l5',
    'skeletal.vertebra_l5',
  ],
  'L5-S1': [
    'skeletal.vertebra_l5',
    'joints.intervertebral_disc_l5_s1',
    'skeletal.sacrum',
  ],
};

/** Exact mapping of the 5 Brain MRI findings -> Svitylo neurovascular IDs. */
export const BRAIN_FINDING_SVITYLO_MAP: Record<string, string[]> = {
  pituitary: ['visceral.hypophysis'],
  'venous-angioma': [
    'cardiovascular.dural_venous_sinuses',
    'nervous.white_matter_of_telencephalon_r',
  ],
  'optic-nerves': [
    'nervous.optic_nerve_ii_l',
    'nervous.optic_nerve_ii_r',
    'nervous.optic_chiasm_l',
    'nervous.optic_chiasm_r',
  ],
  'left-vertebral-artery': [
    'cardiovascular.vertebral_artery_l',
    'nervous.medulla_oblongata_l',
    'nervous.pons_l',
  ],
  'vascular-gliosis': [
    'nervous.white_matter_of_telencephalon_l',
    'nervous.white_matter_of_telencephalon_r',
  ],
};

/** Reverse lookup from clicked 3D Svitylo structure ID to our MRI segment or brain finding ID. */
const SPINE_DISC_OR_VERTEBRA_TO_SEGMENT: Record<string, string> = {
  'skeletal.atlas_c1': 'C2-C3',
  'skeletal.axis_c2': 'C2-C3',
  'joints.intervertebral_disc_c2_c3': 'C2-C3',
  'skeletal.vertebra_c3': 'C3-C4',
  'joints.intervertebral_disc_c3_c4': 'C3-C4',
  'skeletal.vertebra_c4': 'C4-C5',
  'joints.intervertebral_disc_c4_c5': 'C4-C5',
  'skeletal.vertebra_c5': 'C5-C6',
  'joints.intervertebral_disc_c5_c6': 'C5-C6',
  'skeletal.vertebra_c6': 'C6-C7',
  'joints.intervertebral_disc_c6_c7': 'C6-C7',
  'skeletal.vertebra_c7': 'C7-D1',
  'joints.intervertebral_disc_c7_t1': 'C7-D1',
  'skeletal.vertebra_t1': 'D1-D2',
  'joints.intervertebral_disc_t1_t2': 'D1-D2',
  'skeletal.vertebra_t2': 'D2-D3',
  'joints.intervertebral_disc_t2_t3': 'D2-D3',
  'skeletal.vertebra_t3': 'D3-D4',
  'joints.intervertebral_disc_t3_t4': 'D3-D4',
  'skeletal.vertebra_t4': 'D4-D5',
  'joints.intervertebral_disc_t4_t5': 'D4-D5',
  'skeletal.vertebra_t5': 'D4-D5',
  'joints.intervertebral_disc_t5_t6': 'D6-D9',
  'skeletal.vertebra_t6': 'D6-D9',
  'joints.intervertebral_disc_t6_t7': 'D6-D9',
  'skeletal.vertebra_t7': 'D6-D9',
  'joints.intervertebral_disc_t7_t8': 'D6-D9',
  'skeletal.vertebra_t8': 'D6-D9',
  'joints.intervertebral_disc_t8_t9': 'D6-D9',
  'skeletal.vertebra_t9': 'D6-D9',
  'joints.intervertebral_disc_t9_t10': 'D10-D12',
  'skeletal.vertebra_t10': 'D10-D12',
  'joints.intervertebral_disc_t10_t11': 'D10-D12',
  'skeletal.vertebra_t11': 'D10-D12',
  'joints.intervertebral_disc_t11_t12': 'D10-D12',
  'skeletal.vertebra_t12': 'D10-D12',
  'joints.intervertebral_disc_t12_l1': 'L1-L3',
  'skeletal.vertebra_l1': 'L1-L3',
  'joints.intervertebral_disc_l1_l2': 'L1-L3',
  'skeletal.vertebra_l2': 'L1-L3',
  'joints.intervertebral_disc_l2_l3': 'L1-L3',
  'skeletal.vertebra_l3': 'L3-L4',
  'joints.intervertebral_disc_l3_l4': 'L3-L4',
  'skeletal.vertebra_l4': 'L4-L5',
  'joints.intervertebral_disc_l4_l5': 'L4-L5',
  'skeletal.vertebra_l5': 'L5-S1',
  'joints.intervertebral_disc_l5_s1': 'L5-S1',
  'skeletal.sacrum': 'L5-S1',
  'skeletal.coccyx': 'L5-S1',
};

export function resolveClickedStructureToAppId(
  sceneMode: AtlasSceneMode,
  structureId: string,
): string | null {
  if (sceneMode === 'spine') {
    return SPINE_DISC_OR_VERTEBRA_TO_SEGMENT[structureId] ?? null;
  }

  for (const [findingId, ids] of Object.entries(BRAIN_FINDING_SVITYLO_MAP)) {
    if (ids.includes(structureId)) return findingId;
  }
  if (structureId.includes('hypophysis')) return 'pituitary';
  if (structureId.includes('optic')) return 'optic-nerves';
  if (structureId.includes('vertebral_artery_l') || structureId.includes('medulla') || structureId.includes('pons')) {
    return 'left-vertebral-artery';
  }
  if (structureId.includes('sinus') || structureId.includes('vein')) {
    return 'venous-angioma';
  }
  if (structureId.includes('white_matter') || structureId.includes('cerebrum') || structureId.includes('telencephalon')) {
    return 'vascular-gliosis';
  }
  return null;
}
