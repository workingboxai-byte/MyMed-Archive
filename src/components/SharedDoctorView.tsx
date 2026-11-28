import React, { useEffect, useMemo, useState } from 'react';
import {
  Printer,
  ShieldCheck,
  Clock,
  AlertTriangle,
  Sun,
  Moon,
  Loader2,
  Stethoscope,
} from 'lucide-react';
import { safeMergeStoredState, StoredState, useMedicalArchive } from '../context/MedicalArchiveContext';
import { fetchSharedMedicalCard } from '../services/supabaseClient';
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

interface SharedDoctorViewProps {
  shareToken: string;
  onExitShare: () => void;
}

export const SharedDoctorView: React.FC<SharedDoctorViewProps> = ({
  shareToken,
  onExitShare,
}) => {
  const { language, setLanguage, theme, toggleTheme, t } = useMedicalArchive();

  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [sharedCard, setSharedCard] = useState<StoredState | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [includeSpine2D, setIncludeSpine2D] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setErrorState(null);

    fetchSharedMedicalCard(shareToken)
      .then(({ result, error }) => {
        if (!active) return;
        if (error || !result) {
          setErrorState(error || 'EXPIRED_OR_NOT_FOUND');
          setSharedCard(null);
          setExpiresAt(null);
        } else {
          setSharedCard(safeMergeStoredState(result.snapshot));
          setExpiresAt(result.expiresAt);
        }
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setErrorState('EXPIRED_OR_NOT_FOUND');
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [shareToken]);

  const formatExpiry = (iso: string | null): string => {
    if (!iso) return '24h';
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

  const pendingFollowUp = useMemo(
    () => (sharedCard ? sharedCard.followUpPlan.filter((task) => !task.completed) : []),
    [sharedCard],
  );

  const doctorTreatments = useMemo(() => {
    if (!sharedCard) return [];
    const activeCourses = sharedCard.treatments
      .filter((tr) => tr.status === 'active')
      .sort((a, b) => b.sortDate.localeCompare(a.sortDate));
    const recentCompleted = sharedCard.treatments
      .filter((tr) => tr.status !== 'active')
      .sort((a, b) => b.sortDate.localeCompare(a.sortDate))
      .slice(0, 4);
    return [...activeCourses, ...recentCompleted];
  }, [sharedCard]);

  const recordLabelById = useMemo(() => {
    const map = new Map<string, string>();
    if (!sharedCard) return map;
    sharedCard.records.forEach((r) => {
      map.set(
        r.id,
        r.date && r.date !== '—' ? `${r.title[language]} (${r.date})` : r.title[language],
      );
    });
    return map;
  }, [sharedCard, language]);

  return (
    <div className="min-h-screen bg-[#EEF2F7] text-slate-900 transition-colors duration-200 dark:bg-[#0B1120] dark:text-slate-100">
      {/* Top Read-Only Clinical Header */}
      <header className="no-print sticky top-0 z-30 border-b border-slate-200/90 bg-white/95 px-4 py-3 backdrop-blur-xs dark:border-slate-800 dark:bg-slate-900/95 sm:px-6">
        <div className="mx-auto flex max-w-[960px] flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-600 text-white">
              <Stethoscope className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-display text-sm font-extrabold text-slate-900 dark:text-white">
                  {t.appBrand}
                </span>
                <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 dark:border-emerald-800/80 dark:bg-emerald-950/60 dark:text-emerald-300">
                  <ShieldCheck className="h-3 w-3 shrink-0" />
                  {t.doctorShare.readOnlyBadge}
                </span>
              </div>
              {expiresAt && (
                <div className="mt-0.5 flex items-center gap-1 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                  <Clock className="h-3 w-3 shrink-0" />
                  <span>
                    {t.doctorShare.validUntilLabel}: {formatExpiry(expiresAt)}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {sharedCard && (
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 select-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={includeSpine2D}
                  onChange={(e) => setIncludeSpine2D(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                />
                <span>{t.doctorPrint.includeSpine2D}</span>
              </label>
            )}

            <button
              type="button"
              onClick={toggleTheme}
              title={theme === 'dark' ? t.actions.themeLight : t.actions.themeDark}
              aria-label={theme === 'dark' ? t.actions.themeLight : t.actions.themeDark}
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-slate-600" />
              )}
            </button>

            <div className="inline-flex rounded-lg bg-slate-100 p-0.5 dark:bg-slate-800">
              {(['uk', 'ru', 'en'] as Language[]).map((lng) => (
                <button
                  key={lng}
                  type="button"
                  onClick={() => setLanguage(lng)}
                  className={`rounded-md px-2 py-1 text-xs font-semibold uppercase transition-colors ${
                    language === lng
                      ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  {lng === 'uk' ? 'UA' : lng.toUpperCase()}
                </button>
              ))}
            </div>

            {sharedCard && (
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-sky-700 whitespace-nowrap"
              >
                <Printer className="h-3.5 w-3.5" />
                {t.actions.printPdf}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[960px] px-4 py-6 sm:px-6 print:p-0">
        {loading ? (
          <div className="mx-auto flex max-w-md flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <Loader2 className="h-8 w-8 animate-spin text-sky-600 dark:text-cyan-400" />
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              {t.doctorShare.loadingText}
            </div>
          </div>
        ) : errorState || !sharedCard ? (
          <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h1 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
              {t.doctorShare.expiredTitle}
            </h1>
            <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              {t.doctorShare.expiredBody}
            </p>
            <button
              type="button"
              onClick={onExitShare}
              className="mt-5 inline-flex items-center justify-center rounded-lg bg-sky-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-sky-700"
            >
              {t.doctorShare.openMainAppBtn}
            </button>
          </div>
        ) : (
          (() => {
            const { profile, complaints, sorMeta, records, attachments, treatments, rawMeta } =
              sharedCard;
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
            const radiologistDisplay =
              sorMeta.radiologist && sorMeta.radiologist.trim().length > 0
                ? sorMeta.radiologist
                : t.mri.radiologistDefault;
            const todayStr = new Date().toISOString().slice(0, 10);

            return (
              <article className="print-sheet mx-auto max-w-[920px] rounded-xl border border-slate-200 bg-white p-6 text-slate-900 shadow-md dark:border-slate-700 sm:p-8">
                {/* Document Title Header */}
                <header className="flex flex-col justify-between gap-2 border-b-2 border-slate-900 pb-3 sm:flex-row sm:items-end">
                  <div>
                    <h1 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                      {t.doctor.docHeaderTitle}
                    </h1>
                    <p className="text-xs text-slate-600">{t.doctorShare.sharedHeaderSubtitle}</p>
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
                      <strong className="text-slate-900">{fullName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">{t.anamnesis.birthYear}: </span>
                      <strong className="font-mono text-slate-900 tabular-nums">
                        {profile.birth_year} ({age} {t.anamnesis.ageSuffix})
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500">{t.anamnesis.region}: </span>
                      <strong className="text-slate-900">{regionName || '—'}</strong>
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
                    {(profile.chronic_conditions ||
                      profile.current_medications ||
                      profile.vaccinations) && (
                      <>
                        <div className="col-span-2">
                          <span className="text-slate-500">{t.anamnesis.chronicConditions}: </span>
                          <span className="text-slate-900">
                            {profile.chronic_conditions || '—'}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-slate-500">
                            {t.anamnesis.currentMedications}:{' '}
                          </span>
                          <span className="text-slate-900">
                            {profile.current_medications || '—'}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </section>

                {/* Block 2: Priority SOR 2026 Red Flags & Follow-up Plan */}
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
                        language === 'uk'
                          ? zone.zone_uk
                          : language === 'ru'
                          ? zone.zone_ru
                          : zone.zone_en;
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
                    {t.doctor.mriTableBlockPrefix}, {radiologistDisplay})
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
                              seg.status === 'negative'
                                ? '▼'
                                : seg.status === 'new'
                                ? '+'
                                : '●';
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
                                <td className="px-2 py-1.5 text-slate-700">
                                  {seg.y2025.finding[language]}
                                </td>
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
                    <p className="mt-1.5 text-xs italic text-slate-500">
                      {t.doctor.noTreatmentsNote}
                    </p>
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
                                    course.status === 'active'
                                      ? 'text-emerald-800'
                                      : 'text-slate-600'
                                  }`}
                                >
                                  [{t.treatments.statuses[course.status]}]
                                </span>
                                <span className="font-semibold text-slate-900">
                                  {course.prescribedBy ||
                                    t.treatments.courseTypes[course.courseType]}
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
                                  const metaParts = [
                                    med.dosage,
                                    med.schedule,
                                    med.duration,
                                  ].filter(Boolean);
                                  return (
                                    <span key={med.id}>
                                      {idx > 0 ? '; ' : ''}
                                      <strong className="font-medium text-slate-900">
                                        {med.name}
                                      </strong>
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
                          <strong className="font-medium text-slate-900">
                            {rec.title[language]}
                          </strong>
                          {rec.notes ? ` — ${rec.notes}` : ''}
                        </span>
                        <span className="shrink-0 font-mono text-[10.5px] text-slate-500 tabular-nums">
                          {rec.date}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>

                {/* Block 8: External Documents & Links */}
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
                            return (
                              <span className="font-mono text-slate-600 break-all">{rawUrl}</span>
                            );
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
                  {rawMeta.disclaimer[language]}
                </footer>
              </article>
            );
          })()
        )}
      </main>
    </div>
  );
};
