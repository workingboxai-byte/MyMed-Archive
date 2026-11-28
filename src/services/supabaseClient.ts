import { createClient } from '@supabase/supabase-js';
import {
  AttachmentLink,
  ComplaintZone,
  ComplaintZoneKey,
  FollowUpTask,
  MedicalExamRecord,
  PatientProfile,
  RawMedicalCardJson,
  TreatmentCourse,
} from '../types/medical';

const DEFAULT_SUPABASE_URL = 'https://jfpxegmrkxxzdsxoipmg.supabase.co';
const DEFAULT_SUPABASE_PUBLISHABLE_KEY =
  'sb_publishable_Mynegg2eFxTcsm8c1HTuDQ_yV8Ale9y';

export const SUPABASE_URL =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() ||
  DEFAULT_SUPABASE_URL;

export const SUPABASE_ANON_KEY =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() ||
  DEFAULT_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/**
 * Strictly allowlisted medical snapshot payload synced to cloud / doctor share.
 * NEVER contains PIN hashes, decrypted vault items, or encrypted Personal Vault ciphertext.
 */
export interface SafeMedicalSnapshot {
  rawMeta: RawMedicalCardJson['meta'];
  profile: PatientProfile;
  complaints: Record<ComplaintZoneKey, ComplaintZone>;
  sorMeta: RawMedicalCardJson['sor_spine_mri_comparison'];
  records: MedicalExamRecord[];
  attachments: AttachmentLink[];
  treatments: TreatmentCourse[];
  followUpPlan: FollowUpTask[];
  sharedAt?: string;
}

export interface SharedMedicalCardResult {
  snapshot: Partial<SafeMedicalSnapshot>;
  expiresAt: string | null;
}

export function buildSafeDoctorSnapshot(source: SafeMedicalSnapshot): SafeMedicalSnapshot {
  return {
    rawMeta: source.rawMeta,
    profile: {
      full_name_ru: source.profile.full_name_ru,
      full_name_uk: source.profile.full_name_uk,
      full_name_en: source.profile.full_name_en,
      birth_year: source.profile.birth_year,
      region_ru: source.profile.region_ru,
      region_uk: source.profile.region_uk,
      region_en: source.profile.region_en,
      height_cm: source.profile.height_cm,
      weight_kg: source.profile.weight_kg,
      blood_type: source.profile.blood_type,
      vaccinations: source.profile.vaccinations,
      chronic_conditions: source.profile.chronic_conditions,
      allergies: source.profile.allergies,
      current_medications: source.profile.current_medications,
    },
    complaints: {
      lumbar_sacral: { ...source.complaints.lumbar_sacral },
      thoracic: { ...source.complaints.thoracic },
      cervical_head: { ...source.complaints.cervical_head },
      right_side_spasms_load: { ...source.complaints.right_side_spasms_load },
    },
    sorMeta: { ...source.sorMeta },
    records: source.records.map((r) => ({ ...r, title: { ...r.title } })),
    attachments: source.attachments.map((a) => ({
      ...a,
      urls: Array.isArray(a.urls) ? [...a.urls] : undefined,
    })),
    treatments: source.treatments.map((tr) => ({
      ...tr,
      medications: tr.medications.map((m) => ({ ...m })),
    })),
    followUpPlan: source.followUpPlan.map((f) => ({ ...f })),
    sharedAt: new Date().toISOString(),
  };
}

/**
 * Generates a 192-bit cryptographically secure URL-safe random token.
 */
export function generateSecureShareToken(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

const SHARE_TOKEN_REGEX = /^[A-Za-z0-9_-]{12,128}$/;

export function isValidShareToken(token: string | null | undefined): token is string {
  if (!token) return false;
  return SHARE_TOKEN_REGEX.test(token.trim());
}

export async function loadCloudMedicalCard(
  userId: string,
): Promise<{ data: Partial<SafeMedicalSnapshot> | null; updatedAt: string | null; error: string | null }> {
  const { data, error } = await supabase
    .from('medical_cards')
    .select('data, updated_at')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    return { data: null, updatedAt: null, error: error.message };
  }

  if (!data || !data.data || typeof data.data !== 'object') {
    return { data: null, updatedAt: null, error: null };
  }

  return {
    data: data.data as Partial<SafeMedicalSnapshot>,
    updatedAt: typeof data.updated_at === 'string' ? data.updated_at : null,
    error: null,
  };
}

export async function saveCloudMedicalCard(
  userId: string,
  cardState: SafeMedicalSnapshot,
): Promise<{ updatedAt: string | null; error: string | null }> {
  const nowIso = new Date().toISOString();
  const safePayload = buildSafeDoctorSnapshot(cardState);
  delete safePayload.sharedAt;

  const { error } = await supabase
    .from('medical_cards')
    .upsert(
      {
        user_id: userId,
        data: safePayload,
        updated_at: nowIso,
      },
      { onConflict: 'user_id' },
    );

  if (error) {
    return { updatedAt: null, error: error.message };
  }

  return { updatedAt: nowIso, error: null };
}

export async function createDoctorShareRecord(
  userId: string,
  cardState: SafeMedicalSnapshot,
): Promise<{ token: string; expiresAt: string; error: null } | { token: null; expiresAt: null; error: string }> {
  const token = generateSecureShareToken();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const snapshot = buildSafeDoctorSnapshot(cardState);

  const { error } = await supabase.from('doctor_shares').insert({
    token,
    user_id: userId,
    snapshot,
    expires_at: expiresAt,
  });

  if (error) {
    return { token: null, expiresAt: null, error: error.message };
  }

  return { token, expiresAt, error: null };
}

function unwrapSharedRpcPayload(raw: unknown): SharedMedicalCardResult | null {
  if (!raw) return null;

  const candidate = Array.isArray(raw) ? raw[0] : raw;
  if (!candidate || typeof candidate !== 'object') return null;

  const obj = candidate as Record<string, unknown>;

  // Case 1: Row object containing { snapshot, expires_at }
  if (obj.snapshot && typeof obj.snapshot === 'object') {
    const expiresAt =
      typeof obj.expires_at === 'string'
        ? obj.expires_at
        : typeof obj.expiresAt === 'string'
        ? obj.expiresAt
        : null;
    if (expiresAt && new Date(expiresAt).getTime() <= Date.now()) {
      return null;
    }
    return {
      snapshot: obj.snapshot as Partial<SafeMedicalSnapshot>,
      expiresAt,
    };
  }

  // Case 2: Row object containing { data, expires_at }
  if (obj.data && typeof obj.data === 'object') {
    const expiresAt =
      typeof obj.expires_at === 'string'
        ? obj.expires_at
        : typeof obj.expiresAt === 'string'
        ? obj.expiresAt
        : null;
    if (expiresAt && new Date(expiresAt).getTime() <= Date.now()) {
      return null;
    }
    return {
      snapshot: obj.data as Partial<SafeMedicalSnapshot>,
      expiresAt,
    };
  }

  // Case 3: Direct JSONB snapshot returned by RPC
  if ('profile' in obj || 'complaints' in obj || 'records' in obj) {
    return {
      snapshot: obj as Partial<SafeMedicalSnapshot>,
      expiresAt: typeof obj.expires_at === 'string' ? obj.expires_at : null,
    };
  }

  return null;
}

export async function fetchSharedMedicalCard(
  shareToken: string,
): Promise<{ result: SharedMedicalCardResult | null; error: string | null }> {
  const cleanToken = shareToken.trim();
  if (!isValidShareToken(cleanToken)) {
    return { result: null, error: 'INVALID_TOKEN' };
  }

  const { data, error } = await supabase.rpc('get_shared_medical_card', {
    share_token: cleanToken,
  });

  if (error) {
    return { result: null, error: error.message };
  }

  const parsed = unwrapSharedRpcPayload(data);
  if (!parsed) {
    return { result: null, error: 'EXPIRED_OR_NOT_FOUND' };
  }

  return { result: parsed, error: null };
}
