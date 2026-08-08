const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const nodemailer = require('nodemailer');
const { writeAuditLog } = require('../utils/auditLogHelper');
const User = require("../models/user.models.js");

function normalizeAccountStatus(status) {
  if (typeof status !== "string") {
    return "Pending";
  }

  const trimmedStatus = status.trim();
  if (!trimmedStatus) {
    return "Pending";
  }

  const normalizedStatus = trimmedStatus.toLowerCase();

  switch (normalizedStatus) {
    case "active":
    case "approved":
      return "Active";
    case "pending":
    case "approval pending":
    case "awaiting approval":
    case "awaiting_approval":
      return "Pending";
    case "deactivated":
    case "inactive":
    case "disabled":
      return "Deactivated";
    default:
      return trimmedStatus;
  }
}

exports.normalizeAccountStatus = normalizeAccountStatus;
exports.isAccountStatusAllowedForLogin = (status) => normalizeAccountStatus(status) === "Active";

// Register a new user
exports.registerUser = async (req, res) => {
  try {
    const { email, name, username, password, role } = req.body;

    if (!email || !name || !username || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists based on email or username
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase().trim() }, { username: username.trim() }]
    });

    if (existingUser) {
      return res.status(400).json({ message: "Email or Username already exists" });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user with hashed password
    const newUser = new User({
      userId: uuidv4(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      username: username.trim(),
      password: hashedPassword,  
      role: role.trim(),
      status: "Pending" 
    });

    await newUser.save();

    // Auto-create dentist or staff profile immediately if role is dentist or staff
    if (role.trim() === "dentist") {
      const Dentist = require("../models/dentist.models.js");
      const existing = await Dentist.findOne({ userId: newUser.userId });
      if (!existing) {
        await Dentist.create({ userId: newUser.userId, name: newUser.name });
      }
    } else if (role.trim() === "staff") {
      const Staff = require("../models/staff.models.js");
      const existing = await Staff.findOne({ userId: newUser.userId });
      if (!existing) {
        await Staff.create({ userId: newUser.userId, name: newUser.name });
      }
    }

    // Return success message
    res.status(201).json({ success: true, message: "User registered successfully", userId: newUser.userId });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// Login logic using JWT
exports.loginUser = async (req, res) => {
  const { email, username, password } = req.body;

  try {
    const user = await User.findOne({
      $or: [
        { email: email ? email.toLowerCase().trim() : "" },
        { username: username ? username.trim() : "" }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const normalizedStatus = normalizeAccountStatus(user.status);

    // Check account status
    if (normalizedStatus === "Pending") {
      return res.status(403).json({ message: "Pending account" });
    }
    if (normalizedStatus !== "Active") {
      return res.status(403).json({ message: `Account status: ${user.status}` });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "Server misconfiguration: JWT_SECRET is missing" });
    }

    // Compare the password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token for the user
    const token = jwt.sign(
      { userId: user.userId, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    console.log("Login successful");

    const response = {
      message: "Login successful",
      authToken: token,
      role: user.role,
      userId: user.userId,
      email: user.email,
      name: user.name,
      username: user.username 
    };

    res.status(200).json(response);
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Edit user
exports.editUser = async (req, res) => {
  const { userId, name, username, role, password } = req.body;

  try {
    const user = await User.findOne({ userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Save previous state for audit
    const before = { name: user.name, username: user.username, role: user.role };

    // Update user fields if provided
    if (name && name !== user.name) {
      user.name = name;
    }
    if (username && username !== user.username) {
      user.username = username;
    }
    if (role && role !== user.role) {
      user.role = role;
    }
    if (password) {
      user.password = await bcrypt.hash(password, 10); // Hash the new password
    }

    // Save updated user to database
    await user.save();

    // Audit log for user edit
    if (req.user) {
      await writeAuditLog({
        req,
        action: 'User Edited',
        targetType: 'user',
        targetId: userId,
        targetName: user.name,
        before,
        after: { name: user.name, username: user.username, role: user.role },
        extra: `User ${userId} edited by ${req.user.name}`
      });
    }

    const { password: _, ...userWithoutPassword } = user.toObject(); // Remove password from response

    res.status(200).json({ message: "Profile updated successfully", user: userWithoutPassword });
  } catch (err) {
    console.error("Edit user error:", err);
    res.status(500).json({ message: "Error updating profile", error: err.message });
  }
};
// Get user by id
exports.getUserById = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findOne({ userId });

    if (!user) return res.status(404).json({ message: "User not found" });

    // Return user details excluding the hashed password
    const { password, ...userWithoutPassword } = user.toObject();

    res.status(200).json(userWithoutPassword);
  } catch (err) {
    console.error("Get user by ID error:", err);
    res.status(500).json({ message: "Error retrieving user", error: err.message });
  }
};

// Get all users by role (e.g., /user?role=staff)
exports.getAllUsersByRole = async (req, res) => {
  const { role } = req.query;

  try {
    const query = role ? { role } : {};
    const users = await User.find(query).select("-password"); // exclude password
    res.status(200).json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Error fetching users", error: err.message });
  }
};

// Delete user by userId
exports.deleteUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const deletedUser = await User.findOneAndDelete({ userId });
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    // Audit log for user deletion
    if (req.user) {
      await writeAuditLog({
        req,
        action: 'User Deleted',
        targetType: 'user',
        targetId: userId,
        targetName: deletedUser.name,
        before: deletedUser,
        extra: `User ${userId} deleted by ${req.user.name}`
      });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ message: "Error deleting user", error: err.message });
  }
};


// Change user account status
exports.changeStatusUser = async (req, res) => {
  const { userId } = req.params;
  const { status } = req.body; 

  if (!status) {
    return res.status(400).json({ message: "Status is required in the request body" });
  }

  const normalizedStatus = normalizeAccountStatus(status);
  if (!["Active", "Deactivated", "Pending"].includes(normalizedStatus)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  try {
    const user = await User.findOne({ userId });    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const currentStatus = normalizeAccountStatus(user.status);
    if (currentStatus === normalizedStatus) {
      return res.status(400).json({ message: `User account is already ${normalizedStatus}` });
    }
    const before = { status: user.status };
    user.status = normalizedStatus;
    await user.save();

    // Audit log for user status change
    try {
      if (req.user) {
        await writeAuditLog({
          req,
          action: 'User Status Changed',
          targetType: 'user',
          targetId: userId,
          targetName: user.name,
          before,
          after: { status },
          extra: `${req.user.name} (${req.user.role}) changed status of user ${user.name} (${user.role}) to ${status}`
        });
      } else {
        console.warn('Audit log skipped: req.user missing on status change for user', userId);
      }
    } catch (auditErr) {
      console.error('Audit log error (status change):', auditErr);
    }

    // Auto-create profile on approval
    if (normalizedStatus === "Active") {
      if (user.role === "patient") {
        const Patient = require("../models/patient.models.js");
        const existing = await Patient.findOne({ userId: user.userId });
        if (!existing) {
          await Patient.create({ userId: user.userId, name: user.name });
        }
      } else if (user.role === "staff") {
        const Staff = require("../models/staff.models.js");
        const existing = await Staff.findOne({ userId: user.userId });
        if (!existing) {
          await Staff.create({ userId: user.userId, name: user.name });
        }
      } else if (user.role === "dentist") {
        const Dentist = require("../models/dentist.models.js");
        const existing = await Dentist.findOne({ userId: user.userId });
        if (!existing) {
          await Dentist.create({ userId: user.userId, name: user.name });
        }
      }
    }

    // Send email notification about status change
    if (user.email) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'molarrecord0@gmail.com',
          pass: 'sgzg nnup buqa onqt',   
        },
      });
      
      // HTML email template
      const htmlTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Status Update</title>
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
          .status-box {
            background-color: #f0f7f8;
            border: 2px solid #e0eef0;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
          }
          .status {
            font-size: 32px;
            font-weight: 700;
            color: #1c444d;
          }
          .message {
            margin-top: 25px;
            font-size: 16px;
            color: #555555;
          }
          .contact {
            font-size: 14px;
            color: #777777;
            margin-top: 30px;
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
              <h1 class="title">Account Status Update</h1>
              <p class="subtitle">Hello ${user.name || user.username},</p>
              
              <div class="status-box">
                <div class="status">${status.toUpperCase()}</div>
              </div>
              
              <p class="message">
                Your account status has been updated to <strong>${status}</strong>.
                ${normalizedStatus === 'Active' ? 'You can now log in to your account and use our services.' : ''}
              </p>
              
              <div class="divider"></div>
              
              <p class="contact">
                If you have any questions, please contact us at:<br>
                +63 977 641 4655 / +63 921 355 3335
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
      
      const mailOptions = {
        from: '"MolarRecord Dental Clinic" <molarrecord0@gmail.com>',
        to: user.email,
        subject: 'Account Status Update - MolarRecord Dental Clinic',
        text: `Hello ${user.username || ''},\n\nYour account status has been changed to: ${normalizedStatus.toUpperCase()}.\n\nIf you have questions, please contact +63 977 641 4655/+63 921 355 3335.`,
        html: htmlTemplate
      };
      
      try {
        await transporter.sendMail(mailOptions);
      } catch (mailErr) {
        console.error('Error sending status email:', mailErr);
      }
    }

    res.status(200).json({ message: `User account status changed to ${normalizedStatus}` });
  } catch (err) {
    console.error("Change status user error:", err);
    res.status(500).json({ message: "Error changing user status", error: err.message });
  }
};