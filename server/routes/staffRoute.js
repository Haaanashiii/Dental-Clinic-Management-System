// routes/staffroute.js
const express = require('express');
const multer = require('multer');
const processImage = require('../middleware/resizeImageMiddleware');
const { createProfile, getProfile, deleteProfile, editProfile} = require('../controllers/staffController');
const router = express.Router();

// Multer setup for handling file uploads
const upload = multer({ dest: 'uploads/' });

// Use the image processing middleware before the controller action
router.post('/create', upload.array('profileImages', 5), processImage, createProfile); 

// Get profile by userId
router.get('/profile/:userId', getProfile);

// Edit profile by userId
router.put('/profile/:userId', editProfile);

// Delete profile by userId
router.delete('/profile/:userId', deleteProfile);

module.exports = router;
