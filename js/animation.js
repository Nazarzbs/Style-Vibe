let observer;

function revealElement(element) {
  element.classList.add("is-visible");
  observer?.unobserve(element);
}

function prepareProductCards() {
  document.querySelectorAll(".product-card[data-reveal]:not(.is-visible)").forEach((card, index) => {
    card.style.setProperty("--reveal-delay", `${Math.min(index * 70, 420)}ms`);
    card.setAttribute("data-reveal", "product");
  });
}

function observeRevealElements() {
  prepareProductCards();

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
      threshold: 0.12,
      rootMargin: "0px 0px -40px",
    }
  );

  observeRevealElements();
  document.addEventListener("catalog:rendered", observeRevealElements);
}
