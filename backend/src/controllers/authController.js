const authService = require("../services/authService");
const catchAsync = require("../utils/catchAsync");

exports.register = catchAsync(async (req, res) => {
  const { name, email, password } = req.body;
  const user = await authService.register({ name, email, password });
  authService.createSendToken(user, 201, res);
});

exports.login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.login({ email, password });
  authService.createSendToken(user, 200, res);
});

exports.getMe = catchAsync(async (req, res) => {
  res.status(200).json({ success: true, data: { user: req.user } });
});

exports.updateProfile = catchAsync(async (req, res) => {
  const { name, monthlyBudget, currency } = req.body;
  const User = require("../models/User");

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, monthlyBudget, currency },
    { new: true, runValidators: true }
  );

  res.status(200).json({ success: true, data: { user } });
});
