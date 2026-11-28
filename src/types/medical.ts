export type Language = 'uk' | 'ru' | 'en';

export type NavSection =
  | 'anamnesis'
  | 'mri'
  | 'atlas3d'
  | 'records'
  | 'treatments'
  | 'archive'
  | 'doctor';

export type AtlasSceneMode = 'spine' | 'brain';
export type AtlasCameraPreset = 'front' | 'side' | 'back' | 'reset';

export type SpineRegion = 'cervical' | 'thoracic' | 'lumbar';
export type RegionFilter = 'all' | SpineRegion;
export type MriViewMode = '2025' | '2026' | 'compare';
export type SegmentStatus = 'negative' | 'new' | 'stable';

export interface LocalizedText {
  uk: string;
  ru: string;
  en: string;
}

export interface PatientProfile {
  full_name_ru: string;
  full_name_uk: string;
  full_name_en: string;
  birth_year: number;
  region_ru: string;
  region_uk: string;
  region_en: string;
  height_cm: number | null;
  weight_kg: number | null;
  blood_type: string | null;
  vaccinations: string | null;
  chronic_conditions: string | null;
  allergies: string | null;
  current_medications: string | null;
}

export type ComplaintZoneKey =
  | 'lumbar_sacral'
  | 'thoracic'
  | 'cervical_head'
  | 'right_side_spasms_load';

export interface ComplaintZone {
  zone_ru: string;
  zone_uk: string;
  zone_en: string;
  summary_ru: string;
  summary_uk: string;
  summary_en: string;
}

export interface RawSorSegment {
  id: string;
  region: SpineRegion;
  mri_2025: string;
  mri_2026: string;
  dynamics: string;
}

export interface SegmentScanDetails {
  finding: LocalizedText;
  details: LocalizedText;
  canal: LocalizedText;
  roots: LocalizedText;
}

export interface DetailedSpineSegment {
  id: string;
  region: SpineRegion;
  y: number; // SVG vertical coordinate
  status: SegmentStatus;
  statusLabel: LocalizedText;
  y2025: SegmentScanDetails;
  y2026: SegmentScanDetails;
  deltaSummary: LocalizedText;
  metrics: {
    protrusion2025: number | null; // mm max
    protrusion2026: number | null; // mm max
    canalSagittal2025: number | null; // mm
    canalSagittal2026: number | null; // mm
    canalNormMin: number; // mm clinical lower norm
  };
}

export interface SystemicFinding {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  tag: LocalizedText;
  title: LocalizedText;
  body: LocalizedText;
  linkedSegments: string[];
}

export type RecordCategory = 'mri' | 'ultrasound' | 'discharge' | 'lab' | 'other';

export interface MedicalExamRecord {
  id: string;
  originalIndexTitle: string;
  title: LocalizedText;
  date: string; // Display date or range, e.g. '2025-08-04' or '2025-07-23 – 2025-08-08'
  sortDate: string; // ISO YYYY-MM-DD for sorting
  category: RecordCategory;
  notes: string;
  isCustom?: boolean;
}

export type AttachmentSource = 'gdrive' | 'cloud' | 'clinic' | 'other';

export interface AttachmentLink {
  id: string;
  title: string;
  url: string;
  urls?: string[];
  source: AttachmentSource;
  date: string;
  linkedSegment: string;
  linkedRecordId: string;
  notes: string;
}

export type TreatmentCourseType = 'inpatient' | 'outpatient';
export type TreatmentCourseStatus = 'active' | 'completed';

export interface PrescribedMedication {
  id: string;
  name: string;
  dosage: string;
  schedule: string;
  duration: string;
}

export interface TreatmentCourse {
  id: string;
  courseType: TreatmentCourseType;
  status: TreatmentCourseStatus;
  period: string;
  sortDate: string;
  prescribedBy: string;
  medications: PrescribedMedication[];
  proceduresAndRecommendations: string;
  linkedRecordId: string;
}

export interface PinHashRecord {
  version: 1;
  algorithm: 'SHA-256';
  salt: string;
  hash: string;
  updatedAt: string;
}

export interface EncryptedVaultPayload {
  version: 1;
  algorithm: 'AES-GCM';
  kdf: 'PBKDF2-SHA256';
  iterations: number;
  salt: string;
  iv: string;
  ciphertext: string;
  itemCount?: number;
  updatedAt: string;
}

export type VaultItemCategory = 'vod' | 'vlk' | 'rezerv' | 'personal';

export interface PersonalVaultItem {
  id: string;
  category: VaultItemCategory;
  title: string;
  date: string;
  urls: string[];
  notes: string;
  updatedAt: string;
}

export interface FollowUpTask {
  id: string;
  title: string;
  targetDate: string;
  completed: boolean;
  createdAt: string;
}

export interface MedicalCardMeta {
  schema_version: string;
  exported_at: string;
  default_language: Language;
  supported_languages: Language[];
  purpose: string;
  disclaimer: LocalizedText;
}

export interface RawMedicalCardJson {
  meta: MedicalCardMeta;
  patient_profile: PatientProfile;
  complaints_by_zone: Record<ComplaintZoneKey, ComplaintZone>;
  sor_spine_mri_comparison: {
    provider: string;
    radiologist: string;
    scan_dates: [string, string];
    report_dates: [string, string];
    segments: RawSorSegment[];
  };
  other_records_index: string[];
  attachments_and_links: AttachmentLink[];
  // Optional extended fields preserved on export/import
  extended_records?: MedicalExamRecord[];
  treatments?: TreatmentCourse[];
  follow_up_plan?: FollowUpTask[];
  // Optional client-side privacy PIN hash (SHA-256) and AES-GCM encrypted Personal Vault
  privacy_security?: PinHashRecord | null;
  encrypted_personal_vault?: EncryptedVaultPayload | null;
}
