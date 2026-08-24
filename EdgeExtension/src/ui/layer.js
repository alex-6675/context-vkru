/* Context VK.RU · v07g · ui/layer.js — СТЕКЛО И СКАЛЬПЕЛЬ.
 *
 * Диагноз v07d: React VK стирает узлы, вставленные в его DOM
 * (marked 11 / wrappers in DOM 0). Инъекция в чужой DOM ОСУЖДЕНА —
 * в DOM портала не добавляется НИЧЕГО.
 *
 * Отрисовка — на собственном стекле: div#ctx-glass (position:fixed,
 * поверх страницы, pointer-events:none, z-index:2147483000), дети —
 * абсолютно позиционированные подложки (.ctx-g-hl) и маркеры (.ctx-g-mark).
 * Стекло живёт вне поддерева React — структурно не стирается.
 *
 * СКАЛЬПЕЛЬ (вкл/выкл): по умолчанию ВЫКЛ — observer не подключен,
 * стекло пусто, в консоли тишина (расширение молчит). ВКЛ/ВЫКЛ — клик
 * по значку расширения (SW шлёт CTX_TOGGLE; content.js вызывает toggle()).
 * Состояние дублируется в storage (переживает F5), badge «on»/«» ставит SW.
 *
 * Триггеры перерисовки (только при ВКЛ): draw сразу, SPA-навигация,
 * MutationObserver (600 мс), resize, scroll (rAF), спокойный интервал 2 с,
 * storage.onChanged. Лог «glass: N markers».
 *
 * Экспорт: CTX_LAYER { init, rescan, toggle }.
 * Vanilla JS, ноль зависимостей (§2.2).
 */
(function () {
  "use strict";

  const SCALPEL_KEY = "ctxscalpel";

  let INDEX = { byId: new Map() };
  let glass = null;
  let scalpel = false;      /* по умолчанию ВЫКЛ */
  let quietTimer = 0;       /* спокойный интервал 2 с */
  let rafPending = false;   /* склейка resize/scroll через rAF */
  let lastHref = location.href; /* детектор SPA-навигации */
  let markTimer = 0;        /* дебаунс observer */

  const OBS_OPTS = { childList: true, subtree: true };
  const observer = new MutationObserver(() => {
    if (!scalpel) return;
    clearTimeout(markTimer);
    markTimer = setTimeout(draw, 600);
  });

  /* ---------- индекс по базе ---------- */
  function buildIndex(db) {
    const byId = new Map(); /* id -> карточка */
    (db.cards || []).forEach((card) => {
      (card.identities || []).forEach((it) => {
        if (!it || !it.id) return;
        byId.set(it.id, card);
      });
    });
    INDEX = { byId: byId };
  }

  /* ---------- цвет карточки → подложка ~25% ---------- */
  function fillOf(card) {
    const hex = card.color || "#2b6fb3";
    if (!/^#[0-9a-f]{6}$/i.test(hex)) return hex;
    return hex + "40"; /* альфа ~25% — текст ника читаем */
  }

  /* ---------- отрисовка стекла ---------- */
  function draw() {
    if (!glass) return;
    glass.replaceChildren();
    let n = 0;

    document.querySelectorAll("a[href]").forEach((a) => {
      if (!a.textContent.trim()) return; /* якоря без текста (аватары) не метим */
      const href = a.getAttribute("href");
      if (!href) return;

      let abs;
      try { abs = new URL(href, location.origin).href; } catch (e) { return; }

      const norm = CTX_NORMALIZE.normalize(abs, "save-person");
      if (!norm.id) return;
      const card = INDEX.byId.get(norm.id);
      if (!card) return;

      const r = a.getBoundingClientRect();
      if (r.width === 0) return; /* скрытые/схлопнутые — пропускаем */

      /* подложка поверх ника */
      const hl = document.createElement("div");
      hl.className = "ctx-g-hl" + (card.status === "dirt" ? " ctx-g-faded" : "");
      hl.style.left = r.left + "px";
      hl.style.top = r.top + "px";
      hl.style.width = r.width + "px";
      hl.style.height = r.height + "px";
      hl.style.background = fillOf(card);
      glass.appendChild(hl);

      /* маркер ▲ справа от ника; единственный кликабельный элемент стекла */
      const mark = document.createElement("div");
      mark.className = "ctx-g-mark";
      mark.textContent = "▲";
      mark.style.left = (r.right + 2) + "px";
      mark.style.top = r.top + "px";
      mark.title = "CTX: " + card.cardId +
        (card.displayName ? " · " + card.displayName : "");
      mark.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        chrome.runtime
          .sendMessage({ type: CTX_MSG.OPEN_CARD, payload: { cardId: card.cardId } })
          .catch(() => {});
      });
      glass.appendChild(mark);

      n++;
    });

    console.log("[CTX " + CTX_BUILD + "] glass: " + n + " markers");
  }

  /* ---------- перерисовка, склеенная через rAF (resize/scroll) ---------- */
  function scheduleDraw() {
    if (!scalpel || rafPending) return;
    rafPending = true;
    requestAnimationFrame(() => {
      rafPending = false;
      draw();
    });
  }

  /* ---------- скальпель: применение состояния ---------- */
  function applyScalpel(on) {
    if (on) {
      draw();                              /* сразу */
      observer.observe(document.body, OBS_OPTS);
      if (!quietTimer) {
        quietTimer = setInterval(() => {
          if (!scalpel) return;
          if (location.href !== lastHref) { /* SPA-навигация */
            lastHref = location.href;
            console.log("[CTX " + CTX_BUILD + "] SPA nav — redraw");
          }
          draw();                           /* спокойный интервал 2 с */
        }, 2000);
      }
    } else {
      observer.disconnect();
      clearInterval(quietTimer);
      quietTimer = 0;
      if (glass) glass.replaceChildren();   /* стекло пусто */
    }
  }

  /* ---------- ВКЛ/ВЫКЛ (по клику на значок; вызывает content.js) ---------- */
  function toggle() {
    scalpel = !scalpel;
    const patch = {};
    patch[SCALPEL_KEY] = scalpel;
    chrome.storage.local.set(patch);        /* переживает F5 */
    console.log("[CTX " + CTX_BUILD + "] scalpel: " + (scalpel ? "ON" : "OFF"));
    applyScalpel(scalpel);
  }

  /* ---------- инициализация ---------- */
  function init() {
    if (!glass) {
      glass = document.createElement("div");
      glass.id = "ctx-glass";
      document.body.appendChild(glass);
    }

    CTX_STORAGE.loadDb().then((db) => {
      buildIndex(db);
      /* состояние скальпеля — из storage (переживает F5) */
      return chrome.storage.local.get(SCALPEL_KEY).then((res) => {
        scalpel = !!(res && res[SCALPEL_KEY]);
        applyScalpel(scalpel);
      });
    }).catch(() => {});

    /* триггеры перерисовки — активны только при ВКЛ (проверка внутри) */
    window.addEventListener("resize", scheduleDraw);
    window.addEventListener("scroll", scheduleDraw, { passive: true });
    window.addEventListener("popstate", scheduleDraw);

    /* живой рендер: база изменилась (сохранение/удаление/цвет) — перекраска */
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== "local") return;
      if (changes[CTX_STORAGE.KEY]) {
        const next = changes[CTX_STORAGE.KEY].newValue || { cards: [] };
        buildIndex(next);
        if (scalpel) draw();
      }
    });
  }

  /* ---------- экспорт ---------- */
  globalThis.CTX_LAYER = Object.freeze({
    init: init,
    rescan: draw,
    toggle: toggle, /* переключение скальпеля (по CTX_TOGGLE из content.js) */
  });
})();
