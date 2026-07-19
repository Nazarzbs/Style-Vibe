import { initAnimations } from "./animation.js";
import { initCatalog } from "./catalog.js";

const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const sectionIds = ["home", "popular", "about", "contacts"];

function closeMenu() {
  nav?.classList.remove("is-open");
  navToggle?.setAttribute("aria-expanded", "false");
}

function closeDropdowns(exceptItem = null) {
  document.querySelectorAll("[data-nav-item]").forEach((item) => {
    if (item === exceptItem) {
      return;
    }

    item.classList.remove("is-open");
    item.querySelector("[data-dropdown-toggle]")?.setAttribute("aria-expanded", "false");
  });
}

function getCurrentPageName() {
  return window.location.pathname.split("/").pop() || "index.html";
}

function setActiveNav(sectionId = "") {
  if (!nav) {
    return;
  }

  const currentPage = getCurrentPageName();
  const isCatalogPage = currentPage === "catalog.html";

  nav.querySelectorAll(".nav-link").forEach((button) => {
    const isActive =
      (button.dataset.navGroup === "catalog" && isCatalogPage) ||
      (button.dataset.navGroup === "home" && !isCatalogPage);

    button.classList.toggle("is-active", isActive);
    button.toggleAttribute("aria-current", isActive);
  });

  nav.querySelectorAll(".nav-dropdown a").forEach((link) => {
    const url = new URL(link.href, window.location.href);
    const linkPage = url.pathname.split("/").pop() || "index.html";
    const isActive =
      (isCatalogPage && linkPage === "catalog.html") ||
      (!isCatalogPage && url.hash === `#${sectionId}`);

    link.classList.toggle("is-active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "true");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function initScrollSpy() {
  if (getCurrentPageName() === "catalog.html") {
    setActiveNav();
    return;
  }

  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  if (!sections.length) {
    return;
  }

  const spyObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

      if (visible[0]?.target?.id) {
        setActiveNav(visible[0].target.id);
      }
    },
    {
      rootMargin: "-28% 0px -52% 0px",
      threshold: [0.1, 0.25, 0.5, 0.75],
    }
  );

  sections.forEach((section) => spyObserver.observe(section));
  setActiveNav("home");
}

function initNavigation() {
  navToggle?.addEventListener("click", () => {
    const isOpen = nav?.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(Boolean(isOpen)));
  });

  document.querySelectorAll("[data-dropdown-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const item = button.closest("[data-nav-item]");
      const isOpen = item?.classList.toggle("is-open");

      closeDropdowns(item);
      button.setAttribute("aria-expanded", String(Boolean(isOpen)));
    });
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest("[data-nav]")) {
      closeDropdowns();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeDropdowns();
      closeMenu();
    }
  });

  document.querySelectorAll("a[href*='#']").forEach((link) => {
    link.addEventListener("click", (event) => {
      const url = new URL(link.href, window.location.href);
      const currentPage = getCurrentPageName();
      const linkPage = url.pathname.split("/").pop() || "index.html";
      const isSamePageHash = url.hash && (linkPage === currentPage || (currentPage === "" && linkPage === "index.html"));

      if (!isSamePageHash) {
        closeDropdowns();
        closeMenu();
        return;
      }

      const target = document.querySelector(url.hash);

      if (!target) {
        return;
      }

      event.preventDefault();
      closeDropdowns();
      closeMenu();
      const sectionId = url.hash.slice(1);
      if (sectionIds.includes(sectionId)) {
        setActiveNav(sectionId);
      }
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function initHeaderState() {
  const updateHeader = () => {
    header?.classList.toggle("is-scrolled", window.scrollY > 20);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 860) {
      closeMenu();
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  initHeaderState();
  initScrollSpy();
  initCatalog();
  initAnimations();
});
