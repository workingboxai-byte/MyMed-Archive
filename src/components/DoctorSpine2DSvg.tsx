import React, { useMemo } from 'react';
import { DetailedSpineSegment, Language, SegmentStatus } from '../types/medical';
import { UiDictionary } from '../data/i18n';

interface DoctorSpine2DSvgProps {
  segments: DetailedSpineSegment[];
  language: Language;
  t: UiDictionary;
}

interface PrintVertebra {
  id: string;
  cx: number;
  cy: number;
  w: number;
  h: number;
  rot: number;
}

const PRINT_VERTEBRAE: PrintVertebra[] = [
  { id: 'C1', cx: 88, cy: 26, w: 15, h: 7, rot: -5 },
  { id: 'C2', cx: 85, cy: 38, w: 16, h: 8, rot: -4 },
  { id: 'C3', cx: 82, cy: 52, w: 16, h: 8.5, rot: -2 },
  { id: 'C4', cx: 81, cy: 66, w: 17, h: 9, rot: 1 },
  { id: 'C5', cx: 82, cy: 81, w: 18, h: 9, rot: 4 },
  { id: 'C6', cx: 85, cy: 96, w: 18, h: 9.5, rot: 7 },
  { id: 'C7', cx: 90, cy: 111, w: 19, h: 10, rot: 10 },
  { id: 'D1', cx: 96, cy: 127, w: 20, h: 10.5, rot: 11 },
  { id: 'D2', cx: 102, cy: 144, w: 20, h: 11, rot: 10 },
  { id: 'D3', cx: 108, cy: 161, w: 21, h: 11, rot: 8 },
  { id: 'D4', cx: 112, cy: 179, w: 21, h: 11.5, rot: 5 },
  { id: 'D5', cx: 115, cy: 197, w: 22, h: 11.5, rot: 2 },
  { id: 'D6', cx: 117, cy: 215, w: 22, h: 12, rot: 0 },
  { id: 'D7', cx: 117, cy: 233, w: 22, h: 12, rot: -2 },
  { id: 'D8', cx: 115, cy: 251, w: 23, h: 12, rot: -5 },
  { id: 'D9', cx: 112, cy: 269, w: 23, h: 12.5, rot: -7 },
  { id: 'D10', cx: 108, cy: 287, w: 24, h: 13, rot: -8 },
  { id: 'D11', cx: 103, cy: 306, w: 24, h: 13.5, rot: -8 },
  { id: 'D12', cx: 97, cy: 325, w: 25, h: 13.5, rot: -7 },
  { id: 'L1', cx: 91, cy: 346, w: 26, h: 15, rot: -6 },
  { id: 'L2', cx: 86, cy: 368, w: 27, h: 15.5, rot: -4 },
  { id: 'L3', cx: 83, cy: 391, w: 28, h: 16, rot: 0 },
  { id: 'L4', cx: 84, cy: 414, w: 28, h: 16, rot: 6 },
  { id: 'L5', cx: 89, cy: 437, w: 28, h: 16, rot: 14 },
];

const DISC_SEGMENT_MAP: Record<string, { segmentId: string; callout: boolean }> = {
  'C2-C3': { segmentId: 'C2-C3', callout: false },
  'C3-C4': { segmentId: 'C3-C4', callout: false },
  'C4-C5': { segmentId: 'C4-C5', callout: true },
  'C5-C6': { segmentId: 'C5-C6', callout: true },
  'C6-C7': { segmentId: 'C6-C7', callout: false },
  'C7-D1': { segmentId: 'C7-D1', callout: true },
  'D1-D2': { segmentId: 'D1-D2', callout: false },
  'D2-D3': { segmentId: 'D2-D3', callout: false },
  'D3-D4': { segmentId: 'D3-D4', callout: false },
  'D4-D5': { segmentId: 'D4-D5', callout: true },
  'D6-D7': { segmentId: 'D6-D9', callout: false },
  'D7-D8': { segmentId: 'D6-D9', callout: true },
  'D8-D9': { segmentId: 'D6-D9', callout: false },
  'D10-D11': { segmentId: 'D10-D12', callout: true },
  'D11-D12': { segmentId: 'D10-D12', callout: false },
  'L1-L2': { segmentId: 'L1-L3', callout: false },
  'L2-L3': { segmentId: 'L1-L3', callout: true },
  'L3-L4': { segmentId: 'L3-L4', callout: true },
  'L4-L5': { segmentId: 'L4-L5', callout: true },
  'L5-S1': { segmentId: 'L5-S1', callout: true },
};

function getPrintStatusColor(status: SegmentStatus) {
  if (status === 'negative') return { fill: '#E11D48', stroke: '#9F1239', text: '#9F1239', bg: '#FFF1F2' };
  if (status === 'new') return { fill: '#D97706', stroke: '#92400E', text: '#92400E', bg: '#FFFBEB' };
  return { fill: '#059669', stroke: '#065F46', text: '#065F46', bg: '#ECFDF5' };
}

export const DoctorSpine2DSvg: React.FC<DoctorSpine2DSvgProps> = ({ segments, language, t }) => {
  const segmentById = useMemo(() => {
    const map = new Map<string, DetailedSpineSegment>();
    segments.forEach((s) => map.set(s.id, s));
    return map;
  }, [segments]);

  const discs = useMemo(() => {
    const list: Array<{
      key: string;
      cx: number;
      cy: number;
      w: number;
      h: number;
      rot: number;
      segmentId: string | null;
      callout: boolean;
    }> = [];

    for (let i = 0; i < PRINT_VERTEBRAE.length - 1; i++) {
      const u = PRINT_VERTEBRAE[i];
      const l = PRINT_VERTEBRAE[i + 1];
      const key = `${u.id}-${l.id}`;
      const mapped = DISC_SEGMENT_MAP[key];
      list.push({
        key,
        cx: (u.cx + l.cx) / 2,
        cy: (u.cy + l.cy) / 2,
        w: (u.w + l.w) / 2 - 2,
        h: i >= 18 ? 5.8 : i >= 6 ? 4.4 : 4,
        rot: (u.rot + l.rot) / 2,
        segmentId: mapped?.segmentId ?? null,
        callout: mapped?.callout ?? false,
      });
    }

    const l5 = PRINT_VERTEBRAE[PRINT_VERTEBRAE.length - 1];
    list.push({
      key: 'L5-S1',
      cx: l5.cx + 4.5,
      cy: l5.cy + 12.5,
      w: 27,
      h: 5.8,
      rot: 22,
      segmentId: 'L5-S1',
      callout: true,
    });
    return list;
  }, []);

  const cordPath = useMemo(() => {
    return PRINT_VERTEBRAE.map((v, i) => `${i === 0 ? 'M' : 'L'} ${v.cx + v.w / 2 + 3.5} ${v.cy}`).join(' ');
  }, []);

  const regionTicks = [
    { code: 'C1–C7', label: language === 'uk' ? 'Шийн.' : language === 'ru' ? 'Шейн.' : 'Cerv.', y1: 21, y2: 117, color: '#0284C7' },
    { code: 'D1–D12', label: language === 'uk' ? 'Груд.' : language === 'ru' ? 'Груд.' : 'Thor.', y1: 122, y2: 332, color: '#D97706' },
    { code: 'L1–L5', label: language === 'uk' ? 'Попер.' : language === 'ru' ? 'Поясн.' : 'Lumb.', y1: 338, y2: 446, color: '#E11D48' },
    { code: 'S1–S5', label: language === 'uk' ? 'Крижі' : language === 'ru' ? 'Крест.' : 'Sacr.', y1: 452, y2: 500, color: '#64748B' },
  ];

  return (
    <div className="print-avoid-break rounded-lg border border-slate-200 bg-slate-50/70 p-2.5">
      <div className="mb-1 text-center text-[10px] font-bold tracking-tight text-slate-700">
        {t.doctorPrint.spineDiagramTitle}
      </div>

      <svg
        viewBox="0 0 218 520"
        className="mx-auto h-auto w-full max-w-[190px] print:max-w-[155px]"
        role="img"
        aria-label={t.doctorPrint.spineDiagramTitle}
      >
        {/* Left region bracket markers */}
        {regionTicks.map((r) => {
          const midY = (r.y1 + r.y2) / 2;
          return (
            <g key={r.code}>
              <path
                d={`M 54 ${r.y1} L 49 ${r.y1} L 49 ${r.y2} L 54 ${r.y2}`}
                fill="none"
                stroke={r.color}
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <text
                x="44"
                y={midY - 2}
                textAnchor="end"
                fill={r.color}
                fontSize="8.5"
                fontWeight="700"
                fontFamily="IBM Plex Mono, monospace"
              >
                {r.code}
              </text>
              <text
                x="44"
                y={midY + 8}
                textAnchor="end"
                fill="#64748B"
                fontSize="7.5"
                fontWeight="500"
              >
                {r.label}
              </text>
            </g>
          );
        })}

        {/* Spinal cord axis */}
        <path
          d={cordPath}
          fill="none"
          stroke="#94A3B8"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.45"
        />

        {/* Sacrum & Coccyx silhouette */}
        <path
          d="M 80 453 C 96 449 112 454 117 464 C 122 476 116 490 104 498 L 97 507 C 94 510 90 508 91 504 L 94 495 C 88 487 82 474 79 463 Z"
          fill="#E2E8F0"
          stroke="#94A3B8"
          strokeWidth="1.1"
        />

        {/* 24 Lateral Vertebral Bodies + Spinous Processes */}
        {PRINT_VERTEBRAE.map((v) => (
          <g key={v.id} transform={`translate(${v.cx}, ${v.cy}) rotate(${v.rot})`}>
            <path
              d={`M ${v.w / 2 - 1} -2 L ${v.w / 2 + 12} 3 L ${v.w / 2 + 10} 6 L ${v.w / 2 - 1} 3 Z`}
              fill="#E2E8F0"
              stroke="#94A3B8"
              strokeWidth="0.7"
            />
            <rect
              x={-v.w / 2}
              y={-v.h / 2}
              width={v.w}
              height={v.h}
              rx="2.4"
              fill="#F8FAFC"
              stroke="#64748B"
              strokeWidth="0.95"
            />
          </g>
        ))}

        {/* Color-Coded Intervertebral Discs & Key Segment Callouts */}
        {discs.map((d) => {
          const seg = d.segmentId ? segmentById.get(d.segmentId) : undefined;
          const colors = seg
            ? getPrintStatusColor(seg.status)
            : { fill: '#CBD5E1', stroke: '#94A3B8', text: '#64748B', bg: '#F8FAFC' };
          const isAlert = seg && (seg.status === 'negative' || seg.status === 'new');
          const showCallout = Boolean(seg && d.callout && (seg.status !== 'stable' || seg.id === 'C7-D1'));

          return (
            <g key={d.key}>
              <g transform={`translate(${d.cx}, ${d.cy}) rotate(${d.rot})`}>
                <rect
                  x={-d.w / 2}
                  y={-d.h / 2}
                  width={d.w}
                  height={d.h}
                  rx={d.h / 2}
                  fill={colors.fill}
                  stroke={colors.stroke}
                  strokeWidth="0.7"
                />
                {isAlert && (
                  <circle
                    cx={d.w / 2 + 2.4}
                    cy="0"
                    r={seg.status === 'negative' ? 2.7 : 2.1}
                    fill={colors.fill}
                  />
                )}
              </g>

              {showCallout && seg && (
                <g>
                  <line
                    x1={d.cx + d.w / 2 + 6}
                    y1={d.cy}
                    x2={153}
                    y2={d.cy}
                    stroke={colors.fill}
                    strokeWidth="0.85"
                    strokeDasharray="2 1.5"
                  />
                  <rect
                    x={154}
                    y={d.cy - 7}
                    width={58}
                    height={14}
                    rx="3"
                    fill={colors.bg}
                    stroke={colors.fill}
                    strokeWidth="0.85"
                  />
                  <text
                    x={183}
                    y={d.cy + 2.8}
                    textAnchor="middle"
                    fill={colors.text}
                    fontSize="8"
                    fontWeight="700"
                    fontFamily="IBM Plex Mono, monospace"
                  >
                    {seg.id}
                    {seg.metrics.protrusion2026 ? ` ${seg.metrics.protrusion2026.toFixed(1)}` : ''}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>

      {/* Compact Print Legend */}
      <div className="mt-1.5 space-y-1 border-t border-slate-200 pt-1.5 text-[9.5px] leading-tight text-slate-600">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-rose-600" />
          <span>{t.mri.legendNegative}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-amber-600" />
          <span>{t.mri.legendNew}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-emerald-600" />
          <span>{t.mri.legendStable}</span>
        </div>
      </div>
    </div>
  );
};
