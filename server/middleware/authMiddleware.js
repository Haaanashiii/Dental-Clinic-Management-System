const jwt = require("jsonwebtoken");
const User = require("../models/user.models.js");

const authenticateUser = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    // Decode the token using the secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user by userId (or adjust this if your schema uses _id)
    const user = await User.findOne({ userId: decoded.userId });

    if (!user) {
      return res.status(401).json({ message: "User not found." });
    }

    req.user = user; // Attach user data to the request object
    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    console.error("Authentication error:", err);  // More detailed logging
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

module.exports = authenticateUser;
