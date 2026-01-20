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
async function loadProductsFromServer() {
  const res = await fetch("/products");
  if (!res.ok) throw new Error("Failed to load products");
  const arr = await res.json();

  const productsObj = {};
  for (const p of arr) {
    productsObj[p.id] = {
      ...p,
      price: Number(p.price),
      weight: Number(p.weight),
      popularity: Number(p.popularity),
    };
  }
  return productsObj;
}
// An object containing all product information.
let PRODUCTS = {};


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

// --- Form Persistence ---

/**
 * Saves form field values to localStorage.
 * @param {HTMLFormElement} form - The form element.
 */
function saveFormDraft(form) {
  if (!form) return;
  const data = {};
  const inputs = form.querySelectorAll("input, textarea, select");
  inputs.forEach(input => {
    if (input.id) {
      if (input.type === "checkbox" || input.type === "radio") {
        data[input.id] = input.checked;
      } else {
        data[input.id] = input.value;
      }
    }
  });
  localStorage.setItem("draft_" + form.id, JSON.stringify(data));
}

/**
 * Restores form field values from localStorage.
 * @param {HTMLFormElement} form - The form element.
 */
function restoreFormDraft(form) {
  if (!form) return;
  const data = JSON.parse(localStorage.getItem("draft_" + form.id));
  if (!data) return;

  const inputs = form.querySelectorAll("input, textarea, select");
  inputs.forEach(input => {
    if (input.id && data.hasOwnProperty(input.id)) {
      if (input.type === "checkbox" || input.type === "radio") {
        input.checked = data[input.id];
      } else {
        input.value = data[input.id];
      }
    }
  });
}

/**
 * Clears the saved draft for a form.
 * @param {string} formId - The ID of the form.
 */
function clearFormDraft(formId) {
  localStorage.removeItem("draft_" + formId);
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

  // Restore saved data if available
  restoreFormDraft(form);
  // Save data on changes
  form.addEventListener("input", () => saveFormDraft(form));

  // Handles form submission.
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("contact-name").value.trim();
    const email = document.getElementById("contact-email").value.trim();
    const subject = document.getElementById("contact-subject")?.value.trim() || "";
    const message = document.getElementById("contact-message").value.trim();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    // Validations.
    if (!name || !email || !message) {
      e.preventDefault();
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

    try {
      const res = await fetch("/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        status.innerHTML = `✅ Message sent successfully. Ticket #<b>${result.ticketId}</b>`;
        status.className = "small-note success";

        clearFormDraft("contact-form");
        form.reset();

        // Optional: clear message after 5 seconds:
        // setTimeout(() => { status.textContent = ""; status.className = "small-note"; }, 5000);

      } else {
        status.textContent = "❌ Something went wrong. Please try again.";
        status.className = "small-note error";
      }
    } catch (err) {
      status.textContent = "❌ Server not reachable. Try again.";
      status.className = "small-note error";
    }
  });
}

/**
 * Sets up validation and submission handling for the checkout form.
 */
function setupCheckoutForm() {
  // Retrieve the checkout form and message element from the DOM
  const form = document.getElementById("checkout-form");
  const messageEl = document.getElementById("order-message");

  // If either doesn't exist – exit
  if (!form || !messageEl) return;

  // Restore form draft (if the user started filling it earlier)
  restoreFormDraft(form);

  // Save draft on every input change
  form.addEventListener("input", () => saveFormDraft(form));

  // Handle form submission
  form.addEventListener("submit", async (e) => {
    // Prevent default form behavior (page refresh)
    e.preventDefault();

    // Reset previous messages and set default error color
    messageEl.textContent = "";
    messageEl.style.color = "#d22";

    // 1️⃣ Check if the cart is empty
    // getCart() returns an object from localStorage
    const cart = getCart();
    if (Object.keys(cart).length === 0) {
      messageEl.textContent = "Your cart is empty.";
      return;
    }

    // 2️⃣ Read form fields and trim whitespace
    const fullName = document.getElementById("full-name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const email = document.getElementById("email").value.trim();
    const city = document.getElementById("city").value.trim();
    const address = document.getElementById("address").value.trim();
    const cardLast4 = document.getElementById("card-last4").value.trim();
    const termsChecked = document.getElementById("terms").checked;

    // 3️⃣ Basic client-side validations

    // Check that all required fields are filled
    if (!fullName || !phone || !email || !city || !address) {
      messageEl.textContent = "Please fill in all required fields (*).";
      return;
    }

    // Check that a full name was entered (at least two words)
    if (fullName.split(" ").length < 2) {
      messageEl.textContent = "Please enter full name (first and last).";
      return;
    }

    // Phone format check
    if (!/^\+?\d{9,12}$/.test(phone)) {
      messageEl.textContent = "Please enter a valid phone number.";
      return;
    }

    // Email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      messageEl.textContent = "Please enter a valid email address.";
      return;
    }

    // Card last 4 digits check (if entered)
    if (cardLast4 && !/^\d{4}$/.test(cardLast4)) {
      messageEl.textContent = "Card last 4 digits must be exactly 4 numbers.";
      return;
    }

    // Check that user accepted the terms
    if (!termsChecked) {
      messageEl.textContent = "You must accept the terms to place an order.";
      return;
    }

    // 4️⃣ Build the list of ordered products from the cart
    // Object.entries iterates over each item in the cart
    const items = Object.entries(cart).map(([id, item]) => ({
      // Product ID
      productId: id,

      // Product Name
      name: item.name,

      // Price per unit
      price: item.price,

      // Selected quantity
      quantity: item.quantity,

      // Line total (price * quantity)
      lineTotal: item.price * item.quantity,
    }));

    // Calculate total order amount
    const total = items.reduce((sum, it) => sum + it.lineTotal, 0);

    // 5️⃣ Build the order payload object to send to the server
    const orderPayload = {
      customer: {
        full_name: fullName,
        phone,
        email,
        city,
        address,
        zip: document.getElementById("zip")?.value.trim() || "",
        notes: document.getElementById("notes")?.value.trim() || "",
      },
      // Array of items in the order
      items,

      // Total amount
      total,

      // Order creation timestamp
      createdAt: new Date().toISOString(),
    };

    // 6️⃣ Send order to the server
    try {
      // Update UI – loading state
      messageEl.style.color = "#333";
      messageEl.textContent = "Placing order...";

      // Send POST request to the server using fetch
      const resp = await fetch("/order", {
        method: "POST",
        headers: {
          // Indicates data is sent as JSON
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderPayload),
      });

      // Parse server response
      const data = await resp.json();

      // Check if server returned an error
      if (!resp.ok || !data.success) {
        messageEl.style.color = "#d22";
        messageEl.textContent =
          data.message || "Something went wrong. Please try again.";
        return;
      }

      // 7️⃣ Success – server confirmed the order
      messageEl.style.color = "green";
      messageEl.textContent = `Thank you! Order #${data.orderId} has been placed.`;

      // Clear application state
      localStorage.removeItem("cart");      // Clear cart
      clearFormDraft("checkout-form");      // Clear form draft
      updateCartCount();                    // Update cart counter
      renderCheckout();                     // Re-render checkout
      form.reset();                         // Reset form

    } catch (err) {
      // 8️⃣ Network error / server unreachable handling
      messageEl.style.color = "#d22";
      messageEl.textContent =
        "Cannot reach server. Is it running on localhost:3000?";
    }
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
document.addEventListener("DOMContentLoaded", async () => {
  updateCartCount();

  try {
    PRODUCTS = await loadProductsFromServer();
  } catch (err) {
    console.error("Failed to load products from server:", err);
    PRODUCTS = {}; // No fallback – just no products
  }

  // Now that PRODUCTS is loaded, rendering is allowed:
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
