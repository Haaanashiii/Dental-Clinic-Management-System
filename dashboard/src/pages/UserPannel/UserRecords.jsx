import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, ButtonGroup } from "@mui/material";
import ClientSidebar from "./ClientSidebar";

const UserRecords = () => {
  const userId = sessionStorage.getItem("userId");
  const [patientId, setPatientId] = useState("");
  const [records, setRecords] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

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

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <ClientSidebar />
      <div style={{ flex: 1, padding: 24 }}>
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
          <TableContainer component={Paper}>
            <Table>
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
                  <TableRow key={rec.recordsId}>
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
      </div>
    </div>
  );
};

export default UserRecords;
