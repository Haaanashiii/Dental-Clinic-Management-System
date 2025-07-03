const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const nodemailer = require('nodemailer');
const User = require("../models/user.models.js");

// Register a new user
exports.registerUser = async (req, res) => {
  try {
    const { email,name, username, password, role } = req.body;

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

    // Return success message
    res.status(201).json({ success: true, message: "User registered successfully" });
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

    // Check account status
    if (user.status === "Pending") {
      return res.status(403).json({ message: "Pending account" });
    }
    if (user.status !== "Active") {
      return res.status(403).json({ message: `Account status: ${user.status}` });
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

  try {
    const user = await User.findOne({ userId });    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.status === status) {
      return res.status(400).json({ message: `User account is already ${status}` });
    }
    user.status = status;
    await user.save();

    // Auto-create profile on approval
    if (status === "Active") {
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
          user: 'alipintester1245@gmail.com', // your Gmail address
          pass: 'knrq hevi pszd hofd', // new app password
        },
      });
      const mailOptions = {
        from: 'alipintester1245@gmail.com',
        to: user.email,
        subject: 'Account Status Update',
        text: `Hello ${user.username || ''},\n\nYour account status has been changed to: ${status.toUpperCase()}.\n\nIf you have questions, please contact +63 977 641 4655/+63 921 355 3335.`,
      };
      try {
        await transporter.sendMail(mailOptions);
      } catch (mailErr) {
        console.error('Error sending status email:', mailErr);
      }
    }

    res.status(200).json({ message: `User account status changed to ${status}` });
  } catch (err) {
    console.error("Change status user error:", err);
    res.status(500).json({ message: "Error changing user status", error: err.message });
  }
};