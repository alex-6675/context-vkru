/* Context VK.RU · core/messaging.js · v03f2
 * Общие константы сообщений (MV3 message passing).
 *
 * v_02: PING/PONG. v_03: + ENTITY_FOUND.
 * v03f2: номер сборки; имена констант и типы сообщений БЕЗ ИЗМЕНЕНИЙ
 * (background.js не меняется — совместимость обязательна).
 *
 * Подключение: в content-скрипты — манифестом, ПЕРЕД остальными файлами;
 * в Service Worker — importScripts("./core/messaging.js").
 * Vanilla JS, ноль зависимостей (РЕГЛАМЕНТ §2.2).
 */

const CTX_BUILD = "v03f2";

const CTX_MSG = Object.freeze({
  PING: "ctx:ping",
  PONG: "ctx:pong",
  ENTITY_FOUND: "ctx:entity-found",
});

globalThis.CTX_BUILD = CTX_BUILD;
globalThis.CTX_MSG = CTX_MSG;