import React, { useMemo, useState } from 'react';
import { Box, ExternalLink } from 'lucide-react';
import { useMedicalArchive } from '../context/MedicalArchiveContext';
import {
  DETAILED_SPINE_SEGMENTS,
  MRI_KPI_SUMMARIES,
  SYSTEMIC_SOR_FINDINGS,
} from '../data/spineSegmentsData';
import { MriViewMode, RegionFilter, SegmentStatus } from '../types/medical';
import { getAttachmentUrls } from '../data/recordsLocalization';
import { SpineSchematicSvg } from './SpineSchematicSvg';
import { MriDynamicsCharts } from './MriDynamicsCharts';

function statusBadgeClasses(status: SegmentStatus): { glyph: string; pillClass: string } {
  if (status === 'negative') {
    return {
      glyph: '▼',
      pillClass:
        'bg-rose-100/80 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/70',
    };
  }
  if (status === 'new') {
    return {
      glyph: '+',
      pillClass:
        'bg-amber-100/80 text-amber-900 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/70',
    };
  }
  return {
    glyph: '●',
    pillClass:
      'bg-emerald-100/80 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/70',
  };
}

function severityCardClasses(severity: 'critical' | 'warning' | 'info', selected: boolean) {
  if (severity === 'critical') {
    return {
      kicker: 'text-rose-700 dark:text-rose-400',
      box: selected
        ? 'border-rose-300 border-l-4 border-l-rose-500 bg-rose-50/90 ring-1 ring-rose-300/60 dark:border-rose-800 dark:border-l-rose-500 dark:bg-rose-950/40'
        : 'border-slate-200/90 border-l-4 border-l-rose-500 bg-rose-50/50 hover:bg-rose-50/80 dark:border-slate-800 dark:border-l-rose-500 dark:bg-rose-950/20 dark:hover:bg-rose-950/35',
    };
  }
  if (severity === 'warning') {
    return {
      kicker: 'text-amber-800 dark:text-amber-400',
      box: selected
        ? 'border-amber-300 border-l-4 border-l-amber-500 bg-amber-50/90 ring-1 ring-amber-300/60 dark:border-amber-800 dark:border-l-amber-500 dark:bg-amber-950/40'
        : 'border-slate-200/90 border-l-4 border-l-amber-500 bg-amber-50/50 hover:bg-amber-50/80 dark:border-slate-800 dark:border-l-amber-500 dark:bg-amber-950/20 dark:hover:bg-amber-950/35',
    };
  }
  return {
    kicker: 'text-sky-700 dark:text-cyan-400',
    box: selected
      ? 'border-sky-300 border-l-4 border-l-sky-500 bg-sky-50/90 ring-1 ring-sky-300/60 dark:border-sky-800 dark:border-l-cyan-500 dark:bg-sky-950/40'
      : 'border-slate-200/90 border-l-4 border-l-sky-500 bg-sky-50/45 hover:bg-sky-50/80 dark:border-slate-800 dark:border-l-cyan-500 dark:bg-sky-950/20 dark:hover:bg-sky-950/35',
  };
}

export const MriDynamicsView: React.FC = () => {
  const {
    language,
    theme,
    privacyMode,
    t,
    meta,
    profile,
    sorMeta,
    selectedMriSegment,
    setSelectedMriSegment,
    jumpTo3DAtlasSegment,
    attachments,
  } = useMedicalArchive();

  const [viewMode, setViewMode] = useState<MriViewMode>('compare');
  const [regionFilter, setRegionFilter] = useState<RegionFilter>('all');

  const filteredSegments = useMemo(() => {
    if (regionFilter === 'all') return DETAILED_SPINE_SEGMENTS;
    return DETAILED_SPINE_SEGMENTS.filter((s) => s.region === regionFilter);
  }, [regionFilter]);

  const selectedSegment = useMemo(() => {
    return (
      DETAILED_SPINE_SEGMENTS.find((s) => s.id === selectedMriSegment) ||
      DETAILED_SPINE_SEGMENTS.find((s) => s.id === 'L4-L5') ||
      DETAILED_SPINE_SEGMENTS[0]
    );
  }, [selectedMriSegment]);

  const segmentAttachments = useMemo(
    () => attachments.filter((a) => a.linkedSegment === selectedSegment.id),
    [attachments, selectedSegment.id],
  );

  const handleRegionChange = (nextRegion: RegionFilter) => {
    setRegionFilter(nextRegion);
    const list =
      nextRegion === 'all'
        ? DETAILED_SPINE_SEGMENTS
        : DETAILED_SPINE_SEGMENTS.filter((s) => s.region === nextRegion);
    if (list.length > 0 && !list.some((s) => s.id === selectedMriSegment)) {
      setSelectedMriSegment(list[0].id);
    }
  };

  const handleSelectSegment = (id: string) => {
    setSelectedMriSegment(id);
    const target = DETAILED_SPINE_SEGMENTS.find((s) => s.id === id);
    if (target && regionFilter !== 'all' && target.region !== regionFilter) {
      setRegionFilter('all');
    }
  };

  const patientName =
    (language === 'uk'
      ? profile.full_name_uk
      : language === 'ru'
      ? profile.full_name_ru
      : profile.full_name_en) || t.patientShort;

  const hasCustomRadiologist = Boolean(sorMeta.radiologist && sorMeta.radiologist.trim().length > 0);
  const radiologistDisplay = hasCustomRadiologist
    ? sorMeta.radiologist
    : t.mri.radiologistDefault;

  const show2025 = viewMode === '2025' || viewMode === 'compare';
  const show2026 = viewMode === '2026' || viewMode === 'compare';
  const selectedBadge = statusBadgeClasses(selectedSegment.status);

  const blurClass = privacyMode ? 'blur-[5px] select-none transition-all' : 'transition-all';

  return (
    <div className="space-y-6">
      {/* Header panel with SOR metadata, period mode switcher, and 4 color-coded KPI cards */}
      <section className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-sky-700 dark:text-cyan-400">
                {t.mri.providerLabel}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                {t.mri.radiologistPrefix}{' '}
                <span className={hasCustomRadiologist ? blurClass : ''}>{radiologistDisplay}</span>
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{t.mri.intervalLabel}</span>
            </div>

            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-2xl">
              {t.mri.sectionTitle}
            </h1>

            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 sm:text-sm">
              <span className={`font-semibold text-slate-900 dark:text-white ${blurClass}`}>
                {patientName}
              </span>{' '}
              ({profile.birth_year})
              <span className="mx-1.5 text-slate-300 dark:text-slate-700">·</span>
              <span className="font-mono tabular-nums">{t.mri.scansLabel}</span>
              <span className="mx-1.5 text-slate-300 dark:text-slate-700">·</span>
              <span className="font-mono tabular-nums">{t.mri.reportsLabel}</span>
            </p>
          </div>

          {/* Period / Delta mode segmented control */}
          <div className="flex shrink-0 flex-col gap-1.5 lg:items-end">
            <div
              className="inline-flex w-full rounded-lg bg-slate-100 p-1 dark:bg-slate-800 sm:w-auto"
              role="group"
              aria-label={t.mri.modeCompare}
            >
              {(
                [
                  { id: '2025', label: t.mri.mode2025 },
                  { id: '2026', label: t.mri.mode2026 },
                  { id: 'compare', label: t.mri.modeCompare },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setViewMode(item.id)}
                  className={`flex-1 rounded-md px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap sm:flex-initial ${
                    viewMode === item.id
                      ? 'bg-sky-600 text-white shadow-xs dark:bg-cyan-600'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">{t.mri.modeHint}</span>
          </div>
        </div>

        {/* 4 Color-Coded Key Changes Summary KPI Row */}
        <div className="mt-5 grid grid-cols-1 gap-3 border-t border-slate-200 pt-5 dark:border-slate-800 sm:grid-cols-2 xl:grid-cols-4">
          {MRI_KPI_SUMMARIES.map((kpi) => {
            const styles = severityCardClasses(kpi.severity, selectedSegment.id === kpi.targetSegment);
            return (
              <button
                key={kpi.id}
                type="button"
                onClick={() => handleSelectSegment(kpi.targetSegment)}
                className={`rounded-lg border p-3.5 text-left transition-colors ${styles.box}`}
              >
                <div className={`text-xs font-semibold ${styles.kicker}`}>
                  {kpi.kicker[language]}
                </div>
                <div className="mt-1 text-sm font-bold leading-snug text-slate-900 dark:text-slate-100">
                  {kpi.headline[language]}
                </div>
                <div className="mt-1 font-mono text-[11px] text-slate-600 tabular-nums dark:text-slate-300">
                  {kpi.subline[language]}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Region Filter Bar + Pill Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex flex-wrap items-center gap-1 rounded-lg border border-slate-200/90 bg-white p-1 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          {(
            [
              { id: 'all', label: t.mri.regionAll },
              {
                id: 'cervical',
                label: `${t.mri.regionLabels.cervical} (${t.mri.regionRanges.cervical})`,
              },
              {
                id: 'thoracic',
                label: `${t.mri.regionLabels.thoracic} (${t.mri.regionRanges.thoracic})`,
              },
              {
                id: 'lumbar',
                label: `${t.mri.regionLabels.lumbar} (${t.mri.regionRanges.lumbar})`,
              },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleRegionChange(tab.id)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                regionFilter === tab.id
                  ? 'bg-slate-900 text-white dark:bg-cyan-600 dark:text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 font-medium text-rose-800 dark:border-rose-800/70 dark:bg-rose-950/50 dark:text-rose-300">
            {t.mri.legendNegative}
          </span>
          <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 font-medium text-amber-900 dark:border-amber-800/70 dark:bg-amber-950/50 dark:text-amber-300">
            {t.mri.legendNew}
          </span>
          <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 font-medium text-emerald-800 dark:border-emerald-800/70 dark:bg-emerald-950/50 dark:text-emerald-300">
            {t.mri.legendStable}
          </span>
        </div>
      </div>

      {/* Main 2-Column Workspace: Spine Schematic (Left) + Inspector & Charts & Systemic Findings (Right) */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SpineSchematicSvg
            segments={DETAILED_SPINE_SEGMENTS}
            selectedSegmentId={selectedSegment.id}
            onSelectSegment={handleSelectSegment}
            regionFilter={regionFilter}
            viewMode={viewMode}
            language={language}
            theme={theme}
            t={t}
          />
        </div>

        <div className="space-y-6 lg:col-span-7">
          {/* Selected Segment Detail Inspector */}
          <section className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-200 pb-4 dark:border-slate-800">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-semibold text-sky-700 dark:text-cyan-400">
                    {t.mri.regionLabels[selectedSegment.region]}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${selectedBadge.pillClass}`}
                  >
                    <span aria-hidden="true">{selectedBadge.glyph}</span>
                    <span>{selectedSegment.statusLabel[language]}</span>
                  </span>
                </div>
                <h2 className="mt-1.5 text-xl font-bold text-slate-900 dark:text-slate-50 sm:text-2xl">
                  {t.mri.segmentPrefix}{' '}
                  <span className="font-mono tabular-nums">{selectedSegment.id}</span>
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="font-mono text-xs text-slate-500 tabular-nums dark:text-slate-400">
                  {selectedSegment.metrics.canalSagittal2025 !== null &&
                    selectedSegment.metrics.canalSagittal2026 !== null && (
                      <span>
                        {t.mri.canalLabel} {selectedSegment.metrics.canalSagittal2025} →{' '}
                        <strong className="text-slate-900 dark:text-slate-100">
                          {selectedSegment.metrics.canalSagittal2026} {t.mri.chartMmUnit}
                        </strong>
                      </span>
                    )}
                </div>
                <button
                  type="button"
                  onClick={() => jumpTo3DAtlasSegment(selectedSegment.id)}
                  title={`${t.nav.atlas3d}: ${selectedSegment.id}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700 transition-colors hover:border-sky-300 hover:bg-sky-100 dark:border-cyan-800/80 dark:bg-cyan-950/50 dark:text-cyan-300 dark:hover:border-cyan-600 dark:hover:bg-cyan-950"
                >
                  <Box className="h-3.5 w-3.5" />
                  <span>{t.actions.openIn3D}</span>
                </button>
              </div>
            </div>

            {viewMode === 'compare' && (
              <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/50">
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {t.mri.deltaHeader}
                </div>
                <p className="mt-1 text-sm font-medium leading-relaxed text-slate-900 dark:text-slate-100">
                  {selectedSegment.deltaSummary[language]}
                </p>
              </div>
            )}

            <div
              className={`mt-4 grid gap-4 ${
                show2025 && show2026 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
              }`}
            >
              {show2025 && (
                <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-950/50">
                  <div className="flex items-baseline justify-between gap-2 text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {t.mri.scan2025Title}
                    </span>
                    <span className="font-mono text-slate-500 tabular-nums dark:text-slate-400">
                      {t.mri.protocol2025}
                    </span>
                  </div>
                  <div className="mt-2 text-sm font-semibold leading-snug text-slate-900 dark:text-slate-100">
                    {selectedSegment.y2025.finding[language]}
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    {selectedSegment.y2025.details[language]}
                  </p>
                  <div className="mt-3 space-y-1.5 border-t border-slate-200 pt-2.5 text-xs dark:border-slate-800">
                    <div>
                      <span className="font-medium text-slate-500 dark:text-slate-400">
                        {t.mri.canalLabel}{' '}
                      </span>
                      <span className="text-slate-800 dark:text-slate-200">
                        {selectedSegment.y2025.canal[language]}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-slate-500 dark:text-slate-400">
                        {t.mri.rootsLabel}{' '}
                      </span>
                      <span className="text-slate-800 dark:text-slate-200">
                        {selectedSegment.y2025.roots[language]}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {show2026 && (
                <div className="rounded-lg border border-sky-200 bg-sky-50/35 p-4 dark:border-cyan-900/70 dark:bg-sky-950/20">
                  <div className="flex items-baseline justify-between gap-2 text-xs">
                    <span className="font-bold text-sky-800 dark:text-cyan-400">
                      {t.mri.scan2026Title}
                    </span>
                    <span className="font-mono text-slate-500 tabular-nums dark:text-slate-400">
                      {t.mri.protocol2026}
                    </span>
                  </div>
                  <div className="mt-2 text-sm font-semibold leading-snug text-slate-900 dark:text-slate-50">
                    {selectedSegment.y2026.finding[language]}
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    {selectedSegment.y2026.details[language]}
                  </p>
                  <div className="mt-3 space-y-1.5 border-t border-sky-200/70 pt-2.5 text-xs dark:border-slate-800">
                    <div>
                      <span className="font-medium text-slate-500 dark:text-slate-400">
                        {t.mri.canalLabel}{' '}
                      </span>
                      <span className="text-slate-900 dark:text-slate-100">
                        {selectedSegment.y2026.canal[language]}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-slate-500 dark:text-slate-400">
                        {t.mri.rootsLabel}{' '}
                      </span>
                      <span className="text-slate-900 dark:text-slate-100">
                        {selectedSegment.y2026.roots[language]}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {segmentAttachments.length > 0 && (
              <div className="mt-4 border-t border-slate-200 pt-3.5 dark:border-slate-800">
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {t.mri.linkedAttachments}
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {segmentAttachments.flatMap((att) => {
                    const urls = getAttachmentUrls(att);
                    return urls.map((linkUrl, idx) => (
                      <a
                        key={`${att.id}:${idx}`}
                        href={linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-sky-700 transition-colors hover:border-sky-300 hover:bg-sky-50 dark:border-slate-700 dark:bg-slate-800 dark:text-cyan-400 dark:hover:border-cyan-600"
                      >
                        <span>
                          {att.title}
                          {urls.length > 1 ? ` — ${t.archive.pagePrefix} ${idx + 1}` : ''}
                        </span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ));
                  })}
                </div>
              </div>
            )}
          </section>

          {/* Quantitative Charts */}
          <MriDynamicsCharts
            segments={DETAILED_SPINE_SEGMENTS}
            selectedSegmentId={selectedSegment.id}
            onSelectSegment={handleSelectSegment}
            regionFilter={regionFilter}
            t={t}
          />

          {/* 4 Color-Coded Systemic SOR Findings */}
          <section className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
            <div className="flex items-baseline justify-between gap-2 border-b border-slate-200 pb-3 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {t.mri.systemicTitle}
              </h3>
              <span className="font-mono text-xs text-slate-500 tabular-nums dark:text-slate-400">
                2025 vs 2026
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              {SYSTEMIC_SOR_FINDINGS.map((finding) => {
                const styles = severityCardClasses(finding.severity, false);

                return (
                  <div
                    key={finding.id}
                    className={`rounded-lg border p-4 ${styles.box}`}
                  >
                    <div className={`text-xs font-semibold ${styles.kicker}`}>
                      {finding.tag[language]}
                    </div>
                    <h4 className="mt-1 text-sm font-bold text-slate-900 dark:text-slate-100">
                      {finding.title[language]}
                    </h4>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                      {finding.body[language]}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {finding.linkedSegments.map((segId) => (
                        <button
                          key={segId}
                          type="button"
                          onClick={() => handleSelectSegment(segId)}
                          className="rounded-md border border-slate-200 bg-white px-2 py-0.5 font-mono text-[11px] font-medium text-slate-700 transition-colors hover:border-sky-400 hover:text-sky-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-cyan-500 dark:hover:text-cyan-300"
                        >
                          {segId}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>

      {/* Full Summary Comparison Table (All 16 Segments) */}
      <section className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="mb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            {t.mri.tableTitle}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">{t.mri.tableSubtitle}</p>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300">
                <th className="px-3 py-2.5 font-semibold whitespace-nowrap">{t.mri.colSegment}</th>
                <th className="px-3 py-2.5 font-semibold">{t.mri.col2025}</th>
                <th className="px-3 py-2.5 font-semibold">{t.mri.col2026}</th>
                <th className="px-3 py-2.5 font-semibold">{t.mri.colCanalRoots}</th>
                <th className="px-3 py-2.5 font-semibold whitespace-nowrap">{t.mri.colDynamics}</th>
                <th className="px-3 py-2.5 text-right font-semibold whitespace-nowrap">3D</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredSegments.map((seg) => {
                const isSelected = seg.id === selectedSegment.id;
                const badge = statusBadgeClasses(seg.status);
                return (
                  <tr
                    key={seg.id}
                    onClick={() => handleSelectSegment(seg.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-sky-50/80 dark:bg-sky-950/35'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="px-3 py-2.5 font-mono font-bold text-slate-900 whitespace-nowrap tabular-nums dark:text-slate-100">
                      {seg.id}
                    </td>
                    <td className="max-w-[220px] px-3 py-2.5 text-slate-600 dark:text-slate-300">
                      {seg.y2025.finding[language]}
                    </td>
                    <td className="max-w-[240px] px-3 py-2.5 font-medium text-slate-900 dark:text-slate-100">
                      {seg.y2026.finding[language]}
                    </td>
                    <td className="max-w-[240px] px-3 py-2.5 text-slate-600 dark:text-slate-300">
                      <span>{seg.y2026.canal[language]}</span>
                      <span className="mx-1 text-slate-300 dark:text-slate-600">·</span>
                      <span className="text-slate-500 dark:text-slate-400">
                        {seg.y2026.roots[language]}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${badge.pillClass}`}
                      >
                        <span aria-hidden="true">{badge.glyph}</span>
                        <span>{seg.statusLabel[language]}</span>
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          jumpTo3DAtlasSegment(seg.id);
                        }}
                        title={`${t.nav.atlas3d}: ${seg.id}`}
                        className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-sky-700 transition-colors hover:border-sky-300 hover:bg-sky-50 dark:border-slate-700 dark:bg-slate-800 dark:text-cyan-300 dark:hover:border-cyan-600"
                      >
                        <Box className="h-3 w-3" />
                        <span>{t.actions.openIn3D}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Clinical disclaimer */}
      <div className="rounded-xl border border-slate-200/90 bg-white px-4 py-3 text-xs leading-relaxed text-slate-600 shadow-xs dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
        <span className="font-semibold text-slate-800 dark:text-slate-200">
          {t.anamnesis.disclaimerLabel}:{' '}
        </span>
        {meta.disclaimer[language]}
      </div>
    </div>
  );
};
