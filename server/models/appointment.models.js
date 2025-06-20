const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
const appointmentSchema = new mongoose.Schema({
  appointmentId: { type: String, default: uuidv4, unique: true }, 
  patientId: { type: String, required: true },
  dentistId: { type: String, required: true },
  appointmentDate: { type: Date, required: true },
  appointmentTime: { type: String, required: true }, 
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  remarks: { type: String } 
});

module.exports = mongoose.model('Appointments', appointmentSchema);