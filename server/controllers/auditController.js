const Audit = require('../models/audit.models');

// Create a new audit log
exports.createAudit = async (req, res) => {
  try {
    // Always use authenticated user info
    const { _id: userId, name: userName, role } = req.user;
    const { action, details } = req.body;
    const audit = new Audit({ userId, userName, role, action, details });
    await audit.save();
    res.status(201).json({ message: 'Audit log created', audit });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create audit log', error });
  }
};

// Get all audit logs (optionally filter by role or user)
exports.getAudits = async (req, res) => {
  try {
    const { role, userId } = req.query;
    let filter = {};
    if (role) filter.role = role;
    if (userId) filter.userId = userId;
    const audits = await Audit.find(filter).sort({ timestamp: -1 });
    res.status(200).json(audits);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch audit logs', error });
  }
};
