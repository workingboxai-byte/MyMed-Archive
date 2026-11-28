import React, { useEffect, useState } from 'react';
import {
  Cloud,
  CloudOff,
  CheckCircle2,
  RefreshCw,
  LogOut,
  X,
  Mail,
  Lock,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useMedicalArchive } from '../context/MedicalArchiveContext';

interface CloudAuthModalProps {
  open: boolean;
  onClose: () => void;
}

export const CloudAuthModal: React.FC<CloudAuthModalProps> = ({ open, onClose }) => {
  const {
    language,
    t,
    cloudUser,
    cloudSyncStatus,
    cloudLastSyncedAt,
    cloudSyncError,
    signInWithEmail,
    signUpWithEmail,
    signOutCloud,
    syncNowToCloud,
  } = useMedicalArchive();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setErrorMsg(null);
    setInfoMsg(null);
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const formatTimestamp = (iso: string | null): string => {
    if (!iso) return '—';
    try {
      const locale = language === 'uk' ? 'uk-UA' : language === 'ru' ? 'ru-RU' : 'en-GB';
      return new Intl.DateTimeFormat(locale, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(iso));
    } catch {
      return iso.slice(0, 16).replace('T', ' ');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);
    setSubmitting(true);

    try {
      if (mode === 'signin') {
        const res = await signInWithEmail(email, password);
        if (!res.ok) {
          setErrorMsg(res.error || t.cloud.authGenericError);
        } else {
          setPassword('');
          onClose();
        }
      } else {
        const res = await signUpWithEmail(email, password);
        if (!res.ok) {
          setErrorMsg(res.error || t.cloud.authGenericError);
        } else if (res.needsConfirmation) {
          setPassword('');
          setInfoMsg(t.cloud.checkEmailNotice);
          setMode('signin');
        } else {
          setPassword('');
          onClose();
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    setSubmitting(true);
    try {
      await signOutCloud();
    } finally {
      setSubmitting(false);
    }
  };

  const handleSyncNow = async () => {
    setSubmitting(true);
    try {
      await syncNowToCloud();
    } finally {
      setSubmitting(false);
    }
  };

  const statusLabel =
    cloudSyncStatus === 'synced'
      ? t.cloud.statusSynced
      : cloudSyncStatus === 'syncing'
      ? t.cloud.statusSyncing
      : cloudSyncStatus === 'offline'
      ? t.cloud.statusOffline
      : cloudSyncStatus === 'error'
      ? t.cloud.statusError
      : t.cloud.statusLocal;

  return (
    <div
      className="no-print fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-label={t.cloud.modalTitle}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700 dark:bg-cyan-950/70 dark:text-cyan-300">
              <Cloud className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white sm:text-base">
                {t.cloud.modalTitle}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{t.cloud.modalSubtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.actions.close}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {cloudUser ? (
            <>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {t.cloud.connectedAs}
                </div>
                <div className="mt-1 truncate font-mono text-xs font-semibold text-slate-900 dark:text-white">
                  {cloudUser.email}
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/80 pt-3 dark:border-slate-700/80">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold ${
                      cloudSyncStatus === 'synced'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                        : cloudSyncStatus === 'syncing'
                        ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/70 dark:text-sky-300'
                        : cloudSyncStatus === 'offline'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300'
                    }`}
                  >
                    {cloudSyncStatus === 'synced' ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : cloudSyncStatus === 'syncing' ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : cloudSyncStatus === 'offline' ? (
                      <CloudOff className="h-3.5 w-3.5" />
                    ) : (
                      <AlertCircle className="h-3.5 w-3.5" />
                    )}
                    {statusLabel}
                  </span>

                  <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                    {t.cloud.lastSyncedLabel}: {formatTimestamp(cloudLastSyncedAt)}
                  </span>
                </div>

                {cloudSyncError && (
                  <p className="mt-2.5 rounded-lg bg-rose-50 px-2.5 py-2 text-[11px] text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
                    {cloudSyncError}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleSyncNow}
                  disabled={submitting || cloudSyncStatus === 'syncing'}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-sky-600 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-sky-700 disabled:opacity-50"
                >
                  <RefreshCw
                    className={`h-3.5 w-3.5 ${
                      submitting || cloudSyncStatus === 'syncing' ? 'animate-spin' : ''
                    }`}
                  />
                  {t.cloud.syncNowBtn}
                </button>

                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 disabled:opacity-50"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  {t.cloud.signOutBtn}
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Sign In / Sign Up segmented switcher */}
              <div
                className="grid grid-cols-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-800"
                role="tablist"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'signin'}
                  onClick={() => {
                    setMode('signin');
                    setErrorMsg(null);
                  }}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                    mode === 'signin'
                      ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  {t.cloud.tabSignIn}
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'signup'}
                  onClick={() => {
                    setMode('signup');
                    setErrorMsg(null);
                  }}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                    mode === 'signup'
                      ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  {t.cloud.tabSignUp}
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label
                    htmlFor="cloud-auth-email"
                    className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    {t.cloud.emailLabel}
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="cloud-auth-email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t.cloud.emailPlaceholder}
                      className="w-full rounded-lg border border-slate-300 bg-white py-2 pr-3 pl-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="cloud-auth-password"
                    className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    {t.cloud.passwordLabel}
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="cloud-auth-password"
                      type="password"
                      required
                      minLength={6}
                      autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t.cloud.passwordPlaceholder}
                      className="w-full rounded-lg border border-slate-300 bg-white py-2 pr-3 pl-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                {errorMsg && (
                  <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/50 dark:text-rose-300">
                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {infoMsg && (
                  <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800 dark:border-emerald-900/70 dark:bg-emerald-950/50 dark:text-emerald-300">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>{infoMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-sky-700 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {mode === 'signin' ? t.cloud.signInBtn : t.cloud.signUpBtn}
                </button>
              </form>

              <p className="rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-relaxed text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                {t.cloud.localNotice}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
