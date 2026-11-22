import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  AttachmentLink,
  ComplaintZone,
  ComplaintZoneKey,
  Language,
  MedicalExamRecord,
  NavSection,
  PatientProfile,
  RawMedicalCardJson,
} from '../types/medical';
import {
  ANONYMIZED_DEFAULT_MEDICAL_CARD,
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
  meta: RawMedicalCardJson['meta'];
  profile: PatientProfile;
  complaints: Record<ComplaintZoneKey, ComplaintZone>;
  sorMeta: RawMedicalCardJson['sor_spine_mri_comparison'];
  records: MedicalExamRecord[];
  attachments: AttachmentLink[];
  updateProfile: (next: PatientProfile) => void;
  updateComplaint: (key: ComplaintZoneKey, next: ComplaintZone) => void;
  addRecord: (record: Omit<MedicalExamRecord, 'id'>) => void;
  updateRecord: (id: string, next: Partial<MedicalExamRecord>) => void;
  deleteRecord: (id: string) => void;
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

function normalizeRawJsonToState(raw: RawMedicalCardJson): StoredState {
  const baseRecords =
    Array.isArray(raw.extended_records) && raw.extended_records.length > 0
      ? raw.extended_records
      : parseOtherRecordsIndex(Array.isArray(raw.other_records_index) ? raw.other_records_index : []);

  const attachments: AttachmentLink[] = Array.isArray(raw.attachments_and_links)
    ? raw.attachments_and_links.map((item, idx) => ({
        id: item.id || `att-${Date.now()}-${idx}`,
        title: item.title || item.url || 'Link',
        url: item.url || '',
        source: item.source || 'other',
        date: item.date || '',
        linkedSegment: item.linkedSegment || '',
        linkedRecordId: item.linkedRecordId || '',
        notes: item.notes || '',
      }))
    : [];

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
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const [state, setState] = useState<StoredState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as StoredState;
        if (parsed && parsed.profile && parsed.complaints && Array.isArray(parsed.records)) {
          return parsed;
        }
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
    (record: Omit<MedicalExamRecord, 'id'>) => {
      const id = `rec-custom-${Date.now()}`;
      setState((prev) => ({
        ...prev,
        records: [{ ...record, id, isCustom: true }, ...prev.records],
      }));
      showToast(UI_DICT[language].jsonModal.savedToast, 'success');
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
        setState(normalized);
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
    meta: state.rawMeta,
    profile: state.profile,
    complaints: state.complaints,
    sorMeta: state.sorMeta,
    records: state.records,
    attachments: state.attachments,
    updateProfile,
    updateComplaint,
    addRecord,
    updateRecord,
    deleteRecord,
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
