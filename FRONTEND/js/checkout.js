// Local Config
const BASE_URL = typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : 'http://localhost:5000/api';

// 1. LocalStorage se Cart Fetching
function getCart() {
  try {
    const data = localStorage.getItem('cart') || localStorage.getItem('cartItems');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Cart Parsing Error:", e);
    return [];
  }
}

// 2. Render Cart Items & Grand Total
function renderCartItems() {
  const cart = getCart();
  const tbody = document.getElementById('cartTableBody') || document.getElementById('cartItems');
  const grandTotalEl = document.getElementById('cartGrandTotal') || document.getElementById('cartTotal');
  const badge = document.getElementById('cart-count');

  // Update Navbar Badge
  if (badge) {
    const totalCount = cart.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
    badge.textContent = totalCount;
  }

  if (!tbody) return;

  if (cart.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 2rem; color: #64748b;">
          Your Cart is Empty! 🛒<a href="index.html" style="color: #2563eb; font-weight: bold;">Shop Products ➔</a>
        </td>
      </tr>`;
    if (grandTotalEl) grandTotalEl.textContent = 'Rs. 0';
    return;
  }

  let grandTotal = 0;
  tbody.innerHTML = cart.map((item, index) => {
    const name = item.name || item.productName || item.title || 'Product';
    const price = Number(item.price) || 0;
    const qty = Number(item.quantity || item.qty) || 1;
    const itemTotal = price * qty;
    const image = item.image || item.img || 'https://via.placeholder.com/50';

    grandTotal += itemTotal;

    return `
      <tr>
        <td>
          <div style="display: flex; align-items: center; gap: 8px;">
            <img src="${image}" alt="${name}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;">
            <span><strong>${name}</strong></span>
          </div>
        </td>
        <td>Rs. ${price.toLocaleString()}</td>
        <td>
          <input 
            type="number" 
            value="${qty}" 
            min="1" 
            style="width: 50px; text-align: center; padding: 3px;" 
            onchange="updateItemQty(${index}, this.value)"
          >
        </td>
        <td>Rs. ${itemTotal.toLocaleString()}</td>
        <td>
          <button onclick="removeCartItem(${index})" style="background: #ef4444; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer;">✕</button>
        </td>
      </tr>
    `;
  }).join('');

  if (grandTotalEl) {
    grandTotalEl.textContent = `Rs. ${grandTotal.toLocaleString()}`;
  }
}

// 3. Global Handlers for Quantity & Removal
window.updateItemQty = function(index, newQty) {
  let cart = getCart();
  const qty = parseInt(newQty);
  if (qty > 0) {
    cart[index].quantity = qty;
  } else {
    cart.splice(index, 1);
  }
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCartItems();
};

window.removeCartItem = function(index) {
  let cart = getCart();
  cart.splice(index, 1);
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCartItems();
};

// 4. Order Place Submit Function
async function handleOrderSubmission(e) {
  if (e) e.preventDefault();

  const cart = getCart();

  if (!cart || cart.length === 0) {
    alert('Your Cart is Empty! 🛒');
    return;
  }

  // Input Field Values (DOM Elements Safety Fallback)
  const nameInput = document.getElementById('custName') || document.getElementById('name') || document.getElementById('customerName');
  const phoneInput = document.getElementById('custPhone') || document.getElementById('phone');
  const addressInput = document.getElementById('custAddress') || document.getElementById('address');

  const nameVal = nameInput ? nameInput.value.trim() : '';
  const phoneVal = phoneInput ? phoneInput.value.trim() : '';
  const addressVal = addressInput ? addressInput.value.trim() : '';

  // Validation Check
  if (!nameVal || !phoneVal || !addressVal) {
    alert('All fields (Name, Phone, Address) are required!');
    return;
  }

  // Safe Items Mapping
  const formattedItems = cart.map(item => ({
    productName: item.name || item.productName || item.title || "Product",
    price: Number(item.price) || 0,
    quantity: Number(item.quantity || item.qty) || 1
  }));

  const totalCalculated = formattedItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);

  // Exact Payload matching Mongoose Schema requirements
  const orderPayload = {
    customerName: nameVal, // Mongoose Schema Required Field
    name: nameVal,         // Double Fallback
    phone: phoneVal,
    address: addressVal,
    items: formattedItems,
    totalAmount: totalCalculated
  };

  console.log("Sending Payload to Server:", orderPayload);

  try {
    const res = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Backend Error Detail:", data);
      throw new Error(data.message || 'Server validation failed.');
    }

    alert('🎉 Order placed successfully!');
    localStorage.removeItem('cart');
    localStorage.removeItem('cartItems');

    const orderId = data.orderId || data._id || data.order?._id || '';
    if (orderId) {
      window.location.href = `order-success.html?orderId=${encodeURIComponent(orderId)}`;
    } else {
      window.location.href = 'index.html';
    }

  } catch (err) {
    console.error('Checkout Submit Error:', err);
    alert(`Order Failed: ${err.message}`);
  }
}
// 5. DOM Initialization
document.addEventListener('DOMContentLoaded', () => {
  renderCartItems();

  const form = document.getElementById('checkoutForm') || document.getElementById('orderForm') || document.querySelector('form');
  if (form) {
    form.addEventListener('submit', handleOrderSubmission);
  }
});