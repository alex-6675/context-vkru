/* Context VK.RU · v_03 · background.js
 * v_01: жизненный цикл. v_02: PING/PONG.
 * v_03: + приём ENTITY_FOUND, лог сводки в консоль SW.
 * Vanilla JS, ноль зависимостей (РЕГЛАМЕНТ §2.2).
 */
importScripts("./core/messaging.js");
console.log(`[CTX ${CTX_BUILD}] service worker started`);
chrome.runtime.onInstalled.addListener((d) =>
  console.log(`[CTX ${CTX_BUILD}] installed (${d.reason})`));

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg || typeof msg !== "object") return false;
  if (msg.type === CTX_MSG.PING) {
    const tabId = sender.tab ? sender.tab.id : "?";
    console.log(`[CTX ${CTX_BUILD}] PING from tab ${tabId}`);
    sendResponse({ type: CTX_MSG.PONG, build: CTX_BUILD,
      payload: { tabId, receivedAt: Date.now() } });
    return false;
  }
  if (msg.type === CTX_MSG.ENTITY_FOUND) {
    const p = msg.payload || {};
    console.log(`[CTX ${CTX_BUILD}] entities reported: ${p.count} (tab ${sender.tab ? sender.tab.id : "?"})`);
    (p.entities || []).forEach((e) =>
      console.log(`[CTX ${CTX_BUILD}]   ${e.kind} ${e.type} ${e.identity.id} ` +
        `"${e.authorName}" post=${e.context.postUrl || "-"} reply=${e.context.replyId || "-"}`));
    sendResponse({ ok: true });
    return false;
  }
  return false;
});