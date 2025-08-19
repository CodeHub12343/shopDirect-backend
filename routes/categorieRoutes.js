const express = require('express');
const categorieController = require('./../controllers/categorieController');
const authController = require('./../controllers/authController');
const categorieRouter = express.Router();

// Public routes (no authentication required)
// GET all categories
categorieRouter.get('/', categorieController.getAllCategories);

// GET single category by ID
categorieRouter.get('/:id', categorieController.getCategoryById);

// Protected routes (admin only)
categorieRouter.use(authController.protect);

// POST a new category
categorieRouter.post('/', categorieController.createCategory);

// UPDATE, DELETE a single category by ID
categorieRouter
  .route('/:id')
  .patch(categorieController.updateCategory)
  .delete(categorieController.deleteCategory);

module.exports = categorieRouter;


