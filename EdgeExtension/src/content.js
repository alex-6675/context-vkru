/* Context VK.RU · v07r · content.js — ПОЛНАЯ ЗАМЕНА (TASK-0011).
 * Расширение молчит, пока пользователь не скажет «вот этот».
 *
 * v06r (сохранено): индекс {byId, byComment(id#reply), byCommentLegacy};
 *   скан a[href] с абсолютизацией; ▲ у персон/сообществ, ◆ у закладок
 *   комментариев; WeakSet от дублей; MutationObserver debounced 600 мс.
 * v07r (новое): обёртка span.ctx-hl (заливка ника цветом карточки ~80%)
 *   + маркер; status "dirt" → ctx-faded (opacity .45 + grayscale);
 *   клик по маркеру → OPEN_CARD (background откроет dialog.html);
 *   chrome.storage.onChanged → пересобрать индекс и перерисовать без F5.
 *
 * Свои классы ctx-*; атрибуты узлов VK не трогаются.
 * Vanilla JS, ноль зависимостей (§2.2).
 */
(() => {
  "use strict";
  if (location.host !== "vk.ru") return;

  console.log("[CTX " + CTX_BUILD + "] content started — path: " + location.pathname);

  let INDEX = { byId: new Map(), byComment: new Map(), byCommentLegacy: new Map() };
  let wrappers = [];   /* наши обёртки ctx-hl — для снятия при перерисовке */
  let markTimer = 0;
  const OBS_OPTS = { childList: true, subtree: true };
  const observer = new MutationObserver(() => {
    clearTimeout(markTimer);
    markTimer = setTimeout(scan, 600);
  });

  /* ---------- индекс по базе ---------- */
  function buildIndex(db) {
    const byId = new Map();            /* id -> карточка (▲) */
    const byComment = new Map();       /* id#reply -> карточка (◆, точная) */
    const byCommentLegacy = new Map(); /* id без replyId -> карточка (◆, legacy) */
    (db.cards || []).forEach((card) => {
      (card.identities || []).forEach((it) => {
        if (!it || !it.id) return;
        if (it.replyId) {
          byComment.set(it.id + "#" + it.replyId, card);
        } else {
          byId.set(it.id, card);
          byCommentLegacy.set(it.id, card);
        }
      });
    });
    INDEX = { byId: byId, byComment: byComment, byCommentLegacy: byCommentLegacy };
  }

  /* ---------- цвет карточки → заливка ~80% ---------- */
  function fillOf(card) {
    const hex = card.color || "#2b6fb3";
    const m = /^#([0-9a-f]{6})$/i.exec(hex);
    if (!m) return hex;
    const n = parseInt(m[1], 16);
    return "rgba(" + ((n >> 16) & 255) + "," + ((n >> 8) & 255) + "," + (n & 255) + ",0.8)";
  }

  /* ---------- снять свои обёртки (вернуть якоря как было) ---------- */
  function unwrapAll() {
    wrappers.forEach((w) => {
      const parent = w.parentNode;
      if (!parent) return;
      while (w.firstChild) parent.insertBefore(w.firstChild, w);
      parent.removeChild(w);
    });
    wrappers = [];
  }

  /* ---------- обернуть якорь: заливка + маркер ---------- */
  function wrap(anchor, card, isComment) {
    const hl = document.createElement("span");
    hl.className = "ctx-hl" + (card.status === "dirt" ? " ctx-faded" : "");
    hl.style.background = fillOf(card);
    anchor.parentNode.insertBefore(hl, anchor);
    hl.appendChild(anchor);

    const mark = document.createElement("span");
    mark.className = isComment ? "ctx-mark ctx-mark-c" : "ctx-mark";
    mark.textContent = isComment ? "◆" : "▲";
    mark.title = "CTX: " + card.cardId + (card.displayName ? " · " + card.displayName : "");
    mark.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      chrome.runtime
        .sendMessage({ type: CTX_MSG.OPEN_CARD, payload: { cardId: card.cardId } })
        .catch(() => {});
    });
    hl.appendChild(mark);

    wrappers.push(hl);
  }

  /* ---------- скан якорей ---------- */
  function scan() {
    observer.disconnect(); /* свои мутации не должны будить наблюдателя */
    unwrapAll();

    const seen = new WeakSet(); /* дубли внутри одного прохода */
    let marked = 0;

    document.querySelectorAll("a[href]").forEach((a) => {
      if (seen.has(a) || a.closest(".ctx-hl")) return;
      const href = a.getAttribute("href");
      if (!href) return;

      let abs;
      try { abs = new URL(href, location.origin).href; } catch (e) { return; }

      const norm = CTX_NORMALIZE.normalize(abs, "save-person");
      if (!norm.id) return;

      const reply = CTX_NORMALIZE.replyOf(abs);
      let card = null;
      let isComment = false;
      if (reply) {
        /* закладка комментария: точное совпадение, иначе legacy-фолбэк */
        card = INDEX.byComment.get(norm.id + "#" + reply) ||
               INDEX.byCommentLegacy.get(norm.id) || null;
        if (card) isComment = true;
      } else {
        card = INDEX.byId.get(norm.id) || null;
      }
      if (!card) return;

      seen.add(a);
      wrap(a, card, isComment);
      marked++;
    });

    observer.observe(document.body, OBS_OPTS);
    console.log("[CTX " + CTX_BUILD + "] marked " + marked + " anchors");
  }

  /* ---------- старт ---------- */
  CTX_STORAGE.loadDb().then((db) => {
    const list = db.cards.map((c) => {
      const first = (c.identities && c.identities[0]) || {};
      return c.cardId + (first.id ? " (" + first.id + ")" : "");
    }).join(", ");
    console.log("[CTX " + CTX_BUILD + "] db: " + db.cards.length + " cards" + (list ? ": " + list : ""));
    buildIndex(db);
    scan();
  }).catch(() => {});

  observer.observe(document.body, OBS_OPTS);

  /* ---------- живая перерисовка: база изменилась (без F5) ---------- */
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local" || !changes[CTX_STORAGE.KEY]) return;
    clearTimeout(markTimer);
    markTimer = setTimeout(() => {
      const next = changes[CTX_STORAGE.KEY].newValue || { cards: [] };
      buildIndex(next);
      scan();
    }, 120);
  });

  /* ---------- приём CAPTURED (лог изъятия) ---------- */
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg && msg.type === CTX_MSG.CAPTURED) {
      const p = msg.payload || {};
      console.log("[CTX " + CTX_BUILD + "] captured | menu: " + p.menu +
        " | portal: " + p.portal + " | id: " + p.id + " | type: " + p.type +
        " | metPost: " + p.metPost + (p.kind ? " | kind: " + p.kind : "") +
        (p.replyId ? " | reply: " + p.replyId : "") +
        " | link: " + p.link + " | page: " + p.page + " | db: " + (p.db || ""));
    }
  });
})();
