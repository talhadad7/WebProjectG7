// --- Cart Management ---
// Functions to handle the shopping cart using localStorage.

/**
 * Retrieves the cart from localStorage.
 * @returns {object} The cart object.
 */
function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || {};
}

/**
 * Saves the cart to localStorage.
 * @param {object} cart - The cart object to save.
 */
function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

/**
 * Updates the cart item count in the header.
 */
function updateCartCount() {
  const cart = getCart();
  // Calculate total number of items in the cart.
  const totalItems = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
  const countEl = document.getElementById("cart-count");
  if (countEl) countEl.textContent = totalItems;
}

/**
 * Adds a product to the cart or increases its quantity.
 * @param {string} productId - The ID of the product.
 * @param {string} name - The name of the product.
 * @param {number} price - The price of the product.
 */
function addToCart(productId, name, price) {
  const cart = getCart();
  if (!cart[productId]) {
    // If product is not in cart, add it.
    cart[productId] = { name, price, quantity: 1 };
  } else {
    // If product is already in cart, increase quantity.
    cart[productId].quantity += 1;
  }
  saveCart(cart);
  updateCartCount();
  renderCheckout(); // Re-render the checkout list
  updateCatalogProduct(productId); // Update catalog UI
  showToast(`${name} added to cart`);
}

/**
 * Removes one item of a product from the cart.
 * If quantity becomes zero, the product is removed from the cart.
 * @param {string} productId - The ID of the product to remove.
 */
function removeFromCart(productId) {
  const cart = getCart();
  if (!cart[productId]) return;

  cart[productId].quantity -= 1;
  if (cart[productId].quantity <= 0) {
    delete cart[productId];
  }

  saveCart(cart);
  updateCartCount();
  renderCheckout(); // Re-render the checkout list
  updateCatalogProduct(productId); // Update catalog UI
  showToast(`Item quantity updated`);
}

/**
 * Deletes a product entirely from the cart, regardless of quantity.
 * @param {string} productId - The ID of the product to delete.
 */
function deleteItemFromCart(productId) {
  const cart = getCart();
  delete cart[productId];
  saveCart(cart);
  updateCartCount();
  renderCheckout(); // Re-render the checkout list
  updateCatalogProduct(productId); // Update catalog UI
}

// --- Product Data and Rendering ---

// An object containing all product information.
const PRODUCTS = {
  GarlicHerb: {
    id: "GarlicHerb",
    name: "Garlic & Herb Butter",
    flavor: "Fresh garlic, parsley & thyme",
    description: "A classic savory butter, perfect for bread, pasta and roasted veggies.",
    price: 29,
    weight: 150, // grams
    image: "Images/GarlicHerbButter.png",
    alt: "Garlic and herb flavored butter",
    popularity: 2
  },

  HoneySeaSalt: {
    id: "HoneySeaSalt",
    name: "Honey & Sea Salt Butter",
    flavor: "Wild honey & sea salt crystals",
    description: "Soft, sweet and slightly salty – perfect for brunch and desserts.",
    price: 32,
    weight: 150,
    image: "Images/HoneySaltButter.png",
    alt: "Honey and sea salt flavored butter",
    popularity: 9
  },

  SmokedPaprika: {
    id: "SmokedPaprika",
    name: "Smoked Paprika Butter",
    flavor: "Smoked paprika & roasted garlic",
    description: "Rich and smoky flavor that upgrades any grilled dish or steak.",
    price: 31,
    weight: 150,
    image: "Images/PaprikaButter.png",
    alt: "Smoked paprika flavored butter",
    popularity: 3
  },

  LemonDill: {
    id: "LemonDill",
    name: "Lemon & Dill Butter",
    flavor: "Lemon zest & fresh dill",
    description: "Bright and fresh, ideal for fish, veggies and light dishes.",
    price: 30,
    weight: 150,
    image: "Images/LemonDillButter.png",
    alt: "Lemon and dill flavored butter",
    popularity: 4
  },
  ChiliAnchovy: {
    id: "ChiliAnchovy",
    name: "Chili & Anchovy Butter",
    flavor: "Chili flakes, anchovy & herbs",
    description: "A bold, umami-packed butter with a spicy kick—amazing on pasta, toast and grilled fish.",
    price: 34,
    weight: 150,
    image: "Images/ChiliAnchovyButter.png",
    alt: "Chili and anchovy flavored butter slices on a wooden board",
    popularity: 5
  },

  CaramelizedOnion: {
    id: "CaramelizedOnion",
    name: "Caramelized Onion Butter",
    flavor: "Slow-cooked caramelized onions",
    description: "Sweet and savory butter with rich onion depth—perfect for steaks, burgers, mashed potatoes and toast.",
    price: 33,
    weight: 150,
    image: "Images/CaramelizedOnionButter.png",
    alt: "Caramelized onion flavored butter slices on a wooden board",
    popularity: 6
  },

  BrownButterCinnamonVanilla: {
    id: "BrownButterCinnamonVanilla",
    name: "Brown Butter with Cinnamon, Vanilla & Brown Sugar",
    flavor: "Brown butter, cinnamon, vanilla & brown sugar",
    description: "Warm, nutty and dessert-ready—spread on pancakes, waffles, banana bread or warm brioche.",
    price: 35,
    weight: 150,
    image: "Images/BrownButterCinnamonVanilla.png",
    alt: "Brown butter with cinnamon and vanilla slices on a wooden board",
    popularity: 7
  }
};

// An array of product IDs to be featured as signature flavors.
const SIGNATURE_FLAVORS = ["GarlicHerb", "SmokedPaprika"];

/**
 * Renders the signature flavors section on the homepage.
 */
function renderSignatureFlavors() {
  const strip = document.getElementById("signature-strip");
  if (!strip) return;

  strip.innerHTML = "";

  SIGNATURE_FLAVORS.forEach((id) => {
    const p = PRODUCTS[id];
    if (!p) return;

    const card = document.createElement("article");
    card.className = "mini-card";

    card.innerHTML = `
      <h3>${p.name.replace(" Butter", "")}</h3>
      <p>${p.description}</p>
    `;

    strip.appendChild(card);
  });
}

/**
 * Creates an HTML element for a single product card.
 * @param {object} product - The product object.
 * @returns {HTMLElement} The product card element.
 */
function createProductCard(product) {
  const article = document.createElement("article");
  article.className = "product-card";

  // Add data attributes for sorting and filtering.
  article.dataset.name = product.name;
  article.dataset.price = product.price;
  article.dataset.popularity = product.popularity;

  article.innerHTML = `
    <div class="product-image-placeholder">
      <img src="${product.image}" alt="${product.alt}" class="product-image" />
    </div>

    <div class="product-body">
      <h2>${product.name}</h2>
      <p class="product-flavor">${product.flavor}</p>
      <p class="product-description">${product.description}</p>
      <p class="product-price">₪${product.price} / ${product.weight}g</p>

      <div class="product-actions" data-product-id="${product.id}"></div>
    </div>
  `;

  return article;
}

/**
 * Finds the most popular product based on the 'popularity' property.
 * @returns {object} The most popular product.
 */
function getMostPopularProduct() {
  return Object.values(PRODUCTS).reduce((best, current) => {
    if (!best) return current;
    return current.popularity < best.popularity ? current : best;
  }, null);
}

/**
 * Renders the best seller product on the homepage.
 */
function renderBestSeller() {
  // Get elements from the page.
  const img = document.getElementById("best-img");
  const title = document.getElementById("best-title");
  const desc = document.getElementById("best-desc");
  const price = document.getElementById("best-price");
  const btn = document.querySelector('[data-add-product]');

  // If not on the homepage, do nothing.
  if (!img || !title || !desc || !price || !btn) return;

  const best = getMostPopularProduct();
  if (!best) return;

  // Fill the card with product info.
  img.src = best.image;
  img.alt = best.alt;
  title.textContent = best.name;
  desc.textContent = best.description;
  price.textContent = `₪${best.price} / ${best.weight}g`;

  // Set up the "Add to cart" button.
  btn.textContent = `Add ${best.name} to cart`;
  btn.addEventListener("click", () => {
    addToCart(best.id, best.name, best.price);
  });
}

/**
 * Renders all products into the catalog grid.
 */
function renderCatalog() {
  const grid = document.getElementById("catalog-grid");
  if (!grid) return;

  grid.innerHTML = "";

  Object.values(PRODUCTS).forEach((product) => {
    const card = createProductCard(product);
    grid.appendChild(card);
    // Update the cart buttons for the new card.
    updateCatalogProduct(product.id);
  });
}

// --- Catalog Filtering and Sorting ---

/**
 * Gets all product cards from the catalog.
 * @returns {Array<HTMLElement>} An array of product card elements.
 */
function getCatalogCards() {
  return Array.from(document.querySelectorAll("#catalog-grid .product-card"));
}

/**
 * Filters the catalog based on a search query.
 * @param {string} query - The search term.
 */
function applyCatalogSearch(query) {
  const q = query.trim().toLowerCase();
  const cards = getCatalogCards();

  cards.forEach((card) => {
    const name = (card.dataset.name || "").toLowerCase();
    const matches = name.includes(q);
    card.style.display = matches ? "" : "none";
  });
}

/**
 * Sorts the catalog based on the selected sort option.
 * @param {string} sortValue - The value of the selected sort option.
 */
function applyCatalogSort(sortValue) {
  const grid = document.getElementById("catalog-grid");
  if (!grid) return;

  const cards = getCatalogCards();

  cards.sort((a, b) => {
    const nameA = (a.dataset.name || "").toLowerCase();
    const nameB = (b.dataset.name || "").toLowerCase();
    const priceA = parseFloat(a.dataset.price || "0");
    const priceB = parseFloat(b.dataset.price || "0");
    const popA = parseFloat(a.dataset.popularity || "999");
    const popB = parseFloat(b.dataset.popularity || "999");

    switch (sortValue) {
      case "price-asc":
        return priceA - priceB;
      case "price-desc":
        return priceB - priceA;
      case "name":
        return nameA.localeCompare(nameB);
      case "popular":
      default:
        return popA - popB; // Lower number is more popular.
    }
  });

  // Re-append cards in the new sorted order.
  cards.forEach((card) => grid.appendChild(card));
}

/**
 * Sets up event listeners for the search and sort controls.
 */
function setupCatalogFilters() {
  const searchInput = document.getElementById("search");
  const sortSelect = document.getElementById("sort");

  if (!searchInput || !sortSelect) return;

  // Search as the user types.
  searchInput.addEventListener("input", () => {
    applyCatalogSearch(searchInput.value);
  });

  // Sort when the dropdown value changes.
  sortSelect.addEventListener("change", () => {
    applyCatalogSort(sortSelect.value);
    applyCatalogSearch(searchInput.value);
  });

  // Apply initial sort.
  applyCatalogSort(sortSelect.value);
}

/**
 * Updates a product's action buttons (e.g., "Add to cart" or quantity controls).
 * @param {string} productId - The ID of the product to update.
 */
function updateCatalogProduct(productId) {
  const container = document.querySelector(`.product-actions[data-product-id="${productId}"]`);
  if (!container) return;

  const cart = getCart();
  const quantity = cart[productId]?.quantity || 0;
  const product = PRODUCTS[productId];
  if (!product) return;

  if (quantity > 0) {
    // If the product is in the cart, show quantity controls.
    container.innerHTML = `
      <div class="quantity-control">
        <button class="btn-adjust" data-op="remove">-</button>
        <span class="quantity-display">${quantity}</span>
        <button class="btn-adjust" data-op="add">+</button>
      </div>
    `;

    container.querySelector('[data-op="add"]').addEventListener("click", () => {
      addToCart(productId, product.name, product.price);
    });

    container.querySelector('[data-op="remove"]').addEventListener("click", () => {
      removeFromCart(productId);
    });
  } else {
    // If not in the cart, show "Add to cart" button.
    container.innerHTML = `<button class="btn secondary-btn">Add to cart</button>`;
    container.querySelector("button").addEventListener("click", () => {
      addToCart(productId, product.name, product.price);
    });
  }
}

// --- Page-Specific Setups ---

/**
 * Sets up the "Add to cart" button on the homepage hero section.
 */
function setupHomePageButton() {
  const btn = document.querySelector('.hero-actions [data-add-product]');
  if (!btn) return;
  btn.addEventListener("click", () => {
    const id = btn.getAttribute("data-product-id");
    const name = btn.getAttribute("data-product-name");
    const price = parseFloat(btn.getAttribute("data-product-price"));
    addToCart(id, name, price);
  });
}

/**
 * Renders the items in the checkout page's order summary.
 */
function renderCheckout() {
  const cart = getCart();
  const orderList = document.getElementById("order-list");
  const totalEl = document.getElementById("order-total");
  if (!orderList || !totalEl) return;

  orderList.innerHTML = "";
  let total = 0;

  Object.entries(cart).forEach(([id, item]) => {
    const itemEl = document.createElement("li");
    itemEl.className = "order-item";
    itemEl.innerHTML = `
      <div class="order-item-details">
        <p class="order-name">${item.name}</p>
        <p class="order-meta">₪${item.price} each</p>
      </div>
      <div class="order-item-actions">
        <button class="btn-adjust" data-op="remove" data-id="${id}">-</button>
        <span class="order-quantity">${item.quantity}</span>
        <button class="btn-adjust" data-op="add" data-id="${id}" data-name="${item.name}" data-price="${item.price}">+</button>
      </div>
      <p class="order-price">₪${(item.quantity * item.price).toFixed(2)}</p>
      <button class="btn-remove" data-op="delete" data-id="${id}">×</button>
    `;

    // Add event listeners for the new buttons.
    itemEl.querySelector('[data-op="add"]').addEventListener("click", () => {
      addToCart(id, item.name, item.price);
    });
    itemEl.querySelector('[data-op="remove"]').addEventListener("click", () => {
      removeFromCart(id);
    });
    itemEl.querySelector('[data-op="delete"]').addEventListener("click", () => {
      deleteItemFromCart(id);
    });

    orderList.appendChild(itemEl);
    total += item.quantity * item.price;
  });

  totalEl.textContent = `₪${total}`;
}

/**
 * Sets up validation for the contact form.
 */
function setupContactForm() {
  const form = document.getElementById("contact-form");
  const status = document.getElementById("contact-status");
  if (!form || !status) return;

  // Handles form submission.
  form.addEventListener("submit", (e) => {
    e.preventDefault(); // Prevents page reload.

    const name = document.getElementById("contact-name").value.trim();
    const email = document.getElementById("contact-email").value.trim();
    const message = document.getElementById("contact-message").value.trim();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    // Validations.
    if (!name || !email || !message) {
      status.textContent = "Please fill in all required fields (*).";
      status.style.color = "#d22";
      return;
    }
    if (!emailOk) {
      status.textContent = "Please enter a valid email address.";
      status.style.color = "#d22";
      return;
    }
    if (message.length < 10) {
      status.textContent = "Message is too short (min 10 characters).";
      status.style.color = "#d22";
      return;
    }

    // On success.
    status.textContent = "Thanks! We got your message.";
    status.style.color = "green";
    showToast("Message sent");
    form.reset();
  });
}

/**
 * Sets up validation and submission handling for the checkout form.
 */
function setupCheckoutForm() {
  const form = document.getElementById("checkout-form");
  const messageEl = document.getElementById("order-message");
  if (!form || !messageEl) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    messageEl.textContent = "";
    messageEl.style.color = "#d22";

    // Check if cart is empty.
    const cart = getCart();
    if (Object.keys(cart).length === 0) {
      messageEl.textContent = "Your cart is empty.";
      return;
    }

    // Read and trim form values.
    const fullName = document.getElementById("full-name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const email = document.getElementById("email").value.trim();
    const city = document.getElementById("city").value.trim();
    const address = document.getElementById("address").value.trim();
    const cardLast4 = document.getElementById("card-last4").value.trim();
    const termsChecked = document.getElementById("terms").checked;

    // --- Validations ---
    if (!fullName || !phone || !email || !city || !address) {
      messageEl.textContent = "Please fill in all required fields (*).";
      return;
    }
    if (fullName.split(" ").length < 2) {
      messageEl.textContent = "Please enter full name (first and last).";
      return;
    }
    if (!/^\+?\d{9,12}$/.test(phone)) {
      messageEl.textContent = "Please enter a valid phone number.";
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      messageEl.textContent = "Please enter a valid email address.";
      return;
    }
    if (cardLast4 && !/^\d{4}$/.test(cardLast4)) {
      messageEl.textContent = "Card last 4 digits must be exactly 4 numbers.";
      return;
    }
    if (!termsChecked) {
      messageEl.textContent = "You must accept the terms to place an order.";
      return;
    }

    // --- On Success ---
    messageEl.style.color = "green";
    messageEl.textContent = "Thank you! Your order has been placed.";

    // Clear cart and reset form.
    localStorage.removeItem("cart");
    updateCartCount();
    renderCheckout();
    form.reset();
  });
}

/**
 * Sets up the "Read more" / "Show less" toggle on the about page.
 */
function setupAboutToggle() {
  const btn = document.getElementById("toggle-story-btn");
  const extra = document.getElementById("extra-story");
  if (!btn || !extra) return;

  btn.addEventListener("click", () => {
    extra.classList.toggle("hidden");
    btn.textContent = extra.classList.contains("hidden") ? "Read more" : "Show less";
  });
}

/**
 * Shows a toast message at the bottom of the screen.
 * @param {string} message - The message to display.
 */
function showToast(message) {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("visible");
  setTimeout(() => {
    toast.classList.remove("visible");
  }, 2000);
}

// --- On Load ---
// This runs when the page is fully loaded.
document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  renderCatalog();
  renderCheckout();
  setupCheckoutForm();
  setupAboutToggle();
  setupHomePageButton();
  setupContactForm();
  renderBestSeller();
  renderSignatureFlavors();
  setupCatalogFilters();
});
