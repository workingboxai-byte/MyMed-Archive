import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Search,
  X,
  Activity,
  FileText,
  Pill,
  FolderGit2,
  ListChecks,
  CornerDownLeft,
  ArrowRight,
} from 'lucide-react';
import { useMedicalArchive } from '../context/MedicalArchiveContext';
import { DETAILED_SPINE_SEGMENTS } from '../data/spineSegmentsData';
import { getAttachmentUrls } from '../data/recordsLocalization';

interface GlobalSearchModalProps {
  open: boolean;
  onClose: () => void;
}

type SearchGroupKey = 'mri' | 'records' | 'treatments' | 'archive' | 'followUp';

interface SearchResultItem {
  id: string;
  group: SearchGroupKey;
  title: string;
  subtitle: string;
  meta?: string;
  onSelect: () => void;
}

const QUICK_SEARCH_EXAMPLES = ['L4-L5', 'D6', 'C5-C6', 'МРТ'];

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ open, onClose }) => {
  const {
    language,
    t,
    records,
    treatments,
    attachments,
    followUpPlan,
    jumpToMriSegment,
    setActiveSection,
  } = useMedicalArchive();

  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
      window.setTimeout(() => {
        inputRef.current?.focus();
      }, 20);
    }
  }, [open]);

  // Build live search results across MRI, Records, Treatments/Medications, Links Archive, and Follow-up Plan.
  // NOTE: Personal Vault data is strictly excluded from global search for privacy.
  const results = useMemo<SearchResultItem[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const matched: SearchResultItem[] = [];

    // 1. Spine MRI Segments (SOR)
    for (const seg of DETAILED_SPINE_SEGMENTS) {
      const haystack = [
        seg.id,
        seg.id.replace('-', ' '),
        seg.y2025.finding[language],
        seg.y2026.finding[language],
        seg.y2026.details[language],
        seg.y2026.canal[language],
        seg.y2026.roots[language],
        seg.deltaSummary[language],
        seg.statusLabel[language],
      ]
        .join(' ')
        .toLowerCase();

      if (haystack.includes(q)) {
        matched.push({
          id: `mri-${seg.id}`,
          group: 'mri',
          title: `${seg.id} · ${seg.y2026.finding[language]}`,
          subtitle: seg.deltaSummary[language],
          meta: seg.statusLabel[language],
          onSelect: () => {
            onClose();
            jumpToMriSegment(seg.id);
          },
        });
      }
    }

    // 2. Examinations & Discharges
    for (const rec of records) {
      const haystack = [
        rec.title.uk,
        rec.title.ru,
        rec.title.en,
        rec.date,
        rec.notes,
        t.records.categories[rec.category],
      ]
        .join(' ')
        .toLowerCase();

      if (haystack.includes(q)) {
        matched.push({
          id: `rec-${rec.id}`,
          group: 'records',
          title: rec.title[language],
          subtitle: rec.notes || t.records.categories[rec.category],
          meta: rec.date,
          onSelect: () => {
            onClose();
            setActiveSection('records');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          },
        });
      }
    }

    // 3. Treatments & Medications
    for (const course of treatments) {
      const medsSummary = course.medications
        .map((m) => [m.name, m.dosage, m.schedule, m.duration].filter(Boolean).join(' '))
        .join('; ');
      const haystack = [
        course.prescribedBy,
        course.period,
        medsSummary,
        course.proceduresAndRecommendations,
        t.treatments.courseTypes[course.courseType],
        t.treatments.statuses[course.status],
      ]
        .join(' ')
        .toLowerCase();

      if (haystack.includes(q)) {
        const medNames = course.medications.map((m) => m.name).filter(Boolean).join(', ');
        matched.push({
          id: `trt-${course.id}`,
          group: 'treatments',
          title: course.prescribedBy || t.treatments.courseTypes[course.courseType],
          subtitle: medNames || course.proceduresAndRecommendations || t.treatments.noMedications,
          meta: course.period,
          onSelect: () => {
            onClose();
            setActiveSection('treatments');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          },
        });
      }
    }

    // 4. Documents & Links Archive
    for (const att of attachments) {
      const urls = getAttachmentUrls(att);
      const haystack = [
        att.title,
        att.notes,
        att.date,
        att.linkedSegment,
        ...urls,
      ]
        .join(' ')
        .toLowerCase();

      if (haystack.includes(q)) {
        matched.push({
          id: `att-${att.id}`,
          group: 'archive',
          title: att.title,
          subtitle: att.notes || urls[0] || '',
          meta: att.linkedSegment || att.date,
          onSelect: () => {
            onClose();
            setActiveSection('archive');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          },
        });
      }
    }

    // 5. Follow-up Plan Checklist
    for (const task of followUpPlan) {
      const haystack = `${task.title} ${task.targetDate}`.toLowerCase();
      if (haystack.includes(q)) {
        matched.push({
          id: `fup-${task.id}`,
          group: 'followUp',
          title: task.title,
          subtitle: t.followUp.sectionTitle,
          meta: task.targetDate,
          onSelect: () => {
            onClose();
            setActiveSection('anamnesis');
            window.setTimeout(() => {
              document.getElementById('follow-up-plan-card')?.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
              });
            }, 60);
          },
        });
      }
    }

    return matched.slice(0, 24);
  }, [
    query,
    language,
    records,
    treatments,
    attachments,
    followUpPlan,
    t,
    onClose,
    jumpToMriSegment,
    setActiveSection,
  ]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (results.length === 0) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % results.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + results.length) % results.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const chosen = results[activeIndex];
        chosen?.onSelect();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, results, activeIndex, onClose]);

  if (!open) return null;

  const groupIcon = (group: SearchGroupKey) => {
    switch (group) {
      case 'mri':
        return <Activity className="h-4 w-4 text-sky-600 dark:text-cyan-400" />;
      case 'records':
        return <FileText className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />;
      case 'treatments':
        return <Pill className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
      case 'archive':
        return <FolderGit2 className="h-4 w-4 text-amber-600 dark:text-amber-400" />;
      case 'followUp':
        return <ListChecks className="h-4 w-4 text-teal-600 dark:text-teal-400" />;
    }
  };

  // Group indices cleanly while preserving flat activeIndex
  const groupedOrder: SearchGroupKey[] = ['mri', 'records', 'treatments', 'archive', 'followUp'];

  return (
    <div
      className="no-print fixed inset-0 z-50 flex items-start justify-center bg-slate-950/55 px-4 pt-[10vh] pb-6 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-label={t.globalSearch.buttonLabel}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[76vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        {/* Search Input Header */}
        <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
          <Search className="h-4.5 w-4.5 shrink-0 text-sky-600 dark:text-cyan-400" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.globalSearch.placeholder}
            className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-slate-100 dark:placeholder:text-slate-500"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              aria-label={t.actions.close}
              className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="hidden rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px] font-medium text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 sm:inline-block"
          >
            Esc
          </button>
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-3">
          {!query.trim() ? (
            <div className="px-3 py-6 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t.globalSearch.emptyPrompt}
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <span className="text-[11px] font-medium text-slate-400">
                  {t.globalSearch.quickExamplesLabel}
                </span>
                {QUICK_SEARCH_EXAMPLES.map((example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => {
                      setQuery(example);
                      inputRef.current?.focus();
                    }}
                    className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-xs font-semibold text-slate-700 transition-colors hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-cyan-600 dark:hover:text-cyan-300"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="px-3 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
              {t.globalSearch.noResults}
            </div>
          ) : (
            <div className="space-y-4">
              {groupedOrder.map((groupKey) => {
                const groupItems = results
                  .map((item, flatIdx) => ({ item, flatIdx }))
                  .filter(({ item }) => item.group === groupKey);
                if (groupItems.length === 0) return null;

                return (
                  <div key={groupKey}>
                    <div className="mb-1.5 flex items-center justify-between px-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      <span>{t.globalSearch.groups[groupKey]}</span>
                      <span className="font-mono tabular-nums">{groupItems.length}</span>
                    </div>
                    <div className="space-y-1">
                      {groupItems.map(({ item, flatIdx }) => {
                        const isActive = flatIdx === activeIndex;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onMouseEnter={() => setActiveIndex(flatIdx)}
                            onClick={item.onSelect}
                            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                              isActive
                                ? 'bg-sky-50 text-slate-900 dark:bg-cyan-950/50 dark:text-white'
                                : 'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/70'
                            }`}
                          >
                            <span className="shrink-0">{groupIcon(item.group)}</span>
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-xs font-semibold text-slate-900 dark:text-slate-100">
                                {item.title}
                              </div>
                              {item.subtitle && (
                                <div className="mt-0.5 truncate text-[11px] text-slate-500 dark:text-slate-400">
                                  {item.subtitle}
                                </div>
                              )}
                            </div>
                            {item.meta && (
                              <span className="hidden shrink-0 font-mono text-[11px] text-slate-400 tabular-nums sm:inline">
                                {item.meta}
                              </span>
                            )}
                            <ArrowRight
                              className={`h-3.5 w-3.5 shrink-0 transition-opacity ${
                                isActive
                                  ? 'text-sky-600 opacity-100 dark:text-cyan-400'
                                  : 'text-slate-400 opacity-0'
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Clean Keyboard Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-slate-50/80 px-4 py-2 text-[11px] text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded border border-slate-200 bg-white px-1 py-0.5 font-mono text-[10px] dark:border-slate-700 dark:bg-slate-800">
                ↑↓
              </kbd>
              {t.globalSearch.navigateHint}
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="inline-flex items-center rounded border border-slate-200 bg-white px-1 py-0.5 font-mono text-[10px] dark:border-slate-700 dark:bg-slate-800">
                <CornerDownLeft className="h-2.5 w-2.5" />
              </kbd>
              {t.globalSearch.enterHint}
            </span>
          </div>
          {query.trim() && (
            <span className="font-mono tabular-nums">
              {t.globalSearch.resultsCount} {results.length}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
