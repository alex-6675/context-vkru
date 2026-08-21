/* Context VK.RU · core/normalize.js · v06r. Regex с "_" через U (А1). */
(function () {
  "use strict";
  var U = String.fromCharCode(95);
  var RE_ID = /^\/id(\d+)$/;
  var RE_CLUB = /^\/club(\d+)$/;
  var RE_WALL = new RegExp("^/wall(-?\\d+)" + U + "(\\d+)$");
  function portalOf(url) {
    var h; try { h = new URL(url).hostname; } catch (e) { return "generic"; }
    if (h === "vk.ru" || h.endsWith(".vk.ru")) return "vk";
    if (h === "ok.ru" || h.endsWith(".ok.ru")) return "ok";
    if (h === "dzen.ru" || h.endsWith(".dzen.ru")) return "dzen";
    return "generic";
  }
  function normalize(link, menu) {
    var portal = portalOf(link);
    var path = ""; try { path = new URL(link).pathname; } catch (e) { path = link || ""; }
    var id = path, m;
    if (portal === "vk") {
      if ((m = path.match(RE_ID))) id = "id" + m[1];
      else if ((m = path.match(RE_CLUB))) id = "club" + m[1];
      else if ((m = path.match(RE_WALL))) id = "wall" + m[1] + U + m[2];
      else if (path.charAt(0) === "/") id = path.slice(1);
    }
    return { portal: portal, id: id,
             type: menu === "save-community" ? "COMMUNITY" : "PERSON", url: link };
  }
  function metPostOf(page) {
    try {
      var u = new URL(page);
      var m = u.pathname.match(RE_WALL);
      if (!m) m = (u.searchParams.get("w") || "").match(RE_WALL);
      if (m) return "wall" + m[1] + U + m[2];
      return u.pathname;
    } catch (e) { return page || ""; }
  }
  function replyOf(url) {
    try { return new URL(url).searchParams.get("reply") || ""; } catch (e) { return ""; }
  }
  globalThis.CTX_NORMALIZE = Object.freeze(
    { portalOf: portalOf, normalize: normalize, metPostOf: metPostOf, replyOf: replyOf });
})();