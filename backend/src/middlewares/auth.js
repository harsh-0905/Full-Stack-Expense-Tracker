const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

const protect = catchAsync(async (req, res, next) => {
  // 1. Get token
  let token;
  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) throw new AppError("Not authenticated. Please log in.", 401);

  // 2. Verify token
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    if (err.name === "TokenExpiredError") throw new AppError("Your session expired. Please log in again.", 401);
    throw new AppError("Invalid token. Please log in.", 401);
  }

  // 3. Check user still exists
  const user = await User.findById(decoded.id);
  if (!user) throw new AppError("User no longer exists.", 401);

  req.user = user;
  next();
});

module.exports = protect;
