import React, { useCallback, useEffect, useRef, useState } from 'react';
import { PerspectiveCamera, Vector3 } from 'three';
import {
  createAtlasViewer,
  type AtlasViewer,
  type StandardView,
} from '@authorod/svitylo-3d-anatomy-atlas/core';
import type { Lang, ViewState } from '@authorod/svitylo-3d-anatomy-atlas/schema';
import { AtlasCameraPreset, AtlasSceneMode, Language } from '../types/medical';
import {
  BODY_SILHOUETTE_IDS,
  BRAIN_CORE_IDS,
  BRAIN_FINDING_SVITYLO_MAP,
  BRAIN_VESSEL_IDS,
  HEAD_SILHOUETTE_IDS,
  SPINE_CORE_IDS,
  SPINE_MUSCLE_IDS,
  SPINE_SEGMENT_SVITYLO_MAP,
  SVITYLO_DATA_URL,
  resolveClickedStructureToAppId,
} from '../data/svityloAtlasMap';

export interface SvityloLayerState {
  silhouette: boolean;
  muscles: boolean;
  vessels: boolean;
}

interface SvityloAtlasViewportProps {
  sceneMode: AtlasSceneMode;
  language: Language;
  focusedSegmentId: string | null;
  focusedBrainId: string | null;
  focusTriggerNonce: number;
  cameraPresetRequest: { preset: AtlasCameraPreset; nonce: number } | null;
  layers: SvityloLayerState;
  onSelectSegmentFrom3D: (segmentId: string) => void;
  onSelectBrainFrom3D: (findingId: string) => void;
  loadingLabel: string;
}

function toSvityloLang(language: Language): Lang {
  if (language === 'uk') return 'uk';
  return 'en';
}

interface CameraSnapshotLike {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

interface InternalRigHolder {
  renderer?: {
    rig?: {
      camera?: PerspectiveCamera;
    };
  };
}

/**
 * Exact 3D anatomical groin/perineum core bounds in Svitylo adult-male world meters
 * (up: +Y, front: +Z, origin: floor-between-heels).
 * Covers urogenital + anal + lower pubic regions while staying strictly below sacrum (Y >= 0.866)
 * and lumbar spine L4-L5 / L5-S1 (Y >= 0.958).
 */
const PRIVACY_ZONE_CENTER = new Vector3(0, 0.785, 0.0925);
const PRIVACY_ZONE_CORNERS: readonly Vector3[] = [
  new Vector3(-0.058, 0.722, 0.015),
  new Vector3(0.058, 0.722, 0.015),
  new Vector3(-0.058, 0.848, 0.015),
  new Vector3(0.058, 0.848, 0.015),
  new Vector3(-0.058, 0.722, 0.17),
  new Vector3(0.058, 0.722, 0.17),
  new Vector3(-0.058, 0.848, 0.17),
  new Vector3(0.058, 0.848, 0.17),
];

// Reusable module-scope math objects (zero allocations in projection frames)
const _projVec = new Vector3();
const _fallbackCamera = new PerspectiveCamera(45, 1, 0.01, 50);

function isIntimateRegionId(id: string): boolean {
  return (
    id.includes('perineum') ||
    id.includes('urogenital') ||
    id.includes('anal_region') ||
    id.includes('pubic_hairs')
  );
}

export const SvityloAtlasViewport: React.FC<SvityloAtlasViewportProps> = ({
  sceneMode,
  language,
  focusedSegmentId,
  focusedBrainId,
  focusTriggerNonce,
  cameraPresetRequest,
  layers,
  onSelectSegmentFrom3D,
  onSelectBrainFrom3D,
  loadingLabel,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const privacyMaskRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<AtlasViewer | null>(null);
  const mountedRef = useRef<boolean>(true);
  const sceneModeRef = useRef<AtlasSceneMode>(sceneMode);
  const layersRef = useRef<SvityloLayerState>(layers);
  const languageRef = useRef<Language>(language);
  const onSelectSegmentRef = useRef(onSelectSegmentFrom3D);
  const onSelectBrainRef = useRef(onSelectBrainFrom3D);
  const appliedStateKeyRef = useRef<string>('');
  const lastCameraSnapRef = useRef<CameraSnapshotLike | null>(null);
  const maskRafRef = useRef<number>(0);
  const maskTrackUntilRef = useRef<number>(0);
  const lastMaskSignatureRef = useRef<string>('');

  const [viewerReady, setViewerReady] = useState(false);
  const [isLoadingChunks, setIsLoadingChunks] = useState(true);
  const [loadPercent, setLoadPercent] = useState<number>(0);
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  sceneModeRef.current = sceneMode;
  layersRef.current = layers;
  languageRef.current = language;
  onSelectSegmentRef.current = onSelectSegmentFrom3D;
  onSelectBrainRef.current = onSelectBrainFrom3D;

  const updatePrivacyMaskPosition = useCallback(() => {
    const maskEl = privacyMaskRef.current;
    const container = containerRef.current;
    const viewer = viewerRef.current;
    if (!maskEl || !container) return;

    const shouldShow =
      Boolean(viewer) &&
      !viewer?.isDisposed &&
      sceneModeRef.current === 'spine' &&
      layersRef.current.silhouette;

    if (!shouldShow || !viewer) {
      if (lastMaskSignatureRef.current !== 'hidden') {
        lastMaskSignatureRef.current = 'hidden';
        maskEl.style.opacity = '0';
        maskEl.style.visibility = 'hidden';
      }
      return;
    }

    const width = container.clientWidth;
    const height = container.clientHeight;
    if (width <= 0 || height <= 0) return;

    // Prefer live Three.js camera (read-only) for 60fps zero-lag projection;
    // gracefully fall back to the public camera snapshot event if internal structure changes.
    let activeCamera: PerspectiveCamera | null =
      (viewer as unknown as InternalRigHolder).renderer?.rig?.camera ?? null;

    if (!activeCamera) {
      const snap = lastCameraSnapRef.current;
      if (!snap) return;
      _fallbackCamera.fov = snap.fov;
      _fallbackCamera.aspect = width / height;
      _fallbackCamera.position.set(snap.position[0], snap.position[1], snap.position[2]);
      _fallbackCamera.lookAt(snap.target[0], snap.target[1], snap.target[2]);
      _fallbackCamera.updateMatrixWorld(true);
      _fallbackCamera.updateProjectionMatrix();
      activeCamera = _fallbackCamera;
    }

    // Ensure the groin center is in front of the camera near plane
    _projVec.copy(PRIVACY_ZONE_CENTER).applyMatrix4(activeCamera.matrixWorldInverse);
    if (_projVec.z >= -0.05) {
      if (lastMaskSignatureRef.current !== 'hidden') {
        lastMaskSignatureRef.current = 'hidden';
        maskEl.style.opacity = '0';
        maskEl.style.visibility = 'hidden';
      }
      return;
    }

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    let validCorners = 0;

    for (let i = 0; i < PRIVACY_ZONE_CORNERS.length; i++) {
      _projVec.copy(PRIVACY_ZONE_CORNERS[i]).applyMatrix4(activeCamera.matrixWorldInverse);
      if (_projVec.z >= -0.02) continue;
      _projVec.applyMatrix4(activeCamera.projectionMatrix);
      const px = (_projVec.x * 0.5 + 0.5) * width;
      const py = (-_projVec.y * 0.5 + 0.5) * height;
      if (px < minX) minX = px;
      if (px > maxX) maxX = px;
      if (py < minY) minY = py;
      if (py > maxY) maxY = py;
      validCorners++;
    }

    if (
      validCorners === 0 ||
      maxX < -40 ||
      minX > width + 40 ||
      maxY < -40 ||
      minY > height + 40
    ) {
      if (lastMaskSignatureRef.current !== 'hidden') {
        lastMaskSignatureRef.current = 'hidden';
        maskEl.style.opacity = '0';
        maskEl.style.visibility = 'hidden';
      }
      return;
    }

    const coreW = maxX - minX;
    const coreH = maxY - minY;
    if (coreW < 6 && coreH < 6) {
      if (lastMaskSignatureRef.current !== 'hidden') {
        lastMaskSignatureRef.current = 'hidden';
        maskEl.style.opacity = '0';
        maskEl.style.visibility = 'hidden';
      }
      return;
    }

    // Expand slightly for soft radial edge feathering while keeping the inner blur core exact
    const maskW = Math.min(width * 0.68, Math.max(coreW * 1.46, 38));
    const maskH = Math.min(height * 0.68, Math.max(coreH * 1.46, 34));
    const left = (minX + maxX) * 0.5 - maskW * 0.5;
    const top = (minY + maxY) * 0.5 - maskH * 0.5;
    const blurPx = Math.round(Math.min(20, Math.max(10, Math.min(maskW, maskH) * 0.14)));

    const signature = `${left.toFixed(1)}|${top.toFixed(1)}|${maskW.toFixed(1)}|${maskH.toFixed(1)}|${blurPx}`;
    if (lastMaskSignatureRef.current === signature) return;
    lastMaskSignatureRef.current = signature;

    maskEl.style.visibility = 'visible';
    maskEl.style.opacity = '1';
    maskEl.style.width = `${maskW.toFixed(1)}px`;
    maskEl.style.height = `${maskH.toFixed(1)}px`;
    maskEl.style.transform = `translate3d(${left.toFixed(1)}px, ${top.toFixed(1)}px, 0)`;
    maskEl.style.backdropFilter = `blur(${blurPx}px)`;
    (
      maskEl.style as CSSStyleDeclaration & { webkitBackdropFilter?: string }
    ).webkitBackdropFilter = `blur(${blurPx}px)`;
  }, []);

  const scheduleMaskTrack = useCallback(
    (durationMs = 700) => {
      const targetTime = performance.now() + durationMs;
      if (targetTime > maskTrackUntilRef.current) {
        maskTrackUntilRef.current = targetTime;
      }
      if (maskRafRef.current) return;

      const tick = () => {
        if (!mountedRef.current) {
          maskRafRef.current = 0;
          return;
        }
        updatePrivacyMaskPosition();
        if (performance.now() < maskTrackUntilRef.current) {
          maskRafRef.current = window.requestAnimationFrame(tick);
        } else {
          maskRafRef.current = 0;
        }
      };

      maskRafRef.current = window.requestAnimationFrame(tick);
    },
    [updatePrivacyMaskPosition],
  );

  // 1. Initialize headless Svitylo AtlasViewer once when the 3D tab mounts
  useEffect(() => {
    mountedRef.current = true;
    const container = containerRef.current;
    if (!container) return;

    const controller = new AbortController();
    let localViewer: AtlasViewer | null = null;
    const unsubs: (() => void)[] = [];

    setErrorMessage(null);
    setViewerReady(false);
    setIsLoadingChunks(true);

    createAtlasViewer({
      container,
      dataUrl: SVITYLO_DATA_URL,
      lang: toSvityloLang(languageRef.current),
      quality: 'standard',
      background: '#0d1424',
      colors: {
        highlight: '#38bdf8',
        hover: '#93c5fd',
        ghostTint: '#cbd5e1',
      },
      keyboard: true,
      signal: controller.signal,
    })
      .then((viewer) => {
        if (!mountedRef.current || controller.signal.aborted) {
          viewer.dispose();
          return;
        }
        localViewer = viewer;
        viewerRef.current = viewer;

        unsubs.push(
          viewer.on('progress', (p) => {
            if (!mountedRef.current) return;
            if (p.phase === 'loading') {
              setIsLoadingChunks(true);
              const pct =
                p.totalBytes > 0
                  ? Math.min(99, Math.round((p.loadedBytes / p.totalBytes) * 100))
                  : p.totalFiles > 0
                  ? Math.min(99, Math.round((p.loadedFiles / p.totalFiles) * 100))
                  : 0;
              setLoadPercent(pct);
            } else {
              setIsLoadingChunks(false);
              setLoadPercent(100);
            }
          }),
        );

        unsubs.push(
          viewer.on('hover', ({ id }) => {
            if (!mountedRef.current) return;
            if (!id || isIntimateRegionId(id)) {
              setHoveredLabel(null);
              return;
            }
            const svLang = toSvityloLang(languageRef.current);
            const label = viewer.catalog.names.label(id, svLang);
            setHoveredLabel(label);
          }),
        );

        unsubs.push(
          viewer.on('camera', (cam) => {
            if (!mountedRef.current) return;
            lastCameraSnapRef.current = {
              position: cam.position,
              target: cam.target,
              fov: cam.fov,
            };
            scheduleMaskTrack(650);
          }),
        );

        unsubs.push(
          viewer.on('select', ({ primary, source }) => {
            if (!mountedRef.current || source !== 'pointer' || !primary) return;
            const mapped = resolveClickedStructureToAppId(sceneModeRef.current, primary);
            if (!mapped) return;
            if (sceneModeRef.current === 'spine') {
              onSelectSegmentRef.current(mapped);
            } else {
              onSelectBrainRef.current(mapped);
            }
          }),
        );

        unsubs.push(
          viewer.on('error', (err) => {
            if (!mountedRef.current) return;
            if (err.code === 'MANIFEST_UNAVAILABLE' || err.code === 'WEBGL2_UNAVAILABLE') {
              setErrorMessage(err.message);
            }
          }),
        );

        setViewerReady(true);
        scheduleMaskTrack(1200);
      })
      .catch((err) => {
        if (!mountedRef.current || controller.signal.aborted) return;
        setIsLoadingChunks(false);
        setErrorMessage(err instanceof Error ? err.message : 'Unable to initialize 3D Atlas');
      });

    return () => {
      mountedRef.current = false;
      controller.abort();
      if (maskRafRef.current) {
        window.cancelAnimationFrame(maskRafRef.current);
        maskRafRef.current = 0;
      }
      for (const unsub of unsubs) unsub();
      if (localViewer && !localViewer.isDisposed) {
        localViewer.dispose();
      }
      viewerRef.current = null;
      appliedStateKeyRef.current = '';
      lastMaskSignatureRef.current = '';
    };
  }, [scheduleMaskTrack]);

  // 1b. Keep pelvic privacy blur synced at 60fps during pointer orbit/zoom/touch & container resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let pointerDragging = false;
    const onPointerDown = () => {
      pointerDragging = true;
      scheduleMaskTrack(800);
    };
    const onPointerMove = () => {
      if (pointerDragging) {
        scheduleMaskTrack(700);
      }
    };
    const onPointerUp = () => {
      if (pointerDragging) {
        pointerDragging = false;
        scheduleMaskTrack(900);
      }
    };
    const onWheel = () => scheduleMaskTrack(850);
    const onTouchMove = () => scheduleMaskTrack(800);
    const onKeyDown = () => scheduleMaskTrack(700);

    container.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });
    container.addEventListener('wheel', onWheel, { passive: true });
    container.addEventListener('touchmove', onTouchMove, { passive: true });
    container.addEventListener('keydown', onKeyDown, { passive: true });

    const resizeObserver = new ResizeObserver(() => {
      scheduleMaskTrack(300);
    });
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('keydown', onKeyDown);
      resizeObserver.disconnect();
    };
  }, [scheduleMaskTrack]);

  // 2. Sync dictionary language on live switcher change
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDisposed) return;
    viewer.setLang(toSvityloLang(language));
  }, [language]);

  // 2b. Immediately hide/show privacy mask when switching scene or toggling silhouette visibility
  useEffect(() => {
    updatePrivacyMaskPosition();
    if (viewerReady && sceneMode === 'spine' && layers.silhouette) {
      scheduleMaskTrack(500);
    }
  }, [viewerReady, sceneMode, layers.silhouette, updatePrivacyMaskPosition, scheduleMaskTrack]);

  // 3. Apply scene composition (Spine inside translucent body silhouette OR Brain & Vessels)
  //    and smoothly highlight + focus selected vertebrae or brain structure
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewerReady || !viewer || viewer.isDisposed) return;

    const manifest = viewer.catalog.manifest;
    const isSpine = sceneMode === 'spine';

    const sceneIds: string[] = isSpine
      ? [
          ...(layers.silhouette ? BODY_SILHOUETTE_IDS : []),
          ...SPINE_CORE_IDS,
          ...(layers.muscles ? SPINE_MUSCLE_IDS : []),
        ]
      : [
          ...(layers.silhouette ? HEAD_SILHOUETTE_IDS : []),
          ...BRAIN_CORE_IDS,
          ...(layers.vessels ? BRAIN_VESSEL_IDS : []),
        ];

    const selectedIds: string[] = isSpine
      ? focusedSegmentId && SPINE_SEGMENT_SVITYLO_MAP[focusedSegmentId]
        ? SPINE_SEGMENT_SVITYLO_MAP[focusedSegmentId]
        : SPINE_CORE_IDS
      : focusedBrainId && BRAIN_FINDING_SVITYLO_MAP[focusedBrainId]
      ? BRAIN_FINDING_SVITYLO_MAP[focusedBrainId]
      : [...BRAIN_CORE_IDS, ...(layers.vessels ? BRAIN_VESSEL_IDS : [])];

    // Transparency keeps the body/head silhouette and surrounding anatomy translucent
    // while highlighting the active spine or selected vertebrae/brain structure opaque.
    const hasSpecificFocus = isSpine ? Boolean(focusedSegmentId) : Boolean(focusedBrainId);
    const transparency = layers.silhouette || hasSpecificFocus ? (hasSpecificFocus ? 0.8 : 0.78) : 0;

    const stateKey = `${sceneMode}|${layers.silhouette}|${layers.muscles}|${layers.vessels}|${focusedSegmentId ?? 'overview'}|${focusedBrainId ?? 'overview'}|${focusTriggerNonce}`;
    if (appliedStateKeyRef.current === stateKey) return;
    const prevKey = appliedStateKeyRef.current;
    appliedStateKeyRef.current = stateKey;

    const prevScenePrefix = prevKey.split('|')[0];
    const isSceneSwitchOrInitial = prevKey === '' || prevScenePrefix !== sceneMode;

    const viewState: ViewState = {
      v: 2,
      data: {
        model: manifest.model,
        version: manifest.version,
      },
      scene: sceneIds,
      selected: selectedIds,
      ...(transparency > 0 ? { surroundings: { transparency } } : {}),
    };

    let cancelled = false;
    setIsLoadingChunks(true);

    viewer
      .setState(viewState, { source: 'api', animate: !isSceneSwitchOrInitial })
      .then((res) => {
        if (cancelled || !mountedRef.current || viewer.isDisposed || res.status === 'superseded') {
          return;
        }
        setIsLoadingChunks(false);

        if (isSpine) {
          if (focusedSegmentId && SPINE_SEGMENT_SVITYLO_MAP[focusedSegmentId]) {
            const targetIds = SPINE_SEGMENT_SVITYLO_MAP[focusedSegmentId];
            if (isSceneSwitchOrInitial) {
              viewer.setView('posterior', { animate: false });
              viewer.orbit(0.42, -0.05);
            }
            viewer.focus(targetIds, {
              animate: !isSceneSwitchOrInitial,
              padding: 2.35,
            });
          } else {
            // Initial / Reset overview: crisp 3/4 posterior-lateral framing of the whole spine inside translucent body silhouette
            viewer.setView('posterior', { animate: !isSceneSwitchOrInitial });
            viewer.orbit(0.46, -0.06);
            viewer.focus(['skeletal.vertebral_column'], {
              animate: !isSceneSwitchOrInitial,
              padding: 1.38,
            });
          }
        } else {
          if (focusedBrainId && BRAIN_FINDING_SVITYLO_MAP[focusedBrainId]) {
            const targetIds = BRAIN_FINDING_SVITYLO_MAP[focusedBrainId];
            if (isSceneSwitchOrInitial) {
              viewer.setView('anterior', { animate: false });
              viewer.orbit(0.45, 0.08);
            }
            viewer.focus(targetIds, {
              animate: !isSceneSwitchOrInitial,
              padding: 2.5,
            });
          } else {
            viewer.setView('anterior', { animate: !isSceneSwitchOrInitial });
            viewer.orbit(0.5, 0.08);
            viewer.focus(['nervous.brain'], {
              animate: !isSceneSwitchOrInitial,
              padding: 1.48,
            });
          }
        }
        scheduleMaskTrack(1400);
      })
      .catch(() => {
        if (!cancelled && mountedRef.current) {
          setIsLoadingChunks(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    viewerReady,
    sceneMode,
    focusedSegmentId,
    focusedBrainId,
    focusTriggerNonce,
    layers.silhouette,
    layers.muscles,
    layers.vessels,
    scheduleMaskTrack,
  ]);

  // 4. Camera preset buttons (Front / Side / Back / Reset)
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewerReady || !viewer || viewer.isDisposed || !cameraPresetRequest) return;

    const { preset } = cameraPresetRequest;
    if (preset === 'reset') {
      if (sceneMode === 'spine') {
        viewer.setView('posterior', { animate: true });
        viewer.orbit(0.46, -0.06);
        viewer.focus(['skeletal.vertebral_column'], { animate: true, padding: 1.38 });
      } else {
        viewer.setView('anterior', { animate: true });
        viewer.orbit(0.5, 0.08);
        viewer.focus(['nervous.brain'], { animate: true, padding: 1.48 });
      }
      scheduleMaskTrack(1400);
      return;
    }

    const viewMap: Record<'front' | 'side' | 'back', StandardView> = {
      front: 'anterior',
      side: 'right',
      back: 'posterior',
    };
    viewer.setView(viewMap[preset], { animate: true });
    scheduleMaskTrack(1400);
  }, [cameraPresetRequest, sceneMode, viewerReady, scheduleMaskTrack]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#0d1424]">
      {/* Dedicated Svitylo WebGL2 canvas host */}
      <div
        ref={containerRef}
        className="h-full w-full cursor-grab active:cursor-grabbing [&>canvas]:block [&>canvas]:h-full [&>canvas]:w-full"
      />

      {/* 3D-tracked delicate feathered blur mask over pelvic/groin silhouette zone */}
      <div
        ref={privacyMaskRef}
        aria-hidden="true"
        className="atlas-privacy-blur pointer-events-none absolute top-0 left-0 z-[4] rounded-full opacity-0 transition-opacity duration-150 will-change-transform"
      />

      {/* Non-blocking loading badge while streaming meshopt anatomy chunks */}
      {(isLoadingChunks || !viewerReady) && !errorMessage && (
        <div className="pointer-events-none absolute top-1/2 left-1/2 z-20 -translate-x-1/2 -translate-y-1/2 rounded-xl border border-slate-700/90 bg-slate-900/95 px-4 py-2.5 text-xs font-semibold text-slate-100 shadow-lg">
          <div className="flex items-center gap-2.5">
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
            <span>
              {loadingLabel}
              {loadPercent > 0 && loadPercent < 100 ? ` ${loadPercent}%` : ''}
            </span>
          </div>
        </div>
      )}

      {/* WebGL2 / Data error state */}
      {errorMessage && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/90 p-6 text-center">
          <div className="max-w-sm rounded-xl border border-rose-800/70 bg-slate-900 p-4 text-xs text-rose-200 shadow-lg">
            {errorMessage}
          </div>
        </div>
      )}

      {/* Subtle bottom-left live hovered anatomical structure name (solid surface, zero backdrop-blur) */}
      {hoveredLabel && (
        <div className="pointer-events-none absolute bottom-14 left-3 z-10 max-w-[260px] truncate rounded-lg border border-slate-700/90 bg-slate-900/92 px-2.5 py-1 text-[11px] font-medium text-slate-100 shadow-md sm:bottom-3">
          {hoveredLabel}
        </div>
      )}
    </div>
  );
};
