// routes/recordroute.js
const express = require('express');
const processImage = require('../middleware/resizeImageMiddleware');
const authenticateUser = require('../middleware/authMiddleware');
const { createAppointment, 
    getAppointment, 
    deleteAppointment,
    getAllAppointmentsByStatusAndDentistId, 
    getAllAppointmentsByStatusAndPatientId 
    ,editAppointment
    ,cancelAppointment, 
    confirmAppointment,
    getAllAppointment,
    getAllAppointmentsByPatientId,
    getSpecificDentistByUserId,
    markAppointmentCompleted,
    getAllAppointmentsByStatus} 
    = require('../controllers/appointmentController');
const router = express.Router();



//create appointment
router.post('/create', authenticateUser, createAppointment);
// Get all appointments
router.get('/getall', authenticateUser, getAllAppointment);

// Get appointments by appointmentId
router.get('/:recordId', authenticateUser, getAppointment);

// Delete appointments by appointmentId
router.delete('/delete/:appointmentId', authenticateUser, deleteAppointment);

// Get all appointments by patientId
router.get('/patient/:patientId', authenticateUser, getAllAppointmentsByPatientId);

//confirm appointment by appointmentId
router.put('/confirm/:appointmentId', authenticateUser, confirmAppointment);
// Cancel appointment by appointmentId
router.put('/cancel/:appointmentId', authenticateUser, cancelAppointment);
// Mark appointment as completed
router.put('/complete/:appointmentId', authenticateUser, markAppointmentCompleted);

// GET appointments by status AND patientId
router.get('/status/:status/patient/:patientId', authenticateUser, getAllAppointmentsByStatusAndPatientId);

// GET appointments by status AND dentistId
router.get('/status/:status/dentist/:dentistId', authenticateUser, getAllAppointmentsByStatusAndDentistId);

// GET all appointments by status
router.get('/status/:status', authenticateUser, getAllAppointmentsByStatus);

// Edit appointments by appointmentId
router.put('/edit/:appointmentId', authenticateUser, editAppointment);
module.exports = router;