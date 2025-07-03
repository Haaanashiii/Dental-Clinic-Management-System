const Records = require('../models/records.models');


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
      fine // ← ADD THIS
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

    try {
      const Patient = require('../models/patient.models');
      const User = require('../models/user.models');
      const Dentist = require('../models/dentist.models');
      const nodemailer = require('nodemailer');

      const patient = await Patient.findOne({ patientId });
      const patientName = patient?.name || 'Patient';
      const userId = patient?.userId;

      let userEmail = '';
      if (userId) {
        const user = await User.findOne({ userId });
        userEmail = user?.email || '';
      }

      let dentistName = dentistId;
      if (dentistId) {
        const dentist = await Dentist.findOne({ dentistId });
        if (dentist && dentist.name) dentistName = dentist.name;
      }

      if (userEmail) {
        let formattedVisitDate = visitDate;
        try {
          const dateObj = new Date(visitDate);
          formattedVisitDate = dateObj.toLocaleString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Singapore'
          });
        } catch (e) { /* fallback to raw */ }

        
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'alipintester1245@gmail.com',
            pass: 'knrq hevi pszd hofd',
          },
        });

        // Email content
        const mailOptions = {
          from: 'alipintester1245@gmail.com',
          to: userEmail,
          subject: 'Dental Visit Record & Fine Details',
          text: `Dear ${patientName},\n\nYour dental visit record has been created.\n\nDentist: ${dentistName}\nVisit Date: ${formattedVisitDate}\nDiagnosis: ${diagnosis || 'N/A'}\nTreatment: ${treatment || 'N/A'}\nFine: $${fine || 0} (${fine > 0 ? 'Unpaid' : 'Paid'})\n\nThank you for visiting!`,
        };

        await transporter.sendMail(mailOptions);
      }
    } catch (emailErr) {
      console.error('Error sending record email:', emailErr);
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
    const updated = await Records.findByIdAndUpdate(
      recordId,
      { fineStatus: 'paid' },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Record not found' });
    res.status(200).json({ message: 'Record marked as paid', record: updated });
  } catch (err) {
    console.error("Error updating fineStatus:", err);
    res.status(500).json({ message: 'Error updating fine status' });
  }
};
