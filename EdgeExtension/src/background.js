/* Context VK.RU · v_01 · background.js
 * Service Worker (Manifest V3).
 *
 * Этап 0 «Контрольный каркас»: только жизненный цикл и логирование.
 * chrome.contextMenus, chrome.storage и маршрутизация сообщений
 * появляются начиная с v_02 (РЕГЛАМЕНТ_РАБОТ v2.0, часть 6).
 *
 * Vanilla JS, ноль зависимостей (РЕГЛАМЕНТ §2.2).
 */

const BUILD = "v_01";

chrome.runtime.onInstalled.addListener((details) => {
  console.log(`[CTX ${BUILD}] background installed (reason: ${details.reason})`);
});

/* Service Worker в MV3 засыпает и просыпается — лог старта
 * помогает видеть его жизненный цикл в edge://extensions. */
console.log(`[CTX ${BUILD}] service worker started`);