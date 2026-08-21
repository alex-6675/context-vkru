/* Context VK.RU · v03r · content.js
 * Переворот архитектуры №2: расширение молчит, пока пользователь не скажет
 * «вот этот». Контент-скрипт только принимает CAPTURED от Service Worker
 * и логирует изъятую ссылку. Никаких сканеров и наблюдателей.
 * Vanilla JS, ноль зависимостей (§2.2).
 */
(() => {
  "use strict";
  if (location.host !== "vk.ru") return;
  console.log("[CTX " + CTX_BUILD + "] content started — path: " + location.pathname);
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg && msg.type === CTX_MSG.CAPTURED) {
      const p = msg.payload || {};
      console.log("[CTX " + CTX_BUILD + "] captured | menu: " + p.menu +
        " | link: " + p.link + " | page: " + p.page);
    }
  });
})();
