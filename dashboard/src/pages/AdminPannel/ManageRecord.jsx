/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import ClientSidebar from "../UserPannel/ClientSidebar";
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

// Content animation variants
const contentVariants = {
  initial: { opacity: 0, x: 20, y: 10 },
  animate: { opacity: 1, x: 0, y: 0 },
  exit: { opacity: 0, x: -20, y: 10 }
};

function ManageRecord() {
  const [records, setRecords] = useState([]);
  const [filterStatus, setFilterStatus] = useState("");
  const [searchPatient, setSearchPatient] = useState("");
  const [searchDentist, setSearchDentist] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [zoomImage, setZoomImage] = useState(null);
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

  const handleRecordSelect = (record) => {
    setSelectedRecord(record);
    setRecordModalOpen(true);
  };

  const handleCloseRecordModal = () => {
    setRecordModalOpen(false);
  };

  return (
    <div className="ManageRecord-dashboard">
      <ClientSidebar />
      <motion.div 
        className="profile-container" // Changed from RecordContent
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
            Medical Records
          </motion.h1>
          <motion.p 
            className="profile-date"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            Manage patient treatment records and payment status
          </motion.p>
        </motion.div>

        {/* Main Content Area */}
        <motion.div 
          className="profile-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          sx={{ display: 'flex', flexDirection: 'column', height: '100%' }} // Added height
        >
          <motion.div
            className="RecordTableList"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            style={{ display: 'flex', flexDirection: 'column', flex: 1 }}
          >
            <Stack direction="row" spacing={2} mb={2}>
              <Button variant={filterStatus === "paid" ? "contained" : "outlined"} onClick={() => setFilterStatus("paid")}>Paid</Button>
              <Button variant={filterStatus === "unpaid" ? "contained" : "outlined"} onClick={() => setFilterStatus("unpaid")}>Unpaid</Button>
              <Button variant={filterStatus === "" ? "contained" : "outlined"} onClick={() => setFilterStatus("")}>All</Button>
            </Stack>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <Grid container spacing={2} mb={2}>
                <Grid item xs={6}>
                  <TextField label="Search by patient name" fullWidth value={searchPatient} onChange={handleSearchPatient} />
                </Grid>
                <Grid item xs={6}>
                  <TextField label="Search by dentist name" fullWidth value={searchDentist} onChange={handleSearchDentist} />
                </Grid>
              </Grid>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              style={{ display: 'flex', flexDirection: 'column', flex: 1 }}
            >
              <TableContainer 
                component={Paper}
                sx={{ 
                  height: 'calc(100vh - 400px)', // Reduced from 350px to 400px to show more data
                  minHeight: '350px', // Added minimum height
                  display: 'flex',
                  flexDirection: 'column',
                  mb: 1,
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}
              >
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
                    {paginatedRecords.length > 0 ? paginatedRecords.map((record, index) => (
                      <motion.tr
                        key={record._id}
                        component={StyledTableRow}
                        onClick={() => handleRecordSelect(record)}
                        className="ClickableRow"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        whileHover={{ scale: 1.01 }}
                      >
                        <TableCell>{record.patientName}</TableCell>
                        <TableCell>{record.dentistName}</TableCell>
                        <TableCell>{record.treatment}</TableCell>
                        <TableCell>{record.diagnosis}</TableCell>
                        <TableCell>{parseFloat(record.fine?.$numberDecimal ?? 0).toFixed(2)}</TableCell>
                        <TableCell>{new Date(record.visitDate).toLocaleDateString()}</TableCell>
                        <TableCell>{record.fineStatus}</TableCell>
                      </motion.tr>
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
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Professional Medical Record Document Modal */}
      <AnimatePresence>
        {recordModalOpen && (
          <Modal 
            open={recordModalOpen} 
            onClose={handleCloseRecordModal}
            aria-labelledby="record-details-modal"
            BackdropProps={{ style: { backgroundColor: 'rgba(15, 23, 42, 0.4)' } }}
          >
            <Box 
              className="RecordModalContent"
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 800,
                maxWidth: '95vw',
                maxHeight: '90vh',
                bgcolor: '#fff',
                borderRadius: 1,
                boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                overflow: 'hidden'
              }}
            >
              {selectedRecord ? (
                <div>
                  {/* Document Header/Letterhead */}
                  <Box sx={{ 
                    bgcolor: '#fff', 
                    color: '#1c444d', 
                    p: 3,
                    borderBottom: '2px solid #1c444d',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3
                  }}>
                    <Box sx={{ 
                      width: 60, 
                      height: 60, 
                      borderRadius: '50%', 
                      bgcolor: '#1c444d',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: 24,
                      fontWeight: 'bold'
                    }}>
                      DC
                    </Box>
                    <Box>
                      <Typography variant="h5" fontWeight="bold" sx={{ color: '#1c444d', mb: 0.5 }}>
                        GALLEVO-MARZAN DENTAL CLINIC
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        Medical Record ID: #{selectedRecord._id?.substring(0, 8)?.toUpperCase()}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Document Content */}
                  <Box sx={{ 
                    p: 0, 
                    maxHeight: '60vh', 
                    overflow: 'auto',
                    bgcolor: '#fcfcfc',
                    position: 'relative'
                  }}>
   

                    <Box sx={{ position: 'relative', zIndex: 1 }}>
                      {/* Visit Info Bar */}
                      <Box sx={{ 
                        bgcolor: '#f0f7f9', 
                        p: 2, 
                        borderBottom: '1px solid #e0e0e0',
                        display: 'flex',
                        justifyContent: 'space-between'
                      }}>
                        <Box>
                          <Typography variant="overline" sx={{ color: '#555', fontWeight: 500 }}>
                            VISIT DATE
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {new Date(selectedRecord.visitDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="overline" sx={{ color: '#555', fontWeight: 500 }}>
                            PAYMENT STATUS
                          </Typography>
                          <Box>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                display: 'inline-block',
                                px: 2, 
                                py: 0.5, 
                                borderRadius: 1,
                                fontWeight: 600,
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
                      </Box>

                      {/* Patient & Dentist Section */}
                      <Box sx={{ p: 3, borderBottom: '1px solid #eaeaea' }}>
                        <Grid container spacing={4}>
                          <Grid item xs={12} md={6}>
                            <Typography variant="h6" sx={{ 
                              color: '#1c444d', 
                              mb: 1.5,
                              pb: 0.5,
                              borderBottom: '1px solid #e0e0e0',
                              fontFamily: 'Georgia, serif',
                              fontWeight: 600
                            }}>
                              Patient Information
                            </Typography>
                            
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  NAME
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                  {selectedRecord.patientName}
                                </Typography>
                              </Box>
                              
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  PATIENT ID
                                </Typography>
                                <Typography variant="body1">
                                  {selectedRecord.patientId?.substring(0, 8)?.toUpperCase() || "N/A"}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                          
                          <Grid item xs={12} md={6}>
                            <Typography variant="h6" sx={{ 
                              color: '#1c444d', 
                              mb: 1.5, 
                              pb: 0.5,
                              borderBottom: '1px solid #e0e0e0',
                              fontFamily: 'Georgia, serif',
                              fontWeight: 600
                            }}>
                              Attending Dentist
                            </Typography>
                            
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  NAME
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                  {selectedRecord.dentistName}
                                </Typography>
                              </Box>
                              
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  DENTIST ID
                                </Typography>
                                <Typography variant="body1">
                                  {selectedRecord.dentistId?.substring(0, 8)?.toUpperCase() || "N/A"}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                        </Grid>
                      </Box>

                      {/* Medical Details Section */}
                      <Box sx={{ p: 3, borderBottom: '1px solid #eaeaea' }}>
                        <Typography variant="h6" sx={{ 
                          color: '#1c444d', 
                          mb: 2,
                          pb: 0.5,
                          borderBottom: '1px solid #e0e0e0',
                          fontFamily: 'Georgia, serif',
                          fontWeight: 600
                        }}>
                          Clinical Assessment
                        </Typography>
                        
                        <Grid container spacing={3}>
                          <Grid item xs={12} md={6}>
                            <Box sx={{ mb: 3, p: 2, bgcolor: '#fafafa', borderRadius: 1, border: '1px solid #f0f0f0' }}>
                              <Typography variant="subtitle2" sx={{ color: '#1c444d', fontWeight: 600, mb: 1 }}>
                                DIAGNOSIS
                              </Typography>
                              <Typography variant="body1" sx={{ fontFamily: 'Georgia, serif' }}>
                                {selectedRecord.diagnosis}
                              </Typography>
                            </Box>
                          </Grid>
                          
                          <Grid item xs={12} md={6}>
                            <Box sx={{ mb: 3, p: 2, bgcolor: '#fafafa', borderRadius: 1, border: '1px solid #f0f0f0' }}>
                              <Typography variant="subtitle2" sx={{ color: '#1c444d', fontWeight: 600, mb: 1 }}>
                                TREATMENT PERFORMED
                              </Typography>
                              <Typography variant="body1" sx={{ fontFamily: 'Georgia, serif' }}>
                                {selectedRecord.treatment}
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </Box>

                      {/* Financial Information - Fix Payment Pending position */}
                      <Box sx={{ p: 3, borderBottom: '1px solid #eaeaea' }}>
                        <Typography variant="h6" sx={{ 
                          color: '#1c444d', 
                          mb: 2,
                          pb: 0.5,
                          borderBottom: '1px solid #e0e0e0',
                          fontFamily: 'Georgia, serif',
                          fontWeight: 600
                        }}>
                          Financial Record
                        </Typography>
                        
                        <Box sx={{ 
                          p: 2.5,
                          bgcolor: selectedRecord.fineStatus === 'paid' ? '#f8fbf8' : '#fffbf0',
                          borderRadius: 1,
                          border: `1px solid ${selectedRecord.fineStatus === 'paid' ? '#d7e6da' : '#f5e8c7'}`
                        }}>
                          <Grid container alignItems="center">
                            <Grid item xs={8}>
                              <Box>
                                <Typography variant="subtitle2" sx={{ color: '#666', mb: 0.5 }}>
                                  TREATMENT FEE
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <Typography variant="h4" sx={{ fontWeight: 600, color: '#1c444d', fontFamily: 'Georgia, serif' }}>
                                    ₱{parseFloat(selectedRecord.fine?.$numberDecimal ?? 0).toFixed(2)}
                                  </Typography>
                                  {selectedRecord.fineStatus !== 'paid' && (
                                    <Typography sx={{ color: '#856404', fontWeight: 'medium' }}>
                                      Payment Pending
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                            </Grid>
                            <Grid item xs={4} sx={{ textAlign: 'right' }}>
                              {selectedRecord.fineStatus === 'paid' && (
                                <Box sx={{ 
                                  display: 'inline-block', 
                                  transform: 'rotate(-15deg)',
                                  border: '2px solid #2e7d32',
                                  borderRadius: 1,
                                  px: 1.5,
                                  py: 0.5
                                }}>
                                  <Typography sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
                                    PAID
                                  </Typography>
                                </Box>
                              )}
                            </Grid>
                          </Grid>
                        </Box>
                      </Box>

                      {/* Medical Images Section */}
                      {selectedRecord.images?.length > 0 && (
                        <Box sx={{ p: 3 }}>
                          <Typography variant="h6" sx={{ 
                            color: '#1c444d', 
                            mb: 2,
                            pb: 0.5,
                            borderBottom: '1px solid #e0e0e0',
                            fontFamily: 'Georgia, serif',
                            fontWeight: 600
                          }}>
                            Clinical Images ({selectedRecord.images.length})
                          </Typography>
                          
                          <Box sx={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', 
                            gap: 2 
                          }}>
                            {selectedRecord.images.map((img, i) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.2, delay: i * 0.1 }}
                                whileHover={{ scale: 1.05 }}
                              >
                                <Box
                                  sx={{
                                    position: 'relative',
                                    cursor: 'pointer',
                                    borderRadius: 1,
                                    overflow: 'hidden',
                                    border: '1px solid #d0d0d0',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                    '&:hover': {
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
                                      height: '100px', 
                                      objectFit: 'cover',
                                      display: 'block'
                                    }}
                                  />
                                </Box>
                              </motion.div>
                            ))}
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </Box>

                  {/* Document Footer */}
                  <Box sx={{ 
                    p: 3, 
                    borderTop: '1px solid #e0e0e0',
                    bgcolor: '#f9f9f9',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <Typography variant="caption" sx={{ color: '#777' }}>
                      Record created on {new Date(selectedRecord.createdAt || Date.now()).toLocaleDateString()}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button 
                        variant="outlined"
                        onClick={() => window.print()}
                        sx={{ 
                          color: '#555',
                          borderColor: '#ccc',
                          '&:hover': {
                            borderColor: '#999',
                            bgcolor: 'transparent'
                          }
                        }}
                      >
                        Print
                      </Button>
                      
                      <Button 
                        variant="outlined"
                        onClick={handleCloseRecordModal}
                        sx={{ 
                          minWidth: 100,
                          color: '#555',
                          borderColor: '#ccc',
                          '&:hover': {
                            borderColor: '#999',
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
                            minWidth: 140,
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
        )}
      </AnimatePresence>

      {/* Image Zoom Modal with subtle animation */}
      <AnimatePresence>
        {zoomImage && (
          <Modal 
            open={!!zoomImage} 
            onClose={() => setZoomImage(null)}
            BackdropProps={{ style: { backgroundColor: 'rgba(15, 23, 42, 0.4)' } }}
          >
            <Box sx={{
              position: 'absolute', 
              top: '50%', 
              left: '50%',
              transform: 'translate(-50%, -50%)', 
              bgcolor: 'background.paper',
              boxShadow: 24, 
              p: 2, 
              borderRadius: 2
            }}>
              <img src={zoomImage} alt="Zoomed" style={{ maxWidth: '100%', maxHeight: '80vh' }} />
            </Box>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ManageRecord;
