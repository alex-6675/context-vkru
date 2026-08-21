/* Группа заданий Кодеру TASK-0001 … TASK-0005.
 * Первоисточник: docs/tasks/TASK-0001.md. Формат — conventional commits с тегом [TASK-XXXX]. */

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
    statusLabel: "DONE · PASS · RESULT_v03r.md",
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
    title: "AGENTS.md — Дополнение А (целостность и гейты)",
    status: "queue",
    statusLabel: "очередь",
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
];

export const taskProcessRules = [
  "Код — только закоммиченным файлом; перед тестом — raw-верификация проектировщиком (РЕПО-ГЕЙТ).",
  "Подчёркивания в testid/URL-схемах — только через String.fromCharCode(95) (§25); рендер-вью чата для кода запрещено.",
  "PASS/FAIL — только Пользователь (§5.6); при FAIL — итерация внутри сборки, следующий TASK не выдаётся (§5.1).",
  "TASK-0005 (.vscode/) коммитится отдельно — не смешивая с кодом расширения и дашбордом.",
];
