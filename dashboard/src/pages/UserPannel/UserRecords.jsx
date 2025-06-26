import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  ButtonGroup,
  Modal,
  Box,
  Grid
} from "@mui/material";
import ClientSidebar from "./ClientSidebar";

const UserRecords = () => {
  const userId = sessionStorage.getItem("userId");
  const [patientId, setPatientId] = useState("");
  const [records, setRecords] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [zoomImage, setZoomImage] = useState(null);

  useEffect(() => {
    const fetchPatientId = async () => {
      try {
        const token = sessionStorage.getItem("authToken");
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/patient/profile/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPatientId(res.data.patientId);
      } catch (err) {
        setPatientId("");
      }
    };
    fetchPatientId();
  }, [userId]);

  useEffect(() => {
    if (!patientId) return;
    const fetchRecords = async () => {
      setLoading(true);
      try {
        let url = `${import.meta.env.VITE_API_BASE_URL}/record/list`;
        if (filter !== "all") url += `?status=${filter}`;
        const token = sessionStorage.getItem("authToken");
        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRecords(res.data.data.filter(r => r.patientId === patientId));
      } catch (err) {
        setRecords([]);
      }
      setLoading(false);
    };
    fetchRecords();
  }, [patientId, filter]);

  const getFine = (fine) => {
    if (fine && typeof fine === 'object' && fine.$numberDecimal !== undefined) {
      return parseFloat(fine.$numberDecimal).toFixed(2);
    }
    if (typeof fine === 'number' || typeof fine === 'string') {
      return parseFloat(fine || 0).toFixed(2);
    }
    return '0.00';
  };

  const handleRowClick = (rec) => {
    setSelectedRecord(rec);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedRecord(null);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <ClientSidebar />
      <div style={{ flex: 1, padding: 24, width: '100%' }}>
        <Typography variant="h5" gutterBottom>My Records</Typography>
        <ButtonGroup sx={{ mb: 2 }}>
          <Button variant={filter === "all" ? "contained" : "outlined"} onClick={() => setFilter("all")}>All</Button>
          <Button variant={filter === "paid" ? "contained" : "outlined"} onClick={() => setFilter("paid")}>Paid</Button>
          <Button variant={filter === "unpaid" ? "contained" : "outlined"} onClick={() => setFilter("unpaid")}>Unpaid</Button>
        </ButtonGroup>
        {loading ? (
          <Typography>Loading...</Typography>
        ) : records.length === 0 ? (
          <Typography>No records found.</Typography>
        ) : (
          <TableContainer component={Paper} sx={{ width: '100%' }}>
            <Table sx={{ minWidth: 900 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Diagnosis</TableCell>
                  <TableCell>Treatment</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Fine</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {records.map((rec) => (
                  <TableRow key={rec.recordsId} hover style={{ cursor: 'pointer' }} onClick={() => handleRowClick(rec)}>
                    <TableCell>{rec.visitDate ? new Date(rec.visitDate).toLocaleDateString() : "-"}</TableCell>
                    <TableCell>{rec.diagnosis}</TableCell>
                    <TableCell>{rec.treatment}</TableCell>
                    <TableCell>{rec.fineStatus}</TableCell>
                    <TableCell>₱{getFine(rec.fine)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        <Modal open={modalOpen} onClose={handleCloseModal} aria-labelledby="user-record-details-modal">
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 600,
            maxWidth: '95vw',
            maxHeight: '90vh',
            bgcolor: 'background.paper',
            borderRadius: 3,
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            overflow: 'auto',
            p: 4
          }}>
            {selectedRecord ? (
              <>
                <Typography variant="h5" fontWeight="bold" gutterBottom>Record Details</Typography>
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Diagnosis</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>{selectedRecord.diagnosis}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Treatment</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>{selectedRecord.treatment}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Visit Date</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>{selectedRecord.visitDate ? new Date(selectedRecord.visitDate).toLocaleDateString() : "-"}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>{selectedRecord.fineStatus}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Fine</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>₱{getFine(selectedRecord.fine)}</Typography>
                  </Grid>
                </Grid>
                {selectedRecord.images?.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>Medical Images</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                      {selectedRecord.images.map((img, i) => (
                        <Box
                          key={i}
                          sx={{
                            position: 'relative',
                            cursor: 'pointer',
                            borderRadius: 2,
                            overflow: 'hidden',
                            border: '2px solid #e0e0e0',
                            width: 120,
                            height: 120,
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
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                          />
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
                <Box sx={{ mt: 3, textAlign: 'right' }}>
                  <Button variant="outlined" onClick={handleCloseModal}>Close</Button>
                </Box>
              </>
            ) : (
              <Typography>No record selected.</Typography>
            )}
          </Box>
        </Modal>
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
    </div>
  );
};

export default UserRecords;
