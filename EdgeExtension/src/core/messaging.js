/* Context VK.RU · core/messaging.js · v_03
 * Общие константы сообщений (MV3 message passing).
 *
 * v_02: PING/PONG.
 * v_03: + ENTITY_FOUND (content.js -> background.js).
 *
 * Подключение: в content-скрипты — манифестом, ПЕРЕД остальными файлами;
 * в Service Worker — importScripts("./core/messaging.js").
 * Vanilla JS, ноль зависимостей (РЕГЛАМЕНТ §2.2).
 */

const CTX_BUILD = "v_03";

const CTX_MSG = Object.freeze({
  PING: "ctx:ping",
  PONG: "ctx:pong",
  ENTITY_FOUND: "ctx:entity-found",
});

globalThis.CTX_BUILD = CTX_BUILD;
globalThis.CTX_MSG = CTX_MSG;