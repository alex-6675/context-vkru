# migrate-to-m3.ps1 — создание каркаса m3 и перенос территории (provenance).
# TASK-0100 · коммит: chore: m3 — каркас и перенос (provenance) [TASK-0100]
#
# Запуск (в локали пользователя):
#   pwsh scripts/migrate-to-m3.ps1                          # m3 рядом: ..\m3
#   pwsh scripts/migrate-to-m3.ps1 -TargetRoot D:\m3        # свой путь
#
# Что делает:
#   1. Создаёт каркас каталогов m3.
#   2. КОПИЯ КАК ЕСТЬ (с SHA256 provenance-хэшами в отчёте).
#   3. ЗАТЫЧКИ — заголовки + пустая реализация (контракт задан, логика не заполнена).
#   4. docs/  — ABOUT_USER.md, STAGES.md, REGULATIONS.md.
#   5. dashboard/ — BOARD.md + index.html «прошлое–настоящее–будущее» (статика, 0 зависимостей).
#
# НЕ копирует: wrap/unwrap-инъекции (старый слой v07x), мемориальные данные mem-2026.
# Отчёт: reports/migrate-m3-report.md + вывод в консоль.

[CmdletBinding()]
param(
    [string]$SourceRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path,
    [string]$TargetRoot = (Join-Path (Split-Path (Resolve-Path (Join-Path $PSScriptRoot "..")).Path) "m3")
)

$ErrorActionPreference = "Stop"
$copied   = @()   # provenance: скопировано КАК ЕСТЬ
$created  = @()   # создано (затычки / docs / dashboard)

function Ensure-Dir([string]$p) {
    if (-not (Test-Path -LiteralPath $p)) { New-Item -ItemType Directory -Force -Path $p | Out-Null }
}

function Copy-Provenance([string]$rel) {
    $src = Join-Path $SourceRoot $rel
    $dst = Join-Path $TargetRoot $rel
    if (-not (Test-Path -LiteralPath $src)) {
        Write-Warning "ИСТОЧНИК ОТСУТСТВУЕТ (пропущено): $rel"
        return
    }
    Ensure-Dir (Split-Path $dst)
    Copy-Item -LiteralPath $src -Destination $dst -Force
    $hash = (Get-FileHash -LiteralPath $src -Algorithm SHA256).Hash
    $script:copied += [pscustomobject]@{ File = $rel; SHA256 = $hash }
}

function Write-Stub([string]$rel, [string]$content) {
    $dst = Join-Path $TargetRoot $rel
    Ensure-Dir (Split-Path $dst)
    Set-Content -LiteralPath $dst -Value $content -Encoding utf8 -NoNewline
    $script:created += $rel
}

# ============================================================
# 1. КАРКАС КАТАЛОГОВ m3
# ============================================================
$dirs = @(
    ".codeassistant", ".vscode", "dashboard", "dist", "docs",
    "EdgeExtension/src/core", "EdgeExtension/src/ui",
    "reports", "scripts", "data", "icons"
)
foreach ($d in $dirs) { Ensure-Dir (Join-Path $TargetRoot $d) }

# ============================================================
# 2. КОПИЯ КАК ЕСТЬ (provenance)
# ============================================================
Copy-Provenance "scripts/Build.ps1"
Copy-Provenance "scripts/Clean.ps1"
Copy-Provenance "scripts/Test.ps1"
Copy-Provenance ".codeassistant/mcp.json"
Copy-Provenance "opencode.jsonc"
Copy-Provenance ".nvmrc"
Copy-Provenance ".gitattributes"
Copy-Provenance ".gitignore"
Copy-Provenance "LICENSE"
Copy-Provenance "icons/icon.svg"
Copy-Provenance "EdgeExtension/src/core/messaging.js"
Copy-Provenance "EdgeExtension/src/core/normalize.js"
# .vscode/*
Copy-Provenance ".vscode/launch.json"
Copy-Provenance ".vscode/settings.json"
Copy-Provenance ".vscode/extensions.json"

# ============================================================
# 3. ЗАТЫЧКИ (заголовки + пустая реализация)
# ============================================================

# --- manifest.json («Мои записки», 0.1.0) ---
$manifest = @'
{
  "manifest_version": 3,
  "name": "Мои записки",
  "version": "0.1.0",
  "description": "Картотека записок — каркас m3. Логика не заполнена (TASK-0100).",
  "permissions": ["contextMenus", "storage"],
  "background": { "service_worker": "src/background.js" },
  "content_scripts": [
    {
      "matches": ["https://vk.ru/*"],
      "js": ["src/core/messaging.js", "src/core/normalize.js", "src/core/storage.js", "src/ui/layer.js", "src/content.js"],
      "run_at": "document_idle"
    }
  ],
  "host_permissions": ["https://vk.ru/*"]
}
'@
Write-Stub "EdgeExtension/manifest.json" $manifest

# --- src/core/storage.js (API loadDb/saveDb/exportFile, файл-первично) ---
$storage = @'
/* Context VK.RU · m3 · src/core/storage.js — ЗАТЫЧКА (TASK-0100).
 * Хранилище картотеки. ФАЙЛ-ПЕРВИЧНО: источник данных — data/zapiski.json,
 * а не chrome.storage.local. Chrome-storage — лишь кэш/зеркало файла.
 *
 * API (контракт, логика не заполнена):
 *   loadDb()      -> Promise<Db>            прочитать базу (из файла/кэша)
 *   saveDb(db)    -> Promise<void>          записать базу (файл первичен)
 *   exportFile(db)-> Promise<Blob|string>   экспорт базы в файл (JSON)
 */
(function () {
  "use strict";

  function loadDb() {
    // TODO(m3): чтение data/zapiski.json (файл-первично) + зеркалирование в кэш.
    return Promise.resolve({ version: 1, cards: [] });
  }

  function saveDb(db) {
    // TODO(m3): запись в data/zapiski.json (файл первичен).
    return Promise.resolve();
  }

  function exportFile(db) {
    // TODO(m3): сериализация базы в файл для экспорта.
    return Promise.resolve(JSON.stringify(db, null, 2));
  }

  globalThis.CTX_STORAGE = Object.freeze({ loadDb: loadDb, saveDb: saveDb, exportFile: exportFile });
})();
'@
Write-Stub "EdgeExtension/src/core/storage.js" $storage

# --- src/ui/layer.js (интерфейс IDrawLayer) ---
$layer = @'
/* Context VK.RU · m3 · src/ui/layer.js — ЗАТЫЧКА (TASK-0100).
 * Слой отрисовки поверх портала. Реализует интерфейс IDrawLayer:
 *
 *   interface IDrawLayer {
 *     init(scope?: Element): void   инициализация слоя (создание носителя)
 *     draw(scope?: Element): void   перерисовать метки (опционально в пределах scope)
 *     clear(): void                 очистить слой
 *   }
 *
 * Носитель — собственное стекло вне DOM портала (выводы v07x: инъекции стираются).
 * Логика не заполнена.
 */
(function () {
  "use strict";

  function init(scope) {
    // TODO(m3): создать носитель слоя (стекло), подключить триггеры.
  }

  function draw(scope) {
    // TODO(m3): перерисовать метки по координатам (опционально в пределах scope).
  }

  function clear() {
    // TODO(m3): очистить носитель слоя.
  }

  globalThis.CTX_LAYER = Object.freeze({ init: init, draw: draw, clear: clear });
})();
'@
Write-Stub "EdgeExtension/src/ui/layer.js" $layer

# --- src/ui/kartoteka.html ---
$kartotekaHtml = @'
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <title>Картотека — Мои записки</title>
</head>
<body>
  <!-- m3 · ЗАТЫЧКА (TASK-0100): UI картотеки. Логика не заполнена. -->
  <h1>Картотека</h1>
  <p>Каркас m3 — интерфейс картотеки будет реализован на следующих этапах.</p>
  <script src="../core/storage.js"></script>
  <script src="kartoteka.js"></script>
</body>
</html>
'@
Write-Stub "EdgeExtension/src/ui/kartoteka.html" $kartotekaHtml

# --- src/ui/kartoteka.js ---
$kartotekaJs = @'
/* Context VK.RU · m3 · src/ui/kartoteka.js — ЗАТЫЧКА (TASK-0100).
 * Логика UI картотеки (список карточек, поиск, фильтры). Не заполнена.
 */
(function () {
  "use strict";
  // TODO(m3): рендер картотеки из CTX_STORAGE.loadDb().
})();
'@
Write-Stub "EdgeExtension/src/ui/kartoteka.js" $kartotekaJs

# --- src/content.js ---
$content = @'
/* Context VK.RU · m3 · src/content.js — ЗАТЫЧКА (TASK-0100).
 * Тонкая точка входа на странице портала. Логика не заполнена.
 */
(() => {
  "use strict";
  if (location.host !== "vk.ru") return;
  // TODO(m3): старт, инициализация слоя, приём сообщений, изъятие.
})();
'@
Write-Stub "EdgeExtension/src/content.js" $content

# --- src/background.js (меню ПЕР/СОО) ---
$background = @'
/* Context VK.RU · m3 · src/background.js — ЗАТЫЧКА (TASK-0100).
 * Service Worker. Контекстное меню: ПЕР (персона) / СОО (сообщество).
 * Логика не заполнена.
 */
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({ id: "per", title: "ПЕР — персона", contexts: ["link"] });
    chrome.contextMenus.create({ id: "soo", title: "СОО — сообщество", contexts: ["link"] });
  });
});
// TODO(m3): обработка меню ПЕР/СОО, запись в картотеку.
'@
Write-Stub "EdgeExtension/src/background.js" $background

# --- data/zapiski.json ---
$zapiski = @'
{
  "version": 1,
  "cards": []
}
'@
Write-Stub "data/zapiski.json" $zapiski

# ============================================================
# 4. docs/ (тексты проектировщика — каркас из диалога)
# ============================================================

$aboutUser = @'
# ABOUT_USER — о пользователе

> Каркас m3 (TASK-0100). Наполняется проектировщиком.

Пользователь — владелец картотеки «Мои записки»: расширения для vk.ru,
которое помогает фиксировать и опознавать персоны и сообщества, вести
записки и точки встреч.

## Принципы работы с пользователем

- Статус PASS/FAIL и DONE устанавливает только Пользователь (по хэшу коммита).
- Код передаётся закоммиченным файлом; факт = репозиторий пользователя.
- Минимализм: один модуль — одна сборка — один результат.
'@
Write-Stub "docs/ABOUT_USER.md" $aboutUser

$stages = @'
# STAGES — этапы

> Каркас m3 (TASK-0100). Модель mem-2026.

## Прошлое — Этап 0
Контрольный каркас и диагностика: манифест, Service Worker, content script,
канал связи, опознание портала. Завершён.

## Настоящее — Этап 1
Картотека: изъятие по ПКМ, запись карточек, файл-первичное хранение
(data/zapiski.json), слой отрисовки поверх портала. В работе.

## Будущее — Этапы 2–3 + трек mem-2026
- Этап 2: маркировка и опознание сохранённых на странице, скальпель.
- Этап 3: картотека-UI, экспорт/импорт, персоны и шкалы групп.
- Трек mem-2026: мемориальные данные (НЕ переносятся в m3, см. TASK-0100).
'@
Write-Stub "docs/STAGES.md" $stages

$regulations = @'
# REGULATIONS — регламент работ

> Каркас m3 (TASK-0100). Свод правил из диалога (регламент v2.0 + Дополнения А, Б).

## Ядро регламента

1. Один модуль — одна тестовая сборка — один результат.
2. Vanilla JS, ноль зависимостей; пакет EdgeExtension/ чист.
3. Минимальные разрешения; в DOM портала не добавляется ничего (оверлей-стекло).
4. Ключ сущности — нормализованный href, не data-* и не vkit-*.
5. Селекторы с подчёркиванием — только через String.fromCharCode(95).

## Дополнение А — целостность и гейты
Код — только закоммиченным файлом; РЕПО-ГЕЙТ (raw-верификация до теста);
PASS/FAIL — только Пользователь; приёмочный гейт — самодиагностика.

## Дополнение Б — одна копия файла
Файл содержит ровно одну копию кода; правка = замена, а не дописывание;
самопроверка после применения; статус DONE — только после хэша пользователя.
Факт = репозиторий пользователя.
'@
Write-Stub "docs/REGULATIONS.md" $regulations

# ============================================================
# 5. dashboard/ — BOARD.md + index.html «прошлое–настоящее–будущее»
# ============================================================

$board = @'
# BOARD — доска «прошлое–настоящее–будущее»

> Каркас m3 (TASK-0100). Статика, ноль зависимостей: dashboard/index.html.

## Прошлое — Этап 0
Контрольный каркас, диагностика, канал связи, опознание портала. DONE.

## Настоящее — Этап 1
Картотека: изъятие, карточки, файл-первичное хранение, слой отрисовки. IN PROGRESS.

## Будущее — Этапы 2–3 + трек mem-2026
Маркировка и скальпель (Этап 2), картотека-UI и экспорт (Этап 3),
трек mem-2026 (мемориальные данные, не переносятся). PLANNED.
'@
Write-Stub "dashboard/BOARD.md" $board

$indexHtml = @'
<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Мои записки — доска m3</title>
<style>
  :root{
    --bg:#0d1117; --panel:#161b22; --line:#2d333b; --ink:#e6edf3;
    --dim:#8b949e; --past:#58a6ff; --now:#e8b931; --next:#8b949e;
    --accent:#3fb950; --mono:ui-monospace,Consolas,monospace;
    --disp:Georgia,'Times New Roman',serif;
  }
  *{margin:0;padding:0;box-sizing:border-box}
  body{background:var(--bg);color:var(--ink);font:15px/1.6 -apple-system,Segoe UI,sans-serif;min-height:100vh}
  .wrap{max-width:1100px;margin:0 auto;padding:48px 24px 64px}
  header{border-bottom:1px solid var(--line);padding-bottom:20px;margin-bottom:36px;display:flex;align-items:baseline;justify-content:space-between;flex-wrap:wrap;gap:8px}
  h1{font:700 30px/1.15 var(--disp);letter-spacing:.01em}
  .tag{font:11px var(--mono);color:var(--dim);border:1px solid var(--line);padding:4px 10px;border-radius:999px}
  .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
  @media(max-width:860px){.grid{grid-template-columns:1fr}}
  .col{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:22px;position:relative;overflow:hidden;transition:transform .18s ease,border-color .18s ease}
  .col:hover{transform:translateY(-3px)}
  .col::before{content:"";position:absolute;inset:0 0 auto 0;height:3px}
  .past::before{background:var(--past)} .past:hover{border-color:var(--past)}
  .now::before{background:var(--now)}   .now:hover{border-color:var(--now)}
  .next::before{background:var(--next)} .next:hover{border-color:var(--next)}
  .epoch{font:11px var(--mono);text-transform:uppercase;letter-spacing:.14em;margin-bottom:6px}
  .past .epoch{color:var(--past)} .now .epoch{color:var(--now)} .next .epoch{color:var(--dim)}
  h2{font:700 20px var(--disp);margin-bottom:12px}
  ul{list-style:none}
  li{padding:7px 0 7px 20px;position:relative;color:var(--dim);font-size:13.5px;border-bottom:1px dashed var(--line)}
  li:last-child{border-bottom:none}
  li::before{content:"";position:absolute;left:2px;top:14px;width:7px;height:7px;border-radius:50%}
  .past li::before{background:var(--past)} .now li::before{background:var(--now)} .next li::before{background:var(--next)}
  .st{float:right;font:10px var(--mono);padding:2px 8px;border-radius:999px;border:1px solid var(--line)}
  .done{color:var(--accent);border-color:var(--accent)}
  .wip{color:var(--now);border-color:var(--now)}
  .plan{color:var(--dim)}
  .pulse{display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--now);margin-right:7px;animation:pulse 1.6s infinite}
  @keyframes pulse{0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(232,185,49,.5)}50%{opacity:.55;box-shadow:0 0 0 6px rgba(232,185,49,0)}}
  footer{margin-top:40px;font:11px var(--mono);color:var(--dim);text-align:center}
</style>
</head>
<body>
<div class="wrap">
  <header>
    <h1>Мои записки · доска</h1>
    <span class="tag">m3 · mem-2026 · TASK-0100</span>
  </header>
  <div class="grid">
    <section class="col past">
      <div class="epoch">Прошлое</div>
      <h2>Этап 0</h2>
      <ul>
        <li><span class="st done">DONE</span>Контрольный каркас MV3</li>
        <li><span class="st done">DONE</span>Диагностический канал</li>
        <li><span class="st done">DONE</span>Опознание портала, id</li>
      </ul>
    </section>
    <section class="col now">
      <div class="epoch">Настоящее</div>
      <h2><span class="pulse"></span>Этап 1</h2>
      <ul>
        <li><span class="st wip">WIP</span>Картотека, изъятие по ПКМ</li>
        <li><span class="st wip">WIP</span>Файл-первичное хранение</li>
        <li><span class="st wip">WIP</span>Слой отрисовки (стекло)</li>
      </ul>
    </section>
    <section class="col next">
      <div class="epoch">Будущее</div>
      <h2>Этапы 2–3</h2>
      <ul>
        <li><span class="st plan">PLAN</span>Этап 2 — маркировка, скальпель</li>
        <li><span class="st plan">PLAN</span>Этап 3 — картотека-UI, экспорт</li>
        <li><span class="st plan">PLAN</span>трек mem-2026</li>
      </ul>
    </section>
  </div>
  <footer>прошлое — настоящее — будущее · статика, ноль зависимостей</footer>
</div>
</body>
</html>
'@
Write-Stub "dashboard/index.html" $indexHtml

# ============================================================
# 6. ОТЧЁТ (список + provenance-хэши)
# ============================================================
$report = New-Object System.Text.StringBuilder
[void]$report.AppendLine("# ОТЧЁТ m3 — каркас и перенос (provenance) [TASK-0100]")
[void]$report.AppendLine("")
[void]$report.AppendLine("Дата: $(Get-Date -Format 'yyyy-MM-dd HH:mm')")
[void]$report.AppendLine("Источник: ``$SourceRoot``")
[void]$report.AppendLine("Цель: ``$TargetRoot``")
[void]$report.AppendLine("")
[void]$report.AppendLine("## Скопировано КАК ЕСТЬ (provenance, SHA256)")
[void]$report.AppendLine("")
[void]$report.AppendLine("| Файл | SHA256 |")
[void]$report.AppendLine("|------|--------|")
foreach ($c in $copied) {
    [void]$report.AppendLine("| ``$($c.File)`` | ``$($c.SHA256)`` |")
}
[void]$report.AppendLine("")
[void]$report.AppendLine("## Создано (затычки / docs / dashboard)")
[void]$report.AppendLine("")
foreach ($s in $created) { [void]$report.AppendLine("- ``$s``") }
[void]$report.AppendLine("")
[void]$report.AppendLine("## НЕ копировалось")
[void]$report.AppendLine("")
[void]$report.AppendLine("- wrap/unwrap-инъекции (старый слой v07x)")
[void]$report.AppendLine("- мемориальные данные mem-2026")
[void]$report.AppendLine("")

Ensure-Dir (Join-Path $TargetRoot "reports")
$reportPath = Join-Path $TargetRoot "reports/migrate-m3-report.md"
Set-Content -LiteralPath $reportPath -Value $report.ToString() -Encoding utf8

Write-Host ""
Write-Host "=== ОТЧЁТ m3 ===" -ForegroundColor Green
Write-Host ($report.ToString())
Write-Host "Отчёт сохранён: $reportPath" -ForegroundColor Cyan
Write-Host "Каркас m3 готов: $TargetRoot" -ForegroundColor Cyan
