/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useCallback } from 'react';
import ClientSidebar from "../UserFiling/ClientSidebar";
import {
  Typography, Stack, Button, TextField,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Grid, Modal, Box, TablePagination
} from '@mui/material';
import { styled } from '@mui/material/styles';
import axios from "axios";
import './ManageRecord.css';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: '#1c444d',
  color: '#fff',
  fontWeight: 'bold',
  textAlign: 'center'
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: '#f9f9f9',
  },
}));

function ManageRecord() {
  const [records, setRecords] = useState([]);
  const [filterStatus, setFilterStatus] = useState("");
  const [searchPatient, setSearchPatient] = useState("");
  const [searchDentist, setSearchDentist] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [zoomImage, setZoomImage] = useState(null);
  // Add a new state to control the record details modal
  const [recordModalOpen, setRecordModalOpen] = useState(false);
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;

  const fetchRecords = useCallback(async () => {
    try {
      const url = filterStatus
        ? `${import.meta.env.VITE_API_BASE_URL}/record/list?status=${filterStatus}`
        : `${import.meta.env.VITE_API_BASE_URL}/record/list`;

      const response = await axios.get(url);
      const data = response.data.data || [];

      const enriched = await Promise.all(
        data.map(async (record) => {
          let patientName = "Unknown";
          let dentistName = "Unknown";

          try {
            const resPatient = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/patient/name/${record.patientId}`);
            patientName = resPatient.data?.name ?? "Unknown";
          } catch (e) {
            console.warn("❗ Could not fetch patient", e);
          }

          try {
            const resDentist = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/dentist/name/${record.dentistId}`);
            dentistName = resDentist.data?.name ?? "Unknown";
          } catch (e) {
            console.warn("❗ Could not fetch dentist", e);
          }

          return { ...record, patientName, dentistName };
        })
      );

      setRecords(enriched);
    } catch (error) {
      console.error("🚨 Failed to fetch records:", error);
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords, filterStatus]);

  const handleSearchPatient = (e) => {
    setSearchPatient(e.target.value);
    if (e.target.value) setSearchDentist("");
  };

  const handleSearchDentist = (e) => {
    setSearchDentist(e.target.value);
    if (e.target.value) setSearchPatient("");
  };

  const markAsPaid = async (recordId) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/record/pay/${recordId}`);
      alert("Marked as paid");
      fetchRecords();
    } catch {
      alert("Failed to update status");
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const filteredRecords = records.filter((record) => {
    const patientMatch = searchPatient === "" || record.patientName.toLowerCase().includes(searchPatient.toLowerCase());
    const dentistMatch = searchDentist === "" || record.dentistName.toLowerCase().includes(searchDentist.toLowerCase());
    return patientMatch && dentistMatch;
  });

  const paginatedRecords = filteredRecords.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Add a function to handle record selection and modal opening
  const handleRecordSelect = (record) => {
    setSelectedRecord(record);
    setRecordModalOpen(true);
  };

  // Add a function to close the record details modal
  const handleCloseRecordModal = () => {
    setRecordModalOpen(false);
  };

  return (
    <div className="ManageRecord-dashboard">
      <ClientSidebar />
      <div className='RecordContent'>
        <div className='RecordTableList'>
          <h1>Record List</h1>
          <Stack direction="row" spacing={2} mb={2}>
            <Button variant={filterStatus === "paid" ? "contained" : "outlined"} onClick={() => setFilterStatus("paid")}>Paid</Button>
            <Button variant={filterStatus === "unpaid" ? "contained" : "outlined"} onClick={() => setFilterStatus("unpaid")}>Unpaid</Button>
            <Button variant={filterStatus === "" ? "contained" : "outlined"} onClick={() => setFilterStatus("")}>All</Button>
          </Stack>

          <Grid container spacing={2} mb={2}>
            <Grid item xs={6}>
              <TextField label="Search by patient name" fullWidth value={searchPatient} onChange={handleSearchPatient} />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Search by dentist name" fullWidth value={searchDentist} onChange={handleSearchDentist} />
            </Grid>
          </Grid>

          <TableContainer component={Paper}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <StyledTableCell>Patient</StyledTableCell>
                  <StyledTableCell>Dentist</StyledTableCell>
                  <StyledTableCell>Treatment</StyledTableCell>
                  <StyledTableCell>Diagnosis</StyledTableCell>
                  <StyledTableCell>Fine</StyledTableCell>
                  <StyledTableCell>Visit Date</StyledTableCell>
                  <StyledTableCell>Status</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedRecords.length > 0 ? paginatedRecords.map((record) => (
                  <StyledTableRow 
                    key={record._id} 
                    onClick={() => handleRecordSelect(record)} 
                    className="ClickableRow"
                  >
                    <TableCell>{record.patientName}</TableCell>
                    <TableCell>{record.dentistName}</TableCell>
                    <TableCell>{record.treatment}</TableCell>
                    <TableCell>{record.diagnosis}</TableCell>
                    <TableCell>{parseFloat(record.fine?.$numberDecimal ?? 0).toFixed(2)}</TableCell>
                    <TableCell>{new Date(record.visitDate).toLocaleDateString()}</TableCell>
                    <TableCell>{record.fineStatus}</TableCell>
                  </StyledTableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">No records found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={filteredRecords.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[]}
          />
        </div>
      </div>

      {/* Record Details Modal */}
      <Modal 
        open={recordModalOpen} 
        onClose={handleCloseRecordModal}
        aria-labelledby="record-details-modal"
      >
        <Box 
          className="RecordModalContent"
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 700,
            maxWidth: '95vw',
            maxHeight: '90vh',
            bgcolor: 'background.paper',
            borderRadius: 3,
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}
        >
          {selectedRecord ? (
            <div>

              <Box sx={{ 
                bgcolor: '#1c444d', 
                color: 'white', 
                p: 3,
                borderBottom: '1px solid #e0e0e0'
              }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  Medical Record Details
                </Typography>
              </Box>

              <Box sx={{ p: 3, maxHeight: '60vh', overflow: 'auto' }}>
                {/* Patient & Dentist Info */}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, bgcolor: '#f8f9fa', border: '1px solid #e9ecef' }}>
                      <Typography variant="h6" color="#1c444d" gutterBottom>
                        Patient Information
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {selectedRecord.patientName}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, bgcolor: '#f8f9fa', border: '1px solid #e9ecef' }}>
                      <Typography variant="h6" color="#1c444d" gutterBottom>
                        Attending Dentist
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {selectedRecord.dentistName}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>

                <Paper sx={{ p: 3, mb: 3, border: '1px solid #e9ecef' }}>
                  <Typography variant="h6" color="#1c444d" gutterBottom sx={{ mb: 2 }}>
                    Medical Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                          TREATMENT
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.5 }}>
                          {selectedRecord.treatment}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                          DIAGNOSIS
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.5 }}>
                          {selectedRecord.diagnosis}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                          VISIT DATE
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.5 }}>
                          {new Date(selectedRecord.visitDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                          STATUS
                        </Typography>
                        <Box sx={{ mt: 0.5 }}>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              display: 'inline-block',
                              px: 2, 
                              py: 0.5, 
                              borderRadius: 1,
                              fontWeight: 500,
                              bgcolor: selectedRecord.fineStatus === 'paid' ? '#e8f5e8' : '#fff3cd',
                              color: selectedRecord.fineStatus === 'paid' ? '#2e7d32' : '#856404',
                              textTransform: 'uppercase',
                              fontSize: '0.75rem'
                            }}
                          >
                            {selectedRecord.fineStatus}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>

                <Paper sx={{ p: 3, mb: 3, border: '1px solid #e9ecef' }}>
                  <Typography variant="h6" color="#1c444d" gutterBottom>
                    Financial Information
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      AMOUNT:
                    </Typography>
                    <Typography variant="h6" color="#1c444d" sx={{ fontWeight: 600 }}>
                      ₱{parseFloat(selectedRecord.fine?.$numberDecimal ?? 0).toFixed(2)}
                    </Typography>
                  </Box>
                </Paper>


                {selectedRecord.images?.length > 0 && (
                  <Paper sx={{ p: 3, border: '1px solid #e9ecef' }}>
                    <Typography variant="h6" color="#1c444d" gutterBottom sx={{ mb: 2 }}>
                      Medical Images ({selectedRecord.images.length})
                    </Typography>
                    <Box sx={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', 
                      gap: 2 
                    }}>
                      {selectedRecord.images.map((img, i) => (
                        <Box
                          key={i}
                          sx={{
                            position: 'relative',
                            cursor: 'pointer',
                            borderRadius: 2,
                            overflow: 'hidden',
                            border: '2px solid #e0e0e0',
                            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                            '&:hover': {
                              transform: 'scale(1.05)',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                            }
                          }}
                          onClick={() => setZoomImage(img)}
                        >
                          <img
                            src={img}
                            alt={`Medical record ${i + 1}`}
                            style={{ 
                              width: '100%', 
                              height: '120px', 
                              objectFit: 'cover',
                              display: 'block'
                            }}
                          />
                        </Box>
                      ))}
                    </Box>
                  </Paper>
                )}
              </Box>

              <Box sx={{ 
                p: 3, 
                borderTop: '1px solid #e0e0e0',
                bgcolor: '#f8f9fa',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 2
              }}>
                <Button 
                  variant="outlined"
                  onClick={handleCloseRecordModal}
                  sx={{ 
                    minWidth: 100,
                    color: '#6c757d',
                    borderColor: '#6c757d',
                    '&:hover': {
                      borderColor: '#5a6268',
                      bgcolor: 'transparent'
                    }
                  }}
                >
                  Close
                </Button>
                {selectedRecord.fineStatus === "unpaid" && (
                  <Button 
                    variant="contained" 
                    onClick={() => {
                      markAsPaid(selectedRecord._id);
                      handleCloseRecordModal();
                    }}
                    sx={{ 
                      minWidth: 120,
                      bgcolor: '#28a745',
                      '&:hover': {
                        bgcolor: '#218838'
                      }
                    }}
                  >
                    Mark as Paid
                  </Button>
                )}
              </Box>
            </div>
          ) : (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                No record selected
              </Typography>
            </Box>
          )}
        </Box>
      </Modal>

      {/* Image Zoom Modal - keep this one */}
      <Modal open={!!zoomImage} onClose={() => setZoomImage(null)}>
        <Box sx={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)', bgcolor: 'background.paper',
          boxShadow: 24, p: 2, borderRadius: 2
        }}>
          <img src={zoomImage} alt="Zoomed" style={{ maxWidth: '100%', maxHeight: '80vh' }} />
        </Box>
      </Modal>
    </div>
  );
}

export default ManageRecord;
