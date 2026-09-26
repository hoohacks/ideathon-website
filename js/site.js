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

  /* --- Live run of show ------------------------------------------------- */

  // On event day, mark the stop that is happening now (Charlottesville time).
  // Any other day, nothing is marked.
  var run = document.querySelector(".run[data-date]");

  function toMinutes(hhmm) {
    var p = hhmm.split(":");
    return Number(p[0]) * 60 + Number(p[1]);
  }

  function markNow() {
    var parts = {};
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/New_York",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23"
    })
      .formatToParts(new Date())
      .forEach(function (p) {
        parts[p.type] = p.value;
      });

    var today = parts.year + "-" + parts.month + "-" + parts.day;
    var now = Number(parts.hour) * 60 + Number(parts.minute);
    var live = today === run.dataset.date && now < toMinutes(run.dataset.end);
    var current = null;

    run.querySelectorAll(".run__stop").forEach(function (stop) {
      if (live && toMinutes(stop.dataset.start) <= now) current = stop;
    });
    run.querySelectorAll(".run__stop").forEach(function (stop) {
      stop.classList.toggle("run__stop--now", stop === current);
    });
  }

  if (run) {
    markNow();
    setInterval(markNow, 60000);
  }

  /* --- Scroll reveal ---------------------------------------------------- */

  var groups = [
    ".lede-block",
    ".partners",
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
