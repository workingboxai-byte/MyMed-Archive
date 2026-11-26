import {
  AttachmentSource,
  LocalizedText,
  MedicalExamRecord,
  RawMedicalCardJson,
  RecordCategory,
} from '../types/medical';

interface KnownRecordMeta {
  title: LocalizedText;
  date: string;
  sortDate: string;
  category: RecordCategory;
}

const KNOWN_RECORDS_MAP: Record<string, KnownRecordMeta> = {
  'Ліпідограма + цукор': {
    title: {
      uk: 'Ліпідограма + глюкоза крові',
      ru: 'Липидограмма + сахар крови',
      en: 'Lipid Panel + Blood Glucose',
    },
    date: '—',
    sortDate: '2025-01-01',
    category: 'lab',
  },
  'Виписка стаціонару ПНД (23.07.2025 – 08.08.2025)': {
    title: {
      uk: 'Виписка стаціонару ПНД',
      ru: 'Выписка стационара ПНД',
      en: 'Inpatient Discharge Summary (Psychoneurological Dispensary)',
    },
    date: '23.07.2025 – 08.08.2025',
    sortDate: '2025-08-08',
    category: 'discharge',
  },
  'Виписка стаціонару невропатолог (04.03.2025 – 13.03.2025)': {
    title: {
      uk: 'Виписка стаціонару невропатолога',
      ru: 'Выписка стационара невропатолога',
      en: 'Neurology Inpatient Discharge Summary',
    },
    date: '04.03.2025 – 13.03.2025',
    sortDate: '2025-03-13',
    category: 'discharge',
  },
  'Епікриз (27.03.2025)': {
    title: {
      uk: 'Епікриз',
      ru: 'Эпикриз',
      en: 'Clinical Epicrisis',
    },
    date: '27.03.2025',
    sortDate: '2025-03-27',
    category: 'discharge',
  },
  'УЗД нирок та сечового міхура (27.03.2025)': {
    title: {
      uk: 'УЗД нирок та сечового міхура',
      ru: 'УЗИ почек и мочевого пузыря',
      en: 'Kidneys & Bladder Ultrasound',
    },
    date: '27.03.2025',
    sortDate: '2025-03-27',
    category: 'ultrasound',
  },
  'УЗД органів черевної порожнини (27.03.2025)': {
    title: {
      uk: 'УЗД органів черевної порожнини',
      ru: 'УЗИ органов брюшной полости',
      en: 'Abdominal Ultrasound',
    },
    date: '27.03.2025',
    sortDate: '2025-03-27',
    category: 'ultrasound',
  },
  'МРТ шийного відділу (25.01.2025)': {
    title: {
      uk: 'МРТ шийного відділу',
      ru: 'МРТ шейного отдела',
      en: 'Cervical Spine MRI',
    },
    date: '25.01.2025',
    sortDate: '2025-01-25',
    category: 'mri',
  },
  'МРТ грудного відділу (25.01.2025)': {
    title: {
      uk: 'МРТ грудного відділу',
      ru: 'МРТ грудного отдела',
      en: 'Thoracic Spine MRI',
    },
    date: '25.01.2025',
    sortDate: '2025-01-25',
    category: 'mri',
  },
  'МРТ поперекового відділу (25.01.2025)': {
    title: {
      uk: 'МРТ поперекового відділу',
      ru: 'МРТ поясничного отдела',
      en: 'Lumbar Spine MRI',
    },
    date: '25.01.2025',
    sortDate: '2025-01-25',
    category: 'mri',
  },
  'МРТ ШГП відділу (25.01.2025)': {
    title: {
      uk: 'МРТ шийного, грудного та поперекового відділів (ШГП)',
      ru: 'МРТ шейного, грудного и поясничного отделов (ШГП)',
      en: 'Whole Spine MRI (Cervical, Thoracic, Lumbar)',
    },
    date: '25.01.2025',
    sortDate: '2025-01-25',
    category: 'mri',
  },
  'МРТ ГП відділу (22.02.2022)': {
    title: {
      uk: 'МРТ грудного та поперекового відділів (ГП)',
      ru: 'МРТ грудного и поясничного отделов (ГП)',
      en: 'Thoracic & Lumbar Spine MRI',
    },
    date: '22.02.2022',
    sortDate: '2022-02-22',
    category: 'mri',
  },
  'МРТ ангіографія артерій голови (19.07.2025)': {
    title: {
      uk: 'МРТ-ангіографія артерій голови',
      ru: 'МРТ-ангиография артерий головы',
      en: 'Head Arteries MR Angiography (MRA)',
    },
    date: '19.07.2025',
    sortDate: '2025-07-19',
    category: 'mri',
  },
  'МРТ головного мозку (19.07.2025)': {
    title: {
      uk: 'МРТ головного мозку',
      ru: 'МРТ головного мозга',
      en: 'Brain MRI',
    },
    date: '19.07.2025',
    sortDate: '2025-07-19',
    category: 'mri',
  },
  'МРТ шийного відділу (19.10.2026)': {
    title: {
      uk: 'МРТ шийного відділу',
      ru: 'МРТ шейного отдела',
      en: 'Cervical Spine MRI',
    },
    date: '19.10.2026',
    sortDate: '2026-10-19',
    category: 'mri',
  },
  'МРТ грудного відділу (19.10.2026)': {
    title: {
      uk: 'МРТ грудного відділу',
      ru: 'МРТ грудного отдела',
      en: 'Thoracic Spine MRI',
    },
    date: '19.10.2026',
    sortDate: '2026-10-19',
    category: 'mri',
  },
  'МРТ поперекового відділу (19.10.2026)': {
    title: {
      uk: 'МРТ поперекового відділу',
      ru: 'МРТ поясничного отдела',
      en: 'Lumbar Spine MRI',
    },
    date: '19.10.2026',
    sortDate: '2026-10-19',
    category: 'mri',
  },
  'УЗД судин шиї та голови (04.08.2025)': {
    title: {
      uk: 'УЗД судин шиї та голови',
      ru: 'УЗИ сосудов шеи и головы',
      en: 'Neck & Head Vessels Doppler Ultrasound',
    },
    date: '04.08.2025',
    sortDate: '2025-08-04',
    category: 'ultrasound',
  },
  'УЗД судин верхніх кінцівок (04.08.2025)': {
    title: {
      uk: 'УЗД судин верхніх кінцівок',
      ru: 'УЗИ сосудов верхних конечностей',
      en: 'Upper Extremity Vessels Ultrasound',
    },
    date: '04.08.2025',
    sortDate: '2025-08-04',
    category: 'ultrasound',
  },
  'УЗД вен нижніх кінцівок (04.08.2025)': {
    title: {
      uk: 'УЗД вен нижніх кінцівок',
      ru: 'УЗИ вен нижних конечностей',
      en: 'Lower Extremity Veins Ultrasound',
    },
    date: '04.08.2025',
    sortDate: '2025-08-04',
    category: 'ultrasound',
  },
  'УЗД артерій нижніх кінцівок (04.08.2025)': {
    title: {
      uk: 'УЗД артерій нижніх кінцівок',
      ru: 'УЗИ артерий нижних конечностей',
      en: 'Lower Extremity Arteries Ultrasound',
    },
    date: '04.08.2025',
    sortDate: '2025-08-04',
    category: 'ultrasound',
  },
};

export function inferCategoryFromText(text: string): RecordCategory {
  const lower = text.toLowerCase();
  if (
    lower.includes('мрт') ||
    lower.includes('mri') ||
    lower.includes('mra') ||
    lower.includes('ангіограф') ||
    lower.includes('ангиограф') ||
    lower.includes('sor')
  ) {
    return 'mri';
  }
  if (
    lower.includes('узд') ||
    lower.includes('узи') ||
    lower.includes('ultrasound') ||
    lower.includes('допплер') ||
    lower.includes('доплер') ||
    lower.includes('дуплекс')
  ) {
    return 'ultrasound';
  }
  if (
    lower.includes('виписк') ||
    lower.includes('выписк') ||
    lower.includes('епікриз') ||
    lower.includes('эпикриз') ||
    lower.includes('консультац') ||
    lower.includes('висновок') ||
    lower.includes('заключен') ||
    lower.includes('discharge') ||
    lower.includes('epicrisis')
  ) {
    return 'discharge';
  }
  if (
    lower.includes('ліпід') ||
    lower.includes('липид') ||
    lower.includes('цукор') ||
    lower.includes('сахар') ||
    lower.includes('глюкоз') ||
    lower.includes('аналіз') ||
    lower.includes('анализ') ||
    lower.includes('кров') ||
    lower.includes('біохім') ||
    lower.includes('биохим') ||
    lower.includes('гормон') ||
    lower.includes('lab') ||
    lower.includes('blood')
  ) {
    return 'lab';
  }
  return 'other';
}

export function extractSortDate(raw: string): string {
  const matches = raw.match(/(\d{2})\.(\d{2})\.(\d{4})/g);
  if (matches && matches.length > 0) {
    const last = matches[matches.length - 1];
    const [dd, mm, yyyy] = last.split('.');
    return `${yyyy}-${mm}-${dd}`;
  }
  const isoMatch = raw.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) return isoMatch[0];
  const yearMatch = raw.match(/\b(19\d{2}|20\d{2})\b/);
  if (yearMatch) return `${yearMatch[1]}-01-01`;
  return '2025-01-01';
}

export function formatRecordDateDisplay(rawDate: string): string {
  const trimmed = rawDate.trim();
  if (!trimmed) return '—';
  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    return `${isoMatch[3]}.${isoMatch[2]}.${isoMatch[1]}`;
  }
  return trimmed;
}

const SPLIT_SPINE_MRI_GROUPS: Array<{
  sourceKeys: string[];
  items: Array<{ id: string; key: string }>;
}> = [
  {
    sourceKeys: ['МРТ ШГП відділу (25.01.2025)'],
    items: [
      { id: 'rec-mri-cervical-2025', key: 'МРТ шийного відділу (25.01.2025)' },
      { id: 'rec-mri-thoracic-2025', key: 'МРТ грудного відділу (25.01.2025)' },
      { id: 'rec-mri-lumbar-2025', key: 'МРТ поперекового відділу (25.01.2025)' },
    ],
  },
  {
    sourceKeys: ['МРТ ШГП відділу (07.05.2024)'],
    items: [
      { id: 'rec-mri-cervical-2026', key: 'МРТ шийного відділу (19.10.2026)' },
      { id: 'rec-mri-thoracic-2026', key: 'МРТ грудного відділу (19.10.2026)' },
      { id: 'rec-mri-lumbar-2026', key: 'МРТ поперекового відділу (19.10.2026)' },
    ],
  },
  {
    sourceKeys: ['МРТ шийного відділу (07.05.2024)'],
    items: [{ id: 'rec-mri-cervical-2026', key: 'МРТ шийного відділу (19.10.2026)' }],
  },
  {
    sourceKeys: ['МРТ грудного відділу (07.05.2024)'],
    items: [{ id: 'rec-mri-thoracic-2026', key: 'МРТ грудного відділу (19.10.2026)' }],
  },
  {
    sourceKeys: ['МРТ поперекового відділу (07.05.2024)'],
    items: [{ id: 'rec-mri-lumbar-2026', key: 'МРТ поперекового відділу (19.10.2026)' }],
  },
];

/**
 * Safely migrates existing localStorage records by:
 * 1) Splitting unmodified combined "МРТ ШГП" entries into separate Cervical / Thoracic / Lumbar records.
 * 2) Replacing erroneous baseline 07.05.2024 MRI entries with actual 19.10.2026 SOR entries.
 * Preserves any custom records, user notes, or existing attachment links without data loss.
 */
export function migrateSplitSpineMriRecords(
  records: MedicalExamRecord[],
  linkedRecordIds: Set<string>,
): MedicalExamRecord[] {
  const existingKeys = new Set(
    records.map((r) => `${r.originalIndexTitle}|${r.date}`).concat(records.map((r) => r.id)),
  );

  const result: MedicalExamRecord[] = [];
  for (const rec of records) {
    const group =
      !rec.isCustom
        ? SPLIT_SPINE_MRI_GROUPS.find((g) => g.sourceKeys.includes(rec.originalIndexTitle))
        : undefined;
    if (!group) {
      result.push(rec);
      continue;
    }

    const replacementEntries: MedicalExamRecord[] = [];
    for (const item of group.items) {
      const meta = KNOWN_RECORDS_MAP[item.key];
      if (!meta) continue;
      if (existingKeys.has(item.id) || existingKeys.has(`${item.key}|${meta.date}`)) continue;
      existingKeys.add(item.id);
      existingKeys.add(`${item.key}|${meta.date}`);
      replacementEntries.push({
        id: item.id,
        originalIndexTitle: item.key,
        title: meta.title,
        date: meta.date,
        sortDate: meta.sortDate,
        category: meta.category,
        notes: '',
      });
    }

    const hasLinksOrNotes =
      linkedRecordIds.has(rec.id) || (typeof rec.notes === 'string' && rec.notes.trim().length > 0);
    if (hasLinksOrNotes) {
      // Keep the old record so existing links/notes remain intact, and add updated entries alongside
      result.push(rec, ...replacementEntries);
    } else if (replacementEntries.length > 0) {
      result.push(...replacementEntries);
    }
    // If unmodified and target entries already exist, drop the duplicate outdated baseline entry cleanly
  }

  return result;
}

export function parseOtherRecordsIndex(indexItems: string[]): MedicalExamRecord[] {
  return indexItems.map((raw, idx) => {
    const known = KNOWN_RECORDS_MAP[raw];
    if (known) {
      return {
        id: `rec-${idx + 1}`,
        originalIndexTitle: raw,
        title: known.title,
        date: known.date,
        sortDate: known.sortDate,
        category: known.category,
        notes: '',
      };
    }

    // Normalize legacy epicrisis string cleanly on manual JSON import
    if (raw.toLowerCase().includes('епікриз') && raw.includes('27.03.2025')) {
      return {
        id: `rec-${idx + 1}`,
        originalIndexTitle: 'Епікриз (27.03.2025)',
        title: {
          uk: 'Епікриз',
          ru: 'Эпикриз',
          en: 'Clinical Epicrisis',
        },
        date: '27.03.2025',
        sortDate: '2025-03-27',
        category: 'discharge',
        notes: '',
      };
    }

    const parenMatch = raw.match(/\(([^)]+)\)\s*$/);
    const extractedDate = parenMatch ? parenMatch[1] : '—';
    const cleanTitle = parenMatch ? raw.replace(parenMatch[0], '').trim() : raw;
    return {
      id: `rec-${idx + 1}`,
      originalIndexTitle: raw,
      title: { uk: cleanTitle, ru: cleanTitle, en: cleanTitle },
      date: extractedDate,
      sortDate: extractSortDate(raw),
      category: inferCategoryFromText(raw),
      notes: '',
    };
  });
}

export function detectAttachmentSource(url: string): AttachmentSource {
  const lower = url.toLowerCase();
  if (lower.includes('drive.google.com') || lower.includes('docs.google.com')) {
    return 'gdrive';
  }
  if (
    lower.includes('dicom') ||
    lower.includes('pacs') ||
    lower.includes('dropbox.com') ||
    lower.includes('onedrive') ||
    lower.includes('mega.nz') ||
    lower.includes('icloud.com') ||
    lower.includes('box.com')
  ) {
    return 'cloud';
  }
  if (
    lower.includes('helsi') ||
    lower.includes('synevo') ||
    lower.includes('dila') ||
    lower.includes('clinic') ||
    lower.includes('portal') ||
    lower.includes('cabinet') ||
    lower.includes('patient')
  ) {
    return 'clinic';
  }
  return 'other';
}

export function parseAttachmentUrlsInput(rawText: string): string[] {
  return rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function getAttachmentUrls(item: { url?: string; urls?: string[] }): string[] {
  if (Array.isArray(item.urls) && item.urls.length > 0) {
    const cleaned = item.urls.map((u) => (typeof u === 'string' ? u.trim() : '')).filter(Boolean);
    if (cleaned.length > 0) return cleaned;
  }
  if (typeof item.url === 'string' && item.url.trim().length > 0) {
    return [item.url.trim()];
  }
  return [];
}

export function normalizeAttachmentSource(
  source: unknown,
  url?: string,
  urls?: string[],
): AttachmentSource {
  const primaryUrl = (Array.isArray(urls) && urls.find((u) => u && u.trim())) || url;
  if (primaryUrl) {
    const lower = primaryUrl.toLowerCase();
    if (lower.includes('drive.google.com') || lower.includes('docs.google.com')) {
      return 'gdrive';
    }
  }
  if (source === 'gdrive' || source === 'cloud' || source === 'clinic' || source === 'other') {
    return source;
  }
  if (primaryUrl) {
    return detectAttachmentSource(primaryUrl);
  }
  return 'other';
}

export function isValidHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export const ANONYMIZED_DEFAULT_MEDICAL_CARD: RawMedicalCardJson = {
  meta: {
    schema_version: '1.0.0',
    exported_at: '2026-11-21',
    default_language: 'uk',
    supported_languages: ['uk', 'ru', 'en'],
    purpose: 'Personal medical archive & spine MRI dynamics (SOR 2025 vs SOR 2026)',
    disclaimer: {
      uk: 'Інформація має довідково-аналітичний характер на основі наданих протоколів і не замінює очну консультацію лікаря.',
      ru: 'Информация носит справочно-аналитический характер на основе предоставленных протоколов и не заменяет очную консультацию врача.',
      en: 'Information is for reference and analytical purposes based on provided reports and does not replace an in-person physician consultation.',
    },
  },
  patient_profile: {
    full_name_ru: 'Пациент (1980)',
    full_name_uk: 'Пацієнт (1980)',
    full_name_en: 'Patient (1980)',
    birth_year: 1980,
    region_ru: '',
    region_uk: '',
    region_en: '',
    height_cm: null,
    weight_kg: null,
    blood_type: null,
    vaccinations: null,
    chronic_conditions: null,
    allergies: null,
    current_medications: null,
  },
  complaints_by_zone: {
    lumbar_sacral: {
      zone_ru: '1. Поясница (L4–L5) и крестец',
      zone_uk: '1. Поперек (L4–L5) та крижі',
      zone_en: '1. Lumbar (L4–L5) & Sacrum',
      summary_ru:
        'Ощутимый дискомфорт и боль при наклоне вперед; субъективное ощущение «шишки» недалеко от копчика; был резкий прострел в районе L4–L5 с медикаментозным лечением; небольшие тяжести поднимает аккуратно под правильным углом, иначе резкая боль.',
      summary_uk:
        "Відчутний дискомфорт і біль при нахилі вперед; суб'єктивне відчуття «гулі» неподалік куприка; був різкий простріл у ділянці L4–L5 з медикаментозним лікуванням; невеликі вантажі піднімає обережно під правильним кутом, інакше різкий біль.",
      summary_en:
        "Noticeable discomfort and pain when bending forward; subjective sensation of a 'lump' near the tailbone; history of sharp acute back pain around L4–L5 requiring medication; lifts light weights carefully at a proper angle to avoid sharp pain.",
    },
    thoracic: {
      zone_ru: '2. Грудной отдел (Th1–Th4 и спина)',
      zone_uk: '2. Грудний відділ (Th1–Th4 та спина)',
      zone_en: '2. Thoracic Spine (Th1–Th4) & Back',
      summary_ru:
        'Постоянное жжение в районе Th1–Th4; при стоячем положении без движения и легком наклоне вперед на 10–15% (например, мытье посуды) онемение наступает примерно за 5 минут и усиливается с распространением по всей спине.',
      summary_uk:
        'Постійне печіння в ділянці Th1–Th4; при стоянні без руху та легкому нахилі вперед на 10–15% (наприклад, миття посуду) оніміння виникає приблизно за 5 хвилин і посилюється з поширенням по всій спині.',
      summary_en:
        'Constant burning in the Th1–Th4 area; standing motionless with a slight 10–15% forward bend (e.g., washing dishes) triggers numbness within ~5 minutes that intensifies and spreads across the back.',
    },
    cervical_head: {
      zone_ru: '3. Шея (С4–С7) и голова',
      zone_uk: '3. Шия (С4–С7) та голова',
      zone_en: '3. Cervical Spine (C4–C7) & Head',
      summary_ru:
        'При поворотах головы в стороны слышен хруст, иногда заклинивание (ощущения на уровне С4–С7); головные боли на прежнем уровне 2–3 раза в неделю (обычно затылочная часть, иногда виски).',
      summary_uk:
        'При поворотах голови в боки чути хрускіт, інколи заклинювання (відчуття на рівні С4–С7); головний біль на попередньому рівні 2–3 рази на тиждень (зазвичай потилична ділянка, інколи скроні).',
      summary_en:
        'Audible crunching when turning head sideways, occasional locking sensations around C4–C7; headaches remain at 2–3 times per week (typically occipital, sometimes temporal).',
    },
    right_side_spasms_load: {
      zone_ru: '4. Правая сторона тела, судороги и нагрузка',
      zone_uk: '4. Права сторона тіла, судоми та навантаження',
      zone_en: '4. Right Side of Body, Cramps & Load',
      summary_ru:
        'Постоянное чувство натянутости правой стороны от шеи до правого колена; при пальпации выраженное перенапряжение правой стороны спины и мышц/жил правой ноги; ночные судороги и спазмы при неправильном сгибании правой ноги, а также спазмы в области живота преимущественно справа; боль и прострелы в районе правого колена при стартовой нагрузке на правую ногу (встать на стул, шаг через 2 ступеньки).',
      summary_uk:
        "Постійне відчуття натягнутості правої сторони від шиї до правого коліна; при пальпації виражене перенапруження правої сторони спини та м'язів/жил правої ноги; нічні судоми та спазми при неправильному згинанні правої ноги, а також спазми в ділянці живота переважно справа; біль і простріли в ділянці правого коліна при стартовому навантаженні на праву ногу (встати на стілець, крок через 2 сходинки).",
      summary_en:
        'Constant feeling of tightness along the right side from neck to right knee; palpable hypertonicity of the right back and right leg muscles/tendons; nocturnal cramps and spasms when bending the right leg awkwardly, plus abdominal spasms mainly on the right; pain/shooting sensation near the right knee on initial right-leg load (stepping onto a chair or skipping two stairs).',
    },
  },
  sor_spine_mri_comparison: {
    provider: 'SOR (Second Opinion in Radiology)',
    radiologist: '',
    scan_dates: ['2025-01-25', '2026-10-19'],
    report_dates: ['2025-02-10', '2026-10-26'],
    segments: [],
  },
  other_records_index: [
    'Ліпідограма + цукор',
    'Виписка стаціонару ПНД (23.07.2025 – 08.08.2025)',
    'Виписка стаціонару невропатолог (04.03.2025 – 13.03.2025)',
    'Епікриз (27.03.2025)',
    'УЗД нирок та сечового міхура (27.03.2025)',
    'УЗД органів черевної порожнини (27.03.2025)',
    'МРТ шийного відділу (25.01.2025)',
    'МРТ грудного відділу (25.01.2025)',
    'МРТ поперекового відділу (25.01.2025)',
    'МРТ ГП відділу (22.02.2022)',
    'МРТ ангіографія артерій голови (19.07.2025)',
    'МРТ головного мозку (19.07.2025)',
    'МРТ шийного відділу (19.10.2026)',
    'МРТ грудного відділу (19.10.2026)',
    'МРТ поперекового відділу (19.10.2026)',
    'УЗД судин шиї та голови (04.08.2025)',
    'УЗД судин верхніх кінцівок (04.08.2025)',
    'УЗД вен нижніх кінцівок (04.08.2025)',
    'УЗД артерій нижніх кінцівок (04.08.2025)',
  ],
  attachments_and_links: [],
};
