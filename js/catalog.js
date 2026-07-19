const PRODUCTS_URL = "data/products.json";
const INSTAGRAM_DM = "https://ig.me/m/stylevibe.ua";
const INSTAGRAM_HINT =
  "Оберіть модель і напишіть нам в Instagram — відповімо щодо розміру й оплати.";

const state = {
  products: [],
  search: "",
  sort: "featured",
};

const elements = {
  grid: document.querySelector("[data-products-grid]"),
  searchInput: document.querySelector("[data-search-input]"),
  sortSelect: document.querySelector("[data-sort-select]"),
  emptyState: document.querySelector("[data-empty-state]"),
  modal: document.querySelector("[data-modal]"),
  modalImage: document.querySelector("[data-modal-image]"),
  modalTitle: document.querySelector("[data-modal-title]"),
  modalPrice: document.querySelector("[data-modal-price]"),
  modalDescription: document.querySelector("[data-modal-description]"),
  modalSizes: document.querySelector("[data-modal-sizes]"),
  modalColors: document.querySelector("[data-modal-colors]"),
  modalHint: document.querySelector("[data-modal-hint]"),
  orderLink: document.querySelector("[data-order-link]"),
};

function formatPrice(product) {
  return new Intl.NumberFormat("uk-UA", {
    style: "currency",
    currency: product.currency,
    maximumFractionDigits: 0,
  }).format(product.price);
}

function createColorChip(color) {
  return `<span class="color-chip" style="background-color: ${color}" aria-label="Колір ${color}"></span>`;
}

function createSizeChip(size) {
  return `<span class="size-chip">${size}</span>`;
}

function productMatchesSearch(product) {
  const query = state.search.trim().toLowerCase();

  if (!query) {
    return true;
  }

  return [product.name, product.description, ...(product.tags || [])]
    .join(" ")
    .toLowerCase()
    .includes(query);
}

function sortProducts(products) {
  return [...products].sort((first, second) => {
    if (state.sort === "price-asc") {
      return first.price - second.price;
    }

    if (state.sort === "price-desc") {
      return second.price - first.price;
    }

    if (state.sort === "name-asc") {
      return first.name.localeCompare(second.name, "uk");
    }

    return Number(second.featured) - Number(first.featured);
  });
}

function getVisibleProducts() {
  return sortProducts(state.products.filter(productMatchesSearch));
}

function renderProducts() {
  const products = getVisibleProducts();

  elements.emptyState.hidden = products.length > 0;
  elements.grid.innerHTML = products
    .map(
      (product) => `
        <article class="product-card" data-reveal>
          <div class="product-card__image">
            <img src="${product.image}" alt="${product.name}" loading="lazy" />
          </div>
          <div class="product-card__body">
            <div class="product-card__top">
              <h3>${product.name}</h3>
              <span class="price">${formatPrice(product)}</span>
            </div>
            <p>${product.description}</p>
            <div class="meta-row" aria-label="Доступні розміри">
              ${product.sizes.map(createSizeChip).join("")}
            </div>
            <div class="color-row" aria-label="Доступні кольори">
              ${product.colors.map(createColorChip).join("")}
            </div>
            <button class="button button--primary" type="button" data-buy-button="${product.id}">Купити</button>
          </div>
        </article>
      `
    )
    .join("");

  document.dispatchEvent(new CustomEvent("catalog:rendered"));
}

function fillModal(product) {
  elements.modalImage.src = product.image;
  elements.modalImage.alt = product.name;
  elements.modalTitle.textContent = product.name;
  elements.modalPrice.textContent = formatPrice(product);
  elements.modalDescription.textContent = product.description;
  elements.modalSizes.innerHTML = product.sizes.map(createSizeChip).join("");
  elements.modalColors.innerHTML = product.colors.map(createColorChip).join("");

  if (elements.modalHint) {
    elements.modalHint.textContent = `${INSTAGRAM_HINT} Модель: ${product.name}.`;
  }

  elements.orderLink.href = INSTAGRAM_DM;
  elements.orderLink.target = "_blank";
  elements.orderLink.rel = "noreferrer";
  elements.orderLink.textContent = "Написати в Instagram";
}

function openModal(product) {
  fillModal(product);
  elements.modal.hidden = false;
  document.body.classList.add("modal-open");
}

function closeModal() {
  elements.modal.hidden = true;
  document.body.classList.remove("modal-open");
}

function initCatalogEvents() {
  elements.searchInput?.addEventListener("input", (event) => {
    state.search = event.target.value;
    renderProducts();
  });

  elements.sortSelect?.addEventListener("change", (event) => {
    state.sort = event.target.value;
    renderProducts();
  });

  elements.grid?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-buy-button]");

    if (!button) {
      return;
    }

    const product = state.products.find((item) => item.id === button.dataset.buyButton);

    if (product) {
      openModal(product);
    }
  });

  document.querySelectorAll("[data-modal-close]").forEach((button) => {
    button.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !elements.modal.hidden) {
      closeModal();
    }
  });
}

async function loadProducts() {
  const response = await fetch(PRODUCTS_URL);

  if (!response.ok) {
    throw new Error("Не вдалося завантажити каталог.");
  }

  return response.json();
}

export async function initCatalog() {
  initCatalogEvents();

  try {
    state.products = await loadProducts();
    renderProducts();
  } catch (error) {
    elements.grid.innerHTML = `<p class="catalog-empty">${error.message}</p>`;
  }
}
