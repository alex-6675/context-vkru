/* Context VK.RU · adapters/vkru.js · v_03f — обнаружение (fix после FAIL v_03).
 * Селекторы с подчёркиваниями в raw-написании (markdown-рендер их не трогает —
 * файл передаётся исходником). Vanilla JS. */
(function () {
  "use strict";

  const COMMENT_ROOT_SEL =
    '[data-testid="wallcomments_comment_root"],' +
    '[data-testid="wallcomments_comment_in_thread"]';

  const SEL_DATE = 'a[data-testid="wall_comment_date"]';
  const SEL_POST = '[data-testid="post"]';
  const SEL_POST_HEADER = '[data-testid="post-header"]';
  const SEL_POST_HEADER_TITLE = '[data-testid="post-header-title"]';
  const SEL_POSTDATE = '[data-testid="postdateblock_preview"]';
  const SEL_COMMENT_OWNER = '[data-testid="comment-owner"]';
  const SEL_COMMENT_TEXT = '[data-testid="comment-text"]';

  const RE_PERSON = /^\/id(\d+)$/;
  const RE_CLUB = /^\/club(\d+)$/;
  const RE_WALL = /^\/wall(-?\d+)_(\d+)$/;

  function normalizeHref(raw) {
    if (!raw) return "";
    let u;
    try { u = new URL(raw, "https://vk.ru"); } catch (e) { return raw; }
    if (u.hostname !== "vk.ru" && !u.hostname.endsWith(".vk.ru")) return raw;
    const keep = [];
    u.searchParams.forEach((v, k) => {
      if (k === "reply" || k === "thread") keep.push(k + "=" + v);
    });
    return u.pathname + (keep.length ? "?" + keep.join("&") : "");
  }

  function classify(pathname) {
    let m;
    if ((m = pathname.match(RE_PERSON))) return { type: "PERSON", id: "id" + m[1] };
    if ((m = pathname.match(RE_CLUB))) return { type: "COMMUNITY", id: "club" + m[1] };
    if ((m = pathname.match(RE_WALL)))
      return { type: m[1][0] === "-" ? "COMMUNITY_POST" : "PERSON_POST",
               id: "wall" + m[1] + "_" + m[2] };
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
    const root = dateAnchor.closest(COMMENT_ROOT_SEL);
    if (!root) return null;
    const ownerA = anchorOf(root.querySelector(SEL_COMMENT_OWNER));
    const textEl = root.querySelector(SEL_COMMENT_TEXT);
    const authorHref = ownerA ? normalizeHref(ownerA.getAttribute("href")) : "";
    const cls = authorHref
      ? classify(new URL(authorHref, "https://vk.ru").pathname)
      : { type: "UNKNOWN", id: "" };
    let postId = "", replyId = "", threadId = "";
    try {
      const u = new URL(normalizeHref(dateAnchor.getAttribute("href")), "https://vk.ru");
      const wm = u.pathname.match(RE_WALL);
      if (wm) postId = "wall" + wm[1] + "_" + wm[2];
      replyId = u.searchParams.get("reply") || "";
      threadId = u.searchParams.get("thread") || "";
    } catch (e) { /* noop */ }
    return {
      entity: {
        kind: "COMMENT",
        type: cls.type,
        identity: { id: cls.id, url: authorHref },
        authorName: trim(ownerA ? ownerA.textContent : "", 60),
        text: trim(textEl ? textEl.textContent : "", 80),
        navigationTarget: dateAnchor.getAttribute("href") || "",
        context: { source: root.getAttribute("data-testid"),
                   postUrl: postId, replyId: replyId, threadId: threadId },
      },
      sourceElement: root,
    };
  }

  function extractPost(postRoot) {
    const header = postRoot.querySelector(SEL_POST_HEADER);
    const ownerA =
      anchorOf(header ? header.querySelector(SEL_POST_HEADER_TITLE) : null) ||
      (header ? header.querySelector('a[href^="/id"], a[href^="/club"]') : null);
    if (!ownerA) return null;
    const authorHref = normalizeHref(ownerA.getAttribute("href"));
    const cls = classify(new URL(authorHref, "https://vk.ru").pathname);
    const dateA = anchorOf(postRoot.querySelector(SEL_POSTDATE));
    let postUrl = "";
    if (dateA) {
      const wm = normalizeHref(dateA.getAttribute("href")).match(RE_WALL);
      if (wm) postUrl = "wall" + wm[1] + "_" + wm[2];
    }
    return {
      entity: {
        kind: "POST",
        type: cls.type,
        identity: { id: cls.id, url: authorHref },
        authorName: trim(ownerA.textContent, 60),
        text: "",
        navigationTarget: ownerA.getAttribute("href") || "",
        context: { source: "post", postUrl: postUrl, replyId: "", threadId: "" },
      },
      sourceElement: postRoot,
    };
  }

  function scan(doc) {
    const out = [];
    Array.from(doc.querySelectorAll(SEL_DATE))
      .forEach((d) => { const e = extractComment(d); if (e) out.push(e); });
    Array.from(doc.querySelectorAll(SEL_POST))
      .forEach((p) => { const e = extractPost(p); if (e) out.push(e); });
    return out;
  }

  /* Самодиагностика покрытия селекторов (M-03-fix):
   * posts — кол-во [data-testid="post"];
   * dates — кол-во a[data-testid="wall_comment_date"] (M>0 = comment-ветка жива);
   * roots — кол-во элементов COMMENT_ROOT_SEL. */
  function coverage(doc) {
    return {
      posts: doc.querySelectorAll(SEL_POST).length,
      dates: doc.querySelectorAll(SEL_DATE).length,
      roots: doc.querySelectorAll(COMMENT_ROOT_SEL).length,
    };
  }

  globalThis.CTX_VKRU = Object.freeze({
    scan: scan,
    coverage: coverage,
    normalizeHref: normalizeHref,
    classify: classify,
  });
})();