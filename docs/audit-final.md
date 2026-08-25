# ФИНАЛЬНЫЙ АУДИТ — context-vkru (архив)

> Коммит: `docs: audit-final.md — финальный аудит [archive]` · TASK-0102 (5/6)
>
> context-vkru закрывается как **архив и донор ядра** для территорий **m3** и **mem**.
> Вход — через m3 / mem. Ниже — полная инвентаризация, provenance и статусы задач.

## 1. Список файлов (инвентаризация территории)

### EdgeExtension/ — ядро расширения (донор для m3)

| Путь | Роль |
|------|------|
| `EdgeExtension/manifest.json` | MV3-манифест (v07g, 0.0.18) |
| `EdgeExtension/dialog.html` | окно карточки коррекции |
| `EdgeExtension/_locales/ru/messages.json` | локализация |
| `EdgeExtension/styles.css` | стили стекла `#ctx-glass` |
| `EdgeExtension/src/core/messaging.js` | `CTX_BUILD`, `CTX_MSG` |
| `EdgeExtension/src/core/normalize.js` | `portalOf/normalize/metPostOf/replyOf/cleanUrl` |
| `EdgeExtension/src/core/storage.js` | «ctxdb»: `loadDb/saveDb` |
| `EdgeExtension/src/ui/layer.js` | СТЕКЛО: `draw(scope)`, индикатор |
| `EdgeExtension/src/ui/dialog.js` | карточка коррекции |
| `EdgeExtension/src/background.js` | SW: меню, изъятие, дедуп, окна, CTX_SYNC, badge |
| `EdgeExtension/src/content.js` | тонкая точка входа (изъятие всегда) |
| `EdgeExtension/src/adapters/vkru.js` | СНЯТ (Решение №2) — остаётся в репо, не инжектится |

### dashboard/ — журнал процесса (React, донор для m3-BOARD)

`src/App.tsx`, `src/main.tsx`, `src/index.css`, `src/components/*` (Reveal, Terminal,
ScoreRing, ConformanceMatrix, Roadmap, Steps, TaskRegistry, CodeView, V01/V02/V03-листы,
V03F2/V03R-секции), `src/data/*` (audit, tasks, v01–v03r), `index.html`,
`package.json`, `vite.config.js`, `tsconfig.json`, `postcss.config.mjs`.

### docs/ — документация и задания

`ADDENDUM_3_card_contract_v2.md`, `ADDENDUM_4_db_v3.md`,
`ARCHITECTURE_TASKS_ADDENDUM.md`, `ARCHITECTURE_V07G_ADDENDUM.md`,
`tasks/TASK-0001…0011, 0100, 0102.md`, `track_С.md` (трек С — ОК-реальность),
`audit-final.md` (этот файл).

### reports/ — протоколы проверок

`v_01/`, `v_02/`, `v_03/` (RESULT_v03r/v06r/v07r), `m3/TERRITORY-m3.md`.

### scripts/ — инфраструктура

`Build.ps1`, `Clean.ps1`, `Test.ps1`, `RunEdgeCdp.ps1` (CDP :9222), `migrate-to-m3.ps1`.

### Конфигурация и корень

`.vscode/{launch,settings,extensions}.json`, `.codeassistant/mcp.json`,
`opencode.jsonc`, `.nvmrc`, `.gitignore`, `.gitattributes`, `LICENSE`, `icons/icon.svg`.

## 2. Provenance — файлы, перенесённые в m3 КАК ЕСТЬ

Миграция выполняется `scripts/migrate-to-m3.ps1`; **SHA256-хэши каждого файла
фиксируются скриптом при миграции в отчёте `m3/reports/migrate-m3-report.md`**
(вне этого репо — в корне m3). Ниже — состав копии:

| № | Файл (копия КАК ЕСТЬ) | SHA256 |
|---|----------------------|--------|
| 1 | `scripts/Build.ps1` | → m3/reports/migrate-m3-report.md |
| 2 | `scripts/Clean.ps1` | → m3/reports/migrate-m3-report.md |
| 3 | `scripts/Test.ps1` | → m3/reports/migrate-m3-report.md |
| 4 | `.codeassistant/mcp.json` | → m3/reports/migrate-m3-report.md |
| 5 | `opencode.jsonc` | → m3/reports/migrate-m3-report.md |
| 6 | `.nvmrc` | → m3/reports/migrate-m3-report.md |
| 7 | `.gitattributes` | → m3/reports/migrate-m3-report.md |
| 8 | `.gitignore` | → m3/reports/migrate-m3-report.md |
| 9 | `LICENSE` | → m3/reports/migrate-m3-report.md |
| 10 | `icons/icon.svg` | → m3/reports/migrate-m3-report.md |
| 11 | `EdgeExtension/src/core/messaging.js` | → m3/reports/migrate-m3-report.md |
| 12 | `EdgeExtension/src/core/normalize.js` | → m3/reports/migrate-m3-report.md |
| 13 | `.vscode/launch.json` | → m3/reports/migrate-m3-report.md |
| 14 | `.vscode/settings.json` | → m3/reports/migrate-m3-report.md |
| 15 | `.vscode/extensions.json` | → m3/reports/migrate-m3-report.md |

> Затычки (manifest «Мои записки» 0.1.0, storage/layer/kartoteka/content/background,
> `data/zapiski.json`) и docs/dashboard m3 создаются скриптом, а не копируются —
> список созданного также в `m3/reports/migrate-m3-report.md`.

## 3. НЕ переносится в m3

- wrap/unwrap-инъекции (старый слой v07x) — заменены стеклом `ui/layer.js`;
- мемориальные данные mem-2026.

## 4. Статусы задач — висячих нет

| Задача | Суть | Статус |
|--------|------|--------|
| TASK-0001 | v03r — фундамент (ПКМ, изъятие linkUrl) | DONE · 90d704e |
| TASK-0002 | инфра: запуск Edge CDP :9222 | DONE |
| TASK-0003 | AGENTS.md — Дополнения А/Б | DONE · a4b6ec9 |
| TASK-0004 | редизайн дашборда (Gmail) | ARCHIVE → m3 |
| TASK-0005 | .vscode (launch под Edge) | DONE |
| TASK-0006 | v04r — нормализатор, опознание портала | DONE · 9c104be |
| TASK-0007 | ремонт дашборда (data-модули) | ARCHIVE · 4c307da |
| TASK-0008 | гигиена docs/tasks | ARCHIVE |
| TASK-0009 | v05r — база, карточка v2, дедуп | DONE · 2e01d91 |
| TASK-0010 | v06r — маркировка, фикс дедупа | DONE · dce4ca7 |
| TASK-0011 | v07g — стекло, скальпель, индикатор | DONE · 0.0.18 |
| TASK-0100 | m3 — каркас и перенос (provenance) | DONE |
| TASK-0102 | прощальный пакет (6 коммитов) | DONE |

**Итог: все задачи закрыты как DONE или ARCHIVE. Висящих задач нет.**
