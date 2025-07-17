/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ClientSidebar from "./ClientSidebar";
import OrthoIn from "../../assets/OrthoisIn.png";
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
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
import api from '../../api';
import dayjs from "dayjs";
import "./UserDashboard.css";

// Content animation variants
const contentVariants = {
  initial: { opacity: 0, x: 20, y: 10 },
  animate: { opacity: 1, x: 0, y: 0 },
  exit: { opacity: 0, x: -20, y: 10 }
};

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

// List of common holidays (MM-DD format for annual holidays, YYYY-MM-DD for fixed-date holidays)
const HOLIDAYS = [
  { date: '01-01', name: "New Year's Day" },
  { date: '12-25', name: "Christmas Day" },
  { date: '07-04', name: "Independence Day" },
  { date: '11-01', name: "All Saints' Day" },
  { date: '12-31', name: "New Year's Eve" },
  // Add more as needed
];

// Helper to check if a date is a holiday and get its name
function getHoliday(date) {
  // date: dayjs object
  const mmdd = date.format('MM-DD');
  const yyyymmdd = date.format('YYYY-MM-DD');
  const found = HOLIDAYS.find(h => h.date === mmdd || h.date === yyyymmdd);
  return found ? found.name : null;
}

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
  const [confirmedAppointments, setConfirmedAppointments] = useState([]);
  const [warning, setWarning] = useState("");
  const [booking, setBooking] = useState(false);

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
        const res = await api.get(`${import.meta.env.VITE_API_BASE_URL}/patient/profile/user/${userId}`);
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
        const res = await api.get(`${import.meta.env.VITE_API_BASE_URL}/dentist/profile`);
        setDentists(res.data);
      } catch (err) {
        console.error("Error fetching dentists:", err);
      }
    };

    fetchPatientProfile();
    fetchDentists();
  }, [userId, role]);

  // Update fetchAppointments to also store confirmed appointments for the calendar
  const fetchAppointments = async (status) => {
    try {
      const res = await api.get(`${import.meta.env.VITE_API_BASE_URL}/appointment/status/${status}/patient/${patientId}`);
      const appointmentsWithDentists = await Promise.all(res.data.map(async (appointment) => {
        const dentistRes = await api.get(`${import.meta.env.VITE_API_BASE_URL}/dentist/profile/dentist/${appointment.dentistId}`);
        const dentistName = dentistRes.data.name;
        return { ...appointment, dentistName };
      }));
      setRecords(appointmentsWithDentists);

      if (status === 'confirmed') {
        setConfirmedAppointments(appointmentsWithDentists);
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

  // Helper to check if a date is a confirmed appointment for the user
  const isUserConfirmedDate = (date) => {
    return confirmedAppointments.some(app => dayjs(app.appointmentDate).isSame(date, 'day'));
  };

  const renderDay = (date, selectedDates, pickersDayProps) => {
    const isConfirmed = isConfirmedDate(date);
    const isUserConfirmed = isUserConfirmedDate(date);
    const holidayName = getHoliday(date);
    let bgColor = undefined;
    let color = undefined;
    if (holidayName) {
      bgColor = '#e57373'; // red for holiday
      color = 'white';
    } else if (isUserConfirmed) {
      color = '#2e7d32'; // green text for user's confirmed
      bgColor = undefined;
    } else if (isConfirmed) {
      bgColor = '#3AB286';
      color = 'white';
    }
    return (
      <div
        {...pickersDayProps}
        style={{
          borderRadius: '50%',
          backgroundColor: bgColor,
          color: color,
          width: 36,
          height: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: 'auto',
          border: holidayName ? '2px solid #b71c1c' : undefined,
        }}
        title={holidayName || undefined}
      >
        {date.date()}
      </div>
    );
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Prevent double-booking: check if dentist has an appointment at the selected time (±1hr window)
  const isSlotAvailable = async (dentistId, date, time) => {
    try {
      const res = await api.get(`${import.meta.env.VITE_API_BASE_URL}/appointment/status/confirmed`);
      const appointments = res.data.filter(app => app.dentistId === dentistId);
      const selectedDateTime = dayjs(date).hour(time.hour()).minute(time.minute()).second(0);
      for (const app of appointments) {
        const appDateTime = dayjs(app.appointmentDate);
        if (appDateTime.isSame(selectedDateTime, 'day')) {
          const appTime = dayjs(app.appointmentTime, 'HH:mm');
          const appStart = appDateTime.hour(appTime.hour()).minute(appTime.minute());
          const appEnd = appStart.add(1, 'hour');
          // If selected time is within the 1hr window of any confirmed appointment
          if (
            (selectedDateTime.isSame(appStart) ||
             (selectedDateTime.isAfter(appStart) && selectedDateTime.isBefore(appEnd)) ||
             (selectedDateTime.add(1, 'hour').isAfter(appStart) && selectedDateTime.add(1, 'hour').isBefore(appEnd)))
          ) {
            return false;
          }
        }
      }
      return true;
    } catch (err) {
      console.error('Error checking slot availability:', err);
      return false;
    }
  };

  const handleSubmitAppointment = async () => {
    setWarning("");
    if (booking) return; // Prevent double submit
    if (!selectedDentist) {
      setWarning("Please select a dentist.");
      return;
    }
    if (!appointmentDate || !appointmentTime) {
      setWarning("Please select both a date and time.");
      return;
    }
    const selectedDateTime = appointmentDate
      .hour(appointmentTime.hour())
      .minute(appointmentTime.minute());
    const now = dayjs();
    if (selectedDateTime.isBefore(now)) {
      setWarning("You cannot set an appointment in the past. Please choose a future date and time.");
      return;
    }
    setBooking(true);
    // Check for double-booking (1hr slot)
    const slotAvailable = await isSlotAvailable(selectedDentist, appointmentDate, appointmentTime);
    if (!slotAvailable) {
      alert("This time slot is already taken for this dentist. Please choose another time (1 hour per session).");
      setBooking(false);
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
      await api.post(`${import.meta.env.VITE_API_BASE_URL}/appointment/create`, payload);
      alert("Appointment created successfully!");
      handleClose();
      fetchAppointments('pending');
      setStatusFilter('pending');
    } catch (err) {
      console.error("Failed to create appointment:", err);
    } finally {
      setBooking(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    try {
      await api.put(`${import.meta.env.VITE_API_BASE_URL}/appointment/cancel/${appointmentId}`);
      alert("Appointment cancelled successfully!");
      fetchAppointments(statusFilter);
    } catch (err) {
      console.error("Failed to cancel appointment:", err);
      alert("Error cancelling appointment.");
    }
  };

  // Handle time change and show alert if out of business hours
  const handleTimeChange = (newTime) => {
    setAppointmentTime(newTime);
    if (newTime) {
      const hour = newTime.hour();
      if (hour < 10 || hour >= 17) {
        alert("Invalid time: Business hours are only 10:00 AM to 5:00 PM.");
        setAppointmentTime(null);
      }
    }
  };

  const displayedRecords = records.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <div className="user-dashboard">
      <ClientSidebar />
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
            Welcome to Molar Records!
          </motion.h1>
          <motion.p 
            className="profile-date"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            Your dental visit history and treatment details are securely recorded here
          </motion.p>
        </motion.div>

        {/* Main Content Area */}
        <motion.div 
          className="dashboard-grid"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <motion.div 
            className="appointments-section"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <Box className="section-header">
              <Typography variant="h5" component="h2" className="section-title">
                Latest Patient Appointments
              </Typography>
              <Button 
                variant="contained" 
                onClick={handleOpen}
                className="new-appointment-btn"
              >
                Make Appointment
              </Button>
            </Box>
            
            <Box className="filter-buttons">
              {['completed', 'confirmed', 'pending'].map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'contained' : 'outlined'}
                  onClick={() => setStatusFilter(status)}
                  className={statusFilter === status ? 'active-filter' : ''}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </Box>
            
            <TableContainer component={Paper} className="dashboard-table-container">
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
                    <StyledTableRow key={appointment.appointmentId || appointment._id}>
                      <StyledTableCell>{new Date(appointment.appointmentDate).toLocaleDateString()}</StyledTableCell>
                      <StyledTableCell>{dayjs(appointment.appointmentTime, 'HH:mm').format('hh:mm A')}</StyledTableCell>
                      <StyledTableCell>{appointment.dentistName || "Unknown"}</StyledTableCell>
                      <StyledTableCell>
                        <Box sx={{
                          display: 'inline-block',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: 'medium',
                          bgcolor: 
                            appointment.status === 'completed' ? '#e8f5e8' : 
                            appointment.status === 'confirmed' ? '#e3f2fd' : 
                            '#fff3cd',
                          color: 
                            appointment.status === 'completed' ? '#2e7d32' : 
                            appointment.status === 'confirmed' ? '#1976d2' : 
                            '#856404',
                          textTransform: 'capitalize'
                        }}>
                          {appointment.status}
                        </Box>
                      </StyledTableCell>
                      {statusFilter === 'pending' && (
                        <StyledTableCell>
                          <Button 
                            variant="outlined" 
                            color="error" 
                            size="small"
                            onClick={() => handleCancelAppointment(appointment.appointmentId)}
                            sx={{
                              minWidth: '32px',
                              height: '32px',
                              borderRadius: 1
                            }}
                          >
                            Cancel
                          </Button>
                        </StyledTableCell>
                      )}
                      {statusFilter === 'completed' && (
                        <StyledTableCell>{appointment.remarks || "No remarks available"}</StyledTableCell>
                      )}
                    </StyledTableRow>
                  ))}
                  {displayedRecords.length === 0 && (
                    <TableRow>
                      <TableCell 
                        colSpan={statusFilter === 'pending' || statusFilter === 'completed' ? 5 : 4} 
                        align="center"
                        sx={{ py: 3 }}
                      >
                        No {statusFilter} appointments found
                      </TableCell>
                    </TableRow>
                  )}
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
          
          <motion.div 
            className="calendar-section"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
              <Box sx={{ 
                p: 2, 
                background: 'linear-gradient(135deg, #1c444d 0%, #2d5a66 100%)', 
                color: 'white',
                borderRadius: '8px 8px 0 0'
              }}>
                <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
                  Appointment Calendar
                </Typography>
              </Box>
              
              <Box className="calendar-container" sx={{ p: 2, background: '#fff' }}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateCalendar
                    showDaysOutsideCurrentMonth
                    fixedWeekNumber={6}
                    renderDay={renderDay}
                    sx={{ 
                      '& .MuiPickersDay-root.Mui-selected': {
                        backgroundColor: '#1c444d',
                      }
                    }}
                  />
                </LocalizationProvider>
              </Box>
            </Paper>
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
              <img 
                src={OrthoIn} 
                alt="Dental" 
                style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }} 
              />
            </Box>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <Dialog 
            open={open} 
            onClose={handleClose}
            PaperProps={{
              component: motion.div,
              initial: { opacity: 0, scale: 0.9, y: -20 },
              animate: { opacity: 1, scale: 1, y: 0 },
              exit: { opacity: 0, scale: 0.9, y: -20 },
              transition: { duration: 0.3 }
            }}
          >
            <DialogTitle sx={{ 
              background: 'linear-gradient(135deg, #1c444d 0%, #2d5a66 100%)', 
              color: '#ffffff',
              fontWeight: 'bold'
            }}>
              Book an Appointment
            </DialogTitle>
            <DialogContent>
              {warning && (
                <Box sx={{ mb: 2 }}>
                  <Typography color="error" sx={{ fontWeight: 'bold' }}>
                    {warning}
                  </Typography>
                </Box>
              )}
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
                  onChange={(newDate) => {
                    const holiday = newDate ? getHoliday(newDate) : null;
                    if (holiday) {
                      alert(`It's a holiday on this day. The dentist is not in for "${holiday}".`);
                      setAppointmentDate(null);
                    } else {
                      setAppointmentDate(newDate);
                    }
                  }}
                  renderDay={renderDay}
                  sx={{ 
                    '& .MuiPickersDay-root.Mui-selected': {
                      backgroundColor: '#1c444d',
                    }
                  }}
                />
                <TimePicker
                  label="Appointment Time"
                  value={appointmentTime}
                  onChange={handleTimeChange}
                  minTime={dayjs().hour(10).minute(0)}
                  maxTime={dayjs().hour(17).minute(0)}
                  sx={{ mt: 2, width: '100%' }}
                />
              </LocalizationProvider>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
              <Button 
                onClick={handleClose}
                variant="outlined"
                sx={{ color: '#1c444d', borderColor: '#1c444d' }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitAppointment}
                variant="contained"
                sx={{ 
                  bgcolor: '#1c444d',
                  '&:hover': { bgcolor: '#153239' } 
                }}
                disabled={booking}
              >
                {booking ? 'Booking...' : 'Book Appointment'}
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
}

export default UserDashboard;
