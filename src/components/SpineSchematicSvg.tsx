import React from 'react';
import {
  DetailedSpineSegment,
  Language,
  MriViewMode,
  RegionFilter,
  SegmentStatus,
} from '../types/medical';
import { UiDictionary } from '../data/i18n';
import { ThemeMode } from '../context/MedicalArchiveContext';

interface SpineSchematicSvgProps {
  segments: DetailedSpineSegment[];
  selectedSegmentId: string;
  onSelectSegment: (id: string) => void;
  regionFilter: RegionFilter;
  viewMode: MriViewMode;
  language: Language;
  theme: ThemeMode;
  t: UiDictionary;
}

function getStatusVisuals(status: SegmentStatus, isDark: boolean) {
  if (status === 'negative') {
    return {
      fill: isDark ? 'rgba(225, 29, 72, 0.16)' : '#FFF1F2',
      pillFill: isDark ? 'rgba(225, 29, 72, 0.25)' : '#FFE4E6',
      stroke: isDark ? '#FB7185' : '#E11D48',
      accentText: isDark ? '#FDA4AF' : '#9F1239',
      glyph: '▼',
      dotColor: isDark ? '#FB7185' : '#E11D48',
    };
  }
  if (status === 'new') {
    return {
      fill: isDark ? 'rgba(217, 119, 6, 0.16)' : '#FFFBEB',
      pillFill: isDark ? 'rgba(217, 119, 6, 0.25)' : '#FEF3C7',
      stroke: isDark ? '#FBBF24' : '#D97706',
      accentText: isDark ? '#FDE68A' : '#92400E',
      glyph: '+',
      dotColor: isDark ? '#FBBF24' : '#D97706',
    };
  }
  return {
    fill: isDark ? 'rgba(16, 185, 129, 0.14)' : '#ECFDF5',
    pillFill: isDark ? 'rgba(16, 185, 129, 0.24)' : '#D1FAE5',
    stroke: isDark ? '#34D399' : '#059669',
    accentText: isDark ? '#6EE7B7' : '#065F46',
    glyph: '●',
    dotColor: isDark ? '#34D399' : '#059669',
  };
}

export const SpineSchematicSvg: React.FC<SpineSchematicSvgProps> = ({
  segments,
  selectedSegmentId,
  onSelectSegment,
  regionFilter,
  viewMode,
  language,
  theme,
  t,
}) => {
  const isDark = theme === 'dark';

  const visibleQuickSegments =
    regionFilter === 'all' ? segments : segments.filter((s) => s.region === regionFilter);

  const regionSideLabels = {
    cervical:
      language === 'uk' ? 'ШИЙНИЙ' : language === 'ru' ? 'ШЕЙНЫЙ' : 'CERVICAL',
    thoracic:
      language === 'uk' ? 'ГРУДНИЙ' : language === 'ru' ? 'ГРУДНОЙ' : 'THORACIC',
    lumbar:
      language === 'uk' ? 'ПОПЕРЕКОВИЙ' : language === 'ru' ? 'ПОЯСНИЧНЫЙ' : 'LUMBAR',
  };

  return (
    <section className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            {t.mri.schematicTitle}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">{t.mri.schematicSubtitle}</p>
        </div>
        <span className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-0.5 font-mono text-xs font-semibold text-sky-700 tabular-nums dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-300">
          {selectedSegmentId}
        </span>
      </div>

      <div className="flex justify-center rounded-lg border border-slate-200 bg-[#F4F7FB] p-2 dark:border-slate-800 dark:bg-slate-950/80">
        <svg
          viewBox="0 0 422 768"
          className="h-auto w-full max-w-[422px] select-none"
          role="img"
          aria-label={t.mri.schematicTitle}
        >
          <defs>
            <linearGradient id="clinicalCordGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0284C7" stopOpacity="0.5" />
              <stop offset="50%" stopColor="#64748B" stopOpacity="0.38" />
              <stop offset="100%" stopColor="#E11D48" stopOpacity="0.5" />
            </linearGradient>
          </defs>

          {/* Spinal canal / dural sac central vertical axis */}
          <line
            x1="158"
            y1="26"
            x2="158"
            y2="742"
            stroke="url(#clinicalCordGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Anatomical region markers on left */}
          <text
            x="10"
            y="42"
            fill={isDark ? '#38BDF8' : '#0369A1'}
            fontSize="10.5"
            fontWeight="700"
            letterSpacing="0.04em"
          >
            {regionSideLabels.cervical}
          </text>
          <text x="10" y="56" fill={isDark ? '#94A3B8' : '#64748B'} fontSize="10" fontFamily="IBM Plex Mono, monospace">
            C2–D1
          </text>

          <line x1="10" y1="234" x2="96" y2="234" stroke={isDark ? '#334155' : '#CBD5E1'} strokeDasharray="3 3" />
          <text
            x="10"
            y="254"
            fill={isDark ? '#FBBF24' : '#B45309'}
            fontSize="10.5"
            fontWeight="700"
            letterSpacing="0.04em"
          >
            {regionSideLabels.thoracic}
          </text>
          <text x="10" y="268" fill={isDark ? '#94A3B8' : '#64748B'} fontSize="10" fontFamily="IBM Plex Mono, monospace">
            D1–D12
          </text>

          <line x1="10" y1="538" x2="96" y2="538" stroke={isDark ? '#334155' : '#CBD5E1'} strokeDasharray="3 3" />
          <text
            x="10"
            y="558"
            fill={isDark ? '#FB7185' : '#BE123C'}
            fontSize="10.5"
            fontWeight="700"
            letterSpacing="0.04em"
          >
            {regionSideLabels.lumbar}
          </text>
          <text x="10" y="572" fill={isDark ? '#94A3B8' : '#64748B'} fontSize="10" fontFamily="IBM Plex Mono, monospace">
            L1–S1
          </text>

          {/* 16 Interactive Vertebral Segment Nodes */}
          {segments.map((seg) => {
            const isDimmed = regionFilter !== 'all' && seg.region !== regionFilter;
            const isSelected = seg.id === selectedSegmentId;
            const visual = getStatusVisuals(seg.status, isDark);

            let rectFill = isDark ? '#0F172A' : '#FFFFFF';
            let rectStroke = visual.stroke;
            let nodeDotColor = visual.dotColor;

            if (viewMode === '2025') {
              rectFill = isDark ? 'rgba(51, 65, 85, 0.45)' : '#F8FAFC';
              rectStroke = isDark ? '#64748B' : '#94A3B8';
              nodeDotColor = isDark ? '#94A3B8' : '#475569';
            } else if (viewMode === '2026') {
              rectFill =
                seg.status === 'negative'
                  ? visual.fill
                  : isDark
                  ? 'rgba(14, 165, 233, 0.14)'
                  : '#F0F9FF';
              rectStroke =
                seg.status === 'negative' ? visual.stroke : isDark ? '#38BDF8' : '#0284C7';
              nodeDotColor = rectStroke;
            } else {
              rectFill = visual.fill;
            }

            if (isSelected) {
              rectFill = isDark ? 'rgba(14, 165, 233, 0.24)' : '#E0F2FE';
              rectStroke = isDark ? '#38BDF8' : '#0284C7';
            }

            let shortText = `${visual.glyph} ${seg.statusLabel[language]}`;
            if (viewMode === '2025') {
              const raw = seg.y2025.finding[language];
              shortText = raw.length > 26 ? `${raw.slice(0, 25)}…` : raw;
            } else if (viewMode === '2026') {
              const raw = seg.y2026.finding[language];
              shortText = raw.length > 26 ? `${raw.slice(0, 25)}…` : raw;
            }

            const mmVal =
              viewMode === '2025' ? seg.metrics.protrusion2025 : seg.metrics.protrusion2026;
            const mmLabel = mmVal && mmVal > 0 ? `${mmVal.toFixed(1)}` : '—';

            return (
              <g
                key={seg.id}
                role="button"
                tabIndex={0}
                aria-label={`${t.mri.segmentPrefix} ${seg.id} — ${seg.statusLabel[language]}`}
                onClick={() => onSelectSegment(seg.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectSegment(seg.id);
                  }
                }}
                style={{
                  opacity: isDimmed ? 0.22 : 1,
                  cursor: 'pointer',
                  transition: 'opacity 180ms ease',
                }}
                className="outline-none focus-visible:opacity-100"
              >
                <rect
                  x="104"
                  y={seg.y - 14}
                  width="308"
                  height="28"
                  rx="7"
                  fill={rectFill}
                  stroke={rectStroke}
                  strokeWidth={isSelected ? 2 : 1.1}
                />

                {/* Dural canal node */}
                <circle
                  cx="158"
                  cy={seg.y}
                  r={isSelected ? 4.5 : 3.5}
                  fill={isSelected ? (isDark ? '#38BDF8' : '#0284C7') : nodeDotColor}
                />

                {/* Segment Code */}
                <text
                  x="112"
                  y={seg.y + 4}
                  fill={isSelected ? (isDark ? '#E0F2FE' : '#0C4A6E') : isDark ? '#F1F5F9' : '#0F172A'}
                  fontSize="10.5"
                  fontWeight="700"
                  fontFamily="IBM Plex Mono, monospace"
                >
                  {seg.id}
                </text>

                {/* Status pill backdrop in Compare mode */}
                {viewMode === 'compare' && (
                  <rect
                    x="167"
                    y={seg.y - 9.5}
                    width="180"
                    height="19"
                    rx="9.5"
                    fill={visual.pillFill}
                  />
                )}

                {/* Mode-dependent summary text */}
                <text
                  x={viewMode === 'compare' ? '175' : '170'}
                  y={seg.y + 3.5}
                  fill={
                    viewMode === 'compare'
                      ? visual.accentText
                      : isSelected
                      ? isDark
                        ? '#E0F2FE'
                        : '#0C4A6E'
                      : isDark
                      ? '#CBD5E1'
                      : '#334155'
                  }
                  fontSize="10"
                  fontWeight={viewMode === 'compare' ? '600' : '500'}
                >
                  {shortText}
                </text>

                {/* Right-aligned tabular mm indicator */}
                <text
                  x="404"
                  y={seg.y + 4}
                  textAnchor="end"
                  fill={isSelected ? (isDark ? '#7DD3FC' : '#0369A1') : isDark ? '#94A3B8' : '#64748B'}
                  fontSize="9.5"
                  fontWeight="600"
                  fontFamily="IBM Plex Mono, monospace"
                >
                  {mmLabel === '—' ? '—' : `${mmLabel} mm`}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Quick segment selector buttons */}
      <div className="mt-4">
        <div className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          {t.mri.quickJump}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {visibleQuickSegments.map((seg) => {
            const isSelected = seg.id === selectedSegmentId;
            const visual = getStatusVisuals(seg.status, isDark);
            return (
              <button
                key={seg.id}
                type="button"
                onClick={() => onSelectSegment(seg.id)}
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-mono text-xs font-medium transition-colors whitespace-nowrap ${
                  isSelected
                    ? 'border-sky-600 bg-sky-600 text-white'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:border-slate-600'
                }`}
              >
                <span style={{ color: isSelected ? '#FFFFFF' : visual.stroke }} aria-hidden="true">
                  {visual.glyph}
                </span>
                <span>{seg.id}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
