const Expense = require("../models/Expense");
const mongoose = require("mongoose");

// Helper to get date range
const getDateRange = (period) => {
  const now = new Date();
  const start = new Date();

  switch (period) {
    case "week":
      start.setDate(now.getDate() - 7);
      break;
    case "month":
      start.setMonth(now.getMonth() - 1);
      break;
    case "quarter":
      start.setMonth(now.getMonth() - 3);
      break;
    case "year":
      start.setFullYear(now.getFullYear() - 1);
      break;
    default:
      start.setMonth(now.getMonth() - 1);
  }

  return { start, end: now };
};

// Summary: total, count, avg, max
exports.getSummary = async (userId, period = "month") => {
  const { start, end } = getDateRange(period);
  const uid = new mongoose.Types.ObjectId(userId);

  const [result] = await Expense.aggregate([
    { $match: { user: uid, date: { $gte: start, $lte: end } } },
    {
      $group: {
        _id: null,
        total: { $sum: "$amount" },
        count: { $sum: 1 },
        avg: { $avg: "$amount" },
        max: { $max: "$amount" },
        min: { $min: "$amount" },
      },
    },
    { $project: { _id: 0 } },
  ]);

  return result || { total: 0, count: 0, avg: 0, max: 0, min: 0 };
};

// Breakdown by category
exports.getCategoryBreakdown = async (userId, period = "month") => {
  const { start, end } = getDateRange(period);
  const uid = new mongoose.Types.ObjectId(userId);

  return Expense.aggregate([
    { $match: { user: uid, date: { $gte: start, $lte: end } } },
    {
      $group: {
        _id: "$category",
        total: { $sum: "$amount" },
        count: { $sum: 1 },
        avg: { $avg: "$amount" },
      },
    },
    { $sort: { total: -1 } },
    { $project: { category: "$_id", total: 1, count: 1, avg: 1, _id: 0 } },
  ]);
};

// Daily spending trend
exports.getDailyTrend = async (userId, period = "month") => {
  const { start, end } = getDateRange(period);
  const uid = new mongoose.Types.ObjectId(userId);

  return Expense.aggregate([
    { $match: { user: uid, date: { $gte: start, $lte: end } } },
    {
      $group: {
        _id: {
          year: { $year: "$date" },
          month: { $month: "$date" },
          day: { $dayOfMonth: "$date" },
        },
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    {
      $project: {
        _id: 0,
        date: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: {
              $dateFromParts: {
                year: "$_id.year",
                month: "$_id.month",
                day: "$_id.day",
              },
            },
          },
        },
        total: 1,
        count: 1,
      },
    },
  ]);
};

// Monthly comparison (current vs last month)
exports.getMonthComparison = async (userId) => {
  const uid = new mongoose.Types.ObjectId(userId);
  const now = new Date();

  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const [thisMonth, lastMonth] = await Promise.all([
    Expense.aggregate([
      { $match: { user: uid, date: { $gte: thisMonthStart } } },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]),
    Expense.aggregate([
      { $match: { user: uid, date: { $gte: lastMonthStart, $lte: lastMonthEnd } } },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]),
  ]);

  const current = thisMonth[0] || { total: 0, count: 0 };
  const previous = lastMonth[0] || { total: 0, count: 0 };
  const change = previous.total > 0 ? ((current.total - previous.total) / previous.total) * 100 : 0;

  return {
    currentMonth: { total: current.total, count: current.count },
    lastMonth: { total: previous.total, count: previous.count },
    percentageChange: parseFloat(change.toFixed(2)),
    trend: change > 0 ? "up" : change < 0 ? "down" : "neutral",
  };
};

// Top spending days
exports.getTopExpenses = async (userId, limit = 5) => {
  const uid = new mongoose.Types.ObjectId(userId);

  return Expense.find({ user: uid })
    .sort({ amount: -1 })
    .limit(limit)
    .select("title amount category date paymentMethod")
    .lean();
};

// Payment method breakdown
exports.getPaymentMethodStats = async (userId, period = "month") => {
  const { start, end } = getDateRange(period);
  const uid = new mongoose.Types.ObjectId(userId);

  return Expense.aggregate([
    { $match: { user: uid, date: { $gte: start, $lte: end } } },
    {
      $group: {
        _id: "$paymentMethod",
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { total: -1 } },
    { $project: { method: "$_id", total: 1, count: 1, _id: 0 } },
  ]);
};
