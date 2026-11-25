import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Plus,
  ListPlus,
  Search,
  ExternalLink,
  Copy,
  Check,
  Pencil,
  Trash2,
  X,
  AlertCircle,
  ArrowUpRight,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { useMedicalArchive } from '../context/MedicalArchiveContext';
import { DETAILED_SPINE_SEGMENTS } from '../data/spineSegmentsData';
import {
  detectAttachmentSource,
  extractSortDate,
  formatRecordDateDisplay,
  getAttachmentUrls,
  inferCategoryFromText,
  isValidHttpUrl,
  normalizeAttachmentSource,
  parseAttachmentUrlsInput,
} from '../data/recordsLocalization';
import { AttachmentLink, AttachmentSource, Language, MedicalExamRecord } from '../types/medical';
import { ConfirmModal } from './ConfirmModal';

function formatRecordOptionLabel(record: MedicalExamRecord, language: Language): string {
  const title = record.title[language];
  return record.date && record.date !== '—' ? `${title} — ${record.date}` : title;
}

const SOURCE_ORDER: AttachmentSource[] = ['gdrive', 'cloud', 'clinic', 'other'];

function sourceBadgeClasses(source: AttachmentSource): string {
  switch (source) {
    case 'gdrive':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300';
    case 'cloud':
      return 'border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-800 dark:bg-teal-950/50 dark:text-teal-300';
    case 'clinic':
      return 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-300';
    default:
      return 'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300';
  }
}

export const LinksArchiveView: React.FC = () => {
  const {
    language,
    t,
    attachments,
    records,
    addRecord,
    addAttachment,
    addAttachmentsBatch,
    updateAttachment,
    deleteAttachment,
    jumpToMriSegment,
    showToast,
  } = useMedicalArchive();

  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'all' | AttachmentSource>('all');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const [mode, setMode] = useState<'none' | 'single' | 'batch'>('none');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [source, setSource] = useState<AttachmentSource>('gdrive');
  const [date, setDate] = useState('');
  const [linkedSegment, setLinkedSegment] = useState('');
  const [linkedRecordId, setLinkedRecordId] = useState('');
  const [recordQuery, setRecordQuery] = useState('');
  const [recordMenuOpen, setRecordMenuOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);

  const [batchText, setBatchText] = useState('');
  const [batchError, setBatchError] = useState<string | null>(null);

  const urlTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const recordComboRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (mode !== 'single') return;
    const el = urlTextareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.max(84, el.scrollHeight)}px`;
  }, [url, mode]);

  useEffect(() => {
    if (!recordMenuOpen) return;
    const handleOutsideClick = (event: MouseEvent) => {
      if (recordComboRef.current && !recordComboRef.current.contains(event.target as Node)) {
        setRecordMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [recordMenuOpen]);

  const sortedRecords = useMemo(
    () => [...records].sort((a, b) => b.sortDate.localeCompare(a.sortDate)),
    [records],
  );

  const selectedRecordObj = useMemo(
    () => (linkedRecordId ? records.find((r) => r.id === linkedRecordId) ?? null : null),
    [records, linkedRecordId],
  );

  const filteredRecordOptions = useMemo(() => {
    const q = recordQuery.trim().toLowerCase();
    if (!q) return sortedRecords;
    if (selectedRecordObj && formatRecordOptionLabel(selectedRecordObj, language).toLowerCase() === q) {
      return sortedRecords;
    }
    return sortedRecords.filter((rec) => {
      const label = formatRecordOptionLabel(rec, language).toLowerCase();
      const categoryLabel = t.records.categories[rec.category].toLowerCase();
      return (
        label.includes(q) ||
        rec.originalIndexTitle.toLowerCase().includes(q) ||
        rec.date.toLowerCase().includes(q) ||
        categoryLabel.includes(q)
      );
    });
  }, [sortedRecords, recordQuery, selectedRecordObj, language, t.records.categories]);

  const trimmedRecordQuery = recordQuery.trim();
  const willCreateNewRecord = !linkedRecordId && trimmedRecordQuery.length > 0;
  const inferredNewCategory = useMemo(
    () => inferCategoryFromText(trimmedRecordQuery),
    [trimmedRecordQuery],
  );

  const openSingleAdd = () => {
    setEditingId(null);
    setTitle('');
    setUrl('');
    setSource('gdrive');
    setDate(new Date().toISOString().slice(0, 10));
    setLinkedSegment('');
    setLinkedRecordId('');
    setRecordQuery('');
    setRecordMenuOpen(false);
    setNotes('');
    setUrlError(null);
    setMode('single');
  };

  const openEdit = (item: AttachmentLink) => {
    const itemUrls = getAttachmentUrls(item);
    const existingRecord = item.linkedRecordId
      ? records.find((r) => r.id === item.linkedRecordId) ?? null
      : null;
    setEditingId(item.id);
    setTitle(item.title);
    setUrl(itemUrls.join('\n'));
    setSource(normalizeAttachmentSource(item.source, item.url, itemUrls));
    setDate(item.date);
    setLinkedSegment(item.linkedSegment);
    setLinkedRecordId(existingRecord ? existingRecord.id : '');
    setRecordQuery(existingRecord ? formatRecordOptionLabel(existingRecord, language) : '');
    setRecordMenuOpen(false);
    setNotes(item.notes);
    setUrlError(null);
    setMode('single');
  };

  const handleUrlChange = (val: string) => {
    setUrl(val);
    setUrlError(null);
    const firstUrl = parseAttachmentUrlsInput(val)[0] || '';
    if (firstUrl.length > 6) {
      const detected = detectAttachmentSource(firstUrl);
      if (detected !== 'other' || isValidHttpUrl(firstUrl)) {
        setSource(detected);
      }
    }
  };

  const handleRecordInputChange = (val: string) => {
    setRecordQuery(val);
    setRecordMenuOpen(true);
    const normalized = val.trim().toLowerCase();
    if (!normalized) {
      setLinkedRecordId('');
      return;
    }
    const exactMatch = records.find(
      (r) => formatRecordOptionLabel(r, language).toLowerCase() === normalized,
    );
    setLinkedRecordId(exactMatch ? exactMatch.id : '');
  };

  const handleSelectRecordOption = (record: MedicalExamRecord | null) => {
    if (!record) {
      setLinkedRecordId('');
      setRecordQuery('');
    } else {
      setLinkedRecordId(record.id);
      setRecordQuery(formatRecordOptionLabel(record, language));
    }
    setRecordMenuOpen(false);
  };

  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedUrls = parseAttachmentUrlsInput(url);
    if (parsedUrls.length === 0) {
      setUrlError(t.archive.invalidUrl);
      return;
    }

    for (const candidate of parsedUrls) {
      if (!isValidHttpUrl(candidate)) {
        setUrlError(
          parsedUrls.length > 1
            ? `${t.archive.invalidUrl}: "${candidate}"`
            : t.archive.invalidUrl,
        );
        return;
      }
    }

    let resolvedRecordId = linkedRecordId;
    if (!resolvedRecordId && trimmedRecordQuery.length > 0) {
      const normalizedInput = trimmedRecordQuery.toLowerCase();
      const existingMatch = records.find(
        (r) =>
          formatRecordOptionLabel(r, language).toLowerCase() === normalizedInput ||
          (r.title[language].toLowerCase() === normalizedInput &&
            (!date.trim() || r.date === formatRecordDateDisplay(date))),
      );

      if (existingMatch) {
        resolvedRecordId = existingMatch.id;
      } else {
        const inlineDateMatch = trimmedRecordQuery.match(
          /(\d{2}\.\d{2}\.\d{4}|\d{4}-\d{2}-\d{2})/,
        );
        const inlineYearMatch = trimmedRecordQuery.match(/\b(19\d{2}|20\d{2})\b/);
        const formattedFormDate = date.trim() ? formatRecordDateDisplay(date) : '';
        const resolvedDate =
          formattedFormDate ||
          (inlineDateMatch ? formatRecordDateDisplay(inlineDateMatch[1]) : '') ||
          (inlineYearMatch ? inlineYearMatch[1] : '—');
        const sortDate = extractSortDate(formattedFormDate || trimmedRecordQuery);
        const category = inferCategoryFromText(trimmedRecordQuery);

        resolvedRecordId = addRecord({
          originalIndexTitle:
            resolvedDate !== '—' ? `${trimmedRecordQuery} (${resolvedDate})` : trimmedRecordQuery,
          title: {
            uk: trimmedRecordQuery,
            ru: trimmedRecordQuery,
            en: trimmedRecordQuery,
          },
          date: resolvedDate,
          sortDate,
          category,
          notes: '',
        });
      }
    }

    const primaryUrl = parsedUrls[0];
    const cleanTitle = title.trim() || primaryUrl.replace(/^https?:\/\//, '').slice(0, 48);
    const payload = {
      title: cleanTitle,
      url: primaryUrl,
      urls: parsedUrls,
      source,
      date: date.trim(),
      linkedSegment,
      linkedRecordId: resolvedRecordId,
      notes: notes.trim(),
    };

    if (editingId) {
      updateAttachment(editingId, payload);
    } else {
      addAttachment(payload);
    }
    setRecordMenuOpen(false);
    setMode('none');
  };

  const handleBatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBatchError(null);
    const lines = batchText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    const parsedItems: Omit<AttachmentLink, 'id'>[] = [];
    const today = new Date().toISOString().slice(0, 10);

    for (const line of lines) {
      let itemTitle = '';
      let itemUrl = line;
      if (line.includes('|')) {
        const [left, ...rest] = line.split('|');
        itemTitle = left.trim();
        itemUrl = rest.join('|').trim();
      }
      if (!isValidHttpUrl(itemUrl)) {
        setBatchError(`${t.archive.invalidUrl}: "${line}"`);
        return;
      }
      const detected = detectAttachmentSource(itemUrl);
      parsedItems.push({
        title:
          itemTitle ||
          `${t.archive.sources[detected]} — ${itemUrl.replace(/^https?:\/\//, '').slice(0, 36)}`,
        url: itemUrl,
        urls: [itemUrl],
        source: detected,
        date: today,
        linkedSegment: '',
        linkedRecordId: '',
        notes: '',
      });
    }

    if (parsedItems.length === 0) return;
    addAttachmentsBatch(parsedItems);
    setBatchText('');
    setMode('none');
  };

  const handleCopy = async (key: string, targetUrl: string) => {
    try {
      await navigator.clipboard.writeText(targetUrl);
      setCopiedKey(key);
      showToast(t.actions.copied, 'success');
      window.setTimeout(() => setCopiedKey((prev) => (prev === key ? null : prev)), 1800);
    } catch {
      // Clipboard fallback ignored gracefully
    }
  };

  const normalizedAttachments = useMemo(
    () =>
      attachments.map((item) => {
        const itemUrls = getAttachmentUrls(item);
        return {
          ...item,
          url: itemUrls[0] || item.url,
          urls: itemUrls,
          source: normalizeAttachmentSource(item.source, item.url, itemUrls),
        };
      }),
    [attachments],
  );

  const filteredLinks = useMemo(() => {
    const q = search.trim().toLowerCase();
    return normalizedAttachments.filter((item) => {
      if (sourceFilter !== 'all' && item.source !== sourceFilter) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.url.toLowerCase().includes(q) ||
        item.urls.some((u) => u.toLowerCase().includes(q)) ||
        item.linkedSegment.toLowerCase().includes(q) ||
        item.notes.toLowerCase().includes(q)
      );
    });
  }, [normalizedAttachments, sourceFilter, search]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: normalizedAttachments.length };
    SOURCE_ORDER.forEach((s) => {
      map[s] = normalizedAttachments.filter((a) => a.source === s).length;
    });
    return map;
  }, [normalizedAttachments]);

  const recordTitleById = useMemo(() => {
    const map = new Map<string, string>();
    records.forEach((r) => map.set(r.id, formatRecordOptionLabel(r, language)));
    return map;
  }, [records, language]);

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-2xl">
            {t.archive.sectionTitle}
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {t.archive.sectionSubtitle}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setBatchError(null);
              setMode(mode === 'batch' ? 'none' : 'batch');
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 whitespace-nowrap"
          >
            <ListPlus className="h-3.5 w-3.5" />
            {t.archive.batchAdd}
          </button>
          <button
            type="button"
            onClick={openSingleAdd}
            className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-sky-700 whitespace-nowrap"
          >
            <Plus className="h-3.5 w-3.5" />
            {t.archive.addLink}
          </button>
        </div>
      </div>

      {/* Single Add / Edit Form */}
      {mode === 'single' && (
        <form
          onSubmit={handleSingleSubmit}
          className="rounded-xl border border-sky-200 bg-white p-5 shadow-sm dark:border-cyan-900/70 dark:bg-slate-900"
        >
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {editingId ? t.actions.edit : t.archive.addLink}
            </h2>
            <button
              type="button"
              onClick={() => setMode('none')}
              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-12">
            <label className="block sm:col-span-12">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                {t.archive.urlLabel} *
              </span>
              <textarea
                ref={urlTextareaRef}
                required
                rows={3}
                value={url}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder={t.archive.urlPlaceholder}
                className="mt-1 min-h-[84px] w-full resize-y overflow-y-auto rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs leading-relaxed text-slate-900 focus:border-sky-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </label>

            <label className="block sm:col-span-12">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                {t.archive.titleLabel}
              </span>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t.archive.titlePlaceholder}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-sky-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </label>

            <label className="block sm:col-span-4">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                {t.archive.sourceLabel}
              </span>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as AttachmentSource)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-sky-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                {SOURCE_ORDER.map((s) => (
                  <option key={s} value={s}>
                    {t.archive.sources[s]}
                  </option>
                ))}
              </select>
            </label>

            <label className="block sm:col-span-4">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                {t.archive.dateLabel}
              </span>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="2026-10-26"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-900 focus:border-sky-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </label>

            <label className="block sm:col-span-4">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                {t.archive.segmentLabel}
              </span>
              <select
                value={linkedSegment}
                onChange={(e) => setLinkedSegment(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-900 focus:border-sky-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="">{t.archive.noneOption}</option>
                {DETAILED_SPINE_SEGMENTS.map((seg) => (
                  <option key={seg.id} value={seg.id}>
                    {seg.id}
                  </option>
                ))}
              </select>
            </label>

            {/* Editable Examination Combobox: pick existing (with date) OR type a new name */}
            <div ref={recordComboRef} className="relative sm:col-span-12">
              <label className="block">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  {t.archive.recordLabel}
                </span>
                <div className="relative mt-1">
                  <input
                    type="text"
                    role="combobox"
                    aria-expanded={recordMenuOpen}
                    aria-autocomplete="list"
                    value={recordQuery}
                    onFocus={() => setRecordMenuOpen(true)}
                    onChange={(e) => handleRecordInputChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setRecordMenuOpen(false);
                      }
                    }}
                    placeholder={t.archive.recordPlaceholder}
                    className="w-full rounded-lg border border-slate-300 bg-white py-2 pr-16 pl-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                  <div className="absolute top-1/2 right-1.5 flex -translate-y-1/2 items-center gap-0.5">
                    {recordQuery && (
                      <button
                        type="button"
                        onClick={() => handleSelectRecordOption(null)}
                        aria-label={t.archive.clearSelection}
                        title={t.archive.clearSelection}
                        className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setRecordMenuOpen((prev) => !prev)}
                      aria-label={t.archive.recordLabel}
                      className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                    >
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${recordMenuOpen ? 'rotate-180' : ''}`}
                      />
                    </button>
                  </div>
                </div>
              </label>

              {recordMenuOpen && (
                <div
                  role="listbox"
                  className="absolute right-0 left-0 z-30 mt-1 max-h-64 overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-900"
                >
                  <button
                    type="button"
                    onClick={() => handleSelectRecordOption(null)}
                    className={`flex w-full items-center justify-between px-3 py-2 text-left text-xs transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 ${
                      !linkedRecordId && !recordQuery
                        ? 'font-semibold text-sky-700 dark:text-cyan-400'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    <span>{t.archive.noneOption}</span>
                  </button>

                  {filteredRecordOptions.map((rec) => {
                    const isSelected = linkedRecordId === rec.id;
                    return (
                      <button
                        key={rec.id}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => handleSelectRecordOption(rec)}
                        className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs transition-colors hover:bg-sky-50/70 dark:hover:bg-slate-800 ${
                          isSelected
                            ? 'bg-sky-50/80 text-sky-900 dark:bg-cyan-950/40 dark:text-cyan-200'
                            : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <div className="flex min-w-0 flex-1 items-center gap-2">
                          <span className="truncate font-medium">{rec.title[language]}</span>
                          <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                            {t.records.categories[rec.category]}
                          </span>
                        </div>
                        <div className="flex shrink-0 items-center gap-1.5">
                          {rec.date && rec.date !== '—' && (
                            <span className="font-mono text-[11px] text-slate-500 tabular-nums dark:text-slate-400">
                              {rec.date}
                            </span>
                          )}
                          {isSelected && <Check className="h-3.5 w-3.5 text-sky-600 dark:text-cyan-400" />}
                        </div>
                      </button>
                    );
                  })}

                  {willCreateNewRecord && (
                    <div className="border-t border-slate-100 bg-sky-50/60 px-3 py-2 text-xs text-sky-900 dark:border-slate-800 dark:bg-cyan-950/35 dark:text-cyan-200">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 shrink-0 text-sky-600 dark:text-cyan-400" />
                        <span>{t.archive.createRecordHint}</span>
                        <strong className="font-semibold">«{trimmedRecordQuery}»</strong>
                        <span className="rounded bg-white/80 px-1.5 py-0.5 text-[10px] font-semibold text-sky-800 dark:bg-slate-800 dark:text-cyan-300">
                          {t.records.categories[inferredNewCategory]}
                        </span>
                        {date.trim() && (
                          <span className="font-mono text-[11px] text-slate-600 tabular-nums dark:text-slate-300">
                            · {formatRecordDateDisplay(date)}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {willCreateNewRecord && !recordMenuOpen && (
                <p className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-sky-700 dark:text-cyan-400">
                  <Sparkles className="h-3 w-3 shrink-0" />
                  <span>{t.archive.createRecordHint}</span>
                  <strong className="font-semibold">«{trimmedRecordQuery}»</strong>
                  <span className="rounded border border-sky-200 bg-sky-50 px-1.5 py-0.5 text-[10px] font-semibold dark:border-cyan-800 dark:bg-cyan-950/40">
                    {t.records.categories[inferredNewCategory]}
                  </span>
                </p>
              )}
            </div>

            <label className="block sm:col-span-12">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                {t.archive.notesLabel}
              </span>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-sky-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </label>
          </div>

          {urlError && (
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{urlError}</span>
            </div>
          )}

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setMode('none')}
              className="rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {t.actions.cancel}
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-700"
            >
              <Check className="h-3.5 w-3.5" />
              {t.actions.save}
            </button>
          </div>
        </form>
      )}

      {/* Batch URL Paste Form */}
      {mode === 'batch' && (
        <form
          onSubmit={handleBatchSubmit}
          className="rounded-xl border border-sky-200 bg-white p-5 shadow-sm dark:border-cyan-900/70 dark:bg-slate-900"
        >
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {t.archive.batchAdd}
            </h2>
            <button
              type="button"
              onClick={() => setMode('none')}
              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-2.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            {t.archive.batchHint}
          </p>
          <textarea
            rows={5}
            value={batchText}
            onChange={(e) => {
              setBatchText(e.target.value);
              setBatchError(null);
            }}
            placeholder={t.archive.batchPlaceholder}
            className="mt-3 w-full rounded-lg border border-slate-300 bg-slate-50 p-3 font-mono text-xs text-slate-900 focus:border-sky-600 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
          {batchError && (
            <div className="mt-2.5 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{batchError}</span>
            </div>
          )}
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setMode('none')}
              className="rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {t.actions.cancel}
            </button>
            <button
              type="submit"
              className="rounded-lg bg-sky-600 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-700"
            >
              {t.archive.batchSubmit}
            </button>
          </div>
        </form>
      )}

      {/* Empty State or Populated Archive */}
      {attachments.length === 0 ? (
        <section className="rounded-xl border border-slate-200/90 bg-white px-6 py-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            {t.archive.emptyTitle}
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            {t.archive.emptyBody}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={openSingleAdd}
              className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-sky-700"
            >
              <Plus className="h-3.5 w-3.5" />
              {t.archive.addLink}
            </button>
            <button
              type="button"
              onClick={() => setMode('batch')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <ListPlus className="h-3.5 w-3.5" />
              {t.archive.batchAdd}
            </button>
          </div>
        </section>
      ) : (
        <>
          <div className="flex flex-col gap-3 rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t.archive.searchPlaceholder}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pr-3 pl-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-600 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSourceFilter('all')}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                  sourceFilter === 'all'
                    ? 'bg-slate-900 text-white dark:bg-cyan-600'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {t.archive.allSources} ({counts.all})
              </button>
              {SOURCE_ORDER.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSourceFilter(s)}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                    sourceFilter === s
                      ? 'bg-slate-900 text-white dark:bg-cyan-600'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {t.archive.sources[s]} ({counts[s]})
                </button>
              ))}
            </div>
          </div>

          <section className="overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredLinks.map((item) => {
                const linkedRecTitle = item.linkedRecordId
                  ? recordTitleById.get(item.linkedRecordId)
                  : null;
                const itemUrls = item.urls.length > 0 ? item.urls : item.url ? [item.url] : [];

                return (
                  <div
                    key={item.id}
                    className="px-4 py-4 transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40 sm:px-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${sourceBadgeClasses(
                              item.source,
                            )}`}
                          >
                            {t.archive.sources[item.source]}
                          </span>
                          {item.date && <span className="font-mono tabular-nums">{item.date}</span>}
                          {item.linkedSegment && (
                            <button
                              type="button"
                              onClick={() => jumpToMriSegment(item.linkedSegment)}
                              className="inline-flex items-center gap-0.5 rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-slate-800 hover:border-sky-400 hover:text-sky-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:text-cyan-300"
                            >
                              {item.linkedSegment}
                              <ArrowUpRight className="h-3 w-3" />
                            </button>
                          )}
                          {linkedRecTitle && (
                            <span className="truncate text-slate-600 dark:text-slate-300">
                              · {linkedRecTitle}
                            </span>
                          )}
                        </div>

                        <h3 className="mt-1.5 text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {item.title}
                        </h3>
                      </div>

                      <div className="flex shrink-0 items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEdit(item)}
                          aria-label={t.actions.edit}
                          className="rounded-md border border-slate-200 bg-white p-1.5 text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTargetId(item.id)}
                          aria-label={t.actions.delete}
                          className="rounded-md border border-slate-200 bg-white p-1.5 text-slate-500 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-rose-900 dark:hover:bg-rose-950/50 dark:hover:text-rose-300"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {itemUrls.length > 0 && (
                      <div className="mt-2.5 space-y-1.5">
                        {itemUrls.map((linkUrl, idx) => {
                          const rowKey = `${item.id}:${idx}`;
                          return (
                            <div
                              key={rowKey}
                              className="flex flex-col gap-2 rounded-lg border border-slate-200/80 bg-slate-50/70 px-3 py-2 dark:border-slate-800 dark:bg-slate-800/50 sm:flex-row sm:items-center sm:justify-between"
                            >
                              <div className="flex min-w-0 flex-1 items-center gap-2">
                                {itemUrls.length > 1 && (
                                  <span className="shrink-0 rounded bg-slate-200/80 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                                    {t.archive.pagePrefix} {idx + 1}
                                  </span>
                                )}
                                <a
                                  href={linkUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="min-w-0 flex-1 truncate font-mono text-xs text-sky-700 hover:underline dark:text-cyan-400"
                                >
                                  {linkUrl}
                                </a>
                              </div>

                              <div className="flex shrink-0 items-center gap-1.5 self-end sm:self-center">
                                <a
                                  href={linkUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 transition-colors hover:border-sky-300 hover:text-sky-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-cyan-500 whitespace-nowrap"
                                >
                                  {t.actions.openExternal}
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(rowKey, linkUrl)}
                                  aria-label={t.actions.copyLink}
                                  className="rounded-md border border-slate-200 bg-white p-1.5 text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                                >
                                  {copiedKey === rowKey ? (
                                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                                  ) : (
                                    <Copy className="h-3.5 w-3.5" />
                                  )}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {item.notes && (
                      <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                        {item.notes}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}

      <ConfirmModal
        open={Boolean(deleteTargetId)}
        title={t.archive.deleteConfirmTitle}
        body={t.archive.deleteConfirmBody}
        confirmLabel={t.actions.delete}
        cancelLabel={t.actions.cancel}
        danger
        onConfirm={() => {
          if (deleteTargetId) deleteAttachment(deleteTargetId);
          setDeleteTargetId(null);
        }}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
