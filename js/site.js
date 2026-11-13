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
  // Free-consultation locator: map-first, tap a pin for the clinic card, list view as a toggle
  var cl = document.getElementById("clinics");
  if (cl && window.KADUA_CLINICS) {
    var cf = document.getElementById("clinic-filters"), citySel = document.getElementById("clinic-city"),
        cEmpty = document.getElementById("clinics-empty"), cStatus = document.getElementById("clinic-status"),
        nearBtn = document.getElementById("clinic-near"), detail = document.getElementById("clinic-detail"),
        mapBox = document.getElementById("loc-map"), here = null, qc = window.KADUA_QC_CENTERS || [], view = "map";
    var esc = function (t) { return String(t == null ? "" : t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
    var cities = []; window.KADUA_CLINICS.forEach(function (c) { if (cities.indexOf(c.city) < 0) cities.push(c.city); });
    cities.sort().forEach(function (c) { var o = document.createElement("option"); o.textContent = c; citySel.appendChild(o); });
    var labels = { free: "Free for everyone", residents: "Free for city residents" };
    var dirUrl = function (q) { return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q); };
    function km(a, b) { var r = Math.PI / 180, dLat = (b.lat - a.lat) * r, dLng = (b.lng - a.lng) * r;
      var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
      return 12742 * Math.asin(Math.sqrt(h)); }
    function points(c) { return c.group === "qc" ? qc : (c.lat != null ? [{ name: c.name, lat: c.lat, lng: c.lng }] : []); }
    function nearest(c) { var best = null; points(c).forEach(function (p) { var d = km(here, p); if (!best || d < best.d) best = { d: d, p: p }; }); return best; }
    function fmtKm(d) { return (d < 10 ? d.toFixed(1) : Math.round(d)) + " km away"; }
    // One card renderer for the list and the map detail. p = the specific pin (for QC centers).
    function cardHtml(c, p) {
      var isQc = c.group === "qc" && p;
      var tels = (c.phones || []).map(function (t) { return '<a class="btn btn--ghost btn--sm" href="tel:' + esc(t.tel) + '">Call ' + esc(t.label) + '</a>'; }).join("");
      var dq = isQc ? p.name + ", Quezon City" : (c.mapQuery || (c.name + ", " + c.address));
      var d = here ? (p ? km(here, p) : c._d) : null;
      var distTxt = d != null ? '<span class="clinic__dist">' + fmtKm(d) + (c.group === "qc" && !p && c._np ? ' (' + esc(c._np.name) + ')' : '') + '</span>' : '';
      return '<div class="card clinic">' +
        '<div class="clinic__top"><span class="pill">' + esc(labels[c.free] || c.free) + '</span>' + distTxt + '</div>' +
        '<h3>' + esc(isQc ? p.name : c.name) + '</h3>' +
        '<p class="clinic__where">' + (isQc ? 'Quezon City health center' + (p.street ? ' · ' + esc(p.street) : '') : esc(c.city) + (c.unit ? ' · ' + esc(c.unit) : '')) + '</p>' +
        '<p>' + esc(c.what) + '</p>' +
        (c.schedule ? '<p class="meta"><b>When:</b> ' + esc(c.schedule) + '</p>' : '') +
        (c.howTo ? '<p class="meta"><b>How:</b> ' + esc(c.howTo) + '</p>' : '') +
        (isQc ? '' : '<p class="meta"><b>Address:</b> ' + esc(c.address) + '</p>') +
        (!p && points(c).length === 0 ? '<p class="meta"><b>On the map:</b> no pin, ' + (c.city === "Online" ? 'this one is online.' : 'the city does not publish a single address.') + '</p>' : '') +
        '<div class="clinic__actions">' + (c.city !== "Online" ? '<a class="btn btn--sm" href="' + dirUrl(dq) + '" target="_blank" rel="noopener">Directions</a>' : '') + tels + (c.link ? '<a class="btn btn--ghost btn--sm" href="' + esc(c.link) + '" target="_blank" rel="noopener">' + esc(c.linkLabel || "Official page") + '</a>' : '') + '</div>' +
        '<p class="meta clinic__src">Confirmed from <a href="' + esc(c.source.url) + '" target="_blank" rel="noopener">' + esc(c.source.label) + '</a>.' + (isQc ? ' Pin location from OpenStreetMap.' : '') + ' Last checked ' + esc(c.checked) + '.</p>' +
        '</div>';
    }
    // Map
    var map = null, layer = null, meDot = null, mapEl = document.getElementById("clinic-map"), activeMarker = null;
    if (mapEl && window.L) {
      map = L.map(mapEl, { scrollWheelZoom: false, tap: true }).setView([14.6, 121.03], 11);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' }).addTo(map);
      layer = L.layerGroup().addTo(map);
      map.on("focus", function () { map.scrollWheelZoom.enable(); });
      map.on("blur", function () { map.scrollWheelZoom.disable(); });
      map.on("click", closeDetail);
    } else if (mapBox) { mapBox.hidden = true; view = "list"; }
    var pin = function (kind, on) { return L.divIcon({ className: "kpin kpin--" + kind + (on ? " is-active" : ""), html: '<span></span>', iconSize: [30, 38], iconAnchor: [15, 37] }); };
    function closeDetail() { if (!detail) return; detail.hidden = true; detail.innerHTML = ""; if (activeMarker) { activeMarker.setIcon(activeMarker._kIcon); activeMarker = null; } }
    function openDetail(c, p, marker) {
      if (activeMarker) activeMarker.setIcon(activeMarker._kIcon);
      activeMarker = marker; marker.setIcon(pin(marker._kKind, true));
      detail.innerHTML = '<button class="clinic-detail__close" type="button" aria-label="Close">&times;</button>' + cardHtml(c, p);
      detail.hidden = false;
      detail.querySelector(".clinic-detail__close").addEventListener("click", closeDetail);
      map.panTo([p.lat, p.lng], { animate: true });
      detail.querySelector("h3").setAttribute("tabindex", "-1");
    }
    function renderClinics(fit) {
      var f = {}; cf.querySelectorAll("select").forEach(function (s) { f[s.name] = s.value; });
      var rows = window.KADUA_CLINICS.filter(function (c) {
        return (!f.city || c.city === f.city) && (!f.free || c.free === f.free) && (!f.access || (c.access || []).indexOf(f.access) >= 0); });
      rows.forEach(function (c) { var n = here ? nearest(c) : null; c._d = n ? n.d : null; c._np = n ? n.p : null; });
      if (here) rows.sort(function (a, b) { return (a._d == null ? 1e9 : a._d) - (b._d == null ? 1e9 : b._d); });
      cl.innerHTML = "";
      rows.forEach(function (c) { var li = document.createElement("li"); li.innerHTML = cardHtml(c, null); cl.appendChild(li); });
      var nPins = 0;
      if (map) {
        closeDetail(); layer.clearLayers(); var b = [];
        rows.forEach(function (c) {
          points(c).forEach(function (p) {
            var kind = c.group === "qc" ? "qc" : "main";
            var m = L.marker([p.lat, p.lng], { icon: pin(kind), title: c.group === "qc" ? p.name : c.name, alt: c.group === "qc" ? p.name : c.name, zIndexOffset: kind === "qc" ? 0 : 500, keyboard: true });
            m._kIcon = pin(kind); m._kKind = kind;
            m.on("click", function (e) { L.DomEvent.stopPropagation(e); openDetail(c, p, m); });
            m.addTo(layer); b.push([p.lat, p.lng]); nPins++;
          });
        });
        if (here) b.push([here.lat, here.lng]);
        if (fit !== false && b.length) map.fitBounds(b, { padding: [30, 30], maxZoom: 14 });
      }
      cEmpty.hidden = rows.length > 0;
      if (!rows.length) cEmpty.innerHTML = 'No free clinic on our list matches those filters yet. Try "All of Metro Manila", or check the national services under <a href="immediate-help.html">Immediate Help</a>.';
      cStatus.textContent = view === "map"
        ? nPins + (nPins === 1 ? " place" : " places") + " on the map. Tap a pin."
        : rows.length + (rows.length === 1 ? " service" : " services") + (here ? ", nearest first" : "");
    }
    function setView(v) {
      view = v;
      document.querySelectorAll(".seg [data-view]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-view") === v)); });
      if (mapBox) mapBox.hidden = v !== "map"; cl.hidden = v !== "list";
      if (v === "map" && map) setTimeout(function () { map.invalidateSize(); }, 0);
      renderClinics(v === "map" ? undefined : false);
    }
    document.querySelectorAll(".seg [data-view]").forEach(function (b) { b.addEventListener("click", function () { setView(b.getAttribute("data-view")); }); });
    cf.addEventListener("change", function () { renderClinics(); });
    if (nearBtn) nearBtn.addEventListener("click", function () {
      if (!navigator.geolocation) { cStatus.textContent = "Your browser can't share location. Pick your city instead."; return; }
      cStatus.textContent = "Finding your location...";
      navigator.geolocation.getCurrentPosition(function (pos) {
        here = { lat: pos.coords.latitude, lng: pos.coords.longitude }; nearBtn.setAttribute("aria-pressed", "true");
        renderClinics(false);
        if (map) {
          if (meDot) meDot.remove();
          meDot = L.circleMarker([here.lat, here.lng], { radius: 9, color: "#fff", weight: 3, fillColor: "#3770bf", fillOpacity: 1 }).bindTooltip("You are here").addTo(map);
          var near = []; window.KADUA_CLINICS.forEach(function (c) { points(c).forEach(function (p) { near.push({ d: km(here, p), p: p }); }); });
          near.sort(function (a, b) { return a.d - b.d; });
          var bb = [[here.lat, here.lng]]; near.slice(0, 3).forEach(function (n) { bb.push([n.p.lat, n.p.lng]); });
          map.fitBounds(bb, { padding: [50, 50], maxZoom: 15 });
        }
      }, function () { cStatus.textContent = "Location wasn't shared. Pick your city instead."; },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 });
    });
    setView(view);
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
