/* Context VK.RU · v06r · background.js. Фикс D1: дедуп COMMENT по
   portal+id+replyId; replyId хранится в identity. */
importScripts("./core/messaging.js");
importScripts("./core/normalize.js");
importScripts("./core/storage.js");
console.log("[CTX " + CTX_BUILD + "] service worker started");
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({ id: "save-person", title: "Сохранить персонажа", contexts: ["link"] });
    chrome.contextMenus.create({ id: "save-community", title: "Сохранить сообщество", contexts: ["link"] });
  });
});
function nextCardId(cards) {
  var n = 0;
  cards.forEach(function (c) {
    var m = /^c(\d+)$/.exec(c.cardId || "");
    if (m) { var v = parseInt(m[1], 10); if (v > n) n = v; }
  });
  return "c" + (n + 1);
}
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const link = info.linkUrl || "", page = info.pageUrl || "";
  const norm = CTX_NORMALIZE.normalize(link, info.menuItemId);
  const metPost = CTX_NORMALIZE.metPostOf(page);
  const reply = CTX_NORMALIZE.replyOf(link);
  const kind = reply ? "COMMENT" : undefined;
  const date = new Date().toISOString().slice(0, 10);
  const db = await CTX_STORAGE.loadDb();
  let logLine;
  const existing = db.cards.find(function (c) {
    return (c.identities || []).some(function (it) {
      if (it.portal !== norm.portal) return false;
      if (kind) return it.id === norm.id && (it.replyId || "") === reply;
      return it.id === norm.id && !it.replyId;
    });
  });
  if (existing) {
    existing.lastSeen = date;
    const h = { date: date, action: "captured", portal: norm.portal, url: link };
    if (kind) h.kind = kind;
    existing.history = (existing.history || []).concat([h]);
    logLine = "уже в базе (card " + existing.cardId + ")";
  } else {
    const identity = { portal: norm.portal, id: norm.id, url: norm.url,
                       name: "", metAt: date, metUrl: metPost };
    if (kind) identity.replyId = reply;
    const card = { cardId: nextCardId(db.cards), created: date, displayName: "",
      note: "", status: "saved", visual: { faded: false }, identities: [identity],
      access: { ownerOnly: false, staffContact: "allowed" },
      history: [{ date: date, action: "captured", portal: norm.portal, url: link }],
      lastSeen: date };
    db.cards.push(card);
    logLine = "saved card " + card.cardId + " (total " + db.cards.length + ")";
  }
  if (kind) logLine += " · kind " + kind;
  console.log("[CTX " + CTX_BUILD + "] captured:",
    { menu: info.menuItemId, link: link, page: page, portal: norm.portal, id: norm.id });
  console.log("[CTX " + CTX_BUILD + "] " + logLine);
  await CTX_STORAGE.saveDb(db);
  if (tab && tab.id !== undefined) {
    chrome.tabs.sendMessage(tab.id, { type: CTX_MSG.CAPTURED,
      payload: { menu: info.menuItemId, link: link, page: page, portal: norm.portal,
                 id: norm.id, type: norm.type, metPost: metPost, kind: kind || "", db: logLine } })
      .catch(() => {});
  }
});