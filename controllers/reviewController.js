const Review = require('./../models/reviewModel');
const catchAsync = require('./../utills/catchAsync');

exports.getReview = catchAsync(async (req, res) => {
  let filter = {};
  if (req.params.id) filter = { product: req.params.id };
  const reviews = await Review.find(filter);
  res.status(200).json({
    status: 'success',
    result: reviews.length,
    data: {
      reviews,
    },
  });
});

exports.createReview = catchAsync(async (req, res) => {
  if (!req.body.user) req.body.user = req.user.id;
  if (!req.body.product) req.body.product = req.params.id;
  const reviews = await Review.create(req.body);
  res.status(200).json({
    status: 'success',
    data: {
      reviews,
    },
  });
});

exports.updateReviewById = catchAsync(async (req, res) => {
  const reviews = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      reviews,
    },
  });
});


exports.deleteReviewById = catchAsync(async (req, res) => {
    const review = await Review.findByIdAndDelete(req.params.id);
  
    if (!review) {
      return res.status(404).json({
        status: 'fail',
        message: 'No review found with that ID',
      });
    }
  
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });
  