const express = require("express");
const {
  loginUser,
  registerUser,
  editUser,
  getUserById,
  getAllUsersByRole,
  deleteUser,
} = require("../controllers/loginNRegisterController.js");

const authenticateUser = require("../middleware/authMiddleware");

const router = express.Router();

// Auth routes
router.post("/login", loginUser);
router.post("/signup", registerUser);

// User routes
router.get("/user", getAllUsersByRole); // ?role=staff
router.get("/user/:userId", authenticateUser, getUserById);
router.put("/user/edit", editUser);
router.delete("/delete/:userId", deleteUser); // DELETE route

module.exports = router;
