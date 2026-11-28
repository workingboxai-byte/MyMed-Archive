import React, { useRef, useState } from 'react';
import { Download, Upload, RotateCcw, X, AlertCircle, Lock } from 'lucide-react';
import { useMedicalArchive } from '../context/MedicalArchiveContext';
import { ConfirmModal } from './ConfirmModal';

interface JsonArchiveModalProps {
  open: boolean;
  onClose: () => void;
}

export const JsonArchiveModal: React.FC<JsonArchiveModalProps> = ({ open, onClose }) => {
  const { t, hasEncryptedVault, exportJsonFile, importJsonString, resetToInitialJson } =
    useMedicalArchive();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  if (!open) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(null);

    const reader = new FileReader();
    reader.onload = () => {
      const content = typeof reader.result === 'string' ? reader.result : '';
      const result = importJsonString(content);
      if (!result.ok) {
        setImportError(result.error || t.jsonModal.importError);
      } else {
        onClose();
      }
    };
    reader.onerror = () => {
      setImportError(t.jsonModal.importError);
    };
    reader.readAsText(file, 'utf-8');
    e.target.value = '';
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-[2px]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="json-modal-title"
      >
        <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
            <div>
              <h2 id="json-modal-title" className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {t.jsonModal.title}
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                {t.jsonModal.subtitle}
              </p>
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

          <div className="mt-5 space-y-4">
            {/* Import */}
            <div className="rounded-lg border border-sky-200 bg-sky-50/50 p-4 dark:border-sky-900/60 dark:bg-sky-950/20">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {t.actions.importJson}
                  </div>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    {t.jsonModal.importDesc}
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/json,.json"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-sky-700 whitespace-nowrap"
                >
                  <Upload className="h-3.5 w-3.5" />
                  {t.jsonModal.selectFile}
                </button>
              </div>

              {importError && (
                <div className="mt-3 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                  <span>{importError}</span>
                </div>
              )}
            </div>

            {/* Export */}
            <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {t.actions.exportJson}
                </div>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  {t.jsonModal.exportDesc}
                </p>
                {hasEncryptedVault && (
                  <div className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                    <Lock className="h-3 w-3 shrink-0" />
                    <span>{t.privacyVault.jsonEncryptedVaultNote}</span>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={exportJsonFile}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 whitespace-nowrap"
              >
                <Download className="h-3.5 w-3.5" />
                {t.actions.exportJson}
              </button>
            </div>

            {/* Reset */}
            <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/60 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {t.jsonModal.resetTitle}
                </div>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  {t.jsonModal.resetDesc}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setConfirmResetOpen(true)}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-100 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-950/70 whitespace-nowrap"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                {t.actions.resetDefault}
              </button>
            </div>
          </div>

          <div className="mt-5 flex justify-end border-t border-slate-200 pt-4 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {t.actions.close}
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={confirmResetOpen}
        title={t.jsonModal.resetConfirmTitle}
        body={t.jsonModal.resetConfirmBody}
        confirmLabel={t.actions.confirm}
        cancelLabel={t.actions.cancel}
        danger
        onConfirm={() => {
          setConfirmResetOpen(false);
          resetToInitialJson();
          onClose();
        }}
        onCancel={() => setConfirmResetOpen(false)}
      />
    </>
  );
};
