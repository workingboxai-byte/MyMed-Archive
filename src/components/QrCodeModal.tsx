import React, { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  X,
  Download,
  Copy,
  Check,
  FileText,
  Link2,
  ShieldCheck,
  ExternalLink,
  Clock,
  Cloud,
  RefreshCw,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useMedicalArchive } from '../context/MedicalArchiveContext';
import { getAttachmentUrls, isValidHttpUrl } from '../data/recordsLocalization';

interface QrCodeModalProps {
  open: boolean;
  onClose: () => void;
  initialMode?: 'summary' | 'link' | 'doctorShare';
  onRequestSignIn?: () => void;
}

interface LinkOption {
  id: string;
  label: string;
  url: string;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({
  open,
  onClose,
  initialMode = 'summary',
  onRequestSignIn,
}) => {
  const {
    language,
    privacyMode,
    t,
    profile,
    treatments,
    attachments,
    showToast,
    cloudUser,
    createDoctorShareLink,
  } = useMedicalArchive();

  const [mode, setMode] = useState<'summary' | 'link' | 'doctorShare'>(initialMode);
  const [selectedLinkId, setSelectedLinkId] = useState<string>('app-site');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [qrError, setQrError] = useState<string | null>(null);
  const [copiedPayload, setCopiedPayload] = useState(false);

  // 24h Doctor Share state
  const [shareLoading, setShareLoading] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [generatedShare, setGeneratedShare] = useState<{
    url: string;
    expiresAt: string;
  } | null>(null);

  // Sync initialMode when modal opens
  useEffect(() => {
    if (open) {
      setMode(initialMode);
      setCopiedPayload(false);
      setShareError(null);
    }
  }, [open, initialMode]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  const appSiteUrl = useMemo(() => {
    if (typeof window === 'undefined') return 'https://mymed-archive.local/';
    return `${window.location.origin}${window.location.pathname}`;
  }, []);

  // Build dropdown options: site link + all archive links (including multi-page items)
  const linkOptions = useMemo<LinkOption[]>(() => {
    const items: LinkOption[] = [
      {
        id: 'app-site',
        label: t.qr.siteLinkOption,
        url: appSiteUrl,
      },
    ];

    for (const att of attachments) {
      const urls = getAttachmentUrls(att).filter((u) => isValidHttpUrl(u));
      if (urls.length === 0) {
        if (att.url && att.url.trim()) {
          items.push({
            id: att.id,
            label: att.date ? `${att.title} (${att.date})` : att.title,
            url: att.url.trim(),
          });
        }
        continue;
      }
      if (urls.length === 1) {
        items.push({
          id: att.id,
          label: att.date ? `${att.title} (${att.date})` : att.title,
          url: urls[0],
        });
      } else {
        urls.forEach((url, idx) => {
          items.push({
            id: `${att.id}::p${idx + 1}`,
            label: `${att.title} — ${t.archive.pagePrefix} ${idx + 1}`,
            url,
          });
        });
      }
    }

    return items;
  }, [attachments, appSiteUrl, t.qr.siteLinkOption, t.archive.pagePrefix]);

  // Ensure selectedLinkId stays valid if attachments change
  useEffect(() => {
    if (!linkOptions.some((opt) => opt.id === selectedLinkId)) {
      setSelectedLinkId('app-site');
    }
  }, [linkOptions, selectedLinkId]);

  const selectedLink = useMemo(
    () => linkOptions.find((opt) => opt.id === selectedLinkId) ?? linkOptions[0],
    [linkOptions, selectedLinkId],
  );

  // Compact clinical card payload (NEVER includes Personal Vault; respects Privacy Mode)
  const compactSummaryPayload = useMemo(() => {
    const lines: string[] = [];
    const currentYear = 2026;
    const age = Math.max(0, currentYear - profile.birth_year);
    const fullName =
      (language === 'uk'
        ? profile.full_name_uk
        : language === 'ru'
        ? profile.full_name_ru
        : profile.full_name_en) || t.patientShort;

    lines.push(`${t.appBrand} — ${t.qr.cardHeader}`);
    if (!privacyMode && fullName) {
      lines.push(`${t.anamnesis.fullName}: ${fullName}`);
    }
    lines.push(
      `${t.anamnesis.birthYear}: ${profile.birth_year} (${age} ${t.anamnesis.ageSuffix})${
        profile.blood_type ? ` | ${t.anamnesis.bloodType}: ${profile.blood_type}` : ''
      }`,
    );
    lines.push(
      `${t.anamnesis.allergies}: ${profile.allergies?.trim() || t.anamnesis.notSpecified}`,
    );
    if (profile.chronic_conditions?.trim()) {
      lines.push(`${t.anamnesis.chronicConditions}: ${profile.chronic_conditions.trim()}`);
    }

    // Active medications from profile + active treatment courses
    const activeMedList: string[] = [];
    if (profile.current_medications?.trim()) {
      activeMedList.push(profile.current_medications.trim());
    }
    const activeCourses = treatments.filter((tr) => tr.status === 'active');
    for (const course of activeCourses) {
      for (const med of course.medications) {
        if (!med.name.trim()) continue;
        const spec = [med.dosage, med.schedule].filter(Boolean).join(' ');
        activeMedList.push(spec ? `${med.name} (${spec})` : med.name);
      }
    }
    lines.push(
      `${t.qr.activeMedsLabel}: ${
        activeMedList.length > 0 ? activeMedList.join('; ') : t.anamnesis.notSpecified
      }`,
    );

    const joined = lines.join('\n');
    return joined.length > 900 ? `${joined.slice(0, 897)}...` : joined;
  }, [language, privacyMode, profile, treatments, t]);

  const activePayload =
    mode === 'summary'
      ? compactSummaryPayload
      : mode === 'link'
      ? selectedLink?.url || appSiteUrl
      : generatedShare?.url || '';

  // Render QR locally in browser (100% offline via qrcode package)
  useEffect(() => {
    if (!open || !activePayload) {
      setQrDataUrl('');
      setQrError(null);
      return;
    }
    let cancelled = false;

    QRCode.toDataURL(activePayload, {
      width: 340,
      margin: 3,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => {
        if (!cancelled) {
          setQrDataUrl(url);
          setQrError(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setQrDataUrl('');
          setQrError(t.qr.generationError);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [open, activePayload, t.qr.generationError]);

  const handleGenerateDoctorShare = async () => {
    setShareLoading(true);
    setShareError(null);
    try {
      const res = await createDoctorShareLink();
      if (!res.ok || !res.url || !res.expiresAt) {
        setShareError(res.error || t.doctorShare.createError);
      } else {
        setGeneratedShare({ url: res.url, expiresAt: res.expiresAt });
      }
    } finally {
      setShareLoading(false);
    }
  };

  const handleDownloadPng = async () => {
    if (!activePayload) return;
    try {
      const highResUrl = await QRCode.toDataURL(activePayload, {
        width: 720,
        margin: 4,
        errorCorrectionLevel: 'M',
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      });
      const link = document.createElement('a');
      const slug =
        mode === 'summary'
          ? 'mymed-doctor-summary-qr'
          : mode === 'doctorShare'
          ? 'mymed-doctor-24h-access-qr'
          : selectedLink?.id === 'app-site'
          ? 'mymed-archive-site-qr'
          : 'mymed-document-link-qr';
      link.href = highResUrl;
      link.download = `${slug}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast(t.qr.downloadedToast, 'success');
    } catch {
      showToast(t.qr.generationError, 'error');
    }
  };

  const handleCopyPayload = async () => {
    if (!activePayload) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(activePayload);
      } else {
        const ta = document.createElement('textarea');
        ta.value = activePayload;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopiedPayload(true);
      showToast(t.actions.copied, 'success');
      window.setTimeout(() => setCopiedPayload(false), 1800);
    } catch {
      // Ignore clipboard failure
    }
  };

  const formatExpiry = (iso: string): string => {
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

  if (!open) return null;

  return (
    <div
      className="no-print fixed inset-0 z-[65] flex items-center justify-center bg-slate-950/65 p-3.5 backdrop-blur-[2px] sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-label={t.qr.modalTitle}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700 dark:bg-cyan-950/70 dark:text-cyan-300">
              <QrCode className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white sm:text-base">
                {t.qr.modalTitle}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{t.qr.modalSubtitle}</p>
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
        <div className="overflow-y-auto px-5 py-4 space-y-4">
          {/* 3-Tab Segmented Control */}
          <div
            className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800"
            role="tablist"
          >
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'summary'}
              onClick={() => setMode('summary')}
              className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[11px] font-semibold transition-colors sm:text-xs ${
                mode === 'summary'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <FileText className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{t.qr.tabSummary}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'link'}
              onClick={() => setMode('link')}
              className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[11px] font-semibold transition-colors sm:text-xs ${
                mode === 'link'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Link2 className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{t.qr.tabLink}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'doctorShare'}
              onClick={() => setMode('doctorShare')}
              className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[11px] font-semibold transition-colors sm:text-xs ${
                mode === 'doctorShare'
                  ? 'bg-white text-sky-700 shadow-xs dark:bg-slate-700 dark:text-cyan-300'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{t.doctorShare.tabLabel}</span>
            </button>
          </div>

          {/* Mode: 24h Doctor Access (Supabase Cloud) */}
          {mode === 'doctorShare' ? (
            !cloudUser ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-5 py-8 text-center dark:border-slate-800 dark:bg-slate-800/40">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 text-sky-700 dark:bg-cyan-950/70 dark:text-cyan-300">
                  <Cloud className="h-5 w-5" />
                </div>
                <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-white">
                  {t.doctorShare.requireAuthTitle}
                </h3>
                <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                  {t.doctorShare.requireAuthBody}
                </p>
                {onRequestSignIn && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onRequestSignIn();
                    }}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-sky-700"
                  >
                    <Cloud className="h-3.5 w-3.5" />
                    {t.doctorShare.openAuthBtn}
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3.5">
                <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50/80 px-3 py-2 text-[11px] font-medium text-emerald-800 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-300">
                  <ShieldCheck className="h-4 w-4 shrink-0" />
                  <span>{t.doctorShare.vaultExcludedBadge}</span>
                </div>

                {shareError && (
                  <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/50 dark:text-rose-300">
                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>{shareError}</span>
                  </div>
                )}

                {generatedShare && qrDataUrl ? (
                  <>
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50/90 p-5 dark:border-slate-800 dark:bg-slate-950/60">
                      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                        <img
                          src={qrDataUrl}
                          alt={t.doctorShare.tabLabel}
                          className="h-60 w-60 select-none sm:h-64 sm:w-64"
                          style={{ imageRendering: 'pixelated' }}
                        />
                      </div>
                      <div className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-sky-50 px-2.5 py-1 font-mono text-[11px] font-semibold text-sky-800 dark:bg-cyan-950/60 dark:text-cyan-300">
                        <Clock className="h-3.5 w-3.5" />
                        <span>
                          {t.doctorShare.validUntilLabel}: {formatExpiry(generatedShare.expiresAt)}
                        </span>
                      </div>
                      <p className="mt-2 text-center text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        {t.doctorShare.scanHint}
                      </p>
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-800/70">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate font-mono text-[11px] text-slate-700 dark:text-slate-300">
                          {generatedShare.url}
                        </span>
                        <a
                          href={generatedShare.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold text-sky-700 hover:underline dark:text-cyan-400"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleGenerateDoctorShare}
                      disabled={shareLoading}
                      className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 disabled:opacity-50"
                    >
                      {shareLoading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3.5 w-3.5" />
                      )}
                      <span>
                        {shareLoading
                          ? t.doctorShare.generatingLabel
                          : t.doctorShare.regenerateBtn}
                      </span>
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-5 py-8 text-center dark:border-slate-700 dark:bg-slate-800/40">
                    <Clock className="h-8 w-8 text-sky-600 dark:text-cyan-400" />
                    <p className="mt-2.5 max-w-sm text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                      {t.doctorShare.scanHint}
                    </p>
                    <button
                      type="button"
                      onClick={handleGenerateDoctorShare}
                      disabled={shareLoading}
                      className="mt-4 inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-sky-700 disabled:opacity-50"
                    >
                      {shareLoading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <QrCode className="h-3.5 w-3.5" />
                      )}
                      <span>
                        {shareLoading
                          ? t.doctorShare.generatingLabel
                          : t.doctorShare.generateBtn}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            )
          ) : (
            <>
              {/* Link Selector Dropdown in Link Mode */}
              {mode === 'link' && (
                <div className="space-y-1.5">
                  <label
                    htmlFor="qr-link-select"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    {t.qr.selectLinkLabel}
                  </label>
                  <select
                    id="qr-link-select"
                    value={selectedLinkId}
                    onChange={(e) => setSelectedLinkId(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  >
                    {linkOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* High-Contrast QR Code Stage (always pure white surface for effortless scanning) */}
              <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50/90 p-5 dark:border-slate-800 dark:bg-slate-950/60">
                {qrError ? (
                  <div className="py-12 text-center text-xs font-medium text-rose-600 dark:text-rose-400">
                    {qrError}
                  </div>
                ) : qrDataUrl ? (
                  <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                    <img
                      src={qrDataUrl}
                      alt={t.qr.modalTitle}
                      className="h-60 w-60 select-none sm:h-64 sm:w-64"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  </div>
                ) : (
                  <div className="flex h-64 w-64 items-center justify-center rounded-xl bg-white text-xs text-slate-400">
                    ...
                  </div>
                )}

                <p className="mt-3 text-center text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  {mode === 'summary' ? t.qr.scanSummaryHint : t.qr.scanLinkHint}
                </p>
              </div>

              {/* Encoded Payload Preview */}
              {mode === 'summary' ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      {t.qr.encodedContentLabel}
                    </span>
                    <span className="font-mono text-[10.5px] text-slate-400 tabular-nums">
                      {activePayload.length} ch
                    </span>
                  </div>
                  <pre className="max-h-32 overflow-y-auto whitespace-pre-wrap break-words rounded-lg border border-slate-200 bg-slate-50 p-2.5 font-mono text-[11px] leading-relaxed text-slate-700 dark:border-slate-800 dark:bg-slate-800/70 dark:text-slate-300">
                    {compactSummaryPayload}
                  </pre>
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-400">
                    <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                    <span>{t.qr.vaultExcludedNotice}</span>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-800/70">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate font-mono text-[11px] text-slate-700 dark:text-slate-300">
                      {selectedLink?.url}
                    </span>
                    {selectedLink?.url && isValidHttpUrl(selectedLink.url) && (
                      <a
                        href={selectedLink.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold text-sky-700 hover:underline dark:text-cyan-400"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-slate-50/80 px-5 py-3.5 dark:border-slate-800 dark:bg-slate-900/90">
          <button
            type="button"
            onClick={handleCopyPayload}
            disabled={!activePayload}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            {copiedPayload ? (
              <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            <span>{copiedPayload ? t.actions.copied : t.qr.copyPayloadBtn}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPng}
            disabled={!qrDataUrl}
            className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-sky-700 disabled:opacity-40"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{t.qr.downloadPngBtn}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
