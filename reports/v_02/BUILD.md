# BUILD · v_02 · Диагностический канал

**МОДУЛЬ:** M-02 · **СБОРКА:** v_02 · **СТАТУС:** ожидает ручной проверки в Edge
**ОСНОВАНИЕ:** `reports/v_01/RESULT_v_01.md` — **PASS** от Пользователя (18.08.2026, §4: переход разрешён).

## Изменения относительно v_01

| Файл | Изменение |
| --- | --- |
| `EdgeExtension/src/core/messaging.js` | **Новый.** `CTX_BUILD`, `CTX_MSG` (PING/PONG) — единственный источник типов сообщений |
| `EdgeExtension/src/background.js` | `importScripts("./core/messaging.js")`; `onMessage`: PING → лог → PONG |
| `EdgeExtension/src/content.js` | Отправляет PING (`chrome.runtime.sendMessage`), логирует PONG и rtt |
| `EdgeExtension/manifest.json` | Версия 0.0.2; `default_locale: "ru"` + `__MSG_*__`; `messaging.js` добавлен в `content_scripts.js` **до** `content.js` |
| `EdgeExtension/_locales/ru/messages.json` | **Новый.** `extName`, `extDescription` (обязателен при `default_locale`) |

## Архитектурные решения

- Замечание из RESULT_v_01.md («нет `default_locale: "ru"`») закрыто: локаль объявлена, каталог `_locales/ru/` создан, имя и описание идут через `__MSG_*__`.
- Типы сообщений вынесены в `core/messaging.js` (architecture.md §D, ядро). Без ES-модулей и сборщиков (§2.2): content-скрипты получают его порядком в манифесте, Service Worker — `importScripts`.
- Пространство имён `ctx:` исключает пересечения с сообщениями страницы и других расширений.
- Собственный UI-слой по-прежнему НЕ рисуется; адаптер не пишется (§5.7 — только после диагностики на живом DOM).

## Ограничения v_02 (по плану)

- Канал — только PING/PONG; маршрутизация команд появится с этапами 8–9.
- Нет storage / contextMenus / popup / dialog.

## Как загрузить (обновление существующего расширения)

1. `edge://extensions` → карточка «Context VK.RU» → кнопка **обновления (↻)** — манифест изменился.
2. Проверить версию в карточке: **0.0.2**, красных ошибок нет.
3. Кликнуть «Service Worker» — консоль SW.
4. Открыть/обновить вкладку `https://vk.ru/` (content-скрипты внедряются в новые/обновлённые страницы) → F12 → Console.

Далее — `TEST.md`. Статус PASS/FAIL устанавливает только Пользователь (§5.6).