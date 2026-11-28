import React, { useState } from 'react';
import { Check, Plus, Trash2, Calendar } from 'lucide-react';
import { useMedicalArchive } from '../context/MedicalArchiveContext';

export const FollowUpChecklistCard: React.FC = () => {
  const { t, followUpPlan, addFollowUpTask, toggleFollowUpTask, deleteFollowUpTask } =
    useMedicalArchive();

  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');

  const completedCount = followUpPlan.filter((item) => item.completed).length;
  const totalCount = followUpPlan.length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addFollowUpTask(newTitle, newDate);
    setNewTitle('');
    setNewDate('');
  };

  return (
    <section
      id="follow-up-plan-card"
      className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-200 pb-3.5 dark:border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            {t.followUp.sectionTitle}
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {t.followUp.sectionSubtitle}
          </p>
        </div>
        {totalCount > 0 && (
          <div className="font-mono text-xs text-slate-500 tabular-nums dark:text-slate-400">
            {completedCount} / {totalCount} {t.followUp.completedOf}
          </div>
        )}
      </div>

      {/* Inline Quick Add Form */}
      <form
        onSubmit={handleSubmit}
        className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center"
      >
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder={t.followUp.inputPlaceholder}
          className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
        />
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-36 sm:flex-none">
            <Calendar className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              placeholder={t.followUp.datePlaceholder}
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pr-2.5 pl-8 font-mono text-xs text-slate-900 placeholder:font-sans placeholder:text-slate-400 focus:border-sky-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
          </div>
          <button
            type="submit"
            disabled={!newTitle.trim()}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-sky-600 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap"
          >
            <Plus className="h-3.5 w-3.5" />
            {t.followUp.addBtn}
          </button>
        </div>
      </form>

      {/* Checklist Items */}
      {followUpPlan.length === 0 ? (
        <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">{t.followUp.emptyText}</p>
      ) : (
        <ul className="mt-4 divide-y divide-slate-100 dark:divide-slate-800/80">
          {followUpPlan.map((task) => (
            <li
              key={task.id}
              className="flex items-start justify-between gap-3 py-2.5 first:pt-1 last:pb-0"
            >
              <button
                type="button"
                onClick={() => toggleFollowUpTask(task.id)}
                aria-label={
                  task.completed ? t.followUp.markUndoneLabel : t.followUp.markDoneLabel
                }
                className="group flex min-w-0 flex-1 items-start gap-3 text-left"
              >
                <span
                  className={`mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded border transition-colors ${
                    task.completed
                      ? 'border-emerald-600 bg-emerald-600 text-white dark:border-emerald-500 dark:bg-emerald-500'
                      : 'border-slate-300 bg-white group-hover:border-sky-500 dark:border-slate-600 dark:bg-slate-800 dark:group-hover:border-cyan-400'
                  }`}
                >
                  {task.completed && <Check className="h-3 w-3 stroke-[3]" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={`block text-sm leading-snug transition-colors ${
                      task.completed
                        ? 'text-slate-400 line-through dark:text-slate-500'
                        : 'font-medium text-slate-800 dark:text-slate-100'
                    }`}
                  >
                    {task.title}
                  </span>
                </span>
              </button>

              <div className="flex shrink-0 items-center gap-2">
                {task.targetDate && (
                  <span
                    className={`font-mono text-xs tabular-nums ${
                      task.completed
                        ? 'text-slate-400 dark:text-slate-600'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {task.targetDate}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => deleteFollowUpTask(task.id)}
                  aria-label={t.followUp.deleteLabel}
                  title={t.followUp.deleteLabel}
                  className="rounded p-1 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50 dark:hover:text-rose-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
