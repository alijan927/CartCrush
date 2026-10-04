const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// 1. Middlewares (50MB Limit Configured for Large Base64 Image Uploads)
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 2. Serve Static Frontend Files
app.use(express.static(path.join(__dirname, '../FRONTEND')));

// 3. API Routes (MUST be defined before HTML fallback routes)
app.get('/api', (req, res) => {
  res.json({ message: 'CartCrush API is running successfully 🚀' });
});

app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));

// 4. Direct HTML Page Routes
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../FRONTEND/admin.html'));
});

app.get('/my-orders', (req, res) => {
  res.sendFile(path.join(__dirname, '../FRONTEND/my-orders.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../FRONTEND/home.html'));
});

// 5. 404 JSON Handler for API Endpoints (Prevents unexpected HTML response on API calls)
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: `API Endpoint ${req.originalUrl} not found.` });
});

// 6. MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cartcrush';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// 7. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📦 Admin Panel link: http://localhost:${PORT}/admin`);
});