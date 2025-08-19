const OrderItem = require('./../models/orderItemModel');
const catchAsync = require('./../utills/catchAsync');
const AppError = require('./../utills/AppError');

// Create a new OrderItem
exports.createOrderItem = catchAsync(async (req, res, next) => {
  const orderItem = await OrderItem.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      orderItem,
    },
  });
});

// Get all OrderItems
exports.getAllOrderItems = catchAsync(async (req, res, next) => {
  const orderItems = await OrderItem.find(); // Optional: populate product fields

  res.status(200).json({
    status: 'success',
    results: orderItems.length,
    data: {
      orderItems,
    },
  });
});

// Get single OrderItem
exports.getOrderItemById = catchAsync(async (req, res, next) => {
  const orderItem = await OrderItem.findById(req.params.id)

  if (!orderItem) {
    return next(new AppError('No order item found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      orderItem,
    },
  });
});

// Update OrderItem
exports.updateOrderItem = catchAsync(async (req, res, next) => {
  const orderItem = await OrderItem.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!orderItem) {
    return next(new AppError('No order item found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      orderItem,
    },
  });
});

// Delete OrderItem
exports.deleteOrderItem = catchAsync(async (req, res, next) => {
  const orderItem = await OrderItem.findByIdAndDelete(req.params.id);

  if (!orderItem) {
    return next(new AppError('No order item found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
