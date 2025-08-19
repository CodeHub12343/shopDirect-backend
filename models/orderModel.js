/* const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Order must belong to a user'],
    },
    orderItems: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'OrderItem',
        required: true,
      },
    ],
    shippingAddress: {
      address: String,
      city: String,
      postalCode: String,
      country: String,
    },
    paymentMethod: String,
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'completed'],
      default: 'pending',
    },
    isDelivered: {
      type: Boolean,
      default: false,
    },
    deliveredAt: Date,
    totalPrice: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
 */

const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Order must belong to a user'],
    },
    orderItems: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'OrderItem',
        required: true,
      },
    ],
    shippingAddress: {
      address: String,
      city: String,
      postalCode: String,
      country: String,
    },
    paymentMethod: String,
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'completed'],
      default: 'pending',
    },
    stripePaymentIntentId: { // New field to track Stripe Payment Intent
      type: String,
    },
    isDelivered: {
      type: Boolean,
      default: false,
    },
    deliveredAt: Date,
    totalPrice: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;