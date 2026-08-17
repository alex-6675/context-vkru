/* Context VK.RU · v_01 · content.js
 * Точка входа Content Script.
 *
 * Этап 0 «Контрольный каркас»: единственный сигнал запуска на https://vk.ru/.
 * Обнаружение сущностей (adapters/vkru.js), MutationObserver и собственный
 * UI-слой появляются с v_03 (РЕГЛАМЕНТ_РАБОТ v2.0, часть 6).
 *
 * Vanilla JS, ноль зависимостей (РЕГЛАМЕНТ §2.2).
 */

(() => {
  "use strict";

  const BUILD = "v_01";
  const EXPECTED_HOST = "vk.ru";

  /* matches в манифесте уже ограничивают инъекцию, это контрольная проверка. */
  if (location.host !== EXPECTED_HOST) {
    return;
  }

  /* PASS-строка из reports/v_01/TEST.md:
   * [CTX v_01] content script active on vk.ru */
  console.log(
    `[CTX ${BUILD}] content script active on vk.ru — path: ${location.pathname}`
  );
})();