const expenseService = require("../services/expenseService");
const Expense = require("../models/Expense");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

exports.getExpenses = catchAsync(async (req, res) => {
  const result = await expenseService.getExpenses(req.user._id, req.query);
  res.status(200).json({ success: true, ...result });
});

exports.getExpense = catchAsync(async (req, res) => {
  const expense = await expenseService.getExpenseById(req.user._id, req.params.id);
  res.status(200).json({ success: true, data: { expense } });
});

exports.createExpense = catchAsync(async (req, res) => {
  const expense = await expenseService.createExpense(req.user._id, req.body);
  res.status(201).json({ success: true, data: { expense } });
});

exports.updateExpense = catchAsync(async (req, res) => {
  const expense = await expenseService.updateExpense(req.user._id, req.params.id, req.body);
  res.status(200).json({ success: true, data: { expense } });
});

exports.deleteExpense = catchAsync(async (req, res) => {
  await expenseService.deleteExpense(req.user._id, req.params.id);
  res.status(200).json({ success: true, message: "Expense deleted successfully" });
});

exports.bulkDelete = catchAsync(async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new AppError("Please provide an array of expense IDs", 400);
  }
  const count = await expenseService.bulkDelete(req.user._id, ids);
  res.status(200).json({ success: true, message: `${count} expense(s) deleted` });
});

exports.getCategories = (req, res) => {
  res.status(200).json({ success: true, data: { categories: Expense.CATEGORIES } });
};
