import React, { useState } from 'react';
import {
  Shield,
  ShieldCheck,
  Lock,
  Unlock,
  KeyRound,
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  X,
  AlertCircle,
  EyeOff,
  FileLock2,
} from 'lucide-react';
import { useMedicalArchive } from '../context/MedicalArchiveContext';
import { PersonalVaultItem, VaultItemCategory } from '../types/medical';
import { isSafeHttpUrl, parseAndValidateVaultUrls } from '../utils/privacyCrypto';
import { ConfirmModal } from './ConfirmModal';

type PinFormMode = 'closed' | 'setup' | 'change' | 'remove';

interface ProfilePinSecurityPanelProps {
  externalTriggerMode?: 'setup' | null;
  onExternalTriggerHandled?: () => void;
}

export const ProfilePinSecurityPanel: React.FC<ProfilePinSecurityPanelProps> = ({
  externalTriggerMode,
  onExternalTriggerHandled,
}) => {
  const { t, hasPin, hasEncryptedVault, setupPin, changePin, removePin } = useMedicalArchive();
  const [formMode, setFormMode] = useState<PinFormMode>('closed');
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    if (externalTriggerMode === 'setup') {
      setFormMode(hasPin ? 'change' : 'setup');
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
      setError(null);
      onExternalTriggerHandled?.();
    }
  }, [externalTriggerMode, hasPin, onExternalTriggerHandled]);

  const openForm = (mode: PinFormMode) => {
    setFormMode(mode);
    setCurrentPin('');
    setNewPin('');
    setConfirmPin('');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);

    if (formMode === 'setup') {
      if (newPin.trim().length < 4) {
        setError(t.privacyVault.pinMinLengthError);
        return;
      }
      if (newPin.trim() !== confirmPin.trim()) {
        setError(t.privacyVault.pinMismatchError);
        return;
      }
      setSubmitting(true);
      try {
        const res = await setupPin(newPin);
        if (!res.ok) {
          setError(res.error || t.privacyVault.pinMinLengthError);
        } else {
          openForm('closed');
        }
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (formMode === 'change') {
      if (!currentPin.trim()) {
        setError(t.privacyVault.pinWrongError);
        return;
      }
      if (newPin.trim().length < 4) {
        setError(t.privacyVault.pinMinLengthError);
        return;
      }
      if (newPin.trim() !== confirmPin.trim()) {
        setError(t.privacyVault.pinMismatchError);
        return;
      }
      setSubmitting(true);
      try {
        const res = await changePin(currentPin, newPin);
        if (!res.ok) {
          setError(res.error || t.privacyVault.pinWrongError);
        } else {
          openForm('closed');
        }
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (formMode === 'remove') {
      if (!currentPin.trim()) {
        setError(t.privacyVault.pinWrongError);
        return;
      }
      setSubmitting(true);
      try {
        const res = await removePin(currentPin);
        if (!res.ok) {
          setError(res.error || t.privacyVault.pinWrongError);
        } else {
          openForm('closed');
        }
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <div
      id="profile-pin-security"
      className="mt-5 rounded-lg border border-slate-200/90 bg-slate-50/75 p-4 dark:border-slate-800 dark:bg-slate-950/50"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2.5">
          <div
            className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
              hasPin
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-400'
                : 'bg-slate-200/80 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {hasPin ? <ShieldCheck className="h-4 w-4" /> : <KeyRound className="h-4 w-4" />}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wide text-slate-800 dark:text-slate-100">
                {t.privacyVault.pinSectionTitle}
              </h3>
              <span
                className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                  hasPin
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                    : 'bg-slate-200/80 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                {hasPin ? t.privacyVault.pinStatusActive : t.privacyVault.pinStatusNotSet}
              </span>
            </div>
            <p className="mt-0.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              {t.privacyVault.pinSectionSubtitle}
            </p>
          </div>
        </div>

        {formMode === 'closed' && (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {!hasPin ? (
              <button
                type="button"
                onClick={() => openForm('setup')}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-700 whitespace-nowrap"
              >
                <KeyRound className="h-3.5 w-3.5" />
                {t.privacyVault.setPinBtn}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => openForm('change')}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 whitespace-nowrap"
                >
                  <KeyRound className="h-3.5 w-3.5" />
                  {t.privacyVault.changePinBtn}
                </button>
                <button
                  type="button"
                  onClick={() => openForm('remove')}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-100 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-950/70 whitespace-nowrap"
                >
                  <X className="h-3.5 w-3.5" />
                  {t.privacyVault.removePinBtn}
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {formMode !== 'closed' && (
        <form
          onSubmit={handleSubmit}
          className="mt-4 space-y-3 border-t border-slate-200 pt-3.5 dark:border-slate-800"
        >
          {formMode === 'remove' && (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                {t.privacyVault.removePinConfirmTitle}
              </div>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                {t.privacyVault.removePinConfirmBody}
              </p>
              {hasEncryptedVault && (
                <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  <span>{t.privacyVault.removePinWarningWithVault}</span>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {(formMode === 'change' || formMode === 'remove') && (
              <label className="block">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  {t.privacyVault.currentPinLabel}
                </span>
                <input
                  type="password"
                  value={currentPin}
                  onChange={(e) => {
                    setCurrentPin(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder={t.privacyVault.pinPlaceholder}
                  autoComplete="current-password"
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-mono text-sm tracking-widest text-slate-900 focus:border-sky-600 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
              </label>
            )}

            {(formMode === 'setup' || formMode === 'change') && (
              <>
                <label className="block">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    {t.privacyVault.newPinLabel}
                  </span>
                  <input
                    type="password"
                    value={newPin}
                    onChange={(e) => {
                      setNewPin(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder={t.privacyVault.pinPlaceholder}
                    autoComplete="new-password"
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-mono text-sm tracking-widest text-slate-900 focus:border-sky-600 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    {t.privacyVault.confirmPinLabel}
                  </span>
                  <input
                    type="password"
                    value={confirmPin}
                    onChange={(e) => {
                      setConfirmPin(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder={t.privacyVault.pinPlaceholder}
                    autoComplete="new-password"
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-mono text-sm tracking-widest text-slate-900 focus:border-sky-600 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  />
                </label>
              </>
            )}
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-300">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {t.privacyVault.pinHashHint}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => openForm('closed')}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                {t.actions.cancel}
              </button>
              <button
                type="submit"
                disabled={submitting}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold text-white transition-colors disabled:opacity-50 ${
                  formMode === 'remove'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-sky-600 hover:bg-sky-700'
                }`}
              >
                <Check className="h-3.5 w-3.5" />
                {formMode === 'remove' ? t.actions.confirm : t.actions.save}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

interface PersonalVaultCardProps {
  onRequestPinSetup: () => void;
}

const CATEGORY_BADGE_STYLE: Record<VaultItemCategory, string> = {
  vod: 'border-indigo-200 bg-indigo-50 text-indigo-800 dark:border-indigo-900/70 dark:bg-indigo-950/50 dark:text-indigo-300',
  vlk: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/70 dark:bg-amber-950/50 dark:text-amber-300',
  rezerv: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/70 dark:bg-emerald-950/50 dark:text-emerald-300',
  personal: 'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

const VAULT_CATEGORIES: VaultItemCategory[] = ['vod', 'vlk', 'rezerv', 'personal'];

export const PersonalVaultCard: React.FC<PersonalVaultCardProps> = ({ onRequestPinSetup }) => {
  const {
    t,
    privacyMode,
    hasPin,
    encryptedVaultCount,
    vaultUnlocked,
    vaultItems,
    requestUnlockVault,
    lockVault,
    addVaultItem,
    updateVaultItem,
    deleteVaultItem,
  } = useMedicalArchive();

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [category, setCategory] = useState<VaultItemCategory>('vod');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [urlsText, setUrlsText] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

  const isLocked = !hasPin || privacyMode || !vaultUnlocked;

  const resetForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setCategory('vod');
    setTitle('');
    setDate('');
    setUrlsText('');
    setNotes('');
    setFormError(null);
  };

  const openAddForm = () => {
    resetForm();
    setFormOpen(true);
  };

  const openEditForm = (item: PersonalVaultItem) => {
    setEditingId(item.id);
    setCategory(item.category);
    setTitle(item.title);
    setDate(item.date);
    setUrlsText(item.urls.join('\n'));
    setNotes(item.notes);
    setFormError(null);
    setFormOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setFormError(null);

    const parsedUrls = parseAndValidateVaultUrls(urlsText);
    if (parsedUrls.invalid.length > 0) {
      setFormError(t.privacyVault.itemInvalidUrlError);
      return;
    }

    const cleanTitle = title.trim();
    const cleanNotes = notes.trim();
    if (!cleanTitle && !cleanNotes && parsedUrls.valid.length === 0) {
      setFormError(t.privacyVault.itemValidationError);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        category,
        title: cleanTitle || t.privacyVault.categories[category],
        date: date.trim(),
        urls: parsedUrls.valid,
        notes: cleanNotes,
      };
      const ok = editingId
        ? await updateVaultItem(editingId, payload)
        : await addVaultItem(payload);
      if (ok) {
        resetForm();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      window.setTimeout(() => {
        setCopiedUrl((prev) => (prev === url ? null : prev));
      }, 1800);
    } catch {
      // Ignore clipboard failures
    }
  };

  return (
    <>
      <section className="rounded-xl border border-slate-300/90 bg-white p-5 shadow-sm dark:border-slate-700/90 dark:bg-slate-900 sm:p-6">
        {/* Vault Header */}
        <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 dark:border-slate-800 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div
              className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                isLocked
                  ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-400'
              }`}
            >
              {isLocked ? <FileLock2 className="h-4.5 w-4.5" /> : <Shield className="h-4.5 w-4.5" />}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {t.privacyVault.vaultTitle}
                </h2>
                <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-[10px] font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  <Lock className="h-2.5 w-2.5" />
                  {t.privacyVault.vaultAesBadge}
                </span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                {t.privacyVault.vaultSubtitle}
              </p>
              <div className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                <EyeOff className="h-3 w-3 shrink-0 text-amber-600 dark:text-amber-400" />
                <span>{t.privacyVault.vaultExcludedNotice}</span>
              </div>
            </div>
          </div>

          {!isLocked && (
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={openAddForm}
                className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-sky-700 whitespace-nowrap"
              >
                <Plus className="h-3.5 w-3.5" />
                {t.privacyVault.addItemBtn}
              </button>
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  lockVault();
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 whitespace-nowrap"
              >
                <Lock className="h-3.5 w-3.5" />
                {t.privacyVault.lockVaultBtn}
              </button>
            </div>
          )}
        </div>

        {/* STATE A: No PIN configured yet */}
        {!hasPin ? (
          <div className="mt-5 flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50/70 px-5 py-8 text-center dark:border-slate-700 dark:bg-slate-950/40">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-200/80 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <KeyRound className="h-5 w-5" />
            </div>
            <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-slate-100">
              {t.privacyVault.vaultNoPinTitle}
            </h3>
            <p className="mt-1 max-w-lg text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              {t.privacyVault.vaultNoPinBody}
            </p>
            <button
              type="button"
              onClick={onRequestPinSetup}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-700"
            >
              <KeyRound className="h-3.5 w-3.5" />
              {t.privacyVault.setPinBtn}
            </button>
          </div>
        ) : isLocked ? (
          /* STATE B: Locked or Privacy Mode active -> Zero vault content in DOM */
          <div className="mt-5 flex flex-col items-center justify-center rounded-lg border border-slate-200 bg-slate-50/85 px-5 py-9 text-center dark:border-slate-800 dark:bg-slate-950/60">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-400">
              <Lock className="h-5 w-5" />
            </div>
            <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-slate-100">
              {t.privacyVault.vaultLockedTitle}
            </h3>
            <p className="mt-1 max-w-md text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              {privacyMode
                ? t.privacyVault.vaultLockedPrivacyBody
                : t.privacyVault.vaultLockedBody}
            </p>
            {encryptedVaultCount > 0 && (
              <div className="mt-2 font-mono text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {t.privacyVault.vaultLockedCountPrefix} {encryptedVaultCount}
              </div>
            )}
            <button
              type="button"
              onClick={requestUnlockVault}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-sky-700"
            >
              <Unlock className="h-3.5 w-3.5" />
              {t.privacyVault.unlockWithPinBtn}
            </button>
          </div>
        ) : (
          /* STATE C: Unlocked Personal Vault */
          <div className="mt-5 space-y-4">
            {/* Add / Edit Vault Entry Form */}
            {formOpen && (
              <form
                onSubmit={handleSaveItem}
                className="rounded-lg border border-sky-200 bg-sky-50/40 p-4 dark:border-sky-900/60 dark:bg-sky-950/20"
              >
                <div className="flex items-center justify-between border-b border-sky-200/80 pb-2.5 dark:border-sky-900/50">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-slate-800 dark:text-slate-100">
                    {editingId ? t.privacyVault.editItemTitle : t.privacyVault.newItemTitle}
                  </h3>
                  <button
                    type="button"
                    onClick={resetForm}
                    aria-label={t.actions.close}
                    className="rounded p-1 text-slate-400 hover:bg-slate-200/70 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-4">
                  <label className="block">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      {t.privacyVault.categoryLabel}
                    </span>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as VaultItemCategory)}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-sky-600 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    >
                      {VAULT_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {t.privacyVault.categories[cat]}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block sm:col-span-2">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      {t.privacyVault.itemTitleLabel}
                    </span>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={t.privacyVault.itemTitlePlaceholder}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-sky-600 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      {t.privacyVault.itemDateLabel}
                    </span>
                    <input
                      type="text"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      placeholder={t.privacyVault.itemDatePlaceholder}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-900 focus:border-sky-600 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    />
                  </label>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                  <label className="block">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      {t.privacyVault.itemUrlsLabel}
                    </span>
                    <textarea
                      rows={3}
                      value={urlsText}
                      onChange={(e) => setUrlsText(e.target.value)}
                      placeholder={t.privacyVault.itemUrlsPlaceholder}
                      className="mt-1 w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs text-slate-900 focus:border-sky-600 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      {t.privacyVault.itemNotesLabel}
                    </span>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={t.privacyVault.itemNotesPlaceholder}
                      className="mt-1 w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-sky-600 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    />
                  </label>
                </div>

                {formError && (
                  <div className="mt-3 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-300">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="mt-4 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    {t.actions.cancel}
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-sky-700 disabled:opacity-50"
                  >
                    <Check className="h-3.5 w-3.5" />
                    {t.actions.save}
                  </button>
                </div>
              </form>
            )}

            {/* Decrypted Vault Items List */}
            {vaultItems.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/60 px-5 py-7 text-center dark:border-slate-800 dark:bg-slate-950/40">
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {t.privacyVault.emptyVaultTitle}
                </h3>
                <p className="mx-auto mt-1 max-w-lg text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  {t.privacyVault.emptyVaultBody}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {vaultItems.map((item) => {
                  const safeUrls = item.urls.filter((u) => isSafeHttpUrl(u));
                  return (
                    <article
                      key={item.id}
                      className="flex flex-col justify-between rounded-lg border border-slate-200/90 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/50"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold ${CATEGORY_BADGE_STYLE[item.category]}`}
                            >
                              {t.privacyVault.categories[item.category]}
                            </span>
                            {item.date && (
                              <span className="font-mono text-[11px] text-slate-500 tabular-nums dark:text-slate-400">
                                {item.date}
                              </span>
                            )}
                          </div>
                          <div className="flex shrink-0 items-center gap-1">
                            <button
                              type="button"
                              onClick={() => openEditForm(item)}
                              aria-label={t.actions.edit}
                              className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-200/70 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingItemId(item.id)}
                              aria-label={t.actions.delete}
                              className="rounded p-1 text-slate-400 transition-colors hover:bg-rose-100 hover:text-rose-700 dark:hover:bg-rose-950/60 dark:hover:text-rose-400"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        <h3 className="mt-2 text-sm font-bold text-slate-900 dark:text-slate-100">
                          {item.title}
                        </h3>

                        {item.notes && (
                          <p className="mt-1.5 whitespace-pre-wrap text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                            {item.notes}
                          </p>
                        )}
                      </div>

                      {safeUrls.length > 0 && (
                        <div className="mt-3 space-y-1.5 border-t border-slate-200/80 pt-3 dark:border-slate-800">
                          {safeUrls.map((url, idx) => (
                            <div
                              key={`${item.id}-u-${idx}`}
                              className="flex items-center justify-between gap-2 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 dark:border-slate-800 dark:bg-slate-900"
                            >
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex min-w-0 items-center gap-1.5 text-xs font-medium text-sky-700 hover:underline dark:text-cyan-400"
                              >
                                <ExternalLink className="h-3 w-3 shrink-0" />
                                <span className="truncate">
                                  {safeUrls.length > 1
                                    ? `${t.privacyVault.pagePrefix} ${idx + 1}: ${url}`
                                    : url}
                                </span>
                              </a>
                              <button
                                type="button"
                                onClick={() => handleCopyUrl(url)}
                                title={t.actions.copyLink}
                                className="shrink-0 rounded p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                              >
                                {copiedUrl === url ? (
                                  <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5" />
                                )}
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </section>

      <ConfirmModal
        open={Boolean(deletingItemId)}
        title={t.privacyVault.deleteItemConfirmTitle}
        body={t.privacyVault.deleteItemConfirmBody}
        confirmLabel={t.actions.delete}
        cancelLabel={t.actions.cancel}
        danger
        onConfirm={async () => {
          if (deletingItemId) {
            await deleteVaultItem(deletingItemId);
          }
          setDeletingItemId(null);
        }}
        onCancel={() => setDeletingItemId(null)}
      />
    </>
  );
};
