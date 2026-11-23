import { Language, NavSection, RecordCategory, AttachmentSource, SpineRegion } from '../types/medical';

export interface UiDictionary {
  appBrand: string;
  patientShort: string;
  nav: Record<NavSection, string>;
  navSub: Record<NavSection, string>;
  actions: {
    doctorMode: string;
    exitDoctorMode: string;
    printPdf: string;
    jsonArchive: string;
    exportJson: string;
    importJson: string;
    resetDefault: string;
    edit: string;
    save: string;
    cancel: string;
    add: string;
    delete: string;
    copyLink: string;
    copied: string;
    openExternal: string;
    close: string;
    confirm: string;
    viewInMri: string;
    openIn3D: string;
    privacyMode: string;
    privacyActive: string;
    themeLight: string;
    themeDark: string;
  };
  anamnesis: {
    sectionTitle: string;
    sectionSubtitle: string;
    profileTitle: string;
    editProfile: string;
    fullName: string;
    birthYear: string;
    ageSuffix: string;
    region: string;
    height: string;
    weight: string;
    bmi: string;
    bloodType: string;
    allergies: string;
    vaccinations: string;
    chronicConditions: string;
    currentMedications: string;
    notSpecified: string;
    cmUnit: string;
    kgUnit: string;
    complaintsTitle: string;
    complaintsSubtitle: string;
    editComplaint: string;
    linkedMriLevels: string;
    disclaimerLabel: string;
    bmiCategories: {
      under: string;
      normal: string;
      over: string;
      obese: string;
    };
  };
  mri: {
    sectionTitle: string;
    sectionSubtitle: string;
    providerLabel: string;
    radiologistPrefix: string;
    radiologistDefault: string;
    scansLabel: string;
    reportsLabel: string;
    intervalLabel: string;
    mode2025: string;
    mode2026: string;
    modeCompare: string;
    modeHint: string;
    regionAll: string;
    regionLabels: Record<SpineRegion, string>;
    regionRanges: Record<SpineRegion, string>;
    legendNegative: string;
    legendNew: string;
    legendStable: string;
    schematicTitle: string;
    schematicSubtitle: string;
    quickJump: string;
    segmentPrefix: string;
    deltaHeader: string;
    scan2025Title: string;
    protocol2025: string;
    scan2026Title: string;
    protocol2026: string;
    canalLabel: string;
    rootsLabel: string;
    chartsTitle: string;
    chartsSubtitle: string;
    chartProtrusionTab: string;
    chartCanalTab: string;
    chartNormLabel: string;
    chartMmUnit: string;
    chartNoProtrusion: string;
    systemicTitle: string;
    tableTitle: string;
    tableSubtitle: string;
    colSegment: string;
    col2025: string;
    col2026: string;
    colCanalRoots: string;
    colDynamics: string;
    linkedAttachments: string;
  };
  records: {
    sectionTitle: string;
    sectionSubtitle: string;
    searchPlaceholder: string;
    allCategories: string;
    categories: Record<RecordCategory, string>;
    sortNewest: string;
    sortOldest: string;
    addRecord: string;
    editRecord: string;
    recordTitleLabel: string;
    recordDateLabel: string;
    recordCategoryLabel: string;
    recordNotesLabel: string;
    notesPlaceholder: string;
    noNotes: string;
    emptySearch: string;
    totalCount: string;
    deleteConfirmTitle: string;
    deleteConfirmBody: string;
    linkedFiles: string;
  };
  archive: {
    sectionTitle: string;
    sectionSubtitle: string;
    addLink: string;
    batchAdd: string;
    searchPlaceholder: string;
    allSources: string;
    sources: Record<AttachmentSource, string>;
    titleLabel: string;
    titlePlaceholder: string;
    urlLabel: string;
    urlPlaceholder: string;
    sourceLabel: string;
    dateLabel: string;
    segmentLabel: string;
    recordLabel: string;
    notesLabel: string;
    noneOption: string;
    emptyTitle: string;
    emptyBody: string;
    batchHint: string;
    batchPlaceholder: string;
    batchSubmit: string;
    invalidUrl: string;
    deleteConfirmTitle: string;
    deleteConfirmBody: string;
    autoDetected: string;
  };
  doctor: {
    docHeaderTitle: string;
    docHeaderSubtitle: string;
    printHint: string;
    patientBlock: string;
    biometricsBlock: string;
    redFlagsBlock: string;
    complaintsBlock: string;
    mriTableBlockPrefix: string;
    systemicBlock: string;
    otherRecordsBlock: string;
    linksBlock: string;
    noLinksNote: string;
    generatedAt: string;
    languageForPrint: string;
  };
  jsonModal: {
    title: string;
    subtitle: string;
    exportDesc: string;
    importDesc: string;
    selectFile: string;
    resetTitle: string;
    resetDesc: string;
    resetConfirmTitle: string;
    resetConfirmBody: string;
    importSuccess: string;
    importError: string;
    exportSuccess: string;
    resetSuccess: string;
    savedToast: string;
    deletedToast: string;
  };
  atlas3d: {
    sectionTitle: string;
    sectionSubtitle: string;
    sceneSpine: string;
    sceneBrain: string;
    sceneSpineShort: string;
    sceneBrainShort: string;
    segmentsTitle: string;
    brainPointsTitle: string;
    layersTitle: string;
    layerSilhouette: string;
    layerHeadSilhouette: string;
    layerMuscles: string;
    layerVessels: string;
    collapsePanel: string;
    expandPanel: string;
    detailsExpand: string;
    detailsCollapse: string;
    viewFront: string;
    viewSide: string;
    viewBack: string;
    viewReset: string;
    viewFullSpine: string;
    viewFullBrain: string;
    orbitHint: string;
    loadingEngine: string;
    cardProtrusion: string;
    cardCanal: string;
    cardStatus: string;
    cardOpenMri: string;
    cardLocation: string;
    cardCategory: string;
    attribution: string;
    trapeziusBadge: string;
  };
}

export const UI_DICT: Record<Language, UiDictionary> = {
  uk: {
    appBrand: 'MyMed Archive',
    patientShort: 'Пацієнт (1980)',
    nav: {
      anamnesis: 'Анамнез і профіль',
      mri: 'Динаміка МРТ (SOR)',
      atlas3d: '3D-атлас',
      records: 'Обстеження і виписки',
      archive: 'Архів посилань',
      doctor: 'Режим для лікаря',
    },
    navSub: {
      anamnesis: 'Базові дані та 4 зони скарг',
      mri: '16 сегментів • 2025 vs 2026',
      atlas3d: 'Хребет, м’язи та головний мозок',
      records: 'Реєстр досліджень та УЗД',
      archive: 'Google Диск / PDF / DICOM',
      doctor: 'Зведена виписка A4 / PDF',
    },
    actions: {
      doctorMode: 'Режим лікаря / PDF',
      exitDoctorMode: 'До робочого простору',
      printPdf: 'Друк / Зберегти PDF',
      jsonArchive: 'JSON-архів',
      exportJson: 'Експортувати JSON',
      importJson: 'Імпортувати JSON',
      resetDefault: 'Скинути до базового',
      edit: 'Редагувати',
      save: 'Зберегти',
      cancel: 'Скасувати',
      add: 'Додати',
      delete: 'Видалити',
      copyLink: 'Копіювати URL',
      copied: 'Скопійовано',
      openExternal: 'Відкрити',
      close: 'Закрити',
      confirm: 'Підтвердити',
      viewInMri: 'Показати на МРТ',
      openIn3D: '3D',
      privacyMode: 'Режим приватності',
      privacyActive: 'ПІБ та місто приховано',
      themeLight: 'Світла тема',
      themeDark: 'Темна тема',
    },
    anamnesis: {
      sectionTitle: 'Анамнез і базові дані пацієнта',
      sectionSubtitle: 'Персональний профіль, біометричні параметри та структуровані скарги за анатомічними зонами',
      profileTitle: 'Паспортні та клінічні дані',
      editProfile: 'Редагувати профіль',
      fullName: 'ПІБ пацієнта',
      birthYear: 'Рік народження',
      ageSuffix: 'р.',
      region: 'Регіон',
      height: 'Зріст',
      weight: 'Вага',
      bmi: 'ІМТ',
      bloodType: 'Група крові / Rh',
      allergies: 'Алергії',
      vaccinations: 'Вакцинація',
      chronicConditions: 'Хронічні стани',
      currentMedications: 'Поточні препарати',
      notSpecified: 'Не зазначено',
      cmUnit: 'см',
      kgUnit: 'кг',
      complaintsTitle: 'Клінічні скарги за зонами тіла',
      complaintsSubtitle: 'Натисніть на код сегмента, щоб перейти безпосередньо до його порівняння на МРТ SOR 2025–2026',
      editComplaint: 'Редагувати скаргу',
      linkedMriLevels: 'Пов’язані сегменти МРТ:',
      disclaimerLabel: 'Примітка',
      bmiCategories: {
        under: 'Дефіцит маси',
        normal: 'Норма',
        over: 'Надлишкова маса',
        obese: 'Ожиріння',
      },
    },
    mri: {
      sectionTitle: 'Динаміка МРТ хребта (SOR 2025–2026)',
      sectionSubtitle: 'Посегментне зіставлення протоколів другої думки SOR за 21 місяць спостереження',
      providerLabel: 'SOR (Second Opinion in Radiology)',
      radiologistPrefix: 'Експерт:',
      radiologistDefault: 'Незалежний експерт (SOR)',
      scansLabel: 'Знімки: 25.01.2025 → 19.10.2026',
      reportsLabel: 'Протоколи: 10.02.2025 → 26.10.2026',
      intervalLabel: 'Інтервал: ~21 міс.',
      mode2025: '2025 (25.01)',
      mode2026: '2026 (19.10)',
      modeCompare: 'Порівняння / Дельта',
      modeHint: 'Натисніть на будь-який сегмент схеми або графіка для детального розбору',
      regionAll: 'Усі відділи (C2–S1)',
      regionLabels: {
        cervical: 'Шийний відділ',
        thoracic: 'Грудний відділ',
        lumbar: 'Попереково-крижовий відділ',
      },
      regionRanges: {
        cervical: 'C2–D1',
        thoracic: 'D1–D12',
        lumbar: 'L1–S1',
      },
      legendNegative: '▼ Погіршення / негативна динаміка',
      legendNew: '+ Нові зміни у 2026',
      legendStable: '● Без суттєвої динаміки',
      schematicTitle: 'Інтерактивна схема хребта',
      schematicSubtitle: '16 анатомічних рівнів від C2–C3 до L5–S1',
      quickJump: 'Швидкий перехід до сегмента:',
      segmentPrefix: 'Сегмент',
      deltaHeader: 'Динаміка змін (25.01.2025 → 19.10.2026)',
      scan2025Title: 'Знімок 25.01.2025',
      protocol2025: 'Протокол 10.02.2025',
      scan2026Title: 'Знімок 19.10.2026',
      protocol2026: 'Протокол 26.10.2026',
      canalLabel: 'Хребтовий канал:',
      rootsLabel: 'Корінці / кишені:',
      chartsTitle: 'Кількісна динаміка параметрів МРТ',
      chartsSubtitle: 'Клік по сегменту на діаграмі синхронізується зі схемою хребта',
      chartProtrusionTab: 'Випинання / екструзія (мм)',
      chartCanalTab: 'Сагітальний канал vs норма (мм)',
      chartNormLabel: 'Нижня межа норми',
      chartMmUnit: 'мм',
      chartNoProtrusion: 'Без випинання',
      systemicTitle: 'Ключові системні знахідки протоколів SOR',
      tableTitle: 'Зведена таблиця всіх сегментів (2025 vs 2026)',
      tableSubtitle: 'Розміри випинань, сагітальний канал та стан корінцевих воронок',
      colSegment: 'Сегмент',
      col2025: '25.01.2025',
      col2026: '19.10.2026',
      colCanalRoots: 'Канал / Корінці (2026)',
      colDynamics: 'Динаміка',
      linkedAttachments: 'Прикріплені посилання для сегмента:',
    },
    records: {
      sectionTitle: 'Інші обстеження та виписки',
      sectionSubtitle: 'Хронологічний індекс попередніх МРТ, УЗД судин та органів, стаціонарних виписок і лабораторних аналізів',
      searchPlaceholder: 'Пошук за назвою, датою або нотаткою…',
      allCategories: 'Усі записи',
      categories: {
        mri: 'МРТ',
        ultrasound: 'УЗД',
        discharge: 'Виписки та епікриз',
        lab: 'Аналізи',
        other: 'Інше',
      },
      sortNewest: 'Спочатку новіші',
      sortOldest: 'Спочатку старіші',
      addRecord: 'Додати обстеження',
      editRecord: 'Редагувати запис',
      recordTitleLabel: 'Назва обстеження або виписки',
      recordDateLabel: 'Дата / період',
      recordCategoryLabel: 'Категорія',
      recordNotesLabel: 'Короткий висновок / нотатки',
      notesPlaceholder: 'Додайте ключові показники, висновок лікаря або рекомендації…',
      noNotes: 'Нотатки не додано',
      emptySearch: 'За вашим запитом обстежень не знайдено.',
      totalCount: 'Записів:',
      deleteConfirmTitle: 'Видалити запис про обстеження?',
      deleteConfirmBody: 'Запис буде видалено з локального архіву в браузері.',
      linkedFiles: 'Посилань:',
    },
    archive: {
      sectionTitle: 'Архів документів та посилань',
      sectionSubtitle: 'Централізований каталог медичних виписок у Google Диск, PDF-файлів та хмарних DICOM-архівів',
      addLink: 'Додати документ',
      batchAdd: 'Пакетне додавання',
      searchPlaceholder: 'Пошук за назвою, URL, сегментом…',
      allSources: 'Усі джерела',
      sources: {
        gdrive: 'Google Диск',
        cloud: 'DICOM / Хмара',
        clinic: 'Портал клініки',
        other: 'Інше',
      },
      titleLabel: 'Назва матеріалу',
      titlePlaceholder: 'Протокол МРТ SOR 2026 (PDF)',
      urlLabel: 'Посилання (URL)',
      urlPlaceholder: 'https://drive.google.com/file/d/...',
      sourceLabel: 'Джерело',
      dateLabel: 'Дата',
      segmentLabel: 'Прив’язка до сегмента МРТ',
      recordLabel: 'Прив’язка до обстеження',
      notesLabel: 'Коментар',
      noneOption: 'Без прив’язки',
      emptyTitle: 'Архів посилань поки порожній',
      emptyBody: 'У вихідному JSON-файлі масив attachments_and_links порожній. Додайте посилання на медичні виписки й PDF-файли в Google Диск, портали клінік або хмарні DICOM-архіви — вони збережуться у браузері та увійдуть до експорту JSON і виписки лікаря.',
      batchHint: 'Вставте по одному посиланню в рядок (підтримується формат «Назва | https://...» або просто URL). Посилання Google Диск та хмарних DICOM-архівів визначаться автоматично.',
      batchPlaceholder: 'Протокол МРТ SOR 2026 (PDF) | https://drive.google.com/file/d/...\nDICOM-архів МРТ хребта | https://cloud.example.com/dicom/...',
      batchSubmit: 'Додати всі посилання',
      invalidUrl: 'Введіть коректне посилання, що починається з http:// або https://',
      deleteConfirmTitle: 'Видалити посилання з архіву?',
      deleteConfirmBody: 'Це посилання буде видалено з локального сховища.',
      autoDetected: 'Автовизначено:',
    },
    doctor: {
      docHeaderTitle: 'Клінічна зведена виписка пацієнта',
      docHeaderSubtitle: 'Динаміка МРТ хребта (SOR 2025–2026) та анамнестичний огляд',
      printHint: 'Оптимізовано для друку або збереження у PDF на 1–2 аркуші A4 (книжкова орієнтація).',
      patientBlock: '1. Пацієнт та базові дані',
      biometricsBlock: 'Клінічний профіль',
      redFlagsBlock: '2. Ключові зміни SOR 2026 та пріоритетні рекомендації',
      complaintsBlock: '3. Основні скарги за анатомічними зонами',
      mriTableBlockPrefix: '4. Посегментна динаміка МРТ хребта (SOR: 25.01.2025 → 19.10.2026',
      systemicBlock: '5. Системні знахідки протоколу SOR',
      otherRecordsBlock: '6. Індекс попередніх обстежень та виписок',
      linksBlock: '7. Посилання на документи та матеріали (Google Диск / DICOM)',
      noLinksNote: 'Зовнішні посилання ще не додано до архіву.',
      generatedAt: 'Дата формування:',
      languageForPrint: 'Мова виписки:',
    },
    jsonModal: {
      title: 'Керування JSON-архівом',
      subtitle: 'Усі зміни та особисті дані зберігаються виключно локально у вашому браузері (localStorage). Ви можете імпортувати локальний JSON або зберегти резервну копію.',
      exportDesc: 'Завантажити повну копію медкарти у форматі .json з усіма відредагованими полями, нотатками та посиланнями.',
      importDesc: 'Завантажити локальний файл .json із вашого пристрою (включно з реальним ПІБ та даними протоколу). Поточний стан у браузері оновиться після перевірки структури.',
      selectFile: 'Обрати JSON-файл',
      resetTitle: 'Скидання до анонімізованого шаблону',
      resetDesc: 'Очистити локальні правки та повернути стан додатка до нейтральних базових даних без ПІБ.',
      resetConfirmTitle: 'Скинути всі локальні зміни?',
      resetConfirmBody: 'Усі внесені редагування профілю, ПІБ, нотатки та додані посилання буде очищено й замінено базовими анонімізованими даними.',
      importSuccess: 'JSON-архів успішно імпортовано',
      importError: 'Помилка формату JSON: перевірте структуру файлу медкарти',
      exportSuccess: 'JSON-файл медкарти збережено',
      resetSuccess: 'Дані скинуто до анонімізованого шаблону',
      savedToast: 'Зміни збережено локально',
      deletedToast: 'Запис видалено',
    },
    atlas3d: {
      sectionTitle: '3D-атлас анатомії та знахідок МРТ',
      sectionSubtitle: 'Інтерактивний 3D-огляд хребта (SOR 2025–2026) та головного мозку на базі Svitylo 3D Anatomy Atlas',
      sceneSpine: 'Хребет і м’язи',
      sceneBrain: 'Головний мозок і судини',
      sceneSpineShort: 'Хребет',
      sceneBrainShort: 'Мозок',
      segmentsTitle: 'Сегменти хребта',
      brainPointsTitle: 'Точки МРТ мозку',
      layersTitle: 'Оточення і шари',
      layerSilhouette: 'Силует тіла',
      layerHeadSilhouette: 'Силует голови',
      layerMuscles: 'М’язи спини',
      layerVessels: 'Судини',
      collapsePanel: 'Згорнути список',
      expandPanel: 'Показати список',
      detailsExpand: 'Розгорнути деталі сегмента',
      detailsCollapse: 'Згорнути деталі',
      viewFront: 'Спереду',
      viewSide: 'Збоку',
      viewBack: 'Ззаду',
      viewReset: 'Скинути',
      viewFullSpine: 'Весь хребет',
      viewFullBrain: 'Весь мозок',
      orbitHint: 'ЛКМ — обертання · Колесо — зум · Клік по хребцю — фокус',
      loadingEngine: 'Завантаження Svitylo 3D Atlas…',
      cardProtrusion: 'Випинання',
      cardCanal: 'Саг. канал',
      cardStatus: 'Динаміка',
      cardOpenMri: 'Протокол SOR',
      cardLocation: 'Локалізація',
      cardCategory: 'Тип знахідки',
      attribution: 'Svitylo 3D Anatomy Atlas · Z-Anatomy (CC BY-SA 4.0)',
      trapeziusBadge: 'Зміна сигналу верхньої трапеції справа (SOR 2026)',
    },
  },

  ru: {
    appBrand: 'MyMed Archive',
    patientShort: 'Пациент (1980)',
    nav: {
      anamnesis: 'Анамнез и профиль',
      mri: 'Динамика МРТ (SOR)',
      atlas3d: '3D-атлас',
      records: 'Обследования и выписки',
      archive: 'Архив ссылок',
      doctor: 'Режим для врача',
    },
    navSub: {
      anamnesis: 'Базовые данные и 4 зоны жалоб',
      mri: '16 сегментов • 2025 vs 2026',
      atlas3d: 'Позвоночник, мышцы и мозг',
      records: 'Реестр исследований и УЗИ',
      archive: 'Google Диск / PDF / DICOM',
      doctor: 'Сводная выписка A4 / PDF',
    },
    actions: {
      doctorMode: 'Режим врача / PDF',
      exitDoctorMode: 'В рабочий режим',
      printPdf: 'Печать / Сохранить PDF',
      jsonArchive: 'JSON-архив',
      exportJson: 'Экспортировать JSON',
      importJson: 'Импортировать JSON',
      resetDefault: 'Сбросить к базовому',
      edit: 'Редактировать',
      save: 'Сохранить',
      cancel: 'Отмена',
      add: 'Добавить',
      delete: 'Удалить',
      copyLink: 'Копировать URL',
      copied: 'Скопировано',
      openExternal: 'Открыть',
      close: 'Закрыть',
      confirm: 'Подтвердить',
      viewInMri: 'Показать на МРТ',
      openIn3D: '3D',
      privacyMode: 'Режим приватности',
      privacyActive: 'ФИО и город скрыты',
      themeLight: 'Светлая тема',
      themeDark: 'Темная тема',
    },
    anamnesis: {
      sectionTitle: 'Анамнез и базовые данные пациента',
      sectionSubtitle: 'Персональный профиль, биометрические показатели и структурированные жалобы по анатомическим зонам',
      profileTitle: 'Паспортные и клинические данные',
      editProfile: 'Редактировать профиль',
      fullName: 'ФИО пациента',
      birthYear: 'Год рождения',
      ageSuffix: 'л.',
      region: 'Регион',
      height: 'Рост',
      weight: 'Вес',
      bmi: 'ИМТ',
      bloodType: 'Группа крови / Rh',
      allergies: 'Аллергии',
      vaccinations: 'Вакцинация',
      chronicConditions: 'Хронические состояния',
      currentMedications: 'Текущие препараты',
      notSpecified: 'Не указано',
      cmUnit: 'см',
      kgUnit: 'кг',
      complaintsTitle: 'Клинические жалобы по зонам тела',
      complaintsSubtitle: 'Нажмите на код сегмента, чтобы перейти напрямую к его сравнению на МРТ SOR 2025–2026',
      editComplaint: 'Редактировать жалобу',
      linkedMriLevels: 'Связанные сегменты МРТ:',
      disclaimerLabel: 'Примечание',
      bmiCategories: {
        under: 'Дефицит массы',
        normal: 'Норма',
        over: 'Избыточная масса',
        obese: 'Ожирение',
      },
    },
    mri: {
      sectionTitle: 'Динамика МРТ позвоночника (SOR 2025–2026)',
      sectionSubtitle: 'Посегментное сопоставление протоколов второго мнения SOR за 21 месяц наблюдения',
      providerLabel: 'SOR (Second Opinion in Radiology)',
      radiologistPrefix: 'Эксперт:',
      radiologistDefault: 'Независимый эксперт (SOR)',
      scansLabel: 'Снимки: 25.01.2025 → 19.10.2026',
      reportsLabel: 'Протоколы: 10.02.2025 → 26.10.2026',
      intervalLabel: 'Интервал: ~21 мес.',
      mode2025: '2025 (25.01)',
      mode2026: '2026 (19.10)',
      modeCompare: 'Сравнение / Дельта',
      modeHint: 'Нажмите на любой сегмент схемы или графика для детального разбора',
      regionAll: 'Все отделы (C2–S1)',
      regionLabels: {
        cervical: 'Шейный отдел',
        thoracic: 'Грудной отдел',
        lumbar: 'Пояснично-крестцовый отдел',
      },
      regionRanges: {
        cervical: 'C2–D1',
        thoracic: 'D1–D12',
        lumbar: 'L1–S1',
      },
      legendNegative: '▼ Ухудшение / негативная динамика',
      legendNew: '+ Новые изменения в 2026',
      legendStable: '● Без существенной динамики',
      schematicTitle: 'Интерактивная схема позвоночника',
      schematicSubtitle: '16 анатомических уровней от C2–C3 до L5–S1',
      quickJump: 'Быстрый переход к сегменту:',
      segmentPrefix: 'Сегмент',
      deltaHeader: 'Динамика изменений (25.01.2025 → 19.10.2026)',
      scan2025Title: 'Снимок 25.01.2025',
      protocol2025: 'Протокол 10.02.2025',
      scan2026Title: 'Снимок 19.10.2026',
      protocol2026: 'Протокол 26.10.2026',
      canalLabel: 'Позвоночный канал:',
      rootsLabel: 'Корешки / карманы:',
      chartsTitle: 'Количественная динамика параметров МРТ',
      chartsSubtitle: 'Клик по сегменту на диаграмме синхронизируется со схемой позвоночника',
      chartProtrusionTab: 'Выпячивания / экструзия (мм)',
      chartCanalTab: 'Сагиттальный канал vs норма (мм)',
      chartNormLabel: 'Нижняя граница нормы',
      chartMmUnit: 'мм',
      chartNoProtrusion: 'Без выпячивания',
      systemicTitle: 'Ключевые системные находки протоколов SOR',
      tableTitle: 'Сводная таблица всех сегментов (2025 vs 2026)',
      tableSubtitle: 'Размеры выпячиваний, сагиттальный канал и состояние корешковых воронок',
      colSegment: 'Сегмент',
      col2025: '25.01.2025',
      col2026: '19.10.2026',
      colCanalRoots: 'Канал / Корешки (2026)',
      colDynamics: 'Динамика',
      linkedAttachments: 'Прикрепленные ссылки для сегмента:',
    },
    records: {
      sectionTitle: 'Остальные обследования и выписки',
      sectionSubtitle: 'Хронологический индекс предыдущих МРТ, УЗИ сосудов и органов, стационарных выписок и лабораторных анализов',
      searchPlaceholder: 'Поиск по названию, дате или заметке…',
      allCategories: 'Все записи',
      categories: {
        mri: 'МРТ',
        ultrasound: 'УЗИ',
        discharge: 'Выписки и эпикриз',
        lab: 'Анализы',
        other: 'Другое',
      },
      sortNewest: 'Сначала новые',
      sortOldest: 'Сначала старые',
      addRecord: 'Добавить обследование',
      editRecord: 'Редактировать запись',
      recordTitleLabel: 'Название обследования или выписки',
      recordDateLabel: 'Дата / период',
      recordCategoryLabel: 'Категория',
      recordNotesLabel: 'Краткое заключение / заметки',
      notesPlaceholder: 'Добавьте ключевые показатели, заключение врача или рекомендации…',
      noNotes: 'Заметки не добавлены',
      emptySearch: 'По вашему запросу обследований не найдено.',
      totalCount: 'Записей:',
      deleteConfirmTitle: 'Удалить запись об обследовании?',
      deleteConfirmBody: 'Запись будет удалена из локального архива в браузере.',
      linkedFiles: 'Ссылок:',
    },
    archive: {
      sectionTitle: 'Архив документов и ссылок',
      sectionSubtitle: 'Централизованный каталог медицинских выписок в Google Диск, PDF-файлов и облачных DICOM-архивов',
      addLink: 'Добавить документ',
      batchAdd: 'Пакетное добавление',
      searchPlaceholder: 'Поиск по названию, URL, сегменту…',
      allSources: 'Все источники',
      sources: {
        gdrive: 'Google Диск',
        cloud: 'DICOM / Облако',
        clinic: 'Портал клиники',
        other: 'Другое',
      },
      titleLabel: 'Название материала',
      titlePlaceholder: 'Протокол МРТ SOR 2026 (PDF)',
      urlLabel: 'Ссылка (URL)',
      urlPlaceholder: 'https://drive.google.com/file/d/...',
      sourceLabel: 'Источник',
      dateLabel: 'Дата',
      segmentLabel: 'Привязка к сегменту МРТ',
      recordLabel: 'Привязка к обследованию',
      notesLabel: 'Комментарий',
      noneOption: 'Без привязки',
      emptyTitle: 'Архив ссылок пока пуст',
      emptyBody: 'В исходном JSON-файле массив attachments_and_links пуст. Добавьте ссылки на медицинские выписки и PDF-файлы в Google Диск, порталы клиник или облачные DICOM-архивы — они сохранятся в браузере и войдут в экспорт JSON и выписку для врача.',
      batchHint: 'Вставьте по одной ссылке в строку (поддерживается формат «Название | https://...» или просто URL). Ссылки Google Диск и облачных DICOM-архивов определятся автоматически.',
      batchPlaceholder: 'Протокол МРТ SOR 2026 (PDF) | https://drive.google.com/file/d/...\nDICOM-архив МРТ позвоночника | https://cloud.example.com/dicom/...',
      batchSubmit: 'Добавить все ссылки',
      invalidUrl: 'Введите корректную ссылку, начинающуюся с http:// или https://',
      deleteConfirmTitle: 'Удалить ссылку из архива?',
      deleteConfirmBody: 'Эта ссылка будет удалена из локального хранилища.',
      autoDetected: 'Автоопределено:',
    },
    doctor: {
      docHeaderTitle: 'Клиническая сводная выписка пациента',
      docHeaderSubtitle: 'Динамика МРТ позвоночника (SOR 2025–2026) и анамнестический обзор',
      printHint: 'Оптимизировано для печати или сохранения в PDF на 1–2 листа A4 (книжная ориентация).',
      patientBlock: '1. Пациент и базовые данные',
      biometricsBlock: 'Клинический профиль',
      redFlagsBlock: '2. Ключевые изменения SOR 2026 и приоритетные рекомендации',
      complaintsBlock: '3. Основные жалобы по анатомическим зонам',
      mriTableBlockPrefix: '4. Посегментная динамика МРТ позвоночника (SOR: 25.01.2025 → 19.10.2026',
      systemicBlock: '5. Системные находки протокола SOR',
      otherRecordsBlock: '6. Индекс предыдущих обследований и выписок',
      linksBlock: '7. Ссылки на документы и материалы (Google Диск / DICOM)',
      noLinksNote: 'Внешние ссылки еще не добавлены в архив.',
      generatedAt: 'Дата формирования:',
      languageForPrint: 'Язык выписки:',
    },
    jsonModal: {
      title: 'Управление JSON-архивом',
      subtitle: 'Все изменения и персональные данные хранятся только локально в вашем браузере (localStorage). Вы можете импортировать локальный JSON или скачать резервную копию.',
      exportDesc: 'Скачать полную копию медкарты в формате .json со всеми отредактированными полями, заметками и ссылками.',
      importDesc: 'Загрузить локальный файл .json с вашего устройства (включая реальное ФИО и данные протокола). Текущее состояние обновится после проверки структуры.',
      selectFile: 'Выбрать JSON-файл',
      resetTitle: 'Сброс к анонимизированному шаблону',
      resetDesc: 'Очистить локальные правки и вернуть состояние приложения к нейтральным базовым данным без ФИО.',
      resetConfirmTitle: 'Сбросить все локальные изменения?',
      resetConfirmBody: 'Все внесенные правки профиля, ФИО, заметки и добавленные ссылки будут очищены и заменены базовыми анонимизированными данными.',
      importSuccess: 'JSON-архив успешно импортирован',
      importError: 'Ошибка формата JSON: проверьте структуру файла медкарты',
      exportSuccess: 'JSON-файл медкарты сохранен',
      resetSuccess: 'Данные сброшены к анонимизированному шаблону',
      savedToast: 'Изменения сохранены локально',
      deletedToast: 'Запись удалена',
    },
    atlas3d: {
      sectionTitle: '3D-атлас анатомии и находок МРТ',
      sectionSubtitle: 'Интерактивный 3D-обзор позвоночника (SOR 2025–2026) и головного мозга на базе Svitylo 3D Anatomy Atlas',
      sceneSpine: 'Позвоночник и мышцы',
      sceneBrain: 'Головной мозг и сосуды',
      sceneSpineShort: 'Позвоночник',
      sceneBrainShort: 'Мозг',
      segmentsTitle: 'Сегменты позвоночника',
      brainPointsTitle: 'Точки МРТ мозга',
      layersTitle: 'Окружение и слои',
      layerSilhouette: 'Силуэт тела',
      layerHeadSilhouette: 'Силуэт головы',
      layerMuscles: 'Мышцы спины',
      layerVessels: 'Сосуды',
      collapsePanel: 'Свернуть список',
      expandPanel: 'Показать список',
      detailsExpand: 'Развернуть детали сегмента',
      detailsCollapse: 'Свернуть детали',
      viewFront: 'Спереди',
      viewSide: 'Сбоку',
      viewBack: 'Сзади',
      viewReset: 'Сбросить',
      viewFullSpine: 'Весь позвоночник',
      viewFullBrain: 'Весь мозг',
      orbitHint: 'ЛКМ — вращение · Колесо — зум · Клик по позвонку — фокус',
      loadingEngine: 'Загрузка Svitylo 3D Atlas…',
      cardProtrusion: 'Выпячивание',
      cardCanal: 'Саг. канал',
      cardStatus: 'Динамика',
      cardOpenMri: 'Протокол SOR',
      cardLocation: 'Локализация',
      cardCategory: 'Тип находки',
      attribution: 'Svitylo 3D Anatomy Atlas · Z-Anatomy (CC BY-SA 4.0)',
      trapeziusBadge: 'Изменение сигнала верхней трапеции справа (SOR 2026)',
    },
  },

  en: {
    appBrand: 'MyMed Archive',
    patientShort: 'Patient (1980)',
    nav: {
      anamnesis: 'Anamnesis & Profile',
      mri: 'Spine MRI (SOR)',
      atlas3d: '3D Atlas',
      records: 'Exams & Discharges',
      archive: 'Links Archive',
      doctor: 'Doctor View',
    },
    navSub: {
      anamnesis: 'Baseline data & 4 symptom zones',
      mri: '16 segments • 2025 vs 2026',
      atlas3d: 'Spine, muscles & brain vessels',
      records: 'Prior MRI, ultrasound & labs',
      archive: 'Google Drive / PDF / DICOM',
      doctor: 'Printable A4 / PDF summary',
    },
    actions: {
      doctorMode: 'Doctor View / PDF',
      exitDoctorMode: 'Back to Workspace',
      printPdf: 'Print / Save PDF',
      jsonArchive: 'JSON Archive',
      exportJson: 'Export JSON',
      importJson: 'Import JSON',
      resetDefault: 'Reset to Baseline',
      edit: 'Edit',
      save: 'Save',
      cancel: 'Cancel',
      add: 'Add',
      delete: 'Delete',
      copyLink: 'Copy URL',
      copied: 'Copied',
      openExternal: 'Open',
      close: 'Close',
      confirm: 'Confirm',
      viewInMri: 'Inspect on MRI',
      openIn3D: '3D',
      privacyMode: 'Privacy Mode',
      privacyActive: 'Name & location masked',
      themeLight: 'Light theme',
      themeDark: 'Dark theme',
    },
    anamnesis: {
      sectionTitle: 'Anamnesis & Patient Baseline',
      sectionSubtitle: 'Personal medical profile, biometric metrics, and structured clinical complaints by anatomical zone',
      profileTitle: 'Identification & Clinical Baseline',
      editProfile: 'Edit Profile',
      fullName: 'Full Name',
      birthYear: 'Birth Year',
      ageSuffix: 'y.o.',
      region: 'Location',
      height: 'Height',
      weight: 'Weight',
      bmi: 'BMI',
      bloodType: 'Blood Type / Rh',
      allergies: 'Allergies',
      vaccinations: 'Vaccinations',
      chronicConditions: 'Chronic Conditions',
      currentMedications: 'Current Medications',
      notSpecified: 'Not specified',
      cmUnit: 'cm',
      kgUnit: 'kg',
      complaintsTitle: 'Clinical Complaints by Anatomical Zone',
      complaintsSubtitle: 'Click any segment code to jump directly to its SOR 2025–2026 MRI comparison',
      editComplaint: 'Edit Complaint',
      linkedMriLevels: 'Related MRI levels:',
      disclaimerLabel: 'Notice',
      bmiCategories: {
        under: 'Underweight',
        normal: 'Normal',
        over: 'Overweight',
        obese: 'Obese',
      },
    },
    mri: {
      sectionTitle: 'Spine MRI Dynamics (SOR 2025–2026)',
      sectionSubtitle: 'Segment-by-segment comparison of Second Opinion in Radiology reports across a 21-month interval',
      providerLabel: 'SOR (Second Opinion in Radiology)',
      radiologistPrefix: 'Expert:',
      radiologistDefault: 'Independent Expert (SOR)',
      scansLabel: 'Scans: 25.01.2025 → 19.10.2026',
      reportsLabel: 'Reports: 10.02.2025 → 26.10.2026',
      intervalLabel: 'Interval: ~21 mo.',
      mode2025: '2025 (Jan 25)',
      mode2026: '2026 (Oct 19)',
      modeCompare: 'Compare / Delta',
      modeHint: 'Select any segment on the spine schematic or charts for full clinical comparison',
      regionAll: 'All Regions (C2–S1)',
      regionLabels: {
        cervical: 'Cervical Spine',
        thoracic: 'Thoracic Spine',
        lumbar: 'Lumbosacral Spine',
      },
      regionRanges: {
        cervical: 'C2–D1',
        thoracic: 'D1–D12',
        lumbar: 'L1–S1',
      },
      legendNegative: '▼ Negative progression',
      legendNew: '+ New findings in 2026',
      legendStable: '● Stable / no major change',
      schematicTitle: 'Interactive Spine Schematic',
      schematicSubtitle: '16 anatomical levels from C2–C3 to L5–S1',
      quickJump: 'Quick jump to segment:',
      segmentPrefix: 'Segment',
      deltaHeader: 'Progression Summary (25.01.2025 → 19.10.2026)',
      scan2025Title: 'Scan 25.01.2025',
      protocol2025: 'Report 10.02.2025',
      scan2026Title: 'Scan 19.10.2026',
      protocol2026: 'Report 26.10.2026',
      canalLabel: 'Spinal canal:',
      rootsLabel: 'Roots / recesses:',
      chartsTitle: 'Quantitative MRI Measurements',
      chartsSubtitle: 'Clicking any bar synchronizes with the spine schematic and detail inspector',
      chartProtrusionTab: 'Protrusion / Extrusion (mm)',
      chartCanalTab: 'Sagittal Canal vs Norm (mm)',
      chartNormLabel: 'Clinical lower norm',
      chartMmUnit: 'mm',
      chartNoProtrusion: 'No herniation',
      systemicTitle: 'Key Systemic SOR Protocol Findings',
      tableTitle: 'Full Segment Summary Table (2025 vs 2026)',
      tableSubtitle: 'Protrusion depth, sagittal canal diameter, and foraminal/recess status',
      colSegment: 'Segment',
      col2025: '25.01.2025',
      col2026: '19.10.2026',
      colCanalRoots: 'Canal / Roots (2026)',
      colDynamics: 'Dynamics',
      linkedAttachments: 'Attached links for this segment:',
    },
    records: {
      sectionTitle: 'Other Examinations & Discharges',
      sectionSubtitle: 'Chronological index of prior MRI studies, vascular & abdominal ultrasounds, inpatient discharges, and lab results',
      searchPlaceholder: 'Search by title, date, or clinical note…',
      allCategories: 'All Records',
      categories: {
        mri: 'MRI',
        ultrasound: 'Ultrasound',
        discharge: 'Discharges & Epicrisis',
        lab: 'Lab Tests',
        other: 'Other',
      },
      sortNewest: 'Newest first',
      sortOldest: 'Oldest first',
      addRecord: 'Add Examination',
      editRecord: 'Edit Record',
      recordTitleLabel: 'Examination or discharge title',
      recordDateLabel: 'Date / Period',
      recordCategoryLabel: 'Category',
      recordNotesLabel: 'Summary / Clinical notes',
      notesPlaceholder: 'Add key values, physician conclusions, or follow-up instructions…',
      noNotes: 'No notes added',
      emptySearch: 'No examinations match your current search or filter.',
      totalCount: 'Records:',
      deleteConfirmTitle: 'Delete examination record?',
      deleteConfirmBody: 'This record will be removed from your local browser archive.',
      linkedFiles: 'Links:',
    },
    archive: {
      sectionTitle: 'Documents & Links Archive',
      sectionSubtitle: 'Centralized catalog of medical reports in Google Drive, PDF files, and cloud DICOM archives',
      addLink: 'Add Document',
      batchAdd: 'Batch Add',
      searchPlaceholder: 'Search by title, URL, or MRI segment…',
      allSources: 'All Sources',
      sources: {
        gdrive: 'Google Drive',
        cloud: 'DICOM / Cloud',
        clinic: 'Clinic Portal',
        other: 'Other',
      },
      titleLabel: 'Resource Title',
      titlePlaceholder: 'SOR 2026 Spine MRI Report (PDF)',
      urlLabel: 'URL',
      urlPlaceholder: 'https://drive.google.com/file/d/...',
      sourceLabel: 'Platform',
      dateLabel: 'Date',
      segmentLabel: 'Link to MRI Segment',
      recordLabel: 'Link to Examination',
      notesLabel: 'Notes',
      noneOption: 'None',
      emptyTitle: 'Links archive is currently empty',
      emptyBody: 'In the initial JSON file, the attachments_and_links list is empty. Add links to medical reports and PDF files in Google Drive, clinic portals, or cloud DICOM archives—they persist locally and are included in JSON exports and Doctor View.',
      batchHint: 'Paste one link per line (supports "Title | https://..." or plain URLs). Google Drive and cloud DICOM links are detected automatically.',
      batchPlaceholder: 'SOR 2026 Spine MRI Report (PDF) | https://drive.google.com/file/d/...\nSpine MRI DICOM Archive | https://cloud.example.com/dicom/...',
      batchSubmit: 'Import All Links',
      invalidUrl: 'Please enter a valid URL starting with http:// or https://',
      deleteConfirmTitle: 'Remove link from archive?',
      deleteConfirmBody: 'This link will be removed from your local browser storage.',
      autoDetected: 'Auto-detected:',
    },
    doctor: {
      docHeaderTitle: 'Clinical Patient Summary Sheet',
      docHeaderSubtitle: 'Spine MRI Progression (SOR 2025–2026) & Anamnesis Overview',
      printHint: 'Formatted for crisp 1–2 page A4 printing or Save as PDF (portrait orientation).',
      patientBlock: '1. Patient Identification & Baseline',
      biometricsBlock: 'Clinical Profile',
      redFlagsBlock: '2. Priority SOR 2026 Alerts & Actionable Recommendations',
      complaintsBlock: '3. Chief Complaints by Anatomical Zone',
      mriTableBlockPrefix: '4. Segment-by-Segment Spine MRI Dynamics (SOR: 25.01.2025 → 19.10.2026',
      systemicBlock: '5. Systemic SOR Protocol Findings',
      otherRecordsBlock: '6. Index of Prior Studies & Discharges',
      linksBlock: '7. Reference Documents & Links (Google Drive / DICOM)',
      noLinksNote: 'No external reference links added yet.',
      generatedAt: 'Prepared on:',
      languageForPrint: 'Summary language:',
    },
    jsonModal: {
      title: 'JSON Archive Management',
      subtitle: 'All edits and personal data remain strictly local in your browser (localStorage). Import a local JSON file or export a portable backup.',
      exportDesc: 'Download the complete medical record as a .json file including all edited profile fields, notes, and archive links.',
      importDesc: 'Upload a local .json file from your device (including real patient/report identity). Your browser state updates after schema validation.',
      selectFile: 'Choose JSON File',
      resetTitle: 'Reset to Anonymized Baseline',
      resetDesc: 'Clear local edits and restore the workspace to neutral anonymized defaults.',
      resetConfirmTitle: 'Reset all local edits?',
      resetConfirmBody: 'All profile edits, personal names, custom notes, and added links will be cleared and replaced by anonymized defaults.',
      importSuccess: 'JSON archive imported successfully',
      importError: 'Invalid JSON format: please verify the medical card file schema',
      exportSuccess: 'Downloaded medical card JSON file',
      resetSuccess: 'Restored anonymized baseline',
      savedToast: 'Changes saved locally',
      deletedToast: 'Item removed',
    },
    atlas3d: {
      sectionTitle: '3D Anatomy & MRI Findings Atlas',
      sectionSubtitle: 'Interactive 3D spine (SOR 2025–2026) and brain visualization powered by Svitylo 3D Anatomy Atlas',
      sceneSpine: 'Spine & Muscles',
      sceneBrain: 'Brain & Vessels',
      sceneSpineShort: 'Spine',
      sceneBrainShort: 'Brain',
      segmentsTitle: 'Spine Segments',
      brainPointsTitle: 'Brain MRI Landmarks',
      layersTitle: 'Context & Layers',
      layerSilhouette: 'Body Silhouette',
      layerHeadSilhouette: 'Head Silhouette',
      layerMuscles: 'Back Muscles',
      layerVessels: 'Vessels',
      collapsePanel: 'Collapse list',
      expandPanel: 'Show list',
      detailsExpand: 'Expand segment details',
      detailsCollapse: 'Collapse details',
      viewFront: 'Front',
      viewSide: 'Side',
      viewBack: 'Back',
      viewReset: 'Reset',
      viewFullSpine: 'Full Spine',
      viewFullBrain: 'Full Brain',
      orbitHint: 'Drag to rotate · Scroll to zoom · Click vertebra to focus',
      loadingEngine: 'Loading Svitylo 3D Atlas…',
      cardProtrusion: 'Protrusion',
      cardCanal: 'Sag. Canal',
      cardStatus: 'Dynamics',
      cardOpenMri: 'SOR Protocol',
      cardLocation: 'Localization',
      cardCategory: 'Finding Type',
      attribution: 'Svitylo 3D Anatomy Atlas · Z-Anatomy (CC BY-SA 4.0)',
      trapeziusBadge: 'Right upper trapezius signal change (SOR 2026)',
    },
  },
};
