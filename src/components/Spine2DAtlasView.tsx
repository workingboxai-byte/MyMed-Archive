import React, { useMemo } from 'react';
import {
  Activity,
  ArrowUpRight,
  Layers,
  Network,
  Sparkles,
} from 'lucide-react';
import { DetailedSpineSegment, Language, SegmentStatus } from '../types/medical';
import { UiDictionary } from '../data/i18n';
import { ThemeMode } from '../context/MedicalArchiveContext';
import {
  Atlas2DRegionId,
  SEGMENT_NEUROANATOMY,
  SPINE_2D_REGIONS,
} from '../data/spineNeuroanatomyData';

export type Spine2DPanelMode = 'segment' | 'region' | 'overview';

interface Spine2DAtlasViewProps {
  segments: DetailedSpineSegment[];
  focusedSegmentId: string | null;
  activeSegment: DetailedSpineSegment;
  panelMode: Spine2DPanelMode;
  selectedRegionId: Atlas2DRegionId;
  onSelectSegment: (segId: string) => void;
  onSelectRegion: (regionId: Atlas2DRegionId) => void;
  onShowOverview: () => void;
  onJumpToMri: (segId: string) => void;
  language: Language;
  theme: ThemeMode;
  t: UiDictionary;
}

interface VertebraSpec {
  id: string;
  region: Atlas2DRegionId;
  cx: number;
  cy: number;
  w: number;
  h: number;
  rot: number;
  spinousLen: number;
  spinousDrop: number;
}

interface DiscSpec {
  key: string;
  upperId: string;
  lowerId: string;
  cx: number;
  cy: number;
  w: number;
  h: number;
  rot: number;
  region: Atlas2DRegionId;
  segmentId: string | null;
  isPrimaryCallout: boolean;
}

// Anatomically proportioned lateral column with physiological curves:
// Cervical lordosis (convex left), Thoracic kyphosis (convex right), Lumbar lordosis (convex left), Sacral kyphosis.
const VERTEBRAE_SPECS: VertebraSpec[] = [
  // Cervical C1–C7 (lordosis peaking anteriorly around C4)
  { id: 'C1', region: 'cervical', cx: 215, cy: 40, w: 23, h: 11, rot: -5, spinousLen: 18, spinousDrop: 2 },
  { id: 'C2', region: 'cervical', cx: 210, cy: 60, w: 24, h: 13, rot: -4, spinousLen: 21, spinousDrop: 4 },
  { id: 'C3', region: 'cervical', cx: 205, cy: 82, w: 25, h: 13, rot: -2, spinousLen: 21, spinousDrop: 5 },
  { id: 'C4', region: 'cervical', cx: 203, cy: 104, w: 26, h: 14, rot: 1, spinousLen: 22, spinousDrop: 6 },
  { id: 'C5', region: 'cervical', cx: 205, cy: 127, w: 27, h: 14, rot: 4, spinousLen: 23, spinousDrop: 7 },
  { id: 'C6', region: 'cervical', cx: 210, cy: 150, w: 28, h: 15, rot: 7, spinousLen: 25, spinousDrop: 8 },
  { id: 'C7', region: 'cervical', cx: 218, cy: 174, w: 29, h: 15, rot: 10, spinousLen: 30, spinousDrop: 9 },

  // Thoracic D1–D12 (kyphosis curving smoothly posteriorly to peak at D6–D7)
  { id: 'D1', region: 'thoracic', cx: 228, cy: 200, w: 30, h: 16, rot: 11, spinousLen: 29, spinousDrop: 12 },
  { id: 'D2', region: 'thoracic', cx: 238, cy: 226, w: 31, h: 17, rot: 10, spinousLen: 29, spinousDrop: 14 },
  { id: 'D3', region: 'thoracic', cx: 247, cy: 253, w: 31, h: 17, rot: 8, spinousLen: 30, spinousDrop: 16 },
  { id: 'D4', region: 'thoracic', cx: 254, cy: 281, w: 32, h: 18, rot: 5, spinousLen: 30, spinousDrop: 18 },
  { id: 'D5', region: 'thoracic', cx: 259, cy: 309, w: 33, h: 18, rot: 2, spinousLen: 31, spinousDrop: 19 },
  { id: 'D6', region: 'thoracic', cx: 262, cy: 338, w: 33, h: 19, rot: 0, spinousLen: 31, spinousDrop: 20 },
  { id: 'D7', region: 'thoracic', cx: 262, cy: 367, w: 34, h: 19, rot: -2, spinousLen: 31, spinousDrop: 20 },
  { id: 'D8', region: 'thoracic', cx: 259, cy: 396, w: 34, h: 19, rot: -5, spinousLen: 30, spinousDrop: 19 },
  { id: 'D9', region: 'thoracic', cx: 254, cy: 425, w: 35, h: 20, rot: -7, spinousLen: 29, spinousDrop: 17 },
  { id: 'D10', region: 'thoracic', cx: 247, cy: 454, w: 36, h: 20, rot: -8, spinousLen: 28, spinousDrop: 15 },
  { id: 'D11', region: 'thoracic', cx: 239, cy: 483, w: 37, h: 21, rot: -8, spinousLen: 27, spinousDrop: 12 },
  { id: 'D12', region: 'thoracic', cx: 230, cy: 513, w: 38, h: 21, rot: -7, spinousLen: 26, spinousDrop: 10 },

  // Lumbar L1–L5 (lordosis curving anteriorly around L3–L4, then meeting sacral promontory)
  { id: 'L1', region: 'lumbar', cx: 221, cy: 546, w: 39, h: 23, rot: -6, spinousLen: 27, spinousDrop: 7 },
  { id: 'L2', region: 'lumbar', cx: 213, cy: 580, w: 40, h: 24, rot: -4, spinousLen: 28, spinousDrop: 6 },
  { id: 'L3', region: 'lumbar', cx: 208, cy: 615, w: 42, h: 25, rot: 0, spinousLen: 28, spinousDrop: 5 },
  { id: 'L4', region: 'lumbar', cx: 209, cy: 651, w: 43, h: 25, rot: 6, spinousLen: 28, spinousDrop: 5 },
  { id: 'L5', region: 'lumbar', cx: 216, cy: 687, w: 43, h: 25, rot: 14, spinousLen: 26, spinousDrop: 6 },
];

const DISC_TO_MRI_SEGMENT: Record<string, { segmentId: string; isPrimary: boolean }> = {
  'C2-C3': { segmentId: 'C2-C3', isPrimary: true },
  'C3-C4': { segmentId: 'C3-C4', isPrimary: true },
  'C4-C5': { segmentId: 'C4-C5', isPrimary: true },
  'C5-C6': { segmentId: 'C5-C6', isPrimary: true },
  'C6-C7': { segmentId: 'C6-C7', isPrimary: true },
  'C7-D1': { segmentId: 'C7-D1', isPrimary: true },
  'D1-D2': { segmentId: 'D1-D2', isPrimary: true },
  'D2-D3': { segmentId: 'D2-D3', isPrimary: true },
  'D3-D4': { segmentId: 'D3-D4', isPrimary: true },
  'D4-D5': { segmentId: 'D4-D5', isPrimary: true },
  'D6-D7': { segmentId: 'D6-D9', isPrimary: false },
  'D7-D8': { segmentId: 'D6-D9', isPrimary: true },
  'D8-D9': { segmentId: 'D6-D9', isPrimary: false },
  'D10-D11': { segmentId: 'D10-D12', isPrimary: true },
  'D11-D12': { segmentId: 'D10-D12', isPrimary: false },
  'L1-L2': { segmentId: 'L1-L3', isPrimary: false },
  'L2-L3': { segmentId: 'L1-L3', isPrimary: true },
  'L3-L4': { segmentId: 'L3-L4', isPrimary: true },
  'L4-L5': { segmentId: 'L4-L5', isPrimary: true },
  'L5-S1': { segmentId: 'L5-S1', isPrimary: true },
};

function buildDiscs(): DiscSpec[] {
  const discs: DiscSpec[] = [];
  for (let i = 0; i < VERTEBRAE_SPECS.length - 1; i++) {
    const upper = VERTEBRAE_SPECS[i];
    const lower = VERTEBRAE_SPECS[i + 1];
    const key = `${upper.id}-${lower.id}`;
    const mapped = DISC_TO_MRI_SEGMENT[key];
    discs.push({
      key,
      upperId: upper.id,
      lowerId: lower.id,
      cx: (upper.cx + lower.cx) / 2,
      cy: (upper.cy + lower.cy) / 2,
      w: (upper.w + lower.w) / 2 - 2,
      h: upper.region === 'lumbar' ? 8.5 : upper.region === 'thoracic' ? 6.5 : 5.8,
      rot: (upper.rot + lower.rot) / 2,
      region: upper.region,
      segmentId: mapped?.segmentId ?? null,
      isPrimaryCallout: mapped?.isPrimary ?? false,
    });
  }
  // L5-S1 lumbosacral disc
  const l5 = VERTEBRAE_SPECS[VERTEBRAE_SPECS.length - 1];
  discs.push({
    key: 'L5-S1',
    upperId: 'L5',
    lowerId: 'S1',
    cx: l5.cx + 7,
    cy: l5.cy + 19,
    w: 41,
    h: 8.5,
    rot: 22,
    region: 'lumbar',
    segmentId: 'L5-S1',
    isPrimaryCallout: true,
  });
  return discs;
}

const ALL_DISCS = buildDiscs();

function buildCurlyBracePath(xRight: number, yTop: number, yBottom: number): string {
  const mid = (yTop + yBottom) / 2;
  const xMid = xRight - 8;
  const xTip = xRight - 15;
  const r = Math.min(12, (yBottom - yTop) / 5);
  return [
    `M ${xRight} ${yTop}`,
    `C ${xMid} ${yTop} ${xMid} ${yTop + r} ${xMid} ${yTop + r * 1.4}`,
    `L ${xMid} ${mid - r}`,
    `C ${xMid} ${mid - r * 0.35} ${xTip} ${mid} ${xTip} ${mid}`,
    `C ${xTip} ${mid} ${xMid} ${mid + r * 0.35} ${xMid} ${mid + r}`,
    `L ${xMid} ${yBottom - r * 1.4}`,
    `C ${xMid} ${yBottom - r} ${xMid} ${yBottom} ${xRight} ${yBottom}`,
  ].join(' ');
}

function getStatusColors(status: SegmentStatus, isDark: boolean) {
  if (status === 'negative') {
    return {
      discFill: isDark ? '#F43F5E' : '#E11D48',
      discStroke: isDark ? '#FDA4AF' : '#9F1239',
      badgeBg: isDark ? 'rgba(225, 29, 72, 0.22)' : '#FFE4E6',
      badgeStroke: isDark ? '#FB7185' : '#E11D48',
      badgeText: isDark ? '#FDA4AF' : '#9F1239',
      dotClass: 'bg-rose-500',
      pillClass:
        'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-800/70 dark:bg-rose-950/70 dark:text-rose-300',
    };
  }
  if (status === 'new') {
    return {
      discFill: isDark ? '#F59E0B' : '#D97706',
      discStroke: isDark ? '#FDE68A' : '#92400E',
      badgeBg: isDark ? 'rgba(217, 119, 6, 0.22)' : '#FEF3C7',
      badgeStroke: isDark ? '#FBBF24' : '#D97706',
      badgeText: isDark ? '#FDE68A' : '#92400E',
      dotClass: 'bg-amber-500',
      pillClass:
        'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800/70 dark:bg-amber-950/70 dark:text-amber-300',
    };
  }
  return {
    discFill: isDark ? '#10B981' : '#059669',
    discStroke: isDark ? '#6EE7B7' : '#065F46',
    badgeBg: isDark ? 'rgba(16, 185, 129, 0.20)' : '#D1FAE5',
    badgeStroke: isDark ? '#34D399' : '#059669',
    badgeText: isDark ? '#6EE7B7' : '#065F46',
    dotClass: 'bg-emerald-500',
    pillClass:
      'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800/70 dark:bg-emerald-950/70 dark:text-emerald-300',
  };
}

const REGION_BRACES: Array<{
  id: Atlas2DRegionId;
  yTop: number;
  yBottom: number;
  accentLight: string;
  accentDark: string;
}> = [
  { id: 'cervical', yTop: 32, yBottom: 184, accentLight: '#0284C7', accentDark: '#38BDF8' },
  { id: 'thoracic', yTop: 192, yBottom: 526, accentLight: '#D97706', accentDark: '#FBBF24' },
  { id: 'lumbar', yTop: 534, yBottom: 704, accentLight: '#E11D48', accentDark: '#FB7185' },
  { id: 'sacral', yTop: 712, yBottom: 794, accentLight: '#7C3AED', accentDark: '#A78BFA' },
];

export const Spine2DAtlasView: React.FC<Spine2DAtlasViewProps> = ({
  segments,
  focusedSegmentId,
  activeSegment,
  panelMode,
  selectedRegionId,
  onSelectSegment,
  onSelectRegion,
  onShowOverview,
  onJumpToMri,
  language,
  theme,
  t,
}) => {
  const isDark = theme === 'dark';

  const segmentById = useMemo(() => {
    const map = new Map<string, DetailedSpineSegment>();
    segments.forEach((s) => map.set(s.id, s));
    return map;
  }, [segments]);

  const spinalCordPath = useMemo(() => {
    const pts = VERTEBRAE_SPECS.map((v) => ({
      x: v.cx + v.w / 2 + 5,
      y: v.cy,
    }));
    const d = pts
      .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
      .join(' ');
    return `${d} L 248 725`;
  }, []);

  const regionStats = useMemo(() => {
    return SPINE_2D_REGIONS.map((reg) => {
      const regSegments = reg.segmentIds
        .map((id) => segmentById.get(id))
        .filter((s): s is DetailedSpineSegment => Boolean(s));
      const negativeCount = regSegments.filter((s) => s.status === 'negative').length;
      const newCount = regSegments.filter((s) => s.status === 'new').length;
      const stableCount = regSegments.filter((s) => s.status === 'stable').length;
      return {
        region: reg,
        segments: regSegments,
        negativeCount,
        newCount,
        stableCount,
        problemCount: negativeCount + newCount,
      };
    });
  }, [segmentById]);

  const selectedRegionStats = useMemo(
    () => regionStats.find((r) => r.region.id === selectedRegionId) ?? regionStats[0],
    [regionStats, selectedRegionId],
  );

  const neuroInfo = SEGMENT_NEUROANATOMY[activeSegment.id];
  const activeStatusColors = getStatusColors(activeSegment.status, isDark);

  const boneFill = isDark ? '#1E293B' : '#FFFFFF';
  const boneStroke = isDark ? '#64748B' : '#94A3B8';
  const boneArchFill = isDark ? '#162032' : '#F1F5F9';
  const vertebraLabelColor = isDark ? '#94A3B8' : '#64748B';
  const neutralDiscFill = isDark ? '#334155' : '#CBD5E1';

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:flex-row">
      {/* LEFT / CENTER: Anatomical Lateral 2D SVG Spine Map */}
      <div className="flex min-h-[420px] flex-col border-b border-slate-200/80 bg-[#F6F9FC] dark:border-slate-800 dark:bg-[#0B1221] lg:w-[48%] lg:min-w-[360px] lg:border-r lg:border-b-0 xl:w-[46%]">
        {/* Compact SVG Legend Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 bg-white/80 px-3.5 py-2 dark:border-slate-800 dark:bg-slate-900/70">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {t.atlas3d.schematicHint}
          </span>
          <div className="flex items-center gap-3 text-[10.5px] font-medium text-slate-600 dark:text-slate-300">
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              {t.atlas3d.negativeCountLabel}
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              {t.atlas3d.newCountLabel}
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {t.atlas3d.stableCountLabel}
            </span>
          </div>
        </div>

        {/* Scrollable / Auto-fit SVG Canvas */}
        <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto p-2.5 sm:p-3">
          <svg
            viewBox="0 0 432 818"
            className="h-full max-h-[760px] w-auto max-w-full select-none"
            role="img"
            aria-label={t.atlas3d.mode2d}
          >
            <defs>
              <linearGradient id="spine2dCordGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={isDark ? '#38BDF8' : '#0284C7'} stopOpacity="0.55" />
                <stop offset="55%" stopColor={isDark ? '#64748B' : '#94A3B8'} stopOpacity="0.4" />
                <stop offset="100%" stopColor={isDark ? '#FB7185' : '#E11D48'} stopOpacity="0.55" />
              </linearGradient>
              <filter id="discGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="2.4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Anatomical direction hint (Anterior / Posterior) */}
            <text
              x="212"
              y="18"
              textAnchor="middle"
              fill={isDark ? '#475569' : '#94A3B8'}
              fontSize="9"
              fontWeight="600"
              letterSpacing="0.06em"
            >
              {language === 'uk'
                ? 'ПЕРЕДНЯ ←  БОКОВА ПРОЄКЦІЯ  → ЗАДНЯ'
                : language === 'ru'
                ? 'ПЕРЕДНЯЯ ←  БОКОВАЯ ПРОЕКЦИЯ  → ЗАДНЯЯ'
                : 'ANTERIOR ←  LATERAL VIEW  → POSTERIOR'}
            </text>

            {/* Left Curly Braces & Region Labels (clickable) */}
            {REGION_BRACES.map((brace) => {
              const regionObj = SPINE_2D_REGIONS.find((r) => r.id === brace.id)!;
              const stat = regionStats.find((s) => s.region.id === brace.id)!;
              const isRegionSelected = panelMode === 'region' && selectedRegionId === brace.id;
              const strokeColor = isRegionSelected
                ? isDark
                  ? '#38BDF8'
                  : '#0284C7'
                : isDark
                ? brace.accentDark
                : brace.accentLight;
              const yMid = (brace.yTop + brace.yBottom) / 2;

              return (
                <g
                  key={brace.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelectRegion(brace.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectRegion(brace.id);
                    }
                  }}
                  className="cursor-pointer outline-none"
                  aria-label={`${regionObj.title[language]} (${regionObj.range})`}
                >
                  {/* Generous invisible hit box */}
                  <rect
                    x="4"
                    y={brace.yTop}
                    width="156"
                    height={brace.yBottom - brace.yTop}
                    rx="8"
                    fill={
                      isRegionSelected
                        ? isDark
                          ? 'rgba(14, 165, 233, 0.12)'
                          : 'rgba(2, 132, 199, 0.08)'
                        : 'transparent'
                    }
                    stroke={isRegionSelected ? strokeColor : 'transparent'}
                    strokeWidth="1"
                  />

                  {/* Smooth Curly Brace */}
                  <path
                    d={buildCurlyBracePath(158, brace.yTop + 2, brace.yBottom - 2)}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={isRegionSelected ? 2.2 : 1.5}
                    strokeLinecap="round"
                    opacity={isRegionSelected ? 1 : 0.78}
                  />

                  {/* Region Title + Range + Problem Indicator */}
                  <text
                    x="136"
                    y={yMid - 7}
                    textAnchor="end"
                    fill={isRegionSelected ? (isDark ? '#E0F2FE' : '#0C4A6E') : strokeColor}
                    fontSize="11"
                    fontWeight="700"
                  >
                    {regionObj.title[language]}
                  </text>
                  <text
                    x="136"
                    y={yMid + 7}
                    textAnchor="end"
                    fill={isDark ? '#94A3B8' : '#64748B'}
                    fontSize="10"
                    fontWeight="600"
                    fontFamily="IBM Plex Mono, monospace"
                  >
                    {regionObj.range}
                  </text>
                  {stat.problemCount > 0 && (
                    <text
                      x="136"
                      y={yMid + 20}
                      textAnchor="end"
                      fill={isDark ? '#FDA4AF' : '#BE123C'}
                      fontSize="9"
                      fontWeight="600"
                    >
                      {t.atlas3d.problemCountLabel}: {stat.problemCount}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Spinal Canal / Dural Sac Axis behind vertebral bodies */}
            <path
              d={spinalCordPath}
              fill="none"
              stroke="url(#spine2dCordGrad)"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* 24 Individual Articulated Vertebrae (Bodies + Posterior Arches & Spinous Processes) */}
            {VERTEBRAE_SPECS.map((v) => {
              const isDimmed = panelMode === 'region' && selectedRegionId !== v.region;
              const halfW = v.w / 2;
              const halfH = v.h / 2;
              const archPath = [
                `M ${halfW - 1} ${-halfH + 2}`,
                `L ${halfW + 10} ${-halfH + 3}`,
                `L ${halfW + v.spinousLen} ${v.spinousDrop - 2}`,
                `Q ${halfW + v.spinousLen + 3} ${v.spinousDrop + 1} ${halfW + v.spinousLen - 2} ${v.spinousDrop + 4}`,
                `L ${halfW + 9} ${halfH - 1}`,
                `L ${halfW - 1} ${halfH - 2}`,
                'Z',
              ].join(' ');

              return (
                <g
                  key={v.id}
                  transform={`translate(${v.cx}, ${v.cy}) rotate(${v.rot})`}
                  opacity={isDimmed ? 0.34 : 1}
                  style={{ transition: 'opacity 180ms ease' }}
                >
                  {/* Posterior arch & spinous process */}
                  <path
                    d={archPath}
                    fill={boneArchFill}
                    stroke={boneStroke}
                    strokeWidth="1"
                    strokeLinejoin="round"
                  />
                  {/* Vertebral body (slightly concave anterior waist for realistic lateral anatomy) */}
                  <path
                    d={`M ${-halfW + 3} ${-halfH}
                        L ${halfW - 2} ${-halfH}
                        Q ${halfW} ${-halfH} ${halfW} ${-halfH + 3}
                        L ${halfW} ${halfH - 3}
                        Q ${halfW} ${halfH} ${halfW - 2} ${halfH}
                        L ${-halfW + 3} ${halfH}
                        Q ${-halfW} ${halfH} ${-halfW} ${halfH - 3}
                        Q ${-halfW + 2.2} 0 ${-halfW} ${-halfH + 3}
                        Q ${-halfW} ${-halfH} ${-halfW + 3} ${-halfH} Z`}
                    fill={boneFill}
                    stroke={boneStroke}
                    strokeWidth="1.15"
                  />
                  {/* Subtle anatomical vertebra code on anterior side */}
                  <text
                    x={-halfW - 5}
                    y="3"
                    textAnchor="end"
                    fill={vertebraLabelColor}
                    fontSize="8"
                    fontWeight="600"
                    fontFamily="IBM Plex Mono, monospace"
                    transform={`rotate(${-v.rot}, ${-halfW - 5}, 0)`}
                  >
                    {v.id}
                  </text>
                </g>
              );
            })}

            {/* Sacrum (S1–S5) & Coccyx anatomical curved wedge */}
            <g
              role="button"
              tabIndex={0}
              onClick={() => onSelectRegion('sacral')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectRegion('sacral');
                }
              }}
              className="cursor-pointer outline-none"
              opacity={panelMode === 'region' && selectedRegionId !== 'sacral' ? 0.36 : 1}
              style={{ transition: 'opacity 180ms ease' }}
              aria-label="S1–S5"
            >
              {/* Sacrum curved wedge */}
              <path
                d="M 207 710
                   L 246 720
                   C 262 732 269 752 264 774
                   L 253 778
                   C 242 758 228 740 205 724 Z"
                fill={boneFill}
                stroke={
                  panelMode === 'region' && selectedRegionId === 'sacral'
                    ? isDark
                      ? '#A78BFA'
                      : '#7C3AED'
                    : boneStroke
                }
                strokeWidth={panelMode === 'region' && selectedRegionId === 'sacral' ? 1.8 : 1.2}
                strokeLinejoin="round"
              />
              {/* Sacral fusion ridge hints */}
              <line x1="218" y1="726" x2="249" y2="734" stroke={boneStroke} strokeWidth="0.7" opacity="0.55" />
              <line x1="229" y1="740" x2="256" y2="747" stroke={boneStroke} strokeWidth="0.7" opacity="0.55" />
              <line x1="238" y1="754" x2="259" y2="760" stroke={boneStroke} strokeWidth="0.7" opacity="0.55" />
              {/* Coccyx tip */}
              <path
                d="M 252 779 L 262 777 C 261 786 256 794 247 798 C 246 792 248 785 252 779 Z"
                fill={boneArchFill}
                stroke={boneStroke}
                strokeWidth="1"
              />
              <text
                x="198"
                y="732"
                textAnchor="end"
                fill={vertebraLabelColor}
                fontSize="8.5"
                fontWeight="700"
                fontFamily="IBM Plex Mono, monospace"
              >
                S1–S5
              </text>
            </g>

            {/* Intervertebral Discs (Interactive Color-Coded Markers + Leader Callouts) */}
            {ALL_DISCS.map((disc) => {
              const seg = disc.segmentId ? segmentById.get(disc.segmentId) : undefined;
              const isSelected =
                Boolean(seg) &&
                panelMode === 'segment' &&
                (focusedSegmentId ?? activeSegment.id) === seg?.id;
              const isRegionDimmed =
                panelMode === 'region' &&
                selectedRegionId !== disc.region &&
                !(selectedRegionId === 'sacral' && disc.segmentId === 'L5-S1');

              if (!seg) {
                return (
                  <g
                    key={disc.key}
                    transform={`translate(${disc.cx}, ${disc.cy}) rotate(${disc.rot})`}
                    opacity={isRegionDimmed ? 0.25 : 0.72}
                  >
                    <rect
                      x={-disc.w / 2}
                      y={-disc.h / 2}
                      width={disc.w}
                      height={disc.h}
                      rx={disc.h / 2}
                      fill={neutralDiscFill}
                    />
                  </g>
                );
              }

              const colors = getStatusColors(seg.status, isDark);
              const hasProtrusion = (seg.metrics.protrusion2026 ?? 0) > 0;
              const calloutX = 330;
              const discRightEdgeX = disc.cx + disc.w / 2 + 2;

              return (
                <g
                  key={disc.key}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelectSegment(seg.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectSegment(seg.id);
                    }
                  }}
                  aria-label={`${t.mri.segmentPrefix} ${seg.id} — ${seg.statusLabel[language]}`}
                  className="cursor-pointer outline-none"
                  opacity={isRegionDimmed ? 0.26 : 1}
                  style={{ transition: 'opacity 180ms ease' }}
                >
                  {/* Disc body + posterior protrusion cue */}
                  <g transform={`translate(${disc.cx}, ${disc.cy}) rotate(${disc.rot})`}>
                    {isSelected && (
                      <rect
                        x={-disc.w / 2 - 4}
                        y={-disc.h / 2 - 3.5}
                        width={disc.w + 8}
                        height={disc.h + 7}
                        rx={disc.h}
                        fill="none"
                        stroke={isDark ? '#38BDF8' : '#0284C7'}
                        strokeWidth="2"
                        filter="url(#discGlow)"
                      />
                    )}
                    <rect
                      x={-disc.w / 2}
                      y={-disc.h / 2}
                      width={disc.w}
                      height={disc.h}
                      rx={disc.h / 2}
                      fill={colors.discFill}
                      stroke={isSelected ? (isDark ? '#E0F2FE' : '#0C4A6E') : colors.discStroke}
                      strokeWidth={isSelected ? 1.5 : 0.9}
                    />
                    {/* Posterior protrusion bulge facing the spinal canal */}
                    {hasProtrusion && (
                      <circle
                        cx={disc.w / 2 + 2.5}
                        cy={0}
                        r={seg.status === 'negative' ? 3.4 : 2.6}
                        fill={colors.discFill}
                        stroke={isDark ? '#0F172A' : '#FFFFFF'}
                        strokeWidth="0.9"
                      />
                    )}
                  </g>

                  {/* Right-Side Leader Line & Compact Segment Pill (once per MRI segment) */}
                  {disc.isPrimaryCallout && (
                    <>
                      <line
                        x1={discRightEdgeX + 26}
                        y1={disc.cy}
                        x2={calloutX - 2}
                        y2={disc.cy}
                        stroke={isSelected ? (isDark ? '#38BDF8' : '#0284C7') : colors.badgeStroke}
                        strokeWidth={isSelected ? 1.7 : 0.95}
                        strokeDasharray={isSelected ? undefined : '2 2'}
                        opacity={isSelected ? 1 : 0.75}
                      />
                      <rect
                        x={calloutX}
                        y={disc.cy - 9.5}
                        width={94}
                        height={19}
                        rx={6}
                        fill={
                          isSelected
                            ? isDark
                              ? '#0284C7'
                              : '#0284C7'
                            : colors.badgeBg
                        }
                        stroke={isSelected ? (isDark ? '#7DD3FC' : '#0369A1') : colors.badgeStroke}
                        strokeWidth={isSelected ? 1.5 : 0.9}
                      />
                      <circle
                        cx={calloutX + 9}
                        cy={disc.cy}
                        r={2.8}
                        fill={isSelected ? '#FFFFFF' : colors.discFill}
                      />
                      <text
                        x={calloutX + 16}
                        y={disc.cy + 3.5}
                        fill={isSelected ? '#FFFFFF' : colors.badgeText}
                        fontSize="9.5"
                        fontWeight="700"
                        fontFamily="IBM Plex Mono, monospace"
                      >
                        {seg.id}
                      </text>
                      {seg.metrics.protrusion2026 !== null && seg.metrics.protrusion2026 > 0 && (
                        <text
                          x={calloutX + 89}
                          y={disc.cy + 3.2}
                          textAnchor="end"
                          fill={isSelected ? '#E0F2FE' : colors.badgeText}
                          fontSize="8.5"
                          fontWeight="600"
                          fontFamily="IBM Plex Mono, monospace"
                          opacity={0.9}
                        >
                          {seg.metrics.protrusion2026.toFixed(1)}
                        </text>
                      )}
                    </>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* RIGHT: Clinical Details Panel (MRI Dynamics + Evidence-Based Neuroanatomy OR Regions Overview) */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white dark:bg-slate-900">
        {/* Top-Right Panel Header with "Full Spine / Regions Overview" button */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 px-4 py-2.5 dark:border-slate-800">
          <div className="min-w-0">
            {panelMode === 'overview' ? (
              <h2 className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">
                {t.atlas3d.overviewTitle}
              </h2>
            ) : panelMode === 'region' ? (
              <div className="flex items-center gap-2">
                <h2 className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">
                  {selectedRegionStats.region.title[language]}
                </h2>
                <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {selectedRegionStats.region.range}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${activeStatusColors.dotClass}`} />
                <h2 className="font-mono text-base font-extrabold text-slate-900 dark:text-white">
                  {activeSegment.id}
                </h2>
                <span
                  className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10.5px] font-semibold ${activeStatusColors.pillClass}`}
                >
                  {activeSegment.statusLabel[language]}
                </span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onShowOverview}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
              panelMode === 'overview'
                ? 'border-sky-600 bg-sky-600 text-white dark:border-cyan-600 dark:bg-cyan-600'
                : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-cyan-600 dark:hover:text-cyan-300'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>{t.atlas3d.overviewButton}</span>
          </button>
        </div>

        {/* Scrollable Right Panel Body */}
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
          {panelMode === 'overview' ? (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t.atlas3d.overviewSubtitle}
              </p>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {regionStats.map(({ region, segments: regSegs, negativeCount, newCount, stableCount, problemCount }) => (
                  <div
                    key={region.id}
                    className="flex flex-col justify-between rounded-xl border border-slate-200/90 bg-slate-50/60 p-3.5 transition-colors hover:border-sky-300 dark:border-slate-800 dark:bg-slate-950/50 dark:hover:border-cyan-700"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => onSelectRegion(region.id)}
                          className="text-left group"
                        >
                          <div className="text-sm font-bold text-slate-900 group-hover:text-sky-700 dark:text-slate-100 dark:group-hover:text-cyan-300">
                            {region.title[language]}
                          </div>
                          <div className="mt-0.5 font-mono text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                            {region.range} · {region.curveLabel[language]}
                          </div>
                        </button>
                        <span
                          className={`shrink-0 rounded-full border px-2 py-0.5 font-mono text-[10.5px] font-bold tabular-nums ${
                            problemCount > 0
                              ? 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-800/70 dark:bg-rose-950/60 dark:text-rose-300'
                              : 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800/70 dark:bg-emerald-950/60 dark:text-emerald-300'
                          }`}
                        >
                          {t.atlas3d.problemCountLabel}: {problemCount}
                        </span>
                      </div>

                      {/* Status Breakdown Counts */}
                      <div className="mt-2.5 flex flex-wrap gap-1.5 text-[10.5px] font-semibold">
                        <span className="rounded bg-rose-100/80 px-1.5 py-0.5 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                          {t.atlas3d.negativeCountLabel}: {negativeCount}
                        </span>
                        <span className="rounded bg-amber-100/80 px-1.5 py-0.5 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300">
                          {t.atlas3d.newCountLabel}: {newCount}
                        </span>
                        <span className="rounded bg-emerald-100/80 px-1.5 py-0.5 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                          {t.atlas3d.stableCountLabel}: {stableCount}
                        </span>
                      </div>

                      <p className="mt-2.5 text-[11.5px] leading-relaxed text-slate-600 dark:text-slate-300">
                        {region.innervationSummary[language]}
                      </p>

                      {region.sacralClinicalNote && (
                        <p className="mt-2 rounded-lg border border-violet-200/70 bg-violet-50/60 px-2.5 py-1.5 text-[11px] leading-snug text-violet-900 dark:border-violet-900/60 dark:bg-violet-950/30 dark:text-violet-200">
                          {region.sacralClinicalNote[language]}
                        </p>
                      )}
                    </div>

                    {/* Clickable Segment Chips */}
                    <div className="mt-3 flex flex-wrap gap-1 border-t border-slate-200/70 pt-2.5 dark:border-slate-800">
                      {regSegs.map((s) => {
                        const c = getStatusColors(s.status, isDark);
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => onSelectSegment(s.id)}
                            className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-0.5 font-mono text-[10.5px] font-semibold text-slate-700 transition-colors hover:border-sky-400 hover:text-sky-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-cyan-500 dark:hover:text-cyan-300"
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${c.dotClass}`} />
                            {s.id}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : panelMode === 'region' ? (
            <div className="space-y-4">
              {/* Block A: Region MRI Summary */}
              <div className="rounded-xl border border-slate-200/90 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-950/50">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-sky-700 dark:text-cyan-400">
                    <Activity className="h-3.5 w-3.5" />
                    {t.atlas3d.mriBlockTitle}
                  </div>
                  <span className="rounded bg-slate-200/70 px-2 py-0.5 text-[10.5px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {selectedRegionStats.region.curveLabel[language]}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div className="rounded-lg border border-rose-200/80 bg-rose-50/70 p-2.5 dark:border-rose-900/60 dark:bg-rose-950/35">
                    <div className="text-[10.5px] font-medium text-rose-700 dark:text-rose-300">
                      {t.atlas3d.negativeCountLabel}
                    </div>
                    <div className="mt-0.5 font-mono text-lg font-extrabold text-rose-800 tabular-nums dark:text-rose-200">
                      {selectedRegionStats.negativeCount}
                    </div>
                  </div>
                  <div className="rounded-lg border border-amber-200/80 bg-amber-50/70 p-2.5 dark:border-amber-900/60 dark:bg-amber-950/35">
                    <div className="text-[10.5px] font-medium text-amber-800 dark:text-amber-300">
                      {t.atlas3d.newCountLabel}
                    </div>
                    <div className="mt-0.5 font-mono text-lg font-extrabold text-amber-900 tabular-nums dark:text-amber-200">
                      {selectedRegionStats.newCount}
                    </div>
                  </div>
                  <div className="rounded-lg border border-emerald-200/80 bg-emerald-50/70 p-2.5 dark:border-emerald-900/60 dark:bg-emerald-950/35">
                    <div className="text-[10.5px] font-medium text-emerald-700 dark:text-emerald-300">
                      {t.atlas3d.stableCountLabel}
                    </div>
                    <div className="mt-0.5 font-mono text-lg font-extrabold text-emerald-800 tabular-nums dark:text-emerald-200">
                      {selectedRegionStats.stableCount}
                    </div>
                  </div>
                </div>

                {selectedRegionStats.region.sacralClinicalNote && (
                  <p className="mt-3 rounded-lg border border-violet-200/80 bg-violet-50/60 p-3 text-xs leading-relaxed text-violet-900 dark:border-violet-900/60 dark:bg-violet-950/35 dark:text-violet-200">
                    {selectedRegionStats.region.sacralClinicalNote[language]}
                  </p>
                )}

                <div className="mt-3">
                  <div className="mb-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    {t.atlas3d.regionSegmentsLabel}
                  </div>
                  <div className="space-y-1.5">
                    {selectedRegionStats.segments.map((seg) => {
                      const c = getStatusColors(seg.status, isDark);
                      const p25 = seg.metrics.protrusion2025;
                      const p26 = seg.metrics.protrusion2026;
                      return (
                        <button
                          key={seg.id}
                          type="button"
                          onClick={() => onSelectSegment(seg.id)}
                          className="flex w-full items-center justify-between gap-2 rounded-lg border border-slate-200/90 bg-white px-3 py-2 text-left transition-colors hover:border-sky-400 hover:bg-sky-50/40 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-cyan-600 dark:hover:bg-slate-800/70"
                        >
                          <div className="flex min-w-0 items-center gap-2">
                            <span className={`h-2 w-2 shrink-0 rounded-full ${c.dotClass}`} />
                            <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                              {seg.id}
                            </span>
                            <span className="truncate text-xs text-slate-600 dark:text-slate-300">
                              {seg.y2026.finding[language]}
                            </span>
                          </div>
                          <span className="shrink-0 font-mono text-[11px] font-semibold text-slate-500 tabular-nums dark:text-slate-400">
                            {p26 !== null && p26 > 0
                              ? `${p25 ?? 0}→${p26} ${t.mri.chartMmUnit}`
                              : seg.metrics.canalSagittal2026
                              ? `${seg.metrics.canalSagittal2026} ${t.mri.chartMmUnit}`
                              : '—'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Block B: Region Neuroanatomy */}
              <div className="rounded-xl border border-slate-200/90 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-950/50">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-teal-700 dark:text-teal-400">
                  <Network className="h-3.5 w-3.5" />
                  {t.atlas3d.neuroBlockTitle}
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                  {selectedRegionStats.region.innervationSummary[language]}
                </p>
                <p className="mt-2.5 text-[11px] italic text-slate-500 dark:text-slate-400">
                  {t.atlas3d.neuroDisclaimer}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Block A: Patient's MRI Dynamics (SOR 2025 -> 2026) */}
              <div className="rounded-xl border border-slate-200/90 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-950/50">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-sky-700 dark:text-cyan-400">
                    <Activity className="h-3.5 w-3.5" />
                    {t.atlas3d.mriBlockTitle}
                  </div>
                  <button
                    type="button"
                    onClick={() => onJumpToMri(activeSegment.id)}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-sky-700 transition-colors hover:border-sky-400 hover:bg-sky-50 dark:border-slate-700 dark:bg-slate-900 dark:text-cyan-300 dark:hover:border-cyan-500"
                  >
                    <span>{t.atlas3d.cardOpenMri}</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </button>
                </div>

                {/* Before -> After mm Metrics */}
                <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <div className="rounded-lg border border-slate-200/90 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                    <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      {t.atlas3d.protrusionChangeLabel}
                    </div>
                    <div className="mt-1 font-mono text-base font-extrabold tabular-nums text-slate-900 dark:text-slate-100">
                      {activeSegment.metrics.protrusion2025 !== null
                        ? `${activeSegment.metrics.protrusion2025}`
                        : '0'}{' '}
                      <span className="text-slate-400">→</span>{' '}
                      <span
                        className={
                          activeSegment.status === 'negative'
                            ? 'text-rose-600 dark:text-rose-400'
                            : activeSegment.status === 'new'
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }
                      >
                        {activeSegment.metrics.protrusion2026 !== null
                          ? `${activeSegment.metrics.protrusion2026} ${t.mri.chartMmUnit}`
                          : '—'}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-200/90 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                    <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      {t.atlas3d.canalChangeLabel}
                    </div>
                    <div className="mt-1 font-mono text-base font-extrabold tabular-nums text-slate-900 dark:text-slate-100">
                      {activeSegment.metrics.canalSagittal2025 ?? '—'}{' '}
                      <span className="text-slate-400">→</span>{' '}
                      <span className="text-sky-700 dark:text-cyan-400">
                        {activeSegment.metrics.canalSagittal2026 !== null
                          ? `${activeSegment.metrics.canalSagittal2026} ${t.mri.chartMmUnit}`
                          : '—'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Patient Delta Summary + 2026 Finding */}
                <p className="mt-3 text-xs leading-relaxed text-slate-700 dark:text-slate-200">
                  {activeSegment.deltaSummary[language]}
                </p>

                <div className="mt-3 space-y-1.5 border-t border-slate-200/80 pt-2.5 text-xs dark:border-slate-800">
                  <div>
                    <span className="font-semibold text-slate-500 dark:text-slate-400">
                      {t.atlas3d.finding2026Label}:{' '}
                    </span>
                    <span className="text-slate-800 dark:text-slate-200">
                      {activeSegment.y2026.finding[language]}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500 dark:text-slate-400">
                      {t.atlas3d.roots2026Label}:{' '}
                    </span>
                    <span className="text-slate-700 dark:text-slate-300">
                      {activeSegment.y2026.canal[language]} · {activeSegment.y2026.roots[language]}
                    </span>
                  </div>
                </div>
              </div>

              {/* Block B: Evidence-Based Neuroanatomy (Innervation / Dermatome) */}
              {neuroInfo && (
                <div className="rounded-xl border border-teal-200/80 bg-teal-50/40 p-4 dark:border-teal-900/60 dark:bg-teal-950/20">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-teal-800 dark:text-teal-300">
                      <Network className="h-3.5 w-3.5" />
                      {t.atlas3d.neuroBlockTitle}
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full border border-teal-200 bg-white px-2.5 py-0.5 text-[11px] font-bold text-teal-800 dark:border-teal-800 dark:bg-slate-900 dark:text-teal-300">
                      <Sparkles className="h-3 w-3" />
                      {neuroInfo.nerveRoot[language]}
                    </span>
                  </div>

                  <div className="mt-3 space-y-2.5 text-xs leading-relaxed">
                    <div className="rounded-lg border border-teal-200/70 bg-white/90 p-3 dark:border-teal-900/50 dark:bg-slate-900/80">
                      <div className="text-[11px] font-semibold text-teal-700 dark:text-teal-400">
                        {t.atlas3d.dermatomeLabel}
                      </div>
                      <p className="mt-1 text-slate-800 dark:text-slate-200">
                        {neuroInfo.dermatomeZone[language]}
                      </p>
                    </div>

                    <div className="rounded-lg border border-slate-200/80 bg-white/90 p-3 dark:border-slate-800 dark:bg-slate-900/80">
                      <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                        {t.atlas3d.myotomeLabel}
                      </div>
                      <p className="mt-1 text-slate-700 dark:text-slate-300">
                        {neuroInfo.motorFunction[language]}
                      </p>
                    </div>
                  </div>

                  <p className="mt-2.5 text-[10.5px] leading-snug text-slate-500 dark:text-slate-400">
                    {t.atlas3d.neuroDisclaimer}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
