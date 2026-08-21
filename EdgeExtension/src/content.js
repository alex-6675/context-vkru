/* Context VK.RU · v06r · content.js. Маркировка сохранённых после F5:
   ▲ персонаж/сообщество, ◆ закладка комментария. Только span.ctx-mark,
   атрибуты VK не трогаем (§H). */
(() => {
  "use strict";
  if (location.host !== "vk.ru") return;
  console.log("[CTX " + CTX_BUILD + "] content started — path: " + location.pathname);
  var marked = new WeakSet();
  var index = null;
  function buildIndex(db) {
    var byId = {}, byComment = {}, legacy = {};
    (db.cards || []).forEach(function (c) {
      (c.identities || []).forEach(function (it) {
        if (it.replyId) byComment[it.id + "#" + it.replyId] = c.cardId;
        else if (it.id && it.id.indexOf("wall") === 0) legacy[it.id] = c.cardId;
        else byId[it.id] = c.cardId;
      });
    });
    return { byId: byId, byComment: byComment, legacy: legacy };
  }
  function mark(a, cardId, sym) {
    if (marked.has(a)) return false;
    marked.add(a);
    var s = document.createElement("span");
    s.className = sym === "◆" ? "ctx-mark ctx-mark-c" : "ctx-mark";
    s.textContent = sym;
    s.title = "CTX: " + cardId;
    if (a.parentNode) a.parentNode.insertBefore(s, a.nextSibling);
    return true;
  }
  function scan() {
    if (!index) return;
    var n = 0;
    document.querySelectorAll("a[href]").forEach(function (a) {
      var href = a.getAttribute("href") || "";
      if (href.charAt(0) !== "/" && href.indexOf("https://vk.ru") !== 0) return;
      var abs = href.charAt(0) === "/" ? location.origin + href : href;
      var norm = CTX_NORMALIZE.normalize(abs, "save-person");
      if (norm.portal !== "vk") return;
      var reply = CTX_NORMALIZE.replyOf(abs);
      var cardId = null;
      if (reply) cardId = index.byComment[norm.id + "#" + reply] || index.legacy[norm.id] || null;
      if (!cardId) cardId = index.byId[norm.id] || null;
      if (cardId && mark(a, cardId, reply ? "◆" : "▲")) n++;
    });
    if (n) console.log("[CTX " + CTX_BUILD + "] marked " + n + " anchors");
  }
  var timer = 0;
  CTX_STORAGE.loadDb().then(function (db) {
    var list = (db.cards || []).map(function (c) {
      return c.cardId + " (" + (((c.identities || [])[0] || {}).id || "") + ")";
    }).join(", ");
    console.log("[CTX " + CTX_BUILD + "] db: " + (db.cards || []).length + " cards: " + list);
    index = buildIndex(db);
    scan();
    new MutationObserver(function () {
      clearTimeout(timer); timer = setTimeout(scan, 600);
    }).observe(document.body, { childList: true, subtree: true });
  });
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg && msg.type === CTX_MSG.CAPTURED) {
      const p = msg.payload || {};
      console.log("[CTX " + CTX_BUILD + "] captured | menu: " + p.menu +
        " | portal: " + p.portal + " | id: " + p.id + " | type: " + p.type +
        (p.kind ? " | kind: " + p.kind : "") + " | link: " + p.link +
        " | page: " + p.page + " | db: " + p.db);
    }
  });
})();