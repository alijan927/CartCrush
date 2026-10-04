// ✅ 1. SINGLE INLINE SVG PLACEHOLDER (No connection errors)
var DEFAULT_NO_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='50' height='50' viewBox='0 0 50 50'%3E%3Crect width='50' height='50' fill='%23e2e8f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='10' fill='%2364748b'%3ENo Img%3C/text%3E%3C/svg%3E";

const API_BASE_URL = 'http://localhost:5000/api';

// SINGLE INITIALIZATION ON PAGE LOAD
document.addEventListener('DOMContentLoaded', () => {
  setupAddProductForm();
  loadAdminStats();
  loadAdminProducts();
  loadAdminOrders();
});

// -------------------------------------------------------------
// 1. ADD PRODUCT FORM HANDLER
// -------------------------------------------------------------
function setupAddProductForm() {
  const addProductForm = document.getElementById('addProductForm');
  if (!addProductForm) return;

  // Duplicate Event Listeners Fix: Replace form clone
  const newForm = addProductForm.cloneNode(true);
  addProductForm.parentNode.replaceChild(newForm, addProductForm);

  newForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = newForm.querySelector('button[type="submit"]') || newForm.querySelector('button');
    if (submitBtn && submitBtn.disabled) return;

    // Read Inputs
    const nameInput = document.getElementById('pName') || document.getElementById('productName');
    const priceInput = document.getElementById('pPrice') || document.getElementById('productPrice');
    const categoryInput = document.getElementById('pCategory') || document.getElementById('productCategory');
    const descInput = document.getElementById('pDescription') || document.getElementById('productDescription');
    
    // File & URL Inputs
    const fileInput = document.getElementById('pImageFile');
    const urlInput = document.getElementById('pImageUrl');

    const name = nameInput ? nameInput.value.trim() : '';
    const price = priceInput ? parseFloat(priceInput.value) : NaN;
    const category = categoryInput && categoryInput.value.trim() ? categoryInput.value.trim() : 'General';
    const description = descInput ? descInput.value.trim() : '';
    const imageUrl = urlInput ? urlInput.value.trim() : '';

    // Validations
    if (!name) {
      alert('⚠️ Product Name is required!');
      return;
    }

    if (isNaN(price) || price <= 0) {
      alert('⚠️ A valid Price (greater than 0) is required!');
      return;
    }

    // Helper: File to Base64 String
    const getBase64 = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
      });
    };

    try {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = 'Uploading...';
      }

      let finalImg = '';

      if (fileInput && fileInput.files && fileInput.files[0]) {
        if (fileInput.files[0].size > 5 * 1024 * 1024) {
          alert('⚠️️ Image file size exceeds 5MB limit.');
          return;
        }
        finalImg = await getBase64(fileInput.files[0]);
      } else if (imageUrl !== '') {
        finalImg = imageUrl;
      } else {
        finalImg = typeof DEFAULT_NO_IMG !== 'undefined' ? DEFAULT_NO_IMG : '';
      }

      const productData = {
        name: name,
        productName: name,
        price: price,
        category: category,
        description: description,
        image: finalImg,
        productImage: finalImg,
        img: finalImg
      };

      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });

      const contentType = response.headers.get('content-type');
      let data;
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        throw new Error('Server returned non-JSON response.');
      }

      if (!response.ok) {
        throw new Error(data.message || 'Product could not be saved.');
      }

      alert('✅ Product uploaded successfully!');
      newForm.reset();
      
      loadAdminProducts();
      loadAdminStats();

    } catch (err) {
      console.error('Upload Error:', err);
      alert(`⚠️ Upload Error: ${err.message}`);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerText = 'Upload Product';
      }
    }
  });
}

// -------------------------------------------------------------
// 2. LOAD PRODUCTS TABLE
// -------------------------------------------------------------
async function loadAdminProducts() {
  const tableBody = document.getElementById('adminProductsTableBody');
  if (!tableBody) return;

  tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 1rem;">Loading products...</td></tr>`;

  try {
    const res = await fetch(`${API_BASE_URL}/products`);
    const data = await res.json();

    let products = Array.isArray(data) ? data : (data.products || data.data || []);

    if (products.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 1rem; color: #64748b;">No products found in database.</td></tr>`;
      return;
    }

    window.adminProductsList = products;
    renderProductsTable(products);

  } catch (err) {
    console.error('Fetch Products Error:', err);
    tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: red; padding: 1rem;">Error loading products: ${err.message}</td></tr>`;
  }
}

// RENDER PRODUCTS TABLE
function renderProductsTable(products) {
  const tableBody = document.getElementById('adminProductsTableBody');
  if (!tableBody) return;

  tableBody.innerHTML = products.map(p => {
    const pId = p._id || p.id;
    const pName = p.name || p.productName || 'Unnamed Product';
    const pCategory = p.category || 'General';
    const pPrice = Number(p.price) || 0;
    const pImg = p.image || p.productImage || DEFAULT_NO_IMG;

    return `
      <tr>
        <td>
          <img 
            src="${pImg}" 
            alt="${pName}" 
            style="width: 45px; height: 45px; object-fit: cover; border-radius: 6px; border: 1px solid #cbd5e1;" 
            onerror="this.onerror=null; this.src='${DEFAULT_NO_IMG}';" 
          />
        </td>
        <td><strong>${pName}</strong></td>
        <td><span style="background: #e2e8f0; padding: 3px 8px; border-radius: 4px; font-size: 0.85rem;">${pCategory}</span></td>
        <td>Rs. ${pPrice.toLocaleString()}</td>
        <td>
          <button onclick="deleteProduct('${pId}')" style="background: #ef4444; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-weight: bold;">
            Delete
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

// FILTER PRODUCTS
window.filterAdminProducts = function() {
  const searchVal = (document.getElementById('productSearchInput')?.value || '').toLowerCase();
  const categoryVal = document.getElementById('productCategoryFilter')?.value || 'ALL';

  if (!window.adminProductsList) return;

  const filtered = window.adminProductsList.filter(p => {
    const name = (p.name || p.productName || '').toLowerCase();
    const category = (p.category || '').toLowerCase();

    const matchesSearch = name.includes(searchVal);
    const matchesCategory = categoryVal === 'ALL' || category === categoryVal.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  renderProductsTable(filtered);
};

// DELETE PRODUCT
window.deleteProduct = async function(productId) {
  if (!confirm('Are you sure you want to delete this product?')) return;

  try {
    const res = await fetch(`${API_BASE_URL}/products/${productId}`, {
      method: 'DELETE'
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || 'Product delete nahi ho saka.');
    }

    alert('✅ Product deleted successfully!');
    loadAdminProducts();
    loadAdminStats();

  } catch (err) {
    alert(`⚠️ Delete Error: ${err.message}`);
  }
};

// -------------------------------------------------------------
// 3. LOAD STATS
// -------------------------------------------------------------
async function loadAdminStats() {
  const revElem = document.getElementById('statTotalRevenue');
  const ordElem = document.getElementById('statTotalOrders');
  const prodElem = document.getElementById('statTotalProducts');

  try {
    const prodRes = await fetch(`${API_BASE_URL}/products`);
    const prodData = await prodRes.json();
    let products = Array.isArray(prodData) ? prodData : (prodData.products || prodData.data || []);
    if (prodElem) prodElem.textContent = products.length;

    const ordRes = await fetch(`${API_BASE_URL}/orders`);
    if (ordRes.ok) {
      const ordData = await ordRes.json();
      let orders = Array.isArray(ordData) ? ordData : (ordData.orders || ordData.data || []);
      
      if (ordElem) ordElem.textContent = orders.length;

      const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.totalAmount || o.totalPrice) || 0), 0);
      if (revElem) revElem.textContent = `Rs. ${totalRevenue.toLocaleString()}`;
    }
  } catch (err) {
    console.error("Stats loading error:", err);
  }
}

// -------------------------------------------------------------
// 4. LOAD ORDERS TABLE & STATUS HANDLERS
// -------------------------------------------------------------
async function loadAdminOrders() {
  const tableBody = document.getElementById('adminOrdersTableBody');
  if (!tableBody) return;

  tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 1rem;">Loading orders...</td></tr>`;

  try {
    const res = await fetch(`${API_BASE_URL}/orders?t=${Date.now()}`);
    const data = await res.json();

    let orders = Array.isArray(data) ? data : (data.orders || data.data || []);

    if (orders.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #64748b; padding: 1rem;">No orders available.</td></tr>`;
      return;
    }

    tableBody.innerHTML = orders.map(o => {
      const oId = o._id || o.id;
      const cName = o.customerName || 'Guest Customer';
      const phone = o.phone || 'N/A';
      const itemsCount = Array.isArray(o.items) ? o.items.length : 0;
      const total = Number(o.totalAmount || o.totalPrice) || 0;
      
      // Standardize status capitalization
      const rawStatus = o.status || 'Pending';
      const status = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase();
      const orderDate = o.createdAt ? new Date(o.createdAt).toLocaleDateString() : 'N/A';

      // Status color styles matching standard ecommerce flow
      let statusColor = '#eab308'; // Pending (Yellow)
      if (status === 'Shipped') statusColor = '#3b82f6'; // Shipped (Blue)
      if (status === 'Delivered') statusColor = '#22c55e'; // Delivered (Green)
      if (status === 'Cancelled') statusColor = '#ef4444'; // Cancelled (Red)

      return `
        <tr>
          <td><small style="color: #64748b;">#${oId.slice(-6)}</small></td>
          <td><strong>${cName}</strong><br><small style="color: #64748b;">${phone}</small></td>
          <td>${itemsCount} item(s)</td>
          <td><strong>Rs. ${total.toLocaleString()}</strong></td>
          <td><small>${orderDate}</small></td>
          <td>
            <select 
              onchange="updateOrderStatus('${oId}', this.value)" 
              style="padding: 6px 10px; border-radius: 6px; border: 1px solid #cbd5e1; font-weight: bold; color: ${statusColor};"
            >
              <option value="Pending" ${status === 'Pending' ? 'selected' : ''}>Pending</option>
              <option value="Shipped" ${status === 'Shipped' ? 'selected' : ''}>Shipped</option>
              <option value="Delivered" ${status === 'Delivered' ? 'selected' : ''}>Delivered</option>
              <option value="Cancelled" ${status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
            </select>
          </td>
          <td>
            <button onclick="deleteOrder('${oId}')" style="background: #ef4444; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
              Delete
            </button>
          </td>
        </tr>
      `;
    }).join('');

  } catch (err) {
    console.error('Fetch Orders Error:', err);
    tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: red; padding: 1rem;">Failed to load orders: ${err.message}</td></tr>`;
  }
}

// UPDATE ORDER STATUS
window.updateOrderStatus = async function(orderId, newStatus) {
  try {
    const res = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Status update failed');
    }

    alert(`✅ Order status updated to "${newStatus}"`);
    loadAdminOrders();
    loadAdminStats();
  } catch (err) {
    alert(`⚠️ Status Update Error: ${err.message}`);
  }
};

// DELETE ORDER
window.deleteOrder = async function(orderId) {
  if (!confirm('Do you want to delete this order?')) return;

  try {
    const res = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      method: 'DELETE'
    });

    if (!res.ok) throw new Error('Order could not be deleted.');

    alert('✅ Order deleted successfully!');
    loadAdminOrders();
    loadAdminStats();
  } catch (err) {
    alert(`⚠️ Delete Error: ${err.message}`);
  }
};