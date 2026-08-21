/* Context VK.RU · core/messaging.js · v07r
 * Общие константы сообщений (MV3 message passing).
 *
 * v03r: CAPTURED (background -> content).
 * v07r: + OPEN_CARD (content -> background: открыть карточку коррекции);
 *       версия сборки v07r.
 *
 * Подключение: в content-скрипты — манифестом, ПЕРЕД content.js;
 * в Service Worker — importScripts("./core/messaging.js").
 * Vanilla JS, ноль зависимостей (РЕГЛАМЕНТ §2.2).
 */

const CTX_BUILD = "v07r";

const CTX_MSG = Object.freeze({
  CAPTURED: "ctx:captured",
  OPEN_CARD: "ctx:open-card",
});

globalThis.CTX_BUILD = CTX_BUILD;
globalThis.CTX_MSG = CTX_MSG;
