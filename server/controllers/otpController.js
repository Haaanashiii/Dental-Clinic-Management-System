const bcrypt = require("bcryptjs");
const User = require("../models/user.models.js");
const nodemailer = require("nodemailer");

// In-memory store for OTPs and rate limiting (use Redis in production)
const otpStore = {};

function getKey(email) {
  return email.toLowerCase();
}

function createOtpMailerTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = process.env.SMTP_SECURE === "true" || process.env.SMTP_SECURE === "1";
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    const error = new Error("SMTP configuration is incomplete. Set SMTP_HOST, SMTP_USER, and SMTP_PASS on the server.");
    error.code = "SMTP_CONFIG_ERROR";
    throw error;
  }

  const transport = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  transport.options = {
    host,
    port,
    secure,
    auth: { user, pass },
    from: process.env.SMTP_FROM || process.env.EMAIL_FROM || "Molar Record Dental Clinic <no-reply@example.com>",
  };

  return transport;
}

exports.createOtpMailerTransport = createOtpMailerTransport;

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

  // Format OTP with spaces for better readability
  const formattedOTP = otp.split('').join(' ');

  // HTML email template
  const htmlTemplate = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Verification Code</title>
    <style>
      body {
        font-family: 'Segoe UI', Arial, sans-serif;
        line-height: 1.6;
        color: #333333;
        margin: 0;
        padding: 0;
        background-color: #f9f9f9;
      }
      .wrapper {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
      }
      .card {
        background-color: #ffffff;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
      }
      .header {
        background-color: #1c444d;
        padding: 30px 0;
        text-align: center;
      }
      .logo {
        font-size: 24px;
        font-weight: bold;
        color: white;
        letter-spacing: 1px;
      }
      .content {
        padding: 40px 30px;
        text-align: center;
      }
      .title {
        font-size: 26px;
        margin-bottom: 10px;
        color: #1c444d;
        font-weight: 600;
      }
      .subtitle {
        font-size: 16px;
        margin-bottom: 30px;
        color: #666666;
      }
      .otp-box {
        background-color: #f0f7f8;
        border: 2px solid #e0eef0;
        border-radius: 8px;
        padding: 20px;
        margin: 25px 0;
      }
      .otp {
        font-size: 38px;
        letter-spacing: 8px;
        font-weight: 700;
        color: #1c444d;
      }
      .expiry {
        font-size: 14px;
        color: #e74c3c;
        margin-top: 25px;
        font-weight: 500;
      }
      .note {
        font-size: 14px;
        color: #777777;
        margin-top: 30px;
        font-style: italic;
      }
      .footer {
        background-color: #f5f5f5;
        padding: 20px;
        text-align: center;
        font-size: 12px;
        color: #999999;
      }
      .divider {
        height: 1px;
        background-color: #eeeeee;
        margin: 30px 0;
      }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="card">
        <div class="header">
          <div class="logo">MolarRecord Dental Clinic</div>
        </div>
        <div class="content">
          <h1 class="title">Verification Code</h1>
          <p class="subtitle">Use the following code to complete your password reset request</p>
          
          <div class="otp-box">
            <div class="otp">${otp}</div>
          </div>
          
          <p class="expiry">This code will expire in 5 minutes</p>
          
          <div class="divider"></div>
          
          <p class="note">
            If you didn't request this code, you can safely ignore this email.
            Someone might have entered your email address by mistake.
          </p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} MolarRecord Dental Clinic | All rights reserved</p>
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </div>
  </body>
  </html>
  `;

  let transporter;
  try {
    transporter = createOtpMailerTransport();
  } catch (error) {
    console.error("OTP mailer configuration error:", error);
    return res.status(500).json({ message: "Email service is not configured on the server." });
  }

  try {
    await transporter.sendMail({
      from: transporter.options.from,
      to: email,
      subject: 'Your Verification Code - MolarRecord Dental Clinic',
      text: `Your verification code is: ${otp}. It will expire in 5 minutes.`,
      html: htmlTemplate
    });
  } catch (error) {
    console.error("Failed to send verification email:", error);
    return res.status(502).json({ message: "Could not send verification code. Please try again later." });
  }

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

// Check if new password is same as old password
exports.checkPassword = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Email and password required" });
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return res.status(404).json({ message: "User not found" });
  const isSame = await bcrypt.compare(password, user.password);
  res.json({ isSame });
};
