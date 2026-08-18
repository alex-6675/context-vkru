/* Context VK.RU · v_02 · content.js
 * Точка входа Content Script.
 *
 * v_01: сигнал запуска на https://vk.ru/.
 * v_02: диагностический канал — PING в background, логирование PONG и rtt.
 *
 * CTX_BUILD / CTX_MSG приходят из core/messaging.js (манифест
 * подключает его раньше этого файла).
 * Vanilla JS, ноль зависимостей (РЕГЛАМЕНТ §2.2).
 */

(() => {
  "use strict";

  const EXPECTED_HOST = "vk.ru";

  /* matches в манифесте уже ограничивают инъекцию, это контрольная проверка. */
  if (location.host !== EXPECTED_HOST) {
    return;
  }

  console.log(
    `[CTX ${CTX_BUILD}] content script active on vk.ru — path: ${location.pathname}`
  );

  /* --- диагностический канал (v_02) --- */
  const t0 = performance.now();
  console.log(`[CTX ${CTX_BUILD}] PING sent to background`);

  chrome.runtime
    .sendMessage({
      type: CTX_MSG.PING,
      payload: { path: location.pathname, sentAt: Date.now() },
    })
    .then((reply) => {
      if (reply && reply.type === CTX_MSG.PONG) {
        const rtt = Math.round(performance.now() - t0);
        console.log(
          `[CTX ${CTX_BUILD}] PONG received from background (build ${reply.build}, rtt ~${rtt} ms)`
        );
      } else {
        console.error(`[CTX ${CTX_BUILD}] unexpected reply:`, reply);
      }
    })
    .catch((err) => {
      console.error(
        `[CTX ${CTX_BUILD}] PING failed — background недоступен: ${err && err.message ? err.message : err}`
      );
    });
})();