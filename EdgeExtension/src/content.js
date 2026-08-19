/* Context VK.RU · v_03f · content.js
 * v_01: сигнал запуска. v_02: PING/PONG (регрессия).
 * v_03: скан + debounced MutationObserver (600 мс) + дедупликация + отчёт.
 * v_03f: + coverage-лог (самодиагностика селекторов posts/dates/roots).
 * Vanilla JS, ноль зависимостей (РЕГЛАМЕНТ §2.2).
 */
(() => {
  "use strict";
  if (location.host !== "vk.ru") return;
  console.log(`[CTX ${CTX_BUILD}] content started — path: ${location.pathname}`);

  /* v_02 регрессия: PING/PONG */
  const t0 = performance.now();
  chrome.runtime.sendMessage({ type: CTX_MSG.PING,
    payload: { path: location.pathname } })
    .then((r) => { if (r && r.type === CTX_MSG.PONG)
      console.log(`[CTX ${CTX_BUILD}] PONG (rtt ~${Math.round(performance.now() - t0)} ms)`); })
    .catch(() => {});

  /* v_03: обнаружение */
  const seen = new Set();
  let timer = 0;

  /* v_03f: coverage-лог. Выводится при изменении счётчиков.
     M>0 на странице с комментариями = comment-ветка жива (селекторы целы). */
  let lastCov = null;
  function logCoverage() {
    if (!globalThis.CTX_VKRU) return;
    const cov = CTX_VKRU.coverage(document);
    if (!lastCov ||
        cov.posts !== lastCov.posts ||
        cov.dates !== lastCov.dates ||
        cov.roots !== lastCov.roots) {
      lastCov = cov;
      console.log(`[CTX ${CTX_BUILD}] coverage posts/dates/roots = ${cov.posts}/${cov.dates}/${cov.roots}`);
    }
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
      payload: { count: fresh.length, entities: fresh.map((i) => i.entity) } })
      .catch(() => {});
  }

  function rescan() {
    if (!globalThis.CTX_VKRU) return;
    const fresh = [];
    CTX_VKRU.scan(document).forEach((it) => {
      const k = keyOf(it.entity);
      if (!seen.has(k)) { seen.add(k); fresh.push(it); }
    });
    logCoverage();
    report(fresh);
  }

  rescan();
  new MutationObserver(() => {
    clearTimeout(timer);
    timer = setTimeout(rescan, 600);
  }).observe(document.body, { childList: true, subtree: true });
})();

--- EdgeExtension/src/content.js (原始)
/* Context VK.RU · v_03 · content.js
 * v_01: сигнал запуска. v_02: PING/PONG (регрессия).
 * v_03: скан + debounced MutationObserver (600 мс) + дедупликация + отчёт.
 * Vanilla JS, ноль зависимостей (РЕГЛАМЕНТ §2.2).
 */
(() => {
  "use strict";
  if (location.host !== "vk.ru") return;
  console.log(`[CTX ${CTX_BUILD}] content started — path: ${location.pathname}`);

  /* v_02 регрессия: PING/PONG */
  const t0 = performance.now();
  chrome.runtime.sendMessage({ type: CTX_MSG.PING,
    payload: { path: location.pathname } })
    .then((r) => { if (r && r.type === CTX_MSG.PONG)
      console.log(`[CTX ${CTX_BUILD}] PONG (rtt ~${Math.round(performance.now() - t0)} ms)`); })
    .catch(() => {});

  /* v_03: обнаружение */
  const seen = new Set();
  let timer = 0;

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
      payload: { count: fresh.length, entities: fresh.map((i) => i.entity) } })
      .catch(() => {});
  }

  function rescan() {
    if (!globalThis.CTX_VKRU) return;
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


+++ EdgeExtension/src/content.js (修改后)
/* Context VK.RU · v_03f · content.js
 * v_01: сигнал запуска. v_02: PING/PONG (регрессия).
 * v_03: скан + debounced MutationObserver (600 мс) + дедупликация + отчёт.
 * v_03f: + coverage-самодиагностика (порча селекторов видна мгновенно,
 *        без внешних DIAG-пейстов — report_v_03.md).
 * Vanilla JS, ноль зависимостей (РЕГЛАМЕНТ §2.2).
 */
(() => {
  "use strict";
  if (location.host !== "vk.ru") return;
  console.log(`[CTX ${CTX_BUILD}] content started — path: ${location.pathname}`);

  /* v_02 регрессия: PING/PONG */
  const t0 = performance.now();
  chrome.runtime.sendMessage({ type: CTX_MSG.PING,
    payload: { path: location.pathname } })
    .then((r) => { if (r && r.type === CTX_MSG.PONG)
      console.log(`[CTX ${CTX_BUILD}] PONG (rtt ~${Math.round(performance.now() - t0)} ms)`); })
    .catch(() => {});

  /* v_03f: coverage-лог при каждом изменении счётчиков.
   * dates>0 на странице с комментариями = селекторы живы. */
  let lastCoverage = "";
  function logCoverage() {
    const posts = document.querySelectorAll('[data-testid="post"]').length;
    const dates = document.querySelectorAll('a[data-testid="wall_comment_date"]').length;
    const roots = document.querySelectorAll(
      '[data-testid="wallcomments_comment_root"], [data-testid="wallcomments_comment_in_thread"]'
    ).length;
    const line = `posts/dates/roots = ${posts}/${dates}/${roots}`;
    if (line !== lastCoverage) {
      lastCoverage = line;
      console.log(`[CTX ${CTX_BUILD}] coverage ${line}`);
    }
  }

  /* v_03: обнаружение */
  const seen = new Set();
  let timer = 0;

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
      payload: { count: fresh.length, entities: fresh.map((i) => i.entity) } })
      .catch(() => {});
  }

  function rescan() {
    logCoverage();
    if (!globalThis.CTX_VKRU) return;
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
