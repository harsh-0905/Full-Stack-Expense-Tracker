const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const protect = require("../middlewares/auth");
const { validateRegister, validateLogin, validateUpdateProfile } = require("../middlewares/validate");

router.post("/register", validateRegister, authController.register);
router.post("/login", validateLogin, authController.login);
router.get("/me", protect, authController.getMe);
router.patch("/profile", protect, validateUpdateProfile, authController.updateProfile);

module.exports = router;
