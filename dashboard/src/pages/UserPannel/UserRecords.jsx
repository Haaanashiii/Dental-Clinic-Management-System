import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Modal, Box, Button, TextField, Alert, Snackbar,
  Stack
} from "@mui/material";
import api from '../../api';
import Sidebar from "../UserPannel/ClientSidebar";
import "./UserRecords.css";

// Content animation variants
const contentVariants = {
  initial: { opacity: 0, x: 20, y: 10 },
  animate: { opacity: 1, x: 0, y: 0 },
  exit: { opacity: 0, x: -20, y: 10 }
};

function UserRecords() {
  const [records, setRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [zoomImage, setZoomImage] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [patientId, setPatientId] = useState("");
  const [patientName, setPatientName] = useState("");
  const [modalDentistName, setModalDentistName] = useState("");
  const [dentistNames, setDentistNames] = useState({});
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [payingRecord, setPayingRecord] = useState(null);
  const [payForm, setPayForm] = useState({ fromAccountNumber: "", details: "" });
  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState("");
  const [paySuccess, setPaySuccess] = useState("");

  // Use sessionStorage for userId for consistency
  const userId = sessionStorage.getItem("userId");

  // Fetch patientId and patientName for the current user
  useEffect(() => {
    const fetchPatientInfo = async () => {
      try {
        const res = await api.get(`/patient/profile/user/${userId}`);
        setPatientId(res.data.patientId);
        setPatientName(res.data?.name || res.data?.fullName || res.data?.full_name || "");
      } catch (err) {
        setPatientId("");
        setPatientName("");
      }
    };
    if (userId) fetchPatientInfo();
  }, [userId]);

  // Fetch and filter records for this patient
  const fetchRecords = async () => {
    if (!patientId) return;
    try {
      let url = `/record/list`;
      if (statusFilter) url += `?status=${statusFilter}`;
      const res = await api.get(url);
      const filtered = (res.data.data || []).filter(
        r => r.patientId === patientId && (r.fineStatus === "paid" || r.fineStatus === "unpaid")
      );
      setRecords(filtered);
      // Fetch all unique dentist names for the table using /dentist/name/:dentistId
      const dentistIds = [...new Set(filtered.map(r => r.dentistId).filter(Boolean))];
      const dentistNameMap = {};
      await Promise.all(dentistIds.map(async (id) => {
        try {
          const res = await api.get(`/dentist/name/${id}`);
          dentistNameMap[id] = res.data?.name || "-";
        } catch {
          dentistNameMap[id] = "-";
        }
      }));
      setDentistNames(dentistNameMap);
    } catch (err) {
      setRecords([]);
      setDentistNames({});
      console.error("Error fetching user records", err);
    }
  };

  useEffect(() => {
    fetchRecords();
    // eslint-disable-next-line
  }, [statusFilter, patientId]);

  // Fetch dentist name on modal open
  const openRecordModal = async (record) => {
    setSelectedRecord(record);
    setModalDentistName("");
    if (record.dentistId) {
      try {
        const res = await api.get(`/dentist/name/${record.dentistId}`);
        setModalDentistName(res.data?.name || "-");
      } catch {
        setModalDentistName("-");
      }
    } else {
      setModalDentistName("-");
    }
  };

  const closeRecordModal = () => setSelectedRecord(null);

  // Online Pay handler (open modal)
  const handleOnlinePay = (record) => {
    setPayingRecord(record);
    setPayForm({ fromAccountNumber: "", details: "" });
    setPayModalOpen(true);
    setPayError("");
    setPaySuccess("");
  };

  // Submit payment to bank API
  const handlePaySubmit = async () => {
    setPayLoading(true);
    setPayError("");
    setPaySuccess("");
    try {
      const response = await api.post(
        'http://192.168.9.23:4000/api/Philippine-National-Bank/business-integration/customer/pay-business',
        {
          fromAccountNumber: payForm.fromAccountNumber,
          toBusinessAccount: "<BUSINESS_ACCOUNT_NUMBER>", // TODO: Replace with your business account number
          amount: parseFloat(payingRecord.fine?.$numberDecimal || 0),
          details: payForm.details || `Payment for record ${payingRecord._id}`,
        }
      );
      setPaySuccess("Payment successful!");
      setPayModalOpen(false);
      setPayingRecord(null);
      setPayForm({ fromAccountNumber: "", details: "" });
      fetchRecords(); // Refresh records
      // Audit log for successful payment
      try {
        await api.post(`/audit`, {
          userId: userId,
          userName: patientName,
          role: 'patient',
          action: 'Payment Transfer',
          details: `Transferred ₱${parseFloat(payingRecord.fine?.$numberDecimal || 0).toFixed(2)} for record ${payingRecord._id} from account ${payForm.fromAccountNumber}`
        });
      } catch (e) { console.error('Audit log error:', e.message); }
    } catch (err) {
      setPayError(err.response?.data?.message || "Payment failed. Please try again.");
    } finally {
      setPayLoading(false);
    }
  };

  return (
    <div className="UserRecord-dashboard">
      <Sidebar />
      <motion.div 
        className="profile-container"
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
            My Medical Records
          </motion.h1>
          <motion.p 
            className="profile-date"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            View your treatment history and payment status
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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Stack direction="row" spacing={2} mb={2}>
              <Button
                variant={statusFilter === "" ? "contained" : "outlined"}
                onClick={() => setStatusFilter("")}
              >
                All
              </Button>
              <Button
                variant={statusFilter === "paid" ? "contained" : "outlined"}
                onClick={() => setStatusFilter("paid")}
              >
                Paid
              </Button>
              <Button
                variant={statusFilter === "unpaid" ? "contained" : "outlined"}
                onClick={() => setStatusFilter("unpaid")}
              >
                Unpaid
              </Button>
            </Stack>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            style={{ display: 'flex', flexDirection: 'column', flex: 1 }}
          >
            <TableContainer 
              component={Paper}
              sx={{ 
                height: 'calc(100vh - 350px)',
                minHeight: '350px',
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
                    <TableCell sx={{ width: '15%', fontWeight: 'bold', backgroundColor: '#1c444d', color: '#fff' }} align="center">Date</TableCell>
                    <TableCell sx={{ width: '20%', fontWeight: 'bold', backgroundColor: '#1c444d', color: '#fff' }} align="center">Diagnosis</TableCell>
                    <TableCell sx={{ width: '20%', fontWeight: 'bold', backgroundColor: '#1c444d', color: '#fff' }} align="center">Treatment</TableCell>
                    <TableCell sx={{ width: '15%', fontWeight: 'bold', backgroundColor: '#1c444d', color: '#fff' }} align="center">Status</TableCell>
                    <TableCell sx={{ width: '15%', fontWeight: 'bold', backgroundColor: '#1c444d', color: '#fff' }} align="center">Fine</TableCell>
                    <TableCell sx={{ width: '15%', fontWeight: 'bold', backgroundColor: '#1c444d', color: '#fff' }} align="center">Dentist</TableCell>
                    <TableCell sx={{ width: '15%', fontWeight: 'bold', backgroundColor: '#1c444d', color: '#fff' }} align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {records.length > 0 ? records.map((record, index) => (
                    <motion.tr
                      key={record._id}
                      component={TableRow}
                      className="ClickableRow"
                      onClick={e => {
                        // Only open modal if not clicking the pay button
                        if (e.target.closest('.PayBtn')) return;
                        openRecordModal(record);
                      }}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      whileHover={{ scale: 1.01 }}
                    >
                      <TableCell sx={{ width: '15%' }} align="center">{new Date(record.visitDate).toLocaleDateString()}</TableCell>
                      <TableCell sx={{ width: '20%' }} align="center">{record.diagnosis}</TableCell>
                      <TableCell sx={{ width: '20%' }} align="center">{record.treatment}</TableCell>
                      <TableCell sx={{ width: '15%' }} align="center">
                        <Box sx={{
                          display: 'inline-block',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: 'medium',
                          bgcolor: record.fineStatus === 'paid' ? '#e8f5e8' : '#fff3cd',
                          color: record.fineStatus === 'paid' ? '#2e7d32' : '#856404',
                          textTransform: 'uppercase',
                        }}>
                          {record.fineStatus}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ width: '15%' }} align="center">₱{parseFloat(record.fine?.$numberDecimal || 0).toFixed(2)}</TableCell>
                      <TableCell sx={{ width: '15%' }} align="center">{dentistNames[record.dentistId] || '-'}</TableCell>
                      <TableCell sx={{ width: '15%' }} align="center">
                        {record.fineStatus === 'unpaid' && (
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            className="PayBtn"
                            onClick={e => { e.stopPropagation(); handleOnlinePay(record); }}
                            sx={{ 
                              bgcolor: '#1c444d',
                              '&:hover': {
                                bgcolor: '#153239'
                              },
                              textTransform: 'uppercase',
                              fontSize: '0.7rem',
                              fontWeight: 500,
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                              py: 0.5
                            }}
                          >
                            Online Pay
                          </Button>
                        )}
                      </TableCell>
                    </motion.tr>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center">No records found.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Record Detail Modal */}
      <AnimatePresence>
        {!!selectedRecord && (
          <Modal open={!!selectedRecord} onClose={closeRecordModal}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Box className="RecordModalContent" sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 600,
                bgcolor: '#fff',
                borderRadius: 2,
                boxShadow: '0 8px 32px 0 rgba(28,68,77,0.25), 0 1.5px 4px rgba(28,68,77,0.10)',
                p: 0,
                maxHeight: '90vh',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
              }}>
                {selectedRecord && (
                  <>
                    {/* Modal Header */}
                    <Box sx={{
                      bgcolor: '#1c444d',
                      color: '#fff',
                      borderTopLeftRadius: 8,
                      borderTopRightRadius: 8,
                      px: 4,
                      py: 2,
                    }}>
                      <Typography variant="h5" sx={{ fontWeight: 'bold', letterSpacing: 1 }}>
                        Medical Record Details
                      </Typography>
                    </Box>
                    <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {/* Patient & Dentist Info */}
                      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <Box sx={{ flex: 1, bgcolor: '#fff', borderRadius: 2, p: 2, boxShadow: '0 1px 4px rgba(28,68,77,0.10)' }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#1c444d', mb: 1 }}>
                            Patient Name
                          </Typography>
                          <Typography>{patientName || '-'}</Typography>
                        </Box>
                        <Box sx={{ flex: 1, bgcolor: '#fff', borderRadius: 2, p: 2, boxShadow: '0 1px 4px rgba(28,68,77,0.10)' }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#1c444d', mb: 1 }}>
                            Dentist Name
                          </Typography>
                          <Typography>{modalDentistName || '-'}</Typography>
                        </Box>
                      </Box>
                      {/* All Record Details */}
                      <Box sx={{ bgcolor: '#fff', borderRadius: 2, p: 2, boxShadow: '0 1px 4px rgba(28,68,77,0.10)', mb: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#1c444d', mb: 1 }}>
                          Record Details
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Treatment</Typography>
                            <Typography>{selectedRecord.treatment}</Typography>
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Diagnosis</Typography>
                            <Typography>{selectedRecord.diagnosis}</Typography>
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Visit Date</Typography>
                            <Typography>{new Date(selectedRecord.visitDate).toLocaleDateString()}</Typography>
                          </Box>
                          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Status</Typography>
                            <span style={{
                              backgroundColor: selectedRecord.fineStatus === "paid" ? "#d4edda" : "#fff3cd",
                              padding: "4px 12px",
                              borderRadius: "4px",
                              color: selectedRecord.fineStatus === "paid" ? "#155724" : "#856404",
                              fontWeight: 'bold',
                              fontSize: '1rem',
                              letterSpacing: 1,
                              marginTop: 2
                            }}>
                              {selectedRecord.fineStatus?.toUpperCase()}
                            </span>
                          </Box>
                        </Box>
                        {/* Medical Images */}
                        {selectedRecord.images?.length > 0 && (
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>Medical Images</Typography>
                            <Box className="ImageGallery" sx={{ boxShadow: '0 2px 8px rgba(28,68,77,0.08)', borderRadius: 1, p: 1, bgcolor: '#fafbfc' }}>
                              {selectedRecord.images.map((img, i) => (
                                <motion.img
                                  key={i}
                                  src={img}
                                  alt={`Record ${i}`}
                                  className="RecordImage"
                                  onClick={() => setZoomImage(img)}
                                  whileHover={{ scale: 1.05 }}
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: i * 0.1, duration: 0.2 }}
                                />
                              ))}
                            </Box>
                          </Box>
                        )}
                      </Box>
                      {/* Financial Info */}
                      <Box sx={{ bgcolor: '#fff', borderRadius: 2, p: 2, boxShadow: '0 1px 4px rgba(28,68,77,0.10)' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#1c444d', mb: 1 }}>
                          Financial Information
                        </Typography>
                        <Typography>
                          <span style={{ fontWeight: 'bold' }}>Amount:</span> <span style={{ fontWeight: 'bold', color: '#1c444d' }}>₱{parseFloat(selectedRecord.fine?.$numberDecimal || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </Typography>
                        {/* Show Online Pay button if status is unpaid */}
                        {selectedRecord.fineStatus === 'unpaid' && (
                          <Button
                            variant="contained"
                            color="primary"
                            sx={{ 
                              mt: 2, 
                              fontWeight: 'bold',
                              bgcolor: '#1c444d',
                              '&:hover': { bgcolor: '#153239' }
                            }}
                            onClick={() => handleOnlinePay(selectedRecord)}
                          >
                            Online Pay
                          </Button>
                        )}
                      </Box>
                    </Box>
                    {/* Modal Footer */}
                    <Box sx={{
                      px: 3,
                      py: 2,
                      borderTop: '1px solid #e0e0e0',
                      borderBottomLeftRadius: 8,
                      borderBottomRightRadius: 8,
                      bgcolor: '#fff',
                      textAlign: 'right',
                    }}>
                      <Button 
                        variant="outlined" 
                        onClick={closeRecordModal} 
                        sx={{ color: '#1c444d', borderColor: '#1c444d', fontWeight: 'bold' }}
                      >
                        CLOSE
                      </Button>
                    </Box>
                  </>
                )}
              </Box>
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Zoom Image Modal */}
      <AnimatePresence>
        {!!zoomImage && (
          <Modal open={!!zoomImage} onClose={() => setZoomImage(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <Box sx={{
                position: 'absolute', 
                top: '50%', 
                left: '50%',
                transform: 'translate(-50%, -50%)', 
                p: 2,
                bgcolor: 'background.paper', 
                boxShadow: 24, 
                borderRadius: 2
              }}>
                <img src={zoomImage} alt="Zoom" style={{ maxWidth: '100%', maxHeight: '80vh' }} />
              </Box>
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Payment Modal */}
      <AnimatePresence>
        {payModalOpen && (
          <Modal open={payModalOpen} onClose={() => setPayModalOpen(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Box sx={{
                position: 'absolute', 
                top: '50%', 
                left: '50%',
                transform: 'translate(-50%, -50%)', 
                p: 4,
                bgcolor: 'background.paper', 
                boxShadow: 24, 
                borderRadius: 2,
                minWidth: 350, 
                maxWidth: 400
              }}>
                <Typography variant="h6" sx={{ color: '#1c444d', fontWeight: 'bold', mb: 2 }}>Online Payment</Typography>
                <TextField
                  label="Your Account Number"
                  fullWidth
                  margin="normal"
                  value={payForm.fromAccountNumber}
                  onChange={e => setPayForm({ ...payForm, fromAccountNumber: e.target.value })}
                  disabled={payLoading}
                />
                <TextField
                  label="Amount"
                  fullWidth
                  margin="normal"
                  value={payingRecord ? parseFloat(payingRecord.fine?.$numberDecimal || 0).toFixed(2) : ''}
                  disabled
                />
                <TextField
                  label="Details (optional)"
                  fullWidth
                  margin="normal"
                  value={payForm.details}
                  onChange={e => setPayForm({ ...payForm, details: e.target.value })}
                  disabled={payLoading}
                />
                {payError && <Alert severity="error" sx={{ mt: 2 }}>{payError}</Alert>}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button 
                    onClick={() => setPayModalOpen(false)} 
                    disabled={payLoading} 
                    sx={{ mr: 1 }}
                    variant="outlined"
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={handlePaySubmit} 
                    disabled={payLoading || !payForm.fromAccountNumber}
                    sx={{
                      bgcolor: '#1c444d',
                      '&:hover': { bgcolor: '#153239' }
                    }}
                  >
                    {payLoading ? 'Processing...' : 'Pay Now'}
                  </Button>
                </Box>
              </Box>
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>

      <Snackbar
        open={!!paySuccess}
        autoHideDuration={4000}
        onClose={() => setPaySuccess("")}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setPaySuccess("")} severity="success" sx={{ width: '100%' }}>
          {paySuccess}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default UserRecords;
