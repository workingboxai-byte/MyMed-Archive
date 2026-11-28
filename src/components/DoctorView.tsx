import React, { useState } from 'react';
import { Printer, ArrowLeft, Copy, Check, Share2, QrCode } from 'lucide-react';
import { useMedicalArchive } from '../context/MedicalArchiveContext';
import {
  DETAILED_SPINE_SEGMENTS,
  MRI_KPI_SUMMARIES,
  SYSTEMIC_SOR_FINDINGS,
  getSpineSegmentLinkLabel,
} from '../data/spineSegmentsData';
import { ComplaintZoneKey, Language } from '../types/medical';
import { getAttachmentUrls, isValidHttpUrl } from '../data/recordsLocalization';
import { DoctorSpine2DSvg } from './DoctorSpine2DSvg';

const ZONE_KEYS: ComplaintZoneKey[] = [
  'lumbar_sacral',
  'thoracic',
  'cervical_head',
  'right_side_spasms_load',
];

interface DoctorViewProps {
  onOpenQr?: () => void;
}

export const DoctorView: React.FC<DoctorViewProps> = ({ onOpenQr }) => {
  const {
    language,
    setLanguage,
    privacyMode,
    t,
    meta,
    profile,
    sorMeta,
    complaints,
    records,
    attachments,
    treatments,
    followUpPlan,
    setActiveSection,
    showToast,
  } = useMedicalArchive();

  const [includeSpine2D, setIncludeSpine2D] = useState(true);
  const [summaryCopied, setSummaryCopied] = useState(false);

  const pendingFollowUp = React.useMemo(
    () => followUpPlan.filter((task) => !task.completed),
    [followUpPlan],
  );

  const doctorTreatments = React.useMemo(() => {
    const activeCourses = treatments
      .filter((tr) => tr.status === 'active')
      .sort((a, b) => b.sortDate.localeCompare(a.sortDate));
    const recentCompleted = treatments
      .filter((tr) => tr.status !== 'active')
      .sort((a, b) => b.sortDate.localeCompare(a.sortDate))
      .slice(0, 4);
    return [...activeCourses, ...recentCompleted];
  }, [treatments]);

  const recordLabelById = React.useMemo(() => {
    const map = new Map<string, string>();
    records.forEach((r) => {
      map.set(
        r.id,
        r.date && r.date !== '—' ? `${r.title[language]} (${r.date})` : r.title[language],
      );
    });
    return map;
  }, [records, language]);

  const currentYear = 2026;
  const age = Math.max(0, currentYear - profile.birth_year);
  const bmi =
    profile.height_cm && profile.weight_kg && profile.height_cm > 0
      ? (profile.weight_kg / Math.pow(profile.height_cm / 100, 2)).toFixed(1)
      : null;

  const fullName =
    (language === 'uk'
      ? profile.full_name_uk
      : language === 'ru'
      ? profile.full_name_ru
      : profile.full_name_en) || t.patientShort;

  const regionName =
    language === 'uk'
      ? profile.region_uk
      : language === 'ru'
      ? profile.region_ru
      : profile.region_en;

  const hasCustomRadiologist = Boolean(sorMeta.radiologist && sorMeta.radiologist.trim().length > 0);
  const radiologistDisplay = hasCustomRadiologist
    ? sorMeta.radiologist
    : t.mri.radiologistDefault;

  const todayStr = new Date().toISOString().slice(0, 10);
  const blurClass = privacyMode ? 'blur-[5px] select-none transition-all' : 'transition-all';

  const buildPlainTextSummary = (): string => {
    const lines: string[] = [];
    const safePatientName = privacyMode ? t.patientShort : fullName;

    lines.push(`${t.appBrand} — ${t.doctor.docHeaderTitle} (${todayStr})`);
    lines.push('────────────────────────────────────────');

    // 1. Profile & Chronic conditions
    lines.push(`${t.doctor.patientBlock}:`);
    lines.push(`• ${t.anamnesis.fullName}: ${safePatientName}`);
    lines.push(`• ${t.anamnesis.birthYear}: ${profile.birth_year} (${age} ${t.anamnesis.ageSuffix})`);
    if (!privacyMode && regionName) {
      lines.push(`• ${t.anamnesis.region}: ${regionName}`);
    }
    if (profile.height_cm || profile.weight_kg) {
      const h = profile.height_cm ? `${profile.height_cm} ${t.anamnesis.cmUnit}` : '—';
      const w = profile.weight_kg ? `${profile.weight_kg} ${t.anamnesis.kgUnit}` : '—';
      lines.push(`• ${t.anamnesis.height} / ${t.anamnesis.weight}: ${h} / ${w}${bmi ? ` (BMI ${bmi})` : ''}`);
    }
    if (profile.blood_type) {
      lines.push(`• ${t.anamnesis.bloodType}: ${profile.blood_type}`);
    }
    if (profile.allergies) {
      lines.push(`• ${t.anamnesis.allergies}: ${profile.allergies}`);
    }
    if (profile.chronic_conditions) {
      lines.push(`• ${t.anamnesis.chronicConditions}: ${profile.chronic_conditions}`);
    }
    if (profile.current_medications) {
      lines.push(`• ${t.anamnesis.currentMedications}: ${profile.current_medications}`);
    }

    // 2. Key MRI Spine Changes (SOR 2025 -> 2026)
    lines.push('');
    lines.push(`${t.doctor.redFlagsBlock}:`);
    for (const item of MRI_KPI_SUMMARIES) {
      lines.push(`• ${item.kicker[language]} — ${item.headline[language]} (${item.subline[language]})`);
    }

    const keySegments = DETAILED_SPINE_SEGMENTS.filter((seg) => seg.status !== 'stable');
    if (keySegments.length > 0) {
      lines.push('');
      lines.push(`${t.doctor.mriTableBlockPrefix}):`);
      for (const seg of keySegments) {
        lines.push(
          `• ${seg.id} [${seg.statusLabel[language]}]: ${seg.y2026.finding[language]} (${seg.y2026.canal[language]}; ${seg.y2026.roots[language]})`,
        );
      }
    }

    // 3. Active & Recent Treatment Courses
    if (doctorTreatments.length > 0) {
      lines.push('');
      lines.push(`${t.doctor.treatmentsBlock}:`);
      for (const course of doctorTreatments) {
        const header = [
          `[${t.treatments.statuses[course.status]}]`,
          course.prescribedBy || t.treatments.courseTypes[course.courseType],
          course.period && course.period !== '—' ? `(${course.period})` : '',
        ]
          .filter(Boolean)
          .join(' ');
        const medsText = course.medications
          .map((m) => {
            const parts = [m.dosage, m.schedule, m.duration].filter(Boolean);
            return parts.length > 0 ? `${m.name} (${parts.join(', ')})` : m.name;
          })
          .join('; ');
        lines.push(`• ${header}${medsText ? `: ${medsText}` : ''}`);
        if (course.proceduresAndRecommendations) {
          lines.push(`  ${t.treatments.proceduresLabel}: ${course.proceduresAndRecommendations}`);
        }
      }
    }

    // 4. Pending Follow-up Plan
    if (pendingFollowUp.length > 0) {
      lines.push('');
      lines.push(`${t.doctorPrint.followUpInlineLabel}:`);
      for (const task of pendingFollowUp) {
        lines.push(`• ${task.title}${task.targetDate ? ` (${task.targetDate})` : ''}`);
      }
    }

    return lines.join('\n');
  };

  const writeTextToClipboard = async (text: string): Promise<boolean> => {
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {
      // Fallback below
    }
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(textarea);
      return ok;
    } catch {
      return false;
    }
  };

  const handleCopySummary = async () => {
    const text = buildPlainTextSummary();
    const ok = await writeTextToClipboard(text);
    if (ok) {
      setSummaryCopied(true);
      showToast(t.doctorPrint.summaryCopiedToast, 'success');
      window.setTimeout(() => {
        setSummaryCopied(false);
      }, 2000);
    }
  };

  const handleShareSummary = async () => {
    const text = buildPlainTextSummary();
    const shareTitle = `${t.appBrand} — ${t.doctor.docHeaderTitle}`;

    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: shareTitle, text });
        showToast(t.doctorPrint.summarySharedToast, 'success');
        return;
      } catch (err) {
        // User intentionally dismissed the OS share sheet -> do not fallback or complain
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }
      }
    }

    // Desktop / unsupported Web Share API fallback -> copy structured text to clipboard
    await handleCopySummary();
  };

  return (
    <div className="space-y-5">
      {/* Screen-only Doctor View Action Toolbar */}
      <div className="no-print flex flex-col gap-3 rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveSection('mri')}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 whitespace-nowrap"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {t.actions.exitDoctorMode}
          </button>
          <span className="hidden text-xs text-slate-500 dark:text-slate-400 md:inline">
            {t.doctor.printHint}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Toggle 2D Spine Vector Diagram in A4 / PDF */}
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 select-none transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700/80 whitespace-nowrap">
            <input
              type="checkbox"
              checked={includeSpine2D}
              onChange={(e) => setIncludeSpine2D(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
            />
            <span>{t.doctorPrint.includeSpine2D}</span>
          </label>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {t.doctor.languageForPrint}
            </span>
            <div className="inline-flex rounded-lg bg-slate-100 p-0.5 dark:bg-slate-800">
              {(['uk', 'ru', 'en'] as Language[]).map((lng) => (
                <button
                  key={lng}
                  type="button"
                  onClick={() => setLanguage(lng)}
                  className={`rounded-md px-2.5 py-1 text-xs font-semibold uppercase transition-colors ${
                    language === lng
                      ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  {lng === 'uk' ? 'UA' : lng.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopySummary}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
                summaryCopied
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {summaryCopied ? (
                <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              <span>
                {summaryCopied ? t.doctorPrint.copiedSummaryBtn : t.doctorPrint.copySummaryBtn}
              </span>
            </button>

            <button
              type="button"
              onClick={handleShareSummary}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 whitespace-nowrap"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>{t.doctorPrint.shareSummaryBtn}</span>
            </button>

            {onOpenQr && (
              <button
                type="button"
                onClick={onOpenQr}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 whitespace-nowrap"
              >
                <QrCode className="h-3.5 w-3.5" />
                <span>{t.qr.buttonLabel}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-sky-700 whitespace-nowrap"
            >
              <Printer className="h-3.5 w-3.5" />
              {t.actions.printPdf}
            </button>
          </div>
        </div>
      </div>

      {/* Printable 1–2 Page A4 Clinical Summary Dossier (always crisp light clinical sheet) */}
      <article className="print-sheet mx-auto max-w-[920px] rounded-xl border border-slate-200 bg-white p-6 text-slate-900 shadow-md dark:border-slate-700 sm:p-8">
        {/* Document Title Header */}
        <header className="flex flex-col justify-between gap-2 border-b-2 border-slate-900 pb-3 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
              {t.doctor.docHeaderTitle}
            </h1>
            <p className="text-xs text-slate-600">{t.doctor.docHeaderSubtitle}</p>
          </div>
          <div className="font-mono text-[11px] text-slate-600 tabular-nums sm:text-right">
            <div>
              {t.doctor.generatedAt} {todayStr}
            </div>
            <div>SOR: 25.01.2025 → 19.10.2026</div>
          </div>
        </header>

        {/* Block 1: Patient Identification & Biometrics */}
        <section className="print-avoid-break mt-4 border-b border-slate-200 pb-3.5">
          <h2 className="text-xs font-bold uppercase tracking-wide text-slate-900">
            {t.doctor.patientBlock}
          </h2>
          <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs sm:grid-cols-4">
            <div className="col-span-2">
              <span className="text-slate-500">{t.anamnesis.fullName}: </span>
              <strong className={`text-slate-900 ${blurClass}`}>{fullName}</strong>
            </div>
            <div>
              <span className="text-slate-500">{t.anamnesis.birthYear}: </span>
              <strong className="font-mono text-slate-900 tabular-nums">
                {profile.birth_year} ({age} {t.anamnesis.ageSuffix})
              </strong>
            </div>
            <div>
              <span className="text-slate-500">{t.anamnesis.region}: </span>
              <strong className={`text-slate-900 ${regionName ? blurClass : ''}`}>
                {regionName || '—'}
              </strong>
            </div>

            <div>
              <span className="text-slate-500">
                {t.anamnesis.height} / {t.anamnesis.weight}:{' '}
              </span>
              <span className="font-mono text-slate-900 tabular-nums">
                {profile.height_cm ? `${profile.height_cm} ${t.anamnesis.cmUnit}` : '—'} /{' '}
                {profile.weight_kg ? `${profile.weight_kg} ${t.anamnesis.kgUnit}` : '—'}
                {bmi ? ` (BMI ${bmi})` : ''}
              </span>
            </div>
            <div>
              <span className="text-slate-500">{t.anamnesis.bloodType}: </span>
              <span className="font-mono text-slate-900">{profile.blood_type || '—'}</span>
            </div>
            <div className="col-span-2">
              <span className="text-slate-500">{t.anamnesis.allergies}: </span>
              <span className="text-slate-900">{profile.allergies || '—'}</span>
            </div>
            {(profile.chronic_conditions || profile.current_medications || profile.vaccinations) && (
              <>
                <div className="col-span-2">
                  <span className="text-slate-500">{t.anamnesis.chronicConditions}: </span>
                  <span className="text-slate-900">{profile.chronic_conditions || '—'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500">{t.anamnesis.currentMedications}: </span>
                  <span className="text-slate-900">{profile.current_medications || '—'}</span>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Block 2: Priority SOR 2026 Red Flags & Actionable Recommendations */}
        <section className="print-avoid-break mt-4 border-b border-slate-200 pb-3.5">
          <h2 className="text-xs font-bold uppercase tracking-wide text-rose-800">
            {t.doctor.redFlagsBlock}
          </h2>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {MRI_KPI_SUMMARIES.map((item) => {
              const accent =
                item.severity === 'critical'
                  ? 'border-l-rose-500 bg-rose-50/50'
                  : item.severity === 'warning'
                  ? 'border-l-amber-500 bg-amber-50/50'
                  : 'border-l-sky-500 bg-sky-50/40';
              return (
                <div
                  key={item.id}
                  className={`print-card rounded border border-slate-200 border-l-4 px-3 py-2 text-xs ${accent}`}
                >
                  <div className="font-semibold text-slate-900">
                    {item.kicker[language]} — {item.headline[language]}
                  </div>
                  <div className="mt-0.5 font-mono text-[11px] text-slate-600 tabular-nums">
                    {item.subline[language]}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Compact pending follow-up checklist line */}
          {pendingFollowUp.length > 0 && (
            <div className="print-card mt-2.5 rounded border border-sky-200/90 bg-sky-50/40 px-3 py-1.5 text-[11px] leading-snug text-slate-800">
              <span className="font-bold text-sky-900">
                {t.doctorPrint.followUpInlineLabel}:{' '}
              </span>
              {pendingFollowUp.map((task, idx) => (
                <span key={task.id}>
                  {idx > 0 ? ' · ' : ''}
                  {task.title}
                  {task.targetDate ? (
                    <span className="font-mono text-slate-500"> ({task.targetDate})</span>
                  ) : null}
                </span>
              ))}
            </div>
          )}
        </section>

        {/* Block 3: Chief Complaints by Zone */}
        <section className="print-avoid-break mt-4 border-b border-slate-200 pb-3.5">
          <h2 className="text-xs font-bold uppercase tracking-wide text-slate-900">
            {t.doctor.complaintsBlock}
          </h2>
          <div className="mt-2 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {ZONE_KEYS.map((key) => {
              const zone = complaints[key];
              const zTitle =
                language === 'uk' ? zone.zone_uk : language === 'ru' ? zone.zone_ru : zone.zone_en;
              const zText =
                language === 'uk'
                  ? zone.summary_uk
                  : language === 'ru'
                  ? zone.summary_ru
                  : zone.summary_en;
              return (
                <div key={key} className="text-xs leading-snug">
                  <div className="font-semibold text-slate-900">{zTitle}</div>
                  <p className="mt-0.5 text-slate-700">{zText}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Block 4: Compact 16-Segment SOR MRI Comparison Table + Optional 2D Spine Vector Diagram */}
        <section className="mt-4 border-b border-slate-200 pb-3.5">
          <h2 className="text-xs font-bold uppercase tracking-wide text-slate-900">
            {t.doctor.mriTableBlockPrefix},{' '}
            <span className={hasCustomRadiologist ? blurClass : ''}>{radiologistDisplay}</span>)
          </h2>
          <div
            className={
              includeSpine2D
                ? 'mt-2.5 grid grid-cols-1 items-start gap-3 md:grid-cols-[190px_minmax(0,1fr)] print:grid-cols-[155px_minmax(0,1fr)]'
                : 'mt-2'
            }
          >
            {includeSpine2D && (
              <DoctorSpine2DSvg
                segments={DETAILED_SPINE_SEGMENTS}
                language={language}
                t={t}
              />
            )}

            <div className="min-w-0 overflow-x-auto">
              <table className="w-full border-collapse text-left text-[11px] leading-snug">
                <thead>
                  <tr className="border-y border-slate-300 bg-slate-50 text-slate-700">
                    <th className="py-1.5 pr-2 font-semibold whitespace-nowrap">
                      {t.mri.colSegment}
                    </th>
                    <th className="px-2 py-1.5 font-semibold">{t.mri.col2025}</th>
                    <th className="px-2 py-1.5 font-semibold">{t.mri.col2026}</th>
                    <th className="px-2 py-1.5 font-semibold">{t.mri.colCanalRoots}</th>
                    <th className="py-1.5 pl-2 font-semibold whitespace-nowrap">
                      {t.mri.colDynamics}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {DETAILED_SPINE_SEGMENTS.map((seg) => {
                    const glyph =
                      seg.status === 'negative' ? '▼' : seg.status === 'new' ? '+' : '●';
                    const pillClass =
                      seg.status === 'negative'
                        ? 'bg-rose-50 text-rose-800 border-rose-200'
                        : seg.status === 'new'
                        ? 'bg-amber-50 text-amber-900 border-amber-200'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200';

                    return (
                      <tr key={seg.id}>
                        <td className="py-1.5 pr-2 font-mono font-bold text-slate-900 whitespace-nowrap tabular-nums">
                          {seg.id}
                        </td>
                        <td className="px-2 py-1.5 text-slate-700">{seg.y2025.finding[language]}</td>
                        <td className="px-2 py-1.5 font-medium text-slate-900">
                          {seg.y2026.finding[language]}
                        </td>
                        <td className="px-2 py-1.5 text-slate-600">
                          {seg.y2026.canal[language]} · {seg.y2026.roots[language]}
                        </td>
                        <td className="py-1.5 pl-2 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${pillClass}`}
                          >
                            {glyph} {seg.statusLabel[language]}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Block 5: Systemic SOR Findings */}
        <section className="print-avoid-break mt-4 border-b border-slate-200 pb-3.5">
          <h2 className="text-xs font-bold uppercase tracking-wide text-slate-900">
            {t.doctor.systemicBlock}
          </h2>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {SYSTEMIC_SOR_FINDINGS.map((f) => (
              <div key={f.id} className="text-xs leading-snug">
                <span className="font-semibold text-slate-900">{f.title[language]}: </span>
                <span className="text-slate-700">{f.body[language]}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Block 6: Active & Recent Treatment Courses */}
        <section className="print-avoid-break mt-4 border-b border-slate-200 pb-3.5">
          <h2 className="text-xs font-bold uppercase tracking-wide text-slate-900">
            {t.doctor.treatmentsBlock}
            {treatments.length > 0 ? ` (${doctorTreatments.length})` : ''}
          </h2>
          {doctorTreatments.length === 0 ? (
            <p className="mt-1.5 text-xs italic text-slate-500">{t.doctor.noTreatmentsNote}</p>
          ) : (
            <ul className="mt-2 space-y-2 text-[11px] leading-snug text-slate-700">
              {doctorTreatments.map((course) => {
                const linkedRecLabel = course.linkedRecordId
                  ? recordLabelById.get(course.linkedRecordId)
                  : null;
                return (
                  <li
                    key={course.id}
                    className={`print-treatment-item rounded border border-slate-200 px-2.5 py-1.5 ${
                      course.status === 'active'
                        ? 'border-l-4 border-l-emerald-600 bg-emerald-50/35'
                        : 'bg-slate-50/40'
                    }`}
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                      <div className="flex flex-wrap items-baseline gap-x-1.5">
                        <span
                          className={`font-semibold ${
                            course.status === 'active' ? 'text-emerald-800' : 'text-slate-600'
                          }`}
                        >
                          [{t.treatments.statuses[course.status]}]
                        </span>
                        <span className="font-semibold text-slate-900">
                          {course.prescribedBy || t.treatments.courseTypes[course.courseType]}
                        </span>
                        <span className="text-slate-500">
                          · {t.treatments.courseTypes[course.courseType]}
                        </span>
                        {linkedRecLabel && (
                          <span className="text-slate-500">
                            · {t.treatments.linkedRecordPrefix} {linkedRecLabel}
                          </span>
                        )}
                      </div>
                      {course.period && course.period !== '—' && (
                        <span className="shrink-0 font-mono text-[10.5px] text-slate-500 tabular-nums">
                          {course.period}
                        </span>
                      )}
                    </div>

                    {course.medications.length > 0 && (
                      <div className="mt-1 text-slate-800">
                        {course.medications.map((med, idx) => {
                          const metaParts = [med.dosage, med.schedule, med.duration].filter(Boolean);
                          return (
                            <span key={med.id}>
                              {idx > 0 ? '; ' : ''}
                              <strong className="font-medium text-slate-900">{med.name}</strong>
                              {metaParts.length > 0 ? ` (${metaParts.join(', ')})` : ''}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {course.proceduresAndRecommendations && (
                      <div className="mt-0.5 text-slate-600">
                        <span className="font-medium text-slate-700">
                          {t.treatments.proceduresLabel}:{' '}
                        </span>
                        {course.proceduresAndRecommendations}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Block 7: Chronological Index of Prior Studies */}
        <section className="print-avoid-break mt-4 border-b border-slate-200 pb-3.5">
          <h2 className="text-xs font-bold uppercase tracking-wide text-slate-900">
            {t.doctor.otherRecordsBlock} ({records.length})
          </h2>
          <ul className="mt-2 grid grid-cols-1 gap-x-6 gap-y-1 text-[11px] text-slate-700 sm:grid-cols-2">
            {records.map((rec) => (
              <li key={rec.id} className="flex items-baseline justify-between gap-2">
                <span className="truncate">
                  <strong className="font-medium text-slate-900">{rec.title[language]}</strong>
                  {rec.notes ? ` — ${rec.notes}` : ''}
                </span>
                <span className="shrink-0 font-mono text-[10.5px] text-slate-500 tabular-nums">
                  {rec.date}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Block 7: External Documents & Links */}
        <section className="print-avoid-break mt-4 border-b border-slate-200 pb-3.5">
          <h2 className="text-xs font-bold uppercase tracking-wide text-slate-900">
            {t.doctor.linksBlock}
          </h2>
          {attachments.length === 0 ? (
            <p className="mt-1.5 text-xs italic text-slate-500">{t.doctor.noLinksNote}</p>
          ) : (
            <ul className="mt-2 space-y-1.5 text-[11px]">
              {attachments.map((att) => {
                const urls = getAttachmentUrls(att);
                const renderClickableUrl = (rawUrl: string) => {
                  if (!isValidHttpUrl(rawUrl)) {
                    return <span className="font-mono text-slate-600 break-all">{rawUrl}</span>;
                  }
                  return (
                    <a
                      href={rawUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cursor-pointer font-mono text-sky-700 underline-offset-2 transition-colors hover:text-sky-900 hover:underline break-all"
                    >
                      {rawUrl}
                      <span
                        aria-hidden="true"
                        className="ml-1 inline-block font-sans text-[10px] leading-none"
                      >
                        ↗
                      </span>
                    </a>
                  );
                };

                if (urls.length <= 1) {
                  const singleUrl = urls[0] || att.url;
                  return (
                    <li key={att.id} className="flex flex-wrap items-baseline gap-x-2">
                      <span className="font-semibold text-slate-900">{att.title}</span>
                      <span className="text-slate-400">·</span>
                      {renderClickableUrl(singleUrl)}
                      {att.linkedSegment && (
                        <span className="font-mono text-slate-600">
                          [{getSpineSegmentLinkLabel(att.linkedSegment, language)}]
                        </span>
                      )}
                    </li>
                  );
                }

                return (
                  <li key={att.id} className="space-y-0.5">
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <span className="font-semibold text-slate-900">{att.title}</span>
                      {att.linkedSegment && (
                        <span className="font-mono text-slate-600">
                          [{getSpineSegmentLinkLabel(att.linkedSegment, language)}]
                        </span>
                      )}
                    </div>
                    <ul className="space-y-0.5 pl-3">
                      {urls.map((linkUrl, idx) => (
                        <li
                          key={`${att.id}:${idx}`}
                          className="flex flex-wrap items-baseline gap-x-1.5"
                        >
                          <span className="font-mono font-semibold text-slate-600">
                            {t.archive.pagePrefix} {idx + 1}:
                          </span>
                          {renderClickableUrl(linkUrl)}
                        </li>
                      ))}
                    </ul>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Disclaimer Footer */}
        <footer className="mt-3 text-[10.5px] leading-relaxed text-slate-500">
          {meta.disclaimer[language]}
        </footer>
      </article>
    </div>
  );
};
