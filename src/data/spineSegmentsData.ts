import { DetailedSpineSegment, SystemicFinding, LocalizedText } from '../types/medical';

export interface MriKpiSummary {
  id: string;
  targetSegment: string;
  severity: 'critical' | 'warning' | 'info';
  kicker: LocalizedText;
  headline: LocalizedText;
  subline: LocalizedText;
}

export const MRI_KPI_SUMMARIES: MriKpiSummary[] = [
  {
    id: 'kpi-l4l5',
    targetSegment: 'L4-L5',
    severity: 'critical',
    kicker: {
      uk: 'Поперек L4–L5',
      ru: 'Поясница L4–L5',
      en: 'Lumbar L4–L5',
    },
    headline: {
      uk: 'Екструзія 5,7–6,2 мм + фрагментація',
      ru: 'Экструзия 5,7–6,2 мм + фрагментация',
      en: 'Extrusion 5.7–6.2 mm + fragmentation',
    },
    subline: {
      uk: 'Було 5,5–6 мм · Канал звужено до 10 мм',
      ru: 'Было 5,5–6 мм · Канал сужен до 10 мм',
      en: 'Was 5.5–6.0 mm · Canal narrowed to 10 mm',
    },
  },
  {
    id: 'kpi-d1d3',
    targetSegment: 'D1-D2',
    severity: 'warning',
    kicker: {
      uk: 'Грудний відділ D1–D3',
      ru: 'Грудной отдел D1–D3',
      en: 'Thoracic D1–D3',
    },
    headline: {
      uk: 'Нові протрузії D1–D2, D2–D3',
      ru: 'Новые протрузии D1–D2, D2–D3',
      en: 'New protrusions D1–D2, D2–D3',
    },
    subline: {
      uk: 'Грижі D6–D8 до 4,0–4,5 мм зберігаються',
      ru: 'Грыжи D6–D8 до 4,0–4,5 мм сохраняются',
      en: 'D6–D8 hernias 4.0–4.5 mm persist',
    },
  },
  {
    id: 'kpi-muscles',
    targetSegment: 'D1-D2',
    severity: 'critical',
    kicker: {
      uk: "М'язи справа (D1–D12)",
      ru: 'Мышцы справа (D1–D12)',
      en: 'Right shoulder muscles (D1–D12)',
    },
    headline: {
      uk: 'Зміна сигналу трапецієподібного м’яза',
      ru: 'Изменение сигнала трапециевидной мышцы',
      en: 'Trapezius & levator signal change',
    },
    subline: {
      uk: 'Можлива часткова денервація · Реком. ЕНМГ',
      ru: 'Возможная частичная денервация · Реком. ЭНМГ',
      en: 'Possible partial denervation · ENMG advised',
    },
  },
  {
    id: 'kpi-cervical',
    targetSegment: 'C4-C5',
    severity: 'info',
    kicker: {
      uk: 'Шийний відділ C2–D1',
      ru: 'Шейный отдел C2–D1',
      en: 'Cervical C2–D1',
    },
    headline: {
      uk: 'Ріст випинань та стенозу каналу',
      ru: 'Рост выпячиваний и стеноза канала',
      en: 'Progression of protrusions & stenosis',
    },
    subline: {
      uk: 'C7–D1 до 3,4 мм · Канал 9,5–12,2 мм',
      ru: 'C7–D1 до 3,4 мм · Канал 9,5–12,2 мм',
      en: 'C7–D1 up to 3.4 mm · Canal 9.5–12.2 mm',
    },
  },
];

export const SYSTEMIC_SOR_FINDINGS: SystemicFinding[] = [
  {
    id: 'sys-muscles',
    severity: 'critical',
    tag: {
      uk: '2026 (нове) · ЕНМГ',
      ru: '2026 (новое) · ЭНМГ',
      en: '2026 (new) · ENMG',
    },
    title: {
      uk: "М'язи правого плечового пояса",
      ru: 'Мышцы правого плечевого пояса',
      en: 'Right Shoulder Girdle Musculature',
    },
    body: {
      uk: "Нерівномірний сигнал від верхніх пучків правого трапецієподібного м'яза та м'яза, що піднімає лопатку, з ознаками легкої жирової дегенерації. Потребує диференціації між травмою та частковою денервацією (рекомендовано огляд травматолога та ЕНМГ).",
      ru: 'Неравномерный сигнал от верхних пучков правой трапециевидной мышцы и мышцы, поднимающей лопатку, с признаками легкой жировой дегенерации. Требует дифференциации между травмой и частичной денервацией (рекомендована консультация травматолога и ЭНМГ).',
      en: 'Heterogeneous MRI signal in the upper fibers of the right trapezius and levator scapulae muscles with mild fatty degeneration. Requires differentiation between injury and partial denervation (traumatologist evaluation and ENMG recommended).',
    },
    linkedSegments: ['D1-D2', 'D2-D3'],
  },
  {
    id: 'sys-l5-castellvi',
    severity: 'warning',
    tag: {
      uk: 'Динаміка · Castellvi IIb',
      ru: 'Динамика · Castellvi IIb',
      en: 'Progression · Castellvi IIb',
    },
    title: {
      uk: 'Сакралізація L5 та фасеткові суглоби',
      ru: 'Сакрализация L5 и фасеточные суставы',
      en: 'L5 Sacralization & Facet Spondyloarthrosis',
    },
    body: {
      uk: 'Часткова сакралізація L5 із псевдоартрозом (більш виражений справа — тип IIb за Castellvi) та спондилоартроз фасеткових суглобів 2 ст. із посиленням артрозних змін та ексудатом у суглобах L1–S1.',
      ru: 'Частичная сакрализация L5 с псевдоартрозом (более выражен справа — тип IIb по Castellvi) и спондилоартроз фасеточных суставов 2 ст. с усилением артрозных изменений и экссудатом в суставах L1–S1.',
      en: 'Partial L5 sacralization with pseudoarthrosis (more pronounced on the right — Castellvi type IIb) and grade 2 facet spondyloarthrosis with progressive arthritic changes and joint effusion across L1–S1.',
    },
    linkedSegments: ['L4-L5', 'L5-S1'],
  },
  {
    id: 'sys-kyphosis-hemangiomas',
    severity: 'info',
    tag: {
      uk: 'D1–D12 · Без значної динаміки',
      ru: 'D1–D12 · Без значимой динамики',
      en: 'D1–D12 · Stable',
    },
    title: {
      uk: 'Кіфоз, сколіоз та гемангіоми тіл хребців',
      ru: 'Кифоз, сколиоз и гемангиомы тел позвонков',
      en: 'Kyphosis, S-Scoliosis & Vertebral Hemangiomas',
    },
    body: {
      uk: 'Грудний кіфоз II ст. (до 44°, без динаміки), S-подібний сколіоз II ст. (кути 16° та 16°, було 16° та 14°). Гемангіоми в тілах D1 (13×7×9 мм), D11 (до 9 мм), D12 (до 6–7 мм) — без динаміки.',
      ru: 'Грудной кифоз II ст. (до 44°, без динамики), S-образный сколиоз II ст. (углы 16° и 16°, было 16° и 14°). Гемангиомы в телах D1 (13×7×9 мм), D11 (до 9 мм), D12 (до 6–7 мм) — без динамики.',
      en: 'Thoracic kyphosis grade II (44°, unchanged), S-shaped scoliosis grade II (16° & 16°, previously 16° & 14°). Vertebral body hemangiomas at D1 (13×7×9 mm), D11 (up to 9 mm), and D12 (6–7 mm) remain stable.',
    },
    linkedSegments: ['C7-D1', 'D6-D9', 'D10-D12'],
  },
  {
    id: 'sys-cervical-cord',
    severity: 'info',
    tag: {
      uk: 'C2–D1 · Спинний мозок інтактний',
      ru: 'C2–D1 · Спинной мозг интактен',
      en: 'C2–D1 · Spinal Cord Intact',
    },
    title: {
      uk: 'Шийна нестабільність та стан спинного мозку',
      ru: 'Шейная нестабильность и состояние спинного мозга',
      en: 'Cervical Instability & Spinal Cord Status',
    },
    body: {
      uk: 'Задній зсув хребців C3, C4, C5 на 1–2 мм зберігається стабільно; з’явився легкий лівобічний сколіоз. Спинний мозок та конус спинного мозку (на рівні L1) — без вогнищевих патологічних змін сигналу.',
      ru: 'Заднее смещение позвонков C3, C4, C5 на 1–2 мм сохраняется стабильно; появился легкий левосторонний сколиоз. Спинной мозг и конус спинного мозга (на уровне L1) — без очаговых патологических изменений сигнала.',
      en: 'Posterior displacement (retrolisthesis) of C3, C4, and C5 by 1–2 mm persists stably; mild left-sided scoliosis appeared. Spinal cord and conus medullaris (at L1 level) show no focal signal abnormalities.',
    },
    linkedSegments: ['C3-C4', 'C4-C5', 'C5-C6'],
  },
];

export const DETAILED_SPINE_SEGMENTS: DetailedSpineSegment[] = [
  // CERVICAL (C2–D1)
  {
    id: 'C2-C3',
    region: 'cervical',
    y: 42,
    status: 'negative',
    statusLabel: { uk: 'Погіршення', ru: 'Ухудшение', en: 'Progression' },
    y2025: {
      finding: {
        uk: 'Медіанне випинання диска до 2,5–3 мм',
        ru: 'Медианное выпячивание диска до 2,5–3 мм',
        en: 'Median disc protrusion up to 2.5–3.0 mm',
      },
      details: {
        uk: 'Незначна компресія дурального мішка та корінцевих воронок, більше справа.',
        ru: 'Небольшая компрессия дурального мешка и корешковых воронок, больше справа.',
        en: 'Mild compression of the dural sac and nerve root sleeves, predominantly right-sided.',
      },
      canal: {
        uk: 'Сагітальний 12,5 мм (норма від 14 мм), поперечний 26 мм (норма від 21 мм).',
        ru: 'Сагиттальный 12,5 мм (норма от 14 мм), поперечный 26 мм (норма от 21 мм).',
        en: 'Sagittal 12.5 mm (norm ≥14 mm), transverse 26 mm (norm ≥21 mm).',
      },
      roots: {
        uk: 'Компресія корінцевих воронок, більше справа.',
        ru: 'Компрессия корешковых воронок, больше справа.',
        en: 'Nerve root sleeve compression, greater on the right.',
      },
    },
    y2026: {
      finding: {
        uk: 'Медіанно-парамедіанне вправо випинання до 2,7–3 мм (було 2,5–3 мм)',
        ru: 'Медианно-парамедианное вправо выпячивание до 2,7–3 мм (было 2,5–3 мм)',
        en: 'Right median-paramedian protrusion up to 2.7–3.0 mm (was 2.5–3.0 mm)',
      },
      details: {
        uk: 'Поширення у форамінальне вікно, компресія дурального мішка та корінцевих воронок, більше справа.',
        ru: 'Распространение в фораминальное окно, компрессия дурального мешка и корешковых воронок, больше справа.',
        en: 'Foraminal extension with dural sac and nerve root compression, greater on the right.',
      },
      canal: {
        uk: 'Сагітальний 12,2 мм (норма від 14 мм), поперечний 26 мм (норма від 21 мм).',
        ru: 'Сагиттальный 12,2 мм (норма от 14 мм), поперечный 26 мм (норма от 21 мм).',
        en: 'Sagittal 12.2 mm (norm ≥14 mm), transverse 26 mm (norm ≥21 mm).',
      },
      roots: {
        uk: 'Правий корінцевий канал звужений до 1–2 мм, лівий — до 3,5 мм.',
        ru: 'Правый корешковый канал сужен до 1–2 мм, левый — до 3,5 мм.',
        en: 'Right foraminal canal narrowed to 1–2 mm, left to 3.5 mm.',
      },
    },
    deltaSummary: {
      uk: 'Невелике збільшення випинання вправо (до 2,7–3 мм) та звуження правого корінцевого каналу до 1–2 мм.',
      ru: 'Небольшой рост выпячивания вправо (до 2,7–3 мм) и сужение правого корешкового канала до 1–2 мм.',
      en: 'Slight right-sided protrusion progression (to 2.7–3.0 mm) with right neural foramen narrowed to 1–2 mm.',
    },
    metrics: { protrusion2025: 3.0, protrusion2026: 3.0, canalSagittal2025: 12.5, canalSagittal2026: 12.2, canalNormMin: 14 },
  },
  {
    id: 'C3-C4',
    region: 'cervical',
    y: 74,
    status: 'negative',
    statusLabel: { uk: 'Погіршення', ru: 'Ухудшение', en: 'Progression' },
    y2025: {
      finding: {
        uk: 'Нерівномірно циркулярне випинання до 2,2–2,5 мм; задній зсув хребця 1–2 мм',
        ru: 'Неравномерно циркулярное выпячивание до 2,2–2,5 мм; заднее смещение 1–2 мм',
        en: 'Asymmetric circular protrusion 2.2–2.5 mm; retrolisthesis 1–2 mm',
      },
      details: {
        uk: 'Компресія дурального мішка та корінцевих воронок на тлі заднього зсуву хребця.',
        ru: 'Компрессия дурального мешка и корешковых воронок на фоне заднего смещения позвонка.',
        en: 'Dural sac and nerve root sleeve compression with posterior vertebral displacement.',
      },
      canal: {
        uk: 'Сагітальний 10–11 мм (норма від 14 мм), поперечний 26 мм (норма від 21 мм).',
        ru: 'Сагиттальный 10–11 мм (норма от 14 мм), поперечный 26 мм (норма от 21 мм).',
        en: 'Sagittal 10–11 mm (norm ≥14 mm), transverse 26 mm (norm ≥21 mm).',
      },
      roots: {
        uk: 'Компресія корінцевих воронок.',
        ru: 'Компрессия корешковых воронок.',
        en: 'Nerve root sleeve compression.',
      },
    },
    y2026: {
      finding: {
        uk: 'Випинання диска до 2,5 мм (було 2,2–2,5 мм); задній зсув зберігається',
        ru: 'Выпячивание диска до 2,5 мм (было 2,2–2,5 мм); заднее смещение сохраняется',
        en: 'Disc protrusion up to 2.5 mm (was 2.2–2.5 mm); retrolisthesis persists',
      },
      details: {
        uk: 'Легке поширення в праве форамінальне вікно, компресія дурального мішка та корінців, більше справа.',
        ru: 'Легкое распространение в правое фораминальное окно, компрессия дурального мешка и корешков, больше справа.',
        en: 'Mild right foraminal extension with dural sac and root compression, predominantly right-sided.',
      },
      canal: {
        uk: 'Сагітальний 11 мм (норма від 14 мм), поперечний 26 мм (норма від 21 мм).',
        ru: 'Сагиттальный 11 мм (норма от 14 мм), поперечный 26 мм (норма от 21 мм).',
        en: 'Sagittal 11.0 mm (norm ≥14 mm), transverse 26 mm (norm ≥21 mm).',
      },
      roots: {
        uk: 'Правий корінцевий канал звужений до 2–3 мм, лівий — до 4–5 мм.',
        ru: 'Правый корешковый канал сужен до 2–3 мм, левый — до 4–5 мм.',
        en: 'Right foraminal canal narrowed to 2–3 mm, left 4–5 mm.',
      },
    },
    deltaSummary: {
      uk: 'Випинання до 2,5 мм з акцентом вправо та звуженням правого корінцевого каналу до 2–3 мм.',
      ru: 'Выпячивание до 2,5 мм с акцентом вправо и сужением правого корешкового канала до 2–3 мм.',
      en: '2.5 mm protrusion with right foraminal accent and right canal narrowing to 2–3 mm.',
    },
    metrics: { protrusion2025: 2.5, protrusion2026: 2.5, canalSagittal2025: 10.5, canalSagittal2026: 11.0, canalNormMin: 14 },
  },
  {
    id: 'C4-C5',
    region: 'cervical',
    y: 106,
    status: 'negative',
    statusLabel: { uk: 'Погіршення', ru: 'Ухудшение', en: 'Progression' },
    y2025: {
      finding: {
        uk: 'Нерівномірно циркулярне випинання до 2,2–2,5 мм; задній зсув 1–2 мм',
        ru: 'Неравномерно циркулярное выпячивание до 2,2–2,5 мм; заднее смещение 1–2 мм',
        en: 'Asymmetric circular protrusion 2.2–2.5 mm; retrolisthesis 1–2 mm',
      },
      details: {
        uk: 'Компресія дурального мішка та корінцевих воронок.',
        ru: 'Компрессия дурального мешка и корешковых воронок.',
        en: 'Dural sac and nerve root sleeve compression.',
      },
      canal: {
        uk: 'Сагітальний 10–11 мм (норма від 14 мм), поперечний 26 мм (норма від 21 мм).',
        ru: 'Сагиттальный 10–11 мм (норма от 14 мм), поперечный 26 мм (норма от 21 мм).',
        en: 'Sagittal 10–11 mm (norm ≥14 mm), transverse 26 mm (norm ≥21 mm).',
      },
      roots: {
        uk: 'Компресія корінцевих воронок.',
        ru: 'Компрессия корешковых воронок.',
        en: 'Nerve root sleeve compression.',
      },
    },
    y2026: {
      finding: {
        uk: 'Нерівномірно циркулярне випинання до 2,5 мм (більше справа)',
        ru: 'Неравномерно циркулярное выпячивание до 2,5 мм (больше справа)',
        en: 'Asymmetric circular protrusion up to 2.5 mm (predominantly right)',
      },
      details: {
        uk: 'Компресія дурального мішка та корінцевих воронок, дещо більше справа (можливо на тлі легкого сколіозу).',
        ru: 'Компрессия дурального мешка и корешковых воронок, несколько больше справа (возможно на фоне легкого сколиоза).',
        en: 'Dural sac and root compression, slightly greater on the right (possibly secondary to mild scoliosis).',
      },
      canal: {
        uk: 'Сагітальний звужено до 9,5–10 мм (норма від 14 мм), поперечний 26 мм.',
        ru: 'Сагиттальный сужен до 9,5–10 мм (норма от 14 мм), поперечный 26 мм.',
        en: 'Sagittal narrowed to 9.5–10.0 mm (norm ≥14 mm), transverse 26 mm.',
      },
      roots: {
        uk: 'Правий корінцевий канал звужений до 3 мм, лівий — до 4–5 мм.',
        ru: 'Правый корешковый канал сужен до 3 мм, левый — до 4–5 мм.',
        en: 'Right foraminal canal narrowed to 3 mm, left 4–5 mm.',
      },
    },
    deltaSummary: {
      uk: 'Виражений стеноз каналу (сагітальний розмір зменшився до 9,5–10 мм) та компресія корінців, більше справа.',
      ru: 'Выраженный стеноз канала (сагиттальный размер уменьшился до 9,5–10 мм) и компрессия корешков, больше справа.',
      en: 'Pronounced canal stenosis (sagittal narrowed to 9.5–10.0 mm) with predominantly right-sided root compression.',
    },
    metrics: { protrusion2025: 2.5, protrusion2026: 2.5, canalSagittal2025: 10.5, canalSagittal2026: 9.75, canalNormMin: 14 },
  },
  {
    id: 'C5-C6',
    region: 'cervical',
    y: 138,
    status: 'negative',
    statusLabel: { uk: 'Погіршення', ru: 'Ухудшение', en: 'Progression' },
    y2025: {
      finding: {
        uk: 'Нерівномірно циркулярне випинання до 2,2–2,5 мм; задній зсув 1–2 мм',
        ru: 'Неравномерно циркулярное выпячивание до 2,2–2,5 мм; заднее смещение 1–2 мм',
        en: 'Asymmetric circular protrusion 2.2–2.5 mm; retrolisthesis 1–2 mm',
      },
      details: {
        uk: 'Компресія дурального мішка та корінцевих воронок.',
        ru: 'Компрессия дурального мешка и корешковых воронок.',
        en: 'Dural sac and nerve root sleeve compression.',
      },
      canal: {
        uk: 'Сагітальний 10–11 мм (норма від 14 мм), поперечний 26 мм (норма від 21 мм).',
        ru: 'Сагиттальный 10–11 мм (норма от 14 мм), поперечный 26 мм (норма от 21 мм).',
        en: 'Sagittal 10–11 mm (norm ≥14 mm), transverse 26 mm (norm ≥21 mm).',
      },
      roots: {
        uk: 'Компресія корінцевих воронок.',
        ru: 'Компрессия корешковых воронок.',
        en: 'Nerve root sleeve compression.',
      },
    },
    y2026: {
      finding: {
        uk: 'Нерівномірно циркулярне випинання до 2,5 мм (більше справа)',
        ru: 'Неравномерно циркулярное выпячивание до 2,5 мм (больше справа)',
        en: 'Asymmetric circular protrusion up to 2.5 mm (predominantly right)',
      },
      details: {
        uk: 'Компресія дурального мішка та корінцевих воронок, дещо більше справа.',
        ru: 'Компрессия дурального мешка и корешковых воронок, несколько больше справа.',
        en: 'Dural sac and nerve root sleeve compression, slightly greater on the right.',
      },
      canal: {
        uk: 'Сагітальний звужено до 9,5–10 мм (норма від 14 мм), поперечний 26 мм.',
        ru: 'Сагиттальный сужен до 9,5–10 мм (норма от 14 мм), поперечный 26 мм.',
        en: 'Sagittal narrowed to 9.5–10.0 mm (norm ≥14 mm), transverse 26 mm.',
      },
      roots: {
        uk: 'Правий корінцевий канал звужений до 3 мм, лівий — до 4–5 мм.',
        ru: 'Правый корешковый канал сужен до 3 мм, левый — до 4–5 мм.',
        en: 'Right foraminal canal narrowed to 3 mm, left 4–5 mm.',
      },
    },
    deltaSummary: {
      uk: 'Зберігається випинання до 2,5 мм та вузький сагітальний канал 9,5–10 мм з акцентом справа.',
      ru: 'Сохраняется выпячивание до 2,5 мм и узкий сагиттальный канал 9,5–10 мм с акцентом справа.',
      en: 'Persistent 2.5 mm protrusion with narrow sagittal canal (9.5–10.0 mm) and right-sided predominance.',
    },
    metrics: { protrusion2025: 2.5, protrusion2026: 2.5, canalSagittal2025: 10.5, canalSagittal2026: 9.75, canalNormMin: 14 },
  },
  {
    id: 'C6-C7',
    region: 'cervical',
    y: 170,
    status: 'negative',
    statusLabel: { uk: 'Погіршення', ru: 'Ухудшение', en: 'Progression' },
    y2025: {
      finding: {
        uk: 'Медіанне випинання диска ~2,7 мм (у блоці C6–C7 / C7–D1 до 3,1 мм)',
        ru: 'Медианное выпячивание диска ~2,7 мм (в блоке C6–C7 / C7–D1 до 3,1 мм)',
        en: 'Median disc protrusion ~2.7 mm',
      },
      details: {
        uk: 'Компресія дурального мішка та корінцевих воронок.',
        ru: 'Компрессия дурального мешка и корешковых воронок.',
        en: 'Dural sac and nerve root sleeve compression.',
      },
      canal: {
        uk: 'Сагітальний 12 мм (норма від 14 мм), поперечний 26 мм (норма від 21 мм).',
        ru: 'Сагиттальный 12 мм (норма от 14 мм), поперечный 26 мм (норма от 21 мм).',
        en: 'Sagittal 12.0 mm (norm ≥14 mm), transverse 26 mm (norm ≥21 mm).',
      },
      roots: {
        uk: 'Компресія дурального мішка та корінцевих воронок.',
        ru: 'Компрессия дурального мешка и корешковых воронок.',
        en: 'Dural sac and nerve root sleeve compression.',
      },
    },
    y2026: {
      finding: {
        uk: 'Випинання диска до 2,8 мм (було 2,7 мм)',
        ru: 'Выпячивание диска до 2,8 мм (было 2,7 мм)',
        en: 'Disc protrusion up to 2.8 mm (was 2.7 mm)',
      },
      details: {
        uk: 'Компресія дурального мішка та корінцевих воронок, більше справа.',
        ru: 'Компрессия дурального мешка и корешковых воронок, больше справа.',
        en: 'Dural sac and nerve root compression, greater on the right.',
      },
      canal: {
        uk: 'Сагітальний звужено до 10 мм (норма від 14 мм), поперечний 26 мм.',
        ru: 'Сагиттальный сужен до 10 мм (норма от 14 мм), поперечный 26 мм.',
        en: 'Sagittal narrowed to 10.0 mm (norm ≥14 mm), transverse 26 mm.',
      },
      roots: {
        uk: 'Правий корінцевий канал звужений до 2–3 мм, лівий — до 3–4 мм.',
        ru: 'Правый корешковый канал сужен до 2–3 мм, левый — до 3–4 мм.',
        en: 'Right foraminal canal narrowed to 2–3 mm, left 3–4 mm.',
      },
    },
    deltaSummary: {
      uk: 'Зменшився сагітальний розмір каналу з 12 мм до 10 мм, посилилася компресія правих корінців.',
      ru: 'Уменьшился сагиттальный размер канала с 12 мм до 10 мм, усилена компрессия правых корешков.',
      en: 'Sagittal canal decreased from 12 mm to 10 mm with increased right nerve root compression.',
    },
    metrics: { protrusion2025: 2.7, protrusion2026: 2.8, canalSagittal2025: 12.0, canalSagittal2026: 10.0, canalNormMin: 14 },
  },
  {
    id: 'C7-D1',
    region: 'cervical',
    y: 202,
    status: 'new',
    statusLabel: { uk: 'Нові зміни', ru: 'Новые изменения', en: 'New Findings' },
    y2025: {
      finding: {
        uk: 'Медіанне випинання диска до 2,7–3,1 мм',
        ru: 'Медианное выпячивание диска до 2,7–3,1 мм',
        en: 'Median disc protrusion up to 2.7–3.1 mm',
      },
      details: {
        uk: 'Компресія дурального мішка. Гемангіома тіла D1 13×7×9 мм.',
        ru: 'Компрессия дурального мешка. Гемангиома тела D1 13×7×9 мм.',
        en: 'Dural sac compression. D1 vertebral body hemangioma 13×7×9 mm.',
      },
      canal: {
        uk: 'Сагітальний 12 мм (норма від 14 мм), поперечний 26 мм (норма від 21 мм).',
        ru: 'Сагиттальный 12 мм (норма от 14 мм), поперечный 26 мм (норма от 21 мм).',
        en: 'Sagittal 12.0 mm (norm ≥14 mm), transverse 26 mm (norm ≥21 mm).',
      },
      roots: {
        uk: 'Лівобічне випинання раніше не описувалося.',
        ru: 'Левостороннее выпячивание ранее не описывалось.',
        en: 'Left-sided protrusion was not present in 2025.',
      },
    },
    y2026: {
      finding: {
        uk: 'Медіанне випинання до 3,4 мм (було 3,1 мм) + нове лівобічне до 2,2 мм',
        ru: 'Медианное выпячивание до 3,4 мм (было 3,1 мм) + новое левостороннее до 2,2 мм',
        en: 'Median protrusion up to 3.4 mm (was 3.1 mm) + new left-sided 2.2 mm',
      },
      details: {
        uk: 'Компресія дурального мішка та переважно лівої корінцевої воронки; гемангіома тіла D1 13×7×9 мм без динаміки.',
        ru: 'Компрессия дурального мешка и больше левой корешковой воронки; гемангиома тела D1 13×7×9 мм без динамики.',
        en: 'Dural sac and predominantly left root sleeve compression; D1 hemangioma (13×7×9 mm) unchanged.',
      },
      canal: {
        uk: 'Сагітальний 11 мм (норма від 14 мм), поперечний 26 мм (норма від 21 мм).',
        ru: 'Сагиттальный 11 мм (норма от 14 мм), поперечный 26 мм (норма от 21 мм).',
        en: 'Sagittal 11.0 mm (norm ≥14 mm), transverse 26 mm (norm ≥21 mm).',
      },
      roots: {
        uk: 'Воронка справа 4–5 мм, зліва звужена до 1–2 мм.',
        ru: 'Воронка справа 4–5 мм, слева сужена до 1–2 мм.',
        en: 'Right neural foramen 4–5 mm, left narrowed to 1–2 mm.',
      },
    },
    deltaSummary: {
      uk: 'Зростання медіанного випинання до 3,4 мм, поява лівобічного 2,2 мм та звуження лівої воронки до 1–2 мм.',
      ru: 'Рост медианного выпячивания до 3,4 мм, появление левостороннего выпячивания 2,2 мм и сужение левой воронки до 1–2 мм.',
      en: 'Median protrusion grew to 3.4 mm with new 2.2 mm left protrusion and left foramen narrowing to 1–2 mm.',
    },
    metrics: { protrusion2025: 3.1, protrusion2026: 3.4, canalSagittal2025: 12.0, canalSagittal2026: 11.0, canalNormMin: 14 },
  },

  // THORACIC (D1–D12)
  {
    id: 'D1-D2',
    region: 'thoracic',
    y: 268,
    status: 'new',
    statusLabel: { uk: 'Нові зміни', ru: 'Новые изменения', en: 'New Findings' },
    y2025: {
      finding: {
        uk: 'Окремого випинання диска D1–D2 не описано',
        ru: 'Отдельного выпячивания диска D1–D2 не описано',
        en: 'No separate D1–D2 disc protrusion noted',
      },
      details: {
        uk: 'Зниження висоти та дегідратація дисків відзначалися на рівні D5–D10.',
        ru: 'Снижение высоты и дегидратация дисков отмечались на уровне D5–D10.',
        en: 'Disc desiccation and height loss were previously confined to D5–D10.',
      },
      canal: {
        uk: 'Без опису стенозу на рівні D1–D2.',
        ru: 'Без описания стеноза на уровне D1–D2.',
        en: 'No canal stenosis noted at D1–D2.',
      },
      roots: {
        uk: 'Компресія на цьому рівні не вказувалася.',
        ru: 'Компрессия на этом уровне не указывалась.',
        en: 'No nerve root compression reported.',
      },
    },
    y2026: {
      finding: {
        uk: 'Нове випинання диска форамінально праворуч до 2,8 мм',
        ru: 'Новое выпячивание диска фораминально вправо до 2,8 мм',
        en: 'New right foraminal disc protrusion up to 2.8 mm',
      },
      details: {
        uk: "На тлі задніх остеофітів; дегідратація дисків тепер на D1–D10. Супутні зміни сигналу правого трапецієподібного м'яза та м'яза, що піднімає лопатку (реком. ЕНМГ).",
        ru: 'На фоне задних остеофитов; дегидратация дисков теперь на D1–D10. Сопутствующие изменения сигнала правой трапециевидной мышцы и мышцы, поднимающей лопатку (реком. ЭНМГ).',
        en: 'Over posterior osteophytes; disc dehydration expanded to D1–D10. Concurrent right trapezius/levator signal changes (ENMG advised).',
      },
      canal: {
        uk: 'Сагітальний 13 мм (норма >13–14 мм), поперечний 23 мм (норма від 20 мм) — нові зміни.',
        ru: 'Сагиттальный 13 мм (норма >13–14 мм), поперечный 23 мм (норма от 20 мм) — новые изменения.',
        en: 'Sagittal 13.0 mm (norm >13–14 mm), transverse 23 mm (norm ≥20 mm) — new finding.',
      },
      roots: {
        uk: 'Компресія правої корінцевої воронки; фораміностеноз більш виражений справа.',
        ru: 'Компрессия правой корешковой воронки; фораминостеноз более выражен справа.',
        en: 'Right root sleeve compression; foraminal stenosis more pronounced on the right.',
      },
    },
    deltaSummary: {
      uk: 'Нове правобічне форамінальне випинання до 2,8 мм із компресією правої корінцевої воронки.',
      ru: 'Новое правостороннее фораминальное выпячивание до 2,8 мм с компрессией правой корешковой воронки.',
      en: 'New 2.8 mm right foraminal protrusion compressing the right nerve root sleeve.',
    },
    metrics: { protrusion2025: 0, protrusion2026: 2.8, canalSagittal2025: 15.0, canalSagittal2026: 13.0, canalNormMin: 14 },
  },
  {
    id: 'D2-D3',
    region: 'thoracic',
    y: 304,
    status: 'new',
    statusLabel: { uk: 'Нові зміни', ru: 'Новые изменения', en: 'New Findings' },
    y2025: {
      finding: {
        uk: 'Випинання міжхребцевого диска до 2,2–2,5 мм',
        ru: 'Выпячивание межпозвонкового диска до 2,2–2,5 мм',
        en: 'Intervertebral disc protrusion 2.2–2.5 mm',
      },
      details: {
        uk: 'Компресія дурального мішка та корінцевих воронок, більше зліва, на тлі задніх остеофітів.',
        ru: 'Компрессия дурального мешка и корешковых воронок, больше слева, на фоне задних остеофитов.',
        en: 'Dural sac and root compression, greater on the left, over posterior osteophytes.',
      },
      canal: {
        uk: 'Сагітальний 15 мм (норма >13–14 мм), поперечний 18 мм (норма від 20 мм).',
        ru: 'Сагиттальный 15 мм (норма >13–14 мм), поперечный 18 мм (норма от 20 мм).',
        en: 'Sagittal 15.0 mm (norm >13–14 mm), transverse 18 mm (norm ≥20 mm).',
      },
      roots: {
        uk: 'Компресія корінцевих воронок, більше зліва.',
        ru: 'Компрессия корешковых воронок, больше слева.',
        en: 'Root sleeve compression, greater on the left.',
      },
    },
    y2026: {
      finding: {
        uk: 'Біфорамінальне випинання: праворуч до 2,2 мм (нове), ліворуч до 2,5 мм',
        ru: 'Бифораминальное выпячивание: вправо до 2,2 мм (новое), влево до 2,5 мм',
        en: 'Biforaminal protrusion: right 2.2 mm (new), left 2.5 mm',
      },
      details: {
        uk: 'На тлі задніх остеофітів із новим акцентом на праву сторону.',
        ru: 'На фоне задних остеофитов с новым акцентом на правую сторону.',
        en: 'Over posterior osteophytes with shift of primary compression to the right.',
      },
      canal: {
        uk: 'Сагітальний зменшився до 13 мм, поперечний 19 мм (норма від 20 мм) — нові зміни.',
        ru: 'Сагиттальный уменьшился до 13 мм, поперечный 19 мм (норма от 20 мм) — новые изменения.',
        en: 'Sagittal narrowed to 13.0 mm, transverse 19 mm (norm ≥20 mm) — new change.',
      },
      roots: {
        uk: 'Компресія обох корінцевих воронок, більше правої.',
        ru: 'Компрессия обеих корешковых воронок, больше правой.',
        en: 'Bilateral root sleeve compression, greater on the right.',
      },
    },
    deltaSummary: {
      uk: 'З’явилося нове випинання праворуч до 2,2 мм, сагітальний канал зменшився до 13 мм, акцент компресії змістився на праву воронку.',
      ru: 'Появилось новое выпячивание вправо до 2,2 мм, сагиттальный канал уменьшился до 13 мм, акцент компрессии сместился на правую воронку.',
      en: 'New 2.2 mm right protrusion, sagittal canal narrowed to 13 mm, compression shifted predominantly right.',
    },
    metrics: { protrusion2025: 2.5, protrusion2026: 2.5, canalSagittal2025: 15.0, canalSagittal2026: 13.0, canalNormMin: 14 },
  },
  {
    id: 'D3-D4',
    region: 'thoracic',
    y: 340,
    status: 'stable',
    statusLabel: { uk: 'Стабільно', ru: 'Стабильно', en: 'Stable' },
    y2025: {
      finding: {
        uk: 'Випинання міжхребцевого диска до 2,2–2,5 мм',
        ru: 'Выпячивание межпозвонкового диска до 2,2–2,5 мм',
        en: 'Intervertebral disc protrusion 2.2–2.5 mm',
      },
      details: {
        uk: 'Компресія дурального мішка та корінцевих воронок, більше зліва, на тлі задніх остеофітів.',
        ru: 'Компрессия дурального мешка и корешковых воронок, больше слева, на фоне задних остеофитов.',
        en: 'Dural sac and root compression, greater on the left, over posterior osteophytes.',
      },
      canal: {
        uk: 'Сагітальний 15 мм, поперечний 18 мм.',
        ru: 'Сагиттальный 15 мм, поперечный 18 мм.',
        en: 'Sagittal 15.0 mm, transverse 18 mm.',
      },
      roots: {
        uk: 'Компресія корінцевих воронок, більше зліва.',
        ru: 'Компрессия корешковых воронок, больше слева.',
        en: 'Root sleeve compression, greater on the left.',
      },
    },
    y2026: {
      finding: {
        uk: 'Випинання диска до 2,2–2,4 мм',
        ru: 'Выпячивание диска до 2,2–2,4 мм',
        en: 'Disc protrusion 2.2–2.4 mm',
      },
      details: {
        uk: 'Компресія дурального мішка та корінцевих воронок, більше зліва, на тлі задніх остеофітів.',
        ru: 'Компрессия дурального мешка и корешковых воронок, больше слева, на фоне задних остеофитов.',
        en: 'Dural sac and root compression, greater on the left, over posterior osteophytes.',
      },
      canal: {
        uk: 'Сагітальний 15 мм (норма >13–14 мм), поперечний 18 мм (норма від 20 мм).',
        ru: 'Сагиттальный 15 мм (норма >13–14 мм), поперечный 18 мм (норма от 20 мм).',
        en: 'Sagittal 15.0 mm (norm >13–14 mm), transverse 18 mm (norm ≥20 mm).',
      },
      roots: {
        uk: 'Компресія корінцевих воронок, більше зліва.',
        ru: 'Компрессия корешковых воронок, больше слева.',
        en: 'Root sleeve compression, greater on the left.',
      },
    },
    deltaSummary: {
      uk: 'Розміри випинання (2,2–2,4 мм) та параметри каналу (15×18 мм) без суттєвих змін.',
      ru: 'Размеры выпячивания (2,2–2,4 мм) и параметры канала (15×18 мм) без существенных изменений.',
      en: 'Protrusion size (2.2–2.4 mm) and canal dimensions (15×18 mm) remain essentially unchanged.',
    },
    metrics: { protrusion2025: 2.5, protrusion2026: 2.4, canalSagittal2025: 15.0, canalSagittal2026: 15.0, canalNormMin: 14 },
  },
  {
    id: 'D4-D5',
    region: 'thoracic',
    y: 376,
    status: 'stable',
    statusLabel: { uk: 'Стабільно', ru: 'Стабильно', en: 'Stable' },
    y2025: {
      finding: {
        uk: 'Дегенеративно-дистрофічні зміни грудного відділу',
        ru: 'Дегенеративно-дистрофические изменения грудного отдела',
        en: 'Degenerative thoracic spine changes',
      },
      details: {
        uk: 'Остеофіти, локальне звапнення зв’язок на рівні D6–D12, склероз замикальних пластин.',
        ru: 'Остеофиты, локальное обызвествление связок на уровне D6–D12, склероз замыкательных пластин.',
        en: 'Osteophytes, focal ligament calcification at D6–D12, endplate sclerosis.',
      },
      canal: {
        uk: 'Відносний стеноз описувався в межах D2–D12.',
        ru: 'Относительный стеноз описывался в пределах D2–D12.',
        en: 'Relative stenosis described across D2–D12.',
      },
      roots: {
        uk: 'Без окремого виділення на рівні D4–D5 у 2025 р.',
        ru: 'Без отдельного выделения на уровне D4–D5 в 2025 г.',
        en: 'Not separately detailed at D4–D5 in 2025.',
      },
    },
    y2026: {
      finding: {
        uk: 'Випинання диска до 2,2–2,4 мм',
        ru: 'Выпячивание диска до 2,2–2,4 мм',
        en: 'Disc protrusion 2.2–2.4 mm',
      },
      details: {
        uk: 'Компресія дурального мішка та корінцевих воронок, більше зліва, на тлі задніх остеофітів.',
        ru: 'Компрессия дурального мешка и корешковых воронок, больше слева, на фоне задних остеофитов.',
        en: 'Dural sac and root compression, greater on the left, over posterior osteophytes.',
      },
      canal: {
        uk: 'Сагітальний 15 мм (норма >13–14 мм), поперечний 18 мм (норма від 20 мм).',
        ru: 'Сагиттальный 15 мм (норма >13–14 мм), поперечный 18 мм (норма от 20 мм).',
        en: 'Sagittal 15.0 mm (norm >13–14 mm), transverse 18 mm (norm ≥20 mm).',
      },
      roots: {
        uk: 'Компресія корінцевих воронок, більше зліва.',
        ru: 'Компрессия корешковых воронок, больше слева.',
        en: 'Root sleeve compression, greater on the left.',
      },
    },
    deltaSummary: {
      uk: 'Уточнено випинання 2,2–2,4 мм із компресією дурального мішка та корінців, більше зліва.',
      ru: 'Уточнено выпячивание 2,2–2,4 мм с компрессией дурального мешка и корешков, больше слева.',
      en: 'Detailed as 2.2–2.4 mm protrusion with predominantly left-sided dural and root compression.',
    },
    metrics: { protrusion2025: 2.2, protrusion2026: 2.4, canalSagittal2025: 15.0, canalSagittal2026: 15.0, canalNormMin: 14 },
  },
  {
    id: 'D6-D9',
    region: 'thoracic',
    y: 424,
    status: 'stable',
    statusLabel: { uk: 'Грижі до 4,5 мм', ru: 'Грыжи до 4,5 мм', en: 'Hernias up to 4.5 mm' },
    y2025: {
      finding: {
        uk: 'Грижі дисків D6–D7, D7–D8, D8–D9 до 4,5 мм',
        ru: 'Грыжи дисков D6–D7, D7–D8, D8–D9 до 4,5 мм',
        en: 'Disc herniations D6–D7, D7–D8, D8–D9 up to 4.5 mm',
      },
      details: {
        uk: 'Компресія дурального мішка та корінцевих воронок, більше справа, на тлі задніх остеофітів.',
        ru: 'Компрессия дурального мешка и корешковых воронок, больше справа, на фоне задних остеофитов.',
        en: 'Dural sac and root sleeve compression, greater on the right, over posterior osteophytes.',
      },
      canal: {
        uk: 'Сагітальний 12 мм (норма >13–14 мм), поперечний 15 мм (норма від 20 мм).',
        ru: 'Сагиттальный 12 мм (норма >13–14 мм), поперечный 15 мм (норма от 20 мм).',
        en: 'Sagittal 12.0 mm (norm >13–14 mm), transverse 15 mm (norm ≥20 mm).',
      },
      roots: {
        uk: 'Компресія корінцевих воронок, більше справа.',
        ru: 'Компрессия корешковых воронок, больше справа.',
        en: 'Root sleeve compression, greater on the right.',
      },
    },
    y2026: {
      finding: {
        uk: 'Грижі дисків D6, D7, D8 (випинання D6–D9 до 4,0–4,5 мм — дещо менші)',
        ru: 'Грыжи дисков D6, D7, D8 (выпячивания D6–D9 до 4,0–4,5 мм — несколько меньше)',
        en: 'Disc herniations D6–D8 (4.0–4.5 mm — slightly reduced)',
      },
      details: {
        uk: 'Компресія дурального мішка та корінцевих воронок, більше справа; S-сколіоз II ст. (16° і 16°, було 16° і 14°), кіфоз II ст. 44° без змін.',
        ru: 'Компрессия дурального мешка и корешковых воронок, больше справа; S-сколиоз II ст. (16° и 16°, было 16° и 14°), кифоз II ст. 44° без изменений.',
        en: 'Dural sac and root compression, greater on the right; S-scoliosis gr. II (16° & 16°, was 16° & 14°), kyphosis 44° unchanged.',
      },
      canal: {
        uk: 'Сагітальний 12 мм (норма >13–14 мм), поперечний 15 мм (норма від 20 мм).',
        ru: 'Сагиттальный 12 мм (норма >13–14 мм), поперечный 15 мм (норма от 20 мм).',
        en: 'Sagittal 12.0 mm (norm >13–14 mm), transverse 15 mm (norm ≥20 mm).',
      },
      roots: {
        uk: 'Компресія дурального мішка та корінцевих воронок, більше справа.',
        ru: 'Компрессия дурального мешка и корешковых воронок, больше справа.',
        en: 'Dural sac and root compression, greater on the right.',
      },
    },
    deltaSummary: {
      uk: 'Зберігаються грижі D6–D8 до 4,0–4,5 мм (відзначені як дещо менші), канал 12×15 мм; нижня дуга сколіозу 14° → 16°.',
      ru: 'Сохраняются грыжи D6–D8 до 4,0–4,5 мм (отмечены как несколько меньшие), канал 12×15 мм; нижняя дуга сколиоза 14° → 16°.',
      en: 'D6–D8 hernias persist at 4.0–4.5 mm (slightly smaller), canal 12×15 mm; lower scoliosis arc 14° → 16°.',
    },
    metrics: { protrusion2025: 4.5, protrusion2026: 4.25, canalSagittal2025: 12.0, canalSagittal2026: 12.0, canalNormMin: 14 },
  },
  {
    id: 'D10-D12',
    region: 'thoracic',
    y: 484,
    status: 'stable',
    statusLabel: { uk: 'Без динаміки', ru: 'Без динамики', en: 'Unchanged' },
    y2025: {
      finding: {
        uk: 'Випинання дисків D10–D11, D11–D12 до 2,5–3 мм',
        ru: 'Выпячивания дисков D10–D11, D11–D12 до 2,5–3 мм',
        en: 'Disc protrusions D10–D11, D11–D12 up to 2.5–3.0 mm',
      },
      details: {
        uk: 'Компресія дурального мішка та корінцевих воронок на тлі задніх остеофітів. Гемангіоми D11 (9 мм), D12 (6–7 мм).',
        ru: 'Компрессия дурального мешка и корешковых воронок на фоне задних остеофитов. Гемангиомы D11 (9 мм), D12 (6–7 мм).',
        en: 'Dural sac and root compression over posterior osteophytes. Hemangiomas at D11 (9 mm) and D12 (6–7 mm).',
      },
      canal: {
        uk: 'Сагітальний 15 мм (норма >15 мм), поперечний 21 мм (норма від 20 мм).',
        ru: 'Сагиттальный 15 мм (норма >15 мм), поперечный 21 мм (норма от 20 мм).',
        en: 'Sagittal 15.0 mm (norm >15 mm), transverse 21 mm (norm ≥20 mm).',
      },
      roots: {
        uk: 'Компресія корінцевих воронок.',
        ru: 'Компрессия корешковых воронок.',
        en: 'Nerve root sleeve compression.',
      },
    },
    y2026: {
      finding: {
        uk: 'Випинання дисків D10–D11, D11–D12 до 2,5–3 мм (на тому ж рівні)',
        ru: 'Выпячивания дисков D10–D11, D11–D12 до 2,5–3 мм (на том же уровне)',
        en: 'Disc protrusions D10–D11, D11–D12 up to 2.5–3.0 mm (unchanged)',
      },
      details: {
        uk: 'Компресія дурального мішка та корінцевих воронок на тлі задніх остеофітів. Гемангіоми D11–D12 без динаміки.',
        ru: 'Компрессия дурального мешка и корешковых воронок на фоне задних остеофитов. Гемангиомы D11–D12 без динамики.',
        en: 'Dural sac and root compression over posterior osteophytes. D11–D12 hemangiomas stable.',
      },
      canal: {
        uk: 'Сагітальний 15 мм (норма >15 мм), поперечний 21 мм (норма від 20 мм).',
        ru: 'Сагиттальный 15 мм (норма >15 мм), поперечный 21 мм (норма от 20 мм).',
        en: 'Sagittal 15.0 mm (norm >15 mm), transverse 21 mm (norm ≥20 mm).',
      },
      roots: {
        uk: 'Компресія корінцевих воронок без динаміки.',
        ru: 'Компрессия корешковых воронок без динамики.',
        en: 'Nerve root sleeve compression unchanged.',
      },
    },
    deltaSummary: {
      uk: 'Повна стабільність: випинання 2,5–3 мм та розміри каналу (15×21 мм) не змінилися.',
      ru: 'Полная стабильность: выпячивания 2,5–3 мм и размеры канала (15×21 мм) не изменились.',
      en: 'Completely stable: 2.5–3.0 mm protrusions and canal dimensions (15×21 mm) unchanged.',
    },
    metrics: { protrusion2025: 3.0, protrusion2026: 3.0, canalSagittal2025: 15.0, canalSagittal2026: 15.0, canalNormMin: 15 },
  },

  // LUMBAR (L1–S1)
  {
    id: 'L1-L3',
    region: 'lumbar',
    y: 576,
    status: 'stable',
    statusLabel: { uk: 'Без випинань', ru: 'Без выпячиваний', en: 'No Herniation' },
    y2025: {
      finding: {
        uk: 'У сегментах L1–L2, L2–L3 зниження інтенсивності сигналу без патологічного випинання',
        ru: 'В сегментах L1–L2, L2–L3 снижение интенсивности сигнала без патологического выпячивания',
        en: 'L1–L2, L2–L3 reduced disc signal without pathological protrusion',
      },
      details: {
        uk: 'Зниження висоти та дегідратація дисків L1–L5.',
        ru: 'Снижение высоты и дегидратация дисков L1–L5.',
        en: 'Disc height reduction and desiccation across L1–L5.',
      },
      canal: {
        uk: 'Сагітальний 18 мм (норма 16–18 мм), поперечний 20 мм (норма від 20–21 мм).',
        ru: 'Сагиттальный 18 мм (норма 16–18 мм), поперечный 20 мм (норма от 20–21 мм).',
        en: 'Sagittal 18.0 mm (norm 16–18 mm), transverse 20 mm (norm ≥20–21 mm).',
      },
      roots: {
        uk: 'Без ознак випинання дисків.',
        ru: 'Без признаков выпячивания дисков.',
        en: 'No disc protrusion or root compression.',
      },
    },
    y2026: {
      finding: {
        uk: 'У сегментах L1–L2, L2–L3 зниження інтенсивності сигналу без патологічного випинання',
        ru: 'В сегментах L1–L2, L2–L3 снижение интенсивности сигнала без патологического выпячивания',
        en: 'L1–L2, L2–L3 reduced disc signal without pathological protrusion',
      },
      details: {
        uk: 'Дегенерація дисків L1–L5 (зниження висоти та дегідратація). Конус спинного мозку на рівні L1 без патології.',
        ru: 'Дегенерация дисков L1–L5 (снижение высоты и дегидратация). Конус спинного мозга на уровне L1 без патологии.',
        en: 'L1–L5 disc degeneration. Conus medullaris terminates normally at L1.',
      },
      canal: {
        uk: 'Сагітальний 17 мм (норма 16–18 мм), поперечний 20 мм (норма від 20–21 мм).',
        ru: 'Сагиттальный 17 мм (норма 16–18 мм), поперечный 20 мм (норма от 20–21 мм).',
        en: 'Sagittal 17.0 mm (norm 16–18 mm), transverse 20 mm (norm ≥20–21 mm).',
      },
      roots: {
        uk: 'Без ознак випинання дисків.',
        ru: 'Без признаков выпячивания дисков.',
        en: 'No disc protrusion or root compression.',
      },
    },
    deltaSummary: {
      uk: 'Без гриж і протрузій; розміри хребтового каналу в межах норми (17×20 мм).',
      ru: 'Без грыж и протрузий; размеры позвоночного канала в пределах нормы (17×20 мм).',
      en: 'No herniations or protrusions; spinal canal dimensions remain within normal limits (17×20 mm).',
    },
    metrics: { protrusion2025: 0, protrusion2026: 0, canalSagittal2025: 18.0, canalSagittal2026: 17.0, canalNormMin: 16 },
  },
  {
    id: 'L3-L4',
    region: 'lumbar',
    y: 622,
    status: 'negative',
    statusLabel: { uk: 'Погіршення', ru: 'Ухудшение', en: 'Progression' },
    y2025: {
      finding: {
        uk: 'Нерівномірно циркулярне випинання 3,5–3,7 мм',
        ru: 'Неравномерно циркулярное выпячивание 3,5–3,7 мм',
        en: 'Asymmetric circular protrusion 3.5–3.7 mm',
      },
      details: {
        uk: 'Компресія дурального мішка з корінцевими воронками, більше зліва, на тлі гіпертрофії дуговідросткових суглобів.',
        ru: 'Компрессия дурального мешка с корешковыми воронками, больше слева, на фоне гипертрофии дугоотростчатых суставов.',
        en: 'Dural sac and root compression, greater on the left, with facet joint hypertrophy.',
      },
      canal: {
        uk: 'Сагітальний 16 мм (норма 16–18 мм), поперечний 18 мм (норма від 20–21 мм).',
        ru: 'Сагиттальный 16 мм (норма 16–18 мм), поперечный 18 мм (норма от 20–21 мм).',
        en: 'Sagittal 16.0 mm (norm 16–18 mm), transverse 18 mm (norm ≥20–21 mm).',
      },
      roots: {
        uk: 'Звуження бічних кишень до 3 мм праворуч та 1–2 мм ліворуч (норма >5 мм).',
        ru: 'Сужение боковых карманов до 3 мм справа и 1–2 мм слева (норма >5 мм).',
        en: 'Lateral recesses narrowed to 3 mm right and 1–2 mm left (norm >5 mm).',
      },
    },
    y2026: {
      finding: {
        uk: 'Циркулярна протрузія 3,6–3,7 мм (було 3,5–3,7 мм)',
        ru: 'Циркулярная протрузия 3,6–3,7 мм (было 3,5–3,7 мм)',
        en: 'Circular protrusion 3.6–3.7 mm (was 3.5–3.7 mm)',
      },
      details: {
        uk: 'Компресія дурального мішка з корінцевими воронками, більше справа (було більше зліва), на тлі гіпертрофії фасеткових суглобів.',
        ru: 'Компрессия дурального мешка с корешковыми воронками, больше справа (было больше слева), на фоне гипертрофии фасеточных суставов.',
        en: 'Dural sac and root compression, now predominantly right-sided (previously left), with facet hypertrophy.',
      },
      canal: {
        uk: 'Сагітальний 14–15 мм (норма 16–18 мм), поперечний 18 мм (норма від 20–21 мм).',
        ru: 'Сагиттальный 14–15 мм (норма 16–18 мм), поперечный 18 мм (норма от 20–21 мм).',
        en: 'Sagittal 14–15 mm (norm 16–18 mm), transverse 18 mm (norm ≥20–21 mm).',
      },
      roots: {
        uk: 'Бічні кишені звужені до 1–2 мм праворуч та 2 мм ліворуч (норма >5 мм); посилення фораміностенозу.',
        ru: 'Боковые карманы сужены до 1–2 мм справа и 2 мм слева (норма >5 мм); усиление фораминостеноза.',
        en: 'Lateral recesses narrowed to 1–2 mm right and 2 mm left (norm >5 mm); worsening foraminal stenosis.',
      },
    },
    deltaSummary: {
      uk: 'Посилення фораміностенозу, звуження правої бічної кишені до 1–2 мм та каналу до 14–15 мм; акцент компресії змістився на праву сторону.',
      ru: 'Усиление фораминостеноза, сужение правого бокового кармана до 1–2 мм и канала до 14–15 мм; акцент компрессии сместился на правую сторону.',
      en: 'Progressive foraminal stenosis, right lateral recess narrowed to 1–2 mm, canal 14–15 mm; compression shifted to the right.',
    },
    metrics: { protrusion2025: 3.7, protrusion2026: 3.7, canalSagittal2025: 16.0, canalSagittal2026: 14.5, canalNormMin: 16 },
  },
  {
    id: 'L4-L5',
    region: 'lumbar',
    y: 672,
    status: 'negative',
    statusLabel: { uk: 'Виражене погіршення', ru: 'Выраженное ухудшение', en: 'Marked Progression' },
    y2025: {
      finding: {
        uk: 'Грижа диска L4 з лівобічним парамедіанно-форамінальним випинанням 5,5–6 мм',
        ru: 'Грыжа диска L4 с левосторонним парамедианно-фораминальным выпячиванием 5,5–6 мм',
        en: 'L4 disc herniation with left paramedian-foraminal protrusion 5.5–6.0 mm',
      },
      details: {
        uk: 'Ознаки пошкодження фіброзного кільця, компресія дурального мішка та корінцевих воронок, більше зліва.',
        ru: 'Признаки повреждения фиброзного кольца, компрессия дурального мешка и корешковых воронок, больше слева.',
        en: 'Annular tear signs, dural sac and nerve root sleeve compression, predominantly left-sided.',
      },
      canal: {
        uk: 'Сагітальний 13 мм (норма 16–18 мм), поперечний 15 мм (норма від 20–21 мм).',
        ru: 'Сагиттальный 13 мм (норма 16–18 мм), поперечный 15 мм (норма от 20–21 мм).',
        en: 'Sagittal 13.0 mm (norm 16–18 mm), transverse 15 mm (norm ≥20–21 mm).',
      },
      roots: {
        uk: 'Звуження бічних кишень до 3 мм справа та 1 мм зліва (норма >5 мм).',
        ru: 'Сужение боковых карманов до 3 мм справа и 1 мм слева (норма >5 мм).',
        en: 'Lateral recesses narrowed to 3 mm right and 1 mm left (norm >5 mm).',
      },
    },
    y2026: {
      finding: {
        uk: 'Комбінована екструзія з частковою фрагментацією лівого форамінального сегмента до 5,7–6,2 мм на тлі циркулярного до 4 мм',
        ru: 'Комбинированная экструзия с частичной фрагментацией левого фораминального сегмента до 5,7–6,2 мм на фоне циркулярного до 4 мм',
        en: 'Combined extrusion with partial fragmentation of left foraminal segment up to 5.7–6.2 mm over 4 mm circular bulge',
      },
      details: {
        uk: 'Пошкодження фіброзного кільця, помірна компресія дурального мішка та корінцевих воронок (більше зліва); спондилоартроз 2 ст. з посиленням змін.',
        ru: 'Повреждение фиброзного кольца, умеренная компрессия дурального мешка и корешковых воронок (больше слева); спондилоартроз 2 ст. с усилением изменений.',
        en: 'Annular disruption, moderate dural and left-predominant root compression; progressive grade 2 facet spondyloarthrosis.',
      },
      canal: {
        uk: 'Сагітальний звужено до 10 мм (норма 16–18 мм), поперечний 13 мм (норма від 20–21 мм) — виражений стеноз.',
        ru: 'Сагиттальный сужен до 10 мм (норма 16–18 мм), поперечный 13 мм (норма от 20–21 мм) — выраженный стеноз.',
        en: 'Sagittal narrowed to 10.0 mm (norm 16–18 mm), transverse 13 mm (norm ≥20–21 mm) — severe stenosis.',
      },
      roots: {
        uk: 'Бічні кишені звужені до 2 мм справа (було 3 мм) та 0–1 мм зліва (було 1 мм) (норма >5 мм).',
        ru: 'Боковые карманы сужены до 2 мм справа (было 3 мм) и 0–1 мм слева (было 1 мм) (норма >5 мм).',
        en: 'Lateral recesses narrowed to 2 mm right (was 3 mm) and 0–1 mm left (was 1 mm) (norm >5 mm).',
      },
    },
    deltaSummary: {
      uk: 'Зростання екструзії до 5,7–6,2 мм із частковою фрагментацією, критичне звуження сагітального каналу з 13 до 10 мм та лівої кишені до 0–1 мм.',
      ru: 'Рост экструзии до 5,7–6,2 мм с частичной фрагментацией, критическое сужение сагиттального канала с 13 до 10 мм и левого кармана до 0–1 мм.',
      en: 'Extrusion progressed to 5.7–6.2 mm with partial fragmentation; sagittal canal narrowed critically (13 → 10 mm) and left recess 0–1 mm.',
    },
    metrics: { protrusion2025: 6.0, protrusion2026: 6.2, canalSagittal2025: 13.0, canalSagittal2026: 10.0, canalNormMin: 16 },
  },
  {
    id: 'L5-S1',
    region: 'lumbar',
    y: 724,
    status: 'negative',
    statusLabel: { uk: 'Погіршення', ru: 'Ухудшение', en: 'Progression' },
    y2025: {
      finding: {
        uk: 'Зниження інтенсивності сигналу з циркулярною деформацією диска',
        ru: 'Снижение интенсивности сигнала с циркулярной деформацией диска',
        en: 'Reduced disc signal with circular disc deformity',
      },
      details: {
        uk: 'Часткова сакралізація L5.',
        ru: 'Частичная сакрализация L5.',
        en: 'Partial L5 sacralization.',
      },
      canal: {
        uk: 'Сагітальний 13 мм (норма 16–18 мм), поперечний 22 мм (норма від 24 мм).',
        ru: 'Сагиттальный 13 мм (норма 16–18 мм), поперечный 22 мм (норма от 24 мм).',
        en: 'Sagittal 13.0 mm (norm 16–18 mm), transverse 22 mm (norm ≥24 mm).',
      },
      roots: {
        uk: 'Циркулярна деформація диска.',
        ru: 'Циркулярная деформация диска.',
        en: 'Circular disc deformity.',
      },
    },
    y2026: {
      finding: {
        uk: 'Циркулярна деформація диска на тлі дегенерації L1–L5',
        ru: 'Циркулярная деформация диска на фоне дегенерации L1–L5',
        en: 'Circular disc deformity over L1–L5 degeneration',
      },
      details: {
        uk: 'Часткова сакралізація L5 із псевдоартрозом (більш виражений справа — тип IIb за Castellvi) із наростанням артрозних змін.',
        ru: 'Частичная сакрализация L5 с псевдоартрозом (более выражен справа — тип IIb по Castellvi) с нарастанием артрозных изменений.',
        en: 'Partial L5 sacralization with pseudoarthrosis (predominantly right — Castellvi type IIb) with progressive arthritic changes.',
      },
      canal: {
        uk: 'Сагітальний зменшився до 12 мм (було 13 мм, норма 16–18 мм), поперечний 21–22 мм.',
        ru: 'Сагиттальный уменьшился до 12 мм (было 13 мм, норма 16–18 мм), поперечный 21–22 мм.',
        en: 'Sagittal narrowed to 12.0 mm (was 13 mm, norm 16–18 mm), transverse 21–22 mm.',
      },
      roots: {
        uk: 'Посилення артрозних змін у зоні псевдоартрозу та фасеткових суглобів (2 ст.).',
        ru: 'Усиление артрозных изменений в зоне псевдоартроза и фасеточных суставов (2 ст.).',
        en: 'Worsening arthritic changes in pseudoarthrosis zone and grade 2 facet joints.',
      },
    },
    deltaSummary: {
      uk: 'Зменшення сагітального каналу до 12 мм та посилення артрозних змін у псевдоартрозі L5 (тип IIb за Castellvi) і фасеткових суглобах.',
      ru: 'Уменьшение сагиттального канала до 12 мм и усиление артрозных изменений в псевдоартрозе L5 (тип IIb по Castellvi) и фасеточных суставах.',
      en: 'Sagittal canal decreased to 12 mm with worsening arthritic changes at L5 Castellvi IIb pseudoarthrosis and facet joints.',
    },
    metrics: { protrusion2025: 1.5, protrusion2026: 1.8, canalSagittal2025: 13.0, canalSagittal2026: 12.0, canalNormMin: 16 },
  },
];

export const COMPLAINT_TO_MRI_SEGMENTS: Record<string, string[]> = {
  lumbar_sacral: ['L4-L5', 'L5-S1', 'L3-L4'],
  thoracic: ['D1-D2', 'D2-D3', 'D3-D4', 'D6-D9'],
  cervical_head: ['C4-C5', 'C5-C6', 'C6-C7', 'C7-D1'],
  right_side_spasms_load: ['D1-D2', 'D2-D3', 'L3-L4', 'C2-C3'],
};
