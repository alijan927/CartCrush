const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  address: { type: String, default: '' },
  items: [
    {
      productName: { type: String },
      price: { type: Number },
      quantity: { type: Number, default: 1 }
    }
  ],
  totalAmount: { type: Number, required: true },
status: {
  type: String,
  enum: ['Pending', 'Shipped', 'Delivered', 'Cancelled'],
  default: 'Pending'
}
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);