Вердикт по 3C: строка таблицы №1 — прод повреждён, архитектура здорова

| Показатель (3C, /feed) | Ground truth | Coverage расширения | Вывод |
|---|---|---|---|
| dates | 168 | 168 | dates-селектор в проде жив |
| roots + inthread | 97 + 71 = 168 | 0 | roots-селекторы в проде съедены порчей |
| owner / text / postdate | 168 / 162 / 4 | — | весь comment-компонент на /feed присутствует |

Ключевые выводы:
Корни комментариев существуют и на ленте — fallback-стратегия для /feed не нужна. Архитектурное решение 3A (closest по testid) подтверждено полностью.
Единственная причина отсутствия COMMENT — дефект передачи кода (подчёркивания). Лечится конструкцией селекторов через String.fromCharCode(95) — в коде физически нет подчёркиваний, портиться нечему.
Посты переводим на data-post-id (CONFIRMED на 100% постов) — ID поста больше не зависит от селектора с подчёркиваниями.

```
МОДУЛЬ: M-03-fix2 (внутри Этапа 2, после FAIL v_03f)
СБОРКА: v03f2 (manifest 0.0.5)

ЦЕЛЬ:
Порче-невозможная реализация обнаружения: все testid/regex,
содержащие "_", собираются через U=String.fromCharCode(95).
В файлах НЕТ литеральных подчёркиваний (кроме значений в runtime).

ИЗМЕНЯЕМЫЕ ФАЙЛЫ:
EdgeExtension/src/adapters/vkru.js   (полная замена)
EdgeExtension/src/content.js         (полная замена)
EdgeExtension/src/core/messaging.js  (полная замена)
EdgeExtension/manifest.json          (ТОЛЬКО строка version → 0.0.5)
background.js НЕ меняется.

ЧТО СДЕЛАНО:
TDATE/TROOT собраны через U; RE_WALL через new RegExp с U.
POST: postUrl из атрибута data-post-id (CONFIRMED), без postdate-селектора.
COMMENT: date → closest(T_ROOT) → owner/text/reply/thread (как в 3A).
coverage-гейт: строка posts/dates/roots — пользователь САМ видит
   целостность селекторов после перезагрузки (roots>0 = код дошёл живым).

КОД:

=== src/core/messaging.js ===
const CTX_BUILD = "v03f2";
const CTX_MSG = Object.freeze({
  PING: "ctx:ping",
  PONG: "ctx:pong",
  ENTITY_FOUND: "ctx:entity-found",
});
globalThis.CTXBUILD = CTXBUILD;
globalThis.CTXMSG = CTXMSG;

=== src/adapters/vkru.js ===
/* Context VK.RU · adapters/vkru.js · v03f2. Vanilla JS, ноль зависимостей.
   Все testid и regex с символом подчёркивания собраны через U —
   в исходнике литеральных подчёркиваний нет. */
(function () {
  "use strict";
  var U = String.fromCharCode(95);
  var T_DATE = 'a[data-testid="wall' + U + 'comment' + U + 'date"]';
  var T_ROOT = '[data-testid="wall' + U + 'comments' + U + 'comment' + U + 'root"],' +
               '[data-testid="wall' + U + 'comments' + U + 'comment' + U + 'in' + U + 'thread"]';
  var T_OWNER = '[data-testid="comment-owner"]';
  var T_TEXT = '[data-testid="comment-text"]';
  var T_POST = '[data-testid="post"]';
  var TPOSTHEADER = '[data-testid="post-header"]';
  var TPOSTTITLE = '[data-testid="post-header-title"]';
  var RE_PERSON = /^\/id(\d+)$/;
  var RE_CLUB = /^\/club(\d+)$/;
  var RE_WALL = new RegExp("^/wall(-?\\d+)" + U + "(\\d+)$");

  function normalizeHref(raw) {
    if (!raw) return "";
    var u;
    try { u = new URL(raw, "https://vk.ru"); } catch (e) { return raw; }
    if (u.hostname !== "vk.ru" && !u.hostname.endsWith(".vk.ru")) return raw;
    var keep = [];
    u.searchParams.forEach(function (v, k) {
      if (k === "reply" || k === "thread") keep.push(k + "=" + v);
    });
    return u.pathname + (keep.length ? "?" + keep.join("&") : "");
  }
  function classify(pathname) {
    var m;
    if ((m = pathname.match(RE_PERSON))) return { type: "PERSON", id: "id" + m[1] };
    if ((m = pathname.match(RE_CLUB))) return { type: "COMMUNITY", id: "club" + m[1] };
    if ((m = pathname.match(RE_WALL)))
      return { type: m[1][0] === "-" ? "COMMUNITYPOST" : "PERSONPOST",
               id: "wall" + m[1] + U + m[2] };
    return { type: "OTHER", id: pathname };
  }
  function anchorOf(el) {
    if (!el) return null;
    if (el.tagName === "A" && el.getAttribute("href")) return el;
    return el.querySelector('a[href^="/"], a[href*="vk.ru/"]');
  }
  function trim(s, n) {
    s = (s || "").replace(/\s+/g, " ").trim();
    return s.length > n ? s.slice(0, n) + "…" : s;
  }
  function extractComment(dateAnchor) {
    var root = dateAnchor.closest(T_ROOT);
    if (!root) return null;
    var ownerA = anchorOf(root.querySelector(T_OWNER));
    var textEl = root.querySelector(T_TEXT);
    var authorHref = ownerA ? normalizeHref(ownerA.getAttribute("href")) : "";
    var cls = authorHref
      ? classify(new URL(authorHref, "https://vk.ru").pathname)
      : { type: "UNKNOWN", id: "" };
    var postId = "", replyId = "", threadId = "";
    try {
      var u = new URL(normalizeHref(dateAnchor.getAttribute("href")), "https://vk.ru");
      var wm = u.pathname.match(RE_WALL);
      if (wm) postId = "wall" + wm[1] + U + wm[2];
      replyId = u.searchParams.get("reply") || "";
      threadId = u.searchParams.get("thread") || "";
    } catch (e) {}
    return {
      entity: {
        kind: "COMMENT", type: cls.type,
        identity: { id: cls.id, url: authorHref },
        authorName: trim(ownerA ? ownerA.textContent : "", 60),
        text: trim(textEl ? textEl.textContent : "", 80),
        navigationTarget: dateAnchor.getAttribute("href") || "",
        context: { source: root.getAttribute("data-testid"),
                   postUrl: postId, replyId: replyId, threadId: threadId }
      },
      sourceElement: root
    };
  }
  function extractPost(postRoot) {
    var header = postRoot.querySelector(TPOSTHEADER);
    var ownerA =
      anchorOf(header ? header.querySelector(TPOSTTITLE) : null) ||
      (header ? header.querySelector('a[href^="/id"], a[href^="/club"]') : null);
    if (!ownerA) return null;
    var authorHref = normalizeHref(ownerA.getAttribute("href"));
    var cls = classify(new URL(authorHref, "https://vk.ru").pathname);
    var pid = postRoot.getAttribute("data-post-id") || "";
    return {
      entity: {
        kind: "POST", type: cls.type,
        identity: { id: cls.id, url: authorHref },
        authorName: trim(ownerA.textContent, 60),
        text: "",
        navigationTarget: ownerA.getAttribute("href") || "",
        context: { source: "post", postUrl: pid ? "wall" + pid : "",
                   replyId: "", threadId: "" }
      },
      sourceElement: postRoot
    };
  }
  function scan(doc) {
    var out = [];
    doc.querySelectorAll(T_DATE).forEach(function (d) {
      var e = extractComment(d); if (e) out.push(e);
    });
    doc.querySelectorAll(T_POST).forEach(function (p) {
      var e = extractPost(p); if (e) out.push(e);
    });
    return out;
  }
  globalThis.CTX_VKRU = Object.freeze(
    { scan: scan, normalizeHref: normalizeHref, classify: classify });
})();

=== src/content.js ===
/ Context VK.RU · v03f2 · content.js /
(() => {
  "use strict";
  if (location.host !== "vk.ru") return;
  var U = String.fromCharCode(95);
  console.log([CTX ${CTX_BUILD}] content started — path: ${location.pathname});

  const t0 = performance.now();
  chrome.runtime.sendMessage({ type: CTX_MSG.PING,
    payload: { path: location.pathname } })
    .then((r) => { if (r && r.type === CTX_MSG.PONG)
      console.log([CTX ${CTX_BUILD}] PONG (rtt ~${Math.round(performance.now() - t0)} ms)); })
    .catch(() => {});

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
      console.log([CTX ${CTX_BUILD}] coverage posts/dates/roots = ${s}); }
  }
  function keyOf(e) {
    if (e.kind === "COMMENT")
      return "C:" + e.context.postUrl + "#" + (e.context.replyId || e.navigationTarget);
    return "P:" + (e.context.postUrl || e.identity.url);
  }
  function report(fresh) {
    if (!fresh.length) return;
    console.log([CTX ${CTX_BUILD}] ENTITY FOUND: ${fresh.length} new);
    fresh.forEach((it) => {
      const e = it.entity;
      console.log([CTX ${CTX_BUILD}] ${e.kind} ${e.type} | author="${e.authorName}" +
         | id=${e.identity.id} | post=${e.context.postUrl || "-"} +
         | reply=${e.context.replyId || "-"} +
         | nav=${e.navigationTarget} | sourceElement:, it.sourceElement);
    });
    chrome.runtime.sendMessage({ type: CTXMSG.ENTITYFOUND,
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
```
КАК СОБРАТЬ / ЗАГРУЗИТЬ:
Сохранить UTF-8 → edge://extensions → Reload → версия 0.0.5 → F5 на vk.ru.

ТЕСТ (минимальный, под ваши ограничения — одна страница /feed):
Консоль страницы, фильтр CTX:
   ГЕЙТ: coverage posts/dates/roots = 4/…/… с roots БОЛЬШЕ 0
   (ожидание ≈ 4/168/168). roots=0 → код снова дошёл повреждённым,
   СТОП и сообщить (не тестировать дальше).
Строки COMMENT с post=wall-… и reply=… (много — это норма).
Строки POST теперь с post=wall-… (не «-»).
SW-консоль: entities reported включает COMMENT.
/collabis — опционально, те же критерии.

ОЖИДАЕМЫЙ РЕЗУЛЬТАТ (PASS):
Гейт roots>0 выполнен; COMMENT и POST обнаружены; postUrl извлечён;
SW получил COMMENT; карточка без ошибок.
→ reports/v03/RESULTv03.md (fix2) и dashboard. Затем закрываю v03
и выдаю M-04 (Этап 3 — Navigation Target).

СТОП.

Процессуальная фиксация (§25 регламента, новое правило): любой будущий код проекта, содержащий testid/URL-схемы с подчёркиваниями, пишется только через String.fromCharCode(95); coverage-строка является приёмочным гейтом целостности передачи. Coder коммитит файлы в ветку при первой возможности.

СТОП.
