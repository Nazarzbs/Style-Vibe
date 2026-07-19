import { initAnimations } from "./animation.js";
import { initCatalog } from "./catalog.js";

const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const sectionIds = ["home", "catalog", "about", "contacts"];

function closeMenu() {
  nav?.classList.remove("is-open");
  navToggle?.setAttribute("aria-expanded", "false");
}

function setActiveNav(sectionId) {
  if (!nav) {
    return;
  }

  nav.querySelectorAll("a[href^='#']").forEach((link) => {
    const isActive = link.getAttribute("href") === `#${sectionId}`;
    link.classList.toggle("is-active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "true");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function initScrollSpy() {
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

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");

      if (!targetId || targetId === "#") {
        return;
      }

      const target = document.querySelector(targetId);

      if (!target) {
        return;
      }

      event.preventDefault();
      closeMenu();
      const sectionId = targetId.slice(1);
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
