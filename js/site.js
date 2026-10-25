(function () {
  var cfg = window.KADUA || { forms: {} };
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = String(new Date().getFullYear()); });
  document.querySelectorAll("[data-last-checked]").forEach(function (el) { if (cfg.lastChecked) el.textContent = cfg.lastChecked; });
  document.querySelectorAll("[data-contact]").forEach(function (el) {
    if (cfg.contactEmail) { var a = document.createElement("a"); a.href = "mailto:" + cfg.contactEmail; a.textContent = cfg.contactEmail; el.textContent = "Write to "; el.appendChild(a); el.appendChild(document.createTextNode(".")); }
  });
  // Forms: wire configured ones, degrade the rest honestly
  document.querySelectorAll("[data-form]").forEach(function (el) {
    var key = el.getAttribute("data-form"), url = cfg.forms && cfg.forms[key];
    if (url) { el.href = url; el.target = "_blank"; el.rel = "noopener"; return; }
    var p = document.createElement("p"); p.className = el.classList.contains("btn") ? "form-note" : "muted";
    var copy = { feedback: "Reports open with the pilot launch.", providerApply: "Listing applications open with the pilot launch. Check back here.", productInterest: "The two-question product survey opens with the pilot launch.", communityInterest: "Group announcements open with the pilot launch.", organizerApply: "Organizer applications open with the pilot launch." };
    p.textContent = copy[key] || "This opens with the pilot launch."; el.replaceWith(p);
  });
  // Directory
  var list = document.getElementById("directory");
  if (list && window.KADUA_PROVIDERS) {
    var form = document.getElementById("filters"), empty = document.getElementById("directory-empty"), count = document.getElementById("directory-count");
    var params = new URLSearchParams(location.search);
    form.querySelectorAll("select").forEach(function (s) { var v = params.get(s.name); if (v) s.value = v; });
    function render() {
      var f = {}; form.querySelectorAll("select").forEach(function (s) { f[s.name] = s.value; });
      var rows = window.KADUA_PROVIDERS.filter(function (p) { return (!f.type || p.type === f.type) && (!f.mode || p.mode === f.mode) && (!f.area || p.area === f.area) && (!f.fee || p.fee === f.fee); });
      list.innerHTML = "";
      rows.forEach(function (p) {
        var li = document.createElement("li"); li.className = "";
        li.innerHTML = '<div class="card"><span class="pill pill--sample">' + p.status + '</span><h3>' + p.label + '</h3><p>' + p.type + ' · ' + p.mode + ' · ' + p.area + '</p><p>' + p.focus + '</p><p class="meta">Fee: ' + p.fee + ' · Languages: ' + p.languages + '</p><p class="meta">' + p.contact + '</p></div>';
        list.appendChild(li);
      });
      empty.hidden = rows.length > 0;
      if (rows.length === 0) { empty.innerHTML = "No sample listing matches those filters yet. <a href=\"find-support.html\">Clear the filters</a> or try Online only."; }
      if (count) count.textContent = rows.length + (rows.length === 1 ? " listing shown" : " listings shown") + (params.toString() ? " for your search" : "");
    }
    form.addEventListener("change", render); render();
  }
  // Communities
  var com = document.getElementById("communities");
  if (com && window.KADUA_COMMUNITIES) {
    window.KADUA_COMMUNITIES.forEach(function (c, i) {
      var li = document.createElement("li");
      li.innerHTML = '<div class="card"><span class="pill">' + c.status + '</span><h3>' + c.category + '</h3><p class="fil">' + c.fil + '</p><p>' + c.description + '</p></div>';
      com.appendChild(li);
    });
  }
})();
