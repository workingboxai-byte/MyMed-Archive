import React, { useState } from 'react';
import { DetailedSpineSegment, RegionFilter } from '../types/medical';
import { UiDictionary } from '../data/i18n';

interface MriDynamicsChartsProps {
  segments: DetailedSpineSegment[];
  selectedSegmentId: string;
  onSelectSegment: (id: string) => void;
  regionFilter: RegionFilter;
  t: UiDictionary;
}

export const MriDynamicsCharts: React.FC<MriDynamicsChartsProps> = ({
  segments,
  selectedSegmentId,
  onSelectSegment,
  regionFilter,
  t,
}) => {
  const [chartTab, setChartTab] = useState<'protrusion' | 'canal'>('protrusion');

  const visibleSegments =
    regionFilter === 'all' ? segments : segments.filter((s) => s.region === regionFilter);

  const maxProtrusion = 7.0;
  const maxCanal = 20.0;

  return (
    <section className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-3.5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            {t.mri.chartsTitle}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">{t.mri.chartsSubtitle}</p>
        </div>
        <div className="inline-flex rounded-lg bg-slate-100 p-1 dark:bg-slate-800" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={chartTab === 'protrusion'}
            onClick={() => setChartTab('protrusion')}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
              chartTab === 'protrusion'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
            }`}
          >
            {t.mri.chartProtrusionTab}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={chartTab === 'canal'}
            onClick={() => setChartTab('canal')}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
              chartTab === 'canal'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
            }`}
          >
            {t.mri.chartCanalTab}
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-xs bg-slate-400 dark:bg-slate-500" />
          25.01.2025
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className={`inline-block h-2.5 w-2.5 rounded-xs ${
              chartTab === 'protrusion' ? 'bg-sky-600' : 'bg-rose-600'
            }`}
          />
          19.10.2026
        </span>
        {chartTab === 'canal' && (
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-4 border-t-2 border-dashed border-emerald-500" />
            {t.mri.chartNormLabel}
          </span>
        )}
      </div>

      {/* Horizontal quantitative precision bar rows */}
      <div className="mt-4 space-y-2">
        {visibleSegments.map((seg) => {
          const isSelected = seg.id === selectedSegmentId;

          if (chartTab === 'protrusion') {
            const v25 = seg.metrics.protrusion2025 ?? 0;
            const v26 = seg.metrics.protrusion2026 ?? 0;
            const w25 = Math.min(100, (v25 / maxProtrusion) * 100);
            const w26 = Math.min(100, (v26 / maxProtrusion) * 100);
            const grew = v26 > v25;
            const isSevere = v26 >= 4.0;

            return (
              <button
                key={seg.id}
                type="button"
                onClick={() => onSelectSegment(seg.id)}
                className={`group grid w-full grid-cols-[64px_1fr_114px] items-center gap-3 rounded-lg border px-2.5 py-1.5 text-left transition-colors ${
                  isSelected
                    ? 'border-sky-300 bg-sky-50/80 dark:border-sky-700 dark:bg-sky-950/40'
                    : 'border-transparent hover:border-slate-200 hover:bg-slate-50 dark:hover:border-slate-800 dark:hover:bg-slate-800/50'
                }`}
              >
                <span
                  className={`font-mono text-xs font-semibold tabular-nums ${
                    isSelected ? 'text-sky-800 dark:text-sky-300' : 'text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {seg.id}
                </span>

                <div className="space-y-1">
                  <div className="h-2 w-full overflow-hidden rounded-xs bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-xs bg-slate-400 transition-all duration-200 dark:bg-slate-500"
                      style={{ width: `${w25}%` }}
                    />
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-xs bg-slate-100 dark:bg-slate-800">
                    <div
                      className={`h-full rounded-xs transition-all duration-200 ${
                        isSevere ? 'bg-rose-600' : grew ? 'bg-amber-500' : 'bg-sky-600'
                      }`}
                      style={{ width: `${w26}%` }}
                    />
                  </div>
                </div>

                <div className="text-right font-mono text-[11px] tabular-nums">
                  {v25 === 0 && v26 === 0 ? (
                    <span className="text-slate-400 dark:text-slate-500">0.0 {t.mri.chartMmUnit}</span>
                  ) : (
                    <span
                      className={
                        grew || isSevere
                          ? 'font-semibold text-rose-700 dark:text-rose-400'
                          : 'text-slate-700 dark:text-slate-300'
                      }
                    >
                      {v25.toFixed(1)} → {v26.toFixed(1)} {t.mri.chartMmUnit}
                    </span>
                  )}
                </div>
              </button>
            );
          }

          const c25 = seg.metrics.canalSagittal2025 ?? 0;
          const c26 = seg.metrics.canalSagittal2026 ?? 0;
          const norm = seg.metrics.canalNormMin;
          const w25 = Math.min(100, (c25 / maxCanal) * 100);
          const w26 = Math.min(100, (c26 / maxCanal) * 100);
          const normPos = Math.min(100, (norm / maxCanal) * 100);
          const isStenotic = c26 < norm;

          return (
            <button
              key={seg.id}
              type="button"
              onClick={() => onSelectSegment(seg.id)}
              className={`group grid w-full grid-cols-[64px_1fr_126px] items-center gap-3 rounded-lg border px-2.5 py-1.5 text-left transition-colors ${
                isSelected
                  ? 'border-sky-300 bg-sky-50/80 dark:border-sky-700 dark:bg-sky-950/40'
                  : 'border-transparent hover:border-slate-200 hover:bg-slate-50 dark:hover:border-slate-800 dark:hover:bg-slate-800/50'
              }`}
            >
              <span
                className={`font-mono text-xs font-semibold tabular-nums ${
                  isSelected ? 'text-sky-800 dark:text-sky-300' : 'text-slate-800 dark:text-slate-200'
                }`}
              >
                {seg.id}
              </span>

              <div className="relative space-y-1 py-0.5">
                <div
                  className="pointer-events-none absolute top-0 bottom-0 z-10 border-l-2 border-dashed border-emerald-500"
                  style={{ left: `${normPos}%` }}
                  title={`${t.mri.chartNormLabel}: ≥${norm} ${t.mri.chartMmUnit}`}
                />
                <div className="h-2 w-full overflow-hidden rounded-xs bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-xs bg-slate-400 transition-all duration-200 dark:bg-slate-500"
                    style={{ width: `${w25}%` }}
                  />
                </div>
                <div className="h-2 w-full overflow-hidden rounded-xs bg-slate-100 dark:bg-slate-800">
                  <div
                    className={`h-full rounded-xs transition-all duration-200 ${
                      c26 <= 10.5
                        ? 'bg-rose-600'
                        : isStenotic
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${w26}%` }}
                  />
                </div>
              </div>

              <div className="text-right font-mono text-[11px] tabular-nums">
                <span
                  className={
                    c26 <= 10.5
                      ? 'font-semibold text-rose-700 dark:text-rose-400'
                      : isStenotic
                      ? 'font-medium text-amber-800 dark:text-amber-300'
                      : 'text-emerald-700 dark:text-emerald-400'
                  }
                >
                  {c25.toFixed(1)} → {c26.toFixed(1)}
                </span>
                <span className="ml-1 text-[10px] text-slate-400 dark:text-slate-500">/≥{norm}</span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
