# TERRITORY-m3 — приведение территории в порядок + каркас переноса

> TASK-0100 · коммит: `chore: m3 — каркас и перенос (provenance) [TASK-0100]`

## Пункт 0 — территория первой (context-vkru, до переноса)

### TASK-0002 — DONE
Запуск Edge с `--remote-debugging-port=9222`: `scripts/RunEdgeCdp.ps1`.
Изолированный профиль `.edge-cdp-profile`, CDP на `http://localhost:9222`.
Проверка: `Invoke-RestMethod http://localhost:9222/json/version`.

### TASK-0005 — DONE
`.vscode/` под Edge: `launch.json` (отладка расширения + дашборда + attach к CDP :9222),
`settings.json`, `extensions.json`.

## Подготовка исходников «КОПИИ КАК ЕСТЬ»

Созданы в территории (для переноса скриптом):
- `.codeassistant/mcp.json`, `opencode.jsonc`, `.gitattributes`, `LICENSE`, `icons/icon.svg`
- Уже были: `scripts/{Build,Clean,Test}.ps1`, `.nvmrc`, `.gitignore`,
  `EdgeExtension/src/core/{messaging,normalize}.js`

## Пункт 1 — каркас переноса

`scripts/migrate-to-m3.ps1` (запуск в локали пользователя) создаёт каркас m3:
каталоги, КОПИЯ КАК ЕСТЬ (SHA256 provenance), ЗАТЫЧКИ (manifest «Мои записки» 0.1.0,
storage/layer/kartoteka/content/background, data/zapiski.json), docs/
(ABOUT_USER, STAGES, REGULATIONS), dashboard/ (BOARD.md + index.html
«прошлое–настоящее–будущее»).

## Пункт 2 — НЕ копировать

wrap/unwrap-инъекции (старый слой v07x), мемориальные данные mem-2026.

## Пункт 3 — отчёт

Список созданных/скопированных + provenance-хэши — в `reports/migrate-m3-report.md`
(генерируется скриптом при запуске).
