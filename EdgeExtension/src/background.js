/* Context VK.RU · v04r · background.js
 * v03r: ПКМ-изъятие — браузер сам отдаёт linkUrl/pageUrl (Решение №2).
 * v04r: + нормализатор: портал, id, тип (из пункта меню), metPost (из page).
 * Никакого массового сканирования. Vanilla JS, ноль зависимостей (§2.2).
 */
importScripts("./core/messaging.js");
importScripts("./core/normalize.js");
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
  const link = info.linkUrl || "";
  const page = info.pageUrl || "";
  const norm = CTX_NORMALIZE.normalize(link, info.menuItemId);
  const captured = {
    menu: info.menuItemId,
    link: link,
    page: page,
    portal: norm.portal,
    id: norm.id,
    type: norm.type,
    metPost: CTX_NORMALIZE.metPostOf(page),
    ts: Date.now(),
  };
  console.log("[CTX " + CTX_BUILD + "] captured:", captured);
  if (tab && tab.id !== undefined) {
    chrome.tabs.sendMessage(tab.id,
      { type: CTX_MSG.CAPTURED, payload: captured }).catch(() => {});
  }
});
