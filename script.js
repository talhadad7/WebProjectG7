// --- cart management ---
function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || {};
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function updateCartCount() {
  const cart = getCart();
  const totalItems = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
  const countEl = document.getElementById("cart-count");
  if (countEl) countEl.textContent = totalItems;
}

function addToCart(productId, name, price) {
  const cart = getCart();
  if (!cart[productId]) {
    cart[productId] = { name, price, quantity: 1 };
  } else {
    cart[productId].quantity += 1;
  }
  saveCart(cart);
  updateCartCount();
  updateCatalogProduct(productId); // Update catalog UI
  showToast(`${name} added to cart`);
}

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

function deleteItemFromCart(productId) {
  const cart = getCart();
  delete cart[productId];
  saveCart(cart);
  updateCartCount();
  renderCheckout(); // Re-render the checkout list
  updateCatalogProduct(productId); // Update catalog UI
}

// --- setup on catalog/home page ---
function setupCatalogActions() {
  const productActions = document.querySelectorAll(".product-actions");
  productActions.forEach((container) => {
    const productId = container.dataset.productId;
    updateCatalogProduct(productId);
  });
}

function updateCatalogProduct(productId) {
  const container = document.querySelector(`.product-actions[data-product-id="${productId}"]`);
  if (!container) return;

  const cart = getCart();
  const item = cart[productId];
  const name = container.dataset.productName;
  const price = parseFloat(container.dataset.productPrice);

  if (item && item.quantity > 0) {
    // Show quantity controls
    container.innerHTML = `
      <div class="quantity-control">
        <button class="btn-adjust" data-op="remove">-</button>
        <span class="quantity-display">${item.quantity}</span>
        <button class="btn-adjust" data-op="add">+</button>
      </div>
    `;
    container.querySelector('[data-op="add"]').addEventListener("click", () => {
      addToCart(productId, name, price);
    });
    container.querySelector('[data-op="remove"]').addEventListener("click", () => {
      removeFromCart(productId);
    });
  } else {
    // Show "Add to cart" button
    container.innerHTML = `
      <button class="btn secondary-btn">
        Add to cart
      </button>
    `;
    container.querySelector("button").addEventListener("click", () => {
      addToCart(productId, name, price);
    });
  }
}

// This function is for the home page button
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
// --- render checkout page ---
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

    itemEl.querySelector('[data-op="add"]').addEventListener("click", (e) => {
      addToCart(id, item.name, item.price);
    });
    itemEl.querySelector('[data-op="remove"]').addEventListener("click", (e) => {
      removeFromCart(id);
    });
    itemEl.querySelector('[data-op="delete"]').addEventListener("click", (e) => {
      deleteItemFromCart(id);
    });

    orderList.appendChild(itemEl);
    total += item.quantity * item.price;
  });

  totalEl.textContent = `₪${total}`;
}

// --- handle checkout form ---
function setupCheckoutForm() {
  const form = document.getElementById("checkout-form");
  const messageEl = document.getElementById("order-message");
  if (!form || !messageEl) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const termsChecked = document.getElementById("terms").checked;
    if (!termsChecked) {
      messageEl.textContent = "You must accept the terms to place an order.";
      messageEl.style.color = "#d22";
      return;
    }

    messageEl.textContent = "Thank you! Your order has been placed.";
    messageEl.style.color = "green";
    localStorage.removeItem("cart");
    updateCartCount();
    renderCheckout();
    form.reset();
  });
}

// --- about page read more toggle ---
function setupAboutToggle() {
  const btn = document.getElementById("toggle-story-btn");
  const extra = document.getElementById("extra-story");
  if (!btn || !extra) return;

  btn.addEventListener("click", () => {
    extra.classList.toggle("hidden");
    btn.textContent = extra.classList.contains("hidden") ? "Read more" : "Show less";
  });
}

// --- toast message ---
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

// --- on load ---
document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  setupCatalogActions(); // For catalog page
  renderCheckout();
  setupCheckoutForm();
  setupAboutToggle();
  setupHomePageButton(); // For home page
});