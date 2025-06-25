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
router.put("/user/edit", editUser);
router.delete("/delete/:userId", deleteUser); 
router.put("/status/:userId", changeStatusUser); 

module.exports = router;
