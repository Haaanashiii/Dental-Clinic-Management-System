/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import ClientSidebar from "../UserPannel/ClientSidebar";
import { styled } from '@mui/material/styles';
import {
  Table, TableBody, TableCell, tableCellClasses,
  TableContainer, TableHead, TableRow, Paper, TablePagination, Button,
  Modal, Box, TextField, MenuItem
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import RateReviewIcon from '@mui/icons-material/RateReview';
import api from '../../api';
import dayjs from 'dayjs';
import imageCompression from 'browser-image-compression';
import './ManageAppointment.css';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: '#1c444d',
    color: '#ffffff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    textAlign: 'center',
    color: '#1c444d',
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: '#f2fafa',
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

// Content animation variants
const contentVariants = {
  initial: { opacity: 0, x: 20, y: 10 },
  animate: { opacity: 1, x: 0, y: 0 },
  exit: { opacity: 0, x: -20, y: 10 }
};

const diagnosisTreatmentMap = {
  'Dental Caries': ['Dental Fillings', 'Inlays / Onlays', 'Crowns', 'Root Canal Therapy'],
  'Pulpitis': ['Root Canal Therapy', 'Pulpotomy', 'Tooth Extraction'],
  'Periapical Abscess': ['Root Canal Therapy', 'Apicoectomy', 'Tooth Extraction'],
  'Tooth Fracture / Cracked Tooth Syndrome': ['Crown Placement', 'Bonding', 'Tooth Extraction'],
  'Erosion, Abrasion, Attrition': ['Dental Bonding', 'Crowns', 'Oral Hygiene Instruction'],
  'Impacted Tooth': ['Impacted Tooth Removal', 'Surgical Extraction'],
  'Tooth Mobility': ['Scaling and Root Planing', 'Splinting', 'Periodontal Surgery'],
  'Gingivitis': ['Oral Prophylaxis', 'Topical Fluoride Application'],
  'Periodontitis': ['Scaling and Root Planing', 'Flap Surgery', 'Bone Grafting'],
  'Gingival Recession': ['Gingivoplasty', 'Gingival Grafting'],
  'Peri-implantitis': ['Antibiotics', 'Implant Cleaning', 'Flap Surgery'],
  'Malocclusion': ['Braces', 'Clear Aligners'],
  'Crowded Teeth': ['Orthodontic Expansion', 'Braces'],
  'Overbite / Underbite / Crossbite / Open Bite': ['Braces', 'Jaw Surgery'],
  'Oral Ulcers / Aphthous Ulcers': ['Topical Medications'],
  'Oral Candidiasis': ['Antifungal Medications'],
  'TMD': ['Mouth Guard', 'TMD Therapy'],
  'Bruxism': ['Mouth Guard', 'Botox (optional)'],
  'Oral Cancer / Suspicious Lesions': ['Biopsy', 'Referral to Oncologist'],
};

const StatusBadge = ({ status }) => {
  const getStatusStyle = () => {
    switch (status.toLowerCase()) {
      case 'pending':
        return {
          backgroundColor: 'rgba(255, 152, 0, 0.15)',
          color: '#f57c00',
          borderColor: 'rgba(255, 152, 0, 0.5)'
        };
      case 'confirmed':
        return {
          backgroundColor: 'rgba(76, 175, 80, 0.15)',
          color: '#388e3c',
          borderColor: 'rgba(76, 175, 80, 0.5)'
        };
      case 'cancelled':
        return {
          backgroundColor: 'rgba(244, 67, 54, 0.15)',
          color: '#d32f2f',
          borderColor: 'rgba(244, 67, 54, 0.5)'
        };
      case 'completed':
        return {
          backgroundColor: 'rgba(33, 150, 243, 0.15)',
          color: '#1976d2',
          borderColor: 'rgba(33, 150, 243, 0.5)'
        };
      default:
        return {
          backgroundColor: 'rgba(158, 158, 158, 0.15)',
          color: '#757575',
          borderColor: 'rgba(158, 158, 158, 0.5)'
        };
    }
  };

  const style = getStatusStyle();
  
  return (
    <div 
      className="status-badge"
      style={{
        ...style,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4px 12px',
        borderRadius: '16px',
        fontWeight: 500,
        fontSize: '0.75rem',
        textTransform: 'capitalize',
        border: '1px solid',
        minWidth: '80px',
        margin: '0 auto'
      }}
    >
      {status}
    </div>
  );
};

function ManageAppointment() {
  const [records, setRecords] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [dentistId, setDentistId] = useState('');
  const [loading, setLoading] = useState(true);

  const [openModal, setOpenModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [fineAmount, setFineAmount] = useState('');
  const [remark, setRemark] = useState('');
  const [imageFiles, setImageFiles] = useState([]);

  const userId = sessionStorage.getItem("userId");
  const role = sessionStorage.getItem("role");

  const fetchAppointments = async (status, loadedDentistId = dentistId) => {
    setLoading(true);
    try {
      let res;
      if (role === 'staff') {
        res = status === 'all'
          ? await api.get(`/appointment/getall`)
          : await api.get(`/appointment/status/${status}`);
      } else if (role === 'dentist' && loadedDentistId) {
        res = await api.get(`/appointment/status/${status}/dentist/${loadedDentistId}`);
      }

      const appointmentsWithProfiles = await Promise.all(res.data.map(async (appointment) => {
        let dentistName = "Unknown";
        let patientName = "Unknown";

        try {
          const resPatient = await api.get(`/patient/name/${appointment.patientId}`);
          patientName = resPatient.data?.name ?? "Unknown";
        } catch (e) {
          console.warn("❗ Could not fetch patient", e);
        }

        try {
          const resDentist = await api.get(`/dentist/name/${appointment.dentistId}`);
          dentistName = resDentist.data?.name ?? "Unknown";
        } catch (e) {
          console.warn("❗ Could not fetch dentist", e);
        }

        return { ...appointment, dentistName, patientName };
      }));

      setRecords(appointmentsWithProfiles);
    } catch (err) {
      console.error("Error fetching appointments:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      if (role === 'dentist') {
        try {
          const res = await api.get(`/dentist/profile/user/${userId}`);
          if (res.data.dentistId) {
            setDentistId(res.data.dentistId);
            await fetchAppointments(statusFilter, res.data.dentistId);
          }
        } catch (err) {
          console.error("Failed to fetch dentist profile:", err);
        }
      } else if (role === 'staff') {
        await fetchAppointments(statusFilter);
      }
      setLoading(false);
    };
    init();
  }, [statusFilter, role, userId]);

  const handleCancelAppointment = async (id) => {
    try {
      await api.put(`/appointment/cancel/${id}`);
      alert("Appointment cancelled.");
      fetchAppointments(statusFilter);
    } catch {
      alert("Error cancelling appointment.");
    }
  };

  const handleApproveAppointment = async (id) => {
    try {
      await api.put(`/appointment/confirm/${id}`, { status: 'confirmed' });
      alert("Appointment approved.");
      fetchAppointments(statusFilter);
    } catch {
      alert("Error approving appointment.");
    }
  };

  const handleDeleteAppointment = async (id) => {
    try {
      await api.delete(`/appointment/delete/${id}`);
      alert("Appointment deleted.");
      fetchAppointments(statusFilter);
    } catch {
      alert("Error deleting appointment.");
    }
  };

  const handleReviewAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setDiagnosis('');
    setTreatment('');
    setFineAmount('');
    setRemark('');
    setImageFiles([]);
    if (role === 'staff') {
      setDentistId(appointment.dentistId);
    }
    setOpenModal(true);
  };

  const compressImages = async (files) =>
    await Promise.all(files.map(async (file) => {
      const compressed = await imageCompression(file, { maxSizeMB: 0.3, maxWidthOrHeight: 1200 });
      return await imageCompression.getDataUrlFromFile(compressed);
    }));

  const handleSubmitRecord = async () => {
    try {
      const imageDataArray = await compressImages(imageFiles);
      const recordData = {
        appointmentId: selectedAppointment.appointmentId,
        patientId: selectedAppointment.patientId,
        dentistId: selectedAppointment.dentistId || dentistId,
        diagnosis,
        treatment,
        fine: fineAmount ? Number(fineAmount) : 0,
        images: imageDataArray,
        visitDate: selectedAppointment.appointmentDate,
      };

      await api.post(`/record/create`, recordData);
      await api.put(`/appointment/complete/${selectedAppointment.appointmentId}`, {
        remark,
      });
      alert('Record created and appointment marked as completed.');
      setOpenModal(false);
      fetchAppointments(statusFilter);
    } catch (err) {
      alert('Failed to complete review and update appointment.');
      console.error(err);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const displayedRecords = records.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <div className="ManageAppointment-dashboard">
      <ClientSidebar />
      <motion.div 
        className="profile-container" // Changed from ManageAppointment-content
        variants={contentVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* Header Section with gradient background */}
        <motion.div 
          className="profile-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <motion.h1 
            className="profile-welcome"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            Manage Appointments
          </motion.h1>
          <motion.p 
            className="profile-date"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            Review, approve and manage patient appointments
          </motion.p>
        </motion.div>

        {/* Main Content Area */}
        <motion.div 
          className="profile-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <motion.div 
            style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Button variant={statusFilter === 'confirmed' ? 'contained' : 'outlined'} color="success" onClick={() => setStatusFilter('confirmed')}>Confirmed</Button>
            <Button variant={statusFilter === 'pending' ? 'contained' : 'outlined'} color="warning" onClick={() => setStatusFilter('pending')}>Pending</Button>
            <Button variant={statusFilter === 'cancelled' ? 'contained' : 'outlined'} color="error" onClick={() => setStatusFilter('cancelled')}>Cancelled</Button>
          </motion.div>

          {loading ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              Loading appointments...
            </motion.p>
          ) : (
            <motion.div 
              className='ManageAppointment-table'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <TableContainer component={Paper}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <StyledTableCell>Appointment Date</StyledTableCell>
                      <StyledTableCell>Appointment Time</StyledTableCell>
                      <StyledTableCell>Patient Name</StyledTableCell>
                      <StyledTableCell>Dentist Name</StyledTableCell>
                      <StyledTableCell>Status</StyledTableCell>
                      <StyledTableCell>Action</StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {displayedRecords.map((appointment) => (
                      <StyledTableRow key={appointment.appointmentId}>
                        <StyledTableCell>{new Date(appointment.appointmentDate).toLocaleDateString()}</StyledTableCell>
                        <StyledTableCell>{dayjs(appointment.appointmentTime, 'HH:mm').format('hh:mm A')}</StyledTableCell>
                        <StyledTableCell>{appointment.patientName || "Unknown"}</StyledTableCell>
                        <StyledTableCell>{appointment.dentistName || "Unknown"}</StyledTableCell>
                        <StyledTableCell>
                          <StatusBadge status={appointment.status} />
                        </StyledTableCell>
                        <StyledTableCell>
                          {statusFilter === 'pending' && (
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                              <Button 
                                variant="contained"
                                size="small"
                                startIcon={<CheckIcon />}
                                sx={{
                                  backgroundColor: '#4caf50',
                                  color: 'white',
                                  minWidth: '100px',
                                  '&:hover': {
                                    backgroundColor: '#45a049'
                                  }
                                }}
                                onClick={() => handleApproveAppointment(appointment.appointmentId)}
                              >
                                Approve
                              </Button>
                              <Button 
                                variant="contained"
                                size="small"
                                startIcon={<CancelIcon />}
                                sx={{
                                  backgroundColor: '#f44336',
                                  color: 'white',
                                  minWidth: '90px',
                                  '&:hover': {
                                    backgroundColor: '#d32f2f'
                                  }
                                }}
                                onClick={() => handleCancelAppointment(appointment.appointmentId)}
                              >
                                Cancel
                              </Button>
                            </div>
                          )}
                          {statusFilter === 'confirmed' && (
                            <Button 
                              variant="contained"
                              size="small"
                              startIcon={<RateReviewIcon />}
                              sx={{
                                backgroundColor: '#2196f3',
                                color: 'white',
                                minWidth: '100px',
                                '&:hover': {
                                  backgroundColor: '#1976d2'
                                }
                              }}
                              onClick={() => handleReviewAppointment(appointment)}
                            >
                              Review
                            </Button>
                          )}
                          {statusFilter === 'cancelled' && (
                            <Button 
                              variant="contained"
                              size="small"
                              startIcon={<DeleteIcon />}
                              sx={{
                                backgroundColor: '#f44336',
                                color: 'white',
                                minWidth: '90px',
                                '&:hover': {
                                  backgroundColor: '#d32f2f'
                                }
                              }}
                              onClick={() => handleDeleteAppointment(appointment.appointmentId)}
                            >
                              Delete
                            </Button>
                          )}
                        </StyledTableCell>
                      </StyledTableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={records.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPageOptions={[]}
              />
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {/* Modal animations - keep the existing code */}
      <AnimatePresence>
        {openModal && (
          <Modal open={openModal} onClose={() => setOpenModal(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Box sx={modalStyle}>
                <div className="modal-header">
                  <h2>Review Appointment</h2>
                </div>
                
                <div className="modal-body">
                  <TextField
                    select
                    label="Diagnosis"
                    fullWidth
                    margin="normal"
                    value={diagnosis}
                    onChange={(e) => {
                      setDiagnosis(e.target.value);
                      setTreatment('');
                    }}
                    className="modal-text-field"
                  >
                    {Object.keys(diagnosisTreatmentMap).map((option, index) => (
                      <MenuItem key={index} value={option}>{option}</MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    select
                    label="Treatment"
                    fullWidth
                    margin="normal"
                    value={treatment}
                    onChange={(e) => setTreatment(e.target.value)}
                    disabled={!diagnosis}
                    className="modal-text-field"
                  >
                    {diagnosis && diagnosisTreatmentMap[diagnosis]?.map((option, index) => (
                      <MenuItem key={index} value={option}>{option}</MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    label="Fine (₱)"
                    type="number"
                    fullWidth
                    margin="normal"
                    value={fineAmount}
                    onChange={(e) => setFineAmount(e.target.value)}
                    inputProps={{ min: 0 }}
                    className="modal-text-field"
                  />

                  <TextField
                    label="Remark"
                    multiline
                    rows={3}
                    fullWidth
                    margin="normal"
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    placeholder="Add any notes or summary here..."
                    className="modal-text-field"
                  />

                  {/* Replace the basic file upload with this improved one */}
                  <div className="file-upload-container">
                    <label className="file-upload-button">
                      <AttachFileIcon />
                      Choose Files
                      <input
                        type="file"
                        multiple
                        onChange={(e) => setImageFiles(Array.from(e.target.files))}
                        style={{ display: 'none' }}
                        accept="image/*"
                      />
                    </label>
                    {imageFiles.length > 0 && (
                      <div className="file-list">
                        {imageFiles.map((file, index) => (
                          <div key={index} className="file-list-item">
                            <InsertPhotoIcon fontSize="small" />
                            {file.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="modal-footer">
                  <Button 
                    variant="outlined" 
                    onClick={() => setOpenModal(false)}
                    className="modal-cancel-btn"
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={handleSubmitRecord}
                    className="modal-submit-btn"
                  >
                    Submit Record
                  </Button>
                </div>
              </Box>
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ManageAppointment;
