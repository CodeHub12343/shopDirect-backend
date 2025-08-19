/* const express = require('express');
const app = express();

const productRouter = require('./routes/productRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const orderItemRouter = require('./routes/orderItemRoutes');
const categorieRouter = require('./routes/categorieRoutes');
const orderRouter = require('./routes/orderRoutes');
const AppError = require('./utills/AppError');
const globalError = require('./controllers/errorController');

// Middleware to parse JSON
app.use(express.json());

// Mount routers
app.use('/api/v4/products', productRouter);
app.use('/api/v4/users', userRouter);
app.use('/api/v4/reviews', reviewRouter);
app.use('/api/v4/categories', categorieRouter);
app.use('/api/v4/order-items', orderItemRouter);
app.use('/api/v4/orders', orderRouter);
// Catch-all for undefined routes
app.all('/{*any}', (req, res, next) => {
  next(new AppError('This route is not defined', 404));
});

// Global error handler
app.use(globalError);

module.exports = app; */

/* const path = require('path');
const express = require('express');
const cors = require('cors'); // <-- Import cors
const app = express();

const productRouter = require('./routes/productRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const orderItemRouter = require('./routes/orderItemRoutes');
const categorieRouter = require('./routes/categorieRoutes');
const orderRouter = require('./routes/orderRoutes');
const AppError = require('./utills/AppError');
const globalError = require('./controllers/errorController');

// Enable CORS for your frontend (Vite runs on 5174)
app.use(cors({ origin: 'http://localhost:5173' }));

// Middleware to parse JSON
app.use(express.json());
// Static files (images)
app.use(express.static(path.join(__dirname, 'public')));

// Mount routers
app.use('/api/v4/products', productRouter);
app.use('/api/v4/users', userRouter);
app.use('/api/v4/reviews', reviewRouter);
app.use('/api/v4/categories', categorieRouter);
app.use('/api/v4/order-items', orderItemRouter);
app.use('/api/v4/orders', orderRouter);

// Catch-all for undefined routes
app.all('/{*any}', (req, res, next) => {
  next(new AppError('This route is not defined', 404));
});

// Global error handler
app.use(globalError);

module.exports = app;

 


 */

/* const path = require('path');
const express = require('express');
const cors = require('cors');
const app = express();

const productRouter = require('./routes/productRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const orderItemRouter = require('./routes/orderItemRoutes');
const categorieRouter = require('./routes/categorieRoutes');
const orderRouter = require('./routes/orderRoutes');
const AppError = require('./utills/AppError');
const globalError = require('./controllers/errorController');

// Enable CORS for frontend
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware to parse JSON
app.use(express.json());

// Serve static files (images)
app.use(express.static(path.join(__dirname, 'public')));

// Mount routers
app.use('/api/v4/products', productRouter);
app.use('/api/v4/users', userRouter);
app.use('/api/v4/reviews', reviewRouter);
app.use('/api/v4/categories', categorieRouter);
app.use('/api/v4/order-items', orderItemRouter);
app.use('/api/v4/orders', orderRouter);

// Catch-all for undefined routes
app.all('/{*any}', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handler
app.use(globalError);

module.exports = app;
 

 */

const path = require('path');
const express = require('express');
const morgan = require('morgan');
 const rateLimit = require('express-rate-limit'); 
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');

const productRouter = require('./routes/productRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const orderItemRouter = require('./routes/orderItemRoutes');
const categorieRouter = require('./routes/categorieRoutes');
const orderRouter = require('./routes/orderRoutes');

const AppError = require('./utills/AppError');
const globalError = require('./controllers/errorController');

const app = express();

// ✅ Enable trust proxy (important for deployments like Render/Heroku)
// Only enable trust proxy in production deployments behind a proxy
app.enable('trust proxy');

// ✅ CORS configuration
app.use(
  cors({
    origin: [
      "https://shopdirect.onrender.com",
"https://shopdirect-website.onrender.com",
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:5174',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['set-cookie'],
  })
);
/* app.options('/{*any}', cors());  */ // Handle preflight

app.options(
  '/{*any}',
  cors({
    origin: [
      "https://shopdirect.onrender.com",
"https://shopdirect-website.onrender.com",
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:5174',
    ],
    credentials: true,
  })
);

// ✅ Logging (development only)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ✅ Rate limiter (to prevent brute-force or abuse)
const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, try again in an hour!',
});
app.use('/api', limiter);

// ✅ Body parsers (with limits)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ✅ Cookie parser (for JWT in cookies)
app.use(cookieParser());

// ✅ Data sanitization
/* app.use(mongoSanitize()); */ // NoSQL injection
/* app.use(xss()); // XSS protection

// ✅ Prevent parameter pollution
app.use(hpp({
  whitelist: ['price', 'ratingsAverage', 'category'],
})); */

app.use((req, res, next) => {
  console.log('Incoming request headers:', req.headers);
  console.log('Incoming cookies:', req.cookies);

  next();
});

// ✅ Compression for faster responses
app.use(compression());

// ✅ Serve static files (e.g., product images)
app.use(express.static(path.join(__dirname, 'public')));

app.use(helmet());

// ✅ Mount routers
app.use('/api/v4/products', productRouter);
app.use('/api/v4/users', userRouter);
app.use('/api/v4/reviews', reviewRouter);
app.use('/api/v4/categories', categorieRouter);
app.use('/api/v4/order-items', orderItemRouter);
app.use('/api/v4/orders', orderRouter);

app.all('/{*any}', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// ✅ Global error handler
app.use(globalError);

module.exports = app;
