/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import ClientSidebar from "../UserFiling/ClientSidebar";
import { styled } from '@mui/material/styles';
import {
  Table, TableBody, TableCell, tableCellClasses,
  TableContainer, TableHead, TableRow, Paper, TablePagination, Button,
  Modal, Box, TextField, MenuItem
} from '@mui/material';
import axios from 'axios';
import dayjs from 'dayjs';
import imageCompression from 'browser-image-compression';
import './ManageAppointment.css';

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
          ? await axios.get('http://localhost:1337/appointment/getall')
          : await axios.get(`http://localhost:1337/appointment/status/${status}`);
      } else if (role === 'dentist' && loadedDentistId) {
        res = await axios.get(`http://localhost:1337/appointment/status/${status}/dentist/${loadedDentistId}`);
      }

      const appointmentsWithProfiles = await Promise.all(res.data.map(async (appointment) => {
        let dentistName = "Unknown";
        let patientName = "Unknown";

        try {
          const resPatient = await axios.get(`http://localhost:1337/patient/name/${appointment.patientId}`);
          patientName = resPatient.data?.name ?? "Unknown";
        } catch (e) {
          console.warn("❗ Could not fetch patient", e);
        }

        try {
          const resDentist = await axios.get(`http://localhost:1337/dentist/name/${appointment.dentistId}`);
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
          const res = await axios.get(`http://localhost:1337/dentist/profile/user/${userId}`);
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
      await axios.put(`http://localhost:1337/appointment/cancel/${id}`);
      alert("Appointment cancelled.");
      fetchAppointments(statusFilter);
    } catch {
      alert("Error cancelling appointment.");
    }
  };

  const handleApproveAppointment = async (id) => {
    try {
      await axios.put(`http://localhost:1337/appointment/confirm/${id}`, { status: 'confirmed' });
      alert("Appointment approved.");
      fetchAppointments(statusFilter);
    } catch {
      alert("Error approving appointment.");
    }
  };

  const handleDeleteAppointment = async (id) => {
    try {
      await axios.delete(`http://localhost:1337/appointment/delete/${id}`);
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
      setDentistId(appointment.dentistId); // 👈 Important fix for staff
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
        dentistId: selectedAppointment.dentistId || dentistId, // 👈 Ensures correct ID
        diagnosis,
        treatment,
        fine: fineAmount ? Number(fineAmount) : 0,
        images: imageDataArray,
        visitDate: selectedAppointment.appointmentDate,
      };

      await axios.post('http://localhost:1337/record/create', recordData);
      await axios.put(`http://localhost:1337/appointment/complete/${selectedAppointment.appointmentId}`, {
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
      <div className="ManageAppointment-content">
        <h1>Manage Appointments</h1>

        <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
          <Button variant={statusFilter === 'confirmed' ? 'contained' : 'outlined'} color="success" onClick={() => setStatusFilter('confirmed')}>Confirmed</Button>
          <Button variant={statusFilter === 'pending' ? 'contained' : 'outlined'} color="warning" onClick={() => setStatusFilter('pending')}>Pending</Button>
          <Button variant={statusFilter === 'cancelled' ? 'contained' : 'outlined'} color="error" onClick={() => setStatusFilter('cancelled')}>Cancelled</Button>
        </div>

        {loading ? (
          <p>Loading appointments...</p>
        ) : (
          <div className='ManageAppointment-table'>
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
                      <StyledTableCell>{appointment.status}</StyledTableCell>
                      <StyledTableCell>
                        {statusFilter === 'pending' && (
                          <>
                            <Button color="success" onClick={() => handleApproveAppointment(appointment.appointmentId)}>Approve</Button>
                            <Button color="error" onClick={() => handleCancelAppointment(appointment.appointmentId)}>Cancel</Button>
                          </>
                        )}
                        {statusFilter === 'confirmed' && (
                          <Button color="primary" onClick={() => handleReviewAppointment(appointment)}>Review</Button>
                        )}
                        {statusFilter === 'cancelled' && (
                          <Button color="error" onClick={() => handleDeleteAppointment(appointment.appointmentId)}>Delete</Button>
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
          </div>
        )}

        <Modal open={openModal} onClose={() => setOpenModal(false)}>
          <Box sx={modalStyle}>
            <h2>Review Appointment</h2>
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
            />

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setImageFiles(Array.from(e.target.files))}
              style={{ marginTop: '1rem' }}
            />

            <Button variant="contained" color="primary" onClick={handleSubmitRecord} sx={{ mt: 2 }}>
              Submit Record
            </Button>
          </Box>
        </Modal>
      </div>
    </div>
  );
}

export default ManageAppointment;
