/* Context VK.RU · core/messaging.js · v03r
 * Общие константы сообщений (MV3 message passing).
 *
 * Переворот архитектуры №2 (M03r.md): массового сканирования больше нет —
 * расширение молчит, пока пользователь не скажет «вот этот» (ПКМ).
 * Единственный тип сообщения — CAPTURED (background -> content).
 *
 * Подключение: в content-скрипты — манифестом, ПЕРЕД content.js;
 * в Service Worker — importScripts("./core/messaging.js").
 * Vanilla JS, ноль зависимостей (РЕГЛАМЕНТ §2.2).
 */

const CTX_BUILD = "v03r";

const CTX_MSG = Object.freeze({
  CAPTURED: "ctx:captured",
});

globalThis.CTX_BUILD = CTX_BUILD;
globalThis.CTX_MSG = CTX_MSG;
