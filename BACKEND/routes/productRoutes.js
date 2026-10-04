const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// POST new product (Safe Parsing & Fallbacks)
router.post('/', async (req, res) => {
  try {
    const { name, productName, price, category, description, image, productImage, img } = req.body;

    const finalName = (name || productName || '').toString().trim();
    const parsedPrice = price !== undefined && price !== null ? Number(price) : NaN;

    if (!finalName) {
      return res.status(400).json({ message: 'Product validation failed: name is required.' });
    }

    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return res.status(400).json({ message: 'Product validation failed: price must be a valid number greater than 0.' });
    }

    // ✅ Image handling with all possible fallbacks
    const finalImage = image || productImage || img || '';

    const productData = {
      name: finalName,
      price: parsedPrice,
      category: (category || 'General').toString().trim(),
      description: (description || '').toString().trim(),
      image: finalImage,
      productImage: finalImage // Agar Mongoose Schema mein productImage rakha ho
    };

    const newProduct = new Product(productData);
    const savedProduct = await newProduct.save();

    res.status(201).json(savedProduct);

  } catch (err) {
    console.error('Save Product Error:', err);
    res.status(400).json({ message: err.message });
  }
});

// DELETE product
router.delete('/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;