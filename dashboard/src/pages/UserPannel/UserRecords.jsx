import React, { useEffect, useState } from "react";
import {
  Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Modal, Box, Button
} from "@mui/material";
import axios from "axios";
import Sidebar from "../UserPannel/ClientSidebar"; // adjust if needed
import "./UserRecords.css";

function UserRecords() {
  const [records, setRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [zoomImage, setZoomImage] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [patientId, setPatientId] = useState("");
  const [patientName, setPatientName] = useState("");
  const [modalDentistName, setModalDentistName] = useState("");
  const [dentistNames, setDentistNames] = useState({}); // Map dentistId to dentist name

  // Use sessionStorage for userId for consistency
  const userId = sessionStorage.getItem("userId");

  // Fetch patientId and patientName for the current user
  useEffect(() => {
    const fetchPatientInfo = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/patient/profile/user/${userId}`);
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
      let url = `${import.meta.env.VITE_API_BASE_URL}/record/list`;
      if (statusFilter) url += `?status=${statusFilter}`;
      const res = await axios.get(url);
      const filtered = (res.data.data || []).filter(
        r => r.patientId === patientId && (r.fineStatus === "paid" || r.fineStatus === "unpaid")
      );
      setRecords(filtered);
      // Fetch all unique dentist names for the table using /dentist/name/:dentistId
      const dentistIds = [...new Set(filtered.map(r => r.dentistId).filter(Boolean))];
      const dentistNameMap = {};
      await Promise.all(dentistIds.map(async (id) => {
        try {
          const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/dentist/name/${id}`);
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
        // Use the same endpoint as the table for consistency
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/dentist/name/${record.dentistId}`);
        setModalDentistName(res.data?.name || "-");
      } catch {
        setModalDentistName("-");
      }
    } else {
      setModalDentistName("-");
    }
  };

  const closeRecordModal = () => setSelectedRecord(null);

  // Online Pay handler
  const handleOnlinePay = async (recordId) => {
    // Placeholder: Replace with your payment integration logic
    alert("Online payment for record " + recordId + " is not yet implemented.");
  };

  return (
    <div className="UserRecord-dashboard">
      <Sidebar />
      <div className="RecordContent">
        <div className="RecordTableList">
          <Typography variant="h5" gutterBottom>My Records</Typography>
          <div style={{ marginBottom: "16px" }}>
            <Button
              variant={statusFilter === "" ? "contained" : "outlined"}
              onClick={() => setStatusFilter("")}
              sx={{ marginRight: 1 }}
            >ALL</Button>
            <Button
              variant={statusFilter === "paid" ? "contained" : "outlined"}
              onClick={() => setStatusFilter("paid")}
              sx={{ marginRight: 1 }}
            >PAID</Button>
            <Button
              variant={statusFilter === "unpaid" ? "contained" : "outlined"}
              onClick={() => setStatusFilter("unpaid")}
            >UNPAID</Button>
          </div>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#1c444d' }}>
                  <TableCell sx={{ width: '15%', fontWeight: 'bold', color: '#fff' }} align="center">Date</TableCell>
                  <TableCell sx={{ width: '20%', fontWeight: 'bold', color: '#fff' }} align="center">Diagnosis</TableCell>
                  <TableCell sx={{ width: '20%', fontWeight: 'bold', color: '#fff' }} align="center">Treatment</TableCell>
                  <TableCell sx={{ width: '15%', fontWeight: 'bold', color: '#fff' }} align="center">Status</TableCell>
                  <TableCell sx={{ width: '15%', fontWeight: 'bold', color: '#fff' }} align="center">Fine</TableCell>
                  <TableCell sx={{ width: '15%', fontWeight: 'bold', color: '#fff' }} align="center">Dentist</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {records.length > 0 ? records.map((record) => (
                  <TableRow
                    key={record._id}
                    className="ClickableRow"
                    onClick={() => openRecordModal(record)}
                    
                  >
                    <TableCell sx={{ width: '15%' }} align="center">{new Date(record.visitDate).toLocaleDateString()}</TableCell>
                    <TableCell sx={{ width: '20%' }} align="center">{record.diagnosis}</TableCell>
                    <TableCell sx={{ width: '20%' }} align="center">{record.treatment}</TableCell>
                    <TableCell sx={{ width: '15%' }} align="center">{record.fineStatus}</TableCell>
                    <TableCell sx={{ width: '15%' }} align="center">₱{parseFloat(record.fine?.$numberDecimal || 0).toFixed(2)}</TableCell>
                    <TableCell sx={{ width: '15%' }} align="center">{dentistNames[record.dentistId] || '-'}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">No records found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Record Detail Modal */}
          <Modal open={!!selectedRecord} onClose={closeRecordModal}>
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
                              <img
                                key={i}
                                src={img}
                                alt={`Record ${i}`}
                                className="RecordImage"
                                onClick={() => setZoomImage(img)}
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
                          sx={{ mt: 2, fontWeight: 'bold' }}
                          onClick={() => handleOnlinePay(selectedRecord._id)}
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
                    <Button variant="outlined" onClick={closeRecordModal} sx={{ color: '#1c444d', borderColor: '#1c444d', fontWeight: 'bold' }}>CLOSE</Button>
                  </Box>
                </>
              )}
            </Box>
          </Modal>

          {/* Zoom Image Modal */}
          <Modal open={!!zoomImage} onClose={() => setZoomImage(null)}>
            <Box sx={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)', p: 2,
              bgcolor: 'background.paper', boxShadow: 24, borderRadius: 2
            }}>
              <img src={zoomImage} alt="Zoom" style={{ maxWidth: '100%', maxHeight: '80vh' }} />
            </Box>
          </Modal>
        </div>
      </div>
    </div>
  );
}

export default UserRecords;
