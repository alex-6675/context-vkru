/* Context VK.RU · v07f2 · content.js — ПОЛНАЯ ЗАМЕНА (TASK-0011, v07f2).
 * Расширение молчит, пока пользователь не скажет «вот этот».
 *
 * v07f2 (по заданию):
 *  - ИДЕМПОТЕНТНЫЙ РЕНДЕР: в начале scan() снимаем ВСЕ свои обёртки по классу
 *    span.ctx-hl (не по массиву). Наши DOM-правки под флагом selfChange:
 *    MutationObserver при selfChange=true НЕ планирует scan (не размножается).
 *  - КОНТЕЙНЕРЫ (одна метка на карточку на контейнер) + предохранитель
 *    «не более 3 меток на карточку на страницу»:
 *    li → [data-testid=post] → корень комментария → [role=dialog] → section → body.
 *  - Метим ТОЛЬКО ▲ по карточкам person/community (byId); ◆ НЕ существует.
 *    Якоря без текста (аватары) не метим; якоря внутри span.ctx-hl пропускаем.
 *  - СОХРАНЕНО (v07f): SAVE_AUTHOR (автор из комментария по ПКМ на дате),
 *    NAME_HINT (имя из первого якоря), живой рендер storage.onChanged (120 мс).
 *
 * Свои классы ctx-*; атрибуты узлов VK не трогаются.
 * Vanilla JS, ноль зависимостей (§2.2).
 */
(() => {
  "use strict";
  if (location.host !== "vk.ru") return;

  console.log("[CTX " + CTX_BUILD + "] content started — path: " + location.pathname);

  const U = String.fromCharCode(95);
  /* Корни комментариев (testid с подчёркиваниями собраны через U, по А1/§25). */
  const COMMENT_ROOT_SEL =
    '[data-testid="wall' + U + 'comments' + U + 'comment' + U + 'root"],' +
    '[data-testid="wall' + U + 'comments' + U + 'comment' + U + 'in' + U + 'thread"]';

  let INDEX = { byId: new Map() };
  let selfChange = false;   /* наши DOM-правки: observer не должен планировать scan */
  let markTimer = 0;
  const OBS_OPTS = { childList: true, subtree: true };
  const observer = new MutationObserver(() => {
    if (selfChange) return; /* это наша правка — не пересканируем самих себя */
    clearTimeout(markTimer);
    markTimer = setTimeout(scan, 600);
  });

  /* ---------- индекс по базе (только byId — метим лишь ▲) ---------- */
  function buildIndex(db) {
    const byId = new Map(); /* id -> карточка */
    (db.cards || []).forEach((card) => {
      (card.identities || []).forEach((it) => {
        if (it && it.id) byId.set(it.id, card);
      });
    });
    INDEX = { byId: byId };
  }

  /* ---------- цвет карточки → заливка ~80% ---------- */
  function fillOf(card) {
    const hex = card.color || "#2b6fb3";
    const m = /^#([0-9a-f]{6})$/i.exec(hex);
    if (!m) return hex;
    const n = parseInt(m[1], 16);
    return "rgba(" + ((n >> 16) & 255) + "," + ((n >> 8) & 255) + "," + (n & 255) + ",0.8)";
  }

  /* ---------- обернуть якорь: заливка + маркер ▲ ---------- */
  function wrap(anchor, card) {
    const hl = document.createElement("span");
    hl.className = "ctx-hl" + (card.status === "dirt" ? " ctx-faded" : "");
    hl.style.background = fillOf(card);
    anchor.parentNode.insertBefore(hl, anchor);
    hl.appendChild(anchor);

    const mark = document.createElement("span");
    mark.className = "ctx-mark";
    mark.textContent = "▲";
    mark.title = "CTX: " + card.cardId + (card.displayName ? " · " + card.displayName : "");
    mark.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      chrome.runtime
        .sendMessage({ type: CTX_MSG.OPEN_CARD, payload: { cardId: card.cardId } })
        .catch(() => {});
    });
    hl.appendChild(mark);
  }

  /* ---------- контейнер для правила «одна метка на карточку» ---------- */
  function containerOf(a) {
    return (
      a.closest("li") ||
      a.closest('[data-testid="post"]') ||
      a.closest(COMMENT_ROOT_SEL) ||
      a.closest('[role="dialog"]') ||
      a.closest("section") ||
      document.body
    );
  }

  /* ---------- скан якорей (идемпотентный) ---------- */
  function scan() {
    selfChange = true;
    try {
      /* 1) снять ВСЕ свои обёртки по классу (не по массиву) */
      document.querySelectorAll("span.ctx-hl").forEach((w) => {
        const a = w.querySelector("a");
        if (a && w.parentNode) w.parentNode.insertBefore(a, w);
        if (w.parentNode) w.remove();
      });

      /* 2) метим заново */
      const perCard = new Map(); /* cardId -> Set(контейнеров) — одна метка на контейнер */
      const cardCount = {};      /* cardId -> число меток на странице (предохранитель ≤ 3) */
      let marked = 0;

      document.querySelectorAll("a[href]").forEach((a) => {
        if (a.closest("span.ctx-hl")) return;   /* уже обёрнут */
        if (!a.textContent.trim()) return;      /* якоря без текста (аватары) не метим */
        const href = a.getAttribute("href");
        if (!href) return;

        let abs;
        try { abs = new URL(href, location.origin).href; } catch (e) { return; }

        const norm = CTX_NORMALIZE.normalize(abs, "save-person");
        if (!norm.id) return;

        const card = INDEX.byId.get(norm.id);
        if (!card) return;

        /* предохранитель: не более 3 меток на карточку на страницу */
        if ((cardCount[card.cardId] || 0) >= 3) return;

        /* одна метка на карточку на контейнер */
        const container = containerOf(a);
        let containers = perCard.get(card.cardId);
        if (!containers) { containers = new Set(); perCard.set(card.cardId, containers); }
        if (containers.has(container)) return;
        containers.add(container);

        cardCount[card.cardId] = (cardCount[card.cardId] || 0) + 1;
        wrap(a, card);
        marked++;
      });

      console.log("[CTX " + CTX_BUILD + "] marked " + marked + " anchors");
    } finally {
      /* observer-microtask отработает раньше этого macrotask'а → флаг снимется после */
      setTimeout(() => { selfChange = false; }, 0);
    }
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

  /* ---------- ПКМ по дате комментария → изъятие автора (SAVE_AUTHOR) ---------- */
  document.addEventListener("contextmenu", (e) => {
    const a = e.target && e.target.closest ? e.target.closest("a[href]") : null;
    if (!a) return;
    const href = a.getAttribute("href") || "";
    let abs;
    try { abs = new URL(href, location.origin).href; } catch (err) { return; }
    if (!CTX_NORMALIZE.replyOf(abs)) return; /* это не дата комментария */

    const root = a.closest(COMMENT_ROOT_SEL);
    if (!root) return;
    const owner = root.querySelector('a[data-testid="comment-owner"]');
    const authorHref = owner ? owner.href : "";
    chrome.runtime.sendMessage({
      type: CTX_MSG.SAVE_AUTHOR,
      payload: { authorHref: authorHref, metUrl: abs, page: location.href },
    }).catch(() => {});
  }, true);

  /* ---------- живой рендер: база изменилась (без F5) ---------- */
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local" || !changes[CTX_STORAGE.KEY]) return;
    clearTimeout(markTimer);
    markTimer = setTimeout(() => {
      const next = changes[CTX_STORAGE.KEY].newValue || { cards: [] };
      buildIndex(next);
      scan();
    }, 120);
  });

  /* ---------- приём CAPTURED (лог изъятия + NAME_HINT) ---------- */
  chrome.runtime.onMessage.addListener((msg) => {
    if (!msg || msg.type !== CTX_MSG.CAPTURED) return;
    const p = msg.payload || {};
    console.log("[CTX " + CTX_BUILD + "] captured | menu: " + p.menu +
      " | portal: " + p.portal + " | id: " + p.id + " | type: " + p.type +
      " | metPost: " + p.metPost +
      " | link: " + p.link + " | page: " + p.page + " | db: " + (p.db || ""));

    /* NAME_HINT: первый якорь с тем же id и непустым текстом */
    if (p.id) {
      const anchors = document.querySelectorAll("a[href]");
      for (const a of anchors) {
        if (!a.textContent.trim()) continue;
        const href = a.getAttribute("href");
        if (!href) continue;
        let abs;
        try { abs = new URL(href, location.origin).href; } catch (e) { continue; }
        const norm = CTX_NORMALIZE.normalize(abs, "save-person");
        if (norm.id === p.id) {
          chrome.runtime.sendMessage({
            type: CTX_MSG.NAME_HINT,
            payload: { id: p.id, name: a.textContent.trim() },
          }).catch(() => {});
          break;
        }
      }
    }
  });
})();
