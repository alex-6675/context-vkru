/* Context VK.RU · v03f2 · content.js
 * v_01: сигнал запуска. v_02: PING/PONG (регрессия).
 * v_03: скан + debounced MutationObserver (600 мс) + дедупликация + отчёт.
 * v03f2: coverage-гейт posts/dates/roots; селекторы собраны через
 * U = String.fromCharCode(95) — в исходнике нет литеральных подчёркиваний
 * в строках-селекторах (§25 регламента).
 * Vanilla JS, ноль зависимостей (РЕГЛАМЕНТ §2.2).
 */
(() => {
  "use strict";
  if (location.host !== "vk.ru") return;
  var U = String.fromCharCode(95);
  console.log(`[CTX ${CTX_BUILD}] content started — path: ${location.pathname}`);

  /* v_02 регрессия: PING/PONG */
  const t0 = performance.now();
  chrome.runtime.sendMessage({ type: CTX_MSG.PING,
    payload: { path: location.pathname } })
    .then((r) => { if (r && r.type === CTX_MSG.PONG)
      console.log(`[CTX ${CTX_BUILD}] PONG (rtt ~${Math.round(performance.now() - t0)} ms)`); })
    .catch(() => {});

  /* v03f2: обнаружение + coverage-гейт */
  const seen = new Set();
  let timer = 0;
  let lastCov = "";

  function coverage() {
    const posts = document.querySelectorAll('[data-testid="post"]').length;
    const dates = document.querySelectorAll(
      'a[data-testid="wall' + U + 'comment' + U + 'date"]').length;
    const roots = document.querySelectorAll(
      '[data-testid="wall' + U + 'comments' + U + 'comment' + U + 'root"],' +
      '[data-testid="wall' + U + 'comments' + U + 'comment' + U + 'in' + U + 'thread"]').length;
    const s = posts + "/" + dates + "/" + roots;
    if (s !== lastCov) { lastCov = s;
      console.log(`[CTX ${CTX_BUILD}] coverage posts/dates/roots = ${s}`); }
  }

  function keyOf(e) {
    if (e.kind === "COMMENT")
      return "C:" + e.context.postUrl + "#" + (e.context.replyId || e.navigationTarget);
    return "P:" + (e.context.postUrl || e.identity.url);
  }

  function report(fresh) {
    if (!fresh.length) return;
    console.log(`[CTX ${CTX_BUILD}] ENTITY FOUND: ${fresh.length} new`);
    fresh.forEach((it) => {
      const e = it.entity;
      console.log(`[CTX ${CTX_BUILD}] ${e.kind} ${e.type} | author="${e.authorName}"` +
        ` | id=${e.identity.id} | post=${e.context.postUrl || "-"}` +
        ` | reply=${e.context.replyId || "-"}` +
        ` | nav=${e.navigationTarget} | sourceElement:`, it.sourceElement);
    });
    chrome.runtime.sendMessage({ type: CTX_MSG.ENTITY_FOUND,
      payload: { count: fresh.length,
                 entities: fresh.map((i) => i.entity) } }).catch(() => {});
  }

  function rescan() {
    if (!globalThis.CTX_VKRU) return;
    coverage();
    const fresh = [];
    CTX_VKRU.scan(document).forEach((it) => {
      const k = keyOf(it.entity);
      if (!seen.has(k)) { seen.add(k); fresh.push(it); }
    });
    report(fresh);
  }

  rescan();
  new MutationObserver(() => {
    clearTimeout(timer);
    timer = setTimeout(rescan, 600);
  }).observe(document.body, { childList: true, subtree: true });
})();