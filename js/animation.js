let observer;

function revealElement(element) {
  element.classList.add("is-visible");
  observer?.unobserve(element);
}

function observeRevealElements() {
  const elements = document.querySelectorAll("[data-reveal]:not(.is-visible)");

  if (!("IntersectionObserver" in window)) {
    elements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  elements.forEach((element) => observer.observe(element));
}

export function initAnimations() {
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          revealElement(entry.target);
        }
      });
    },
    {
      threshold: 0.16,
      rootMargin: "0px 0px -60px",
    }
  );

  observeRevealElements();
  document.addEventListener("catalog:rendered", observeRevealElements);
}
