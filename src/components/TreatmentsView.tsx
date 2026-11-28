import React, { useMemo, useState } from 'react';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Check,
  ArrowUpDown,
  Pill,
  FileText,
  Sparkles,
  AlertCircle,
  Stethoscope,
} from 'lucide-react';
import { useMedicalArchive } from '../context/MedicalArchiveContext';
import {
  Language,
  MedicalExamRecord,
  PrescribedMedication,
  TreatmentCourse,
  TreatmentCourseStatus,
  TreatmentCourseType,
} from '../types/medical';
import { extractSortDate } from '../data/recordsLocalization';
import { ConfirmModal } from './ConfirmModal';

type TreatmentFilter = 'all' | 'active' | 'inpatient' | 'outpatient';

function createEmptyMedRow(): PrescribedMedication {
  return {
    id: `med-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: '',
    dosage: '',
    schedule: '',
    duration: '',
  };
}

function formatRecordOptionLabel(record: MedicalExamRecord, language: Language): string {
  const title = record.title[language];
  return record.date && record.date !== '—' ? `${title} — ${record.date}` : title;
}

function courseTypeBadgeClasses(courseType: TreatmentCourseType): string {
  return courseType === 'inpatient'
    ? 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-800/80 dark:bg-indigo-950/50 dark:text-indigo-300'
    : 'border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-800/80 dark:bg-teal-950/50 dark:text-teal-300';
}

function statusBadgeClasses(status: TreatmentCourseStatus): string {
  return status === 'active'
    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/80 dark:bg-emerald-950/50 dark:text-emerald-300'
    : 'border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300';
}

export const TreatmentsView: React.FC = () => {
  const {
    language,
    t,
    treatments,
    records,
    addTreatment,
    updateTreatment,
    deleteTreatment,
    setActiveSection,
  } = useMedicalArchive();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<TreatmentFilter>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [courseType, setCourseType] = useState<TreatmentCourseType>('outpatient');
  const [status, setStatus] = useState<TreatmentCourseStatus>('active');
  const [period, setPeriod] = useState('');
  const [prescribedBy, setPrescribedBy] = useState('');
  const [linkedRecordId, setLinkedRecordId] = useState('');
  const [medications, setMedications] = useState<PrescribedMedication[]>([createEmptyMedRow()]);
  const [procedures, setProcedures] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const recordById = useMemo(() => {
    const map = new Map<string, MedicalExamRecord>();
    records.forEach((r) => map.set(r.id, r));
    return map;
  }, [records]);

  const { dischargeRecords, otherRecords } = useMemo(() => {
    const sorted = [...records].sort((a, b) => b.sortDate.localeCompare(a.sortDate));
    return {
      dischargeRecords: sorted.filter((r) => r.category === 'discharge'),
      otherRecords: sorted.filter((r) => r.category !== 'discharge'),
    };
  }, [records]);

  const counts = useMemo(
    () => ({
      all: treatments.length,
      active: treatments.filter((c) => c.status === 'active').length,
      inpatient: treatments.filter((c) => c.courseType === 'inpatient').length,
      outpatient: treatments.filter((c) => c.courseType === 'outpatient').length,
    }),
    [treatments],
  );

  const filteredCourses = useMemo(() => {
    const q = search.trim().toLowerCase();
    return treatments
      .filter((course) => {
        if (filter === 'active' && course.status !== 'active') return false;
        if (filter === 'inpatient' && course.courseType !== 'inpatient') return false;
        if (filter === 'outpatient' && course.courseType !== 'outpatient') return false;
        if (!q) return true;
        const linkedRec = course.linkedRecordId ? recordById.get(course.linkedRecordId) : undefined;
        return (
          course.prescribedBy.toLowerCase().includes(q) ||
          course.period.toLowerCase().includes(q) ||
          course.proceduresAndRecommendations.toLowerCase().includes(q) ||
          course.medications.some(
            (m) =>
              m.name.toLowerCase().includes(q) ||
              m.dosage.toLowerCase().includes(q) ||
              m.schedule.toLowerCase().includes(q) ||
              m.duration.toLowerCase().includes(q),
          ) ||
          (linkedRec ? formatRecordOptionLabel(linkedRec, language).toLowerCase().includes(q) : false)
        );
      })
      .sort((a, b) => {
        // Keep active courses first when viewing "All" in newest-first mode? Or pure date sort with active tie-break:
        const cmp = a.sortDate.localeCompare(b.sortDate);
        if (cmp !== 0) return sortOrder === 'newest' ? -cmp : cmp;
        if (a.status !== b.status) return a.status === 'active' ? -1 : 1;
        return 0;
      });
  }, [treatments, filter, search, sortOrder, recordById, language]);

  const resetForm = () => {
    setEditingId(null);
    setCourseType('outpatient');
    setStatus('active');
    setPeriod(new Date().toLocaleDateString('uk-UA'));
    setPrescribedBy('');
    setLinkedRecordId('');
    setMedications([createEmptyMedRow()]);
    setProcedures('');
    setFormError(null);
  };

  const openAddForm = () => {
    resetForm();
    setFormOpen(true);
  };

  const openEditForm = (course: TreatmentCourse) => {
    setEditingId(course.id);
    setCourseType(course.courseType);
    setStatus(course.status);
    setPeriod(course.period === '—' ? '' : course.period);
    setPrescribedBy(course.prescribedBy);
    setLinkedRecordId(course.linkedRecordId);
    setMedications(
      course.medications.length > 0
        ? course.medications.map((m) => ({ ...m }))
        : [createEmptyMedRow()],
    );
    setProcedures(course.proceduresAndRecommendations);
    setFormError(null);
    setFormOpen(true);
  };

  const handleMedChange = (
    medId: string,
    field: keyof Omit<PrescribedMedication, 'id'>,
    value: string,
  ) => {
    setMedications((prev) =>
      prev.map((m) => (m.id === medId ? { ...m, [field]: value } : m)),
    );
  };

  const handleAddMedRow = () => {
    setMedications((prev) => [...prev, createEmptyMedRow()]);
  };

  const handleRemoveMedRow = (medId: string) => {
    setMedications((prev) => prev.filter((m) => m.id !== medId));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedMeds = medications
      .map((m) => ({
        ...m,
        name: m.name.trim(),
        dosage: m.dosage.trim(),
        schedule: m.schedule.trim(),
        duration: m.duration.trim(),
      }))
      .filter((m) => m.name || m.dosage || m.schedule || m.duration);

    const cleanDoctor = prescribedBy.trim();
    const cleanProcedures = procedures.trim();

    if (!cleanDoctor && cleanedMeds.length === 0 && !cleanProcedures) {
      setFormError(t.treatments.validationError);
      return;
    }

    const cleanPeriod = period.trim() || '—';
    const linkedRec = linkedRecordId ? recordById.get(linkedRecordId) : undefined;
    const sortDate =
      cleanPeriod !== '—'
        ? extractSortDate(cleanPeriod)
        : linkedRec?.sortDate || new Date().toISOString().slice(0, 10);

    const payload: Omit<TreatmentCourse, 'id'> = {
      courseType,
      status,
      period: cleanPeriod,
      sortDate,
      prescribedBy: cleanDoctor,
      medications: cleanedMeds,
      proceduresAndRecommendations: cleanProcedures,
      linkedRecordId,
    };

    if (editingId) {
      updateTreatment(editingId, payload);
    } else {
      addTreatment(payload);
    }

    setFormOpen(false);
    resetForm();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-2xl">
            {t.treatments.sectionTitle}
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {t.treatments.sectionSubtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={openAddForm}
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-sky-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-sky-700 whitespace-nowrap"
        >
          <Plus className="h-3.5 w-3.5" />
          {t.treatments.addCourse}
        </button>
      </div>

      {/* Add / Edit Inline Course Form */}
      {formOpen && (
        <form
          onSubmit={handleSave}
          className="rounded-xl border border-sky-200 bg-white p-5 shadow-sm dark:border-cyan-900/70 dark:bg-slate-900"
        >
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {editingId ? t.treatments.editCourse : t.treatments.addCourse}
            </h2>
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              aria-label={t.actions.close}
              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-12">
            {/* Course Type */}
            <label className="block sm:col-span-4">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                {t.treatments.courseTypeLabel}
              </span>
              <select
                value={courseType}
                onChange={(e) => setCourseType(e.target.value as TreatmentCourseType)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-sky-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="inpatient">{t.treatments.courseTypes.inpatient}</option>
                <option value="outpatient">{t.treatments.courseTypes.outpatient}</option>
              </select>
            </label>

            {/* Status */}
            <label className="block sm:col-span-4">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                {t.treatments.statusLabel}
              </span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TreatmentCourseStatus)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-sky-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="active">{t.treatments.statuses.active}</option>
                <option value="completed">{t.treatments.statuses.completed}</option>
              </select>
            </label>

            {/* Period / Date */}
            <label className="block sm:col-span-4">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                {t.treatments.periodLabel}
              </span>
              <input
                type="text"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                placeholder={t.treatments.periodPlaceholder}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </label>

            {/* Prescribed By */}
            <label className="block sm:col-span-6">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                {t.treatments.prescribedByLabel}
              </span>
              <input
                type="text"
                value={prescribedBy}
                onChange={(e) => {
                  setPrescribedBy(e.target.value);
                  setFormError(null);
                }}
                placeholder={t.treatments.prescribedByPlaceholder}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </label>

            {/* Linked Discharge / Examination */}
            <label className="block sm:col-span-6">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                {t.treatments.linkedRecordLabel}
              </span>
              <select
                value={linkedRecordId}
                onChange={(e) => {
                  const nextId = e.target.value;
                  setLinkedRecordId(nextId);
                  // Auto-fill period from selected discharge if period is still empty
                  if (nextId && !period.trim()) {
                    const rec = recordById.get(nextId);
                    if (rec && rec.date && rec.date !== '—') {
                      setPeriod(rec.date);
                    }
                  }
                }}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-sky-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="">{t.treatments.linkedRecordNone}</option>
                {dischargeRecords.length > 0 && (
                  <optgroup label={t.treatments.linkedRecordDischargesGroup}>
                    {dischargeRecords.map((rec) => (
                      <option key={rec.id} value={rec.id}>
                        {formatRecordOptionLabel(rec, language)}
                      </option>
                    ))}
                  </optgroup>
                )}
                {otherRecords.length > 0 && (
                  <optgroup label={t.treatments.linkedRecordOtherGroup}>
                    {otherRecords.map((rec) => (
                      <option key={rec.id} value={rec.id}>
                        {formatRecordOptionLabel(rec, language)}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </label>

            {/* Dynamic Medications Rows */}
            <div className="sm:col-span-12">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t.treatments.medicationsLabel}
                </span>
                <button
                  type="button"
                  onClick={handleAddMedRow}
                  className="inline-flex items-center gap-1 rounded-md border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700 transition-colors hover:bg-sky-100 dark:border-cyan-800 dark:bg-cyan-950/40 dark:text-cyan-300 dark:hover:bg-cyan-950/70"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {t.treatments.addMedication}
                </button>
              </div>

              {medications.length === 0 ? (
                <p className="mt-2 rounded-lg border border-dashed border-slate-200 px-3 py-3 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  {t.treatments.noMedications}
                </p>
              ) : (
                <div className="mt-2 space-y-2">
                  {/* Column headers on md+ */}
                  <div className="hidden grid-cols-12 gap-2 px-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 md:grid">
                    <div className="col-span-4">{t.treatments.medName}</div>
                    <div className="col-span-2">{t.treatments.medDosage}</div>
                    <div className="col-span-3">{t.treatments.medSchedule}</div>
                    <div className="col-span-2">{t.treatments.medDuration}</div>
                    <div className="col-span-1" />
                  </div>

                  {medications.map((med) => (
                    <div
                      key={med.id}
                      className="grid grid-cols-1 gap-2 rounded-lg border border-slate-200/80 bg-slate-50/70 p-2.5 dark:border-slate-800 dark:bg-slate-800/40 md:grid-cols-12 md:items-center md:border-0 md:bg-transparent md:p-0 dark:md:bg-transparent"
                    >
                      <input
                        type="text"
                        value={med.name}
                        onChange={(e) => {
                          handleMedChange(med.id, 'name', e.target.value);
                          setFormError(null);
                        }}
                        placeholder={t.treatments.medNamePlaceholder}
                        aria-label={t.treatments.medName}
                        className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 md:col-span-4"
                      />
                      <input
                        type="text"
                        value={med.dosage}
                        onChange={(e) => handleMedChange(med.id, 'dosage', e.target.value)}
                        placeholder={t.treatments.medDosagePlaceholder}
                        aria-label={t.treatments.medDosage}
                        className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 md:col-span-2"
                      />
                      <input
                        type="text"
                        value={med.schedule}
                        onChange={(e) => handleMedChange(med.id, 'schedule', e.target.value)}
                        placeholder={t.treatments.medSchedulePlaceholder}
                        aria-label={t.treatments.medSchedule}
                        className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 md:col-span-3"
                      />
                      <input
                        type="text"
                        value={med.duration}
                        onChange={(e) => handleMedChange(med.id, 'duration', e.target.value)}
                        placeholder={t.treatments.medDurationPlaceholder}
                        aria-label={t.treatments.medDuration}
                        className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 md:col-span-2"
                      />
                      <div className="flex justify-end md:col-span-1">
                        <button
                          type="button"
                          onClick={() => handleRemoveMedRow(med.id)}
                          aria-label={t.treatments.removeMedication}
                          title={t.treatments.removeMedication}
                          className="rounded-md border border-slate-200 bg-white p-1.5 text-slate-400 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-rose-900 dark:hover:bg-rose-950/50 dark:hover:text-rose-300"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Physiotherapy & Recommendations */}
            <label className="block sm:col-span-12">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                {t.treatments.proceduresLabel}
              </span>
              <textarea
                rows={2}
                value={procedures}
                onChange={(e) => {
                  setProcedures(e.target.value);
                  setFormError(null);
                }}
                placeholder={t.treatments.proceduresPlaceholder}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </label>
          </div>

          {formError && (
            <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {formError}
            </p>
          )}

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

      {/* Empty State or Populated Courses List */}
      {treatments.length === 0 ? (
        <section className="rounded-xl border border-slate-200/90 bg-white px-6 py-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-sky-50 text-sky-600 dark:bg-cyan-950/60 dark:text-cyan-400">
            <Pill className="h-5 w-5" />
          </div>
          <h2 className="mt-3 text-base font-bold text-slate-900 dark:text-slate-100">
            {t.treatments.emptyTitle}
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            {t.treatments.emptyBody}
          </p>
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={openAddForm}
              className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-sky-700"
            >
              <Plus className="h-3.5 w-3.5" />
              {t.treatments.addCourse}
            </button>
          </div>
        </section>
      ) : (
        <>
          {/* Filter & Search Toolbar */}
          <div className="flex flex-col gap-3 rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t.treatments.searchPlaceholder}
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
                  {t.treatments.totalCount} {filteredCourses.length}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-3 dark:border-slate-800">
              {(
                [
                  { id: 'all', label: t.treatments.filterAll, count: counts.all },
                  { id: 'active', label: t.treatments.filterActive, count: counts.active },
                  { id: 'inpatient', label: t.treatments.filterInpatient, count: counts.inpatient },
                  { id: 'outpatient', label: t.treatments.filterOutpatient, count: counts.outpatient },
                ] as Array<{ id: TreatmentFilter; label: string; count: number }>
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilter(tab.id)}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                    filter === tab.id
                      ? 'bg-slate-900 text-white dark:bg-cyan-600'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-white'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </div>

          {/* Courses Cards */}
          {filteredCourses.length === 0 ? (
            <div className="rounded-xl border border-slate-200/90 bg-white p-8 text-center text-sm text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
              {t.treatments.emptySearch}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCourses.map((course) => {
                const linkedRec = course.linkedRecordId
                  ? recordById.get(course.linkedRecordId)
                  : undefined;

                return (
                  <article
                    key={course.id}
                    className={`overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900 ${
                      course.status === 'active'
                        ? 'border-l-4 border-l-emerald-500 dark:border-l-emerald-500'
                        : ''
                    }`}
                  >
                    <div className="p-4 sm:p-5">
                      {/* Card Header Row */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span
                              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${courseTypeBadgeClasses(
                                course.courseType,
                              )}`}
                            >
                              {t.treatments.courseTypes[course.courseType]}
                            </span>

                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${statusBadgeClasses(
                                course.status,
                              )}`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  course.status === 'active'
                                    ? 'bg-emerald-500'
                                    : 'bg-slate-400 dark:bg-slate-500'
                                }`}
                              />
                              {t.treatments.statuses[course.status]}
                            </span>

                            {course.period && course.period !== '—' && (
                              <span className="font-mono text-xs text-slate-500 tabular-nums dark:text-slate-400">
                                {course.period}
                              </span>
                            )}
                          </div>

                          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                            <h3 className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-900 dark:text-slate-100 sm:text-base">
                              <Stethoscope className="h-4 w-4 shrink-0 text-sky-600 dark:text-cyan-400" />
                              {course.prescribedBy || t.treatments.courseTypes[course.courseType]}
                            </h3>

                            {linkedRec && (
                              <button
                                type="button"
                                onClick={() => setActiveSection('records')}
                                className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-700 transition-colors hover:border-sky-300 hover:text-sky-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-cyan-500 dark:hover:text-cyan-300"
                              >
                                <FileText className="h-3 w-3 shrink-0 text-slate-400" />
                                <span className="text-slate-500 dark:text-slate-400">
                                  {t.treatments.linkedRecordPrefix}
                                </span>
                                <span className="truncate max-w-[260px]">
                                  {formatRecordOptionLabel(linkedRec, language)}
                                </span>
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditForm(course)}
                            aria-label={t.actions.edit}
                            className="rounded-md border border-slate-200 bg-white p-1.5 text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTargetId(course.id)}
                            aria-label={t.actions.delete}
                            className="rounded-md border border-slate-200 bg-white p-1.5 text-slate-500 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-rose-900 dark:hover:bg-rose-950/50 dark:hover:text-rose-300"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Medications Table */}
                      {course.medications.length > 0 && (
                        <div className="mt-3.5 overflow-x-auto rounded-lg border border-slate-200/80 dark:border-slate-800">
                          <table className="w-full border-collapse text-left text-xs">
                            <thead>
                              <tr className="border-b border-slate-200 bg-slate-50/90 text-[11px] font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-800/70 dark:text-slate-300">
                                <th className="px-3 py-2">{t.treatments.medName}</th>
                                <th className="px-3 py-2 whitespace-nowrap">{t.treatments.medDosage}</th>
                                <th className="px-3 py-2">{t.treatments.medSchedule}</th>
                                <th className="px-3 py-2 whitespace-nowrap">{t.treatments.medDuration}</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                              {course.medications.map((med) => (
                                <tr
                                  key={med.id}
                                  className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30"
                                >
                                  <td className="px-3 py-2 font-semibold text-slate-900 dark:text-slate-100">
                                    {med.name || '—'}
                                  </td>
                                  <td className="px-3 py-2 font-mono text-slate-700 tabular-nums dark:text-slate-300 whitespace-nowrap">
                                    {med.dosage || '—'}
                                  </td>
                                  <td className="px-3 py-2 text-slate-700 dark:text-slate-300">
                                    {med.schedule || '—'}
                                  </td>
                                  <td className="px-3 py-2 font-mono text-slate-600 tabular-nums dark:text-slate-400 whitespace-nowrap">
                                    {med.duration || '—'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Physiotherapy & Recommendations */}
                      {course.proceduresAndRecommendations && (
                        <div className="mt-3 rounded-lg border border-sky-100 bg-sky-50/50 px-3 py-2.5 text-xs leading-relaxed text-slate-700 dark:border-cyan-950/80 dark:bg-cyan-950/25 dark:text-slate-300">
                          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-sky-800 dark:text-cyan-300">
                            <Sparkles className="h-3.5 w-3.5 shrink-0" />
                            {t.treatments.proceduresLabel}
                          </div>
                          <p className="mt-1 whitespace-pre-line">
                            {course.proceduresAndRecommendations}
                          </p>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}

      <ConfirmModal
        open={Boolean(deleteTargetId)}
        title={t.treatments.deleteConfirmTitle}
        body={t.treatments.deleteConfirmBody}
        confirmLabel={t.actions.delete}
        cancelLabel={t.actions.cancel}
        danger
        onConfirm={() => {
          if (deleteTargetId) deleteTreatment(deleteTargetId);
          setDeleteTargetId(null);
        }}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
