(function () {
  var cfg = window.KADUA || { forms: {} };

  // Year and last-checked date
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = String(new Date().getFullYear()); });
  document.querySelectorAll("[data-last-checked]").forEach(function (el) { if (cfg.lastChecked) el.textContent = cfg.lastChecked; });

  // Contact
  document.querySelectorAll("[data-contact]").forEach(function (el) {
    if (cfg.contactEmail) {
      var a = document.createElement("a"); a.href = "mailto:" + cfg.contactEmail; a.textContent = cfg.contactEmail;
      el.textContent = "Write to "; el.appendChild(a); el.appendChild(document.createTextNode("."));
    }
  });

  // Forms: wire configured ones, degrade the rest honestly
  document.querySelectorAll("[data-form]").forEach(function (el) {
    var key = el.getAttribute("data-form");
    var url = cfg.forms && cfg.forms[key];
    if (url) { el.href = url; el.target = "_blank"; el.rel = "noopener"; return; }
    var span = document.createElement("span");
    if (el.classList.contains("btn")) {
      span.className = "btn"; span.setAttribute("aria-disabled", "true"); span.textContent = el.textContent;
      var note = document.createElement("span"); note.className = "btn-note"; note.textContent = "This form opens here once it is connected.";
      el.replaceWith(span); span.insertAdjacentElement("afterend", note);
    } else {
      span.className = "muted"; span.textContent = el.textContent + " (form not yet connected)";
      el.replaceWith(span);
    }
  });

  // Directory
  var list = document.getElementById("directory");
  if (list && window.KADUA_PROVIDERS) {
    var form = document.getElementById("filters");
    var empty = document.getElementById("directory-empty");
    function render() {
      var f = {};
      form.querySelectorAll("select").forEach(function (s) { f[s.name] = s.value; });
      var rows = window.KADUA_PROVIDERS.filter(function (p) {
        return (!f.type || p.type === f.type) && (!f.mode || p.mode === f.mode) && (!f.area || p.area === f.area) && (!f.fee || p.fee === f.fee);
      });
      list.innerHTML = "";
      rows.forEach(function (p) {
        var li = document.createElement("li");
        li.innerHTML =
          "<div><p class=\"name\">" + p.label + "</p><p class=\"meta\">" + p.type + " · " + p.mode + " · " + p.area + "</p></div>" +
          "<div><p class=\"meta\">" + p.focus + "</p><p class=\"meta\">Fee: " + p.fee + " · Languages: " + p.languages + "</p></div>" +
          "<div><span class=\"pill pill--sample\">" + p.status + "</span><p class=\"meta\">" + p.contact + "</p></div>";
        list.appendChild(li);
      });
      empty.hidden = rows.length > 0;
      var count = document.getElementById("directory-count");
      if (count) count.textContent = rows.length + (rows.length === 1 ? " listing shown" : " listings shown");
    }
    form.addEventListener("change", render);
    render();
  }

  // Communities
  var com = document.getElementById("communities");
  if (com && window.KADUA_COMMUNITIES) {
    window.KADUA_COMMUNITIES.forEach(function (c) {
      var li = document.createElement("li");
      li.innerHTML =
        "<div><p class=\"name\">" + c.category + "</p><p class=\"meta\">" + c.fil + "</p></div>" +
        "<div><p class=\"meta\">" + c.description + "</p></div>" +
        "<div><span class=\"pill\">" + c.status + "</span></div>";
      com.appendChild(li);
    });
  }
})();
