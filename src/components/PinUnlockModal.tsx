import React, { useEffect, useRef, useState } from 'react';
import { Lock, Unlock, X, Eye, EyeOff, AlertCircle, ShieldCheck } from 'lucide-react';
import { useMedicalArchive } from '../context/MedicalArchiveContext';

export const PinUnlockModal: React.FC = () => {
  const { t, pinModalRequest, closePinModal, verifyAndUnlockWithPin } = useMedicalArchive();
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (pinModalRequest) {
      setPin('');
      setShowPin(false);
      setError(null);
      setSubmitting(false);
      window.setTimeout(() => {
        inputRef.current?.focus();
      }, 30);
    }
  }, [pinModalRequest]);

  if (!pinModalRequest) return null;

  const isPrivacyModeUnlock = pinModalRequest === 'disable_privacy';
  const title = isPrivacyModeUnlock
    ? t.privacyVault.unlockPrivacyTitle
    : t.privacyVault.unlockVaultTitle;
  const subtitle = isPrivacyModeUnlock
    ? t.privacyVault.unlockPrivacySubtitle
    : t.privacyVault.unlockVaultSubtitle;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim() || submitting) return;
    setSubmitting(true);
    setError(null);

    try {
      const result = await verifyAndUnlockWithPin(pin);
      if (!result.ok) {
        setError(result.error || t.privacyVault.pinWrongError);
        setPin('');
        inputRef.current?.focus();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="no-print fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pin-unlock-modal-title"
    >
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-400">
              <Lock className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2
                id="pin-unlock-modal-title"
                className="text-base font-bold text-slate-900 dark:text-slate-100"
              >
                {title}
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                {subtitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closePinModal}
            aria-label={t.actions.close}
            className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="pin-unlock-input"
              className="block text-xs font-medium text-slate-700 dark:text-slate-300"
            >
              {t.privacyVault.enterPinLabel}
            </label>
            <div className="relative mt-1.5">
              <input
                ref={inputRef}
                id="pin-unlock-input"
                type={showPin ? 'text' : 'password'}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  if (error) setError(null);
                }}
                placeholder={t.privacyVault.pinPlaceholder}
                autoComplete="current-password"
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pr-10 pl-3.5 font-mono text-sm tracking-widest text-slate-900 focus:border-sky-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
              <button
                type="button"
                onClick={() => setShowPin((v) => !v)}
                aria-label={showPin ? 'Hide PIN' : 'Show PIN'}
                className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-300">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-between gap-2 border-t border-slate-200 pt-4 dark:border-slate-800">
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              SHA-256 · AES-GCM
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={closePinModal}
                className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                {t.actions.cancel}
              </button>
              <button
                type="submit"
                disabled={!pin.trim() || submitting}
                className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Unlock className="h-3.5 w-3.5" />
                {t.privacyVault.unlockButton}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
