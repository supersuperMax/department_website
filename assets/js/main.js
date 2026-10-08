/*
 * Поведение сайта: анимации появления, шапка, мега-меню, мобильное меню,
 * hero-слайдер, счётчики. Без зависимостей; собирается Hugo через js.Build
 * (layouts/_partials/head-additions.html) и подключается с defer.
 *
 * Настройки приходят из data-атрибутов <html> (см. layouts/baseof.html),
 * которые задаются в hugo.toml → [params.animations] и во front matter страницы.
 * Каждый модуль — отдельная функция init*; чтобы добавить своё поведение,
 * напишите ещё одну функцию и вызовите её в конце файла.
 */

const root = document.documentElement;
const cfg = root.dataset;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const animationsOn = cfg.animations === "true" && !reduceMotion;

/* ---------------------------------------------------- Появление блоков -- */
function initReveal() {
  const items = document.querySelectorAll("[data-animate]");
  if (!items.length) return;
  if (!animationsOn || cfg.reveal !== "true" || !("IntersectionObserver" in window)) {
    root.classList.remove("js-anim");
    return;
  }
  items.forEach((el) => {
    if (el.dataset.delay) el.style.setProperty("--delay", `${parseInt(el.dataset.delay, 10)}ms`);
  });
  // Дочерние элементы контейнера с data-stagger получают нарастающую задержку
  document.querySelectorAll("[data-stagger]").forEach((group) => {
    const step = parseInt(group.dataset.stagger, 10) || 100;
    group.querySelectorAll(":scope > [data-animate]").forEach((el, i) => {
      if (!el.dataset.delay) el.style.setProperty("--delay", `${i * step}ms`);
    });
  });
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
  );
  items.forEach((el) => io.observe(el));
}

/* ------------------------------------------- Шапка: скрытие/тень ------- */
function initHeader() {
  const header = document.querySelector(".site-header");
  if (!header) return;
  let lastY = window.scrollY;
  let ticking = false;
  const hideOnScroll = cfg.hideHeader === "true";
  const update = () => {
    const y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 24);
    const menuOpen = header.querySelector(".has-mega.is-open") || document.body.classList.contains("nav-open");
    if (hideOnScroll && !menuOpen) header.classList.toggle("is-hidden", y > lastY && y > 200);
    lastY = y;
    ticking = false;
  };
  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });
  update();
}

/* ------------------------------------------------------ Мега-меню ------- */
function initMegaMenu() {
  const items = document.querySelectorAll(".has-mega");
  const closeAll = (except) => {
    items.forEach((item) => {
      if (item === except) return;
      item.classList.remove("is-open");
      item.querySelector("[aria-expanded]")?.setAttribute("aria-expanded", "false");
    });
  };
  items.forEach((item) => {
    const btn = item.querySelector("button[aria-expanded]");
    if (!btn) return;
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = !item.classList.contains("is-open");
      closeAll(item);
      item.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", String(open));
    });
  });
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".has-mega")) closeAll();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAll();
  });
}

/* --------------------------------------------------- Мобильное меню ----- */
function initMobileNav() {
  const panel = document.getElementById("mobile-nav");
  const openBtn = document.querySelector("[data-nav-open]");
  if (!panel || !openBtn) return;
  const overlay = document.getElementById("mobile-nav-overlay");
  const setOpen = (open) => {
    panel.dataset.open = String(open);
    openBtn.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("nav-open", open);
    document.body.style.overflow = open ? "hidden" : "";
    overlay?.classList.toggle("hidden", !open);
    if (open) panel.querySelector("a, button")?.focus();
    else openBtn.focus();
  };
  openBtn.addEventListener("click", () => setOpen(true));
  panel.querySelectorAll("[data-nav-close]").forEach((b) => b.addEventListener("click", () => setOpen(false)));
  overlay?.addEventListener("click", () => setOpen(false));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && panel.dataset.open === "true") setOpen(false);
  });
}

/* ----------------------------------------------------- Hero-слайдер ----- */
function initHero() {
  const hero = document.querySelector("[data-hero]");
  if (!hero) return;
  const slides = [...hero.querySelectorAll(".hero-slide")];
  const dots = [...hero.querySelectorAll(".hero-dot")];
  if (slides.length < 2) return;
  let current = 0;
  let timer = null;
  const interval = parseInt(cfg.heroInterval, 10) || 0;

  const show = (i) => {
    current = (i + slides.length) % slides.length;
    slides.forEach((s, n) => s.setAttribute("aria-hidden", String(n !== current)));
    dots.forEach((d, n) => d.setAttribute("aria-current", String(n === current)));
  };
  const start = () => {
    if (!animationsOn || interval <= 0) return;
    stop();
    timer = window.setInterval(() => show(current + 1), interval);
  };
  const stop = () => timer && window.clearInterval(timer);

  dots.forEach((d, n) => d.addEventListener("click", () => { show(n); start(); }));
  hero.querySelector("[data-hero-prev]")?.addEventListener("click", () => { show(current - 1); start(); });
  hero.querySelector("[data-hero-next]")?.addEventListener("click", () => { show(current + 1); start(); });
  hero.addEventListener("mouseenter", stop);
  hero.addEventListener("mouseleave", start);
  hero.addEventListener("focusin", stop);
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
  start();
}

/* ------------------------------------------------------- Счётчики ------- */
function initCounters() {
  const counters = document.querySelectorAll("[data-count-to]");
  if (!counters.length) return;
  const run = (el) => {
    const target = parseFloat(el.dataset.countTo);
    const suffix = el.dataset.suffix || "";
    if (!animationsOn || cfg.counters !== "true") {
      el.textContent = target.toLocaleString(root.lang) + suffix;
      return;
    }
    const duration = 1600;
    const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min((t - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString(root.lang) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if (!("IntersectionObserver" in window)) return counters.forEach(run);
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { run(e.target); io.unobserve(e.target); }
    });
  }, { threshold: 0.5 });
  counters.forEach((c) => io.observe(c));
}

function init() {
  initReveal();
  initHeader();
  initMegaMenu();
  initMobileNav();
  initHero();
  initCounters();
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
else init();
