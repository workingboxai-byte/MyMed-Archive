import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  AtlasSceneMode,
  AttachmentLink,
  ComplaintZone,
  ComplaintZoneKey,
  EncryptedVaultPayload,
  FollowUpTask,
  Language,
  MedicalExamRecord,
  NavSection,
  PatientProfile,
  PersonalVaultItem,
  PinHashRecord,
  PrescribedMedication,
  RawMedicalCardJson,
  TreatmentCourse,
} from '../types/medical';
import {
  ANONYMIZED_DEFAULT_MEDICAL_CARD,
  extractSortDate,
  getAttachmentUrls,
  migrateSplitSpineMriRecords,
  normalizeAttachmentSource,
  parseOtherRecordsIndex,
} from '../data/recordsLocalization';
import { UI_DICT, UiDictionary } from '../data/i18n';
import {
  decryptVaultItems,
  encryptVaultItems,
  hashPinSha256,
  isValidEncryptedVaultPayload,
  isValidPinHashRecord,
  verifyPinSha256,
} from '../utils/privacyCrypto';

const STORAGE_KEY = 'med_card_archive_state_v2';
const LANG_STORAGE_KEY = 'med_card_archive_lang_v2';
const THEME_STORAGE_KEY = 'med_card_archive_theme_v2';
const PRIVACY_STORAGE_KEY = 'med_card_archive_privacy_v2';
const SECURITY_STORAGE_KEY = 'med_card_archive_security_v1';

export type ThemeMode = 'light' | 'dark';
export type PinModalMode = 'disable_privacy' | 'unlock_vault';

interface StoredSecurityState {
  pinAuth: PinHashRecord | null;
  encryptedVault: EncryptedVaultPayload | null;
}

interface StoredState {
  rawMeta: RawMedicalCardJson['meta'];
  profile: PatientProfile;
  complaints: Record<ComplaintZoneKey, ComplaintZone>;
  sorMeta: RawMedicalCardJson['sor_spine_mri_comparison'];
  records: MedicalExamRecord[];
  attachments: AttachmentLink[];
  treatments: TreatmentCourse[];
  followUpPlan: FollowUpTask[];
}

export interface ToastMessage {
  id: number;
  text: string;
  tone: 'info' | 'success' | 'error';
  actionLabel?: string;
  onAction?: () => void;
}

export interface ShowToastOptions {
  durationMs?: number;
  actionLabel?: string;
  onAction?: () => void;
}

interface MedicalArchiveContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: ThemeMode;
  toggleTheme: () => void;
  privacyMode: boolean;
  togglePrivacyMode: () => void;
  t: UiDictionary;
  activeSection: NavSection;
  setActiveSection: (section: NavSection) => void;
  selectedMriSegment: string;
  setSelectedMriSegment: (segmentId: string) => void;
  jumpToMriSegment: (segmentId: string) => void;
  atlas3dScene: AtlasSceneMode;
  setAtlas3dScene: (scene: AtlasSceneMode) => void;
  atlasFocusNonce: number;
  jumpTo3DAtlasSegment: (segmentId: string) => void;
  meta: RawMedicalCardJson['meta'];
  profile: PatientProfile;
  complaints: Record<ComplaintZoneKey, ComplaintZone>;
  sorMeta: RawMedicalCardJson['sor_spine_mri_comparison'];
  records: MedicalExamRecord[];
  attachments: AttachmentLink[];
  treatments: TreatmentCourse[];
  followUpPlan: FollowUpTask[];
  updateProfile: (next: PatientProfile) => void;
  updateComplaint: (key: ComplaintZoneKey, next: ComplaintZone) => void;
  addRecord: (record: Omit<MedicalExamRecord, 'id'>) => string;
  updateRecord: (id: string, next: Partial<MedicalExamRecord>) => void;
  deleteRecord: (id: string) => void;
  addTreatment: (course: Omit<TreatmentCourse, 'id'>) => string;
  updateTreatment: (id: string, next: Partial<TreatmentCourse>) => void;
  deleteTreatment: (id: string) => void;
  addAttachment: (item: Omit<AttachmentLink, 'id'>) => void;
  addAttachmentsBatch: (items: Omit<AttachmentLink, 'id'>[]) => void;
  updateAttachment: (id: string, next: Partial<AttachmentLink>) => void;
  deleteAttachment: (id: string) => void;
  addFollowUpTask: (title: string, targetDate: string) => void;
  toggleFollowUpTask: (id: string) => void;
  deleteFollowUpTask: (id: string) => void;
  exportJsonFile: () => void;
  importJsonString: (jsonText: string) => { ok: boolean; error?: string };
  resetToInitialJson: () => void;
  toast: ToastMessage | null;
  showToast: (text: string, tone?: ToastMessage['tone'], options?: ShowToastOptions) => void;
  dismissToast: () => void;
  // Privacy PIN (SHA-256) & Encrypted Personal Vault (AES-GCM)
  hasPin: boolean;
  hasEncryptedVault: boolean;
  encryptedVaultCount: number;
  vaultUnlocked: boolean;
  vaultItems: PersonalVaultItem[];
  pinModalRequest: PinModalMode | null;
  closePinModal: () => void;
  requestUnlockVault: () => void;
  lockVault: () => void;
  verifyAndUnlockWithPin: (pin: string) => Promise<{ ok: boolean; error?: string }>;
  setupPin: (newPin: string) => Promise<{ ok: boolean; error?: string }>;
  changePin: (currentPin: string, newPin: string) => Promise<{ ok: boolean; error?: string }>;
  removePin: (currentPin: string) => Promise<{ ok: boolean; error?: string }>;
  addVaultItem: (item: Omit<PersonalVaultItem, 'id' | 'updatedAt'>) => Promise<boolean>;
  updateVaultItem: (
    id: string,
    next: Partial<Omit<PersonalVaultItem, 'id' | 'updatedAt'>>,
  ) => Promise<boolean>;
  deleteVaultItem: (id: string) => Promise<boolean>;
}

const MedicalArchiveContext = createContext<MedicalArchiveContextValue | null>(null);

function normalizeAttachmentsList(items: unknown): AttachmentLink[] {
  if (!Array.isArray(items)) return [];
  return items.map((rawItem, idx) => {
    const item = rawItem as Partial<AttachmentLink>;
    const urls = getAttachmentUrls(item);
    const primaryUrl = urls[0] || '';
    return {
      id: item.id || `att-${Date.now()}-${idx}`,
      title: item.title || primaryUrl || 'Link',
      url: primaryUrl,
      urls,
      source: normalizeAttachmentSource(item.source, primaryUrl, urls),
      date: item.date || '',
      linkedSegment: item.linkedSegment || '',
      linkedRecordId: item.linkedRecordId || '',
      notes: item.notes || '',
    };
  });
}

function normalizeTreatmentsList(items: unknown): TreatmentCourse[] {
  if (!Array.isArray(items)) return [];
  return items.map((rawItem, idx) => {
    const item = rawItem as Partial<TreatmentCourse>;
    const period = typeof item.period === 'string' ? item.period.trim() : '';
    const rawMeds = Array.isArray(item.medications) ? item.medications : [];
    const medications: PrescribedMedication[] = rawMeds
      .map((rawMed, mIdx) => {
        const med = rawMed as Partial<PrescribedMedication>;
        return {
          id: med.id || `med-${Date.now()}-${idx}-${mIdx}`,
          name: typeof med.name === 'string' ? med.name.trim() : '',
          dosage: typeof med.dosage === 'string' ? med.dosage.trim() : '',
          schedule: typeof med.schedule === 'string' ? med.schedule.trim() : '',
          duration: typeof med.duration === 'string' ? med.duration.trim() : '',
        };
      })
      .filter((m) => m.name || m.dosage || m.schedule || m.duration);

    return {
      id: item.id || `trt-${Date.now()}-${idx}`,
      courseType: item.courseType === 'inpatient' ? 'inpatient' : 'outpatient',
      status: item.status === 'active' ? 'active' : 'completed',
      period: period || '—',
      sortDate: item.sortDate || (period ? extractSortDate(period) : '2025-01-01'),
      prescribedBy: typeof item.prescribedBy === 'string' ? item.prescribedBy.trim() : '',
      medications,
      proceduresAndRecommendations:
        typeof item.proceduresAndRecommendations === 'string'
          ? item.proceduresAndRecommendations.trim()
          : '',
      linkedRecordId: typeof item.linkedRecordId === 'string' ? item.linkedRecordId : '',
    };
  });
}

function normalizeFollowUpList(items: unknown): FollowUpTask[] {
  if (!Array.isArray(items)) return [];
  return items
    .map((rawItem, idx) => {
      const item = rawItem as Partial<FollowUpTask>;
      const title = typeof item.title === 'string' ? item.title.trim() : '';
      if (!title) return null;
      return {
        id: typeof item.id === 'string' && item.id ? item.id : `fup-${Date.now()}-${idx}`,
        title,
        targetDate: typeof item.targetDate === 'string' ? item.targetDate.trim() : '',
        completed: Boolean(item.completed),
        createdAt:
          typeof item.createdAt === 'string' && item.createdAt
            ? item.createdAt
            : new Date().toISOString(),
      };
    })
    .filter((entry): entry is FollowUpTask => entry !== null);
}

const DEFAULT_FOLLOW_UP_TASKS: FollowUpTask[] = [
  {
    id: 'fup-default-neurosurgeon',
    title: 'Консультація нейрохірурга (динаміка L4–L5 та L5–S1)',
    targetDate: '2026-11',
    completed: false,
    createdAt: '2026-10-20T09:00:00.000Z',
  },
  {
    id: 'fup-default-enmg',
    title: 'ЕНМГ правої верхньої кінцівки / оцінка правого трапецієподібного м’яза',
    targetDate: '2026-11',
    completed: false,
    createdAt: '2026-10-20T09:05:00.000Z',
  },
  {
    id: 'fup-default-mri-control',
    title: 'Контроль МРТ грудного відділу (гемангіома D6 / D4–D5)',
    targetDate: '2027-04',
    completed: false,
    createdAt: '2026-10-20T09:10:00.000Z',
  },
];

function normalizeRawJsonToState(raw: RawMedicalCardJson): StoredState {
  const attachments = normalizeAttachmentsList(raw.attachments_and_links);
  const treatments = normalizeTreatmentsList(raw.treatments);
  const followUpPlan = Array.isArray(raw.follow_up_plan)
    ? normalizeFollowUpList(raw.follow_up_plan)
    : DEFAULT_FOLLOW_UP_TASKS;
  const linkedRecordIds = new Set([
    ...attachments.map((a) => a.linkedRecordId).filter((id): id is string => Boolean(id)),
    ...treatments.map((tr) => tr.linkedRecordId).filter((id): id is string => Boolean(id)),
  ]);

  const parsedRecords =
    Array.isArray(raw.extended_records) && raw.extended_records.length > 0
      ? raw.extended_records
      : parseOtherRecordsIndex(Array.isArray(raw.other_records_index) ? raw.other_records_index : []);

  const baseRecords = migrateSplitSpineMriRecords(parsedRecords, linkedRecordIds);

  return {
    rawMeta: raw.meta || ANONYMIZED_DEFAULT_MEDICAL_CARD.meta,
    profile: { ...ANONYMIZED_DEFAULT_MEDICAL_CARD.patient_profile, ...(raw.patient_profile || {}) },
    complaints: {
      ...ANONYMIZED_DEFAULT_MEDICAL_CARD.complaints_by_zone,
      ...(raw.complaints_by_zone || {}),
    },
    sorMeta: {
      ...ANONYMIZED_DEFAULT_MEDICAL_CARD.sor_spine_mri_comparison,
      ...(raw.sor_spine_mri_comparison || {}),
    },
    records: baseRecords,
    attachments,
    treatments,
    followUpPlan,
  };
}

function safeMergeStoredState(parsed: Partial<StoredState> | null | undefined): StoredState {
  const defaults = normalizeRawJsonToState(ANONYMIZED_DEFAULT_MEDICAL_CARD);
  if (!parsed || typeof parsed !== 'object') {
    return defaults;
  }

  // Never overwrite existing user attachments, treatments, or follow-up checklist during schema updates
  const preservedAttachments = Array.isArray(parsed.attachments)
    ? normalizeAttachmentsList(parsed.attachments)
    : defaults.attachments;

  const preservedTreatments = Array.isArray(parsed.treatments)
    ? normalizeTreatmentsList(parsed.treatments)
    : defaults.treatments;

  const preservedFollowUp = Array.isArray(parsed.followUpPlan)
    ? normalizeFollowUpList(parsed.followUpPlan)
    : defaults.followUpPlan;

  const linkedRecordIds = new Set([
    ...preservedAttachments.map((a) => a.linkedRecordId).filter((id): id is string => Boolean(id)),
    ...preservedTreatments.map((tr) => tr.linkedRecordId).filter((id): id is string => Boolean(id)),
  ]);

  const mergedRecords =
    Array.isArray(parsed.records) && parsed.records.length > 0
      ? migrateSplitSpineMriRecords(parsed.records, linkedRecordIds)
      : defaults.records;

  return {
    rawMeta: parsed.rawMeta ? { ...defaults.rawMeta, ...parsed.rawMeta } : defaults.rawMeta,
    profile: parsed.profile ? { ...defaults.profile, ...parsed.profile } : defaults.profile,
    complaints: parsed.complaints
      ? { ...defaults.complaints, ...parsed.complaints }
      : defaults.complaints,
    sorMeta: parsed.sorMeta ? { ...defaults.sorMeta, ...parsed.sorMeta } : defaults.sorMeta,
    records: mergedRecords,
    attachments: preservedAttachments,
    treatments: preservedTreatments,
    followUpPlan: preservedFollowUp,
  };
}

export const MedicalArchiveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(LANG_STORAGE_KEY);
      if (saved === 'uk' || saved === 'ru' || saved === 'en') return saved;
    } catch {
      // Ignore storage errors
    }
    return 'uk';
  });

  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'dark' || saved === 'light') return saved;
    } catch {
      // Ignore storage errors
    }
    return 'light';
  });

  const [privacyMode, setPrivacyModeState] = useState<boolean>(() => {
    try {
      return localStorage.getItem(PRIVACY_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [activeSection, setActiveSection] = useState<NavSection>('mri');
  const [selectedMriSegment, setSelectedMriSegment] = useState<string>('L4-L5');
  const [atlas3dScene, setAtlas3dScene] = useState<AtlasSceneMode>('spine');
  const [atlasFocusNonce, setAtlasFocusNonce] = useState<number>(0);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const [state, setState] = useState<StoredState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<StoredState>;
        return safeMergeStoredState(parsed);
      }
    } catch {
      // Fall back to anonymized defaults
    }
    return normalizeRawJsonToState(ANONYMIZED_DEFAULT_MEDICAL_CARD);
  });

  const [securityState, setSecurityState] = useState<StoredSecurityState>(() => {
    try {
      const saved = localStorage.getItem(SECURITY_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<StoredSecurityState>;
        return {
          pinAuth: isValidPinHashRecord(parsed.pinAuth) ? parsed.pinAuth : null,
          encryptedVault: isValidEncryptedVaultPayload(parsed.encryptedVault)
            ? parsed.encryptedVault
            : null,
        };
      }
    } catch {
      // Ignore storage errors
    }
    return { pinAuth: null, encryptedVault: null };
  });

  // Decrypted vault items and active PIN exist strictly in React memory (never persisted)
  const [vaultUnlocked, setVaultUnlocked] = useState<boolean>(false);
  const [vaultItems, setVaultItems] = useState<PersonalVaultItem[]>([]);
  const [pinModalRequest, setPinModalRequest] = useState<PinModalMode | null>(null);
  const activePinRef = useRef<string | null>(null);

  const hasPin = Boolean(securityState.pinAuth);
  const hasEncryptedVault = Boolean(
    securityState.encryptedVault && (securityState.encryptedVault.itemCount ?? 1) > 0,
  );
  const encryptedVaultCount = securityState.encryptedVault?.itemCount ?? 0;

  useEffect(() => {
    try {
      localStorage.setItem(SECURITY_STORAGE_KEY, JSON.stringify(securityState));
    } catch {
      // Ignore quota errors
    }
  }, [securityState]);

  const toastTimerRef = useRef<number | null>(null);
  const stateRef = useRef<StoredState>(state);
  stateRef.current = state;

  const dismissToast = useCallback(() => {
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    setToast(null);
  }, []);

  const showToast = useCallback(
    (text: string, tone: ToastMessage['tone'] = 'info', options?: ShowToastOptions) => {
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current);
        toastTimerRef.current = null;
      }
      const id = Date.now() + Math.random();
      const duration = options?.durationMs ?? 3200;
      setToast({
        id,
        text,
        tone,
        actionLabel: options?.actionLabel,
        onAction: options?.onAction,
      });
      toastTimerRef.current = window.setTimeout(() => {
        setToast((prev) => (prev && prev.id === id ? null : prev));
        toastTimerRef.current = null;
      }, duration);
    },
    [],
  );

  // Persist medical archive state strictly in browser localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore quota errors
    }
  }, [state]);

  // Sync Tailwind dark class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore storage errors
    }
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch {
      // Ignore storage errors
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const persistPrivacyMode = useCallback((next: boolean) => {
    setPrivacyModeState(next);
    try {
      localStorage.setItem(PRIVACY_STORAGE_KEY, String(next));
    } catch {
      // Ignore storage errors
    }
  }, []);

  const clearVaultMemory = useCallback(() => {
    activePinRef.current = null;
    setVaultUnlocked(false);
    setVaultItems([]);
  }, []);

  const lockVault = useCallback(() => {
    clearVaultMemory();
    showToast(UI_DICT[language].privacyVault.vaultLockedToast, 'info');
  }, [clearVaultMemory, language, showToast]);

  const togglePrivacyMode = useCallback(() => {
    if (!privacyMode) {
      // Turning ON Privacy Mode always works in 1 click and immediately locks Personal Vault
      persistPrivacyMode(true);
      clearVaultMemory();
      showToast(UI_DICT[language].privacyVault.privacyEnabledToast, 'info');
      return;
    }

    // Turning OFF Privacy Mode requires PIN if one is configured
    if (securityState.pinAuth) {
      setPinModalRequest('disable_privacy');
      return;
    }

    persistPrivacyMode(false);
  }, [privacyMode, securityState.pinAuth, persistPrivacyMode, clearVaultMemory, language, showToast]);

  const requestUnlockVault = useCallback(() => {
    if (!securityState.pinAuth) return;
    setPinModalRequest(privacyMode ? 'disable_privacy' : 'unlock_vault');
  }, [securityState.pinAuth, privacyMode]);

  const closePinModal = useCallback(() => {
    setPinModalRequest(null);
  }, []);

  const verifyAndUnlockWithPin = useCallback(
    async (pin: string): Promise<{ ok: boolean; error?: string }> => {
      const trimmed = pin.trim();
      if (!securityState.pinAuth) {
        setPinModalRequest(null);
        persistPrivacyMode(false);
        return { ok: true };
      }

      const valid = await verifyPinSha256(trimmed, securityState.pinAuth);
      if (!valid) {
        return { ok: false, error: UI_DICT[language].privacyVault.pinWrongError };
      }

      // Decrypt vault if encrypted payload exists
      let decryptedItems: PersonalVaultItem[] = [];
      if (securityState.encryptedVault) {
        try {
          decryptedItems = await decryptVaultItems(securityState.encryptedVault, trimmed);
        } catch {
          return { ok: false, error: UI_DICT[language].privacyVault.pinWrongError };
        }
      }

      const wasDisablingPrivacy = privacyMode || pinModalRequest === 'disable_privacy';
      activePinRef.current = trimmed;
      setVaultItems(decryptedItems);
      setVaultUnlocked(true);
      setPinModalRequest(null);

      if (wasDisablingPrivacy) {
        persistPrivacyMode(false);
        showToast(UI_DICT[language].privacyVault.privacyUnlockedToast, 'success');
      } else {
        showToast(UI_DICT[language].privacyVault.vaultUnlockedToast, 'success');
      }

      return { ok: true };
    },
    [securityState, language, privacyMode, pinModalRequest, persistPrivacyMode, showToast],
  );

  const setupPin = useCallback(
    async (newPin: string): Promise<{ ok: boolean; error?: string }> => {
      const trimmed = newPin.trim();
      if (trimmed.length < 4) {
        return { ok: false, error: UI_DICT[language].privacyVault.pinMinLengthError };
      }

      const pinRecord = await hashPinSha256(trimmed);
      setSecurityState((prev) => ({ ...prev, pinAuth: pinRecord }));

      if (!privacyMode) {
        activePinRef.current = trimmed;
        setVaultUnlocked(true);
        setVaultItems([]);
      }

      showToast(UI_DICT[language].privacyVault.pinSavedToast, 'success');
      return { ok: true };
    },
    [language, privacyMode, showToast],
  );

  const changePin = useCallback(
    async (currentPin: string, newPin: string): Promise<{ ok: boolean; error?: string }> => {
      const cur = currentPin.trim();
      const next = newPin.trim();
      if (!securityState.pinAuth) {
        return setupPin(next);
      }
      if (next.length < 4) {
        return { ok: false, error: UI_DICT[language].privacyVault.pinMinLengthError };
      }

      const valid = await verifyPinSha256(cur, securityState.pinAuth);
      if (!valid) {
        return { ok: false, error: UI_DICT[language].privacyVault.pinWrongError };
      }

      // Decrypt existing vault (if any) with current PIN, then re-encrypt with new PIN
      let itemsToReencrypt: PersonalVaultItem[] = vaultUnlocked ? vaultItems : [];
      if (!vaultUnlocked && securityState.encryptedVault) {
        try {
          itemsToReencrypt = await decryptVaultItems(securityState.encryptedVault, cur);
        } catch {
          return { ok: false, error: UI_DICT[language].privacyVault.pinWrongError };
        }
      }

      const nextPinRecord = await hashPinSha256(next);
      const nextEncryptedVault =
        itemsToReencrypt.length > 0 || securityState.encryptedVault
          ? await encryptVaultItems(itemsToReencrypt, next)
          : null;

      setSecurityState({
        pinAuth: nextPinRecord,
        encryptedVault: nextEncryptedVault,
      });

      if (vaultUnlocked && !privacyMode) {
        activePinRef.current = next;
        setVaultItems(itemsToReencrypt);
      }

      showToast(UI_DICT[language].privacyVault.pinChangedToast, 'success');
      return { ok: true };
    },
    [securityState, vaultUnlocked, vaultItems, privacyMode, language, setupPin, showToast],
  );

  const removePin = useCallback(
    async (currentPin: string): Promise<{ ok: boolean; error?: string }> => {
      const cur = currentPin.trim();
      if (!securityState.pinAuth) {
        return { ok: true };
      }

      const valid = await verifyPinSha256(cur, securityState.pinAuth);
      if (!valid) {
        return { ok: false, error: UI_DICT[language].privacyVault.pinWrongError };
      }

      // Never store vault data unencrypted: clear encrypted vault when disabling PIN protection
      setSecurityState({ pinAuth: null, encryptedVault: null });
      clearVaultMemory();
      if (privacyMode) {
        persistPrivacyMode(false);
      }
      showToast(UI_DICT[language].privacyVault.pinRemovedToast, 'info');
      return { ok: true };
    },
    [securityState.pinAuth, language, clearVaultMemory, privacyMode, persistPrivacyMode, showToast],
  );

  const persistEncryptedVaultItems = useCallback(
    async (nextItems: PersonalVaultItem[]): Promise<boolean> => {
      const pin = activePinRef.current;
      if (!pin || privacyMode || !vaultUnlocked) {
        return false;
      }
      const encrypted = await encryptVaultItems(nextItems, pin);
      setVaultItems(nextItems);
      setSecurityState((prev) => ({
        ...prev,
        encryptedVault: encrypted,
      }));
      return true;
    },
    [privacyMode, vaultUnlocked],
  );

  const addVaultItem = useCallback(
    async (item: Omit<PersonalVaultItem, 'id' | 'updatedAt'>): Promise<boolean> => {
      const nextItem: PersonalVaultItem = {
        ...item,
        id: `vault-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        updatedAt: new Date().toISOString(),
      };
      const ok = await persistEncryptedVaultItems([nextItem, ...vaultItems]);
      if (ok) {
        showToast(UI_DICT[language].jsonModal.savedToast, 'success');
      }
      return ok;
    },
    [vaultItems, persistEncryptedVaultItems, language, showToast],
  );

  const updateVaultItem = useCallback(
    async (
      id: string,
      next: Partial<Omit<PersonalVaultItem, 'id' | 'updatedAt'>>,
    ): Promise<boolean> => {
      const nextItems = vaultItems.map((entry) =>
        entry.id === id ? { ...entry, ...next, updatedAt: new Date().toISOString() } : entry,
      );
      const ok = await persistEncryptedVaultItems(nextItems);
      if (ok) {
        showToast(UI_DICT[language].jsonModal.savedToast, 'success');
      }
      return ok;
    },
    [vaultItems, persistEncryptedVaultItems, language, showToast],
  );

  const deleteVaultItem = useCallback(
    async (id: string): Promise<boolean> => {
      const nextItems = vaultItems.filter((entry) => entry.id !== id);
      const ok = await persistEncryptedVaultItems(nextItems);
      if (ok) {
        showToast(UI_DICT[language].jsonModal.deletedToast, 'info');
      }
      return ok;
    },
    [vaultItems, persistEncryptedVaultItems, language, showToast],
  );

  const t = useMemo(() => UI_DICT[language], [language]);

  const jumpToMriSegment = useCallback((segmentId: string) => {
    setSelectedMriSegment(segmentId);
    setActiveSection('mri');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const jumpTo3DAtlasSegment = useCallback((segmentId: string) => {
    setSelectedMriSegment(segmentId);
    setAtlas3dScene('spine');
    setAtlasFocusNonce((n) => n + 1);
    setActiveSection('atlas3d');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const updateProfile = useCallback(
    (next: PatientProfile) => {
      setState((prev) => ({ ...prev, profile: next }));
      showToast(UI_DICT[language].jsonModal.savedToast, 'success');
    },
    [language, showToast],
  );

  const updateComplaint = useCallback(
    (key: ComplaintZoneKey, next: ComplaintZone) => {
      setState((prev) => ({
        ...prev,
        complaints: { ...prev.complaints, [key]: next },
      }));
      showToast(UI_DICT[language].jsonModal.savedToast, 'success');
    },
    [language, showToast],
  );

  const addRecord = useCallback(
    (record: Omit<MedicalExamRecord, 'id'>): string => {
      const id = `rec-custom-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
      setState((prev) => ({
        ...prev,
        records: [{ ...record, id, isCustom: true }, ...prev.records],
      }));
      showToast(UI_DICT[language].jsonModal.savedToast, 'success');
      return id;
    },
    [language, showToast],
  );

  const updateRecord = useCallback(
    (id: string, next: Partial<MedicalExamRecord>) => {
      setState((prev) => ({
        ...prev,
        records: prev.records.map((r) => (r.id === id ? { ...r, ...next } : r)),
      }));
      showToast(UI_DICT[language].jsonModal.savedToast, 'success');
    },
    [language, showToast],
  );

  const deleteRecord = useCallback(
    (id: string) => {
      const idx = stateRef.current.records.findIndex((r) => r.id === id);
      const removed = idx >= 0 ? stateRef.current.records[idx] : null;
      setState((prev) => ({
        ...prev,
        records: prev.records.filter((r) => r.id !== id),
      }));
      if (removed) {
        showToast(UI_DICT[language].undo.deletedToast, 'info', {
          durationMs: 5000,
          actionLabel: UI_DICT[language].undo.undoBtn,
          onAction: () => {
            setState((prev) => {
              if (prev.records.some((r) => r.id === removed.id)) return prev;
              const next = [...prev.records];
              next.splice(Math.min(idx, next.length), 0, removed);
              return { ...prev, records: next };
            });
            showToast(UI_DICT[language].undo.restoredToast, 'success');
          },
        });
      }
    },
    [language, showToast],
  );

  const addTreatment = useCallback(
    (course: Omit<TreatmentCourse, 'id'>): string => {
      const id = `trt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setState((prev) => ({
        ...prev,
        treatments: [{ ...course, id }, ...prev.treatments],
      }));
      showToast(UI_DICT[language].jsonModal.savedToast, 'success');
      return id;
    },
    [language, showToast],
  );

  const updateTreatment = useCallback(
    (id: string, next: Partial<TreatmentCourse>) => {
      setState((prev) => ({
        ...prev,
        treatments: prev.treatments.map((tr) => (tr.id === id ? { ...tr, ...next } : tr)),
      }));
      showToast(UI_DICT[language].jsonModal.savedToast, 'success');
    },
    [language, showToast],
  );

  const deleteTreatment = useCallback(
    (id: string) => {
      const idx = stateRef.current.treatments.findIndex((tr) => tr.id === id);
      const removed = idx >= 0 ? stateRef.current.treatments[idx] : null;
      setState((prev) => ({
        ...prev,
        treatments: prev.treatments.filter((tr) => tr.id !== id),
      }));
      if (removed) {
        showToast(UI_DICT[language].undo.deletedToast, 'info', {
          durationMs: 5000,
          actionLabel: UI_DICT[language].undo.undoBtn,
          onAction: () => {
            setState((prev) => {
              if (prev.treatments.some((tr) => tr.id === removed.id)) return prev;
              const next = [...prev.treatments];
              next.splice(Math.min(idx, next.length), 0, removed);
              return { ...prev, treatments: next };
            });
            showToast(UI_DICT[language].undo.restoredToast, 'success');
          },
        });
      }
    },
    [language, showToast],
  );

  const addAttachment = useCallback(
    (item: Omit<AttachmentLink, 'id'>) => {
      const id = `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setState((prev) => ({
        ...prev,
        attachments: [{ ...item, id }, ...prev.attachments],
      }));
      showToast(UI_DICT[language].jsonModal.savedToast, 'success');
    },
    [language, showToast],
  );

  const addAttachmentsBatch = useCallback(
    (items: Omit<AttachmentLink, 'id'>[]) => {
      const created = items.map((item, idx) => ({
        ...item,
        id: `att-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 5)}`,
      }));
      setState((prev) => ({
        ...prev,
        attachments: [...created, ...prev.attachments],
      }));
      showToast(UI_DICT[language].jsonModal.savedToast, 'success');
    },
    [language, showToast],
  );

  const updateAttachment = useCallback(
    (id: string, next: Partial<AttachmentLink>) => {
      setState((prev) => ({
        ...prev,
        attachments: prev.attachments.map((a) => (a.id === id ? { ...a, ...next } : a)),
      }));
      showToast(UI_DICT[language].jsonModal.savedToast, 'success');
    },
    [language, showToast],
  );

  const deleteAttachment = useCallback(
    (id: string) => {
      const idx = stateRef.current.attachments.findIndex((a) => a.id === id);
      const removed = idx >= 0 ? stateRef.current.attachments[idx] : null;
      setState((prev) => ({
        ...prev,
        attachments: prev.attachments.filter((a) => a.id !== id),
      }));
      if (removed) {
        showToast(UI_DICT[language].undo.deletedToast, 'info', {
          durationMs: 5000,
          actionLabel: UI_DICT[language].undo.undoBtn,
          onAction: () => {
            setState((prev) => {
              if (prev.attachments.some((a) => a.id === removed.id)) return prev;
              const next = [...prev.attachments];
              next.splice(Math.min(idx, next.length), 0, removed);
              return { ...prev, attachments: next };
            });
            showToast(UI_DICT[language].undo.restoredToast, 'success');
          },
        });
      }
    },
    [language, showToast],
  );

  const addFollowUpTask = useCallback(
    (title: string, targetDate: string) => {
      const cleanTitle = title.trim();
      if (!cleanTitle) return;
      const newTask: FollowUpTask = {
        id: `fup-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: cleanTitle,
        targetDate: targetDate.trim(),
        completed: false,
        createdAt: new Date().toISOString(),
      };
      setState((prev) => ({
        ...prev,
        followUpPlan: [newTask, ...prev.followUpPlan],
      }));
      showToast(UI_DICT[language].jsonModal.savedToast, 'success');
    },
    [language, showToast],
  );

  const toggleFollowUpTask = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      followUpPlan: prev.followUpPlan.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    }));
  }, []);

  const deleteFollowUpTask = useCallback(
    (id: string) => {
      const idx = stateRef.current.followUpPlan.findIndex((task) => task.id === id);
      const removed = idx >= 0 ? stateRef.current.followUpPlan[idx] : null;
      setState((prev) => ({
        ...prev,
        followUpPlan: prev.followUpPlan.filter((task) => task.id !== id),
      }));
      if (removed) {
        showToast(UI_DICT[language].undo.deletedToast, 'info', {
          durationMs: 5000,
          actionLabel: UI_DICT[language].undo.undoBtn,
          onAction: () => {
            setState((prev) => {
              if (prev.followUpPlan.some((task) => task.id === removed.id)) return prev;
              const next = [...prev.followUpPlan];
              next.splice(Math.min(idx, next.length), 0, removed);
              return { ...prev, followUpPlan: next };
            });
            showToast(UI_DICT[language].undo.restoredToast, 'success');
          },
        });
      }
    },
    [language, showToast],
  );

  const exportJsonFile = useCallback(() => {
    const today = new Date().toISOString().slice(0, 10);
    const payload: RawMedicalCardJson = {
      meta: {
        ...state.rawMeta,
        exported_at: today,
      },
      patient_profile: state.profile,
      complaints_by_zone: state.complaints,
      sor_spine_mri_comparison: state.sorMeta,
      other_records_index: state.records.map((r) =>
        r.isCustom
          ? r.date && r.date !== '—'
            ? `${r.title.uk} (${r.date})`
            : r.title.uk
          : r.originalIndexTitle,
      ),
      attachments_and_links: state.attachments,
      extended_records: state.records,
      treatments: state.treatments,
      follow_up_plan: state.followUpPlan,
      // Export strictly SHA-256 PIN hash and AES-GCM encrypted vault ciphertext (never plaintext)
      ...(securityState.pinAuth ? { privacy_security: securityState.pinAuth } : {}),
      ...(securityState.encryptedVault
        ? { encrypted_personal_vault: securityState.encryptedVault }
        : {}),
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `medical_card_${today}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(UI_DICT[language].jsonModal.exportSuccess, 'success');
  }, [state, securityState, language, showToast]);

  const importJsonString = useCallback(
    (jsonText: string): { ok: boolean; error?: string } => {
      try {
        const parsed = JSON.parse(jsonText) as RawMedicalCardJson;
        if (!parsed || typeof parsed !== 'object' || !parsed.patient_profile || !parsed.complaints_by_zone) {
          return { ok: false, error: UI_DICT[language].jsonModal.importError };
        }
        const normalized = normalizeRawJsonToState(parsed);
        setState((prev) => ({
          ...normalized,
          // Preserve existing user attachments/treatments/follow-up plan if imported JSON omits them
          attachments:
            Array.isArray(parsed.attachments_and_links) && parsed.attachments_and_links.length > 0
              ? normalized.attachments
              : prev.attachments,
          treatments:
            Array.isArray(parsed.treatments) && parsed.treatments.length > 0
              ? normalized.treatments
              : prev.treatments,
          followUpPlan: Array.isArray(parsed.follow_up_plan)
            ? normalized.followUpPlan
            : prev.followUpPlan,
        }));

        // Restore encrypted vault & PIN hash if present in imported JSON; otherwise preserve local security state
        const importedPin = isValidPinHashRecord(parsed.privacy_security)
          ? parsed.privacy_security
          : null;
        const importedVault = isValidEncryptedVaultPayload(parsed.encrypted_personal_vault)
          ? parsed.encrypted_personal_vault
          : null;

        if (importedPin || importedVault) {
          setSecurityState((prev) => ({
            pinAuth: importedPin ?? prev.pinAuth,
            encryptedVault: importedVault ?? prev.encryptedVault,
          }));
          // Always lock vault on import so user unlocks with PIN
          clearVaultMemory();
        }

        showToast(UI_DICT[language].jsonModal.importSuccess, 'success');
        return { ok: true };
      } catch {
        return { ok: false, error: UI_DICT[language].jsonModal.importError };
      }
    },
    [language, showToast, clearVaultMemory],
  );

  const resetToInitialJson = useCallback(() => {
    const normalized = normalizeRawJsonToState(ANONYMIZED_DEFAULT_MEDICAL_CARD);
    setState(normalized);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
    showToast(UI_DICT[language].jsonModal.resetSuccess, 'success');
  }, [language, showToast]);

  const value: MedicalArchiveContextValue = {
    language,
    setLanguage,
    theme,
    toggleTheme,
    privacyMode,
    togglePrivacyMode,
    t,
    activeSection,
    setActiveSection,
    selectedMriSegment,
    setSelectedMriSegment,
    jumpToMriSegment,
    atlas3dScene,
    setAtlas3dScene,
    atlasFocusNonce,
    jumpTo3DAtlasSegment,
    meta: state.rawMeta,
    profile: state.profile,
    complaints: state.complaints,
    sorMeta: state.sorMeta,
    records: state.records,
    attachments: state.attachments,
    treatments: state.treatments,
    followUpPlan: state.followUpPlan,
    updateProfile,
    updateComplaint,
    addRecord,
    updateRecord,
    deleteRecord,
    addTreatment,
    updateTreatment,
    deleteTreatment,
    addAttachment,
    addAttachmentsBatch,
    updateAttachment,
    deleteAttachment,
    addFollowUpTask,
    toggleFollowUpTask,
    deleteFollowUpTask,
    exportJsonFile,
    importJsonString,
    resetToInitialJson,
    toast,
    showToast,
    dismissToast,
    hasPin,
    hasEncryptedVault,
    encryptedVaultCount,
    vaultUnlocked: !privacyMode && vaultUnlocked,
    vaultItems: !privacyMode && vaultUnlocked ? vaultItems : [],
    pinModalRequest,
    closePinModal,
    requestUnlockVault,
    lockVault,
    verifyAndUnlockWithPin,
    setupPin,
    changePin,
    removePin,
    addVaultItem,
    updateVaultItem,
    deleteVaultItem,
  };

  return <MedicalArchiveContext.Provider value={value}>{children}</MedicalArchiveContext.Provider>;
};

export function useMedicalArchive(): MedicalArchiveContextValue {
  const ctx = useContext(MedicalArchiveContext);
  if (!ctx) throw new Error('useMedicalArchive must be used inside MedicalArchiveProvider');
  return ctx;
}
