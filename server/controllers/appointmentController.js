const Appointments = require('../models/appointment.models');
const nodemailer = require('nodemailer');
const User = require('../models/user.models');
const Patient = require('../models/patient.models');
const Audit = require('../models/audit.models'); // Add Audit model for direct logging
const axios = require('axios');
const { writeAuditLog } = require('../utils/auditLogHelper');

exports.createAppointment = async (req, res) => {
  try {
    const { patientId, dentistId, appointmentDate, appointmentTime, status, remarks } = req.body;

    // Prevent duplicate appointment for same patient, dentist, date, and time
    const existing = await Appointments.findOne({
      patientId,
      dentistId,
      appointmentDate: new Date(appointmentDate),
      appointmentTime
    });
    if (existing) {
      return res.status(409).json({ message: 'An appointment already exists for this patient, dentist, date, and time.' });
    }

    const newAppointment = new Appointments({
      patientId,
      dentistId,
      appointmentDate,
      appointmentTime,
      status,
      remarks
    });

    await newAppointment.save();

    let patientName = patientId;
    let dentistName = dentistId;
    try {
      const Dentist = require('../models/dentist.models');
      const patient = await Patient.findOne({ patientId });
      if (patient && patient.name) patientName = patient.name;
      const dentist = await Dentist.findOne({ dentistId });
      if (dentist && dentist.name) dentistName = dentist.name;
    } catch (e) { console.error('Error fetching patient/dentist name:', e); }

    // Format date and time
    let readableDateTime = appointmentDate;
    try {
      const dateObj = new Date(appointmentDate);
      const [hours, minutes] = appointmentTime.split(':');
      dateObj.setHours(Number(hours), Number(minutes));
      readableDateTime = dateObj.toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' });
    } catch (e) {  }

    //email==-
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'molarrecord0@gmail.com',
        pass: 'sgzg nnup buqa onqt',
      },
    });

    // HTML email template for new appointment
    const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Appointment Created</title>
      <style>
        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          line-height: 1.6;
          color: #333333;
          margin: 0;
          padding: 0;
          background-color: #f9f9f9;
        }
        .wrapper {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .card {
          background-color: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
        }
        .header {
          background-color: #1c444d;
          padding: 30px 0;
          text-align: center;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: white;
          letter-spacing: 1px;
        }
        .content {
          padding: 40px 30px;
          text-align: center;
        }
        .title {
          font-size: 26px;
          margin-bottom: 10px;
          color: #1c444d;
          font-weight: 600;
        }
        .subtitle {
          font-size: 16px;
          margin-bottom: 30px;
          color: #666666;
        }
        .info-box {
          background-color: #f0f7f8;
          border: 2px solid #e0eef0;
          border-radius: 8px;
          padding: 20px;
          margin: 25px 0;
          text-align: left;
        }
        .info-item {
          margin-bottom: 12px;
        }
        .info-label {
          font-weight: bold;
          color: #1c444d;
        }
        .info-value {
          color: #333;
        }
        .message {
          font-size: 16px;
          color: #1c444d;
          margin-top: 20px;
        }
        .note {
          font-size: 14px;
          color: #777777;
          margin-top: 30px;
          font-style: italic;
        }
        .footer {
          background-color: #f5f5f5;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #999999;
        }
        .divider {
          height: 1px;
          background-color: #eeeeee;
          margin: 30px 0;
        }
        .highlight {
          color: #1c444d;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="card">
          <div class="header">
            <div class="logo">MolarRecord Dental Clinic</div>
          </div>
          <div class="content">
            <h1 class="title">New Appointment Created</h1>
            <p class="subtitle">A new appointment has been scheduled in the system</p>
            
            <div class="info-box">
              <div class="info-item">
                <span class="info-label">Patient:</span> 
                <span class="info-value">${patientName}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Dentist:</span> 
                <span class="info-value">${dentistName}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Date & Time:</span> 
                <span class="info-value">${readableDateTime}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Status:</span> 
                <span class="info-value highlight">${status}</span>
              </div>
            </div>
            
            <p class="message">Please check the appointment details in the system.</p>
            
            <div class="divider"></div>
            
            <p class="note">
              This is a system notification for the dental clinic staff.
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} MolarRecord Dental Clinic | All rights reserved</p>
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
    `;

    await transporter.sendMail({
      from: '"Molar Record Dental Clinic" <molarrecord0@gmail.com>',
      to: 'molarrecord0@gmail.com',
      subject: 'New Appointment Created - MolarRecord Dental Clinic',
      text: `A new appointment has been created.\n\nPatient: ${patientName}\nDentist: ${dentistName}\nDate & Time: ${readableDateTime}\nStatus: ${status}`,
      html: htmlTemplate
    });

    res.status(201).json(newAppointment);
    // Audit log for appointment creation
    try {
      await writeAuditLog({
        req,
        action: 'Appointment Created',
        targetType: 'appointment',
        targetId: newAppointment.appointmentId || newAppointment._id,
        targetName: `${patientName} with ${dentistName}`,
        after: newAppointment,
        extra: `Appointment created for patient ${patientName} with dentist ${dentistName} on ${readableDateTime}`
      });
    } catch (e) { console.error('Audit log error:', e.message); }
  } catch (err) {
    console.error("Error creating appointment:", err);
    res.status(500).json({ message: "Error creating appointment", error: err.message });
  }
};

// Get appointment by appointmentId
exports.getAppointment = async (req, res) => {
  const { recordId } = req.params;

  try {
    const appointment = await Appointments.findById(recordId);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.status(200).json(appointment);
  } catch (err) {
    console.error("Error retrieving appointment:", err);
    res.status(500).json({ message: "Error retrieving appointment", error: err.message });
  }
};

// Get all appointments
exports.getAllAppointment = async (req, res) => {
  try {
    const appointments = await Appointments.find();
    res.status(200).json(appointments);
  } catch (err) {
    console.error("Error fetching appointments:", err);
    res.status(500).json({ message: "Error fetching appointments", error: err.message });
  }
};

// Edit appointment by appointmentId
exports.editAppointment = async (req, res) => {
  const { inputAppointmentId } = req.params;
  const updateFields = req.body;

  try {
    const updated = await Appointments.findOneAndUpdate(
      { appointmentId: inputAppointmentId },
      updateFields,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.status(200).json(updated);
  } catch (err) {
    console.error("Error updating appointment:", err);
    res.status(500).json({ message: "Error updating appointment", error: err.message });
  }
};

// Delete appointment by appointmentId
exports.deleteAppointment = async (req, res) => {
  const { appointmentId } = req.params;

  try {
    const deleted = await Appointments.findOneAndDelete({ appointmentId });

    if (!deleted) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Audit log for appointment deletion
    if (req.user) {
      await writeAuditLog({
        req,
        action: 'Appointment Deleted',
        targetType: 'appointment',
        targetId: appointmentId,
        targetName: deleted.patientId + ' with ' + deleted.dentistId,
        before: deleted,
        extra: `Appointment ${appointmentId} deleted by ${req.user.name}`
      });
    }

    res.status(200).json({ success: true, message: "Appointment deleted successfully" });
  } catch (err) {
    console.error("Error deleting appointment:", err);
    res.status(500).json({ message: "Error deleting appointment", error: err.message });
  }
};

exports.getAllAppointmentsByPatientId = async (req, res) => {
  const { patientId } = req.params;

  try {
    const appointments = await Appointments.find({ patientId });
    res.status(200).json(appointments);
  } catch (err) {
    console.error("Error fetching appointments by patient ID:", err);
    res.status(500).json({ message: "Error fetching appointments by patient ID", error: err.message });
  }
};

// Get all appointments by status (pending, confirmed, cancelled, completed)
exports.getAllAppointmentsByStatus = async (req, res) => {
  const { status } = req.params;

  try {
    const appointments = await Appointments.find({ status });
    res.status(200).json(appointments);
  } catch (err) {
    console.error("Error fetching appointments by status:", err);
    res.status(500).json({ message: "Error fetching appointments by status", error: err.message });
  }
};

// Edit appointment status to 'cancelled'
exports.cancelAppointment = async (req, res) => {
  const { appointmentId } = req.params;  

  try {
    const updatedAppointment = await Appointments.findOneAndUpdate(
      { appointmentId }, 
      { status: 'cancelled' },
      { new: true }
    );

    if (!updatedAppointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Fetch patient and dentist names for audit log
    let patientName = updatedAppointment.patientId;
    let dentistName = updatedAppointment.dentistId;
    try {
      const patient = await Patient.findOne({ patientId: updatedAppointment.patientId });
      if (patient && patient.name) patientName = patient.name;
      const dentist = await require('../models/dentist.models').findOne({ dentistId: updatedAppointment.dentistId });
      if (dentist && dentist.name) dentistName = dentist.name;
    } catch (e) { /* fallback to IDs */ }
    const dateStr = new Date(updatedAppointment.appointmentDate).toLocaleDateString();
    const timeStr = updatedAppointment.appointmentTime;

    // Audit log for appointment cancellation
    if (req.user) {
      let details = '';
      if (req.user.role === 'patient' && req.user.name === patientName) {
        details = `Patient ${patientName} cancelled their own appointment with dentist ${dentistName} on ${dateStr} at ${timeStr}`;
      } else if (req.user.role === 'dentist' && req.user.name === dentistName) {
        details = `Dentist ${dentistName} cancelled appointment for patient ${patientName} on ${dateStr} at ${timeStr}`;
      } else if (req.user.role === 'staff') {
        details = `Staff ${req.user.name} cancelled appointment for patient ${patientName} with dentist ${dentistName} on ${dateStr} at ${timeStr}`;
      } else {
        details = `${req.user.name} (${req.user.role}) cancelled appointment for patient ${patientName} with dentist ${dentistName} on ${dateStr} at ${timeStr}`;
      }
      await writeAuditLog({
        req,
        action: 'Appointment Cancelled',
        targetType: 'appointment',
        targetId: appointmentId,
        targetName: `${patientName} with ${dentistName}`,
        before: { status: 'confirmed' },
        after: { status: 'cancelled' },
        extra: details
      });
    }

    res.status(200).json(updatedAppointment);
  } catch (err) {
    console.error("Error cancelling appointment:", err);
    res.status(500).json({ message: "Error cancelling appointment", error: err.message });
  }
};

// Confirm appointment by appointmentId
exports.confirmAppointment = async (req, res) => {
  const { appointmentId } = req.params;

  try {
    const updatedAppointment = await Appointments.findOneAndUpdate(
      { appointmentId }, 
      { status: 'confirmed' },
      { new: true }
    );

    if (!updatedAppointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Fetch patient and dentist names for audit log
    let patientName = updatedAppointment.patientId;
    let dentistName = updatedAppointment.dentistId;
    try {
      const patient = await Patient.findOne({ patientId: updatedAppointment.patientId });
      if (patient && patient.name) patientName = patient.name;
      const dentist = await require('../models/dentist.models').findOne({ dentistId: updatedAppointment.dentistId });
      if (dentist && dentist.name) dentistName = dentist.name;
    } catch (e) { /* fallback to IDs */ }
    const dateStr = new Date(updatedAppointment.appointmentDate).toLocaleDateString();
    const timeStr = updatedAppointment.appointmentTime;

    // Audit log for appointment confirmation
    if (req.user) {
      await writeAuditLog({
        req,
        action: 'Appointment Confirmed',
        targetType: 'appointment',
        targetId: appointmentId,
        targetName: `${patientName} with ${dentistName}`,
        after: { status: 'confirmed' },
        extra: `${req.user.name} (${req.user.role}) confirmed appointment for patient ${patientName} with dentist ${dentistName} on ${dateStr} at ${timeStr}`
      });
    }

    const patient = await Patient.findOne({ patientId: updatedAppointment.patientId });
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const user = await User.findOne({ userId: patient.userId });
    if (!user || !user.email) {
      return res.status(404).json({ message: "User email not found" });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'molarrecord0@gmail.com',
        pass: 'sgzg nnup buqa onqt',   
      },
    });

    // Email content
    let formattedDateTime = updatedAppointment.appointmentDate;
    try {
      const dateObj = new Date(updatedAppointment.appointmentDate);
      if (updatedAppointment.appointmentTime) {
        const [hours, minutes] = updatedAppointment.appointmentTime.split(":");
        dateObj.setHours(Number(hours), Number(minutes));
      }
      formattedDateTime = dateObj.toLocaleString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Singapore"
      });
    } catch (e) { /* fallback to raw */ }
    
    // HTML email template
    const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Appointment Confirmed</title>
      <style>
        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          line-height: 1.6;
          color: #333333;
          margin: 0;
          padding: 0;
          background-color: #f9f9f9;
        }
        .wrapper {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .card {
          background-color: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
        }
        .header {
          background-color: #1c444d;
          padding: 30px 0;
          text-align: center;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: white;
          letter-spacing: 1px;
        }
        .content {
          padding: 40px 30px;
          text-align: center;
        }
        .title {
          font-size: 26px;
          margin-bottom: 10px;
          color: #1c444d;
          font-weight: 600;
        }
        .subtitle {
          font-size: 16px;
          margin-bottom: 30px;
          color: #666666;
        }
        .info-box {
          background-color: #f0f7f8;
          border: 2px solid #e0eef0;
          border-radius: 8px;
          padding: 20px;
          margin: 25px 0;
          text-align: left;
        }
        .info-item {
          margin-bottom: 12px;
        }
        .info-label {
          font-weight: bold;
          color: #1c444d;
        }
        .info-value {
          color: #333;
        }
        .message {
          font-size: 16px;
          color: #1c444d;
          margin-top: 20px;
        }
        .note {
          font-size: 14px;
          color: #777777;
          margin-top: 30px;
          font-style: italic;
        }
        .footer {
          background-color: #f5f5f5;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #999999;
        }
        .divider {
          height: 1px;
          background-color: #eeeeee;
          margin: 30px 0;
        }
        .highlight {
          color: #1c444d;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="card">
          <div class="header">
            <div class="logo">Molar Record Dental Clinic</div>
          </div>
          <div class="content">
            <h1 class="title">Appointment Confirmed</h1>
            <p class="subtitle">Your dental appointment has been confirmed!</p>
            
            <div class="info-box">
              <div class="info-item">
                <span class="info-label">Patient:</span> 
                <span class="info-value">${patient.name || 'Patient'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Date & Time:</span> 
                <span class="info-value">${formattedDateTime}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Status:</span> 
                <span class="info-value highlight">Confirmed</span>
              </div>
            </div>
            
            <p class="message">Please arrive 10 minutes before your scheduled appointment time.</p>
            
            <div class="divider"></div>
            
            <p class="note">
              If you need to reschedule or cancel your appointment, please contact us at least 24 hours in advance.
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} MolarRecord Dental Clinic | All rights reserved</p>
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
    `;

    await transporter.sendMail({
      from: '"Molar Record Dental Clinic" <molarrecord0@gmail.com>',
      to: user.email,
      subject: 'Dental Appointment Confirmed - Molar Record Dental Clinic',
      text: `Dear ${patient.name || 'Patient'},\n\nYour appointment has been confirmed for ${formattedDateTime}.\n\nPlease arrive 10 minutes before your scheduled appointment time.\n\nIf you need to reschedule or cancel, please contact us at least 24 hours in advance.\n\nThank you for choosing Molar Record Dental Clinic.`,
      html: htmlTemplate
    });

    res.status(200).json(updatedAppointment);
  } catch (err) {
    console.error("Error confirming appointment:", err);
    res.status(500).json({ message: "Error confirming appointment", error: err.message });
  }
};


// Get all appointments by status and patient ID
exports.getAllAppointmentsByStatusAndPatientId = async (req, res) => {
  const { status, patientId } = req.params;

  try {
    const appointments = await Appointments.find({ status, patientId });
    res.status(200).json(appointments);
  } catch (err) {
    console.error("Error fetching appointments by status and patient ID:", err);
    res.status(500).json({ message: "Error fetching appointments by status and patient ID", error: err.message });
  }
};

//get all appointments by status and dentist ID
exports.getAllAppointmentsByStatusAndDentistId = async (req, res) => {
  const { status, dentistId } = req.params;

  try {
    const appointments = await Appointments.find({ status, dentistId });
    res.status(200).json(appointments);
  } catch (err) {
    console.error("Error fetching appointments by status and dentist ID:", err);
    res.status(500).json({ message: "Error fetching appointments by status and dentist ID", error: err.message });
  }
};

exports.markAppointmentCompleted = async (req, res) => {
  const { appointmentId } = req.params;
  const { remark } = req.body;

  try {
    const updatedAppointment = await Appointments.findOneAndUpdate(
      { appointmentId },
      { status: 'completed', remarks: remark || '' },
      { new: true }
    );

    if (!updatedAppointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Fetch patient and dentist names for audit log
    let patientName = updatedAppointment.patientId;
    let dentistName = updatedAppointment.dentistId;
    try {
      const patient = await Patient.findOne({ patientId: updatedAppointment.patientId });
      if (patient && patient.name) patientName = patient.name;
      const dentist = await require('../models/dentist.models').findOne({ dentistId: updatedAppointment.dentistId });
      if (dentist && dentist.name) dentistName = dentist.name;
    } catch (e) { /* fallback to IDs */ }
    const dateStr = new Date(updatedAppointment.appointmentDate).toLocaleDateString();
    const timeStr = updatedAppointment.appointmentTime;

    // Audit log for appointment completion
    if (req.user) {
      await writeAuditLog({
        req,
        action: 'Appointment Completed',
        targetType: 'appointment',
        targetId: updatedAppointment.appointmentId,
        targetName: `${patientName} with ${dentistName}`,
        after: { status: 'completed' },
        extra: `${req.user.name} (${req.user.role}) reviewed appointment and created a record for patient ${patientName} with dentist ${dentistName} on ${dateStr} at ${timeStr}`
      });
    }

    // Get patient information for email
    const patient = await Patient.findOne({ patientId: updatedAppointment.patientId });
    if (!patient) {
      console.log('Patient not found for email notification');
    } else {
      const user = await User.findOne({ userId: patient.userId });
      
      if (user && user.email) {
        // Format date and time
        let formattedDateTime = updatedAppointment.appointmentDate;
        try {
          const dateObj = new Date(updatedAppointment.appointmentDate);
          if (updatedAppointment.appointmentTime) {
            const [hours, minutes] = updatedAppointment.appointmentTime.split(':');
            dateObj.setHours(Number(hours), Number(minutes));
          }
          formattedDateTime = dateObj.toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
            timeZone: 'Asia/Singapore'
          });
        } catch (e) { /* fallback to raw date */ }

        // HTML email template
        const htmlTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Appointment Completed</title>
          <style>
            body {
              font-family: 'Segoe UI', Arial, sans-serif;
              line-height: 1.6;
              color: #333333;
              margin: 0;
              padding: 0;
              background-color: #f9f9f9;
            }
            .wrapper {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .card {
              background-color: #ffffff;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
            }
            .header {
              background-color: #1c444d;
              padding: 30px 0;
              text-align: center;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: white;
              letter-spacing: 1px;
            }
            .content {
              padding: 40px 30px;
              text-align: center;
            }
            .title {
              font-size: 26px;
              margin-bottom: 10px;
              color: #1c444d;
              font-weight: 600;
            }
            .subtitle {
              font-size: 16px;
              margin-bottom: 30px;
              color: #666666;
            }
            .info-box {
              background-color: #f0f7f8;
              border: 2px solid #e0eef0;
              border-radius: 8px;
              padding: 20px;
              margin: 25px 0;
              text-align: left;
            }
            .info-item {
              margin-bottom: 12px;
            }
            .info-label {
              font-weight: bold;
              color: #1c444d;
            }
            .info-value {
              color: #333;
            }
            .message {
              font-size: 16px;
              color: #1c444d;
              margin-top: 20px;
            }
            .note {
              font-size: 14px;
              color: #777777;
              margin-top: 30px;
              font-style: italic;
            }
            .footer {
              background-color: #f5f5f5;
              padding: 20px;
              text-align: center;
              font-size: 12px;
              color: #999999;
            }
            .divider {
              height: 1px;
              background-color: #eeeeee;
              margin: 30px 0;
            }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="card">
              <div class="header">
                <div class="logo">Molar Record Dental Clinic</div>
              </div>
              <div class="content">
                <h1 class="title">Appointment Completed</h1>
                <p class="subtitle">Thank you for visiting our dental clinic!</p>
                
                <div class="info-box">
                  <div class="info-item">
                    <span class="info-label">Patient:</span> 
                    <span class="info-value">${patient.name || 'Patient'}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Date & Time:</span> 
                    <span class="info-value">${formattedDateTime}</span>
                  </div>
                  ${remark ? `
                  <div class="info-item">
                    <span class="info-label">Remarks:</span> 
                    <span class="info-value">${remark}</span>
                  </div>` : ''}
                </div>
                
                <p class="message">We hope you had a pleasant experience with our services.</p>
                
                <div class="divider"></div>
                
                <p class="note">
                  If you have any questions about your dental care or need to schedule a follow-up,
                  please don't hesitate to contact us.
                </p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} Molar Record Dental Clinic | All rights reserved</p>
                <p>This is an automated message. Please do not reply to this email.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
        `;

        // Send email notification
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'molarrecord0@gmail.com',
            pass: 'sgzg nnup buqa onqt',   
          },
        });

        await transporter.sendMail({
          from: '"Molar Record Dental Clinic" <molarrecord0@gmail.com>',
          to: user.email,
          subject: 'Dental Appointment Completed - Molar Record Dental Clinic',
          text: `Dear ${patient.name || 'Patient'},\n\nYour dental appointment on ${formattedDateTime} has been completed.\n\n${remark ? `Remarks: ${remark}\n\n` : ''}Thank you for visiting Molar Record Dental Clinic.`,
          html: htmlTemplate
        });
      }
    }

    res.status(200).json({ message: 'Appointment marked as completed', appointment: updatedAppointment });
  } catch (err) {
    console.error('Error updating appointment:', err);
    res.status(500).json({ message: 'Failed to mark appointment as completed', error: err.message });
  }
};