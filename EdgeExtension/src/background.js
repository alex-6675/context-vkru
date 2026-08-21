/* Context VK.RU · v07r · background.js
 * v03r: ПКМ-изъятие — браузер сам отдаёт linkUrl/pageUrl (Решение №2).
 * v04r: нормализатор — портал, id, тип (из меню), metPost (из page).
 * v05r: запись в базу (chrome.storage.local) по контракту карточки v2.
 * v06r: фикс D1 — дедуп комментариев по portal+id+replyId; разные
 *       комментарии одного поста = разные карточки (Решение №3).
 * v07r: приём OPEN_CARD от контент-скрипта → chrome.windows.create
 *       (окно карточки коррекции, dialog.html#cardId).
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
  const reply = CTX_NORMALIZE.replyOf(link);
  const isComment = reply !== "";
  const kind = isComment ? "COMMENT" : undefined;
  const date = new Date().toISOString().slice(0, 10);

  const db = await CTX_STORAGE.loadDb();
  let logLine;

  /* Дедуп (фикс D1): COMMENT — совпадение portal+id+replyId;
   * остальные — portal+id при отсутствии replyId у identity. */
  const existing = db.cards.find(function (c) {
    return (c.identities || []).some(function (it) {
      if (it.portal !== norm.portal || it.id !== norm.id) return false;
      if (isComment) return it.replyId === reply;
      return !it.replyId;
    });
  });

  if (existing) {
    /* Не создавать: обновить lastSeen + history. */
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
    const identity = {
      portal: norm.portal,
      id: norm.id,
      url: link,
      name: "",
      metAt: date,
      metUrl: metPost,
    };
    if (isComment) identity.replyId = reply;
    db.cards.push({
      cardId: cardId,
      created: date,
      displayName: "",
      note: "",
      status: "saved",
      visual: { faded: false },
      identities: [identity],
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
    replyId: reply,
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

/* v07r: клик по метке на странице → окно карточки коррекции. */
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg && msg.type === CTX_MSG.OPEN_CARD) {
    const cardId = (msg.payload && msg.payload.cardId) || "";
    chrome.windows.create({
      url: "dialog.html#" + encodeURIComponent(cardId),
      type: "popup",
      width: 480,
      height: 640,
      focused: true,
    });
  }
  return false;
});
