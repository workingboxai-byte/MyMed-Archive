import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  AtlasSceneMode,
  AttachmentLink,
  ComplaintZone,
  ComplaintZoneKey,
  Language,
  MedicalExamRecord,
  NavSection,
  PatientProfile,
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

const STORAGE_KEY = 'med_card_archive_state_v2';
const LANG_STORAGE_KEY = 'med_card_archive_lang_v2';
const THEME_STORAGE_KEY = 'med_card_archive_theme_v2';
const PRIVACY_STORAGE_KEY = 'med_card_archive_privacy_v2';

export type ThemeMode = 'light' | 'dark';

interface StoredState {
  rawMeta: RawMedicalCardJson['meta'];
  profile: PatientProfile;
  complaints: Record<ComplaintZoneKey, ComplaintZone>;
  sorMeta: RawMedicalCardJson['sor_spine_mri_comparison'];
  records: MedicalExamRecord[];
  attachments: AttachmentLink[];
  treatments: TreatmentCourse[];
}

export interface ToastMessage {
  id: number;
  text: string;
  tone: 'info' | 'success' | 'error';
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
  exportJsonFile: () => void;
  importJsonString: (jsonText: string) => { ok: boolean; error?: string };
  resetToInitialJson: () => void;
  toast: ToastMessage | null;
  showToast: (text: string, tone?: ToastMessage['tone']) => void;
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

function normalizeRawJsonToState(raw: RawMedicalCardJson): StoredState {
  const attachments = normalizeAttachmentsList(raw.attachments_and_links);
  const treatments = normalizeTreatmentsList(raw.treatments);
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
  };
}

function safeMergeStoredState(parsed: Partial<StoredState> | null | undefined): StoredState {
  const defaults = normalizeRawJsonToState(ANONYMIZED_DEFAULT_MEDICAL_CARD);
  if (!parsed || typeof parsed !== 'object') {
    return defaults;
  }

  // Never overwrite existing user attachments or treatments with an empty template during schema updates
  const preservedAttachments = Array.isArray(parsed.attachments)
    ? normalizeAttachmentsList(parsed.attachments)
    : defaults.attachments;

  const preservedTreatments = Array.isArray(parsed.treatments)
    ? normalizeTreatmentsList(parsed.treatments)
    : defaults.treatments;

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

  const showToast = useCallback((text: string, tone: ToastMessage['tone'] = 'info') => {
    const id = Date.now();
    setToast({ id, text, tone });
    window.setTimeout(() => {
      setToast((prev) => (prev && prev.id === id ? null : prev));
    }, 3200);
  }, []);

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

  const togglePrivacyMode = useCallback(() => {
    setPrivacyModeState((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(PRIVACY_STORAGE_KEY, String(next));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  }, []);

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
      setState((prev) => ({
        ...prev,
        records: prev.records.filter((r) => r.id !== id),
      }));
      showToast(UI_DICT[language].jsonModal.deletedToast, 'info');
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
      setState((prev) => ({
        ...prev,
        treatments: prev.treatments.filter((tr) => tr.id !== id),
      }));
      showToast(UI_DICT[language].jsonModal.deletedToast, 'info');
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
      setState((prev) => ({
        ...prev,
        attachments: prev.attachments.filter((a) => a.id !== id),
      }));
      showToast(UI_DICT[language].jsonModal.deletedToast, 'info');
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
  }, [state, language, showToast]);

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
          // Preserve existing user attachments/treatments if imported JSON omits or has an empty array
          attachments:
            Array.isArray(parsed.attachments_and_links) && parsed.attachments_and_links.length > 0
              ? normalized.attachments
              : prev.attachments,
          treatments:
            Array.isArray(parsed.treatments) && parsed.treatments.length > 0
              ? normalized.treatments
              : prev.treatments,
        }));
        showToast(UI_DICT[language].jsonModal.importSuccess, 'success');
        return { ok: true };
      } catch {
        return { ok: false, error: UI_DICT[language].jsonModal.importError };
      }
    },
    [language, showToast],
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
    exportJsonFile,
    importJsonString,
    resetToInitialJson,
    toast,
    showToast,
  };

  return <MedicalArchiveContext.Provider value={value}>{children}</MedicalArchiveContext.Provider>;
};

export function useMedicalArchive(): MedicalArchiveContextValue {
  const ctx = useContext(MedicalArchiveContext);
  if (!ctx) throw new Error('useMedicalArchive must be used inside MedicalArchiveProvider');
  return ctx;
}
