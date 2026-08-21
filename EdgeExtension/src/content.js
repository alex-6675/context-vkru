/* Context VK.RU · v05r · content.js
 * Расширение молчит, пока пользователь не скажет «вот этот».
 * v03r: приём CAPTURED от Service Worker.
 * v05r: при старте читает базу и логирует число карточек + их id.
 * Vanilla JS, ноль зависимостей (§2.2).
 */
(() => {
  "use strict";
  if (location.host !== "vk.ru") return;
  console.log("[CTX " + CTX_BUILD + "] content started — path: " + location.pathname);

  /* Персистентность: база переживает F5 и перезапуск Edge. */
  CTX_STORAGE.loadDb().then((db) => {
    const list = db.cards.map((c) => {
      const first = (c.identities && c.identities[0]) || {};
      return c.cardId + (first.id ? " (" + first.id + ")" : "");
    }).join(", ");
    console.log("[CTX " + CTX_BUILD + "] db: " + db.cards.length + " cards" + (list ? ": " + list : ""));
  }).catch(() => {});

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg && msg.type === CTX_MSG.CAPTURED) {
      const p = msg.payload || {};
      console.log("[CTX " + CTX_BUILD + "] captured | menu: " + p.menu +
        " | portal: " + p.portal + " | id: " + p.id + " | type: " + p.type +
        " | metPost: " + p.metPost + (p.kind ? " | kind: " + p.kind : "") +
        " | link: " + p.link + " | page: " + p.page + " | db: " + (p.db || ""));
    }
  });
})();
