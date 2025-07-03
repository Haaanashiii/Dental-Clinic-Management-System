const bcrypt = require("bcryptjs");
const User = require("../models/user.models.js");
const nodemailer = require("nodemailer");

// In-memory store for OTPs and rate limiting (use Redis in production)
const otpStore = {};

function getKey(email) {
  return email.toLowerCase();
}

exports.requestOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });
  const key = getKey(email);
  const now = Date.now();

  // Find user
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return res.status(404).json({ message: "No user with that email" });

  // Blocked check
  if (otpStore[key]?.blockedUntil && now < otpStore[key].blockedUntil) {
    const blockTime = Math.ceil((otpStore[key].blockedUntil - now) / 1000);
    return res.status(429).json({ message: `Too many attempts. Try again in ${blockTime}s.`, blockTime });
  }

  // Rate limit check
  if (!otpStore[key]) otpStore[key] = { attempts: [], blockedUntil: 0 };
  otpStore[key].attempts = otpStore[key].attempts.filter(ts => now - ts < 5 * 60 * 1000); // last 5 mins
  if (otpStore[key].attempts.length >= 5) {
    otpStore[key].blockedUntil = now + 10 * 60 * 1000; // block for 10 mins
    return res.status(429).json({ message: "Too many OTP requests. Blocked for 10 minutes.", blockTime: 600 });
  }

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[key].otp = otp;
  otpStore[key].otpExpires = now + 5 * 60 * 1000; // 5 mins
  otpStore[key].attempts.push(now);

  // Send email
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'alipintester1234@gmail.com',
      pass: 'bqac gxeo igjq dyve',
    },
  });
  await transporter.sendMail({
    from: 'alipintester1234@gmail.com',
    to: email,
    subject: 'Your OTP for Password Reset',
    text: `Your OTP is: ${otp}. It will expire in 5 minutes.`,
  });
  res.json({ message: "OTP sent to email" });
};

exports.verifyOtp = async (req, res) => {
  const { email, otp, newPassword, checkOnly } = req.body;
  if (!email || !otp) return res.status(400).json({ message: "Email and OTP required" });
  const key = getKey(email);
  const now = Date.now();
  const store = otpStore[key];
  if (!store || !store.otp || !store.otpExpires || now > store.otpExpires) {
    return res.status(400).json({ message: "OTP expired or not found" });
  }
  if (store.otp !== otp) {
    return res.status(400).json({ message: "Invalid OTP" });
  }
  if (checkOnly) {
    return res.json({ message: "OTP verified" });
  }
  if (!newPassword) {
    return res.status(400).json({ message: "New password required" });
  }
  // Reset password
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return res.status(404).json({ message: "User not found" });
  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  // Clean up
  delete otpStore[key];
  res.json({ message: "Password reset successful" });
};
