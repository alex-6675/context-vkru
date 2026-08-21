/* Context VK.RU · v04r · content.js
 * Расширение молчит, пока пользователь не скажет «вот этот».
 * v03r: приём CAPTURED от Service Worker.
 * v04r: в payload — удостоверение (портал, id, тип, metPost); лог расширен.
 * Никаких сканеров и наблюдателей. Vanilla JS, ноль зависимостей (§2.2).
 */
(() => {
  "use strict";
  if (location.host !== "vk.ru") return;
  console.log("[CTX " + CTX_BUILD + "] content started — path: " + location.pathname);
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg && msg.type === CTX_MSG.CAPTURED) {
      const p = msg.payload || {};
      console.log("[CTX " + CTX_BUILD + "] captured | menu: " + p.menu +
        " | portal: " + p.portal + " | id: " + p.id + " | type: " + p.type +
        " | metPost: " + p.metPost + " | link: " + p.link + " | page: " + p.page);
    }
  });
})();
