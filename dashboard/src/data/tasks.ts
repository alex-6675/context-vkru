/* Группа заданий Кодеру TASK-0001 … TASK-0007 (TASK-0008 — гигиена docs/tasks).
 * Первоисточник: docs/tasks/TASK-0001.md. Формат — conventional commits с тегом [TASK-XXXX].
 * TASK-0006 = v04r (r-серия); номера для v05r/v06r/v07r будут выданы позже. */

export type TaskStatus = "done-wait" | "done-pass" | "queue";

export interface TaskItem {
  id: string;
  build: string;
  manifest: string;
  module: string;
  commit: string;
  title: string;
  status: TaskStatus;
  statusLabel: string;
  dep: string;
  goal: string;
  files: string[];
  test: string[];
  pass: string;
  basis: string;
}

export const tasks: TaskItem[] = [
  {
    id: "TASK-0001",
    build: "feat(ext)",
    manifest: "0.0.6",
    module: "M-03r · EdgeExtension",
    commit: "feat(ext): M-03r — ПКМ «Сохранить персонажа/сообщество», изъятие linkUrl [TASK-0001]",
    title: "ПКМ: изъятие ссылки в момент фиксации (фундамент)",
    status: "done-pass",
    statusLabel: "DONE · PASS · 90d704e",
    dep: "—",
    goal: "Доказать: браузер в момент ПКМ сам отдаёт ссылку сущности (info.linkUrl / pageUrl). Никакого массового сканирования — только действие пользователя.",
    files: [
      "manifest.json — permissions: contextMenus · version 0.0.6",
      "src/core/messaging.js — CTX_BUILD v03r · CAPTURED",
      "src/background.js — пункты меню · изъятие · tabs.sendMessage",
      "src/content.js — приём CAPTURED · строка captured",
    ],
    test: [
      "ПКМ на имени автора → пункты «Сохранить персонажа / сообщество»",
      "Клик «Сохранить персонажа» → captured | menu: save-person | link: … | page: …; link совпадает со статус-строкой",
      "ПКМ по пустому месту → наших пунктов НЕТ",
    ],
    pass: "Пункты только на ссылках; link совпадает со статус-строкой; page — текущая страница; карточка без ошибок.",
    basis: "reports/v_03/M03r.md · Архитектурное решение №2",
  },
  {
    id: "TASK-0002",
    build: "chore(infra)",
    manifest: "—",
    module: "инфраструктура · CDP",
    commit: "chore(infra): RunEdgeCdp.ps1, .gitignore, tasks/launch, opencode.jsonc [TASK-0002]",
    title: "Инфраструктура: запуск Edge CDP, gitignore, launch, opencode",
    status: "queue",
    statusLabel: "очередь",
    dep: "TASK-0001 = PASS",
    goal: "Воспроизводимый запуск и отладка: Edge с DevTools Protocol (CDP) для автоматизированных проверок, игнорирование артефактов, задачи запуска и конфиг opencode.",
    files: [
      "scripts/RunEdgeCdp.ps1 — новый: Edge + --remote-debugging-port, изолированный профиль",
      ".gitignore — новый: node_modules/, dist/, артефакты профиля",
      "tasks/launch — задачи запуска (dev-сервер, Edge CDP)",
      "opencode.jsonc — новый: конфигурация инструмента opencode",
    ],
    test: [
      "pwsh scripts/RunEdgeCdp.ps1 поднимает Edge, порт CDP отвечает",
      "git status не показывает node_modules/, dist/, файлы профиля",
      "Задачи tasks/launch выполняются; opencode.jsonc валиден",
    ],
    pass: "Edge поднимается с CDP; артефакты игнорируются; запуск воспроизводим; пакет EdgeExtension/ чист (§2.2).",
    basis: "цитата разработчика · группа заданий",
  },
  {
    id: "TASK-0003",
    build: "docs",
    manifest: "—",
    module: "AGENTS.md · Дополнение А",
    commit: "docs: AGENTS.md — Дополнение А (целостность и гейты) [TASK-0003]",
    title: "AGENTS.md — Дополнения А (А1–А6) и Б (Б1–Б4)",
    status: "done-pass",
    statusLabel: "DONE · a4b6ec9",
    dep: "нет (параллельно с TASK-0002)",
    goal: "Закрепить в AGENTS.md правила целостности передачи кода и гейтов проверки, выработанные в итерациях v_03 / v_03f / v03f2 — закрыть дефект «markdown съел подчёркивания» процедурно.",
    files: [
      "AGENTS.md — ДОБАВИТЬ «Дополнение А (целостность и гейты)»",
    ],
    test: [
      "Дополнение А: код — только закоммиченным файлом; рендер-вью чата запрещено",
      "Селекторы/regex с «_» — через String.fromCharCode(95) (§25)",
      "РЕПО-ГЕЙТ: raw-верификация проектировщиком ДО теста пользователем",
      "PASS/FAIL — только Пользователь (§5.6); приёмочный гейт coverage",
    ],
    pass: "Правила целостности и гейтов зафиксированы в регламенте, согласованы с §25 и РЕПО-ГЕЙТом.",
    basis: "цитата разработчика · итерации v_03/v_03f/v03f2",
  },
  {
    id: "TASK-0004",
    build: "style(dashboard)",
    manifest: "—",
    module: "dashboard · Gmail-стиль",
    commit: "style(dashboard): строгий деловой дизайн, референс Gmail [TASK-0004]",
    title: "Дашборд: строгий деловой дизайн, референс Gmail",
    status: "queue",
    statusLabel: "очередь",
    dep: "нет (поверх текущего журнала)",
    goal: "Привести журнал процесса к строгому деловому стилю по референсу Gmail: светлая поверхность, плотная типографика, аккуратные разделители, один деловой синий акцент. Меняется оформление, не содержание.",
    files: [
      "src/index.css — светлая палитра, серые линии, синий акцент, типографская шкала",
      "src/App.tsx + секции — деловая сетка; убрать декоративные фоны (noise/grid)",
      "Компоненты (Terminal, Roadmap, Matrix, TaskRegistry, листы v0X) — деловой вид",
    ],
    test: [
      "Дашборд в светлой деловой теме; все секции и данные на месте",
      "Статусы PASS/FAIL/ожидание различимы без неона",
      "Вёрстка устойчива 1280–1920 px; кириллица читаема",
    ],
    pass: "Строгий деловой вид в духе Gmail; содержание журнала не потеряно; без hero-трио, градиентных заголовков и glassmorphism.",
    basis: "цитата разработчика · референс Gmail",
  },
  {
    id: "TASK-0005",
    build: "chore(env)",
    manifest: "—",
    module: ".vscode/",
    commit: "chore(env): настройки workspace и рекомендации расширений [TASK-0005]",
    title: "Workspace: настройки и рекомендации расширений (.vscode)",
    status: "queue",
    statusLabel: "очередь",
    dep: "нет",
    goal: "Зафиксировать настройки рабочей области и рекомендуемые расширения VS Code для воспроизводимого окружения. Коммитится ОТДЕЛЬНО — не смешивая с кодом расширения и дашбордом.",
    files: [
      ".vscode/settings.json — настройки workspace (форматирование, наблюдение)",
      ".vscode/extensions.json — рекомендации расширений",
    ],
    test: [
      "Открыть проект → применятся workspace-настройки, предложат расширения",
      "git log: chore(env) отдельным коммитом, без файлов EdgeExtension/ и src/",
    ],
    pass: "Окружение воспроизводимо; коммит chore(env) изолирован от кода ext и dashboard.",
    basis: "цитата разработчика · отдельный коммит",
  },
  {
    id: "TASK-0006",
    build: "feat(ext) · v04r",
    manifest: "0.0.7",
    module: "M-04r · EdgeExtension",
    commit: "feat(ext): v04r — нормализатор и опознание портала [TASK-0006]",
    title: "v04r: нормализатор + опознание портала (тип из меню, metPost из page)",
    status: "done-pass",
    statusLabel: "DONE · PASS · 9c104be",
    dep: "TASK-0001 = PASS",
    goal: "Из изъятой браузером ссылки — удостоверение {portal, id, url} + тип из пункта меню + metPost из pageUrl. Порталы vk / ok / dzen / generic по одному контракту; vk-схемы idN/clubN/wall — regex через String.fromCharCode(95).",
    files: [
      "manifest.json — version 0.0.7 (без новых permissions)",
      "src/core/normalize.js — новый: portalOf / normalize / metPostOf, U = fromCharCode(95)",
      "src/core/messaging.js — CTX_BUILD = \"v04r\"",
      "src/background.js — резолв изъятия через CTX_NORMALIZE (тип — menuItemId, metPost — pageUrl)",
      "src/content.js — расширенный лог captured (portal · id · type · metPost)",
    ],
    test: [
      "«Сохранить персонажа» на /idN → portal: vk · id: idN · type: PERSON · metPost из page",
      "«Сохранить сообщество» на /clubN → id: clubN · type: COMMUNITY",
      "Ссылка wall-… → id: wall-…; внешний домен → portal: generic",
      "Регрессия v03r: ПКМ по пустому месту — пунктов нет",
    ],
    pass: "Удостоверение корректно для vk и не ломается на generic; тип — из пункта меню; metPost — из page; карточка расширения без ошибок.",
    basis: "M03r.md · план v_04r · текст проектировщика (ШАГ 2)",
  },
  {
    id: "TASK-0007",
    build: "fix(dashboard)",
    manifest: "—",
    module: "dashboard · ремонт",
    commit: "fix(dashboard): завершение ремонта [TASK-0007]",
    title: "Ремонт дашборда: data-модули, статусы, порядок группы",
    status: "done-wait",
    statusLabel: "частично · 4c307da · ждёт хэш репо-фиксации",
    dep: "нет",
    goal: "Завершить ремонт после порчи при передаче: недостающие data-модули (v03f, v03f2, v03r) и компоненты (V03RSection, V03F2Section); статус TASK-0003 = done-pass (a4b6ec9); блок порядка — в соответствие со списком задач (TASK-0006 = v04r; номера v05r/v06r/v07r будут выданы позже).",
    files: [
      "dashboard/src/data/v03f.ts · v03f2.ts · v03r.ts — восстановлены (одна копия)",
      "dashboard/src/components/V03RSection.tsx · V03F2Section.tsx — восстановлены",
      "dashboard/src/data/tasks.ts — статусы + записи TASK-0006/0007",
      "dashboard/src/components/TaskRegistry.tsx — блок порядка исполнения",
    ],
    test: [
      "Б3: Select-String '修改后' по dashboard/src и EdgeExtension → 0",
      "панель Problems: 0 ошибок",
      "npm run build — проходит",
      "Б5: файлы закоммичены пользователем в репо (v03f.ts / v03f2.ts / v03r.ts / V03RSection / V03F2Section / tasks.ts / TaskRegistry) — хэш получен",
    ],
    pass: "Сборка зелёная; все импорты резолвятся; данные журнала сохранены; файлы в репо пользователя (хэш в задаче). DONE — только после хэша (Б5).",
    basis: "сверка проектировщика по коммиту 4c307da · ШАГ 1 · Б5 (факт = репо)",
  },
  {
    id: "TASK-0009",
    build: "feat(ext) · v05r",
    manifest: "0.0.8",
    module: "M-05r · EdgeExtension",
    commit: "feat(ext): v05r — база, карточка v2, дедуп [TASK-0009]",
    title: "v05r: база (chrome.storage.local), карточка v2, дедуп по portal+id",
    status: "done-pass",
    statusLabel: "DONE · PASS · 2e01d91",
    dep: "TASK-0006 = PASS (9c104be)",
    goal: "Сохранение записи в chrome.storage.local по контракту карточки v2; дедуп по portal+id; правило типов (reply= → COMMENT); персистентность через F5 и перезапуск.",
    files: [
      "src/core/storage.js — новый: ключ ctxdb, loadDb/saveDb",
      "src/core/normalize.js — id без ведущего /, metPostOf матчит w= без ^/",
      "src/background.js — запись по контракту v2, дедуп, kind COMMENT",
      "src/content.js — чтение базы при старте, лог db: N cards",
      "manifest.json — 0.0.8, permissions +storage",
    ],
    test: [
      "«Сохранить персонажа» → SW: saved card c1 (total 1)",
      "Тот же человек та же форма ссылки → уже в базе (card c1)",
      "ПКМ по дате комментария → kind COMMENT",
      "F5 и перезапуск Edge → db: N cards с тем же N",
    ],
    pass: "Карточка v2 создаётся, дедуп по portal+id, kind COMMENT по reply=, база переживает F5/перезапуск; карточка расширения без ошибок (0.0.8).",
    basis: "текст проектировщика · Дополнение №3 · Решение №3",
  },
  {
    id: "TASK-0010",
    build: "feat(ext) · v06r",
    manifest: "0.0.9",
    module: "M-06r · EdgeExtension",
    commit: "feat(ext): v06r — маркировка сохранённых, фикс дедупа комментариев [TASK-0010]",
    title: "v06r: маркировка сохранённых (▲/◆), фикс дедупа комментариев D1",
    status: "done-pass",
    statusLabel: "DONE · PASS · dce4ca7",
    dep: "TASK-0009 = PASS (2e01d91)",
    goal: "После F5 сохранённые персоны/сообщества помечаются нашим слоем (▲), закладки комментариев — ◆; разные комментарии одного поста = разные карточки (фикс D1).",
    files: [
      "src/core/normalize.js — + replyOf(url)",
      "src/background.js — дедуп COMMENT по portal+id+replyId",
      "src/content.js — индекс byId/byComment/byCommentLegacy, скан a[href], маркеры, MutationObserver 600мс",
      "src/styles.css — новый: .ctx-mark, .ctx-mark-c",
      "manifest.json — 0.0.9, + css styles.css",
    ],
    test: [
      "▲ рядом с сохранёнными именами (числовая и короткая формы); marked N anchors",
      "◆ у даты сохранённого комментария; соседние даты без ◆",
      "F5 → метки возвращаются; несохранённые без меток; клики VK не нарушены",
      "Фикс D1: два разных комментария одного поста → две новые карточки",
    ],
    pass: "Метки после F5 на всех формах ссылки; D1 доказан; вёрстка цела. R1/R2 — в TASK-0012.",
    basis: "текст проектировщика · фикс D1 · RESULT_v06r.md",
  },
  {
    id: "TASK-0011",
    build: "feat(ext) · v07r",
    manifest: "0.0.10",
    module: "M-07r · EdgeExtension",
    commit: "feat(ext): v07r — меню коррекции карточки, цвет ника, блеклость [TASK-0011]",
    title: "v07r: карточка коррекции (dialog), цвет ника, блеклость «грязи»",
    status: "queue",
    statusLabel: "в работе · шаги по Дополнению Г",
    dep: "TASK-0010 = PASS (dce4ca7)",
    goal: "Клик по метке открывает карточку коррекции; маркировка рисует ▲ + заливку ника цветом карточки (~80%); «грязь» — блеклость; перерисовка без перезагрузки при изменении базы.",
    files: [
      "dialog.html + src/dialog.js — новые: окно карточки (windows.create, dialog.html#cardId)",
      "src/background.js — приём OPEN_CARD → windows.create",
      "src/content.js — клик по метке → OPEN_CARD; рендер ctx-hl/ctx-faded; onChanged → перерендер",
      "src/styles.css — .ctx-hl, .ctx-faded, палитра",
      "manifest.json — 0.0.10 (без новых permissions); messaging.js — v07r + OPEN_CARD",
    ],
    test: [
      "Клик по ▲ → окно карточки",
      "Статус «грязь» → ник блеклый без F5",
      "Цвет → заливка ника ~80%",
      "Примечание и статус живут после F5",
      "Клики VK не нарушены",
    ],
    pass: "Пункты 1–5. R1/R2 в этот этап не входят (→ TASK-0012/v08r).",
    basis: "сводка проектировщика · R3 (заливка ника цветом картотеки) · Дополнение №3",
  },
];

export const taskProcessRules = [
  "Код — только закоммиченным файлом; перед тестом — raw-верификация проектировщиком (РЕПО-ГЕЙТ).",
  "Подчёркивания в testid/URL-схемах — только через String.fromCharCode(95) (§25); рендер-вью чата для кода запрещено.",
  "PASS/FAIL — только Пользователь (§5.6); при FAIL — итерация внутри сборки, следующий TASK не выдаётся (§5.1).",
  "TASK-0005 (.vscode/) коммитится отдельно — не смешивая с кодом расширения и дашбордом.",
];
