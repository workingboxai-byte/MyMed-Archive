import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowUpRight,
  Bone,
  Brain,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  PanelLeftClose,
  PanelLeftOpen,
  RotateCcw,
} from 'lucide-react';
import { useMedicalArchive } from '../context/MedicalArchiveContext';
import { DETAILED_SPINE_SEGMENTS } from '../data/spineSegmentsData';
import { BRAIN_MRI_LANDMARKS } from '../data/brainFindingsData';
import { AtlasCameraPreset, SegmentStatus } from '../types/medical';
import { SvityloAtlasViewport, SvityloLayerState } from './SvityloAtlasViewport';

function statusDotClass(status: SegmentStatus): string {
  if (status === 'negative') return 'bg-rose-500';
  if (status === 'new') return 'bg-amber-500';
  return 'bg-emerald-500';
}

function statusPillClass(status: SegmentStatus): string {
  if (status === 'negative') {
    return 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-800/70 dark:bg-rose-950/70 dark:text-rose-300';
  }
  if (status === 'new') {
    return 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800/70 dark:bg-amber-950/70 dark:text-amber-300';
  }
  return 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800/70 dark:bg-emerald-950/70 dark:text-emerald-300';
}

function brainSeverityPill(severity: 'critical' | 'warning' | 'info'): string {
  if (severity === 'critical') {
    return 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-800/70 dark:bg-rose-950/70 dark:text-rose-300';
  }
  if (severity === 'warning') {
    return 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800/70 dark:bg-amber-950/70 dark:text-amber-300';
  }
  return 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800/70 dark:bg-emerald-950/70 dark:text-emerald-300';
}

const Atlas3DView: React.FC = () => {
  const {
    language,
    t,
    selectedMriSegment,
    setSelectedMriSegment,
    jumpToMriSegment,
    atlas3dScene,
    setAtlas3dScene,
    atlasFocusNonce,
  } = useMedicalArchive();

  // Narrow left segment sidebar is collapsible to give ~100% width to the 3D scene
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState<boolean>(true);
  // Top-right clinical detail card is collapsed by default as a compact clickable pill
  const [isDetailExpanded, setIsDetailExpanded] = useState<boolean>(false);

  // When null, Svitylo displays the full spine (C1–Sacrum + discs) opaque against the semi-transparent body silhouette.
  // Clicking any segment in the list or jumping from MRI Dynamics focuses and highlights those exact vertebrae.
  const [focusedSegmentId, setFocusedSegmentId] = useState<string | null>(() =>
    atlasFocusNonce > 0 ? selectedMriSegment : null,
  );
  const [selectedBrainId, setSelectedBrainId] = useState<string>(BRAIN_MRI_LANDMARKS[0].id);
  const [focusedBrainId, setFocusedBrainId] = useState<string | null>(null);
  const [localFocusNonce, setLocalFocusNonce] = useState<number>(0);

  const [cameraPresetRequest, setCameraPresetRequest] = useState<{
    preset: AtlasCameraPreset;
    nonce: number;
  } | null>(null);

  const [layers, setLayers] = useState<SvityloLayerState>({
    silhouette: true,
    muscles: false,
    vessels: true,
  });

  // Sync external jump from MRI Dynamics tab ("3D" button)
  const prevExternalNonceRef = useRef<number>(atlasFocusNonce);
  useEffect(() => {
    if (atlasFocusNonce !== prevExternalNonceRef.current) {
      prevExternalNonceRef.current = atlasFocusNonce;
      if (atlasFocusNonce > 0) {
        setFocusedSegmentId(selectedMriSegment);
      }
    }
  }, [atlasFocusNonce, selectedMriSegment]);

  const activeSegment = useMemo(() => {
    const id = focusedSegmentId ?? selectedMriSegment;
    return (
      DETAILED_SPINE_SEGMENTS.find((s) => s.id === id) ||
      DETAILED_SPINE_SEGMENTS.find((s) => s.id === 'L4-L5') ||
      DETAILED_SPINE_SEGMENTS[0]
    );
  }, [focusedSegmentId, selectedMriSegment]);

  const activeBrainLandmark = useMemo(() => {
    const id = focusedBrainId ?? selectedBrainId;
    return (
      BRAIN_MRI_LANDMARKS.find((lm) => lm.id === id) || BRAIN_MRI_LANDMARKS[0]
    );
  }, [focusedBrainId, selectedBrainId]);

  const handleSelectSegment = useCallback(
    (segId: string) => {
      setSelectedMriSegment(segId);
      setFocusedSegmentId(segId);
      setLocalFocusNonce((n) => n + 1);
    },
    [setSelectedMriSegment],
  );

  const handleSelectBrain = useCallback((findingId: string) => {
    setSelectedBrainId(findingId);
    setFocusedBrainId(findingId);
    setLocalFocusNonce((n) => n + 1);
  }, []);

  const handleSwitchScene = useCallback(
    (mode: 'spine' | 'brain') => {
      if (mode === atlas3dScene) return;
      setAtlas3dScene(mode);
      if (mode === 'spine') {
        setFocusedSegmentId(null);
      } else {
        setFocusedBrainId(null);
      }
    },
    [atlas3dScene, setAtlas3dScene],
  );

  const triggerCameraPreset = useCallback(
    (preset: AtlasCameraPreset) => {
      if (preset === 'reset') {
        if (atlas3dScene === 'spine') {
          setFocusedSegmentId(null);
        } else {
          setFocusedBrainId(null);
        }
      }
      setCameraPresetRequest((prev) => ({
        preset,
        nonce: (prev?.nonce ?? 0) + 1,
      }));
    },
    [atlas3dScene],
  );

  return (
    <div className="flex h-[calc(100vh-88px)] min-h-[560px] flex-col gap-2">
      {/* Main Spacious Workspace: Narrow Collapsible Left Panel (252px) + Maximum-Area Svitylo 3D Viewport */}
      <div className="relative flex min-h-0 flex-1 gap-3">
        {/* NARROW COLLAPSIBLE LEFT COLUMN (252px) */}
        {isLeftPanelOpen && (
          <aside className="flex w-[252px] shrink-0 flex-col overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {/* Compact Top Row: Scene Switcher + Collapse Button */}
            <div className="flex items-center gap-1.5 border-b border-slate-200/80 p-2 dark:border-slate-800">
              <div
                className="grid flex-1 grid-cols-2 rounded-lg bg-slate-100 p-0.5 dark:bg-slate-800"
                role="tablist"
                aria-label={t.atlas3d.sectionTitle}
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={atlas3dScene === 'spine'}
                  onClick={() => handleSwitchScene('spine')}
                  title={t.atlas3d.sceneSpine}
                  className={`inline-flex items-center justify-center gap-1 rounded-md px-2 py-1.5 text-[11px] font-semibold transition-colors whitespace-nowrap ${
                    atlas3dScene === 'spine'
                      ? 'bg-sky-600 text-white shadow-2xs dark:bg-cyan-600'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                  }`}
                >
                  <Bone className="h-3 w-3 shrink-0" />
                  <span className="truncate">{t.atlas3d.sceneSpineShort}</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={atlas3dScene === 'brain'}
                  onClick={() => handleSwitchScene('brain')}
                  title={t.atlas3d.sceneBrain}
                  className={`inline-flex items-center justify-center gap-1 rounded-md px-2 py-1.5 text-[11px] font-semibold transition-colors whitespace-nowrap ${
                    atlas3dScene === 'brain'
                      ? 'bg-sky-600 text-white shadow-2xs dark:bg-cyan-600'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                  }`}
                >
                  <Brain className="h-3 w-3 shrink-0" />
                  <span className="truncate">{t.atlas3d.sceneBrainShort}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsLeftPanelOpen(false)}
                title={t.atlas3d.collapsePanel}
                aria-label={t.atlas3d.collapsePanel}
                className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <PanelLeftClose className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Compact Context / Layer Toggle Strip */}
            <div className="grid grid-cols-2 gap-1.5 border-b border-slate-200/80 px-2 py-2 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setLayers((prev) => ({ ...prev, silhouette: !prev.silhouette }))}
                className={`inline-flex items-center justify-between gap-1 rounded-lg border px-2 py-1 text-[11px] font-medium transition-colors ${
                  layers.silhouette
                    ? 'border-sky-200 bg-sky-50/80 text-sky-900 dark:border-cyan-800/80 dark:bg-cyan-950/40 dark:text-cyan-200'
                    : 'border-slate-200 bg-slate-50/60 text-slate-500 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-400'
                }`}
              >
                <span className="truncate">
                  {atlas3dScene === 'spine'
                    ? t.atlas3d.layerSilhouette
                    : t.atlas3d.layerHeadSilhouette}
                </span>
                {layers.silhouette ? (
                  <Eye className="h-3 w-3 shrink-0 text-sky-600 dark:text-cyan-400" />
                ) : (
                  <EyeOff className="h-3 w-3 shrink-0 text-slate-400" />
                )}
              </button>

              {atlas3dScene === 'spine' ? (
                <button
                  type="button"
                  onClick={() => setLayers((prev) => ({ ...prev, muscles: !prev.muscles }))}
                  className={`inline-flex items-center justify-between gap-1 rounded-lg border px-2 py-1 text-[11px] font-medium transition-colors ${
                    layers.muscles
                      ? 'border-sky-200 bg-sky-50/80 text-sky-900 dark:border-cyan-800/80 dark:bg-cyan-950/40 dark:text-cyan-200'
                      : 'border-slate-200 bg-slate-50/60 text-slate-500 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-400'
                  }`}
                >
                  <span className="truncate">{t.atlas3d.layerMuscles}</span>
                  {layers.muscles ? (
                    <Eye className="h-3 w-3 shrink-0 text-sky-600 dark:text-cyan-400" />
                  ) : (
                    <EyeOff className="h-3 w-3 shrink-0 text-slate-400" />
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setLayers((prev) => ({ ...prev, vessels: !prev.vessels }))}
                  className={`inline-flex items-center justify-between gap-1 rounded-lg border px-2 py-1 text-[11px] font-medium transition-colors ${
                    layers.vessels
                      ? 'border-sky-200 bg-sky-50/80 text-sky-900 dark:border-cyan-800/80 dark:bg-cyan-950/40 dark:text-cyan-200'
                      : 'border-slate-200 bg-slate-50/60 text-slate-500 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-400'
                  }`}
                >
                  <span className="truncate">{t.atlas3d.layerVessels}</span>
                  {layers.vessels ? (
                    <Eye className="h-3 w-3 shrink-0 text-sky-600 dark:text-cyan-400" />
                  ) : (
                    <EyeOff className="h-3 w-3 shrink-0 text-slate-400" />
                  )}
                </button>
              )}
            </div>

            {/* Section List Subheader */}
            <div className="flex items-center justify-between px-3 pt-2.5 pb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {atlas3dScene === 'spine'
                  ? t.atlas3d.segmentsTitle
                  : t.atlas3d.brainPointsTitle}
              </span>
              <span className="font-mono text-[10px] text-slate-400 tabular-nums">
                {atlas3dScene === 'spine'
                  ? DETAILED_SPINE_SEGMENTS.length
                  : BRAIN_MRI_LANDMARKS.length}
              </span>
            </div>

            {/* Full-Height Scrollable Clinical List */}
            <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
              {atlas3dScene === 'spine' ? (
                <div className="space-y-0.5">
                  {DETAILED_SPINE_SEGMENTS.map((seg) => {
                    const isFocused = focusedSegmentId === seg.id;
                    const p25 = seg.metrics.protrusion2025;
                    const p26 = seg.metrics.protrusion2026;
                    const metricText =
                      p26 !== null && p26 > 0
                        ? `${p25 ?? 0}→${p26} ${t.mri.chartMmUnit}`
                        : seg.metrics.canalSagittal2026 !== null
                        ? `${seg.metrics.canalSagittal2026} ${t.mri.chartMmUnit}`
                        : '—';

                    return (
                      <button
                        key={seg.id}
                        type="button"
                        onClick={() => handleSelectSegment(seg.id)}
                        className={`flex w-full items-center justify-between gap-1.5 rounded-lg border px-2 py-1.5 text-left transition-colors ${
                          isFocused
                            ? 'border-sky-300 bg-sky-50 text-slate-900 shadow-2xs dark:border-cyan-600/80 dark:bg-cyan-950/55 dark:text-white'
                            : 'border-transparent hover:border-slate-200/80 hover:bg-slate-50 dark:hover:border-slate-800 dark:hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <span
                            className={`h-2 w-2 shrink-0 rounded-full ${statusDotClass(seg.status)}`}
                            aria-hidden="true"
                          />
                          <span className="font-mono text-xs font-bold tabular-nums text-slate-900 dark:text-slate-100">
                            {seg.id}
                          </span>
                        </div>
                        <span className="shrink-0 font-mono text-[10px] font-medium text-slate-500 tabular-nums dark:text-slate-400">
                          {metricText}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-1.5">
                  {BRAIN_MRI_LANDMARKS.map((lm) => {
                    const isFocused = focusedBrainId === lm.id;
                    return (
                      <button
                        key={lm.id}
                        type="button"
                        onClick={() => handleSelectBrain(lm.id)}
                        className={`flex w-full items-start gap-2 rounded-lg border p-2 text-left transition-colors ${
                          isFocused
                            ? 'border-sky-300 bg-sky-50 text-slate-900 shadow-2xs dark:border-cyan-600/80 dark:bg-cyan-950/55 dark:text-white'
                            : 'border-slate-200/70 bg-slate-50/40 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950/40 dark:hover:bg-slate-800/60'
                        }`}
                      >
                        <span
                          className="mt-1 h-2 w-2 shrink-0 rounded-full"
                          style={{ backgroundColor: lm.colorHex }}
                          aria-hidden="true"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-[11px] font-semibold leading-snug text-slate-900 dark:text-slate-100">
                            {lm.shortLabel[language]}
                          </div>
                          <div className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
                            {lm.metricBadge[language]}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Subtle right-trapezius clinical cue only when back muscles are active */}
            {atlas3dScene === 'spine' && layers.muscles && (
              <div className="border-t border-rose-200/70 bg-rose-50/70 px-2.5 py-1.5 text-[10px] leading-snug text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/35 dark:text-rose-200">
                {t.atlas3d.trapeziusBadge}
              </div>
            )}
          </aside>
        )}

        {/* RIGHT / EXPANDED 3D VIEWPORT (Svitylo 3D Anatomy Atlas) */}
        <section className="relative flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-200/90 bg-[#0d1424] shadow-sm dark:border-slate-800">
          <SvityloAtlasViewport
            sceneMode={atlas3dScene}
            language={language}
            focusedSegmentId={focusedSegmentId}
            focusedBrainId={focusedBrainId}
            focusTriggerNonce={atlasFocusNonce + localFocusNonce}
            cameraPresetRequest={cameraPresetRequest}
            layers={layers}
            onSelectSegmentFrom3D={handleSelectSegment}
            onSelectBrainFrom3D={handleSelectBrain}
            loadingLabel={t.atlas3d.loadingEngine}
          />

          {/* Top-Left Floating Expand Panel & Scene Pill (shown only when left panel is collapsed) */}
          {!isLeftPanelOpen && (
            <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsLeftPanelOpen(true)}
                title={t.atlas3d.expandPanel}
                aria-label={t.atlas3d.expandPanel}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700/90 bg-slate-900/92 px-2.5 py-1.5 text-xs font-semibold text-slate-100 shadow-md transition-colors hover:border-cyan-500/70 hover:bg-slate-800"
              >
                <PanelLeftOpen className="h-3.5 w-3.5 text-cyan-400" />
                <span className="hidden sm:inline">
                  {atlas3dScene === 'spine'
                    ? t.atlas3d.segmentsTitle
                    : t.atlas3d.brainPointsTitle}
                </span>
              </button>

              <div className="inline-flex rounded-lg border border-slate-700/90 bg-slate-900/92 p-0.5 shadow-md">
                <button
                  type="button"
                  onClick={() => handleSwitchScene('spine')}
                  className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold transition-colors ${
                    atlas3dScene === 'spine'
                      ? 'bg-cyan-600 text-white'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Bone className="h-3 w-3" />
                  <span className="hidden sm:inline">{t.atlas3d.sceneSpineShort}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitchScene('brain')}
                  className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold transition-colors ${
                    atlas3dScene === 'brain'
                      ? 'bg-cyan-600 text-white'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Brain className="h-3 w-3" />
                  <span className="hidden sm:inline">{t.atlas3d.sceneBrainShort}</span>
                </button>
              </div>
            </div>
          )}

          {/* Top-Right Clinical Detail Card — COLLAPSED BY DEFAULT as a compact clickable pill */}
          <div className="absolute top-3 right-3 z-10 flex flex-col items-end">
            {!isDetailExpanded ? (
              <button
                type="button"
                onClick={() => setIsDetailExpanded(true)}
                aria-expanded={false}
                title={t.atlas3d.detailsExpand}
                className="inline-flex max-w-[280px] items-center gap-2 rounded-full border border-slate-200/95 bg-white/95 px-3 py-1.5 text-xs shadow-md transition-colors hover:border-sky-400 dark:border-slate-700/95 dark:bg-slate-900/95 dark:hover:border-cyan-500"
              >
                {atlas3dScene === 'spine' ? (
                  <>
                    <span
                      className={`h-2 w-2 shrink-0 rounded-full ${statusDotClass(activeSegment.status)}`}
                      aria-hidden="true"
                    />
                    <span className="font-mono font-extrabold text-slate-900 dark:text-white">
                      {activeSegment.id}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap ${statusPillClass(
                        activeSegment.status,
                      )}`}
                    >
                      {activeSegment.statusLabel[language]}
                    </span>
                  </>
                ) : (
                  <>
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: activeBrainLandmark.colorHex }}
                      aria-hidden="true"
                    />
                    <span className="truncate font-semibold text-slate-900 dark:text-white">
                      {activeBrainLandmark.shortLabel[language]}
                    </span>
                  </>
                )}
                <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-500 dark:text-slate-400" />
              </button>
            ) : (
              <div className="w-[276px] max-w-[calc(100vw-48px)] rounded-xl border border-slate-200/95 bg-white/96 p-3.5 shadow-lg dark:border-slate-700/95 dark:bg-slate-900/96 sm:w-[296px]">
                {atlas3dScene === 'spine' ? (
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-[10px] font-semibold text-sky-700 dark:text-cyan-400">
                          {t.mri.regionLabels[activeSegment.region]}
                        </div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-mono text-base font-extrabold text-slate-900 dark:text-white">
                            {activeSegment.id}
                          </h3>
                          <span
                            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap ${statusPillClass(
                              activeSegment.status,
                            )}`}
                          >
                            {activeSegment.statusLabel[language]}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsDetailExpanded(false)}
                        aria-label={t.atlas3d.detailsCollapse}
                        title={t.atlas3d.detailsCollapse}
                        className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 rounded-lg border border-slate-200/90 bg-slate-50/90 p-2 dark:border-slate-800 dark:bg-slate-950/75">
                      <div>
                        <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                          {t.atlas3d.cardProtrusion}
                        </div>
                        <div className="mt-0.5 font-mono text-xs font-bold tabular-nums text-slate-900 dark:text-slate-100">
                          {activeSegment.metrics.protrusion2025 ?? 0} →{' '}
                          <span className="text-rose-600 dark:text-rose-400">
                            {activeSegment.metrics.protrusion2026 ?? 0} {t.mri.chartMmUnit}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                          {t.atlas3d.cardCanal}
                        </div>
                        <div className="mt-0.5 font-mono text-xs font-bold tabular-nums text-slate-900 dark:text-slate-100">
                          {activeSegment.metrics.canalSagittal2025 ?? '—'} →{' '}
                          <span className="text-sky-700 dark:text-cyan-400">
                            {activeSegment.metrics.canalSagittal2026 ?? '—'} {t.mri.chartMmUnit}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="line-clamp-3 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                      {activeSegment.deltaSummary[language]}
                    </p>

                    <button
                      type="button"
                      onClick={() => jumpToMriSegment(activeSegment.id)}
                      className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-semibold text-sky-700 transition-colors hover:border-sky-300 hover:bg-sky-50 dark:border-slate-700 dark:bg-slate-800 dark:text-cyan-300 dark:hover:border-cyan-600"
                    >
                      <span>{t.atlas3d.cardOpenMri}</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-[10px] font-semibold text-sky-700 dark:text-cyan-400">
                          {activeBrainLandmark.category[language]}
                        </span>
                        <h3 className="mt-0.5 text-xs font-bold leading-snug text-slate-900 dark:text-white">
                          {activeBrainLandmark.title[language]}
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsDetailExpanded(false)}
                        aria-label={t.atlas3d.detailsCollapse}
                        title={t.atlas3d.detailsCollapse}
                        className="shrink-0 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>
                    </div>

                    <div>
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${brainSeverityPill(
                          activeBrainLandmark.severity,
                        )}`}
                      >
                        {activeBrainLandmark.metricBadge[language]}
                      </span>
                    </div>

                    <div className="rounded-lg border border-slate-200/90 bg-slate-50/90 px-2.5 py-1.5 text-[11px] dark:border-slate-800 dark:bg-slate-950/75">
                      <span className="font-semibold text-slate-500 dark:text-slate-400">
                        {t.atlas3d.cardLocation}:{' '}
                      </span>
                      <span className="text-slate-800 dark:text-slate-200">
                        {activeBrainLandmark.location[language]}
                      </span>
                    </div>

                    <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                      {activeBrainLandmark.summary[language]}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom-Center Clean Camera Control Dock */}
          <div className="pointer-events-none absolute right-3 bottom-3 left-3 z-10 flex items-end justify-center">
            <div className="pointer-events-auto inline-flex flex-wrap items-center justify-center gap-1 rounded-xl border border-slate-700/90 bg-slate-900/92 p-1 shadow-lg">
              {(
                [
                  { id: 'front', label: t.atlas3d.viewFront },
                  { id: 'side', label: t.atlas3d.viewSide },
                  { id: 'back', label: t.atlas3d.viewBack },
                ] as const
              ).map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => triggerCameraPreset(preset.id)}
                  className="rounded-lg px-2.5 py-1 text-[11px] font-semibold text-slate-200 transition-colors hover:bg-slate-800 hover:text-white"
                >
                  {preset.label}
                </button>
              ))}
              <div className="mx-0.5 h-3.5 w-px bg-slate-700" aria-hidden="true" />
              <button
                type="button"
                onClick={() => triggerCameraPreset('reset')}
                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold text-cyan-300 transition-colors hover:bg-cyan-950/70 hover:text-cyan-200"
              >
                <RotateCcw className="h-3 w-3" />
                <span>
                  {atlas3dScene === 'spine'
                    ? t.atlas3d.viewFullSpine
                    : t.atlas3d.viewFullBrain}
                </span>
              </button>
            </div>
          </div>

          {/* Subtle Bottom-Right Attribution (CPAL-1.0 Svitylo & CC BY-SA Z-Anatomy) */}
          <a
            href="https://svitylo.com/3d-anatomy-atlas"
            target="_blank"
            rel="noopener noreferrer"
            className="absolute right-3 bottom-3 z-10 hidden rounded-md bg-slate-900/80 px-2 py-0.5 text-[10px] font-medium text-slate-400 transition-colors hover:text-slate-200 xl:inline-block"
          >
            {t.atlas3d.attribution}
          </a>
        </section>
      </div>
    </div>
  );
};

export default Atlas3DView;
