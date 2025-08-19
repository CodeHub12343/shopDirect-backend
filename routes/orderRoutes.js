const express = require('express');
const orderController = require('../controllers/orderController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

// Create Payment Intent
router.post('/create-payment-intent', orderController.createPaymentIntent);

// Get order history for the authenticated user
router.get('/my-orders', orderController.getOrderHistoryForUser);
// Create order (after payment success)
router.post('/', orderController.createOrder);

// Get all orders for the authenticated user
router.get('/', orderController.getAllOrders);

// Get single order by ID
router.get('/:id', orderController.getOrderById);

// Update order delivery status (admin only)
router.patch('/:id/deliver', orderController.updateOrderToDelivered);



module.exports = router;
