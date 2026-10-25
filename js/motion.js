// Kadua motion: one reveal per element on first entry, header shadow on scroll, nothing loops.
(function () {
  document.documentElement.classList.add("js");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var els = document.querySelectorAll("[data-reveal]");
  if (!("IntersectionObserver" in window) || reduce) { els.forEach(function (e) { e.classList.add("is-in"); }); }
  else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -5% 0px", threshold: 0 });
    els.forEach(function (e) { io.observe(e); });
  }
  var header = document.querySelector(".site-header");
  if (header) {
    var last = false;
    window.addEventListener("scroll", function () {
      var on = window.scrollY > 8; if (on !== last) { header.classList.toggle("is-scrolled", on); last = on; }
    }, { passive: true });
  }
  var toggle = document.querySelector(".nav-toggle"), menu = document.getElementById("site-menu");
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open"); toggle.setAttribute("aria-expanded", open ? "true" : "false"); document.body.classList.toggle("menu-open", open);
    });
    function close() { menu.classList.remove("is-open"); toggle.setAttribute("aria-expanded", "false"); document.body.classList.remove("menu-open"); }
    menu.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", close); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && menu.classList.contains("is-open")) { close(); toggle.focus(); } });
  }
})();
