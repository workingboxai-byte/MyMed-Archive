import React, { useMemo, useState } from 'react';
import { Search, Plus, Pencil, Trash2, ArrowUpDown, X, Check, Link2 } from 'lucide-react';
import { useMedicalArchive } from '../context/MedicalArchiveContext';
import { MedicalExamRecord, RecordCategory } from '../types/medical';
import { extractSortDate } from '../data/recordsLocalization';
import { ConfirmModal } from './ConfirmModal';

const CATEGORY_ORDER: RecordCategory[] = ['mri', 'ultrasound', 'discharge', 'lab', 'other'];

function categoryBadgeClasses(category: RecordCategory): string {
  switch (category) {
    case 'mri':
      return 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800/80 dark:bg-blue-950/50 dark:text-blue-300';
    case 'ultrasound':
      return 'border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-800/80 dark:bg-teal-950/50 dark:text-teal-300';
    case 'discharge':
      return 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800/80 dark:bg-violet-950/50 dark:text-violet-300';
    case 'lab':
      return 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800/80 dark:bg-amber-950/50 dark:text-amber-300';
    default:
      return 'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300';
  }
}

export const OtherRecordsView: React.FC = () => {
  const {
    language,
    t,
    records,
    attachments,
    addRecord,
    updateRecord,
    deleteRecord,
    setActiveSection,
  } = useMedicalArchive();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | RecordCategory>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  const [formOpen, setFormOpen] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [titleInput, setTitleInput] = useState('');
  const [dateInput, setDateInput] = useState('');
  const [categoryInput, setCategoryInput] = useState<RecordCategory>('mri');
  const [notesInput, setNotesInput] = useState('');

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const attachmentCountByRecord = useMemo(() => {
    const map = new Map<string, number>();
    attachments.forEach((a) => {
      if (a.linkedRecordId) {
        map.set(a.linkedRecordId, (map.get(a.linkedRecordId) || 0) + 1);
      }
    });
    return map;
  }, [attachments]);

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();
    return records
      .filter((r) => {
        if (categoryFilter !== 'all' && r.category !== categoryFilter) return false;
        if (!query) return true;
        return (
          r.title[language].toLowerCase().includes(query) ||
          r.originalIndexTitle.toLowerCase().includes(query) ||
          r.date.toLowerCase().includes(query) ||
          r.notes.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        const cmp = a.sortDate.localeCompare(b.sortDate);
        return sortOrder === 'newest' ? -cmp : cmp;
      });
  }, [records, categoryFilter, search, sortOrder, language]);

  const openAddForm = () => {
    setEditingRecordId(null);
    setTitleInput('');
    setDateInput(new Date().toLocaleDateString('uk-UA'));
    setCategoryInput('mri');
    setNotesInput('');
    setFormOpen(true);
  };

  const openEditForm = (rec: MedicalExamRecord) => {
    setEditingRecordId(rec.id);
    setTitleInput(rec.title[language]);
    setDateInput(rec.date === '—' ? '' : rec.date);
    setCategoryInput(rec.category);
    setNotesInput(rec.notes);
    setFormOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = titleInput.trim();
    if (!cleanTitle) return;
    const cleanDate = dateInput.trim() || '—';
    const sortDate = extractSortDate(cleanDate);

    if (editingRecordId) {
      const existing = records.find((r) => r.id === editingRecordId);
      if (existing) {
        const updatedTitle = { ...existing.title, [language]: cleanTitle };
        updateRecord(editingRecordId, {
          title: updatedTitle,
          date: cleanDate,
          sortDate,
          category: categoryInput,
          notes: notesInput.trim(),
        });
      }
    } else {
      addRecord({
        originalIndexTitle: cleanDate !== '—' ? `${cleanTitle} (${cleanDate})` : cleanTitle,
        title: { uk: cleanTitle, ru: cleanTitle, en: cleanTitle },
        date: cleanDate,
        sortDate,
        category: categoryInput,
        notes: notesInput.trim(),
      });
    }
    setFormOpen(false);
  };

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: records.length };
    CATEGORY_ORDER.forEach((cat) => {
      counts[cat] = records.filter((r) => r.category === cat).length;
    });
    return counts;
  }, [records]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-2xl">
            {t.records.sectionTitle}
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {t.records.sectionSubtitle}
          </p>
        </div>
        <button
          type="button"
          onClick={openAddForm}
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-sky-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-sky-700 whitespace-nowrap"
        >
          <Plus className="h-3.5 w-3.5" />
          {t.records.addRecord}
        </button>
      </div>

      {/* Add / Edit Inline Panel */}
      {formOpen && (
        <form
          onSubmit={handleSaveForm}
          className="rounded-xl border border-sky-200 bg-white p-5 shadow-sm dark:border-cyan-900/70 dark:bg-slate-900"
        >
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {editingRecordId ? t.records.editRecord : t.records.addRecord}
            </h2>
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-12">
            <label className="block sm:col-span-6">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                {t.records.recordTitleLabel}
              </span>
              <input
                type="text"
                required
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-sky-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </label>

            <label className="block sm:col-span-3">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                {t.records.recordDateLabel}
              </span>
              <input
                type="text"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                placeholder="DD.MM.YYYY"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-900 focus:border-sky-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </label>

            <label className="block sm:col-span-3">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                {t.records.recordCategoryLabel}
              </span>
              <select
                value={categoryInput}
                onChange={(e) => setCategoryInput(e.target.value as RecordCategory)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-sky-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                {CATEGORY_ORDER.map((cat) => (
                  <option key={cat} value={cat}>
                    {t.records.categories[cat]}
                  </option>
                ))}
              </select>
            </label>

            <label className="block sm:col-span-12">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                {t.records.recordNotesLabel}
              </span>
              <textarea
                rows={2}
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                placeholder={t.records.notesPlaceholder}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-sky-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </label>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setFormOpen(false)}
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

      {/* Search + Category Filters + Sort */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.records.searchPlaceholder}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pr-3 pl-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-600 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100 dark:focus:bg-slate-800"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSortOrder((s) => (s === 'newest' ? 'oldest' : 'newest'))}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 whitespace-nowrap"
            >
              <ArrowUpDown className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
              {sortOrder === 'newest' ? t.records.sortNewest : t.records.sortOldest}
            </button>
            <span className="font-mono text-xs text-slate-500 tabular-nums dark:text-slate-400 whitespace-nowrap">
              {t.records.totalCount} {filteredRecords.length}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-3 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setCategoryFilter('all')}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
              categoryFilter === 'all'
                ? 'bg-slate-900 text-white dark:bg-cyan-600'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-white'
            }`}
          >
            {t.records.allCategories} ({categoryCounts.all})
          </button>
          {CATEGORY_ORDER.filter((cat) => categoryCounts[cat] > 0 || categoryFilter === cat).map(
            (cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                  categoryFilter === cat
                    ? 'bg-slate-900 text-white dark:bg-cyan-600'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-white'
                }`}
              >
                {t.records.categories[cat]} ({categoryCounts[cat]})
              </button>
            ),
          )}
        </div>
      </div>

      {/* Structured Records List with Color-Coded Category Badges */}
      <section className="overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {filteredRecords.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
            {t.records.emptySearch}
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {filteredRecords.map((rec) => {
              const linkedCount = attachmentCountByRecord.get(rec.id) || 0;
              return (
                <div
                  key={rec.id}
                  className="flex flex-col gap-3 px-4 py-3.5 transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40 sm:flex-row sm:items-start sm:justify-between sm:px-5"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${categoryBadgeClasses(
                          rec.category,
                        )}`}
                      >
                        {t.records.categories[rec.category]}
                      </span>
                      <span className="font-mono tabular-nums">{rec.date}</span>
                      {linkedCount > 0 && (
                        <>
                          <span aria-hidden="true">·</span>
                          <button
                            type="button"
                            onClick={() => setActiveSection('archive')}
                            className="inline-flex items-center gap-1 font-medium text-sky-700 hover:underline dark:text-cyan-400"
                          >
                            <Link2 className="h-3 w-3" />
                            {t.records.linkedFiles} {linkedCount}
                          </button>
                        </>
                      )}
                    </div>

                    <h3 className="mt-1.5 text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {rec.title[language]}
                    </h3>

                    {rec.notes ? (
                      <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                        {rec.notes}
                      </p>
                    ) : (
                      <p className="mt-1 text-xs italic text-slate-400 dark:text-slate-500">
                        {t.records.noNotes}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => openEditForm(rec)}
                      aria-label={t.actions.edit}
                      className="rounded-md border border-slate-200 bg-white p-1.5 text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTargetId(rec.id)}
                      aria-label={t.actions.delete}
                      className="rounded-md border border-slate-200 bg-white p-1.5 text-slate-500 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-rose-900 dark:hover:bg-rose-950/50 dark:hover:text-rose-300"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <ConfirmModal
        open={Boolean(deleteTargetId)}
        title={t.records.deleteConfirmTitle}
        body={t.records.deleteConfirmBody}
        confirmLabel={t.actions.delete}
        cancelLabel={t.actions.cancel}
        danger
        onConfirm={() => {
          if (deleteTargetId) deleteRecord(deleteTargetId);
          setDeleteTargetId(null);
        }}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
