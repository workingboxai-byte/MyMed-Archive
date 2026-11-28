import React, { useEffect, useState } from 'react';
import { Pencil, Check, X, ArrowUpRight } from 'lucide-react';
import { useMedicalArchive } from '../context/MedicalArchiveContext';
import { COMPLAINT_TO_MRI_SEGMENTS } from '../data/spineSegmentsData';
import { ComplaintZone, ComplaintZoneKey, PatientProfile } from '../types/medical';
import { PersonalVaultCard, ProfilePinSecurityPanel } from './PersonalVaultCard';

const ZONE_ORDER: ComplaintZoneKey[] = [
  'lumbar_sacral',
  'thoracic',
  'cervical_head',
  'right_side_spasms_load',
];

const ZONE_ACCENT: Record<ComplaintZoneKey, string> = {
  lumbar_sacral:
    'border-l-4 border-l-rose-500 bg-rose-50/35 dark:border-l-rose-500 dark:bg-rose-950/15',
  thoracic:
    'border-l-4 border-l-amber-500 bg-amber-50/35 dark:border-l-amber-500 dark:bg-amber-950/15',
  cervical_head:
    'border-l-4 border-l-sky-500 bg-sky-50/35 dark:border-l-sky-500 dark:bg-sky-950/15',
  right_side_spasms_load:
    'border-l-4 border-l-teal-500 bg-teal-50/35 dark:border-l-teal-500 dark:bg-teal-950/15',
};

export const AnamnesisView: React.FC = () => {
  const {
    language,
    privacyMode,
    togglePrivacyMode,
    hasPin,
    t,
    meta,
    profile,
    complaints,
    updateProfile,
    updateComplaint,
    jumpToMriSegment,
  } = useMedicalArchive();

  const [editingProfile, setEditingProfile] = useState(false);
  const [profileDraft, setProfileDraft] = useState<PatientProfile>(profile);
  const [editingZone, setEditingZone] = useState<ComplaintZoneKey | null>(null);
  const [zoneDraftText, setZoneDraftText] = useState('');
  const [pinTriggerMode, setPinTriggerMode] = useState<'setup' | null>(null);

  useEffect(() => {
    if (privacyMode && editingProfile) {
      setEditingProfile(false);
    }
  }, [privacyMode, editingProfile]);

  const currentYear = 2026;
  const age = Math.max(0, currentYear - profile.birth_year);

  const bmiValue =
    profile.height_cm && profile.weight_kg && profile.height_cm > 0
      ? profile.weight_kg / Math.pow(profile.height_cm / 100, 2)
      : null;

  const getBmiLabel = (bmi: number) => {
    if (bmi < 18.5) return t.anamnesis.bmiCategories.under;
    if (bmi < 25) return t.anamnesis.bmiCategories.normal;
    if (bmi < 30) return t.anamnesis.bmiCategories.over;
    return t.anamnesis.bmiCategories.obese;
  };

  const fullName =
    (language === 'uk'
      ? profile.full_name_uk
      : language === 'ru'
      ? profile.full_name_ru
      : profile.full_name_en) || t.patientShort;

  const regionName =
    language === 'uk'
      ? profile.region_uk
      : language === 'ru'
      ? profile.region_ru
      : profile.region_en;

  const blurClass = privacyMode ? 'blur-[5px] select-none transition-all' : 'transition-all';

  const startProfileEdit = () => {
    if (privacyMode && hasPin) {
      togglePrivacyMode();
      return;
    }
    setProfileDraft(profile);
    setEditingProfile(true);
  };

  const handleRequestPinSetupFromVault = () => {
    setPinTriggerMode('setup');
    const el = document.getElementById('profile-pin-security');
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleDraftNameChange = (val: string) => {
    if (language === 'uk') setProfileDraft({ ...profileDraft, full_name_uk: val });
    else if (language === 'ru') setProfileDraft({ ...profileDraft, full_name_ru: val });
    else setProfileDraft({ ...profileDraft, full_name_en: val });
  };

  const handleDraftRegionChange = (val: string) => {
    if (language === 'uk') setProfileDraft({ ...profileDraft, region_uk: val });
    else if (language === 'ru') setProfileDraft({ ...profileDraft, region_ru: val });
    else setProfileDraft({ ...profileDraft, region_en: val });
  };

  const draftNameValue =
    language === 'uk'
      ? profileDraft.full_name_uk
      : language === 'ru'
      ? profileDraft.full_name_ru
      : profileDraft.full_name_en;

  const draftRegionValue =
    language === 'uk'
      ? profileDraft.region_uk
      : language === 'ru'
      ? profileDraft.region_ru
      : profileDraft.region_en;

  const saveProfileEdit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(profileDraft);
    setEditingProfile(false);
  };

  const startComplaintEdit = (key: ComplaintZoneKey) => {
    const zone = complaints[key];
    const text =
      language === 'uk'
        ? zone.summary_uk
        : language === 'ru'
        ? zone.summary_ru
        : zone.summary_en;
    setZoneDraftText(text);
    setEditingZone(key);
  };

  const saveComplaintEdit = (key: ComplaintZoneKey) => {
    const existing: ComplaintZone = complaints[key];
    const updated: ComplaintZone = { ...existing };
    if (language === 'uk') updated.summary_uk = zoneDraftText.trim();
    else if (language === 'ru') updated.summary_ru = zoneDraftText.trim();
    else updated.summary_en = zoneDraftText.trim();
    updateComplaint(key, updated);
    setEditingZone(null);
  };

  const parseNullableNumber = (val: string): number | null => {
    const trimmed = val.trim();
    if (!trimmed) return null;
    const num = Number(trimmed);
    return Number.isFinite(num) && num > 0 ? num : null;
  };

  const parseNullableText = (val: string): string | null => {
    const trimmed = val.trim();
    return trimmed ? trimmed : null;
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-2xl">
            {t.anamnesis.sectionTitle}
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {t.anamnesis.sectionSubtitle}
          </p>
        </div>
        <div className="font-mono text-xs text-slate-500 tabular-nums dark:text-slate-400">
          JSON v{meta.schema_version} · {meta.exported_at}
        </div>
      </div>

      {/* Patient Profile & Editable Clinical Baseline */}
      <section className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {t.anamnesis.profileTitle}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              <span className={blurClass}>{fullName}</span> · {profile.birth_year} ({age}{' '}
              {t.anamnesis.ageSuffix})
              {regionName ? (
                <>
                  {' '}
                  · <span className={blurClass}>{regionName}</span>
                </>
              ) : null}
            </p>
          </div>

          {!editingProfile && (
            <button
              type="button"
              onClick={startProfileEdit}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 whitespace-nowrap"
            >
              <Pencil className="h-3.5 w-3.5" />
              {t.anamnesis.editProfile}
            </button>
          )}
        </div>

        {!editingProfile ? (
          <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
            <ProfileField label={t.anamnesis.fullName} value={fullName} blur={privacyMode} />
            <ProfileField
              label={t.anamnesis.birthYear}
              value={`${profile.birth_year} (${age} ${t.anamnesis.ageSuffix})`}
              mono
            />
            <ProfileField
              label={t.anamnesis.region}
              value={regionName || null}
              emptyText={t.anamnesis.notSpecified}
              blur={privacyMode && Boolean(regionName)}
            />
            <ProfileField
              label={t.anamnesis.bloodType}
              value={profile.blood_type}
              emptyText={t.anamnesis.notSpecified}
              mono
            />

            <ProfileField
              label={t.anamnesis.height}
              value={profile.height_cm ? `${profile.height_cm} ${t.anamnesis.cmUnit}` : null}
              emptyText={t.anamnesis.notSpecified}
              mono
            />
            <ProfileField
              label={t.anamnesis.weight}
              value={profile.weight_kg ? `${profile.weight_kg} ${t.anamnesis.kgUnit}` : null}
              emptyText={t.anamnesis.notSpecified}
              mono
            />
            <ProfileField
              label={t.anamnesis.bmi}
              value={bmiValue ? `${bmiValue.toFixed(1)} (${getBmiLabel(bmiValue)})` : null}
              emptyText={t.anamnesis.notSpecified}
              mono
            />
            <ProfileField
              label={t.anamnesis.allergies}
              value={profile.allergies}
              emptyText={t.anamnesis.notSpecified}
            />

            <div className="sm:col-span-2">
              <ProfileField
                label={t.anamnesis.chronicConditions}
                value={profile.chronic_conditions}
                emptyText={t.anamnesis.notSpecified}
              />
            </div>
            <div className="sm:col-span-2">
              <ProfileField
                label={t.anamnesis.currentMedications}
                value={profile.current_medications}
                emptyText={t.anamnesis.notSpecified}
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-4">
              <ProfileField
                label={t.anamnesis.vaccinations}
                value={profile.vaccinations}
                emptyText={t.anamnesis.notSpecified}
              />
            </div>
          </div>
        ) : (
          <form onSubmit={saveProfileEdit} className="mt-5 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <label className="block sm:col-span-2">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  {t.anamnesis.fullName}
                </span>
                <input
                  type="text"
                  value={draftNameValue}
                  onChange={(e) => handleDraftNameChange(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-sky-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </label>

              <label className="block">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  {t.anamnesis.birthYear}
                </span>
                <input
                  type="number"
                  min={1920}
                  max={2026}
                  value={profileDraft.birth_year}
                  onChange={(e) =>
                    setProfileDraft({
                      ...profileDraft,
                      birth_year: Number(e.target.value) || 1980,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-900 focus:border-sky-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </label>

              <label className="block">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  {t.anamnesis.region}
                </span>
                <input
                  type="text"
                  value={draftRegionValue}
                  onChange={(e) => handleDraftRegionChange(e.target.value)}
                  placeholder={t.anamnesis.notSpecified}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-sky-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </label>

              <label className="block">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  {t.anamnesis.height} ({t.anamnesis.cmUnit})
                </span>
                <input
                  type="number"
                  min={50}
                  max={250}
                  step="1"
                  value={profileDraft.height_cm ?? ''}
                  onChange={(e) =>
                    setProfileDraft({ ...profileDraft, height_cm: parseNullableNumber(e.target.value) })
                  }
                  placeholder="178"
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-900 focus:border-sky-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </label>

              <label className="block">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  {t.anamnesis.weight} ({t.anamnesis.kgUnit})
                </span>
                <input
                  type="number"
                  min={25}
                  max={250}
                  step="0.5"
                  value={profileDraft.weight_kg ?? ''}
                  onChange={(e) =>
                    setProfileDraft({ ...profileDraft, weight_kg: parseNullableNumber(e.target.value) })
                  }
                  placeholder="80"
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-900 focus:border-sky-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </label>

              <label className="block">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  {t.anamnesis.bloodType}
                </span>
                <input
                  type="text"
                  value={profileDraft.blood_type ?? ''}
                  onChange={(e) =>
                    setProfileDraft({ ...profileDraft, blood_type: parseNullableText(e.target.value) })
                  }
                  placeholder="A(II) Rh+"
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-sky-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </label>

              <label className="block">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  {t.anamnesis.allergies}
                </span>
                <input
                  type="text"
                  value={profileDraft.allergies ?? ''}
                  onChange={(e) =>
                    setProfileDraft({ ...profileDraft, allergies: parseNullableText(e.target.value) })
                  }
                  placeholder={t.anamnesis.notSpecified}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-sky-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  {t.anamnesis.chronicConditions}
                </span>
                <textarea
                  rows={2}
                  value={profileDraft.chronic_conditions ?? ''}
                  onChange={(e) =>
                    setProfileDraft({
                      ...profileDraft,
                      chronic_conditions: parseNullableText(e.target.value),
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-sky-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </label>

              <label className="block">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  {t.anamnesis.currentMedications}
                </span>
                <textarea
                  rows={2}
                  value={profileDraft.current_medications ?? ''}
                  onChange={(e) =>
                    setProfileDraft({
                      ...profileDraft,
                      current_medications: parseNullableText(e.target.value),
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-sky-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </label>
            </div>

            <label className="block">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                {t.anamnesis.vaccinations}
              </span>
              <input
                type="text"
                value={profileDraft.vaccinations ?? ''}
                onChange={(e) =>
                  setProfileDraft({
                    ...profileDraft,
                    vaccinations: parseNullableText(e.target.value),
                  })
                }
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-sky-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </label>

            <div className="flex items-center justify-end gap-2 border-t border-slate-200 pt-4 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setEditingProfile(false)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <X className="h-3.5 w-3.5" />
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

        {/* PIN Protection Settings for Privacy Mode & Encrypted Personal Vault */}
        <ProfilePinSecurityPanel
          externalTriggerMode={pinTriggerMode}
          onExternalTriggerHandled={() => setPinTriggerMode(null)}
        />
      </section>

      {/* 4-Zone Clinical Complaints Grid with soft left colored accent stripes */}
      <section className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="border-b border-slate-200 pb-4 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            {t.anamnesis.complaintsTitle}
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {t.anamnesis.complaintsSubtitle}
          </p>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          {ZONE_ORDER.map((key) => {
            const zone = complaints[key];
            const zoneTitle =
              language === 'uk'
                ? zone.zone_uk
                : language === 'ru'
                ? zone.zone_ru
                : zone.zone_en;
            const zoneSummary =
              language === 'uk'
                ? zone.summary_uk
                : language === 'ru'
                ? zone.summary_ru
                : zone.summary_en;
            const linkedLevels = COMPLAINT_TO_MRI_SEGMENTS[key] || [];
            const isEditing = editingZone === key;

            return (
              <article
                key={key}
                className={`flex flex-col justify-between rounded-lg border border-slate-200/90 p-4 dark:border-slate-800 ${ZONE_ACCENT[key]}`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {zoneTitle}
                    </h3>
                    {!isEditing && (
                      <button
                        type="button"
                        onClick={() => startComplaintEdit(key)}
                        aria-label={t.anamnesis.editComplaint}
                        className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-200/70 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {!isEditing ? (
                    <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                      {zoneSummary}
                    </p>
                  ) : (
                    <div className="mt-2 space-y-2">
                      <textarea
                        rows={4}
                        value={zoneDraftText}
                        onChange={(e) => setZoneDraftText(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm leading-relaxed text-slate-900 focus:border-sky-600 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingZone(null)}
                          className="rounded-md border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        >
                          {t.actions.cancel}
                        </button>
                        <button
                          type="button"
                          onClick={() => saveComplaintEdit(key)}
                          className="rounded-md bg-sky-600 px-3 py-1 text-xs font-medium text-white hover:bg-sky-700"
                        >
                          {t.actions.save}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Direct cross-navigation links to SOR MRI segments */}
                <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-slate-200/80 pt-3 dark:border-slate-800">
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    {t.anamnesis.linkedMriLevels}
                  </span>
                  {linkedLevels.map((segId) => (
                    <button
                      key={segId}
                      type="button"
                      onClick={() => jumpToMriSegment(segId)}
                      className="inline-flex items-center gap-0.5 rounded-md border border-slate-200 bg-white px-2 py-0.5 font-mono text-[11px] font-semibold text-sky-700 transition-colors hover:border-sky-400 hover:bg-sky-50 dark:border-slate-700 dark:bg-slate-900 dark:text-cyan-400 dark:hover:border-cyan-500"
                    >
                      <span>{segId}</span>
                      <ArrowUpRight className="h-3 w-3" />
                    </button>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Clinical disclaimer */}
      <div className="rounded-xl border border-slate-200/90 bg-white px-4 py-3 text-xs leading-relaxed text-slate-600 shadow-xs dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
        <span className="font-semibold text-slate-800 dark:text-slate-200">
          {t.anamnesis.disclaimerLabel}:{' '}
        </span>
        {meta.disclaimer[language]}
      </div>

      {/* Encrypted Personal Vault (VOD / VLK / Rezerv+) at the bottom of Anamnesis & Profile */}
      <PersonalVaultCard onRequestPinSetup={handleRequestPinSetupFromVault} />
    </div>
  );
};

interface ProfileFieldProps {
  label: string;
  value: string | null;
  emptyText?: string;
  mono?: boolean;
  blur?: boolean;
}

const ProfileField: React.FC<ProfileFieldProps> = ({ label, value, emptyText, mono, blur }) => (
  <div className="border-b border-slate-100 pb-2.5 dark:border-slate-800/80">
    <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
    <div
      className={`mt-1 text-sm ${
        value
          ? `font-medium text-slate-900 dark:text-slate-100 ${mono ? 'font-mono tabular-nums' : ''} ${
              blur ? 'blur-[5px] select-none transition-all' : 'transition-all'
            }`
          : 'italic text-slate-400 dark:text-slate-500'
      }`}
    >
      {value || emptyText || '—'}
    </div>
  </div>
);
