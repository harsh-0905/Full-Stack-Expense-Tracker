const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");
const protect = require("../middlewares/auth");

router.use(protect);

router.get("/dashboard", analyticsController.getDashboard);
router.get("/summary", analyticsController.getSummary);
router.get("/categories", analyticsController.getCategoryBreakdown);
router.get("/trend", analyticsController.getDailyTrend);
router.get("/comparison", analyticsController.getMonthComparison);
router.get("/top", analyticsController.getTopExpenses);
router.get("/payment-methods", analyticsController.getPaymentMethodStats);

module.exports = router;
