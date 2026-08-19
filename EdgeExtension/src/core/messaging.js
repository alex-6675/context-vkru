/* Context VK.RU · core/messaging.js · v_03f
 * Общие константы сообщений (MV3 message passing).
 *
 * v_02: PING/PONG.
 * v_03: + ENTITY_FOUND (content.js -> background.js).
 * v_03f: CTX_BUILD = "v_03f" (fix-итерация после FAIL по v_03).
 *
 * Подключение: в content-скрипты — манифестом, ПЕРЕД остальными файлами;
 * в Service Worker — importScripts("./core/messaging.js").
 * Vanilla JS, ноль зависимостей (РЕГЛАМЕНТ §2.2).
 */

const CTX_BUILD = "v_03f";

const CTX_MSG = Object.freeze({
  PING: "ctx:ping",
  PONG: "ctx:pong",
  ENTITY_FOUND: "ctx:entity-found",
});

globalThis.CTX_BUILD = CTX_BUILD;
globalThis.CTX_MSG = CTX_MSG;