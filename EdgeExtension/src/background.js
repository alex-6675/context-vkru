/* Context VK.RU · v03r · background.js
 * Переворот архитектуры №2: изъятие в момент фиксации.
 * ПКМ на ссылке → «Сохранить персонажа / сообщество» → браузер сам отдаёт
 * linkUrl/pageUrl; расширение их изымает и сообщает контент-скрипту.
 * Никакого массового сканирования. Vanilla JS, ноль зависимостей (§2.2).
 */
importScripts("./core/messaging.js");
console.log("[CTX " + CTX_BUILD + "] service worker started");

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "save-person",
      title: "Сохранить персонажа",
      contexts: ["link"],
    });
    chrome.contextMenus.create({
      id: "save-community",
      title: "Сохранить сообщество",
      contexts: ["link"],
    });
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  const captured = {
    menu: info.menuItemId,
    link: info.linkUrl || "",
    page: info.pageUrl || "",
    ts: Date.now(),
  };
  console.log("[CTX " + CTX_BUILD + "] captured:", captured);
  if (tab && tab.id !== undefined) {
    chrome.tabs.sendMessage(tab.id,
      { type: CTX_MSG.CAPTURED, payload: captured }).catch(() => {});
  }
});
