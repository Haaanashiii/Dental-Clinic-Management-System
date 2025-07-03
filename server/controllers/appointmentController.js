const Appointments = require('../models/appointment.models');
const nodemailer = require('nodemailer');
const User = require('../models/user.models');
const Patient = require('../models/patient.models');

exports.createAppointment = async (req, res) => {
  try {
    const { patientId, dentistId, appointmentDate, appointmentTime, status, remarks } = req.body;

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
        user: 'alipintester1245@gmail.com',
        pass: 'knrq hevi pszd hofd',
      },
    });

    const mailOptions = {
      from: 'alipintester1245@gmail.com',
      to: 'alipintester1245@gmail.com',
      subject: 'New Appointment Created',
      text: `A new appointment has been created.\n\nPatient:
       ${patientName}\nDentist: ${dentistName}\nDate & Time: ${readableDateTime}\nStatus: ${status}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending notification email:', error);
      } else {
        console.log('Notification email sent:', info.response);
      }
    });

    res.status(201).json(newAppointment);
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
        user: 'alipintester1245@gmail.com',
        pass: 'knrq hevi pszd hofd',   
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

    const mailOptions = {
      from: 'alipintester1245@gmail.com', // your Gmail address
      to: user.email,
      subject: 'Appointment Confirmed',
      text: `Dear ${patient.name || 'Patient'},\n\nYour appointment has been confirmed for ${formattedDateTime}.\n\nThank you!`,
    };

    // Send email
    await transporter.sendMail(mailOptions);

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

  res.status(200).json({ message: 'Appointment marked as completed', appointment: updatedAppointment });
} catch (err) {
  console.error('Error updating appointment:', err);
  res.status(500).json({ message: 'Failed to mark appointment as completed', error: err.message });
}
};