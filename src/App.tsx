import React, { Suspense, lazy, useState } from 'react';
import {
  Activity,
  Box,
  FileText,
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
  Sun,
  Moon,
} from 'lucide-react';
import { MedicalArchiveProvider, useMedicalArchive } from './context/MedicalArchiveContext';
import { AnamnesisView } from './components/AnamnesisView';
import { MriDynamicsView } from './components/MriDynamicsView';
import { OtherRecordsView } from './components/OtherRecordsView';
import { LinksArchiveView } from './components/LinksArchiveView';
import { DoctorView } from './components/DoctorView';
import { JsonArchiveModal } from './components/JsonArchiveModal';
import { Language, NavSection } from './types/medical';

const Atlas3DView = lazy(() => import('./components/Atlas3DView'));

const NAV_ITEMS: { id: NavSection; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'anamnesis', icon: UserRound },
  { id: 'mri', icon: Activity },
  { id: 'atlas3d', icon: Box },
  { id: 'records', icon: FileText },
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
    t,
    profile,
    activeSection,
    setActiveSection,
    records,
    attachments,
    toast,
  } = useMedicalArchive();

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [jsonModalOpen, setJsonModalOpen] = useState(false);

  const handleSelectNav = (section: NavSection) => {
    setActiveSection(section);
    setMobileNavOpen(false);
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
          {/* Clean Single-Row Top Bar with Privacy Toggle, Theme Toggle, Language Switcher, and Doctor Mode CTA */}
          <header className="no-print sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-slate-200/90 bg-white/95 px-4 py-3 backdrop-blur-xs dark:border-slate-800 dark:bg-slate-900/95 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileNavOpen(true)}
                aria-label="Open menu"
                className="rounded-lg border border-slate-200 p-1.5 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 lg:hidden"
              >
                <Menu className="h-4 w-4" />
              </button>
              <div className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                {t.nav[activeSection]}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
              {/* Privacy Mode Quick Toggle */}
              <button
                type="button"
                onClick={togglePrivacyMode}
                title={privacyMode ? t.actions.privacyActive : t.actions.privacyMode}
                aria-pressed={privacyMode}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                  privacyMode
                    ? 'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-white'
                }`}
              >
                {privacyMode ? (
                  <EyeOff className="h-3.5 w-3.5 shrink-0" />
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

          {/* Active Section Content */}
          <main
            className={
              activeSection === 'atlas3d'
                ? 'flex-1 px-3 py-3 sm:px-4'
                : 'flex-1 px-4 py-6 sm:px-6 lg:px-8'
            }
          >
            {renderSection()}
          </main>
        </div>
      </div>

      {/* JSON Import/Export/Reset Modal */}
      <JsonArchiveModal open={jsonModalOpen} onClose={() => setJsonModalOpen(false)} />

      {/* Transient Toast Notification */}
      {toast && (
        <div
          role="status"
          className="no-print fixed right-4 bottom-4 z-50 flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-xs font-medium text-white shadow-lg"
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
