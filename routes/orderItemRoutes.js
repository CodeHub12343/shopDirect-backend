const express = require('express');
const orderItemController = require('./../controllers/orderItemController');
const authController = require('./../controllers/authController');

const router = express.Router();

// Only logged-in users can access
router.use(authController.protect);

// Get all orderItems & Create
router
  .route('/')
  .get(orderItemController.getAllOrderItems)
  .post(orderItemController.createOrderItem);

// Get, update, delete single orderItem
router
  .route('/:id')
  .get(orderItemController.getOrderItemById)
  .patch(orderItemController.updateOrderItem)
  .delete(orderItemController.deleteOrderItem);

module.exports = router;
