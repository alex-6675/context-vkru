# BUILD · v03f2 · M-03-fix2 (внутри Этапа 2, после FAIL v_03f)

**МОДУЛЬ:** M-03-fix2 · **СБОРКА:** v03f2 · **МАНИФЕСТ:** 0.0.5
**ОСНОВАНИЕ:** reports/v_03/report_v_03_f_fix.md (ветка main-qwen_v_03)

## Вердикт 3C (принят)

Прод повреждён, архитектура здорова: на /feed ground truth dates=168 и
roots+inthread=97+71=168; coverage расширения дала dates=168 / roots=0 —
roots-селекторы съедены порчей передачи. Архитектурное решение 3A
(closest по testid) подтверждено полностью; fallback для /feed не нужен.

## Состав сборки

| Файл | Изменение |
| --- | --- |
| `src/adapters/vkru.js` | **полная замена**: T_DATE/T_ROOT собраны через `U = String.fromCharCode(95)`; RE_WALL — `new RegExp` с U; POST: postUrl из `data-post-id` (CONFIRMED на 100% постов), без postdate-селектора |
| `src/content.js` | **полная замена**: coverage-гейт `posts/dates/roots` (логируется при изменении), селекторы coverage собраны через U |
| `src/core/messaging.js` | `CTX_BUILD = "v03f2"`; имена констант и типы сообщений **без изменений** (совместимость с background.js, raw-файл ветки подтвердил `CTX_BUILD` / `CTX_MSG.ENTITY_FOUND`) |
| `manifest.json` | ТОЛЬКО `version: 0.0.5` |
| `src/background.js` | **НЕ меняется** (приём ENTITY_FOUND и PING/PONG — как в v_03) |

## Порче-невозможность (§25, новое правило регламента)

В строковом содержимом селекторов и regex **нет литеральных подчёркиваний** —
они собираются в runtime:

```
'a[data-testid="wall' + U + 'comment' + U + 'date"]'
    → a[data-testid="wall_comment_date"]
new RegExp("^/wall(-?\\d+)" + U + "(\\d+)$")
    → /^\/wall(-?\d+)_(\d+)$/
```

Канал передачи физически не может съесть то, чего в исходнике нет.
coverage-строка — приёмочный гейт целостности: `roots>0` означает,
что код дошёл до браузера живым.

## Как загрузить

Сохранить UTF-8 → `edge://extensions` → Reload (��) → версия **0.0.5** → F5 на vk.ru.
Далее — `TEST_v03f2.md`. РЕПО-ГЕЙТ действует: коммит в ветку → raw-верификация
проектировщиком → только затем тест пользователем.