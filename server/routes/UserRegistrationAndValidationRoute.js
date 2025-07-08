const express = require("express");
const {
  loginUser,
  registerUser,
  editUser,
  getUserById,
  getAllUsersByRole,
  deleteUser,
  changeStatusUser,
} = require("../controllers/UserRegistrationAndValidationController.js");

const authenticateUser = require("../middleware/authMiddleware.js");

const router = express.Router();

// Auth routes
router.post("/login", loginUser);
router.post("/signup", registerUser);

// User routes
router.get("/user", getAllUsersByRole); // ?role=staff
router.get("/user/:userId", authenticateUser, getUserById);
router.put("/user/edit", authenticateUser, editUser);
router.delete("/delete/:userId", authenticateUser, deleteUser); 
router.put("/status/:userId", authenticateUser, changeStatusUser); 

module.exports = router;
