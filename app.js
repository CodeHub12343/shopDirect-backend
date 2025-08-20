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

// ✅ Trust proxy for deployments
app.enable('trust proxy');

// ✅ Security HTTP headers
app.use(helmet());

// ✅ CORS configuration
const allowedOrigins = [
  "https://shopdirect.onrender.com",
  "https://shopdirect-website.onrender.com",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174"
];
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['set-cookie'],
}));

app.options(/.*/, cors({ origin: allowedOrigins, credentials: true }));

// ✅ Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ✅ Rate limiter
const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, try again in an hour!',
});
app.use('/api', limiter);

// ✅ Body parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ✅ Cookie parser
app.use(cookieParser());

// ✅ Data sanitization
app.use(mongoSanitize());
app.use(xss());
app.use(hpp({ whitelist: ['price', 'ratingsAverage', 'category'] }));

// ✅ Compression
app.use(compression());

// ✅ Static files
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Mount routers
app.use('/api/v4/products', productRouter);
app.use('/api/v4/users', userRouter);
app.use('/api/v4/reviews', reviewRouter);
app.use('/api/v4/categories', categorieRouter);
app.use('/api/v4/order-items', orderItemRouter);
app.use('/api/v4/orders', orderRouter);

// ✅ Handle undefined routes
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// ✅ Global error handler
app.use(globalError);

module.exports = app;
