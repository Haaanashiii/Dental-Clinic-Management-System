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
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;

  const fetchRecords = useCallback(async () => {
    try {
      const url = filterStatus
        ? `http://localhost:1337/record/list?status=${filterStatus}`
        : `http://localhost:1337/record/list`;

      const response = await axios.get(url);
      const data = response.data.data || [];

      const enriched = await Promise.all(
        data.map(async (record) => {
          let patientName = "Unknown";
          let dentistName = "Unknown";

          try {
            const resPatient = await axios.get(`http://localhost:1337/patient/name/${record.patientId}`);
            patientName = resPatient.data?.name ?? "Unknown";
          } catch (e) {
            console.warn("❗ Could not fetch patient", e);
          }

          try {
            const resDentist = await axios.get(`http://localhost:1337/dentist/name/${record.dentistId}`);
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
      await axios.put(`http://localhost:1337/record/pay/${recordId}`);
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
                  <StyledTableRow key={record._id} onClick={() => setSelectedRecord(record)} className="ClickableRow">
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

        <div className='MoreInfoCard'>
          {selectedRecord ? (
            <div>
              <Typography variant="h5" gutterBottom>Complete Information</Typography>
              <p><strong>Patient:</strong> {selectedRecord.patientName}</p>
              <p><strong>Dentist:</strong> {selectedRecord.dentistName}</p>
              <p><strong>Treatment:</strong> {selectedRecord.treatment}</p>
              <p><strong>Diagnosis:</strong> {selectedRecord.diagnosis}</p>
              <p><strong>Fine:</strong> {parseFloat(selectedRecord.fine?.$numberDecimal ?? 0).toFixed(2)}</p>
              <p><strong>Visit Date:</strong> {new Date(selectedRecord.visitDate).toLocaleDateString()}</p>
              <p><strong>Status:</strong> {selectedRecord.fineStatus}</p>

              {selectedRecord.images?.length > 0 && (
                <>
                  <p><strong>Images:</strong></p>
                  {selectedRecord.images.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt={`Record ${i}`}
                      className="RecordImage"
                      style={{ cursor: 'pointer', maxWidth: '100px', marginRight: '8px' }}
                      onClick={() => setZoomImage(img)}
                    />
                  ))}
                </>
              )}

              {selectedRecord.fineStatus === "unpaid" && (
                <Button variant="contained" color="success" onClick={() => markAsPaid(selectedRecord._id)} sx={{ mt: 2 }}>
                  Mark as Paid
                </Button>
              )}
            </div>
          ) : (
            <Typography variant="body1" color="text.secondary">Select a record to view more details</Typography>
          )}
        </div>
      </div>

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
