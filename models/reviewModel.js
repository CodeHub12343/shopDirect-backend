/* const mongoose = require('mongoose');
const Product = require('./../models/productModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review cannot be empty'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

    reviewSchema.index({ product: 1, user: 1 }, { unique: true });  

reviewSchema.pre(/^find/, function (next) {
  this.populate({ path: 'user', select: 'name' }).populate({
    path: 'product',
    select: 'name',
  });
  next();
});

reviewSchema.statics.calcReviewAverage = async function (id) {
  const stats = await this.aggregate([
    {
      $match: { product: id },
    },
    {
      $group: {
        _id: '$product',
        nAvg: { $sum: 1 },
        calcAvg: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(id, {
      ratingsAverage: stats[0].calcAvg,
      ratingsQuantity: stats[0].nAvg,
    });
  } else {
    await Product.findByIdAndUpdate(id, {
      ratingsAverage: 4.5,
      ratingsQuantity: 0,
    });
  }
};

// Update product ratings after creating a review
reviewSchema.post('save', function () {
  this.constructor.calcReviewAverage(this.product);
});

// Store document for use in post-hook
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.clone().findOne();
  next();
});

// Update ratings after updating/deleting review
reviewSchema.post(/^findOneAnd/, async function () {
  if (this.r) {
    await this.r.constructor.calcReviewAverage(this.r.product);
  }
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review; */

const mongoose = require('mongoose');
const Product = require('./../models/productModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review cannot be empty'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'Rating is required']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user']
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: [true, 'Review must belong to a product']
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Optional: Prevent duplicate reviews by same user for same product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Populate user name when fetching reviews
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name'
  });
  next();
});

// Calculate and update product ratings
reviewSchema.statics.calcAverageRatings = async function (productId) {
  try {
    const castedProductId =
      typeof productId === 'string'
        ? new mongoose.Types.ObjectId(productId)
        : productId;

    const stats = await this.aggregate([
      { $match: { product: castedProductId } },
      {
        $group: {
          _id: '$product',
          nRatings: { $sum: 1 },
          avgRating: { $avg: '$rating' }
        }
      }
    ]);

    if (stats.length > 0) {
      await Product.findByIdAndUpdate(castedProductId, {
        ratingsQuantity: stats[0].nRatings,
        ratingsAverage: stats[0].avgRating
      });
    } else {
      await Product.findByIdAndUpdate(castedProductId, {
        ratingsQuantity: 0,
        ratingsAverage: 4.5 // default
      });
    }
  } catch (err) {
    // Swallow aggregation casting errors so they don't break request flow
    // Consider logging with a real logger in production
    // console.error('calcAverageRatings error:', err);
  }
};

// POST-save hook (create review)
reviewSchema.post('save', function () {
  this.constructor.calcAverageRatings(this.product);
});

// Recalculate after bulk imports
reviewSchema.post('insertMany', async function (docs) {
  if (!Array.isArray(docs) || docs.length === 0) return;
  // Group by product to avoid N recalcs for same product
  const uniqueProductIds = Array.from(
    new Set(
      docs
        .map((d) => d.product)
        .filter(Boolean)
        .map((id) => (typeof id === 'string' ? id : id.toString()))
    )
  );

  await Promise.all(
    uniqueProductIds.map((id) =>
      // Use model (this) to access static
      reviewSchema.statics.calcAverageRatings.call(this, id)
    )
  );
});

// Store current review before update/delete
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.model.findOne(this.getQuery());
  next();
});

// POST-update/delete hook
reviewSchema.post(/^findOneAnd/, async function () {
  if (this.r) {
    await this.r.constructor.calcAverageRatings(this.r.product);
  }
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;

