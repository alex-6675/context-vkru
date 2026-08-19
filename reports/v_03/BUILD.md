# BUILD · v_03 · VK.RU Adapter: обнаружение

**МОДУЛЬ:** M-03 (Этап 2) · **СБОРКА:** v_03 · **СТАТУС:** ожидает ручной проверки в Edge
**ОСНОВАНИЕ:** docs/3A.md (3A ЗАКРЫТ: итоговая таблица признаков + задание на v_03)

## Цель

Доказать: адаптер обнаруживает пользовательские объекты VK.RU (комментарии включая треды,
посты) и возвращает `sourceElement`, `navigationTarget`, текст. Только «обнаружил → сообщил».
НЕ делать: ▲, цвет, базу, маркер, CRM, историю, календарь, storage.

## Состав сборки

| Файл | Изменение |
| --- | --- |
| `EdgeExtension/manifest.json` | version 0.0.3; `src/adapters/vkru.js` добавлен в `content_scripts.js` (между messaging.js и content.js) |
| `EdgeExtension/src/core/messaging.js` | `CTX_BUILD = "v_03"`; + `ENTITY_FOUND: "ctx:entity-found"` |
| `EdgeExtension/src/adapters/vkru.js` | **НОВЫЙ**: `scan(doc)`, `normalizeHref`, `classify` → `globalThis.CTX_VKRU` |
| `EdgeExtension/src/content.js` | скан при старте + debounced MutationObserver (600 мс) + дедупликация + отчёт в консоль и SW |
| `EdgeExtension/src/background.js` | + приём `ENTITY_FOUND`, лог сводки в консоль SW |
| `reports/v_03/TEST.md`, `RESULT_v_03.md` | критерии и фиксация вердикта |

## Что сделано

- **vkru.js**: комментарии через `a[data-testid="wall_comment_date"]` +
  `closest(COMMENT_ROOT_SEL)`, где `COMMENT_ROOT_SEL` =
  `wallcomments_comment_root | wallcomments_comment_in_thread` (оба testid — треды);
  посты через `[data-testid="post"]`.
- **Нормализатор href**: отбрасывает trackcode/recom и прочие параметры, сохраняет только
  `reply` и `thread`; **классификатор URL-схемы**: `/idNNN`→PERSON, `/clubNNN`→COMMUNITY,
  `/wall±NNN_MMM`→COMMUNITY_POST / PERSON_POST, иначе OTHER.
- **Контракт ENTITY** (сериализуемая часть): `kind, type, identity{id,url}, authorName,
  text(≤80), navigationTarget, context{source,postUrl,replyId,threadId}`.
  `sourceElement` передаётся отдельно (не сериализуется).
- **content.js**: дедупликация по ключу `C:postUrl#replyId` / `P:postUrl`; новые сущности
  логируются в консоль страницы (с живым `sourceElement` — наведение в консоли подсвечивает
  блок) и шлются в SW.
- **background.js**: `entities reported: N` + список в консоли SW.
- PING/PONG из v_02 сохранён (регрессия).

## Архитектурные решения (из 3A.md, фиксация)

- Поиск **только по data-testid** (CONFIRMED), идентификация **только по href** (CONFIRMED).
  `vkit-*` не используются (CONFIRMED: нестабильны).
- `closest()` по testid делает адаптер нечувствительным к промежуточным vkit-обёрткам
  (lvl 2–6 из 3A.3) — защита от динамической верстки.
- MutationObserver оправдан асинхронной подгрузкой комментариев/тредов (debounce ~600 мс).

## Примечание о переносе селекторов (прозрачность)

Markdown-рендеринг 3A.md повредил часть литералов (доказуемо: корректное в репо
`__MSG_extName__` отображается как `MSG_extName`, `run_at` → `runat`). Повреждённые
идентификаторы восстановлены по калиброванному правилу (пары `_x_` схлопываются рендерером);
восстановленные testid'ы: `wallcomments_comment_root`, `wallcomments_comment_in_thread`,
`wall_comment_date`; `RE_WALL = /^\/wall(-?\d+)_(\d+)$/`; типы `COMMUNITY_POST` /
`PERSON_POST`. Если живой DOM vk.ru покажет иное написание — правка выполняется **внутри
v_03** по RESULT_v_03.md, без изменения архитектуры.

## Как собрать и загрузить

Сборки нет (plain MV3). Файлы в UTF-8. `edge://extensions` → Reload (⟳) на карточке →
версия **0.0.3**, без Errors → перезагрузить вкладку vk.ru. Далее — `TEST.md`.
Статус PASS/FAIL устанавливает только Пользователь (§5.6).