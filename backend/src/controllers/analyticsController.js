const analyticsService = require("../services/analyticsService");
const catchAsync = require("../utils/catchAsync");

exports.getSummary = catchAsync(async (req, res) => {
  const data = await analyticsService.getSummary(req.user._id, req.query.period);
  res.status(200).json({ success: true, data });
});

exports.getCategoryBreakdown = catchAsync(async (req, res) => {
  const data = await analyticsService.getCategoryBreakdown(req.user._id, req.query.period);
  res.status(200).json({ success: true, data });
});

exports.getDailyTrend = catchAsync(async (req, res) => {
  const data = await analyticsService.getDailyTrend(req.user._id, req.query.period);
  res.status(200).json({ success: true, data });
});

exports.getMonthComparison = catchAsync(async (req, res) => {
  const data = await analyticsService.getMonthComparison(req.user._id);
  res.status(200).json({ success: true, data });
});

exports.getTopExpenses = catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit) || 5;
  const data = await analyticsService.getTopExpenses(req.user._id, limit);
  res.status(200).json({ success: true, data });
});

exports.getPaymentMethodStats = catchAsync(async (req, res) => {
  const data = await analyticsService.getPaymentMethodStats(req.user._id, req.query.period);
  res.status(200).json({ success: true, data });
});

// Combined dashboard endpoint — single request for all analytics
exports.getDashboard = catchAsync(async (req, res) => {
  const { period = "month" } = req.query;
  const userId = req.user._id;

  const [summary, categoryBreakdown, dailyTrend, monthComparison, topExpenses, paymentStats] =
    await Promise.all([
      analyticsService.getSummary(userId, period),
      analyticsService.getCategoryBreakdown(userId, period),
      analyticsService.getDailyTrend(userId, period),
      analyticsService.getMonthComparison(userId),
      analyticsService.getTopExpenses(userId, 5),
      analyticsService.getPaymentMethodStats(userId, period),
    ]);

  res.status(200).json({
    success: true,
    data: { summary, categoryBreakdown, dailyTrend, monthComparison, topExpenses, paymentStats },
  });
});
