const express = require('express');
const productRouter = express.Router();
const productController = require('./../controllers/productController');
const authController = require('./../controllers/authController');
const reviewRoutes = require('./reviewRoutes');

productRouter.use('/:id/reviews', reviewRoutes);

// Public routes (no authentication required)
// All products
productRouter.route('/').get(productController.getProduct);

// Single product
productRouter.route('/:id').get(productController.getProductById);

// Top rated products
productRouter.route('/top-rated-products').get(productController.topRatedProduct);

// Protected routes (admin only)
productRouter.use(authController.protect);

// Create product
productRouter.post('/', 
  productController.uploadProductImages,
  productController.resizeProductImages,
  productController.createProduct
);

// Update and delete product
productRouter
  .route('/:id')
  .patch(
    productController.uploadProductImages,
    productController.resizeProductImages,
    productController.updateProductById
  )
  .delete(productController.deleteProductById);

module.exports = productRouter;
