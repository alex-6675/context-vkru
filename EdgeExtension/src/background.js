/* Context VK.RU · v_02 · background.js
 * Service Worker (Manifest V3).
 *
 * v_01: жизненный цикл и логирование.
 * v_02: диагностический канал — обработка PING, ответ PONG.
 *
 * Общие типы сообщений — core/messaging.js (importScripts,
 * синхронно на верхнем уровне — требование SW).
 * Vanilla JS, ноль зависимостей (РЕГЛАМЕНТ §2.2).
 */

importScripts("./core/messaging.js");

chrome.runtime.onInstalled.addListener((details) => {
  console.log(
    `[CTX ${CTX_BUILD}] background installed (reason: ${details.reason})`
  );
});

/* Service Worker в MV3 засыпает и просыпается — лог старта
 * помогает видеть его жизненный цикл в edge://extensions. */
console.log(`[CTX ${CTX_BUILD}] service worker started`);

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg || typeof msg !== "object") return false;

  if (msg.type === CTX_MSG.PING) {
    const tabId = sender.tab ? sender.tab.id : "?";
    const path = msg.payload && msg.payload.path ? msg.payload.path : "?";
    console.log(`[CTX ${CTX_BUILD}] PING received from tab ${tabId} (path: ${path})`);

    const reply = {
      type: CTX_MSG.PONG,
      build: CTX_BUILD,
      payload: { tabId, receivedAt: Date.now() },
    };

    console.log(`[CTX ${CTX_BUILD}] PONG sent to tab ${tabId}`);
    sendResponse(reply); // ответ отправлен синхронно
    return false;
  }

  return false;
});