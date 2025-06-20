/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import ClientSidebar from "./ClientSidebar";
import OrthoIn from "../../assets/OrthoisIn.png";
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import { styled } from '@mui/material/styles';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import Paper from '@mui/material/Paper';
import axios from "axios";
import dayjs from "dayjs";
import "./UserDashboard.css";

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

function UserDashboard() {
  const [records, setRecords] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(5);
  const [patientId, setPatientId] = useState('');
  const [open, setOpen] = useState(false);
  const [dentists, setDentists] = useState([]);
  const [selectedDentist, setSelectedDentist] = useState('');
  const [appointmentDate, setAppointmentDate] = useState(null);
  const [appointmentTime, setAppointmentTime] = useState(null);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [confirmedDates, setConfirmedDates] = useState([]);

  const userId = sessionStorage.getItem("userId");
  const role = sessionStorage.getItem("role");

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setSelectedDentist('');
    setAppointmentDate(null);
    setAppointmentTime(null);
  };

  useEffect(() => {
    const fetchPatientProfile = async () => {
      try {
        const res = await axios.get(`http://localhost:1337/patient/profile/user/${userId}`);
        if (res.data.patientId) {
          setPatientId(res.data.patientId);
        } else {
          console.error("Patient ID not found");
        }
      } catch (error) {
        console.error("Failed to fetch patient profile:", error);
      }
    };

    const fetchDentists = async () => {
      try {
        const res = await axios.get("http://localhost:1337/dentist/profile");
        setDentists(res.data);
      } catch (err) {
        console.error("Error fetching dentists:", err);
      }
    };

    fetchPatientProfile();
    fetchDentists();
  }, [userId, role]);

  const fetchAppointments = async (status) => {
    try {
      const res = await axios.get(`http://localhost:1337/appointment/status/${status}/patient/${patientId}`);
      const appointmentsWithDentists = await Promise.all(res.data.map(async (appointment) => {
        const dentistRes = await axios.get(`http://localhost:1337/dentist/profile/dentist/${appointment.dentistId}`);
        const dentistName = dentistRes.data.name;
        return { ...appointment, dentistName };
      }));
      setRecords(appointmentsWithDentists);

      if (status === 'confirmed') {
        const dates = appointmentsWithDentists.map(app =>
          dayjs(app.appointmentDate).startOf('day').format('YYYY-MM-DD')
        );
        setConfirmedDates(dates);
      }
    } catch (err) {
      console.error("Error fetching appointments:", err);
    }
  };

  useEffect(() => {
    if (patientId) {
      fetchAppointments(statusFilter);
    }
  }, [patientId, statusFilter]);

  const isConfirmedDate = (date) => {
    return confirmedDates.includes(date.format('YYYY-MM-DD'));
  };

  const renderDay = (date, selectedDates, pickersDayProps) => {
    const isConfirmed = isConfirmedDate(date);
    return (
      <div
        {...pickersDayProps}
        style={{
          borderRadius: '50%',
          backgroundColor: isConfirmed ? '#3AB286' : undefined,
          color: isConfirmed ? 'white' : undefined,
          width: 36,
          height: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: 'auto'
        }}
      >
        {date.date()}
      </div>
    );
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleSubmitAppointment = async () => {
    if (!selectedDentist) {
      alert("Please select a dentist.");
      return;
    }

    if (!appointmentDate || !appointmentTime) {
      alert("Please select both a date and time.");
      return;
    }

    const selectedDateTime = appointmentDate
      .hour(appointmentTime.hour())
      .minute(appointmentTime.minute());

    const now = dayjs();

    if (selectedDateTime.isBefore(now)) {
      alert("You cannot set an appointment in the past. Please choose a future date and time.");
      return;
    }

    try {
      const payload = {
        patientId,
        dentistId: selectedDentist,
        appointmentDate: appointmentDate.toDate(),
        appointmentTime: appointmentTime.format("HH:mm"),
        status: "pending",
      };
      await axios.post("http://localhost:1337/appointment/create", payload);
      alert("Appointment created successfully!");
      handleClose();
      fetchAppointments('pending');
      setStatusFilter('pending');
    } catch (err) {
      console.error("Failed to create appointment:", err);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    try {
      await axios.put(`http://localhost:1337/appointment/cancel/${appointmentId}`);
      alert("Appointment cancelled successfully!");
      fetchAppointments(statusFilter);
    } catch (err) {
      console.error("Failed to cancel appointment:", err);
      alert("Error cancelling appointment.");
    }
  };

  const displayedRecords = records.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <div className="user-dashboard">
      <ClientSidebar />
      <div className="dashboard-content">
        <div className="dashboard-Funct">
          <div className="Text">
            <h1>Welcome to Molar Records!</h1>
            <h2>Your dental visit history and treatment details are securely recorded here.</h2>
            <h3>Easily track your past diagnoses, visits, and any pending fines.</h3>
            <Divider sx={{ borderColor: '#1C444D', borderBottomWidth: 2, width: '100%' }} />
            <div className="BtnAppointment">
              <Button variant="contained" sx={{ backgroundColor: "#3AB286" }} onClick={handleOpen}>
                Make Appointment
              </Button>
            </div>
          </div>

          <div className="Table">
            <h2>Latest Patient Appointments</h2>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              {['completed', 'confirmed', 'pending'].map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'contained' : 'outlined'}
                  onClick={() => setStatusFilter(status)}
                >
                  <h3 style={{ margin: 0 }}>{status.charAt(0).toUpperCase() + status.slice(1)}</h3>
                </Button>
              ))}
            </div>

            <TableContainer component={Paper}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <StyledTableCell>Appointment Date</StyledTableCell>
                    <StyledTableCell>Appointment Time</StyledTableCell>
                    <StyledTableCell>Dentist Name</StyledTableCell>
                    <StyledTableCell>Status</StyledTableCell>
                    {statusFilter === 'pending' && <StyledTableCell>Action</StyledTableCell>}
                    {statusFilter === 'completed' && <StyledTableCell>Remarks</StyledTableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {displayedRecords.map((appointment) => (
                    <StyledTableRow key={appointment._id}>
                      <StyledTableCell>{new Date(appointment.appointmentDate).toLocaleDateString()}</StyledTableCell>
                      <StyledTableCell>{dayjs(appointment.appointmentTime, 'HH:mm').format('hh:mm A')}</StyledTableCell>
                      <StyledTableCell>{appointment.dentistName || "Unknown"}</StyledTableCell>
                      <StyledTableCell>{appointment.status}</StyledTableCell>
                      {statusFilter === 'pending' && (
                        <StyledTableCell>
                          <Button onClick={() => handleCancelAppointment(appointment._id)} color="error">Cancel</Button>
                        </StyledTableCell>
                      )}
                      {statusFilter === 'completed' && (
                        <StyledTableCell>{appointment.remarks || "No remarks available"}</StyledTableCell>
                      )}
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
        </div>

        <div className="DetailsandEtc">
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <img src={OrthoIn} alt="Dental" style={{ width: '300px', height: 'auto' }} />
          </div>
          <div className="AppointmentSection">
            <h2>Appointment Dates</h2>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateCalendar
                showDaysOutsideCurrentMonth
                fixedWeekNumber={6}
                renderDay={renderDay}
              />
            </LocalizationProvider>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Book an Appointment</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            select
            label="Select Dentist"
            value={selectedDentist}
            onChange={(e) => setSelectedDentist(e.target.value)}
            margin="dense"
          >
            {dentists.map((dentist) => (
              <MenuItem key={dentist._id} value={dentist.dentistId}>
                {dentist.name}
              </MenuItem>
            ))}
          </TextField>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateCalendar
              value={appointmentDate}
              onChange={(newDate) => setAppointmentDate(newDate)}
            />
            <TimePicker
              label="Appointment Time"
              value={appointmentTime}
              onChange={(newTime) => setAppointmentTime(newTime)}
              sx={{ mt: 2, width: '100%' }}
            />
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleSubmitAppointment}
            variant="contained"
            sx={{ backgroundColor: "#3AB286" }}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default UserDashboard;
