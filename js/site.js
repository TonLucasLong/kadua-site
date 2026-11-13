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
  // Free-consultation locator
  var cl = document.getElementById("clinics");
  if (cl && window.KADUA_CLINICS) {
    var cf = document.getElementById("clinic-filters"), citySel = document.getElementById("clinic-city"),
        cEmpty = document.getElementById("clinics-empty"), cStatus = document.getElementById("clinic-status"),
        nearBtn = document.getElementById("clinic-near"), here = null;
    var esc = function (t) { return String(t == null ? "" : t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
    var cities = []; window.KADUA_CLINICS.forEach(function (c) { if (cities.indexOf(c.city) < 0) cities.push(c.city); });
    cities.sort().forEach(function (c) { var o = document.createElement("option"); o.textContent = c; citySel.appendChild(o); });
    var labels = { free: "Free for everyone", residents: "Free for city residents", philhealth: "Free with PhilHealth", students: "Free for students or staff" };
    function km(a, b) { var R = 6371, r = Math.PI / 180, dLat = (b.lat - a.lat) * r, dLng = (b.lng - a.lng) * r;
      var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
      return 2 * R * Math.asin(Math.sqrt(h)); }
    function renderClinics() {
      var f = {}; cf.querySelectorAll("select").forEach(function (s) { f[s.name] = s.value; });
      var rows = window.KADUA_CLINICS.filter(function (c) {
        return (!f.city || c.city === f.city) && (!f.free || c.free === f.free) && (!f.access || (c.access || []).indexOf(f.access) >= 0); });
      rows.forEach(function (c) { c._d = (here && c.lat != null) ? km(here, c) : null; });
      if (here) rows.sort(function (a, b) { return (a._d == null ? 1e9 : a._d) - (b._d == null ? 1e9 : b._d); });
      cl.innerHTML = "";
      rows.forEach(function (c) {
        var tels = (c.phones || []).map(function (t) { return '<a class="btn btn--ghost btn--sm" href="tel:' + esc(t.tel) + '">Call ' + esc(t.label) + '</a>'; }).join("");
        var dir = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(c.mapQuery || (c.name + ", " + c.address));
        var li = document.createElement("li");
        li.innerHTML = '<div class="card clinic">' +
          '<div class="clinic__top"><span class="pill">' + esc(labels[c.free] || c.free) + '</span>' + (c._d != null ? '<span class="clinic__dist">' + (c._d < 10 ? c._d.toFixed(1) : Math.round(c._d)) + ' km away</span>' : '') + '</div>' +
          '<h3>' + esc(c.name) + '</h3>' +
          '<p class="clinic__where">' + esc(c.city) + (c.unit ? ' · ' + esc(c.unit) : '') + '</p>' +
          '<p>' + esc(c.what) + '</p>' +
          (c.schedule ? '<p class="meta"><b>When:</b> ' + esc(c.schedule) + '</p>' : '') +
          (c.howTo ? '<p class="meta"><b>How:</b> ' + esc(c.howTo) + '</p>' : '') +
          '<p class="meta"><b>Address:</b> ' + esc(c.address) + '</p>' +
          '<div class="clinic__actions"><a class="btn btn--sm" href="' + dir + '" target="_blank" rel="noopener">Directions</a>' + tels + (c.link ? '<a class="btn btn--ghost btn--sm" href="' + esc(c.link) + '" target="_blank" rel="noopener">' + esc(c.linkLabel || "Official page") + '</a>' : '') + '</div>' +
          '<p class="meta clinic__src">Confirmed from <a href="' + esc(c.source.url) + '" target="_blank" rel="noopener">' + esc(c.source.label) + '</a>. Last checked ' + esc(c.checked) + '.</p>' +
          '</div>';
        cl.appendChild(li);
      });
      cEmpty.hidden = rows.length > 0;
      if (!rows.length) cEmpty.innerHTML = 'No free clinic on our list matches those filters yet. Try "All of Metro Manila", or check the national services under <a href="immediate-help.html">Immediate Help</a>.';
      cStatus.textContent = rows.length + (rows.length === 1 ? " place" : " places") + (here ? ", nearest first" : "");
    }
    cf.addEventListener("change", renderClinics);
    if (nearBtn) nearBtn.addEventListener("click", function () {
      if (!navigator.geolocation) { cStatus.textContent = "Your browser can't share location. Pick your city instead."; return; }
      cStatus.textContent = "Finding your location...";
      navigator.geolocation.getCurrentPosition(function (pos) {
        here = { lat: pos.coords.latitude, lng: pos.coords.longitude }; nearBtn.setAttribute("aria-pressed", "true"); renderClinics();
      }, function () { cStatus.textContent = "Location wasn't shared, so the list stays in its usual order. Pick your city instead."; },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 });
    });
    renderClinics();
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
