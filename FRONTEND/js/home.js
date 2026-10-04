const API_BASE_URL = 'http://localhost:5000/api';
let allProducts = [];

document.addEventListener('DOMContentLoaded', async () => {
  setupEventListeners();
  await loadProducts();
});

function setupEventListeners() {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', filterAndRenderProducts);
  }

  const categoryFilter = document.getElementById('categoryFilter');
  if (categoryFilter) {
    categoryFilter.addEventListener('change', filterAndRenderProducts);
  }
}

async function loadProducts() {
  const container = document.getElementById('productsContainer');
  
  try {
    const res = await fetch(`${API_BASE_URL}/products`);
    
    if (!res.ok) {
      throw new Error(`Server status ${res.status}`);
    }

    const data = await res.json();
    allProducts = Array.isArray(data) ? data : (data.products || []);

    populateCategories(allProducts);
    renderProducts(allProducts);
    updateCartBadge();

  } catch (err) {
    console.error('Error fetching products:', err);
    if (container) {
      container.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 2rem;">
          <p style="color: #dc2626; font-weight: bold; font-size: 1.1rem; margin-bottom: 0.5rem;">
            ⚠️ Products are not loading!
          </p>
          <p style="color: #64748b;">
            Check that your Node.js Backend Server is running (on Port 5000).
          </p>
        </div>`;
    }
  }
}

function populateCategories(products) {
  const categoryFilter = document.getElementById('categoryFilter');
  if (!categoryFilter) return;

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
  categoryFilter.innerHTML = '<option value="ALL">All Categories</option>';
  
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });
}

function filterAndRenderProducts() {
  const searchTerm = document.getElementById('searchInput')?.value.toLowerCase().trim() || '';
  const selectedCategory = document.getElementById('categoryFilter')?.value || 'ALL';

  const filtered = allProducts.filter(p => {
    const productName = (p.name || p.productName || '').toLowerCase();
    const productDesc = (p.description || '').toLowerCase();
    const matchesSearch = productName.includes(searchTerm) || productDesc.includes(searchTerm);
    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  renderProducts(filtered);
}

function renderProducts(products) {
  const container = document.getElementById('productsContainer');
  if (!container) return;

  if (!products || products.length === 0) {
    container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #64748b; padding: 2rem;">No Any Product Is Available</p>';
    return;
  }

  container.innerHTML = products.map(product => createProductCardHTML(product)).join('');
}

// Product Card HTML Generator Function
function createProductCardHTML(product) {
  if (!product) return '';

  const id = product._id || product.id || '';
  const name = product.name ? product.name.replace(/'/g, "\\'") : 'Untitled Product';
  const price = Number(product.price) || 0;
  const image = product.image || product.productImage || 'https://via.placeholder.com/200?text=No+Image';

  return `
    <div class="product-card" style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; background: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.05); display: flex; flex-direction: column; justify-content: space-between;">
      <div>
        <img 
          src="${image}" 
          alt="${name}" 
          onerror="this.onerror=null; this.src='https://via.placeholder.com/200?text=No+Image';" 
          style="width: 100%; height: 180px; object-fit: cover; border-radius: 6px; margin-bottom: 10px;"
        >
        <h3 style="font-size: 1.1rem; margin-bottom: 5px; color: #0f172a;">${product.name || 'Untitled'}</h3>
        <p style="font-weight: bold; color: #2563eb; margin-bottom: 12px;">Rs. ${price.toLocaleString()}</p>
      </div>

      <button 
        onclick="addToCart('${id}', '${name}', ${price}, '${image}')"
        style="background: #3b82f6; color: white; border: none; padding: 10px; border-radius: 6px; font-weight: bold; cursor: pointer; width: 100%;"
      >
        Add to Cart
      </button>
    </div>
  `;
}

// Single Consolidated Add To Cart Function
function addToCart(id, name, price, image) {
  if (!id || !name) {
    console.error("Invalid Product Data:", { id, name, price, image });
    alert("Error: Product details could not be loaded.");
    return;
  }

  let cart = JSON.parse(localStorage.getItem('cart')) || [];

  const index = cart.findIndex(item => (item.id === id || item._id === id));

  if (index > -1) {
    cart[index].quantity = (cart[index].quantity || 1) + 1;
  } else {
    cart.push({
      id: id,
      _id: id,
      name: name,
      price: Number(price) || 0,
      image: image || 'https://via.placeholder.com/150',
      quantity: 1
    });
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartBadge();

  alert(`🎉 "${name}" has been added to the cart!`);
}

function updateCartBadge() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const badge = document.getElementById('cart-count');
  if (badge) badge.textContent = count;
}