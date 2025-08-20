const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utills/catchAsync');
const AppError = require('./../utills/AppError');
const Email = require('./../utills/email');

// ===============================
// 🔑 Utility Functions
// ===============================
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

/* const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);
  const isProd = process.env.NODE_ENV === 'production';

  const sameSite = isProd ? 'none' : 'lax';
  // ✅ Secure cookie setup
  res.cookie('jwt', token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    sameSite,
  });

  // ✅ Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: { user },
  });
}; */

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);

  // Force cross-site compatible cookie in production
  const isProd = process.env.NODE_ENV === 'production';
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: isProd || req.secure || req.headers['x-forwarded-proto'] === 'https',
    sameSite: isProd ? 'none' : 'lax',
  };
  // Don’t set cookieOptions.domain – leave it unset

  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: { user },
  });
};

// ===============================
// 📝 SIGNUP
// ===============================
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    role: req.body.role, // optional
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  // Optionally send welcome email
  // const url = `${req.protocol}://${req.get('host')}/me`;
  // await new Email(newUser, url).sendWelcome();

  createSendToken(newUser, 201, req, res);
});

// ===============================
// 🔑 LOGIN
// ===============================
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  createSendToken(user, 200, req, res);
});

// ===============================
// 🚪 LOGOUT
// ===============================
exports.logout = (req, res) => {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 1000),
    httpOnly: true,
    secure: isProd || req.secure || req.headers['x-forwarded-proto'] === 'https',
    sameSite: isProd ? 'none' : 'lax',
  });
  res.status(200).json({ status: 'success' });
};


// ===============================
// 🛡 PROTECT (auth middleware)
// ===============================
exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access.', 401));
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('The user belonging to this token no longer exists.', 401));
  }

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('User recently changed password! Please log in again.', 401));
  }
console.log(currentUser)
  req.user = currentUser;
  res.locals.user = currentUser; // for views if needed
  next();
});

// ===============================
// 🔐 CHECK LOGIN STATUS (for rendered pages)
// ===============================
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
      const currentUser = await User.findById(decoded.id);
      if (!currentUser || currentUser.changedPasswordAfter(decoded.iat)) return next();

      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

// ===============================
// 🚷 ROLE-BASED AUTHORIZATION
// ===============================
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};

// ===============================
// 🔑 FORGOT PASSWORD
// ===============================
exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new AppError('No user found with this email.', 404));

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  try {
   /*  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({ status: 'success', message: 'Token sent to email!' }); */
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('Error sending email. Try again later!', 500));
  }
});

// ===============================
// 🔑 RESET PASSWORD
// ===============================
exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) return next(new AppError('Token is invalid or expired', 400));

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  createSendToken(user, 200, req, res);
});

// ===============================
// 🔑 UPDATE PASSWORD (logged-in user)
// ===============================
exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  createSendToken(user, 200, req, res);
});
