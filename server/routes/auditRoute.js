const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const authenticateUser = require('../middleware/authMiddleware');

// Create audit log (must be authenticated)
router.post('/', authenticateUser, auditController.createAudit);

// Get audit logs (optionally filter by role or user)
router.get('/', auditController.getAudits);

module.exports = router;
