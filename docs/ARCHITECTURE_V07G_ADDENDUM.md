# Поправка к docs/architecture.md — v07g (стекло и скальпель)

> Источник: задание TASK-0011 (v07g, диагноз v07d). Вставляется в
> `docs/architecture.md` при коммите. Код v07g реализован по этой поправке.

## §H — Собственный UI-слой (уточнение)

Собственный слой = **оверлей-стекло по координатам**: неподвижный
`div#ctx-glass` (`position:fixed; inset:0; pointer-events:none;
z-index:2147483000`) с абсолютно позиционированными подложками и маркерами,
позиционируемыми по `getBoundingClientRect()` якорей портала.

**В DOM портала не добавляется ничего.** Инъекция узлов в поддерево React VK
осуждена (диагноз v07d: React стирает чужие узлы — `marked 11 / wrappers in
DOM 0`). Стекло живёт вне поддерева портала и структурно не стирается его
ре-рендером.

**Скальпель = доступ браузера «Разрешить только при нажатии»**
(пользователь переключает один раз; в манифесте этого нет). Нет доступа —
контент не запущен, стекла нет, тишина. Клик по значку — `action.onClicked`
→ `CTX_SYNC` во вкладку: нет выделения → полная перерисовка («искать новые
координаты»); есть текстовое выделение → локальный скальпель (маркеры только
внутри ближайшего контейнера с выделением).

**Индикатор — три состояния на значке** (`setBadgeText`/`setBadgeBackgroundColor`,
по сообщению `BADGE` из контента): серый без бейджа = стекла нет; жёлтый «…» =
поиск координат (draw в процессе); зелёный «N» = стекло внедрено (N маркеров).

## §L — Структура каталогов (к факту v07g)

```
EdgeExtension/
├─ manifest.json              0.0.18 · js: messaging, normalize, storage, ui/layer.js, content
├─ dialog.html                окно карточки коррекции (скрипты: messaging, storage, ui/dialog.js)
├─ _locales/ru/messages.json
└─ src/
   ├─ core/
    │  ├─ messaging.js         CTX_BUILD, CTX_MSG (CAPTURED, OPEN_CARD, SAVE_AUTHOR,
    │  │                       NAME_HINT, MET_HINT, LOG, CTX_SYNC, BADGE)
    │  ├─ normalize.js         portalOf / normalize / metPostOf / replyOf / cleanUrl
    │  └─ storage.js           «ctxdb»: loadDb / saveDb (chrome.storage.local)
    ├─ ui/
    │  ├─ layer.js             СТЕКЛО: div#ctx-glass, draw(scope), триггеры, индикатор (init/rescan/draw)
    │  └─ dialog.js            карточка коррекции (переезд из src/dialog.js в v07g)
    ├─ background.js           SW: contextMenus, изъятие, дедуп, окна, CTX_SYNC, индикатор (badge)
    ├─ content.js              тонкая точка входа: изъятие всегда, CTX_SYNC → init(scope)   └─ adapters/vkru.js        СНЯТ (Решение №2) — остаётся в репо, не инжектится

popup.js — будущая картотека (R13).
```

`styles.css` (v07g): только `#ctx-glass`, `.ctx-g-hl`, `.ctx-g-faded`,
`.ctx-g-mark` — классы с префиксом `ctx-*`, старые `.ctx-hl`/`.ctx-mark`
(инъекция в DOM) удалены.
