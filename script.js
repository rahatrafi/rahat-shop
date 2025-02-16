const cartButton = document.getElementById('cart-button');
const cartSidebar = document.querySelector('.cart-sidebar');
const cartCount = document.getElementById('cart-count');
const cartItemsContainer = document.getElementById('cart-items');
const closeCartButton = document.getElementById('close-cart');
const overlay = document.getElementById('overlay');
const productGrid = document.getElementById('product-grid');
const cartSubtotal = document.getElementById('cart-subtotal');
const clearCartButton = document.getElementById('clear-cart');
let cart = [];

// Fetch and display products
async function fetchProducts() {
  try {
    const response = await fetch('product.json');
    const data = await response.json();
    const books = data.map(book => ({
      id: book.isbn13,
      title: book.title,
      description: book.subtitle,
      image: book.image,
      price: book.price.replace("$", ""),
    }));
    displayProducts(books);
    updateCart();
  } catch (error) {
    console.error("Error loading products:", error);
    productGrid.innerHTML = `<p class="text-center text-danger">Failed to load products. Please try again later.</p>`;
  }
}

// Display products in grid
function displayProducts(products) {
  productGrid.innerHTML = products
    .map(
      product => `
      <div class="col-12 col-md-6 col-lg-3 mb-4">
        <div class="card">
          <img src="${product.image}" class="card-img-top" alt="${product.title}">
          <div class="card-body">
            <h5 class="card-title">${product.title}</h5>
            <p class="card-text text-muted small">${product.description.substring(0, 80)}...</p>
            <div class="d-flex justify-content-between align-items-center">
              <p class="card-text fw-bold mb-0">$${product.price}</p>
              <button class="btn btn-md add-to-cart py-2 px-3" data-product='${JSON.stringify(product).replace(/'/g, "&#39;")}'>
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    `
    )
    .join('');
  addCartEventListeners();
}

// Add event listeners to "Add to Cart" buttons
function addCartEventListeners() {
  document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', () => {
      const product = JSON.parse(button.dataset.product.replace(/&#39;/g, "'"));
      addToCart(product);
    });
  });
}

// Add product to cart
function addToCart(product) {
  const existingItem = cart.find(item => item.id === product.id);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  updateCart();
  cartSidebar.classList.add('active');
  overlay.classList.add('active');
}

// Update cart
function updateCart() {
  cartItemsContainer.innerHTML = '';
  let totalItems = 0;
  let subtotal = 0;
  const orderSummaryDetails = document.getElementById('order-summary-details');
  orderSummaryDetails.innerHTML = '';
  const cartSummary = document.getElementById('cart-summary');

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `<h4 class="text-center text-muted">Cart is currently empty</h4>`;
    cartSubtotal.innerText = '0.00';
    cartCount.innerText = '0';
    clearCartButton.style.display = 'none';
    cartSummary.style.display = 'none';
  } else {
    cartSummary.style.display = 'block';
    clearCartButton.style.display = 'block';
  }

  cart.forEach((item, index) => {
    totalItems += item.quantity;
    const itemTotal = parseFloat(item.price) * item.quantity;
    subtotal += itemTotal;

    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item';
    cartItem.innerHTML = `
      <div class="d-flex ">
        <img src="${item.image}" alt="${item.title}">
        <div class="ms-3 ">
          <h6 class="mb-1 small">${item.title}</h6>
          <p class="mb-2">$${item.price}</p>
          <div class="d-flex align-items-center gap-2">
            <button class="btn btn-sm btn-outline-secondary" onclick="changeQuantity(${index}, -1)">
              <i class="bi bi-dash fs-5"></i>
            </button>
            <span class="quantity-display px-3 py-1 fs-5">${item.quantity}</span>
            <button class="btn btn-sm btn-outline-secondary" onclick="changeQuantity(${index}, 1)">
              <i class="bi bi-plus fs-5"></i>
            </button>
            <button class="btn btn-sm remove-btn ms-2" onclick="removeItem(${index})">
              <i class="bi bi-trash fs-5"></i>
            </button>
          </div>
        </div>
      </div>
    `;
    cartItemsContainer.appendChild(cartItem);

    const orderSummaryItem = document.createElement('div');
    orderSummaryItem.className = 'd-flex justify-content-between align-items-center mb-2';
    orderSummaryItem.innerHTML = `
      <span>${item.title}<br>${item.quantity} × $${item.price}</span>
      <span>$${itemTotal.toFixed(2)}</span>
    `;
    orderSummaryDetails.appendChild(orderSummaryItem);
  });

  cartCount.innerText = totalItems;
  cartSubtotal.innerText = subtotal.toFixed(2);
}

// Toggle cart sidebar
cartButton.addEventListener('click', () => {
  updateCart();
  const cartSummary = document.getElementById('cart-summary');
  cartSummary.style.display = cart.length === 0 ? 'none' : 'block';
  cartSidebar.classList.toggle('active');
  overlay.classList.toggle('active');
});

// Close cart sidebar
closeCartButton.addEventListener('click', () => {
  cartSidebar.classList.remove('active');
  overlay.classList.remove('active');
});

// Hide sidebar on overlay click
overlay.addEventListener('click', () => {
  cartSidebar.classList.remove('active');
  overlay.classList.remove('active');
});

// Adjust item quantity
function changeQuantity(index, change) {
  cart[index].quantity += change;
  if (cart[index].quantity < 1) cart[index].quantity = 1;
  updateCart();
}

// Remove item from cart
function removeItem(index) {
  cart.splice(index, 1);
  updateCart();
}

// Clear cart
clearCartButton.addEventListener('click', () => {
  cart = [];
  updateCart();
});

// Initialize products on page load
fetchProducts();