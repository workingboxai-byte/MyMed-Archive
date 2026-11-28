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
    pagePrefix: string;
    sourceLabel: string;
    dateLabel: string;
    segmentLabel: string;
    segmentGroups: {
      regions: string;
      segments: string;
    };
    recordLabel: string;
    recordPlaceholder: string;
    createRecordHint: string;
    clearSelection: string;
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
  treatments: {
    sectionTitle: string;
    sectionSubtitle: string;
    addCourse: string;
    editCourse: string;
    searchPlaceholder: string;
    filterAll: string;
    filterActive: string;
    filterInpatient: string;
    filterOutpatient: string;
    totalCount: string;
    courseTypeLabel: string;
    courseTypes: {
      inpatient: string;
      outpatient: string;
    };
    statusLabel: string;
    statuses: {
      active: string;
      completed: string;
    };
    periodLabel: string;
    periodPlaceholder: string;
    prescribedByLabel: string;
    prescribedByPlaceholder: string;
    linkedRecordLabel: string;
    linkedRecordNone: string;
    linkedRecordDischargesGroup: string;
    linkedRecordOtherGroup: string;
    linkedRecordPrefix: string;
    medicationsLabel: string;
    addMedication: string;
    medName: string;
    medNamePlaceholder: string;
    medDosage: string;
    medDosagePlaceholder: string;
    medSchedule: string;
    medSchedulePlaceholder: string;
    medDuration: string;
    medDurationPlaceholder: string;
    removeMedication: string;
    noMedications: string;
    proceduresLabel: string;
    proceduresPlaceholder: string;
    emptyTitle: string;
    emptyBody: string;
    emptySearch: string;
    deleteConfirmTitle: string;
    deleteConfirmBody: string;
    validationError: string;
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
    treatmentsBlock: string;
    noTreatmentsNote: string;
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
    mode3d: string;
    mode2d: string;
    overviewButton: string;
    overviewTitle: string;
    overviewSubtitle: string;
    mriBlockTitle: string;
    neuroBlockTitle: string;
    dermatomeLabel: string;
    myotomeLabel: string;
    neuroDisclaimer: string;
    protrusionChangeLabel: string;
    canalChangeLabel: string;
    finding2026Label: string;
    roots2026Label: string;
    problemCountLabel: string;
    negativeCountLabel: string;
    newCountLabel: string;
    stableCountLabel: string;
    regionSegmentsLabel: string;
    schematicHint: string;
  };
  privacyVault: {
    // Profile PIN settings
    pinSectionTitle: string;
    pinSectionSubtitle: string;
    pinStatusActive: string;
    pinStatusNotSet: string;
    pinHashHint: string;
    setPinBtn: string;
    changePinBtn: string;
    removePinBtn: string;
    currentPinLabel: string;
    newPinLabel: string;
    confirmPinLabel: string;
    pinPlaceholder: string;
    pinMinLengthError: string;
    pinMismatchError: string;
    pinWrongError: string;
    pinSavedToast: string;
    pinChangedToast: string;
    pinRemovedToast: string;
    removePinConfirmTitle: string;
    removePinConfirmBody: string;
    removePinWarningWithVault: string;
    // Unlock modal
    unlockPrivacyTitle: string;
    unlockPrivacySubtitle: string;
    unlockVaultTitle: string;
    unlockVaultSubtitle: string;
    enterPinLabel: string;
    unlockButton: string;
    privacyLockedHint: string;
    privacyEnabledToast: string;
    privacyUnlockedToast: string;
    vaultUnlockedToast: string;
    vaultLockedToast: string;
    // Personal Vault card
    vaultTitle: string;
    vaultSubtitle: string;
    vaultAesBadge: string;
    vaultExcludedNotice: string;
    vaultNoPinTitle: string;
    vaultNoPinBody: string;
    vaultLockedTitle: string;
    vaultLockedPrivacyBody: string;
    vaultLockedBody: string;
    vaultLockedCountPrefix: string;
    unlockWithPinBtn: string;
    lockVaultBtn: string;
    addItemBtn: string;
    editItemTitle: string;
    newItemTitle: string;
    categoryLabel: string;
    categories: {
      vod: string;
      vlk: string;
      rezerv: string;
      personal: string;
    };
    itemTitleLabel: string;
    itemTitlePlaceholder: string;
    itemDateLabel: string;
    itemDatePlaceholder: string;
    itemUrlsLabel: string;
    itemUrlsPlaceholder: string;
    itemNotesLabel: string;
    itemNotesPlaceholder: string;
    itemValidationError: string;
    itemInvalidUrlError: string;
    emptyVaultTitle: string;
    emptyVaultBody: string;
    deleteItemConfirmTitle: string;
    deleteItemConfirmBody: string;
    pagePrefix: string;
    jsonEncryptedVaultNote: string;
  };
  doctorPrint: {
    includeSpine2D: string;
    spineDiagramTitle: string;
    followUpInlineLabel: string;
    copySummaryBtn: string;
    copiedSummaryBtn: string;
    shareSummaryBtn: string;
    summaryCopiedToast: string;
    summarySharedToast: string;
  };
  mobileNav: {
    profile: string;
    mri: string;
    atlas: string;
    records: string;
    archive: string;
    more: string;
    drawerTitle: string;
    quickSearch: string;
  };
  globalSearch: {
    buttonLabel: string;
    placeholder: string;
    emptyPrompt: string;
    noResults: string;
    quickExamplesLabel: string;
    navigateHint: string;
    enterHint: string;
    escHint: string;
    resultsCount: string;
    groups: {
      mri: string;
      records: string;
      treatments: string;
      archive: string;
      followUp: string;
    };
  };
  followUp: {
    sectionTitle: string;
    sectionSubtitle: string;
    inputPlaceholder: string;
    datePlaceholder: string;
    addBtn: string;
    emptyText: string;
    completedOf: string;
    pendingCount: string;
    deleteLabel: string;
    markDoneLabel: string;
    markUndoneLabel: string;
    addToCalendarBtn: string;
    calendarDownloadedToast: string;
  };
  undo: {
    deletedToast: string;
    undoBtn: string;
    restoredToast: string;
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
      treatments: 'Лікування',
      archive: 'Архів посилань',
      doctor: 'Режим для лікаря',
    },
    navSub: {
      anamnesis: 'Базові дані та 4 зони скарг',
      mri: '16 сегментів • 2025 vs 2026',
      atlas3d: 'Хребет, м’язи та головний мозок',
      records: 'Реєстр досліджень та УЗД',
      treatments: 'Курси препаратів та призначення',
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
      sectionTitle: 'Обстеження та виписки',
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
      urlPlaceholder: 'Вставте одне або кілька посилань — кожне з нового рядка (по порядку сторінок)',
      pagePrefix: 'Стор.',
      sourceLabel: 'Джерело',
      dateLabel: 'Дата',
      segmentLabel: 'Прив’язка до сегмента МРТ',
      segmentGroups: {
        regions: 'Відділи хребта (цілком)',
        segments: 'Окремі сегменти',
      },
      recordLabel: 'Прив’язка до обстеження',
      recordPlaceholder: 'Оберіть обстеження або впишіть нову назву…',
      createRecordHint: 'При збереженні буде створено нове обстеження:',
      clearSelection: 'Очистити прив’язку',
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
    treatments: {
      sectionTitle: 'Лікування та призначення',
      sectionSubtitle: 'Структурований облік стаціонарних і амбулаторних курсів, схем прийому препаратів та фізіопроцедур',
      addCourse: 'Додати курс лікування',
      editCourse: 'Редагувати курс лікування',
      searchPlaceholder: 'Пошук за препаратом, лікарем або рекомендаціями…',
      filterAll: 'Усі',
      filterActive: 'Приймаю зараз',
      filterInpatient: 'Стаціонар',
      filterOutpatient: 'Амбулаторно',
      totalCount: 'Курсів:',
      courseTypeLabel: 'Тип курсу',
      courseTypes: {
        inpatient: 'Стаціонар',
        outpatient: 'Амбулаторно / Після виписки',
      },
      statusLabel: 'Статус',
      statuses: {
        active: 'Приймаю зараз',
        completed: 'Завершено',
      },
      periodLabel: 'Період / дата призначення',
      periodPlaceholder: '04.03.2025 – 13.03.2025',
      prescribedByLabel: 'Хто призначив (лікар / спеціальність)',
      prescribedByPlaceholder: 'Невропатолог стаціонару',
      linkedRecordLabel: 'Прив’язка до виписки / обстеження',
      linkedRecordNone: 'Без прив’язки до виписки',
      linkedRecordDischargesGroup: 'Виписки та епікриз',
      linkedRecordOtherGroup: 'Інші обстеження',
      linkedRecordPrefix: 'Виписка:',
      medicationsLabel: 'Список препаратів',
      addMedication: 'Додати препарат',
      medName: 'Назва препарату',
      medNamePlaceholder: 'Мідокалм / Дексалгін…',
      medDosage: 'Дозування',
      medDosagePlaceholder: '150 мг',
      medSchedule: 'Схема прийому',
      medSchedulePlaceholder: '1 таб. × 2 р/д після їжі',
      medDuration: 'Тривалість курсу',
      medDurationPlaceholder: '10 днів',
      removeMedication: 'Видалити препарат',
      noMedications: 'Препарати не вказані',
      proceduresLabel: 'Фізіопроцедури та рекомендації',
      proceduresPlaceholder: 'ЛФК, магнітотерапія, обмеження підйому ваги, контрольна ЕНМГ…',
      emptyTitle: 'Курси лікування ще не додані',
      emptyBody: 'Додайте стаціонарні або амбулаторні курси зі списком препаратів, дозуванням, схемою прийому та фізіопроцедурами — вони збережуться у браузері та автоматично потраплять до режиму лікаря і JSON-архіву.',
      emptySearch: 'За вашим запитом курсів лікування не знайдено.',
      deleteConfirmTitle: 'Видалити курс лікування?',
      deleteConfirmBody: 'Цей курс лікування буде видалено з локального сховища.',
      validationError: 'Вкажіть лікаря або додайте хоча б один препарат чи рекомендацію.',
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
      treatmentsBlock: '6. Актуальні та останні курси лікування',
      noTreatmentsNote: 'Курси лікування ще не додано.',
      otherRecordsBlock: '7. Індекс попередніх обстежень та виписок',
      linksBlock: '8. Посилання на документи та матеріали (Google Диск / DICOM)',
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
      mode3d: '3D',
      mode2d: '2D-схема',
      overviewButton: 'Весь хребет / Огляд відділів',
      overviewTitle: 'Огляд відділів хребта',
      overviewSubtitle: 'Зведення проблемних сегментів за даними МРТ SOR (2025 → 2026)',
      mriBlockTitle: 'Динаміка МРТ (SOR 2025 → 2026)',
      neuroBlockTitle: 'Доказова нейроанатомія (зона іннервації / дерматом)',
      dermatomeLabel: 'Зона чутливості та болю',
      myotomeLabel: 'Рухова іннервація (міотом)',
      neuroDisclaimer: 'Довідкова нейроанатомія: співвідношення МРТ-знахідок зі скаргами потребує оцінки невролога.',
      protrusionChangeLabel: 'Випинання / грижа',
      canalChangeLabel: 'Сагітальний канал',
      finding2026Label: 'Висновок 2026',
      roots2026Label: 'Корінці / канал',
      problemCountLabel: 'Проблемних',
      negativeCountLabel: 'Погіршення',
      newCountLabel: 'Нові зміни',
      stableCountLabel: 'Стабільно',
      regionSegmentsLabel: 'Сегменти відділу',
      schematicHint: 'Бокова проєкція · Клік по диску або дужці відділу для деталізації',
    },
    privacyVault: {
      pinSectionTitle: 'Захист PIN-кодом',
      pinSectionSubtitle: 'Увімкнення «Режиму приватності» — в 1 клік, вимкнення та доступ до сейфа — лише за PIN-кодом.',
      pinStatusActive: 'PIN-код активовано (SHA-256)',
      pinStatusNotSet: 'PIN-код не задано',
      pinHashHint: 'Зберігається лише солоний SHA-256 хеш (Web Crypto API), пароль у відкритому вигляді не записується.',
      setPinBtn: 'Задати PIN-код',
      changePinBtn: 'Змінити PIN',
      removePinBtn: 'Вимкнути PIN',
      currentPinLabel: 'Поточний PIN-код',
      newPinLabel: 'Новий PIN-код (від 4 символів або 4 цифри)',
      confirmPinLabel: 'Підтвердьте PIN-код',
      pinPlaceholder: '••••',
      pinMinLengthError: 'Введіть щонайменше 4 символи (наприклад, 4-значний PIN або короткий пароль).',
      pinMismatchError: 'Введені PIN-коди не збігаються.',
      pinWrongError: 'Невірний PIN-код. Спробуйте ще раз.',
      pinSavedToast: 'PIN-код встановлено (SHA-256)',
      pinChangedToast: 'PIN-код оновлено та сейф перешифровано',
      pinRemovedToast: 'Захист PIN-кодом вимкнено',
      removePinConfirmTitle: 'Вимкнути захист PIN-кодом?',
      removePinConfirmBody: 'Для підтвердження введіть поточний PIN-код. Після вимкнення «Режим приватності» можна буде перемикати без пароля.',
      removePinWarningWithVault: 'Увага: в «Особистому сейфі» є зашифровані записи. Щоб не зберігати їх у відкритому вигляді, при вимкненні PIN-коду вміст сейфа буде очищено.',
      unlockPrivacyTitle: 'Вимкнути режим приватності',
      unlockPrivacySubtitle: 'Введіть PIN-код, щоб повернути відображення ПІБ, чутливих даних та відкрити Особистий сейф.',
      unlockVaultTitle: 'Розблокувати Особистий сейф',
      unlockVaultSubtitle: 'Введіть PIN-код для розшифрування особистих документів (AES-GCM).',
      enterPinLabel: 'PIN-код / пароль',
      unlockButton: 'Розблокувати',
      privacyLockedHint: 'Приватність активна (розблокування за PIN)',
      privacyEnabledToast: 'Режим приватності увімкнено, сейф заблоковано',
      privacyUnlockedToast: 'Режим приватності вимкнено',
      vaultUnlockedToast: 'Особистий сейф розблоковано',
      vaultLockedToast: 'Особистий сейф заблоковано',
      vaultTitle: 'Особистий сейф',
      vaultSubtitle: 'Зашифроване сховище для особистих посилань і нотаток (ВОД, довідка ВЛК, Резерв+).',
      vaultAesBadge: 'AES-GCM шифрування',
      vaultExcludedNotice: 'Ніколи не потрапляє у «Режим для лікаря / PDF» та у пошук',
      vaultNoPinTitle: 'Задайте PIN-код для активації Особистого сейфа',
      vaultNoPinBody: 'Усі записи сейфа (ВОД, ВЛК, Резерв+) шифруються локально алгоритмом AES-GCM за вашим PIN-кодом перед збереженням у localStorage та JSON-архів.',
      vaultLockedTitle: 'Особистий сейф заблоковано',
      vaultLockedPrivacyBody: 'Активний «Режим приватності» — вміст сейфа повністю приховано та зашифровано.',
      vaultLockedBody: 'Вміст сейфа зашифровано (AES-GCM) і не відображається до введення PIN-коду.',
      vaultLockedCountPrefix: 'Зашифрованих записів:',
      unlockWithPinBtn: 'Розблокувати за PIN',
      lockVaultBtn: 'Заблокувати сейф',
      addItemBtn: 'Додати запис',
      editItemTitle: 'Редагувати запис сейфа',
      newItemTitle: 'Новий запис в Особистий сейф',
      categoryLabel: 'Тип документа',
      categories: {
        vod: 'ВОД',
        vlk: 'Довідка ВЛК',
        rezerv: 'Резерв+',
        personal: 'Особисте',
      },
      itemTitleLabel: 'Назва запису *',
      itemTitlePlaceholder: 'Наприклад: Витяг Резерв+ або Постанова ВЛК',
      itemDateLabel: 'Дата / термін дії',
      itemDatePlaceholder: '2026-10-19',
      itemUrlsLabel: 'Посилання (кожне з нового рядка)',
      itemUrlsPlaceholder: 'https://drive.google.com/file/d/…',
      itemNotesLabel: 'Особисті нотатки',
      itemNotesPlaceholder: 'Номер документа, статус, коментар…',
      itemValidationError: 'Вкажіть назву запису або додайте нотатку чи посилання.',
      itemInvalidUrlError: 'Дозволені лише коректні посилання http:// або https://.',
      emptyVaultTitle: 'Особистий сейф порожній',
      emptyVaultBody: 'Додайте посилання на Google Диск, скани ВОД, довідку ВЛК, витяг Резерв+ або приватні нотатки — вони шифруються через AES-GCM автоматично.',
      deleteItemConfirmTitle: 'Видалити запис із сейфа?',
      deleteItemConfirmBody: 'Цей запис буде остаточно видалено із зашифрованого Особистого сейфа.',
      pagePrefix: 'Посилання',
      jsonEncryptedVaultNote: 'Особистий сейф експортується у JSON виключно в зашифрованому вигляді (AES-GCM).',
    },
    doctorPrint: {
      includeSpine2D: 'Включити 2D-схему хребта',
      spineDiagramTitle: '2D-схема хребта (SOR 2026)',
      followUpInlineLabel: 'План контролю',
      copySummaryBtn: 'Скопіювати текст',
      copiedSummaryBtn: 'Скопійовано',
      shareSummaryBtn: 'Поділитися',
      summaryCopiedToast: 'Зведення скопійовано в буфер обміну',
      summarySharedToast: 'Зведення передано',
    },
    mobileNav: {
      profile: 'Профіль',
      mri: 'МРТ',
      atlas: 'Атлас',
      records: 'Записи',
      archive: 'Архів',
      more: 'Ще',
      drawerTitle: 'Додаткові розділи',
      quickSearch: 'Швидкий пошук',
    },
    globalSearch: {
      buttonLabel: 'Пошук',
      placeholder: 'Пошук по МРТ (L4-L5, D6), обстеженнях, препаратах, посиланнях…',
      emptyPrompt: 'Почніть вводити сегмент МРТ, назву препарату, обстеження або посилання.',
      noResults: 'За вашим запитом нічого не знайдено.',
      quickExamplesLabel: 'Швидкі запити:',
      navigateHint: 'навігація',
      enterHint: 'перейти',
      escHint: 'закрити',
      resultsCount: 'Знайдено:',
      groups: {
        mri: 'Сегменти МРТ (SOR)',
        records: 'Обстеження та виписки',
        treatments: 'Лікування та препарати',
        archive: 'Архів посилань',
        followUp: 'План контролю',
      },
    },
    followUp: {
      sectionTitle: 'План контролю / Наступні кроки',
      sectionSubtitle: 'Чеклист запланованих дообстежень та консультацій — невиконані пункти автоматично виводяться у «Режимі для лікаря».',
      inputPlaceholder: 'Наприклад: ЕНМГ правої руки або контроль МРТ через 6 міс.',
      datePlaceholder: 'Термін / дата',
      addBtn: 'Додати',
      emptyText: 'Список запланованих контролів порожній. Додайте наступні кроки обстеження.',
      completedOf: 'виконано',
      pendingCount: 'Заплановано',
      deleteLabel: 'Видалити пункт',
      markDoneLabel: 'Відмітити виконаним',
      markUndoneLabel: 'Повернути в активні',
      addToCalendarBtn: 'Додати в календар (.ics)',
      calendarDownloadedToast: 'Подію календаря (.ics) завантажено',
    },
    undo: {
      deletedToast: 'Запис видалено',
      undoBtn: 'Скасувати',
      restoredToast: 'Запис відновлено',
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
      treatments: 'Лечение',
      archive: 'Архив ссылок',
      doctor: 'Режим для врача',
    },
    navSub: {
      anamnesis: 'Базовые данные и 4 зоны жалоб',
      mri: '16 сегментов • 2025 vs 2026',
      atlas3d: 'Позвоночник, мышцы и мозг',
      records: 'Реестр исследований и УЗИ',
      treatments: 'Курсы препаратов и назначения',
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
      sectionTitle: 'Обследования и выписки',
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
      urlPlaceholder: 'Вставьте одну или несколько ссылок — каждую с новой строки (по порядку страниц)',
      pagePrefix: 'Стр.',
      sourceLabel: 'Источник',
      dateLabel: 'Дата',
      segmentLabel: 'Привязка к сегменту МРТ',
      segmentGroups: {
        regions: 'Отделы позвоночника (целиком)',
        segments: 'Отдельные сегменты',
      },
      recordLabel: 'Привязка к обследованию',
      recordPlaceholder: 'Выберите обследование или введите новое название…',
      createRecordHint: 'При сохранении будет создано новое обследование:',
      clearSelection: 'Очистить привязку',
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
    treatments: {
      sectionTitle: 'Лечение и назначения',
      sectionSubtitle: 'Структурированный учет стационарных и амбулаторных курсов, схем приема препаратов и физиопроцедур',
      addCourse: 'Добавить курс лечения',
      editCourse: 'Редактировать курс лечения',
      searchPlaceholder: 'Поиск по препарату, врачу или рекомендациям…',
      filterAll: 'Все',
      filterActive: 'Принимаю сейчас',
      filterInpatient: 'Стационар',
      filterOutpatient: 'Амбулаторно',
      totalCount: 'Курсов:',
      courseTypeLabel: 'Тип курса',
      courseTypes: {
        inpatient: 'Стационар',
        outpatient: 'Амбулаторно / После выписки',
      },
      statusLabel: 'Статус',
      statuses: {
        active: 'Принимаю сейчас',
        completed: 'Завершено',
      },
      periodLabel: 'Период / дата назначения',
      periodPlaceholder: '04.03.2025 – 13.03.2025',
      prescribedByLabel: 'Кто назначил (врач / специальность)',
      prescribedByPlaceholder: 'Невропатолог стационара',
      linkedRecordLabel: 'Привязка к выписке / обследованию',
      linkedRecordNone: 'Без привязки к выписке',
      linkedRecordDischargesGroup: 'Выписки и эпикриз',
      linkedRecordOtherGroup: 'Другие обследования',
      linkedRecordPrefix: 'Выписка:',
      medicationsLabel: 'Список препаратов',
      addMedication: 'Добавить препарат',
      medName: 'Название препарата',
      medNamePlaceholder: 'Мидокалм / Дексалгин…',
      medDosage: 'Дозировка',
      medDosagePlaceholder: '150 мг',
      medSchedule: 'Схема приема',
      medSchedulePlaceholder: '1 таб. × 2 р/д после еды',
      medDuration: 'Длительность курса',
      medDurationPlaceholder: '10 дней',
      removeMedication: 'Удалить препарат',
      noMedications: 'Препараты не указаны',
      proceduresLabel: 'Физиопроцедуры и рекомендации',
      proceduresPlaceholder: 'ЛФК, магнитотерапия, ограничение подъема тяжестей, контрольная ЭНМГ…',
      emptyTitle: 'Курсы лечения пока не добавлены',
      emptyBody: 'Добавьте стационарные или амбулаторные курсы со списком препаратов, дозировкой, схемой приема и физиопроцедурами — они сохранятся в браузере и автоматически попадут в режим врача и JSON-архив.',
      emptySearch: 'По вашему запросу курсов лечения не найдено.',
      deleteConfirmTitle: 'Удалить курс лечения?',
      deleteConfirmBody: 'Этот курс лечения будет удален из локального хранилища.',
      validationError: 'Укажите врача или добавьте хотя бы один препарат или рекомендацию.',
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
      treatmentsBlock: '6. Актуальные и последние курсы лечения',
      noTreatmentsNote: 'Курсы лечения еще не добавлены.',
      otherRecordsBlock: '7. Индекс предыдущих обследований и выписок',
      linksBlock: '8. Ссылки на документы и материалы (Google Диск / DICOM)',
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
      mode3d: '3D',
      mode2d: '2D-схема',
      overviewButton: 'Весь позвоночник / Обзор отделов',
      overviewTitle: 'Обзор отделов позвоночника',
      overviewSubtitle: 'Сводка проблемных сегментов по данным МРТ SOR (2025 → 2026)',
      mriBlockTitle: 'Динамика МРТ (SOR 2025 → 2026)',
      neuroBlockTitle: 'Доказательная нейроанатомия (зона иннервации / дерматом)',
      dermatomeLabel: 'Зона чувствительности и боли',
      myotomeLabel: 'Двигательная иннервация (миотом)',
      neuroDisclaimer: 'Справочная нейроанатомия: сопоставление МРТ-находок с жалобами требует оценки невролога.',
      protrusionChangeLabel: 'Выпячивание / грыжа',
      canalChangeLabel: 'Сагиттальный канал',
      finding2026Label: 'Заключение 2026',
      roots2026Label: 'Корешки / канал',
      problemCountLabel: 'Проблемных',
      negativeCountLabel: 'Ухудшение',
      newCountLabel: 'Новые изменения',
      stableCountLabel: 'Стабильно',
      regionSegmentsLabel: 'Сегменты отдела',
      schematicHint: 'Боковая проекция · Клик по диску или скобке отдела для детализации',
    },
    privacyVault: {
      pinSectionTitle: 'Защита PIN-кодом',
      pinSectionSubtitle: 'Включение «Режима приватности» — в 1 клик, выключение и доступ к сейфу — только по PIN-коду.',
      pinStatusActive: 'PIN-код активирован (SHA-256)',
      pinStatusNotSet: 'PIN-код не задан',
      pinHashHint: 'Хранится только солёный SHA-256 хэш (Web Crypto API), пароль в открытом виде не сохраняется.',
      setPinBtn: 'Задать PIN-код',
      changePinBtn: 'Изменить PIN',
      removePinBtn: 'Отключить PIN',
      currentPinLabel: 'Текущий PIN-код',
      newPinLabel: 'Новый PIN-код (от 4 символов или 4 цифры)',
      confirmPinLabel: 'Подтвердите PIN-код',
      pinPlaceholder: '••••',
      pinMinLengthError: 'Введите минимум 4 символа (например, 4-значный PIN или короткий пароль).',
      pinMismatchError: 'Введённые PIN-коды не совпадают.',
      pinWrongError: 'Неверный PIN-код. Попробуйте ещё раз.',
      pinSavedToast: 'PIN-код установлен (SHA-256)',
      pinChangedToast: 'PIN-код обновлён, сейф перешифрован',
      pinRemovedToast: 'Защита PIN-кодом отключена',
      removePinConfirmTitle: 'Отключить защиту PIN-кодом?',
      removePinConfirmBody: 'Для подтверждения введите текущий PIN-код. После отключения «Режим приватности» можно будет переключать без пароля.',
      removePinWarningWithVault: 'Внимание: в «Личном сейфе» есть зашифрованные записи. Чтобы не хранить их в открытом виде, при отключении PIN-кода содержимое сейфа будет очищено.',
      unlockPrivacyTitle: 'Выключить режим приватности',
      unlockPrivacySubtitle: 'Введите PIN-код, чтобы вернуть отображение ФИО, чувствительных данных и открыть Личный сейф.',
      unlockVaultTitle: 'Разблокировать Личный сейф',
      unlockVaultSubtitle: 'Введите PIN-код для расшифровки личных документов (AES-GCM).',
      enterPinLabel: 'PIN-код / пароль',
      unlockButton: 'Разблокировать',
      privacyLockedHint: 'Приватность активна (разблокировка по PIN)',
      privacyEnabledToast: 'Режим приватности включён, сейф заблокирован',
      privacyUnlockedToast: 'Режим приватности выключен',
      vaultUnlockedToast: 'Личный сейф разблокирован',
      vaultLockedToast: 'Личный сейф заблокирован',
      vaultTitle: 'Личный сейф',
      vaultSubtitle: 'Зашифрованное хранилище для личных ссылок и заметок (ВОД, справка ВВК, Резерв+).',
      vaultAesBadge: 'AES-GCM шифрование',
      vaultExcludedNotice: 'Никогда не попадает в «Режим для врача / PDF» и в поиск',
      vaultNoPinTitle: 'Задайте PIN-код для активации Личного сейфа',
      vaultNoPinBody: 'Все записи сейфа (ВОД, ВВК, Резерв+) шифруются локально алгоритмом AES-GCM по вашему PIN-коду перед сохранением в localStorage и JSON-архив.',
      vaultLockedTitle: 'Личный сейф заблокирован',
      vaultLockedPrivacyBody: 'Активен «Режим приватности» — содержимое сейфа полностью скрыто и зашифровано.',
      vaultLockedBody: 'Содержимое сейфа зашифровано (AES-GCM) и скрыто до ввода PIN-кода.',
      vaultLockedCountPrefix: 'Зашифрованных записей:',
      unlockWithPinBtn: 'Разблокировать по PIN',
      lockVaultBtn: 'Заблокировать сейф',
      addItemBtn: 'Добавить запись',
      editItemTitle: 'Редактировать запись сейфа',
      newItemTitle: 'Новая запись в Личный сейф',
      categoryLabel: 'Тип документа',
      categories: {
        vod: 'ВОД',
        vlk: 'Справка ВВК',
        rezerv: 'Резерв+',
        personal: 'Личное',
      },
      itemTitleLabel: 'Название записи *',
      itemTitlePlaceholder: 'Например: Выписка Резерв+ или Постановление ВВК',
      itemDateLabel: 'Дата / срок действия',
      itemDatePlaceholder: '2026-10-19',
      itemUrlsLabel: 'Ссылки (каждая с новой строки)',
      itemUrlsPlaceholder: 'https://drive.google.com/file/d/…',
      itemNotesLabel: 'Личные заметки',
      itemNotesPlaceholder: 'Номер документа, статус, комментарий…',
      itemValidationError: 'Укажите название записи или добавьте заметку / ссылку.',
      itemInvalidUrlError: 'Разрешены только корректные ссылки http:// или https://.',
      emptyVaultTitle: 'Личный сейф пуст',
      emptyVaultBody: 'Добавьте ссылки на Google Диск, сканы ВОД, справку ВВК, выписку Резерв+ или приватные заметки — они автоматически шифруются через AES-GCM.',
      deleteItemConfirmTitle: 'Удалить запись из сейфа?',
      deleteItemConfirmBody: 'Эта запись будет безвозвратно удалена из зашифрованного Личного сейфа.',
      pagePrefix: 'Ссылка',
      jsonEncryptedVaultNote: 'Личный сейф экспортируется в JSON исключительно в зашифрованном виде (AES-GCM).',
    },
    doctorPrint: {
      includeSpine2D: 'Включить 2D-схему позвоночника',
      spineDiagramTitle: '2D-схема позвоночника (SOR 2026)',
      followUpInlineLabel: 'План контроля',
      copySummaryBtn: 'Скопировать текст',
      copiedSummaryBtn: 'Скопировано',
      shareSummaryBtn: 'Поделиться',
      summaryCopiedToast: 'Сводка скопирована в буфер обмена',
      summarySharedToast: 'Сводка отправлена',
    },
    mobileNav: {
      profile: 'Профиль',
      mri: 'МРТ',
      atlas: 'Атлас',
      records: 'Записи',
      archive: 'Архив',
      more: 'Ещё',
      drawerTitle: 'Дополнительные разделы',
      quickSearch: 'Быстрый поиск',
    },
    globalSearch: {
      buttonLabel: 'Поиск',
      placeholder: 'Поиск по МРТ (L4-L5, D6), обследованиям, препаратам, ссылкам…',
      emptyPrompt: 'Начните вводить сегмент МРТ, название препарата, обследование или ссылку.',
      noResults: 'По вашему запросу ничего не найдено.',
      quickExamplesLabel: 'Быстрые запросы:',
      navigateHint: 'навигация',
      enterHint: 'перейти',
      escHint: 'закрыть',
      resultsCount: 'Найдено:',
      groups: {
        mri: 'Сегменты МРТ (SOR)',
        records: 'Обследования и выписки',
        treatments: 'Лечение и препараты',
        archive: 'Архив ссылок',
        followUp: 'План контроля',
      },
    },
    followUp: {
      sectionTitle: 'План контроля / Следующие шаги',
      sectionSubtitle: 'Чеклист запланированных дообследований и консультаций — невыполненные пункты автоматически отображаются в «Режиме для врача».',
      inputPlaceholder: 'Например: ЭНМГ правой руки или контроль МРТ через 6 мес.',
      datePlaceholder: 'Срок / дата',
      addBtn: 'Добавить',
      emptyText: 'Список запланированных контролей пуст. Добавьте следующие шаги обследования.',
      completedOf: 'выполнено',
      pendingCount: 'Запланировано',
      deleteLabel: 'Удалить пункт',
      markDoneLabel: 'Отметить выполненным',
      markUndoneLabel: 'Вернуть в активные',
      addToCalendarBtn: 'Добавить в календарь (.ics)',
      calendarDownloadedToast: 'Событие календаря (.ics) загружено',
    },
    undo: {
      deletedToast: 'Запись удалена',
      undoBtn: 'Отменить',
      restoredToast: 'Запись восстановлена',
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
      treatments: 'Treatments',
      archive: 'Links Archive',
      doctor: 'Doctor View',
    },
    navSub: {
      anamnesis: 'Baseline data & 4 symptom zones',
      mri: '16 segments • 2025 vs 2026',
      atlas3d: 'Spine, muscles & brain vessels',
      records: 'Prior MRI, ultrasound & labs',
      treatments: 'Medication courses & therapy',
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
      sectionTitle: 'Examinations & Discharges',
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
      urlPlaceholder: 'Paste one or more links — each on a new line (in page order)',
      pagePrefix: 'Page',
      sourceLabel: 'Platform',
      dateLabel: 'Date',
      segmentLabel: 'Link to MRI Segment',
      segmentGroups: {
        regions: 'Whole Spine Regions',
        segments: 'Individual Segments',
      },
      recordLabel: 'Link to Examination',
      recordPlaceholder: 'Select an examination or type a new name…',
      createRecordHint: 'A new examination will be created on save:',
      clearSelection: 'Clear link',
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
    treatments: {
      sectionTitle: 'Treatments & Prescriptions',
      sectionSubtitle: 'Structured log of inpatient and outpatient courses, medication regimens, and physiotherapy recommendations',
      addCourse: 'Add Treatment Course',
      editCourse: 'Edit Treatment Course',
      searchPlaceholder: 'Search by medication, physician, or recommendation…',
      filterAll: 'All',
      filterActive: 'Taking Now',
      filterInpatient: 'Inpatient',
      filterOutpatient: 'Outpatient',
      totalCount: 'Courses:',
      courseTypeLabel: 'Course Type',
      courseTypes: {
        inpatient: 'Inpatient',
        outpatient: 'Outpatient / Post-discharge',
      },
      statusLabel: 'Status',
      statuses: {
        active: 'Taking Now',
        completed: 'Completed',
      },
      periodLabel: 'Period / Prescription Date',
      periodPlaceholder: '04.03.2025 – 13.03.2025',
      prescribedByLabel: 'Prescribed By (Physician / Specialty)',
      prescribedByPlaceholder: 'Inpatient Neurologist',
      linkedRecordLabel: 'Link to Discharge / Examination',
      linkedRecordNone: 'No linked discharge',
      linkedRecordDischargesGroup: 'Discharges & Epicrisis',
      linkedRecordOtherGroup: 'Other Examinations',
      linkedRecordPrefix: 'Discharge:',
      medicationsLabel: 'Medications',
      addMedication: 'Add Medication',
      medName: 'Medication',
      medNamePlaceholder: 'Tolperisone / Dexketoprofen…',
      medDosage: 'Dosage',
      medDosagePlaceholder: '150 mg',
      medSchedule: 'Schedule',
      medSchedulePlaceholder: '1 tab × 2/day after meals',
      medDuration: 'Duration',
      medDurationPlaceholder: '10 days',
      removeMedication: 'Remove medication',
      noMedications: 'No medications listed',
      proceduresLabel: 'Physiotherapy & Recommendations',
      proceduresPlaceholder: 'Physical therapy, magnetotherapy, lifting restrictions, follow-up ENMG…',
      emptyTitle: 'No treatment courses recorded yet',
      emptyBody: 'Add inpatient or outpatient treatment courses with medications, dosages, schedules, and physiotherapy notes—they persist locally and automatically appear in Doctor View and JSON exports.',
      emptySearch: 'No treatment courses match your current search or filter.',
      deleteConfirmTitle: 'Delete treatment course?',
      deleteConfirmBody: 'This treatment course will be removed from local browser storage.',
      validationError: 'Please specify the prescribing physician or add at least one medication or recommendation.',
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
      treatmentsBlock: '6. Active & Recent Treatment Courses',
      noTreatmentsNote: 'No treatment courses recorded yet.',
      otherRecordsBlock: '7. Index of Prior Studies & Discharges',
      linksBlock: '8. Reference Documents & Links (Google Drive / DICOM)',
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
      mode3d: '3D',
      mode2d: '2D Map',
      overviewButton: 'Full Spine / Regions Overview',
      overviewTitle: 'Spine Regions Overview',
      overviewSubtitle: 'Summary of affected segments from SOR MRI comparison (2025 → 2026)',
      mriBlockTitle: 'MRI Dynamics (SOR 2025 → 2026)',
      neuroBlockTitle: 'Evidence-Based Neuroanatomy (Innervation / Dermatome)',
      dermatomeLabel: 'Sensory & Pain Distribution',
      myotomeLabel: 'Motor Innervation (Myotome)',
      neuroDisclaimer: 'Reference neuroanatomy: correlating MRI findings with symptoms requires clinical neurological exam.',
      protrusionChangeLabel: 'Protrusion / Hernia',
      canalChangeLabel: 'Sagittal Canal',
      finding2026Label: '2026 Finding',
      roots2026Label: 'Roots / Canal',
      problemCountLabel: 'Affected',
      negativeCountLabel: 'Progression',
      newCountLabel: 'New Changes',
      stableCountLabel: 'Stable',
      regionSegmentsLabel: 'Segments in Region',
      schematicHint: 'Lateral profile · Click any disc or region brace for clinical details',
    },
    privacyVault: {
      pinSectionTitle: 'PIN Protection',
      pinSectionSubtitle: 'Enable Privacy Mode in 1 click; disabling it or opening the Personal Vault requires your PIN.',
      pinStatusActive: 'PIN Active (SHA-256)',
      pinStatusNotSet: 'No PIN Set',
      pinHashHint: 'Only a salted SHA-256 hash (Web Crypto API) is stored — your raw PIN is never saved.',
      setPinBtn: 'Set PIN',
      changePinBtn: 'Change PIN',
      removePinBtn: 'Disable PIN',
      currentPinLabel: 'Current PIN',
      newPinLabel: 'New PIN (at least 4 digits or characters)',
      confirmPinLabel: 'Confirm PIN',
      pinPlaceholder: '••••',
      pinMinLengthError: 'Enter at least 4 characters (e.g., a 4-digit PIN or short passcode).',
      pinMismatchError: 'PIN entries do not match.',
      pinWrongError: 'Incorrect PIN. Please try again.',
      pinSavedToast: 'PIN enabled (SHA-256)',
      pinChangedToast: 'PIN updated and vault re-encrypted',
      pinRemovedToast: 'PIN protection disabled',
      removePinConfirmTitle: 'Disable PIN Protection?',
      removePinConfirmBody: 'Enter your current PIN to confirm. Privacy Mode will then toggle without a passcode.',
      removePinWarningWithVault: 'Warning: your Personal Vault contains encrypted entries. To avoid storing unencrypted private data, disabling PIN protection will clear the encrypted vault.',
      unlockPrivacyTitle: 'Disable Privacy Mode',
      unlockPrivacySubtitle: 'Enter your PIN to reveal patient identity, sensitive details, and access the Personal Vault.',
      unlockVaultTitle: 'Unlock Personal Vault',
      unlockVaultSubtitle: 'Enter your PIN to decrypt your private documents (AES-GCM).',
      enterPinLabel: 'PIN / Passcode',
      unlockButton: 'Unlock',
      privacyLockedHint: 'Privacy active (PIN required to unlock)',
      privacyEnabledToast: 'Privacy Mode enabled, Personal Vault locked',
      privacyUnlockedToast: 'Privacy Mode disabled',
      vaultUnlockedToast: 'Personal Vault unlocked',
      vaultLockedToast: 'Personal Vault locked',
      vaultTitle: 'Personal Vault',
      vaultSubtitle: 'Encrypted storage for private links and notes (Military ID / VOD, VLK certificate, Rezerv+).',
      vaultAesBadge: 'AES-GCM Encrypted',
      vaultExcludedNotice: 'Never included in Doctor View / PDF or search',
      vaultNoPinTitle: 'Set a PIN to enable the Personal Vault',
      vaultNoPinBody: 'All vault items (VOD, VLK, Rezerv+) are encrypted locally with AES-GCM using your PIN before saving to localStorage and JSON backups.',
      vaultLockedTitle: 'Personal Vault is Locked',
      vaultLockedPrivacyBody: 'Privacy Mode is active — vault contents are hidden and encrypted.',
      vaultLockedBody: 'Vault contents are encrypted (AES-GCM) and hidden until unlocked with your PIN.',
      vaultLockedCountPrefix: 'Encrypted items:',
      unlockWithPinBtn: 'Unlock with PIN',
      lockVaultBtn: 'Lock Vault',
      addItemBtn: 'Add Entry',
      editItemTitle: 'Edit Vault Entry',
      newItemTitle: 'New Personal Vault Entry',
      categoryLabel: 'Document Type',
      categories: {
        vod: 'VOD',
        vlk: 'VLK Certificate',
        rezerv: 'Rezerv+',
        personal: 'Personal',
      },
      itemTitleLabel: 'Entry Title *',
      itemTitlePlaceholder: 'e.g., Rezerv+ Extract or VLK Board Decision',
      itemDateLabel: 'Date / Validity',
      itemDatePlaceholder: '2026-10-19',
      itemUrlsLabel: 'Links (one per line)',
      itemUrlsPlaceholder: 'https://drive.google.com/file/d/…',
      itemNotesLabel: 'Private Notes',
      itemNotesPlaceholder: 'Document number, status, private remarks…',
      itemValidationError: 'Please enter a title or add at least one link or note.',
      itemInvalidUrlError: 'Only valid http:// or https:// links are allowed.',
      emptyVaultTitle: 'Personal Vault is empty',
      emptyVaultBody: 'Add Google Drive links, VOD / VLK scans, Rezerv+ extracts, or private notes — everything is automatically encrypted with AES-GCM.',
      deleteItemConfirmTitle: 'Delete vault entry?',
      deleteItemConfirmBody: 'This item will be permanently removed from your encrypted Personal Vault.',
      pagePrefix: 'Link',
      jsonEncryptedVaultNote: 'The Personal Vault is exported into JSON strictly in AES-GCM encrypted form.',
    },
    doctorPrint: {
      includeSpine2D: 'Include 2D spine diagram',
      spineDiagramTitle: '2D Spine Map (SOR 2026)',
      followUpInlineLabel: 'Follow-up Plan',
      copySummaryBtn: 'Copy Text',
      copiedSummaryBtn: 'Copied',
      shareSummaryBtn: 'Share',
      summaryCopiedToast: 'Clinical summary copied to clipboard',
      summarySharedToast: 'Clinical summary shared',
    },
    mobileNav: {
      profile: 'Profile',
      mri: 'MRI',
      atlas: 'Atlas',
      records: 'Records',
      archive: 'Archive',
      more: 'More',
      drawerTitle: 'More Sections',
      quickSearch: 'Quick Search',
    },
    globalSearch: {
      buttonLabel: 'Search',
      placeholder: 'Search MRI segments (L4-L5, D6), exams, medications, archive links…',
      emptyPrompt: 'Type an MRI segment, medication name, examination, or archive link.',
      noResults: 'No matching entries found.',
      quickExamplesLabel: 'Quick searches:',
      navigateHint: 'navigate',
      enterHint: 'open',
      escHint: 'close',
      resultsCount: 'Matches:',
      groups: {
        mri: 'Spine MRI Segments (SOR)',
        records: 'Examinations & Discharges',
        treatments: 'Treatments & Medications',
        archive: 'Links Archive',
        followUp: 'Follow-up Plan',
      },
    },
    followUp: {
      sectionTitle: 'Follow-up Plan / Next Steps',
      sectionSubtitle: 'Interactive checklist of planned checkups and specialist visits — pending items appear concisely in Doctor View.',
      inputPlaceholder: 'e.g., Right arm ENMG or follow-up spine MRI in 6 months',
      datePlaceholder: 'Target date',
      addBtn: 'Add',
      emptyText: 'No follow-up steps scheduled yet. Add planned consultations or repeat studies.',
      completedOf: 'done',
      pendingCount: 'Pending',
      deleteLabel: 'Remove item',
      markDoneLabel: 'Mark as completed',
      markUndoneLabel: 'Mark as pending',
      addToCalendarBtn: 'Add to calendar (.ics)',
      calendarDownloadedToast: 'Calendar event (.ics) downloaded',
    },
    undo: {
      deletedToast: 'Entry deleted',
      undoBtn: 'Undo',
      restoredToast: 'Entry restored',
    },
  },
};
