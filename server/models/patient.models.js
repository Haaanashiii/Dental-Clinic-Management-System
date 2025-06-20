const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');

const patientsSchema = new mongoose.Schema({
  patientId: { type: String, default: uuidv4, unique: true },
  userId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  birthdate: { type: Date, required: true },
  address: { type: String, required: true },
  contactNumber: {
    type: String,
    required: true,
    match: [/^\d+$/, 'Contact number must contain only digits']
  },
  profileImage: { type: String },
});

module.exports = mongoose.model('Patient', patientsSchema);
