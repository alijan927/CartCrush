const API_BASE_URL = window.API_BASE_URL || 'http://localhost:5000/api';

async function fetchMyOrders() {
  try {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      cache: 'no-store'
    });
    
    // Safety check for HTML response
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Server returned HTML instead of JSON. Check backend API URL!');
    }

    const data = await response.json();
    console.log('My Orders:', data);
    
  } catch (err) {
    console.error('Tracking Error:', err.message);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  setupTrackingForm();

  // URL parameters se auto-fill Order ID Check (e.g., my-orders.html?orderId=66f...)
  const urlParams = new URLSearchParams(window.location.search);
  const autoOrderId = urlParams.get('orderId') || urlParams.get('id');

  if (autoOrderId) {
    const input = document.getElementById('orderIdInput');
    const form = document.getElementById('trackOrderForm');
    if (input) {
      input.value = autoOrderId;
      // Auto submit form to show order details immediately
      if (form) form.dispatchEvent(new Event('submit'));
    }
  }
});

function updateCartBadge() {
  const badge = document.getElementById('cart-count');
  if (!badge) return;
  try {
    const rawCart = localStorage.getItem('cart') || localStorage.getItem('cartItems');
    const cart = rawCart ? JSON.parse(rawCart) : [];
    const count = Array.isArray(cart) 
      ? cart.reduce((sum, item) => sum + (Number(item.quantity || item.qty) || 1), 0) 
      : 0;
    badge.textContent = count;
  } catch (e) {
    badge.textContent = 0;
  }
}

function setupTrackingForm() {
  const form = document.getElementById('trackOrderForm');
  const input = document.getElementById('orderIdInput');
  const resultDiv = document.getElementById('orderResult');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    // 🛑 Page Reload ko Rokne ke liye
    e.preventDefault();
    e.stopPropagation();

    const orderId = input ? input.value.trim() : '';

    if (!orderId) {
      alert('Please enter a valid Order ID.');
      return;
    }

    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `<p style="text-align: center; color: #2563eb; font-weight: bold; padding: 1rem;">⌛ Searching order details...</p>`;

    try {
      // Added timestamp parameter & cache headers to ALWAYS fetch fresh status from DB
      const res = await fetch(`${API_BASE_URL}/orders/${orderId}?t=${Date.now()}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Order not found. Please check the Order ID.');
      }

      const order = data.order || data;
      renderOrderDetails(order);

    } catch (err) {
      console.error('Tracking Error:', err);
      resultDiv.innerHTML = `
        <div style="background: #fef2f2; color: #991b1b; padding: 1rem; border-radius: 6px; text-align: center; border: 1px solid #fca5a5;">
          ⚠️ ${err.message}
        </div>`;
    }
  });
}

function renderOrderDetails(order) {
  const resultDiv = document.getElementById('orderResult');

  // Case-Insensitive Status Normalization
  const rawStatus = (order.status || 'Pending').trim();
  const formattedStatus = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase();

  const statusColorMap = {
    'Pending': '#f59e0b',
    'Processing': '#3b82f6',
    'Shipped': '#8b5cf6',
    'Delivered': '#10b981',
    'Cancelled': '#ef4444'
  };

  const statusColor = statusColorMap[formattedStatus] || '#64748b';

  const customerName = order.customerName || order.customer?.name || order.name || 'N/A';
  const customerPhone = order.phone || order.customer?.phone || 'N/A';
  const customerAddress = order.address || order.customer?.address || 'N/A';

  // Items List mapping with Image & Product Name Fallbacks
  const itemsList = (order.items || []).map(i => {
    const productName = i.productName || i.name || i.title || 'Product';
    const productImage = i.image || i.img || i.productImage || 'https://via.placeholder.com/60?text=No+Image';
    const price = Number(i.price) || 0;
    const qty = Number(i.quantity || i.qty) || 1;
    const itemTotal = price * qty;

    return `
      <li style="display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px dashed #cbd5e1;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <img 
            src="${productImage}" 
            alt="${productName}" 
            style="width: 50px; height: 50px; object-fit: cover; border-radius: 6px; border: 1px solid #e2e8f0;"
            onerror="this.src='https://via.placeholder.com/60?text=No+Image';"
          />
          <div>
            <strong style="font-size: 0.95rem; color: #0f172a; display: block;">${productName}</strong>
            <span style="font-size: 0.85rem; color: #64748b;">Qty: ${qty} × Rs. ${price.toLocaleString()}</span>
          </div>
        </div>
        <span style="font-weight: bold; color: #1e293b;">Rs. ${itemTotal.toLocaleString()}</span>
      </li>
    `;
  }).join('');

  resultDiv.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
      <h3 style="margin: 0;">Order #${order._id || order.orderId}</h3>
      <span style="background: ${statusColor}; color: white; padding: 4px 12px; border-radius: 20px; font-weight: bold; font-size: 0.85rem;">
        ${formattedStatus}
      </span>
    </div>

    <div style="background: #f8fafc; padding: 1rem; border-radius: 6px; margin-bottom: 1rem; border: 1px solid #e2e8f0;">
      <p style="margin: 4px 0;"><strong>Customer:</strong> ${customerName}</p>
      <p style="margin: 4px 0;"><strong>Phone:</strong> ${customerPhone}</p>
      <p style="margin: 4px 0;"><strong>Address:</strong> ${customerAddress}</p>
      <p style="margin: 4px 0;"><strong>Payment:</strong> ${order.paymentMethod || 'COD'}</p>
    </div>

    <h4 style="margin-bottom: 0.5rem; color: #334155;">Ordered Items:</h4>
    <ul style="list-style: none; padding: 0; margin-bottom: 1rem;">
      ${itemsList || '<li style="color: #64748b;">No item details found</li>'}
    </ul>

    <div style="text-align: right; font-size: 1.15rem; font-weight: bold; border-top: 2px solid #e2e8f0; padding-top: 0.8rem;">
      Total Amount: <span style="color: #2563eb;">Rs. ${(order.totalAmount || order.totalPrice || 0).toLocaleString()}</span>
    </div>
  `;
}