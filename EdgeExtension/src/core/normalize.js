/* Context VK.RU · core/normalize.js · v04r
 * Нормализатор и опознание портала (TASK-0006, по M03r.md).
 * Работает только со ссылками, которые отдал браузер (Решение №2):
 * linkUrl — удостоверение, pageUrl — адрес встречи (metPost).
 * Regex с подчёркиванием собраны через U = String.fromCharCode(95) (А1, §25).
 * Vanilla JS, ноль зависимостей (§2.2).
 */
(function () {
  "use strict";
  var U = String.fromCharCode(95);
  var RE_ID = /^\/id(\d+)$/;
  var RE_CLUB = /^\/club(\d+)$/;
  var RE_WALL = new RegExp("^/wall(-?\\d+)" + U + "(\\d+)$");

  function hostOf(url) {
    try { return new URL(url).hostname; } catch (e) { return ""; }
  }

  /* Опознание портала — только по адресу. */
  function portalOf(url) {
    var host = hostOf(url);
    if (host === "vk.ru" || host.endsWith(".vk.ru")) return "vk";
    if (host === "ok.ru" || host.endsWith(".ok.ru")) return "ok";
    if (host === "dzen.ru" || host.endsWith(".dzen.ru")) return "dzen";
    return "generic";
  }

  /* Нормализация id из ссылки. Тип — НЕ отсюда: тип даёт пункт меню. */
  function normalize(link, menu) {
    var portal = portalOf(link);
    var path = "";
    try { path = new URL(link).pathname; } catch (e) { path = link || ""; }
    var id = path;
    if (portal === "vk") {
      var m;
      if ((m = path.match(RE_ID))) id = "id" + m[1];
      else if ((m = path.match(RE_CLUB))) id = "club" + m[1];
      else if ((m = path.match(RE_WALL))) id = "wall" + m[1] + U + m[2];
    }
    var type = menu === "save-community" ? "COMMUNITY" : "PERSON";
    return { portal: portal, id: id, type: type, url: link };
  }

  /* Адрес встречи: wall-пост из pageUrl (путь или ?w=), иначе путь страницы. */
  function metPostOf(page) {
    try {
      var u = new URL(page);
      var m = u.pathname.match(RE_WALL);
      if (!m) m = (u.searchParams.get("w") || "").match(RE_WALL);
      if (m) return "wall" + m[1] + U + m[2];
      return u.pathname;
    } catch (e) { return page || ""; }
  }

  globalThis.CTX_NORMALIZE = Object.freeze({
    portalOf: portalOf,
    normalize: normalize,
    metPostOf: metPostOf,
  });
})();
