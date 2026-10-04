// BACKEND/routes/orderRoutes.js

const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// 1. GET all orders (Newest first)
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. GET single order details by ID (Isay upar Shift kar diya hai)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: 'Order ID not found.' });
    }

    res.json(order);
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid Order ID format.' });
    }
    res.status(500).json({ message: err.message });
  }
});

// 3. POST create new order
router.post('/', async (req, res) => {
  try {
    const { 
      customerName, 
      email, 
      phone, 
      address, 
      items, 
      cartItems, 
      totalAmount, 
      totalPrice, 
      status 
    } = req.body;

    const finalItems = items || cartItems || [];
    const finalTotal = totalAmount !== undefined ? totalAmount : (totalPrice || 0);

    if (!customerName || finalItems.length === 0) {
      return res.status(400).json({ 
        message: 'Customer name and items are required to place an order!' 
      });
    }

    // Capitalize first letter to keep consistency
    const formattedStatus = status 
      ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() 
      : 'Pending';

    const newOrder = new Order({
      customerName,
      email: email || '',
      phone: phone || '',
      address: address || '',
      items: finalItems,
      totalAmount: Number(finalTotal),
      status: formattedStatus
    });

    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);

  } catch (err) {
    console.error('Create Order Error:', err);
    res.status(400).json({ message: err.message });
  }
});

// 4. PATCH update order status (Supports both Title Case & Lower Case input)
router.patch('/:id/status', async (req, res) => {
  try {
    let { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status field is required.' });
    }

    // Standardize to Title Case (e.g., "shipped" -> "Shipped")
    const formattedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

    const allowedStatuses = ['Pending', 'Shipped', 'Delivered', 'Cancelled'];
    if (!allowedStatuses.includes(formattedStatus)) {
      return res.status(400).json({ 
        message: `Invalid status. Allowed values: ${allowedStatuses.join(', ')}` 
      });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status: formattedStatus },
      { new: true, runValidators: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    res.status(200).json({
      message: 'Order status updated successfully',
      order: updatedOrder
    });
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid Order ID format.' });
    }
    res.status(400).json({ message: err.message });
  }
});

// 5. DELETE order
router.delete('/:id', async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);
    if (!deletedOrder) {
      return res.status(404).json({ message: 'Order not found.' });
    }
    res.status(200).json({ message: 'Order deleted successfully.' });
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid Order ID format.' });
    }
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;