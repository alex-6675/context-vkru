/* Context VK.RU · dialog.js · v07f
 * Страница карточки коррекции (открывается из SW через chrome.windows.create,
 * url: dialog.html#cardId). Поля: displayName, note, status, цвет (палитра 5),
 * identities — только чтение.
 * v07f: кнопка «Удалить карточку» (подтверждение внутри окна) → удалить из db,
 * saveDb, закрыть окно.
 * «Сохранить» → saveDb → закрыть окно. Поле access не трогается.
 * Vanilla JS, ноль зависимостей (§2.2).
 */
(function () {
  "use strict";

  var PALETTE = ["#2b6fb3", "#3a7d44", "#a63d40", "#8a6d1f", "#6b5b95"];
  var cardId = decodeURIComponent(location.hash.slice(1));
  var chosenColor = PALETTE[0];

  CTX_STORAGE.loadDb().then(function (db) {
    var card = null;
    for (var i = 0; i < db.cards.length; i++) {
      if (db.cards[i].cardId === cardId) { card = db.cards[i]; break; }
    }
    if (!card) {
      document.getElementById("card-id").textContent = cardId || "?";
      var ids = document.getElementById("f-identities");
      var li = document.createElement("li");
      li.className = "empty";
      li.textContent = "Карточка не найдена в базе.";
      ids.appendChild(li);
      document.getElementById("btn-save").disabled = true;
      document.getElementById("btn-delete").disabled = true;
      return;
    }
    fill(card);
    wire(card, db);
  }).catch(function () {
    document.getElementById("card-id").textContent = "ошибка чтения базы";
  });

  function fill(card) {
    document.getElementById("card-id").textContent = card.cardId;
    document.getElementById("f-name").value = card.displayName || "";
    document.getElementById("f-note").value = card.note || "";
    document.getElementById("f-status").value = card.status || "saved";
    chosenColor = card.color || PALETTE[0];

    var pal = document.getElementById("f-palette");
    PALETTE.forEach(function (c) {
      var sw = document.createElement("button");
      sw.type = "button";
      sw.className = "swatch" + (c === chosenColor ? " sel" : "");
      sw.style.background = c;
      sw.dataset.color = c;
      sw.title = c;
      sw.addEventListener("click", function () {
        chosenColor = c;
        var all = pal.querySelectorAll(".swatch");
        for (var j = 0; j < all.length; j++) {
          all[j].className = "swatch" + (all[j].dataset.color === chosenColor ? " sel" : "");
        }
      });
      pal.appendChild(sw);
    });

    var ul = document.getElementById("f-identities");
    var list = card.identities || [];
    if (!list.length) {
      var empty = document.createElement("li");
      empty.className = "empty";
      empty.textContent = "нет удостоверений";
      ul.appendChild(empty);
    } else {
      list.forEach(function (it) {
        var li = document.createElement("li");
        li.textContent = it.portal + " · " + it.id +
          (it.replyId ? "#" + it.replyId : "") + " — " + it.url;
        ul.appendChild(li);
      });
    }
  }

  function wire(card, db) {
    document.getElementById("btn-save").addEventListener("click", function () {
      card.displayName = document.getElementById("f-name").value;
      card.note = document.getElementById("f-note").value;
      card.status = document.getElementById("f-status").value;
      card.color = chosenColor;
      card.visual = card.visual || {};
      card.visual.faded = card.status === "dirt"; /* «грязь» → блеклость */
      CTX_STORAGE.saveDb(db).then(function () { window.close(); });
    });

    document.getElementById("btn-delete").addEventListener("click", function () {
      if (!window.confirm("Удалить карточку " + cardId + "? Это действие нельзя отменить.")) return;
      var idx = db.cards.findIndex(function (c) { return c.cardId === cardId; });
      if (idx !== -1) db.cards.splice(idx, 1);
      CTX_STORAGE.saveDb(db).then(function () { window.close(); });
    });

    document.getElementById("btn-close").addEventListener("click", function () {
      window.close();
    });
  }
})();
