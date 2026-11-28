import React, { Suspense, lazy, useEffect, useState } from 'react';
import {
  Activity,
  Box,
  FileText,
  Pill,
  FolderGit2,
  Stethoscope,
  UserRound,
  Database,
  Menu,
  X,
  CheckCircle2,
  AlertCircle,
  Info,
  Eye,
  EyeOff,
  Lock,
  Sun,
  Moon,
  Search,
  MoreHorizontal,
} from 'lucide-react';
import { MedicalArchiveProvider, useMedicalArchive } from './context/MedicalArchiveContext';
import { AnamnesisView } from './components/AnamnesisView';
import { MriDynamicsView } from './components/MriDynamicsView';
import { OtherRecordsView } from './components/OtherRecordsView';
import { TreatmentsView } from './components/TreatmentsView';
import { LinksArchiveView } from './components/LinksArchiveView';
import { DoctorView } from './components/DoctorView';
import { JsonArchiveModal } from './components/JsonArchiveModal';
import { PinUnlockModal } from './components/PinUnlockModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { Language, NavSection } from './types/medical';

const Atlas3DView = lazy(() => import('./components/Atlas3DView'));

const NAV_ITEMS: { id: NavSection; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'anamnesis', icon: UserRound },
  { id: 'mri', icon: Activity },
  { id: 'atlas3d', icon: Box },
  { id: 'records', icon: FileText },
  { id: 'treatments', icon: Pill },
  { id: 'archive', icon: FolderGit2 },
  { id: 'doctor', icon: Stethoscope },
];

const AppShell: React.FC = () => {
  const {
    language,
    setLanguage,
    theme,
    toggleTheme,
    privacyMode,
    togglePrivacyMode,
    hasPin,
    t,
    profile,
    activeSection,
    setActiveSection,
    records,
    treatments,
    attachments,
    toast,
  } = useMedicalArchive();

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const [jsonModalOpen, setJsonModalOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Global Ctrl+K / Cmd+K Quick Search shortcut
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, []);

  const handleSelectNav = (section: NavSection) => {
    setActiveSection(section);
    setMobileNavOpen(false);
    setMobileMoreOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'anamnesis':
        return <AnamnesisView />;
      case 'mri':
        return <MriDynamicsView />;
      case 'atlas3d':
        return (
          <Suspense
            fallback={
              <div className="flex min-h-[460px] flex-col items-center justify-center gap-3 rounded-xl border border-slate-200/90 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <Box className="h-8 w-8 text-sky-600 dark:text-cyan-400" />
                <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {t.atlas3d.loadingEngine}
                </div>
              </div>
            }
          >
            <Atlas3DView />
          </Suspense>
        );
      case 'records':
        return <OtherRecordsView />;
      case 'treatments':
        return <TreatmentsView />;
      case 'archive':
        return <LinksArchiveView />;
      case 'doctor':
        return <DoctorView />;
    }
  };

  const getCountHint = (id: NavSection): string | null => {
    if (id === 'mri') return '16';
    if (id === 'atlas3d') return '3D';
    if (id === 'records') return String(records.length);
    if (id === 'treatments') return String(treatments.length);
    if (id === 'archive') return String(attachments.length);
    return null;
  };

  const patientDisplayName =
    (language === 'uk'
      ? profile.full_name_uk
      : language === 'ru'
      ? profile.full_name_ru
      : profile.full_name_en) || t.patientShort;

  return (
    <div className="min-h-screen bg-[#EEF2F7] text-slate-900 transition-colors duration-200 dark:bg-[#0B1120] dark:text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-[1480px]">
        {/* Dark Graphite Desktop Left Sidebar Navigation */}
        <aside className="no-print hidden w-[268px] shrink-0 flex-col justify-between border-r border-slate-800 bg-slate-900 text-slate-100 lg:flex">
          <div className="sticky top-0 flex h-screen flex-col justify-between">
            <div>
              <div className="border-b border-slate-800 px-5 py-4">
                <div className="font-display text-base font-extrabold tracking-tight text-white whitespace-nowrap">
                  {t.appBrand}
                </div>
                <div
                  className={`mt-1 truncate text-xs text-slate-400 transition-all ${
                    privacyMode ? 'blur-[5px] select-none' : ''
                  }`}
                >
                  {patientDisplayName}
                </div>
              </div>

              <nav className="space-y-1 p-3" aria-label="Primary navigation">
                {NAV_ITEMS.map(({ id, icon: Icon }) => {
                  const isActive = activeSection === id;
                  const count = getCountHint(id);
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handleSelectNav(id)}
                      className={`flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors ${
                        isActive
                          ? 'border-cyan-500/35 bg-cyan-500/15 text-cyan-200'
                          : 'border-transparent text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      }`}
                    >
                      <Icon
                        className={`mt-0.5 h-4 w-4 shrink-0 ${
                          isActive ? 'text-cyan-400' : 'text-slate-400'
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-semibold">{t.nav[id]}</span>
                          {count !== null && (
                            <span
                              className={`font-mono text-[11px] tabular-nums ${
                                isActive ? 'text-cyan-300' : 'text-slate-500'
                              }`}
                            >
                              {count}
                            </span>
                          )}
                        </div>
                        <div
                          className={`mt-0.5 truncate text-[11px] ${
                            isActive ? 'text-cyan-200/75' : 'text-slate-400'
                          }`}
                        >
                          {t.navSub[id]}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Sidebar bottom JSON Export / Import utility */}
            <div className="border-t border-slate-800 p-3">
              <button
                type="button"
                onClick={() => setJsonModalOpen(true)}
                className="flex w-full items-center justify-between rounded-lg border border-slate-700/90 bg-slate-800/80 px-3 py-2.5 text-xs font-semibold text-slate-200 transition-colors hover:border-cyan-500/40 hover:bg-slate-800 hover:text-white"
              >
                <span className="inline-flex items-center gap-2 whitespace-nowrap">
                  <Database className="h-3.5 w-3.5 text-cyan-400" />
                  {t.actions.jsonArchive}
                </span>
                <span className="font-mono text-[10px] text-slate-400">.json</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Dark Graphite Mobile Navigation Drawer */}
        {mobileNavOpen && (
          <div className="no-print fixed inset-0 z-40 flex lg:hidden">
            <div
              className="fixed inset-0 bg-slate-950/60"
              onClick={() => setMobileNavOpen(false)}
              aria-hidden="true"
            />
            <div className="relative z-50 flex w-72 max-w-[82vw] flex-col justify-between border-r border-slate-800 bg-slate-900 text-slate-100 shadow-xl">
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3.5">
                  <div className="min-w-0">
                    <div className="font-display text-sm font-extrabold text-white">
                      {t.appBrand}
                    </div>
                    <div
                      className={`truncate text-xs text-slate-400 ${
                        privacyMode ? 'blur-[5px] select-none' : ''
                      }`}
                    >
                      {patientDisplayName}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileNavOpen(false)}
                    aria-label={t.actions.close}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <nav className="space-y-1 p-3">
                  {NAV_ITEMS.map(({ id, icon: Icon }) => {
                    const isActive = activeSection === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => handleSelectNav(id)}
                        className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm font-semibold transition-colors ${
                          isActive
                            ? 'border-cyan-500/35 bg-cyan-500/15 text-cyan-200'
                            : 'border-transparent text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <Icon
                          className={`h-4 w-4 shrink-0 ${
                            isActive ? 'text-cyan-400' : 'text-slate-400'
                          }`}
                        />
                        <span>{t.nav[id]}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="border-t border-slate-800 p-3">
                <button
                  type="button"
                  onClick={() => {
                    setMobileNavOpen(false);
                    setJsonModalOpen(true);
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-xs font-semibold text-slate-200"
                >
                  <Database className="h-3.5 w-3.5 text-cyan-400" />
                  {t.actions.jsonArchive}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Viewport */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Clean Single-Row Top Bar with Search (Ctrl+K), Privacy Toggle, Theme Toggle, Language Switcher, and Doctor Mode CTA */}
          <header className="no-print sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-slate-200/90 bg-white/95 px-3.5 py-2.5 backdrop-blur-xs dark:border-slate-800 dark:bg-slate-900/95 sm:gap-3 sm:px-6 sm:py-3">
            <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
              {/* Tablet-only sidebar menu button (smartphones <768px use the bottom navigation bar) */}
              <button
                type="button"
                onClick={() => setMobileNavOpen(true)}
                aria-label="Open menu"
                className="hidden rounded-lg border border-slate-200 p-1.5 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 md:inline-flex lg:hidden"
              >
                <Menu className="h-4 w-4" />
              </button>
              <div className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                {t.nav[activeSection]}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
              {/* Global Quick Search Button (Ctrl+K) */}
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                title={`${t.globalSearch.buttonLabel} (Ctrl+K)`}
                aria-label={`${t.globalSearch.buttonLabel} (Ctrl+K)`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50/90 px-2 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-white hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-white sm:px-2.5 whitespace-nowrap"
              >
                <Search className="h-3.5 w-3.5 shrink-0 text-slate-500 dark:text-slate-400" />
                <span className="hidden lg:inline">{t.globalSearch.buttonLabel}</span>
                <kbd className="hidden rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-400 sm:inline-block">
                  Ctrl+K
                </kbd>
              </button>

              {/* Privacy Mode Quick Toggle */}
              <button
                type="button"
                onClick={togglePrivacyMode}
                title={
                  privacyMode
                    ? hasPin
                      ? t.privacyVault.privacyLockedHint
                      : t.actions.privacyActive
                    : t.actions.privacyMode
                }
                aria-pressed={privacyMode}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                  privacyMode
                    ? 'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-white'
                }`}
              >
                {privacyMode ? (
                  hasPin ? (
                    <Lock className="h-3.5 w-3.5 shrink-0" />
                  ) : (
                    <EyeOff className="h-3.5 w-3.5 shrink-0" />
                  )
                ) : (
                  <Eye className="h-3.5 w-3.5 shrink-0" />
                )}
                <span className="hidden xl:inline">{t.actions.privacyMode}</span>
              </button>

              {/* Light / Dark Theme Toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                title={theme === 'dark' ? t.actions.themeLight : t.actions.themeDark}
                aria-label={theme === 'dark' ? t.actions.themeLight : t.actions.themeDark}
                className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-white"
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4 text-amber-400" />
                ) : (
                  <Moon className="h-4 w-4 text-slate-600" />
                )}
              </button>

              {/* Trilingual Switcher UA | RU | EN */}
              <div
                className="inline-flex rounded-lg bg-slate-100 p-0.5 dark:bg-slate-800"
                role="group"
                aria-label="Language"
              >
                {(['uk', 'ru', 'en'] as Language[]).map((lng) => (
                  <button
                    key={lng}
                    type="button"
                    onClick={() => setLanguage(lng)}
                    className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors whitespace-nowrap ${
                      language === lng
                        ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    {lng === 'uk' ? 'UA' : lng.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Primary Action: Doctor View / Print PDF */}
              {activeSection !== 'doctor' && (
                <button
                  type="button"
                  onClick={() => handleSelectNav('doctor')}
                  className="hidden items-center gap-1.5 rounded-lg bg-sky-600 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-sky-700 whitespace-nowrap md:inline-flex"
                >
                  <Stethoscope className="h-3.5 w-3.5" />
                  {t.actions.doctorMode}
                </button>
              )}
            </div>
          </header>

          {/* Active Section Content (bottom padding on mobile <768px clears fixed Bottom Nav Bar) */}
          <main
            className={
              activeSection === 'atlas3d'
                ? 'flex-1 px-3 pt-3 pb-20 sm:px-4 md:pb-3 print:p-0'
                : 'flex-1 px-4 pt-5 pb-22 sm:px-6 md:py-6 lg:px-8 print:p-0'
            }
          >
            {renderSection()}
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar (<768px, PWA one-handed thumb navigation) */}
      <nav
        aria-label="Mobile navigation"
        className="no-print pb-safe fixed right-0 bottom-0 left-0 z-40 border-t border-slate-200/90 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 md:hidden"
      >
        <div className="grid h-15 grid-cols-6 items-stretch">
          {(
            [
              { id: 'anamnesis' as NavSection, label: t.mobileNav.profile, icon: UserRound },
              { id: 'mri' as NavSection, label: t.mobileNav.mri, icon: Activity },
              { id: 'atlas3d' as NavSection, label: t.mobileNav.atlas, icon: Box },
              { id: 'records' as NavSection, label: t.mobileNav.records, icon: FileText },
              { id: 'archive' as NavSection, label: t.mobileNav.archive, icon: FolderGit2 },
            ] as const
          ).map(({ id, label, icon: Icon }) => {
            const isActive = activeSection === id && !mobileMoreOpen;
            return (
              <button
                key={id}
                type="button"
                onClick={() => handleSelectNav(id)}
                className={`flex min-h-[48px] flex-col items-center justify-center gap-0.5 px-1 transition-colors ${
                  isActive
                    ? 'text-sky-600 dark:text-cyan-400'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'stroke-[2.3]' : 'stroke-[1.9]'}`} />
                <span className="max-w-full truncate text-[10px] font-semibold tracking-tight">
                  {label}
                </span>
              </button>
            );
          })}

          {/* 6th Tab: More / Treatments / Doctor Mode Bottom Sheet */}
          {(() => {
            const isMoreActive =
              mobileMoreOpen || activeSection === 'treatments' || activeSection === 'doctor';
            return (
              <button
                type="button"
                onClick={() => setMobileMoreOpen((v) => !v)}
                aria-expanded={mobileMoreOpen}
                className={`flex min-h-[48px] flex-col items-center justify-center gap-0.5 px-1 transition-colors ${
                  isMoreActive
                    ? 'text-sky-600 dark:text-cyan-400'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <MoreHorizontal className="h-5 w-5 stroke-[2.2]" />
                <span className="max-w-full truncate text-[10px] font-semibold tracking-tight">
                  {t.mobileNav.more}
                </span>
              </button>
            );
          })()}
        </div>
      </nav>

      {/* Mobile Bottom Sheet Drawer (<768px) for Treatments, Doctor Mode, Quick Search & JSON Archive */}
      {mobileMoreOpen && (
        <div
          className="no-print fixed inset-0 z-50 flex items-end bg-slate-950/55 backdrop-blur-[2px] md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label={t.mobileNav.drawerTitle}
          onClick={(e) => {
            if (e.target === e.currentTarget) setMobileMoreOpen(false);
          }}
        >
          <div className="pb-safe w-full rounded-t-2xl border-t border-slate-200 bg-white px-4 pt-3 pb-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-slate-300 dark:bg-slate-700" />
            <div className="mb-3 flex items-center justify-between px-1">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {t.mobileNav.drawerTitle}
              </div>
              <button
                type="button"
                onClick={() => setMobileMoreOpen(false)}
                aria-label={t.actions.close}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => handleSelectNav('treatments')}
                className={`flex min-h-[48px] w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-left transition-colors ${
                  activeSection === 'treatments'
                    ? 'border-sky-300 bg-sky-50 text-sky-900 dark:border-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-200'
                    : 'border-slate-200/80 bg-slate-50/70 text-slate-800 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-100'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Pill className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
                  <span>
                    <span className="block text-sm font-semibold">{t.nav.treatments}</span>
                    <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                      {t.navSub.treatments}
                    </span>
                  </span>
                </span>
                <span className="font-mono text-xs text-slate-500 tabular-nums">
                  {treatments.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectNav('doctor')}
                className={`flex min-h-[48px] w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-colors ${
                  activeSection === 'doctor'
                    ? 'border-sky-300 bg-sky-50 text-sky-900 dark:border-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-200'
                    : 'border-sky-200 bg-sky-50/50 text-sky-900 dark:border-sky-900/70 dark:bg-sky-950/30 dark:text-sky-200'
                }`}
              >
                <Stethoscope className="h-4.5 w-4.5 text-sky-600 dark:text-cyan-400" />
                <span>
                  <span className="block text-sm font-semibold">{t.actions.doctorMode}</span>
                  <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                    {t.navSub.doctor}
                  </span>
                </span>
              </button>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMoreOpen(false);
                    setSearchOpen(true);
                  }}
                  className="flex min-h-[46px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <Search className="h-4 w-4 text-sky-600 dark:text-cyan-400" />
                  <span>{t.mobileNav.quickSearch}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMoreOpen(false);
                    setJsonModalOpen(true);
                  }}
                  className="flex min-h-[46px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <Database className="h-4 w-4 text-sky-600 dark:text-cyan-400" />
                  <span>{t.actions.jsonArchive}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Quick Search Modal (Ctrl+K) */}
      <GlobalSearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* JSON Import/Export/Reset Modal */}
      <JsonArchiveModal open={jsonModalOpen} onClose={() => setJsonModalOpen(false)} />

      {/* PIN Unlock Modal for Privacy Mode & Personal Vault */}
      <PinUnlockModal />

      {/* Transient Toast Notification */}
      {toast && (
        <div
          role="status"
          className="no-print fixed right-4 bottom-20 z-50 flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-xs font-medium text-white shadow-lg md:bottom-4"
        >
          {toast.tone === 'success' ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          ) : toast.tone === 'error' ? (
            <AlertCircle className="h-4 w-4 text-rose-400" />
          ) : (
            <Info className="h-4 w-4 text-cyan-400" />
          )}
          <span>{toast.text}</span>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <MedicalArchiveProvider>
      <AppShell />
    </MedicalArchiveProvider>
  );
}
