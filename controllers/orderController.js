const Order = require('../models/orderModel');
const catchAsync = require('../utills/catchAsync');
const OrderItem = require('../models/orderItemModel');
const AppError = require('../utills/AppError')

 // Load from .env

// Create Payment Intent for Stripe
exports.createPaymentIntent = catchAsync(async (req, res, next) => {
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  const { amount, currency = 'usd' } = req.body; // Amount in dollars

  if (!amount) {
    return next(new AppError('Amount is required', 400));
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to cents
    currency,
    automatic_payment_methods: { enabled: true }, // Enables cards
    metadata: { userId: req.user?._id?.toString() || 'guest' }, // Optional metadata
  });

  res.status(200).json({
    status: 'success',
    clientSecret: paymentIntent.client_secret,
  });
});

// Create Order (called after successful payment confirmation on frontend)
exports.createOrder = catchAsync(async (req, res, next) => {
  const { orderItems: orderItemsData, shippingAddress, paymentMethod, totalPrice, stripePaymentIntentId } = req.body;

  if (!orderItemsData || orderItemsData.length === 0) {
    return next(new AppError('Order items are required', 400));
  }

  // 1. Create order items and insert into DB
  const createdOrderItems = await OrderItem.insertMany(orderItemsData);

  // 2. Create order using the IDs of created OrderItems
  const order = await Order.create({
    user: req.user?._id || null, // Assume auth; handle guest if needed
    orderItems: createdOrderItems.map(item => item._id),
    shippingAddress,
    paymentMethod,
    totalPrice,
    paymentStatus: 'paid', // Set to paid since payment succeeded
    stripePaymentIntentId, // Track the Payment Intent ID
  });

  // 3. Respond to client
  res.status(201).json({
    status: 'success',
    data: {
      order
    }
  });
});

// GET all Orders (admin only)
exports.getAllOrders = catchAsync(async (req, res, next) => {
  const orders = await Order.find()
    .populate('user', 'name email photo')
    .populate({
      path: 'orderItems',
      populate: { path: 'product', select: 'name price' },
    });

  res.status(200).json({
    status: 'success',
    results: orders.length,
    data: { orders },
  });
});

// GET single order (user or admin)
exports.getOrderById = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email photo')
    .populate({
      path: 'orderItems',
      populate: { path: 'product', select: 'name price ratingsAverage imageCover images ' },
    });

  if (!order) return next(new AppError('No order found with that ID', 404));

  res.status(200).json({
    status: 'success',
    data: { order },
  });
});

// UPDATE order delivery status (admin only)
exports.updateOrderToDelivered = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) return next(new AppError('No order found with that ID', 404));

  order.isDelivered = true;
  order.deliveredAt = Date.now();
  await order.save();

  res.status(200).json({
    status: 'success',
    message: 'Order marked as delivered',
  });
});

// Get order history for the logged-in user
exports.getOrderHistoryForUser = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const orders = await Order.find({ user: userId })
    .populate('user', 'name email photo')
    .populate({
      path: 'orderItems',
      populate: { path: 'product', select: 'name price ratingsAverage imageCover images description category ratingsQuantity' },
    });

  res.status(200).json({
    status: 'success',
    results: orders.length,
    data: { orders },
  });
});