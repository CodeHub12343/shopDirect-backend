const express = require('express');
const reviewController = require('./../controllers/reviewController');
const reviewRouter = express.Router({ mergeParams: true });
const authController = require('./../controllers/authController');

// Public route (no authentication required)
reviewRouter.get('/', reviewController.getReview);

// Protected routes (authenticated users only)
reviewRouter.use(authController.protect);

reviewRouter.post('/', reviewController.createReview);

reviewRouter
  .route('/:id')
  .patch(reviewController.updateReviewById)
  .delete(reviewController.deleteReviewById);

module.exports = reviewRouter;
