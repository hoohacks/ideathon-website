/* Ideathon by HooHacks — progressive enhancement only.
   The page reads and animates fine without any of this. */

(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.getElementById("year").textContent = new Date().getFullYear();

  /* --- Masthead ground swap --------------------------------------------- */

  var masthead = document.getElementById("masthead");

  function onScroll() {
    // Off the ink hero, the bar takes the paper ground and dark type.
    masthead.classList.toggle("is-stuck", window.scrollY > 40);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* --- Mobile nav ------------------------------------------------------- */

  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("nav");

  function setNav(open) {
    toggle.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
  }

  toggle.addEventListener("click", function () {
    setNav(toggle.getAttribute("aria-expanded") !== "true");
  });

  nav.addEventListener("click", function (e) {
    if (e.target.closest("a")) setNav(false);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setNav(false);
  });

  /* --- FAQ tabs --------------------------------------------------------- */

  document.querySelectorAll("[data-tabs]").forEach(function (group) {
    var tabs = Array.prototype.slice.call(group.querySelectorAll('[role="tab"]'));

    function select(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
      });
      if (focus) tab.focus();
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () {
        select(tab);
      });
      tab.addEventListener("keydown", function (e) {
        var next =
          e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : -1;
        if (next < 0 && e.key !== "ArrowLeft") return;
        e.preventDefault();
        select(tabs[(next + tabs.length) % tabs.length], true);
      });
    });
  });

  /* --- Scroll reveal ---------------------------------------------------- */

  var groups = [
    ".lede-block",
    ".sponsor",
    ".takeaway",
    ".run__stop",
    ".tabs",
    ".footer__top"
  ];
  var items = document.querySelectorAll(groups.join(","));

  if (reduced || !("IntersectionObserver" in window)) {
    items.forEach(function (el) {
      el.classList.add("is-in");
    });
    return;
  }

  var seen = new WeakMap();
  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.05 }
  );

  items.forEach(function (el) {
    el.classList.add("reveal");
    // Stagger siblings within a list so grids and the run of show cascade.
    var parent = el.parentElement;
    var n = seen.get(parent) || 0;
    seen.set(parent, n + 1);
    el.style.setProperty("--reveal-delay", Math.min(n, 6) * 70 + "ms");
    observer.observe(el);
  });
})();
