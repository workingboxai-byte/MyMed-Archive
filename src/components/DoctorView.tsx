import React from 'react';
import { Printer, ArrowLeft } from 'lucide-react';
import { useMedicalArchive } from '../context/MedicalArchiveContext';
import {
  DETAILED_SPINE_SEGMENTS,
  MRI_KPI_SUMMARIES,
  SYSTEMIC_SOR_FINDINGS,
} from '../data/spineSegmentsData';
import { ComplaintZoneKey, Language } from '../types/medical';
import { getAttachmentUrls, isValidHttpUrl } from '../data/recordsLocalization';

const ZONE_KEYS: ComplaintZoneKey[] = [
  'lumbar_sacral',
  'thoracic',
  'cervical_head',
  'right_side_spasms_load',
];

export const DoctorView: React.FC = () => {
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
    setActiveSection,
  } = useMedicalArchive();

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
                  className={`rounded border border-slate-200 border-l-4 px-3 py-2 text-xs ${accent}`}
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

        {/* Block 4: Compact 16-Segment SOR MRI Comparison Table (anonymized expert label) */}
        <section className="mt-4 border-b border-slate-200 pb-3.5">
          <h2 className="text-xs font-bold uppercase tracking-wide text-slate-900">
            {t.doctor.mriTableBlockPrefix},{' '}
            <span className={hasCustomRadiologist ? blurClass : ''}>{radiologistDisplay}</span>)
          </h2>
          <div className="mt-2 overflow-x-auto">
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

        {/* Block 6: Chronological Index of Prior Studies */}
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
                        <span className="font-mono text-slate-600">[{att.linkedSegment}]</span>
                      )}
                    </li>
                  );
                }

                return (
                  <li key={att.id} className="space-y-0.5">
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <span className="font-semibold text-slate-900">{att.title}</span>
                      {att.linkedSegment && (
                        <span className="font-mono text-slate-600">[{att.linkedSegment}]</span>
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
