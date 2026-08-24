/* Context VK.RU · v07g · content.js — ТОНКАЯ ТОЧКА ВХОДА (TASK-0011).
 *
 * Стекло и скальпель живут в ui/layer.js (CTX_LAYER). В DOM портала не
 * добавляется ничего — отрисовка на собственном стекле (Решение: диагноз v07d).
 *
 * Контент отвечает только за:
 *  - старт + лог базы;
 *  - ИЗЪЯТИЕ (работает ВСЕГДА, независимо от скальпеля — это рука хирурга,
 *    а не скальпель): CAPTURED → NAME_HINT (guard: только пустое displayName —
 *    на стороне SW) и MET_HINT (точка встречи = первый комментарий);
 *  - ПКМ по дате комментария → SAVE_AUTHOR (автор, не «мусорная» карточка);
 *  - приём CTX_TOGGLE (клик по значку) → CTX_LAYER.toggle().
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
  /* Дата комментария — ссылка wall…?reply=… (точка встречи). */
  const COMMENT_DATE_SEL = 'a[data-testid="wall' + U + 'comment' + U + 'date"]';

  /* ---------- старт: лог базы + инициализация слоя ---------- */
  CTX_STORAGE.loadDb().then((db) => {
    const list = db.cards.map((c) => {
      const first = (c.identities && c.identities[0]) || {};
      return c.cardId + (first.id ? " (" + first.id + ")" : "");
    }).join(", ");
    console.log("[CTX " + CTX_BUILD + "] db: " + db.cards.length + " cards" + (list ? ": " + list : ""));
  }).catch(() => {});

  CTX_LAYER.init(); /* стекло + скальпель (по умолчанию ВЫКЛ — расширение молчит) */

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

    const ownerA = root.querySelector('a[data-testid="comment-owner"]');
    if (!ownerA || !ownerA.getAttribute("href")) {
      console.log("[CTX " + CTX_BUILD + "] автор не найден — не сохранено");
      return; /* карточка комментария НЕ создаётся */
    }

    chrome.runtime.sendMessage({
      type: CTX_MSG.SAVE_AUTHOR,
      payload: { authorHref: ownerA.getAttribute("href"), metUrl: abs, page: location.href },
    }).catch(() => {});
  });

  /* ---------- приём сообщений ---------- */
  chrome.runtime.onMessage.addListener((msg) => {
    if (!msg || !msg.type) return;

    /* СКАЛЬПЕЛЬ: клик по значку расширения (SW → контент) */
    if (msg.type === CTX_MSG.CTX_TOGGLE) {
      CTX_LAYER.toggle();
      return;
    }

    if (msg.type !== CTX_MSG.CAPTURED) return;
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

          /* ТОЧКА ВСТРЕЧИ = ПЕРВОЕ ОБЩЕНИЕ.
           * Если якорь внутри комментария — берём его дату (wall…?reply=…)
           * как commentUrl. Вне комментария SW оставляет metPost. */
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
