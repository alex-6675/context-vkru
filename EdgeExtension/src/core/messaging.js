/* Context VK.RU · core/messaging.js
 * Общие константы сообщений (MV3 message passing).
 *
 * Подключается двумя способами (без ES-модулей и сборщиков):
 *  - в content-скрипты — манифестом, ПЕРЕД content.js
 *    (content_scripts.js: ["src/core/messaging.js", "src/content.js"]);
 *  - в Service Worker — importScripts("./core/messaging.js").
 *
 * Vanilla JS, ноль зависимостей (РЕГЛАМЕНТ §2.2).
 */

/* Единая версия сборки расширения. */
const CTX_BUILD = "v_02";

/* Типы сообщений. Пространство имён "ctx:" исключает пересечения
 * с сообщениями страницы и других расширений. */
const CTX_MSG = Object.freeze({
  PING: "ctx:ping", // content.js -> background.js
  PONG: "ctx:pong", // background.js -> content.js (ответ)
});

/* Классический скрипт: фиксируем в globalThis, чтобы файл одинаково
 * работал и в мире страницы, и в глобальной области SW. */
globalThis.CTX_BUILD = CTX_BUILD;
globalThis.CTX_MSG = CTX_MSG;