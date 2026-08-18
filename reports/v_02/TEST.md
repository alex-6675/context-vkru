# TEST · v_02 · Диагностический канал

## 1. Предусловия

- v_01 был PASS (RESULT_v_01.md); расширение «Context VK.RU» уже загружено в Edge.
- Файлы v_02 на диске: `src/core/messaging.js`, обновлённые `background.js` / `content.js`, манифест 0.0.2, `_locales/ru/messages.json`.
- В карточке расширения нажата кнопка **обновления (↻)**; версия в карточке — **0.0.2**, красных ошибок нет.

## 2. Действия

1. В карточке расширения открыть «Service Worker» — посмотреть консоль SW.
2. Открыть (или обновить) вкладку `https://vk.ru/` → F12 → вкладка **Console** (контекст: страница).
3. Обновить страницу (F5) и повторить наблюдение за обеими консолями.
4. Контроль: открыть другой домен (`example.com`) — там не должно быть ни строк `[CTX v_02]`, ни PING.

## 3. Ожидаемый результат (PASS-критерии)

В консоли **Service Worker**:
- `[CTX v_02] service worker started`
- `[CTX v_02] PING received from tab N (path: /...)`
- `[CTX v_02] PONG sent to tab N`

В консоли **страницы vk.ru**:
- `[CTX v_02] content script active on vk.ru — path: /...`
- `[CTX v_02] PING sent to background`
- `[CTX v_02] PONG received from background (build v_02, rtt ~N ms)`

Дополнительно:
- После F5 тройка строк на странице повторяется; SW получает новый PING.
- На других доменах строк нет; вёрстка vk.ru не изменилась.

## 4. Признаки FAIL

- Ошибка загрузки манифеста (например, нет `_locales/ru/messages.json` при `default_locale`).
- Красные ошибки в консоли SW (приложить текст к RESULT_v_02.md).
- `PING failed — background недоступен` или `Could not establish connection. Receiving end does not exist.`
  (обычно: не нажата кнопка ↻ после замены файлов, либо открыта «старая» вкладка vk.ru — обновить её).
- Нет строки PONG или `unexpected reply`.

## 5. RESULT

Фиксация — в `reports/v_02/RESULT_v_02.md`. При **FAIL** остаёмся внутри v_02 (§4, §5.1).
Переход к v_03 (VK.RU Adapter: обнаружение + диагностические snippet'ы) — только после **PASS**.