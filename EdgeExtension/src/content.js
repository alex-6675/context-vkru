/* Context VK.RU · v07d · content.js — ПОЛНАЯ ЗАМЕНА (TASK-0011, v07f2).
 * Расширение молчит, пока пользователь не скажет «вот этот».
 *
 * v07f2 (по заданию):
 *  - ИДЕМПОТЕНТНЫЙ РЕНДЕР: в начале scan() снимаем ВСЕ свои обёртки по классу
 *    span.ctx-hl (не по массиву). Наши DOM-правки под флагом selfChange:
 *    MutationObserver при selfChange=true НЕ планирует scan (не размножается).
 *  - Метим ТОЛЬКО ▲ по карточкам person/community (byId); ◆ НЕ существует.
 *    Якоря без текста (аватары) не метим; якоря внутри span.ctx-hl пропускаем.
 * v07f6: предохранители «одна метка на контейнер» и «≤3 на страницу» УБРАНЫ
 *    (в мессенджере/тредах они съедали метки). Теперь — один ▲ на каждое
 *    вхождение сохранённой карточки.
 *  - СОХРАНЕНО (v07f): SAVE_AUTHOR (автор из комментария по ПКМ на дате),
 *    NAME_HINT (имя из первого якоря), живой рендер storage.onChanged.
 * v07f3: заливка ~25%; точка встречи (MET_HINT) из wall_comment_date.
 * v07f5 (D21): ЖИВАЯ ПЕРЕКРАСКА — storage.onChanged → buildIndex(newValue) →
 *    scan() сразу; wrap() читает карточку ИЗ ИНДЕКСА в момент рендера
 *    (цвет/статус из свежей базы, не из замыкания).
 * v07d: ДИАГНОСТИКА (логи, поведение не меняется): после разметки через 500 мс
 *    «marked in scan: M; wrappers in DOM: N» и «anchors for <LAST_ID>: K; wrapped: W»;
 *    при планировании observer'ом — «observer: scan scheduled».
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
  /* v07f3: дата комментария — ссылка wall…?reply=… (точка встречи). */
  const COMMENT_DATE_SEL = 'a[data-testid="wall' + U + 'comment' + U + 'date"]';

  let INDEX = { byId: new Map() };
  let selfChange = false;   /* наши DOM-правки: observer не должен планировать scan */
  let markTimer = 0;
  let LAST_ID = "";         /* v07d: id из последнего CAPTURED — для самопроверки */
  const OBS_OPTS = { childList: true, subtree: true };
  const observer = new MutationObserver(() => {
    if (selfChange) return; /* это наша правка — не пересканируем самих себя */
    clearTimeout(markTimer);
    markTimer = setTimeout(scan, 600);
    console.log("[CTX " + CTX_BUILD + "] observer: scan scheduled"); /* v07d */
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

  /* ---------- цвет карточки → заливка ~25% ---------- */
  /* v07f3: альфа ~25% (hex + "40"), текст ника читаем. */
  function fillOf(card) {
    const hex = card.color || "#2b6fb3";
    if (!/^#[0-9a-f]{6}$/i.test(hex)) return hex;
    return hex + "40";
  }

  /* ---------- обернуть якорь: заливка + маркер ▲ ---------- */
  /* v07f5 (D21): карточка читается ИЗ ИНДЕКСА в момент рендера —
   * цвет/статус всегда из свежей базы, не из замыкания. */
  function wrap(anchor, cardId) {
    const card = INDEX.byId.get(cardId);
    if (!card) return;

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
        .sendMessage({ type: CTX_MSG.OPEN_CARD, payload: { cardId: cardId } })
        .catch(() => {});
    });
    hl.appendChild(mark);
  }

  /* ---------- скан якорей (идемпотентный) ---------- */
  /* v07f6: БЕЗ предохранителей. В плотных видах (мессенджер, треды) лимит
   * «≤3 на страницу» и «одна на контейнер» съедал метки — пользователь видел
   * «маркировка исчезла». Теперь метим КАЖДЫЙ текстовый якорь сохранённой
   * карточки (один ▲ на вхождение). */
  function scan() {
    selfChange = true;
    try {
      /* 1) снять ВСЕ свои обёртки по классу (не по массиву) */
      document.querySelectorAll("span.ctx-hl").forEach((w) => {
        const a = w.querySelector("a");
        if (a && w.parentNode) w.parentNode.insertBefore(a, w);
        if (w.parentNode) w.remove();
      });

      /* 2) метим заново: каждый текстовый якорь сохранённой карточки */
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

        wrap(a, card.cardId);
        marked++;
      });

      console.log("[CTX " + CTX_BUILD + "] marked " + marked + " anchors");

      /* v07d: самопроверка маркировки (логи, поведение не меняется).
       * Через 500 мс сверяем: сколько меток реально в DOM против marked,
       * и для последнего изъятого id — сколько якорей и сколько обёрнуто. */
      setTimeout(() => {
        const wrappersInDom = document.querySelectorAll(".ctx-hl").length;
        console.log("[CTX " + CTX_BUILD + "] marked in scan: " + marked +
          "; wrappers in DOM: " + wrappersInDom);
        if (LAST_ID) {
          let totalAnchors = 0;
          let wrappedAnchors = 0;
          document.querySelectorAll("a[href]").forEach((a) => {
            if (!a.textContent.trim()) return;
            const href = a.getAttribute("href");
            if (!href) return;
            let abs;
            try { abs = new URL(href, location.origin).href; } catch (e) { return; }
            const norm = CTX_NORMALIZE.normalize(abs, "save-person");
            if (!norm.id || norm.id !== LAST_ID) return;
            totalAnchors++;
            if (a.closest(".ctx-hl")) wrappedAnchors++;
          });
          console.log("[CTX " + CTX_BUILD + "] anchors for " + LAST_ID +
            ": " + totalAnchors + "; wrapped: " + wrappedAnchors);
        }
      }, 500);
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
  /* v07f5 (D21): сразу перестроить индекс из newValue и пересканировать —
   * перекраска живая, без задержки; fillOf читает цвет из нового индекса. */
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local" || !changes[CTX_STORAGE.KEY]) return;
    clearTimeout(markTimer);
    const next = changes[CTX_STORAGE.KEY].newValue || { cards: [] };
    buildIndex(next);
    scan();
  });

  /* ---------- приём CAPTURED (лог изъятия + NAME_HINT) ---------- */
  chrome.runtime.onMessage.addListener((msg) => {
    if (!msg || msg.type !== CTX_MSG.CAPTURED) return;
    const p = msg.payload || {};
    LAST_ID = p.id || ""; /* v07d: для самопроверки маркировки */
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

          /* v07f3: ТОЧКА ВСТРЕЧИ = ПЕРВОЕ ОБЩЕНИЕ.
           * Если якорь внутри комментария — берём его дату (wall…?reply=…)
           * как commentUrl. Вне комментария SW оставляет metPost (как сейчас). */
          const commentRoot = a.closest(COMMENT_ROOT_SEL) || a.closest("li");
          if (commentRoot) {
            const dateA = commentRoot.querySelector(COMMENT_DATE_SEL);
            if (dateA && dateA.href) {
              chrome.runtime.sendMessage({
                type: CTX_MSG.MET_HINT,
                payload: { id: p.id, commentUrl: dateA.href },
              }).catch(() => {});
            }
          }
          break;
        }
      }
    }
  });
})();
