const express = require('express');
const router = express.Router();
const { createRecord ,getFilteredRecords,markAsPaid} = require('../controllers/recordController');
const authenticateUser = require('../middleware/authMiddleware');

router.post('/create', authenticateUser, createRecord);
router.get('/list', authenticateUser, getFilteredRecords);
router.put('/pay/:recordId', authenticateUser, markAsPaid);

module.exports = router;