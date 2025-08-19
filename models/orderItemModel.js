const mongoose = require('mongoose');
const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity can’t be less than 1'],
    },
    price: {
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

orderItemSchema.pre(/^find/, function (next) {
  this.populate({ path: 'product', select: 'name price ratingsAverage imageCover images' });
  next();
});

const OrderItem = mongoose.model('OrderItem', orderItemSchema);

module.exports = OrderItem;
