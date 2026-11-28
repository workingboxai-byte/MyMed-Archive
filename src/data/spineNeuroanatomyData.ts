import { LocalizedText } from '../types/medical';

export type Atlas2DRegionId = 'cervical' | 'thoracic' | 'lumbar' | 'sacral';

export interface SegmentNeuroanatomyInfo {
  segmentId: string;
  nerveRoot: LocalizedText;
  dermatomeZone: LocalizedText;
  motorFunction: LocalizedText;
}

export interface RegionAnatomySummary {
  id: Atlas2DRegionId;
  range: string;
  title: LocalizedText;
  curveLabel: LocalizedText;
  innervationSummary: LocalizedText;
  segmentIds: string[];
  sacralClinicalNote?: LocalizedText;
}

export const SPINE_2D_REGIONS: RegionAnatomySummary[] = [
  {
    id: 'cervical',
    range: 'C1–C7',
    title: {
      uk: 'Шийний відділ',
      ru: 'Шейный отдел',
      en: 'Cervical Spine',
    },
    curveLabel: {
      uk: 'Шийний лордоз',
      ru: 'Шейный лордоз',
      en: 'Cervical lordosis',
    },
    innervationSummary: {
      uk: 'Потилична ділянка, шия, надпліччя, плечовий пояс, руки та пальці кисті.',
      ru: 'Затылочная область, шея, надплечья, плечевой пояс, руки и пальцы кисти.',
      en: 'Occipital region, neck, shoulders, shoulder girdle, arms, and fingers.',
    },
    segmentIds: ['C2-C3', 'C3-C4', 'C4-C5', 'C5-C6', 'C6-C7', 'C7-D1'],
  },
  {
    id: 'thoracic',
    range: 'D1–D12',
    title: {
      uk: 'Грудний відділ',
      ru: 'Грудной отдел',
      en: 'Thoracic Spine',
    },
    curveLabel: {
      uk: 'Грудний кіфоз',
      ru: 'Грудной кифоз',
      en: 'Thoracic kyphosis',
    },
    innervationSummary: {
      uk: 'Міжлопаткова ділянка, міжреберні проміжки, грудна клітка, підребер’я та м’язи черевної стінки.',
      ru: 'Межлопаточная область, межреберные промежутки, грудная клетка, подреберья и мышцы брюшной стенки.',
      en: 'Interscapular region, intercostal spaces, chest wall, subcostal zone, and abdominal wall.',
    },
    segmentIds: ['D1-D2', 'D2-D3', 'D3-D4', 'D4-D5', 'D6-D9', 'D10-D12'],
  },
  {
    id: 'lumbar',
    range: 'L1–L5',
    title: {
      uk: 'Поперековий відділ',
      ru: 'Поясничный отдел',
      en: 'Lumbar Spine',
    },
    curveLabel: {
      uk: 'Поперековий лордоз',
      ru: 'Поясничный лордоз',
      en: 'Lumbar lordosis',
    },
    innervationSummary: {
      uk: 'Поперек, пахова ділянка, сідниці, передня та зовнішня поверхня стегна й гомілки, стопа.',
      ru: 'Поясница, паховая область, ягодицы, передняя и наружная поверхность бедра и голени, стопа.',
      en: 'Lower back, groin, buttocks, anterior & lateral thigh/shin, and foot.',
    },
    segmentIds: ['L1-L3', 'L3-L4', 'L4-L5', 'L5-S1'],
  },
  {
    id: 'sacral',
    range: 'S1–S5',
    title: {
      uk: 'Крижі та куприк',
      ru: 'Крестец и копчик',
      en: 'Sacrum & Coccyx',
    },
    curveLabel: {
      uk: 'Крижовий кіфоз',
      ru: 'Крестцовый кифоз',
      en: 'Sacral kyphosis',
    },
    innervationSummary: {
      uk: 'Крижова ділянка, задня поверхня стегна і гомілки, п’ята, зовнішній край стопи та тазове дно.',
      ru: 'Крестцовая область, задняя поверхность бедра и голени, пятка, наружный край стопы и тазовое дно.',
      en: 'Sacral zone, posterior thigh and calf, heel, lateral border of foot, and pelvic floor.',
    },
    segmentIds: ['L5-S1'],
    sacralClinicalNote: {
      uk: 'На рівні переходу L5–S1 за протоколом SOR зафіксовано перехідний хребець (Castellvi IIb) із псевдоартрозом поперечних відростків та крижово-клубовою стабілізацією.',
      ru: 'На уровне перехода L5–S1 по протоколу SOR зафиксирован переходный позвонок (Castellvi IIb) с псевдоартрозом поперечных отростков.',
      en: 'At the L5–S1 junction, the SOR report documents a transitional vertebra (Castellvi IIb) with bilateral transverse-sacral pseudoarthrosis.',
    },
  },
];

export const SEGMENT_NEUROANATOMY: Record<string, SegmentNeuroanatomyInfo> = {
  'C2-C3': {
    segmentId: 'C2-C3',
    nerveRoot: { uk: 'Корінець C3', ru: 'Корешок C3', en: 'C3 Nerve Root' },
    dermatomeZone: {
      uk: 'Потилична ділянка, задня та бічна поверхня верхньої частини шиї, навколовушна зона.',
      ru: 'Затылочная область, задняя и боковая поверхность верхней части шеи, околоушная зона.',
      en: 'Occipital scalp, upper posterior/lateral neck, and retroauricular area.',
    },
    motorFunction: {
      uk: 'М’язи шиї, часткова участь у верхньому пучку трапецієподібного м’яза та діафрагмальному нерві (C3–C5).',
      ru: 'Мышцы шеи, частичное участие в верхней порции трапециевидной мышцы и диафрагмальном нерве (C3–C5).',
      en: 'Cervical paraspinals, partial upper trapezius support, and phrenic nerve contribution (C3–C5).',
    },
  },
  'C3-C4': {
    segmentId: 'C3-C4',
    nerveRoot: { uk: 'Корінець C4', ru: 'Корешок C4', en: 'C4 Nerve Root' },
    dermatomeZone: {
      uk: 'Нижня частина шиї, надпліччя («зона погонів»), ділянка ключиці та верхнього краю лопатки.',
      ru: 'Нижняя часть шеи, надплечье («зона погон»), область ключицы и верхнего края лопатки.',
      en: 'Lower neck, top of the shoulder (cape/epaulette distribution), clavicle, and superior scapula.',
    },
    motorFunction: {
      uk: 'Підняття плечового пояса (трапецієподібний м’яз, м’яз, що піднімає лопатку) та діафрагма.',
      ru: 'Поднятие плечевого пояса (трапециевидная мышца, мышца, поднимающая лопатку) и диафрагма.',
      en: 'Shoulder elevation (trapezius, levator scapulae) and primary diaphragm innervation.',
    },
  },
  'C4-C5': {
    segmentId: 'C4-C5',
    nerveRoot: { uk: 'Корінець C5', ru: 'Корешок C5', en: 'C5 Nerve Root' },
    dermatomeZone: {
      uk: 'Зовнішня поверхня плечового суглоба та верхньої третини плеча (дельтоподібна зона).',
      ru: 'Наружная поверхность плечевого сустава и верхней трети плеча (дельтовидная зона).',
      en: 'Lateral aspect of the shoulder joint and upper arm (deltoid cap area).',
    },
    motorFunction: {
      uk: 'Відведення плеча (дельтоподібний м’яз) та згинання ліктя (двоголовий м’яз плеча).',
      ru: 'Отведение плеча (дельтовидная мышца) и сгибание локтя (бицепс).',
      en: 'Shoulder abduction (deltoid) and elbow flexion (biceps brachii).',
    },
  },
  'C5-C6': {
    segmentId: 'C5-C6',
    nerveRoot: { uk: 'Корінець C6', ru: 'Корешок C6', en: 'C6 Nerve Root' },
    dermatomeZone: {
      uk: 'Зовнішній край плеча й передпліччя, великий (I) та частково вказівний (II) пальці кисті.',
      ru: 'Наружный край плеча и предплечья, большой (I) и частично указательный (II) пальцы кисти.',
      en: 'Lateral forearm, radial side of the hand, thumb (1st) and radial index finger (2nd).',
    },
    motorFunction: {
      uk: 'Розгинання зап’ястя, супінація передпліччя та згинання ліктя (брахіорадіальний рефлекс).',
      ru: 'Разгибание запястья, супинация предплечья и сгибание локтя (карпорадиальный рефлекс).',
      en: 'Wrist extension, forearm supination, and elbow flexion (brachioradialis reflex).',
    },
  },
  'C6-C7': {
    segmentId: 'C6-C7',
    nerveRoot: { uk: 'Корінець C7', ru: 'Корешок C7', en: 'C7 Nerve Root' },
    dermatomeZone: {
      uk: 'Задня поверхня плеча та передпліччя, середній палець кисті (III палець), інколи II–IV пальці.',
      ru: 'Задняя поверхность плеча и предплечья, средний палец кисти (III палец), иногда II–IV пальцы.',
      en: 'Posterior arm and forearm radiating into the middle finger (3rd digit).',
    },
    motorFunction: {
      uk: 'Розгинання ліктя (трицепс), згинання зап’ястя та розгинання пальців кисті.',
      ru: 'Разгибание локтя (трицепс), сгибание запястья и разгибание пальцев кисти.',
      en: 'Elbow extension (triceps), wrist flexion, and finger extension (triceps reflex).',
    },
  },
  'C7-D1': {
    segmentId: 'C7-D1',
    nerveRoot: { uk: 'Корінець C8', ru: 'Корешок C8', en: 'C8 Nerve Root' },
    dermatomeZone: {
      uk: 'Внутрішня (ліктьова) поверхня передпліччя, безіменний палець (IV) та мізинець (V) кисті.',
      ru: 'Внутренняя (локтевая) поверхность предплечья, безымянный палец (IV) и мизинец (V) кисти.',
      en: 'Medial (ulnar) border of the forearm, ring finger (4th), and little finger (5th).',
    },
    motorFunction: {
      uk: 'Згинання пальців кисті, сила стискання та дрібні міжкісткові м’язи кисті.',
      ru: 'Сгибание пальцев кисти, сила хвата и мелкие межкостные мышцы кисти.',
      en: 'Finger flexion, grip strength, and intrinsic hand muscles.',
    },
  },
  'D1-D2': {
    segmentId: 'D1-D2',
    nerveRoot: { uk: 'Корінці T1–T2', ru: 'Корешки T1–T2', en: 'T1–T2 Nerve Roots' },
    dermatomeZone: {
      uk: 'Верхня міжлопаткова ділянка, пахвова западина та внутрішня поверхня плеча.',
      ru: 'Верхняя межлопаточная область, подмышечная впадина и внутренняя поверхность плеча.',
      en: 'Upper interscapular region, axilla, and medial aspect of the upper arm.',
    },
    motorFunction: {
      uk: 'Дрібні м’язи кисті (T1), верхні міжреберні та паравертебральні м’язи спини.',
      ru: 'Мелкие мышцы кисти (T1), верхние межреберные и паравертебральные мышцы спины.',
      en: 'Intrinsic hand abduction/adduction (T1), upper intercostal and thoracic paraspinal muscles.',
    },
  },
  'D2-D3': {
    segmentId: 'D2-D3',
    nerveRoot: { uk: 'Корінці T2–T3', ru: 'Корешки T2–T3', en: 'T2–T3 Nerve Roots' },
    dermatomeZone: {
      uk: 'Верхня міжлопаткова ділянка та верхня передня поверхня грудної клітки (II–III міжребер’я).',
      ru: 'Верхняя межлопаточная область и верхняя передняя поверхность грудной клетки (II–III межреберья).',
      en: 'Upper interscapular back and upper anterior chest wall (2nd–3rd intercostal spaces).',
    },
    motorFunction: {
      uk: 'Верхні міжреберні м’язи та стабілізатори верхньогрудного відділу хребта.',
      ru: 'Верхние межреберные мышцы и стабилизаторы верхнегрудного отдела позвоночника.',
      en: 'Upper intercostal muscles and upper thoracic spinal stabilizers.',
    },
  },
  'D3-D4': {
    segmentId: 'D3-D4',
    nerveRoot: { uk: 'Корінці T3–T4', ru: 'Корешки T3–T4', en: 'T3–T4 Nerve Roots' },
    dermatomeZone: {
      uk: 'Міжлопаткова ділянка та оперізуюча зона грудної клітки на рівні IV міжребер’я (лінія сосків).',
      ru: 'Межлопаточная область и опоясывающая зона грудной клетки на уровне IV межреберья (линия сосков).',
      en: 'Interscapular back and circumferential chest band at the 4th intercostal / nipple line.',
    },
    motorFunction: {
      uk: 'Міжреберні м’язи та розгиначі верхньо-середнього грудного відділу спини.',
      ru: 'Межреберные мышцы и разгибатели верхне-среднего грудного отдела спины.',
      en: 'Intercostal muscles and upper-mid thoracic erector spinae.',
    },
  },
  'D4-D5': {
    segmentId: 'D4-D5',
    nerveRoot: { uk: 'Корінці T4–T5', ru: 'Корешки T4–T5', en: 'T4–T5 Nerve Roots' },
    dermatomeZone: {
      uk: 'Середня міжлопаткова ділянка, бічна та передня стінка грудної клітки (IV–V міжребер’я).',
      ru: 'Средняя межлопаточная область, боковая и передняя стенка грудной клетки (IV–V межреберья).',
      en: 'Mid-interscapular back and anterolateral chest wall (4th–5th intercostal spaces).',
    },
    motorFunction: {
      uk: 'Середні міжреберні м’язи та паравертебральна мускулатура грудного відділу.',
      ru: 'Средние межреберные мышцы и паравертебральная мускулатура грудного отдела.',
      en: 'Mid-thoracic intercostal and paraspinal postural muscles.',
    },
  },
  'D6-D9': {
    segmentId: 'D6-D9',
    nerveRoot: { uk: 'Корінці T6–T9', ru: 'Корешки T6–T9', en: 'T6–T9 Nerve Roots' },
    dermatomeZone: {
      uk: 'Нижній кут лопаток, реберна дуга, підребер’я та верхні відділи передньої черевної стінки (епігастрій).',
      ru: 'Нижний угол лопаток, реберная дуга, подреберье и верхние отделы передней брюшной стенки (эпигастрий).',
      en: 'Inferior scapular border, costal margin, subcostal region, and upper abdominal wall (epigastrium).',
    },
    motorFunction: {
      uk: 'Нижні міжреберні м’язи, розгиначі спини та верхня частина прямого й косих м’язів живота.',
      ru: 'Нижние межреберные мышцы, разгибатели спины и верхняя часть прямых и косых мышц живота.',
      en: 'Lower intercostals, thoracic extensors, and upper rectus/oblique abdominal muscles.',
    },
  },
  'D10-D12': {
    segmentId: 'D10-D12',
    nerveRoot: { uk: 'Корінці T10–T12', ru: 'Корешки T10–T12', en: 'T10–T12 Nerve Roots' },
    dermatomeZone: {
      uk: 'Рівень пупка (T10), нижні відділи живота, боки та надлобкова / пахова ділянка (T12).',
      ru: 'Уровень пупка (T10), нижние отделы живота, бока и надлобковая / паховая область (T12).',
      en: 'Umbilical level (T10), lower abdominal wall, flanks, and suprapubic/inguinal belt (T12).',
    },
    motorFunction: {
      uk: 'Нижні відділи м’язів живота та перехідна попереково-грудна стабілізація тулуба.',
      ru: 'Нижние отделы мышц живота и переходная грудопоясничная стабилизация туловища.',
      en: 'Lower abdominal wall muscles and thoracolumbar trunk stabilization.',
    },
  },
  'L1-L3': {
    segmentId: 'L1-L3',
    nerveRoot: { uk: 'Корінці L1–L3', ru: 'Корешки L1–L3', en: 'L1–L3 Nerve Roots' },
    dermatomeZone: {
      uk: 'Верхній поперек, пахова складка, передня та внутрішня поверхня стегна до коліна.',
      ru: 'Верхняя поясница, паховая складка, передняя и внутренняя поверхность бедра до колена.',
      en: 'Upper lumbar zone, inguinal crease, anterior and medial thigh down to the knee.',
    },
    motorFunction: {
      uk: 'Згинання стегна (клубово-поперековий м’яз), приведення стегна та частково розгинання коліна.',
      ru: 'Сгибание бедра (подвздошно-поясничная мышца), приведение бедра и частично разгибание колена.',
      en: 'Hip flexion (iliopsoas), hip adduction, and partial knee extension (quadriceps).',
    },
  },
  'L3-L4': {
    segmentId: 'L3-L4',
    nerveRoot: { uk: 'Корінець L4', ru: 'Корешок L4', en: 'L4 Nerve Root' },
    dermatomeZone: {
      uk: 'Поперек, передньозовнішня поверхня стегна, передня ділянка коліна та внутрішня поверхня гомілки до медіального краю стопи.',
      ru: 'Поясница, передненаружная поверхность бедра, передняя область колена и внутренняя поверхность голени до медиального края стопы.',
      en: 'Lower back, anterolateral thigh, anterior knee, and medial shin to the inner arch of the foot.',
    },
    motorFunction: {
      uk: 'Розгинання колінного суглоба (чотириголовий м’яз стегна), інверсія стопи; колінний рефлекс.',
      ru: 'Разгибание коленного сустава (квадрицепс), инверсия стопы; коленный рефлекс.',
      en: 'Knee extension (quadriceps), foot inversion (tibialis anterior), and patellar reflex.',
    },
  },
  'L4-L5': {
    segmentId: 'L4-L5',
    nerveRoot: { uk: 'Корінець L5', ru: 'Корешок L5', en: 'L5 Nerve Root' },
    dermatomeZone: {
      uk: 'Поперек, сідниця, зовнішня (латеральна) поверхня стегна і гомілки, тильна поверхня стопи та великий палець.',
      ru: 'Поясница, ягодица, наружная (латеральная) поверхность бедра и голени, тыл стопы и большой палец.',
      en: 'Lower back, buttock, lateral thigh and shin, dorsum of the foot, and great toe.',
    },
    motorFunction: {
      uk: 'Тильне згинання стопи та розгинання великого пальця (підйом носка), відведення стегна.',
      ru: 'Тыльное сгибание стопы и разгибание большого пальца (подъем носка), отведение бедра.',
      en: 'Ankle dorsiflexion, great toe extension (extensor hallucis longus), and hip abduction.',
    },
  },
  'L5-S1': {
    segmentId: 'L5-S1',
    nerveRoot: { uk: 'Корінець S1', ru: 'Корешок S1', en: 'S1 Nerve Root' },
    dermatomeZone: {
      uk: 'Попереково-крижова ділянка, сідниця, задня поверхня стегна й гомілки, п’ята та зовнішній край стопи (мізинець).',
      ru: 'Пояснично-крестцовая область, ягодица, задняя поверхность бедра и голени, пятка и наружный край стопы (мизинец).',
      en: 'Lumbosacral junction, buttock, posterior thigh and calf, heel, and lateral foot / 5th toe.',
    },
    motorFunction: {
      uk: 'Підошовне згинання стопи (литковий м’яз — підйом на носки), згинання коліна; ахіллів рефлекс.',
      ru: 'Подошвенное сгибание стопы (икроножная мышца — подъем на носки), сгибание колена; ахиллов рефлекс.',
      en: 'Plantar flexion (gastrocnemius/soleus — heel raise), knee flexion, and Achilles reflex.',
    },
  },
};
