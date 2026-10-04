const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, default: 'General' },
  description: { type: String, default: '' },
  image: { type: String, default: '' },
  productImage: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);