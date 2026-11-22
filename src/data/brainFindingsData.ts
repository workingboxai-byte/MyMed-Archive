import { LocalizedText } from '../types/medical';

export interface BrainFindingLandmark {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  colorHex: string;
  position: [number, number, number]; // Anatomical 3D coords in brain scene (anterior = +Z, superior = +Y, patient right = -X)
  cameraOffset: [number, number, number];
  shortLabel: LocalizedText;
  title: LocalizedText;
  category: LocalizedText;
  location: LocalizedText;
  summary: LocalizedText;
  metricBadge: LocalizedText;
}

export const BRAIN_MRI_LANDMARKS: BrainFindingLandmark[] = [
  {
    id: 'pituitary',
    severity: 'warning',
    colorHex: '#f59e0b',
    position: [0.0, -0.52, 0.34],
    cameraOffset: [1.55, 0.35, 2.35],
    shortLabel: {
      uk: 'Гіпофіз — неоднорідність сигналу',
      ru: 'Гипофиз — неоднородность сигнала',
      en: 'Pituitary — heterogeneous signal',
    },
    title: {
      uk: 'Гіпофіз: неоднорідність МР-сигналу',
      ru: 'Гипофиз: неоднородность МР-сигнала',
      en: 'Pituitary Gland: Heterogeneous MRI Signal',
    },
    category: {
      uk: 'Селярна ділянка · МРТ мозку',
      ru: 'Селлярная область · МРТ мозга',
      en: 'Sellar Region · Brain MRI',
    },
    location: {
      uk: 'Турецьке сідло, аденогіпофіз',
      ru: 'Турецкое седло, аденогипофиз',
      en: 'Sella turcica, adenohypophysis',
    },
    summary: {
      uk: 'Неоднорідність структури та інтенсивності МР-сигналу гіпофіза. Потребує зіставлення з гормональним профілем і за потреби прицільного контролю.',
      ru: 'Неоднородность структуры и интенсивности МР-сигнала гипофиза. Требует сопоставления с гормональным профилем и при необходимости прицельного контроля.',
      en: 'Heterogeneous parenchymal MRI signal within the pituitary gland. Correlate with endocrine panel and targeted follow-up if clinically indicated.',
    },
    metricBadge: {
      uk: 'Контроль / прицільно',
      ru: 'Контроль / прицельно',
      en: 'Targeted follow-up',
    },
  },
  {
    id: 'venous-angioma',
    severity: 'critical',
    colorHex: '#3b82f6',
    position: [-0.72, 0.42, 0.28],
    cameraOffset: [-2.45, 1.1, 1.95],
    shortLabel: {
      uk: 'Венозна ангіома справа (10 мм)',
      ru: 'Венозная ангиома справа (10 мм)',
      en: 'Right venous angioma (10 mm)',
    },
    title: {
      uk: 'Венозна ангіома (DVA) правої півкулі — 10 мм',
      ru: 'Венозная ангиома (DVA) правого полушария — 10 мм',
      en: 'Right Hemispheric Venous Angioma (DVA) — 10 mm',
    },
    category: {
      uk: 'Судинна аномалія розвитку',
      ru: 'Сосудистая аномалия развития',
      en: 'Developmental Venous Anomaly',
    },
    location: {
      uk: 'Права півкуля головного мозку',
      ru: 'Правое полушарие головного мозга',
      en: 'Right cerebral hemisphere',
    },
    summary: {
      uk: 'Аномалія венозного дренажу (венозна ангіома) справа протяжністю до 10 мм із типовим радіальним злиттям дрібних венул. Зазвичай вроджена й стабільна знахідка.',
      ru: 'Аномалия венозного дренажа (венозная ангиома) справа протяженностью до 10 мм с типичным радиальным слиянием мелких венул. Обычно врожденная стабильная находка.',
      en: 'Right-sided developmental venous anomaly measuring up to 10 mm with radial medullary tributaries. Typically congenital and stable on longitudinal MRI.',
    },
    metricBadge: {
      uk: 'Справа · 10 мм',
      ru: 'Справа · 10 мм',
      en: 'Right · 10 mm',
    },
  },
  {
    id: 'optic-nerves',
    severity: 'warning',
    colorHex: '#06b6d4',
    position: [0.0, -0.34, 1.12],
    cameraOffset: [0.95, 0.25, 3.05],
    shortLabel: {
      uk: 'Зорові нерви — ознаки ВЧГ',
      ru: 'Зрительные нервы — признаки ВЧГ',
      en: 'Optic nerves — signs of ICH',
    },
    title: {
      uk: 'Зорові нерви: непрямі ознаки ВЧГ',
      ru: 'Зрительные нервы: косвенные признаки ВЧГ',
      en: 'Optic Nerves: Indirect Signs of Intracranial Hypertension',
    },
    category: {
      uk: 'Ліквородинаміка · Орбіти',
      ru: 'Ликвородинамика · Орбиты',
      en: 'CSF Dynamics · Orbits',
    },
    location: {
      uk: 'Періневральні субарахноїдальні простори зорових нервів',
      ru: 'Периневральные субарахноидальные пространства зрительных нервов',
      en: 'Perineural subarachnoid sheaths of optic nerves',
    },
    summary: {
      uk: 'Розширення періневральних лікворних просторів уздовж зорових нервів як непряма МР-ознака внутрішньочерепної гіпертензії; доцільна кореляція з оглядом очного дна.',
      ru: 'Расширение периневральных ликворных пространств вдоль зрительных нервов как косвенный МР-признак внутричерепной гипертензии; желательна корреляция с осмотром глазного дна.',
      en: 'Mild distension of the perineural CSF sheaths along the optic nerves representing indirect MRI signs of intracranial hypertension; correlate with fundoscopy.',
    },
    metricBadge: {
      uk: 'Непрямі ознаки ВЧГ',
      ru: 'Косвенные признаки ВЧГ',
      en: 'Indirect ICH signs',
    },
  },
  {
    id: 'left-vertebral-artery',
    severity: 'critical',
    colorHex: '#e11d48',
    position: [0.22, -1.16, -0.18],
    cameraOffset: [2.15, -0.65, -2.0],
    shortLabel: {
      uk: 'Ліва вертебральна артерія — контакт зі стовбуром',
      ru: 'Левая вертебральная артерия — контакт со стволом',
      en: 'Left vertebral artery — brainstem contact',
    },
    title: {
      uk: 'Ліва хребтова артерія: нейроваскулярний контакт',
      ru: 'Левая позвоночная артерия: нейроваскулярный контакт',
      en: 'Left Vertebral Artery: Brainstem Contact',
    },
    category: {
      uk: 'Вертебробазилярний басейн',
      ru: 'Вертебробазилярный бассейн',
      en: 'Vertebrobasilar System',
    },
    location: {
      uk: 'Ліва передньобокова поверхня довгастого мозку / мосту',
      ru: 'Левая переднебоковая поверхность продолговатого мозга / моста',
      en: 'Left anterolateral medulla / pontomedullary junction',
    },
    summary: {
      uk: 'Прилягання та локальний контакт петлі лівої вертебральної артерії до стовбура мозку без грубої деформації паренхіми. Важливо враховувати при аналізі шийних скарг та запаморочень.',
      ru: 'Прилежание и локальный контакт петли левой вертебральной артерии со стволом мозга без грубой деформации паренхимы. Важно учитывать при анализе шейных жалоб и головокружений.',
      en: 'Close apposition and focal contact between the left vertebral artery loop and the brainstem without gross parenchymal distortion. Relevant when correlating cervical and vestibular symptoms.',
    },
    metricBadge: {
      uk: 'Контакт зі стовбуром',
      ru: 'Контакт со стволом',
      en: 'Brainstem contact',
    },
  },
  {
    id: 'vascular-gliosis',
    severity: 'info',
    colorHex: '#10b981',
    position: [0.56, 0.72, 0.14],
    cameraOffset: [2.35, 1.45, 1.75],
    shortLabel: {
      uk: 'Вогнища судинного гліозу',
      ru: 'Очаги сосудистого глиоза',
      en: 'Foci of vascular gliosis',
    },
    title: {
      uk: 'Поодинокі вогнища судинного гліозу',
      ru: 'Единичные очаги сосудистого глиоза',
      en: 'Small Foci of Vascular Gliosis',
    },
    category: {
      uk: 'Біла речовина · Мікроангіопатія',
      ru: 'Белое вещество · Микроангиопатия',
      en: 'White Matter · Microangiopathy',
    },
    location: {
      uk: 'Субкортикальна біла речовина лобно-тім’яних часток',
      ru: 'Субкортикальное белое вещество лобно-теменных долей',
      en: 'Subcortical frontoparietal white matter',
    },
    summary: {
      uk: 'Дрібні неспецифічні гіперінтенсивні на FLAIR/T2 вогнища судинного (дисциркуляторного) гліозу без перифокального набряку та мас-ефекту.',
      ru: 'Мелкие неспецифические гиперинтенсивные на FLAIR/T2 очаги сосудистого (дисциркуляторного) глиоза без перифокального отека и масс-эффекта.',
      en: 'Small non-specific FLAIR/T2-hyperintense foci of chronic microvascular gliosis without perifocal edema or mass effect.',
    },
    metricBadge: {
      uk: 'Без мас-ефекту',
      ru: 'Без масс-эффекта',
      en: 'No mass effect',
    },
  },
];
