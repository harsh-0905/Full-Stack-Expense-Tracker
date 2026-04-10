const Expense = require("../models/Expense");
const AppError = require("../utils/AppError");

// Build filter object from query params
const buildFilter = (userId, query) => {
  const filter = { user: userId };

  if (query.category) filter.category = query.category;
  if (query.paymentMethod) filter.paymentMethod = query.paymentMethod;
  if (query.search) {
    filter.$or = [
      { title: { $regex: query.search, $options: "i" } },
      { note: { $regex: query.search, $options: "i" } },
    ];
  }
  if (query.startDate || query.endDate) {
    filter.date = {};
    if (query.startDate) filter.date.$gte = new Date(query.startDate);
    if (query.endDate) filter.date.$lte = new Date(query.endDate + "T23:59:59.999Z");
  }
  if (query.minAmount || query.maxAmount) {
    filter.amount = {};
    if (query.minAmount) filter.amount.$gte = parseFloat(query.minAmount);
    if (query.maxAmount) filter.amount.$lte = parseFloat(query.maxAmount);
  }

  return filter;
};

exports.getExpenses = async (userId, query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  const skip = (page - 1) * limit;

  const sortField = query.sortBy || "date";
  const sortOrder = query.order === "asc" ? 1 : -1;
  const sort = { [sortField]: sortOrder };

  const filter = buildFilter(userId, query);

  const [expenses, total] = await Promise.all([
    Expense.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Expense.countDocuments(filter),
  ]);

  return {
    expenses,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    },
  };
};

exports.createExpense = async (userId, data) => {
  const expense = await Expense.create({ ...data, user: userId });
  return expense;
};

exports.updateExpense = async (userId, expenseId, data) => {
  const expense = await Expense.findOneAndUpdate(
    { _id: expenseId, user: userId },
    data,
    { new: true, runValidators: true }
  );
  if (!expense) throw new AppError("Expense not found", 404);
  return expense;
};

exports.deleteExpense = async (userId, expenseId) => {
  const expense = await Expense.findOneAndDelete({ _id: expenseId, user: userId });
  if (!expense) throw new AppError("Expense not found", 404);
  return expense;
};

exports.getExpenseById = async (userId, expenseId) => {
  const expense = await Expense.findOne({ _id: expenseId, user: userId });
  if (!expense) throw new AppError("Expense not found", 404);
  return expense;
};

exports.bulkDelete = async (userId, ids) => {
  const result = await Expense.deleteMany({ _id: { $in: ids }, user: userId });
  return result.deletedCount;
};
