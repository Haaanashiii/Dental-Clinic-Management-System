const express = require('express');
const {
  createProfile,
  getProfile,
  deleteProfile,
  editProfile,
  getAllDentists,
  getDentistByDentistId,
  getNameByDentistId
} = require('../controllers/dentistController');

const router = express.Router();

// Get all dentists
router.get('/profile', getAllDentists);

// Profile creation and editing use base64, not FormData
router.post('/create', createProfile);

// Get profile by userId
router.get('/profile/user/:userId', getProfile);

// Edit profile by userId
router.put('/profile/:userId', editProfile);

// Delete profile by userId
router.delete('/profile/:userId', deleteProfile);

// Get profile by dentistId
router.get('/profile/dentist/:dentistId', getDentistByDentistId);
// Get dentist name by dentistId
router.get('/name/:dentistId', getNameByDentistId);
// Get dentist name by dentistId
module.exports = router;
    