import React, { useCallback, useMemo, useState } from 'react';
import {
  Bone,
  Brain,
  Layers,
  RotateCcw,
  ArrowUpRight,
  Eye,
  EyeOff,
  Compass,
} from 'lucide-react';
import { useMedicalArchive } from '../context/MedicalArchiveContext';
import { DETAILED_SPINE_SEGMENTS } from '../data/spineSegmentsData';
import { BRAIN_MRI_LANDMARKS } from '../data/brainFindingsData';
import { AtlasCameraPreset, AtlasSceneMode, SegmentStatus } from '../types/medical';
import {
  Atlas3DViewport,
  BrainLayersState,
  SpineLayersState,
} from './Atlas3DViewport';

function statusDotClass(status: SegmentStatus): string {
  if (status === 'negative') return 'bg-rose-500';
  if (status === 'new') return 'bg-amber-500';
  return 'bg-emerald-500';
}

function statusPillClass(status: SegmentStatus): string {
  if (status === 'negative') {
    return 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-800/70 dark:bg-rose-950/60 dark:text-rose-300';
  }
  if (status === 'new') {
    return 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800/70 dark:bg-amber-950/60 dark:text-amber-300';
  }
  return 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800/70 dark:bg-emerald-950/60 dark:text-emerald-300';
}

function brainSeverityPill(severity: 'critical' | 'warning' | 'info'): string {
  if (severity === 'critical') {
    return 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-800/70 dark:bg-rose-950/60 dark:text-rose-300';
  }
  if (severity === 'warning') {
    return 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800/70 dark:bg-amber-950/60 dark:text-amber-300';
  }
  return 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800/70 dark:bg-emerald-950/60 dark:text-emerald-300';
}

const Atlas3DView: React.FC = () => {
  const {
    language,
    theme,
    privacyMode,
    t,
    profile,
    selectedMriSegment,
    setSelectedMriSegment,
    jumpToMriSegment,
    atlas3dScene,
    setAtlas3dScene,
    atlasFocusNonce,
  } = useMedicalArchive();

  const [selectedBrainId, setSelectedBrainId] = useState<string>(BRAIN_MRI_LANDMARKS[0].id);
  const [localFocusNonce, setLocalFocusNonce] = useState<number>(0);
  const [cameraPresetRequest, setCameraPresetRequest] = useState<{
    preset: AtlasCameraPreset;
    nonce: number;
  } | null>(null);

  const [spineLayers, setSpineLayers] = useState<SpineLayersState>({
    vertebrae: true,
    discs: true,
    muscles: true,
  });

  const [brainLayers, setBrainLayers] = useState<BrainLayersState>({
    hemispheres: true,
    vessels: true,
    markers: true,
  });

  const [modelSources, setModelSources] = useState<
    Record<AtlasSceneMode, 'procedural' | 'glb'>
  >({
    spine: 'procedural',
    brain: 'procedural',
  });

  const selectedSegment = useMemo(() => {
    return (
      DETAILED_SPINE_SEGMENTS.find((s) => s.id === selectedMriSegment) ||
      DETAILED_SPINE_SEGMENTS.find((s) => s.id === 'L4-L5') ||
      DETAILED_SPINE_SEGMENTS[0]
    );
  }, [selectedMriSegment]);

  const selectedBrainLandmark = useMemo(() => {
    return (
      BRAIN_MRI_LANDMARKS.find((lm) => lm.id === selectedBrainId) || BRAIN_MRI_LANDMARKS[0]
    );
  }, [selectedBrainId]);

  const handleSelectSegment = useCallback(
    (segId: string) => {
      setSelectedMriSegment(segId);
      setLocalFocusNonce((n) => n + 1);
    },
    [setSelectedMriSegment],
  );

  const handleSelectBrain = useCallback((findingId: string) => {
    setSelectedBrainId(findingId);
  }, []);

  const handleModelSourceChange = useCallback(
    (scene: AtlasSceneMode, source: 'procedural' | 'glb') => {
      setModelSources((prev) => (prev[scene] === source ? prev : { ...prev, [scene]: source }));
    },
    [],
  );

  const triggerCameraPreset = (preset: AtlasCameraPreset) => {
    setCameraPresetRequest((prev) => ({
      preset,
      nonce: (prev?.nonce ?? 0) + 1,
    }));
  };

  const patientName =
    (language === 'uk'
      ? profile.full_name_uk
      : language === 'ru'
      ? profile.full_name_ru
      : profile.full_name_en) || t.patientShort;

  const activeModelSource = modelSources[atlas3dScene];

  return (
    <div className="space-y-5">
      {/* Header & Scene Switcher */}
      <section className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-sky-700 dark:text-cyan-400">
                {t.nav.atlas3d}
              </span>
              <span aria-hidden="true">·</span>
              <span className={privacyMode ? 'blur-[5px] select-none' : ''}>
                {patientName}
              </span>
              <span>({profile.birth_year})</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-2xl">
              {t.atlas3d.sectionTitle}
            </h1>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 sm:text-sm">
              {t.atlas3d.sectionSubtitle}
            </p>
          </div>

          {/* Two-Scene Switcher: Spine & Muscles | Brain & Vessels */}
          <div
            className="inline-flex w-full shrink-0 rounded-lg bg-slate-100 p-1 dark:bg-slate-800 lg:w-auto"
            role="tablist"
            aria-label={t.atlas3d.sectionTitle}
          >
            <button
              type="button"
              role="tab"
              aria-selected={atlas3dScene === 'spine'}
              onClick={() => setAtlas3dScene('spine')}
              className={`inline-flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-xs font-semibold transition-colors whitespace-nowrap lg:flex-initial ${
                atlas3dScene === 'spine'
                  ? 'bg-sky-600 text-white shadow-xs dark:bg-cyan-600'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
              }`}
            >
              <Bone className="h-3.5 w-3.5 shrink-0" />
              <span>{t.atlas3d.sceneSpine}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={atlas3dScene === 'brain'}
              onClick={() => setAtlas3dScene('brain')}
              className={`inline-flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-xs font-semibold transition-colors whitespace-nowrap lg:flex-initial ${
                atlas3dScene === 'brain'
                  ? 'bg-sky-600 text-white shadow-xs dark:bg-cyan-600'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
              }`}
            >
              <Brain className="h-3.5 w-3.5 shrink-0" />
              <span>{t.atlas3d.sceneBrain}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Two-Column Layout: ~30% Left Clinical List + Layers | ~70% Right 3D Viewport */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(280px,31%)_1fr]">
        {/* LEFT COLUMN (~30%) */}
        <aside className="flex flex-col gap-4">
          {/* Layer Toggles Card */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <Layers className="h-3.5 w-3.5 text-sky-600 dark:text-cyan-400" />
              <span>{t.atlas3d.layersTitle}</span>
            </div>

            <div className="mt-3 space-y-2">
              {atlas3dScene === 'spine' ? (
                <>
                  {(
                    [
                      { key: 'vertebrae', label: t.atlas3d.layerVertebrae },
                      { key: 'discs', label: t.atlas3d.layerDiscs },
                      { key: 'muscles', label: t.atlas3d.layerMuscles },
                    ] as const
                  ).map((layer) => {
                    const active = spineLayers[layer.key];
                    return (
                      <button
                        key={layer.key}
                        type="button"
                        onClick={() =>
                          setSpineLayers((prev) => ({ ...prev, [layer.key]: !prev[layer.key] }))
                        }
                        className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-xs font-medium transition-colors ${
                          active
                            ? 'border-sky-200 bg-sky-50/70 text-slate-900 dark:border-cyan-800/70 dark:bg-cyan-950/35 dark:text-slate-100'
                            : 'border-slate-200 bg-slate-50/60 text-slate-500 hover:text-slate-700 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-400'
                        }`}
                      >
                        <span className="truncate">{layer.label}</span>
                        {active ? (
                          <Eye className="h-3.5 w-3.5 shrink-0 text-sky-600 dark:text-cyan-400" />
                        ) : (
                          <EyeOff className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                        )}
                      </button>
                    );
                  })}
                </>
              ) : (
                <>
                  {(
                    [
                      { key: 'hemispheres', label: t.atlas3d.layerHemispheres },
                      { key: 'vessels', label: t.atlas3d.layerVessels },
                      { key: 'markers', label: t.atlas3d.layerMarkers },
                    ] as const
                  ).map((layer) => {
                    const active = brainLayers[layer.key];
                    return (
                      <button
                        key={layer.key}
                        type="button"
                        onClick={() =>
                          setBrainLayers((prev) => ({ ...prev, [layer.key]: !prev[layer.key] }))
                        }
                        className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-xs font-medium transition-colors ${
                          active
                            ? 'border-sky-200 bg-sky-50/70 text-slate-900 dark:border-cyan-800/70 dark:bg-cyan-950/35 dark:text-slate-100'
                            : 'border-slate-200 bg-slate-50/60 text-slate-500 hover:text-slate-700 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-400'
                        }`}
                      >
                        <span className="truncate">{layer.label}</span>
                        {active ? (
                          <Eye className="h-3.5 w-3.5 shrink-0 text-sky-600 dark:text-cyan-400" />
                        ) : (
                          <EyeOff className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                        )}
                      </button>
                    );
                  })}
                </>
              )}
            </div>
          </div>

          {/* Compact Interactive List (16 Spine Segments OR 5 Brain Landmarks) */}
          <div className="flex flex-1 flex-col rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {atlas3dScene === 'spine' ? t.atlas3d.segmentsTitle : t.atlas3d.brainPointsTitle}
              </h2>
              <span className="font-mono text-[11px] text-slate-400 tabular-nums">
                {atlas3dScene === 'spine'
                  ? DETAILED_SPINE_SEGMENTS.length
                  : BRAIN_MRI_LANDMARKS.length}
              </span>
            </div>

            {atlas3dScene === 'spine' ? (
              <div className="max-h-[450px] space-y-1 overflow-y-auto pr-1">
                {DETAILED_SPINE_SEGMENTS.map((seg) => {
                  const isSelected = seg.id === selectedSegment.id;
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
                      className={`flex w-full items-center justify-between gap-2 rounded-lg border px-2.5 py-2 text-left transition-colors ${
                        isSelected
                          ? 'border-sky-300 bg-sky-50 text-slate-900 shadow-2xs dark:border-cyan-600/80 dark:bg-cyan-950/50 dark:text-white'
                          : 'border-transparent hover:border-slate-200 hover:bg-slate-50 dark:hover:border-slate-800 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <span
                          className={`h-2.5 w-2.5 shrink-0 rounded-full ${statusDotClass(seg.status)}`}
                          aria-hidden="true"
                        />
                        <span className="font-mono text-xs font-bold tabular-nums text-slate-900 dark:text-slate-100">
                          {seg.id}
                        </span>
                        <span className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                          {seg.statusLabel[language]}
                        </span>
                      </div>
                      <span className="shrink-0 font-mono text-[11px] font-medium text-slate-600 tabular-nums dark:text-slate-300">
                        {metricText}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-2">
                {BRAIN_MRI_LANDMARKS.map((lm) => {
                  const isSelected = lm.id === selectedBrainLandmark.id;
                  return (
                    <button
                      key={lm.id}
                      type="button"
                      onClick={() => handleSelectBrain(lm.id)}
                      className={`flex w-full items-start gap-2.5 rounded-lg border p-2.5 text-left transition-colors ${
                        isSelected
                          ? 'border-sky-300 bg-sky-50 text-slate-900 shadow-2xs dark:border-cyan-600/80 dark:bg-cyan-950/50 dark:text-white'
                          : 'border-slate-200/70 bg-slate-50/40 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950/40 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <span
                        className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: lm.colorHex }}
                        aria-hidden="true"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold leading-snug text-slate-900 dark:text-slate-100">
                          {lm.shortLabel[language]}
                        </div>
                        <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                          {lm.metricBadge[language]}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Right trapezius alert hint when spine muscles layer is on */}
            {atlas3dScene === 'spine' && spineLayers.muscles && (
              <div className="mt-3 rounded-lg border border-rose-200/80 border-l-4 border-l-rose-500 bg-rose-50/60 px-3 py-2 text-[11px] leading-snug text-rose-900 dark:border-rose-900/60 dark:border-l-rose-500 dark:bg-rose-950/30 dark:text-rose-200">
                {t.atlas3d.trapeziusBadge}
              </div>
            )}
          </div>
        </aside>

        {/* RIGHT COLUMN (~70%): Interactive 3D Viewport + Corner Telemetry Card + Camera Presets */}
        <section className="relative flex min-h-[540px] flex-col overflow-hidden rounded-xl border border-slate-200/90 bg-slate-100 shadow-sm dark:border-slate-800 dark:bg-[#0B1222] lg:h-[670px]">
          {/* Dedicated isolated WebGL canvas host */}
          <div className="relative flex-1">
            <Atlas3DViewport
              sceneMode={atlas3dScene}
              theme={theme}
              selectedSegmentId={selectedSegment.id}
              selectedBrainId={selectedBrainLandmark.id}
              focusTriggerNonce={atlasFocusNonce + localFocusNonce}
              cameraPresetRequest={cameraPresetRequest}
              spineLayers={spineLayers}
              brainLayers={brainLayers}
              onSelectSegment={handleSelectSegment}
              onSelectBrainFinding={handleSelectBrain}
              onModelSourceChange={handleModelSourceChange}
            />

            {/* Top-Left Minimal Model Mode & Anatomical Orientation Tag (solid translucent, zero backdrop-blur) */}
            <div className="pointer-events-none absolute top-3 left-3 z-10 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/90 bg-white/92 px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-xs dark:border-slate-700/90 dark:bg-slate-900/92 dark:text-slate-200">
                <Compass className="h-3.5 w-3.5 text-sky-600 dark:text-cyan-400" />
                {activeModelSource === 'glb'
                  ? t.atlas3d.modelModeGlb
                  : t.atlas3d.modelModeProcedural}
              </span>
              <span className="hidden rounded-lg border border-slate-200/90 bg-white/90 px-2 py-1 font-mono text-[10px] font-semibold text-slate-500 dark:border-slate-700/90 dark:bg-slate-900/90 dark:text-slate-400 sm:inline-block">
                R ← • → L
              </span>
            </div>

            {/* Corner Clinical Detail Overlay Card (semi-transparent solid RGBA, zero backdrop-blur) */}
            <div className="absolute top-3 right-3 z-10 w-[268px] max-w-[calc(100%-24px)] rounded-xl border border-slate-200/95 bg-white/94 p-3.5 shadow-md dark:border-slate-700/95 dark:bg-slate-900/94 sm:w-[292px]">
              {atlas3dScene === 'spine' ? (
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-[11px] font-semibold text-sky-700 dark:text-cyan-400">
                        {t.mri.regionLabels[selectedSegment.region]}
                      </div>
                      <h3 className="font-mono text-base font-extrabold text-slate-900 dark:text-white">
                        {selectedSegment.id}
                      </h3>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap ${statusPillClass(
                        selectedSegment.status,
                      )}`}
                    >
                      {selectedSegment.statusLabel[language]}
                    </span>
                  </div>

                  {/* Concise 2025 -> 2026 numerical comparison */}
                  <div className="grid grid-cols-2 gap-2 rounded-lg border border-slate-200/90 bg-slate-50/90 p-2 dark:border-slate-800 dark:bg-slate-950/70">
                    <div>
                      <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                        {t.atlas3d.cardProtrusion}
                      </div>
                      <div className="mt-0.5 font-mono text-xs font-bold tabular-nums text-slate-900 dark:text-slate-100">
                        {selectedSegment.metrics.protrusion2025 ?? 0} →{' '}
                        <span className="text-rose-600 dark:text-rose-400">
                          {selectedSegment.metrics.protrusion2026 ?? 0} {t.mri.chartMmUnit}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                        {t.atlas3d.cardCanal}
                      </div>
                      <div className="mt-0.5 font-mono text-xs font-bold tabular-nums text-slate-900 dark:text-slate-100">
                        {selectedSegment.metrics.canalSagittal2025 ?? '—'} →{' '}
                        <span className="text-sky-700 dark:text-cyan-400">
                          {selectedSegment.metrics.canalSagittal2026 ?? '—'} {t.mri.chartMmUnit}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="line-clamp-3 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                    {selectedSegment.deltaSummary[language]}
                  </p>

                  <button
                    type="button"
                    onClick={() => jumpToMriSegment(selectedSegment.id)}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-semibold text-sky-700 transition-colors hover:border-sky-300 hover:bg-sky-50 dark:border-slate-700 dark:bg-slate-800 dark:text-cyan-300 dark:hover:border-cyan-600"
                  >
                    <span>{t.atlas3d.cardOpenMri}</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-semibold text-sky-700 dark:text-cyan-400">
                      {selectedBrainLandmark.category[language]}
                    </span>
                    <span
                      className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${brainSeverityPill(
                        selectedBrainLandmark.severity,
                      )}`}
                    >
                      {selectedBrainLandmark.metricBadge[language]}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold leading-snug text-slate-900 dark:text-white">
                    {selectedBrainLandmark.title[language]}
                  </h3>

                  <div className="rounded-lg border border-slate-200/90 bg-slate-50/90 px-2.5 py-1.5 text-[11px] dark:border-slate-800 dark:bg-slate-950/70">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">
                      {t.atlas3d.cardLocation}:{' '}
                    </span>
                    <span className="text-slate-800 dark:text-slate-200">
                      {selectedBrainLandmark.location[language]}
                    </span>
                  </div>

                  <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                    {selectedBrainLandmark.summary[language]}
                  </p>
                </div>
              )}
            </div>

            {/* Bottom-Center Unified Camera Control Dock (Front / Side / Back / Reset) */}
            <div className="absolute right-3 bottom-3 left-3 z-10 flex flex-col items-center gap-1.5 pointer-events-none">
              <div className="pointer-events-auto inline-flex flex-wrap items-center justify-center gap-1 rounded-xl border border-slate-200/95 bg-white/95 p-1 shadow-md dark:border-slate-700/95 dark:bg-slate-900/95">
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
                    className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-950 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
                  >
                    {preset.label}
                  </button>
                ))}
                <div className="mx-0.5 h-4 w-px bg-slate-200 dark:bg-slate-700" aria-hidden="true" />
                <button
                  type="button"
                  onClick={() => triggerCameraPreset('reset')}
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-sky-700 transition-colors hover:bg-sky-50 dark:text-cyan-300 dark:hover:bg-cyan-950/60"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>{t.atlas3d.viewReset}</span>
                </button>
              </div>
              <div className="hidden rounded-md bg-white/85 px-2.5 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-900/85 dark:text-slate-400 sm:block">
                {t.atlas3d.orbitHint}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Attribution Footer */}
      <footer className="flex items-center justify-end px-1 text-[11px] text-slate-400 dark:text-slate-500">
        <span>{t.atlas3d.attribution}</span>
      </footer>
    </div>
  );
};

export default Atlas3DView;
