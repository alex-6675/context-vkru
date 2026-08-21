/* Context VK.RU · core/messaging.js · v04r
 * Общие константы сообщений (MV3 message passing).
 *
 * v03r: единственный тип сообщения — CAPTURED (background -> content).
 * v04r: версия сборки; типы сообщений без изменений.
 *
 * Подключение: в content-скрипты — манифестом, ПЕРЕД content.js;
 * в Service Worker — importScripts("./core/messaging.js").
 * Vanilla JS, ноль зависимостей (РЕГЛАМЕНТ §2.2).
 */

const CTX_BUILD = "v04r";

const CTX_MSG = Object.freeze({
  CAPTURED: "ctx:captured",
});

globalThis.CTX_BUILD = CTX_BUILD;
globalThis.CTX_MSG = CTX_MSG;
