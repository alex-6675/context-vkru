/* Context VK.RU · v05r · background.js
 * v03r: ПКМ-изъятие — браузер сам отдаёт linkUrl/pageUrl (Решение №2).
 * v04r: нормализатор — портал, id, тип (из меню), metPost (из page).
 * v05r: запись в базу (chrome.storage.local) по контракту карточки v2,
 * дедуп по portal+id, kind COMMENT для ссылок с "reply=" (Решение №3).
 * Vanilla JS, ноль зависимостей (§2.2).
 */
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
  const link = info.linkUrl || "";
  const page = info.pageUrl || "";
  const norm = CTX_NORMALIZE.normalize(link, info.menuItemId);
  const metPost = CTX_NORMALIZE.metPostOf(page);
  const kind = link.indexOf("reply=") !== -1 ? "COMMENT" : undefined;
  const date = new Date().toISOString().slice(0, 10);

  const db = await CTX_STORAGE.loadDb();
  let logLine;
  const existing = db.cards.find(function (c) {
    return (c.identities || []).some(function (it) {
      return it.portal === norm.portal && it.id === norm.id;
    });
  });

  if (existing) {
    /* Дедуп: не создавать, обновить lastSeen + history. */
    existing.lastSeen = date;
    const h = { date: date, action: "captured", portal: norm.portal, url: link };
    if (kind) h.kind = kind;
    existing.history = (existing.history || []).concat([h]);
    logLine = "уже в базе (card " + existing.cardId + ")";
  } else {
    /* Новая карточка по контракту v2 с дефолтами. */
    const cardId = nextCardId(db.cards);
    const history = [{ date: date, action: "captured", portal: norm.portal, url: link }];
    if (kind) history[0].kind = kind;
    db.cards.push({
      cardId: cardId,
      created: date,
      displayName: "",
      note: "",
      status: "saved",
      visual: { faded: false },
      identities: [{
        portal: norm.portal,
        id: norm.id,
        url: link,
        name: "",
        metAt: date,
        metUrl: metPost,
      }],
      access: { ownerOnly: false, staffContact: "allowed" },
      history: history,
    });
    logLine = "saved card " + cardId + " (total " + db.cards.length + ")";
  }
  if (kind) logLine += " · kind " + kind;
  await CTX_STORAGE.saveDb(db);

  const captured = {
    menu: info.menuItemId,
    link: link,
    page: page,
    portal: norm.portal,
    id: norm.id,
    type: norm.type,
    metPost: metPost,
    kind: kind || "",
    db: logLine,
    ts: Date.now(),
  };
  console.log("[CTX " + CTX_BUILD + "] captured:", captured);
  console.log("[CTX " + CTX_BUILD + "] " + logLine);
  if (tab && tab.id !== undefined) {
    chrome.tabs.sendMessage(tab.id, { type: CTX_MSG.CAPTURED, payload: captured }).catch(() => {});
  }
});
