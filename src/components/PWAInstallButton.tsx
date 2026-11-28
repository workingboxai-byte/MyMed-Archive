import React, { useState } from 'react';
import { Download, Share, PlusSquare, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useMedicalArchive } from '../context/MedicalArchiveContext';

interface PWAInstallButtonProps {
  variant?: 'sidebar' | 'header' | 'mobile-sheet';
  onActionComplete?: () => void;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'sidebar',
  onActionComplete,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const { t, showToast } = useMedicalArchive();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  // Header compact button only appears when native install prompt is available (Chromium/Android/Desktop)
  if (variant === 'header' && !isInstallable) {
    return null;
  }

  // Sidebar & mobile-sheet buttons appear if either native install prompt is ready OR on iOS Safari
  if (!isInstallable && !isIOS) {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      const accepted = await install();
      if (accepted) {
        showToast(t.pwa.installedToast, 'success');
      }
      onActionComplete?.();
      return;
    }
    if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  return (
    <>
      {variant === 'sidebar' && (
        <button
          type="button"
          onClick={handleClick}
          className="mb-2 flex w-full items-center justify-between rounded-lg border border-cyan-500/35 bg-cyan-500/12 px-3 py-2.5 text-xs font-semibold text-cyan-200 transition-colors hover:border-cyan-400/60 hover:bg-cyan-500/20 hover:text-white"
        >
          <span className="inline-flex items-center gap-2 whitespace-nowrap">
            {isIOS && !isInstallable ? (
              <Smartphone className="h-3.5 w-3.5 text-cyan-400" />
            ) : (
              <Download className="h-3.5 w-3.5 text-cyan-400" />
            )}
            {t.pwa.installAppBtn}
          </span>
          <span className="font-mono text-[10px] text-cyan-300/80">PWA</span>
        </button>
      )}

      {variant === 'header' && (
        <button
          type="button"
          onClick={handleClick}
          title={t.pwa.installAppBtn}
          aria-label={t.pwa.installAppBtn}
          className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-300 bg-cyan-50 px-2.5 py-1.5 text-xs font-semibold text-cyan-900 transition-colors hover:bg-cyan-100 dark:border-cyan-700/80 dark:bg-cyan-950/60 dark:text-cyan-200 dark:hover:bg-cyan-900/60 whitespace-nowrap"
        >
          <Download className="h-3.5 w-3.5 shrink-0 text-cyan-600 dark:text-cyan-400" />
          <span className="hidden xl:inline">{t.pwa.installAppBtn}</span>
        </button>
      )}

      {variant === 'mobile-sheet' && (
        <button
          type="button"
          onClick={handleClick}
          className="flex min-h-[46px] w-full items-center justify-between rounded-xl border border-cyan-200 bg-cyan-50/70 px-3.5 py-2.5 text-left text-cyan-900 transition-colors hover:bg-cyan-100/70 dark:border-cyan-800/80 dark:bg-cyan-950/40 dark:text-cyan-200"
        >
          <span className="flex items-center gap-3">
            {isIOS && !isInstallable ? (
              <Smartphone className="h-4.5 w-4.5 text-cyan-600 dark:text-cyan-400" />
            ) : (
              <Download className="h-4.5 w-4.5 text-cyan-600 dark:text-cyan-400" />
            )}
            <span>
              <span className="block text-sm font-semibold">{t.pwa.installAppBtn}</span>
              <span className="block text-[11px] text-cyan-700/80 dark:text-cyan-300/80">
                {isIOS && !isInstallable ? t.pwa.iosShortHint : t.pwa.installSubline}
              </span>
            </span>
          </span>
          <span className="font-mono text-[10px] font-semibold uppercase text-cyan-700 dark:text-cyan-300">
            PWA
          </span>
        </button>
      )}

      {showIOSGuide && (
        <div
          className="no-print fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-label={t.pwa.iosModalTitle}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowIOSGuide(false);
          }}
        >
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-sky-700 dark:bg-cyan-950/80 dark:text-cyan-300">
                  <Smartphone className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {t.pwa.iosModalTitle}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t.pwa.iosModalSubtitle}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                aria-label={t.actions.close}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <ol className="mt-4 space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
              <li className="flex items-start gap-2.5 rounded-lg border border-slate-200/80 bg-slate-50 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-800/60">
                <Share className="mt-0.5 h-4 w-4 shrink-0 text-sky-600 dark:text-cyan-400" />
                <span>{t.pwa.iosStep1}</span>
              </li>
              <li className="flex items-start gap-2.5 rounded-lg border border-slate-200/80 bg-slate-50 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-800/60">
                <PlusSquare className="mt-0.5 h-4 w-4 shrink-0 text-sky-600 dark:text-cyan-400" />
                <span>{t.pwa.iosStep2}</span>
              </li>
            </ol>

            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="mt-4 w-full rounded-lg bg-slate-900 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800 dark:bg-cyan-600 dark:hover:bg-cyan-500"
            >
              {t.actions.close}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
