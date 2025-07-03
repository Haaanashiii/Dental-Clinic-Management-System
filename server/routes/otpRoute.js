const express = require("express");
const { requestOtp, verifyOtp, checkPassword } = require("../controllers/otpController.js");
const router = express.Router();

router.post("/request-otp", requestOtp);
router.post("/verify-otp", verifyOtp);
router.post("/check-password", checkPassword);

module.exports = router;
