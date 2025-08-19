const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product must have a name'],
      unique: true,
    },
    description: {
      type: String,
      required: [true, 'A product must have a description'],
    },
    price: {
      type: Number,
      required: [true, 'Product must have a price'],
    },
    imageCover: String,
    images: [String],
    ratingsAverage: {
      type: Number,
      default: 4.5,
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: 'Category',
      required: [true, 'Product must belong to a category'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.virtual('reviews', {
  ref: 'Review', // The model to populate from
  foreignField: 'product', // The field in Review that refers to Product
  localField: '_id', // The field in Product that matches `foreignField`
});


  productSchema.pre(/^find/, function (next) {
    this.populate({ path: 'category', select: 'name' })
    next();
  });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
