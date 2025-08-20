const Product = require('./../models/productModel');
const ApiFeatures = require('./../utills/ApiFeatures');
const catchAsync = require('./../utills/catchAsync');
const multer = require('multer');
const sharp = require('sharp');
const AppError = require('./../utills/AppError');

// Helper function to get full image URL
const getImageUrl = (filename) => {
  if (!filename) return null;
  
  // In production, use the full API URL
  if (process.env.NODE_ENV === 'production') {
    return `https://shopdirect-api.onrender.com/img/products/${filename}`;
  }
  
  // In development, use relative path
  return `/img/products/${filename}`;
};

// Helper function to process product images
const processProductImages = (product) => {
  if (!product) return product;
  
  const processed = product.toObject ? product.toObject() : { ...product };
  
  // Do NOT overwrite original fields; add derived URL fields
  processed.imageCoverUrl = processed.imageCover
    ? getImageUrl(processed.imageCover)
    : null;
  
  processed.imageUrls = Array.isArray(processed.images)
    ? processed.images.map((img) => getImageUrl(img))
    : [];
  
  return processed;
};

// Helper function to process multiple products
const processProductsImages = (products) => {
  if (!Array.isArray(products)) return products;
  
  return products.map((product) => processProductImages(product));
};

// MULTER CONFIGURATION
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
    files: 4, // Maximum 4 files total (1 cover + 3 images)
  },
});

/**
 * Multer middleware for handling product image uploads
 * Accepts:
 * - imageCover: Single cover image (max 1 file)
 * - images: Multiple product images (max 3 files)
 *
 * Usage in form data:
 * - imageCover: file field
 * - images: file field (can be multiple)
 * - name, description, price, category: text fields
 */
exports.uploadProductImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

// upload.single('image') req.file
// upload.array('images', 5) req.files

/**
 * Resize and save uploaded product images
 * - Resizes images to 2000x1333 pixels
 * - Converts to JPEG format with 90% quality
 * - Saves to public/img/products/ directory
 * - Generates unique filenames using timestamps
 * - Populates req.body.imageCover and req.body.images
 */
exports.resizeProductImages = catchAsync(async (req, res, next) => {
  console.log('Uploaded files:', req.files);
  console.log('Request body:', req.body);

  if (!req.files) return next();

  // Unique identifier for the product since ID doesn't exist yet
  const timestamp = Date.now();

  // 1) Cover image
  if (req.files.imageCover) {
    req.body.imageCover = `product-${timestamp}-cover.jpeg`;
    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/products/${req.body.imageCover}`);
  }

  // 2) Images
  if (req.files.images) {
    req.body.images = [];

    await Promise.all(
      req.files.images.map(async (file, i) => {
        const filename = `product-${timestamp}-${i + 1}.jpeg`;

        await sharp(file.buffer)
          .resize(2000, 1333)
          .toFormat('jpeg')
          .jpeg({ quality: 90 })
          .toFile(`public/img/products/${filename}`);

        req.body.images.push(filename);
      })
    );
  }

  next();
});

// USING OBJECT ORIENTED PROGRAMMIMG

// PRODUCTS ROUTES

/* exports.getProduct = catchAsync(async (req, res, next) => {
  const features = new ApiFeatures(Product.find(), req.query)
    .filter()
    .sort()
    .field()
    .paginate();

  const products = await features.query;

  res.status(200).json({
    status: 'success',
    result: products.length,
    data: {
      products,
    },
  });
}); */

exports.getProduct = catchAsync(async (req, res, next) => {
  // 1) Build filter (if needed for nested routes)
  let filter = {};
  if (req.params.categoryId) filter = { category: req.params.categoryId }; 
  // (Modify this if you want nested filtering, otherwise leave it empty)

  // 2) Apply all features except pagination to get total count
  const featuresForCount = new ApiFeatures(Product.find(filter), req.query)
    .filter()
    .sort()
    .field()
     // no pagination here

  const total = await featuresForCount.query.countDocuments();

  // 3) Apply features WITH pagination for actual data
  const featuresForData = new ApiFeatures(Product.find(filter), req.query)
    .filter()
    .sort()
    .field()
    .paginate()

  const products = await featuresForData.query;

  // 4) Process image URLs
  const processedProducts = processProductsImages(products);

  // 4) Send response
  res.status(200).json({
    status: 'success',
    total,                  // total count before pagination
    results: products.length, // count of products returned on this page
    data: {
      products: processedProducts,
    },
  });
});



exports.createProduct = catchAsync(async (req, res) => {
  const product = await Product.create(req.body);

  // Process image URLs
  const processedProduct = processProductImages(product);

  res.status(200).json({
    status: 'success',
    data: {
      product: processedProduct,
    },
  });
});

exports.getProductById = catchAsync(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('reviews');

  // Process image URLs
  const processedProduct = processProductImages(product);

  res.status(200).json({
    status: 'success',
    data: {
      product: processedProduct,
    },
  });
});

exports.updateProductById = catchAsync(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  // Process image URLs
  const processedProduct = processProductImages(product);

  res.status(200).json({
    status: 'success',
    data: {
      product: processedProduct,
    },
  });
});

exports.deleteProductById = catchAsync(async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: 'success',
    data: {
      data: null,
    },
  });
});

exports.topRatedProduct = async (req, res) => {
  const topRated = await Product.aggregate([
    {
      $match: {
        ratingsAverage: { $gte: 4.5 },
      },
    },
    {
      $sort: {
        ratingsAverage: -1,
        ratingsQuantity: -1,
      },
    },
    {
      $limit: 5,
    },
    {
      $project: {
        name: 1,
        price: 1,
        brand: 1,
        ratingsAverage: 1,
        ratingsQuantity: 1,
        imageCover: 1,
      },
    },
  ]);

  // Add derived URL field without changing original
  const processedTopRated = topRated.map((product) => ({
    ...product,
    imageCoverUrl: product.imageCover ? getImageUrl(product.imageCover) : null,
  }));

  res.status(200).json({
    status: 'success',
    result: topRated.length,
    data: {
      topRated: processedTopRated,
    },
  });
};
