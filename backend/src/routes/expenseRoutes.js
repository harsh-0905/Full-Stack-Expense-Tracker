const express = require("express");
const router = express.Router();
const expenseController = require("../controllers/expenseController");
const protect = require("../middlewares/auth");
const { validateExpense, validateUpdateExpense } = require("../middlewares/validate");

// All expense routes require auth
router.use(protect);

router.get("/categories", expenseController.getCategories);
router.post("/bulk-delete", expenseController.bulkDelete);

router
  .route("/")
  .get(expenseController.getExpenses)
  .post(validateExpense, expenseController.createExpense);

router
  .route("/:id")
  .get(expenseController.getExpense)
  .put(validateExpense, expenseController.updateExpense)
  .patch(validateUpdateExpense, expenseController.updateExpense)
  .delete(expenseController.deleteExpense);

module.exports = router;
