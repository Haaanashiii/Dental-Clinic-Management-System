const express = require('express');
const router = express.Router();
const { createRecord ,getFilteredRecords,markAsPaid} = require('../controllers/recordController');

router.post('/create', createRecord);
router.get('/list', getFilteredRecords);
router.put('/pay/:recordId', markAsPaid);

module.exports = router;