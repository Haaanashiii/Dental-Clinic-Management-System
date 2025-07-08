const Records = require('../models/records.models');
const axios = require('axios');
const { LOCAL_IP } = require('../config/localIP');
const { SERVER_PORT } = require('../index');
const Audit = require('../models/audit.models'); // Add Audit model for direct logging
const { writeAuditLog } = require('../utils/auditLogHelper');


exports.createRecord = async (req, res) => {
  try {
    const {
      appointmentId,
      patientId,
      dentistId,
      diagnosis,
      treatment,
      images,
      visitDate,
      fine
    } = req.body;

    // Validate base64 images
    if (images && images.length > 0) {
      for (const img of images) {
        const base64Regex = /^data:image\/(png|jpeg|jpg);base64,/;
        if (!base64Regex.test(img)) {
          return res.status(400).json({ message: "Invalid image format. Must be base64 with image data URI." });
        }
        const sizeInBytes = Buffer.from(img.split(',')[1], 'base64').length;
        if (sizeInBytes > 1024 * 1024) {
          return res.status(400).json({ message: "Image too large. Max size is 1MB." });
        }
      }
    }

    const newRecord = new Records({
      appointmentId,
      patientId,
      dentistId,
      diagnosis,
      treatment,
      images,
      visitDate,
      fine: fine || 0,          
      fineStatus: fine > 0 ? 'unpaid' : 'paid'
    });

    await newRecord.save();

    let patientName = patientId;
    let dentistName = dentistId;
    try {
      const patient = await Patient.findOne({ patientId });
      if (patient && patient.name) patientName = patient.name;
      const dentist = await Dentist.findOne({ dentistId });
      if (dentist && dentist.name) dentistName = dentist.name;
    } catch (e) { /* fallback to IDs */ }
    const dateStr = new Date(visitDate).toLocaleDateString();
    // Audit log for record creation
    if (req.user) {
      await writeAuditLog({
        req,
        action: 'Record Created',
        targetType: 'record',
        targetId: newRecord._id,
        targetName: `${patientName} with ${dentistName}`,
        after: newRecord,
        extra: `${req.user.name} (${req.user.role}) created a record for patient ${patientName} with dentist ${dentistName} on ${dateStr}`
      });
    }
    res.status(201).json({ message: 'Record created successfully', record: newRecord });
  } catch (err) {
    console.error("Error creating record:", err);
    res.status(500).json({ message: "Failed to create record", error: err.message });
  }
};


exports.getFilteredRecords = async (req, res) => {
  try {
    const { status } = req.query;
    let filter = {};


    if (status) {
      if (!['paid', 'unpaid'].includes(status)) {
        return res.status(400).json({ message: "Invalid status. Must be 'paid' or 'unpaid'." });
      }
      filter.fineStatus = status;
    }

    const records = await Records.find(filter).sort({ visitDate: -1 });

    res.status(200).json({ data: records });
  } catch (err) {
    console.error("Error fetching records:", err);
    res.status(500).json({ message: "Failed to fetch records", error: err.message });
  }
};
//mark paid
exports.markAsPaid = async (req, res) => {
  const { recordId } = req.params;
  try {
    // Get the user from the JWT token (for auditing)
    const user = req.user;
    const beforeRecord = await Records.findById(recordId);
    const updated = await Records.findByIdAndUpdate(
      recordId,
      { fineStatus: 'paid' },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Record not found' });
    // Fetch patient and dentist names for audit log
    let patientName = updated.patientId;
    let dentistName = updated.dentistId;
    try {
      const Patient = require('../models/patient.models');
      const Dentist = require('../models/dentist.models');
      const patient = await Patient.findOne({ patientId: updated.patientId });
      if (patient && patient.name) patientName = patient.name;
      const dentist = await Dentist.findOne({ dentistId: updated.dentistId });
      if (dentist && dentist.name) dentistName = dentist.name;
    } catch (e) { /* fallback to IDs */ }
    // Audit log for marking record as paid
    try {
      if (user) {
        await writeAuditLog({
          req,
          action: 'Record Marked as Paid',
          targetType: 'record',
          targetId: updated._id,
          targetName: `${patientName} with ${dentistName}`,
          before: { fineStatus: beforeRecord ? beforeRecord.fineStatus : 'unpaid' },
          after: { fineStatus: 'paid' },
          extra: `${user.name} (${user.role}) marked record as paid.`
        });
      }
    } catch (auditErr) {
      console.error('Audit log error (mark as paid):', auditErr);
    }
    res.status(200).json({ message: 'Record marked as paid', record: updated });
  } catch (err) {
    console.error('Error updating fineStatus:', err);
    res.status(500).json({ message: 'Error updating fine status' });
  }
};
