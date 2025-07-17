/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import ClientSidebar from "../UserPannel/ClientSidebar";
import './AdminDashboard.css';
import { 
  Card, 
  CardContent, 
  Typography, 
  CircularProgress, 
  Grid, 
  Box, 
  Paper,
  Container
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import PaidIcon from '@mui/icons-material/Paid';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import PieChartIcon from '@mui/icons-material/PieChart';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { PieChart, Pie, Cell } from 'recharts';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import ScheduleIcon from '@mui/icons-material/Schedule';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

// Animation variants for consistent motion
const contentVariants = {
  initial: { opacity: 0, x: 20, y: 10 },
  animate: { opacity: 1, x: 0, y: 0 },
  exit: { opacity: 0, x: -20, y: 10 }
};

const COLORS = ['#4CAF50', '#F44336'];

function AdminDashboard() {
  // Existing state declarations remain the same
  const [stats, setStats] = useState({
    confirmedAppointments: 0,
    pendingAppointments: 0,
    pendingUsers: 0,
    paidRecords: 0,
    unpaidRecords: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingUsersList, setPendingUsersList] = useState([]);
  const [appointmentTimeData, setAppointmentTimeData] = useState([]);
  const [confirmedTrend, setConfirmedTrend] = useState(null);
  const [doctorPatientData, setDoctorPatientData] = useState([]);
  const navigate = useNavigate();

  // Existing data fetching logic remains the same
  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/appointment/getall'),
      api.get('/record/list?status=paid'),
      api.get('/record/list?status=unpaid'),
      api.get('/auth/user'),
      api.get('/dentist/profile'),
      api.get('/record/list') // get all records
    ]).then(([appointmentsRes, paidRes, unpaidRes, usersRes, dentistsRes, allRecordsRes]) => {
      const appointments = appointmentsRes.data;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const confirmedAppointments = appointments.filter(a => {
        if (a.status !== 'confirmed') return false;
        const apptDate = new Date(a.appointmentDate);
        apptDate.setHours(0, 0, 0, 0);
        return apptDate.getTime() === today.getTime();
      }).length;
      const pendingAppointments = appointments.filter(a => a.status === 'pending').length;
      const paidRecords = paidRes.data.data.length;
      const unpaidRecords = unpaidRes.data.data.length;
      const pendingUsers = usersRes.data.filter(u => u.status && u.status.toLowerCase() === 'pending').length;
      setStats({
        confirmedAppointments,
        pendingAppointments,
        paidRecords,
        unpaidRecords,
        pendingUsers
      });
      setPendingUsersList(usersRes.data.filter(u => u.status && u.status.toLowerCase() === 'pending'));

      // Calculate appointment time frequency for graph
      const timeCounts = {};
      appointments.forEach(a => {
        if (a.appointmentTime) {
          const hour = a.appointmentTime.split(':')[0];
          timeCounts[hour] = (timeCounts[hour] || 0) + 1;
        }
      });
      const timeData = Object.keys(timeCounts).map(hour => ({
        hour: `${hour}:00`,
        count: timeCounts[hour]
      })).sort((a, b) => parseInt(a.hour) - parseInt(b.hour));
      setAppointmentTimeData(timeData);

      // Patients per doctor pie chart (from records only)
      const dentistPatientMap = {};
      allRecordsRes.data.data.forEach(r => {
        if (r.dentistId && r.patientId) {
          if (!dentistPatientMap[r.dentistId]) dentistPatientMap[r.dentistId] = new Set();
          dentistPatientMap[r.dentistId].add(String(r.patientId));
        }
      });
      const doctorPieData = dentistsRes.data.map(d => ({
        name: d.name,
        value: dentistPatientMap[d.dentistId] ? dentistPatientMap[d.dentistId].size : 0
      })).filter(d => d.value > 0);
      setDoctorPatientData(doctorPieData);

      setLoading(false);
    }).catch((err) => {
      setError('Failed to load dashboard stats.');
      setLoading(false);
    });
  }, []);

  // Example: Calculate yesterday's confirmed appointments for trend (optional)
  useEffect(() => {
    api.get('/appointment/getall').then(res => {
      const appointments = res.data;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      const todayCount = appointments.filter(a => {
        if (a.status !== 'confirmed') return false;
        const apptDate = new Date(a.appointmentDate);
        apptDate.setHours(0, 0, 0, 0);
        return apptDate.getTime() === today.getTime();
      }).length;
      const yesterdayCount = appointments.filter(a => {
        if (a.status !== 'confirmed') return false;
        const apptDate = new Date(a.appointmentDate);
        apptDate.setHours(0, 0, 0, 0);
        return apptDate.getTime() === yesterday.getTime();
      }).length;
      setConfirmedTrend(todayCount > yesterdayCount ? 'up' : todayCount < yesterdayCount ? 'down' : null);
    });
  }, []);

  const handleConfirmedClick = () => {
    navigate('/ManageAppointment');
  };

  return (
    <div className="admin-dashboard">
      <ClientSidebar />
      <motion.div 
        className="dashboard-container"
        variants={contentVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* Header Section */}
        <motion.div 
          className="dashboard-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <motion.h1 
            className="dashboard-title"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            Admin Dashboard
          </motion.h1>
          <motion.p 
            className="dashboard-subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            Overview of appointments, records, and pending actions
          </motion.p>
        </motion.div>

        {/* Main Content - Full width container */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ width: '100%', px: 0 }}>
            {/* Top Cards - Using equal width cards */}
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 2,
              mb: 3,
              width: '100%',
              justifyContent: 'space-between'
            }}>
              {/* Confirmed Appointments Card */}
              <Card 
                onClick={handleConfirmedClick} 
                sx={{ 
                  flex: '1 1 calc(33% - 16px)',
                  minWidth: 240,
                  cursor: 'pointer',
                  bgcolor: 'linear-gradient(135deg, #e0f7fa 0%, #e8f5e8 100%)',
                  boxShadow: '0px 2px 8px rgba(44, 167, 50, 0.10)',
                  border: '2px solid #26a69a',
                  '&:hover': { boxShadow: '0px 4px 16px rgba(44, 167, 50, 0.18)' }
                }}
              >
                <CardContent sx={{ 
                  p: 3, 
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}>
                  <Typography 
                    sx={{ 
                      fontWeight: 700, 
                      fontSize: '1.15rem', 
                      color: '#1976d2',
                      mb: 2
                    }}
                  >
                    Confirmed Appointments Today
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <EventAvailableIcon sx={{ fontSize: 60, color: '#26a69a', mb: 1 }} />
                    <Typography variant="h2" sx={{ fontWeight: 800, color: '#1976d2' }}>
                      {stats.confirmedAppointments}
                    </Typography>
                    {confirmedTrend === 'up' && <ArrowUpwardIcon sx={{ color: '#4CAF50', mt: 1 }} />}
                    {confirmedTrend === 'down' && <ArrowDownwardIcon sx={{ color: '#F44336', mt: 1 }} />}
                    <Typography sx={{ color: '#666', mt: 1, fontSize: '0.95rem' }}>
                      Compared to yesterday
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              {/* Pending Appointments Card */}
              <Card 
                onClick={handleConfirmedClick} 
                sx={{ 
                  flex: '1 1 calc(33% - 16px)',
                  minWidth: 240,
                  cursor: 'pointer',
                  bgcolor: 'linear-gradient(135deg, #fffde7 0%, #fff3e0 100%)',
                  boxShadow: '0px 2px 8px rgba(255, 193, 7, 0.10)',
                  border: '2px solid #ffa726',
                  '&:hover': { boxShadow: '0px 4px 16px rgba(255, 193, 7, 0.18)' }
                }}
              >
                <CardContent sx={{ 
                  p: 3, 
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}>
                  <Typography 
                    sx={{ 
                      fontWeight: 700, 
                      fontSize: '1.15rem', 
                      color: '#ffa726',
                      mb: 2
                    }}
                  >
                    Pending Appointments
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <ScheduleIcon sx={{ fontSize: 60, color: '#ffa726', mb: 1 }} />
                    <Typography variant="h2" sx={{ fontWeight: 800, color: '#ffa726' }}>
                      {stats.pendingAppointments}
                    </Typography>
                    <Typography sx={{ color: '#666', mt: 1, fontSize: '0.95rem' }}>
                      Awaiting confirmation
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              {/* Records Card */}
              <Card 
                onClick={() => navigate('/ManageRecord')} 
                sx={{ 
                  flex: '1 1 calc(33% - 16px)',
                  minWidth: 240,
                  cursor: 'pointer',
                  bgcolor: 'linear-gradient(135deg, #e3f2fd 0%, #e1f5fe 100%)',
                  boxShadow: '0px 2px 8px rgba(33, 150, 243, 0.10)',
                  border: '2px solid #1976d2',
                  '&:hover': { boxShadow: '0px 4px 16px rgba(33, 150, 243, 0.18)' }
                }}
              >
                <CardContent sx={{ 
                  p: 3, 
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}>
                  <Typography 
                    sx={{ 
                      fontWeight: 700, 
                      fontSize: '1.15rem', 
                      color: '#1976d2',
                      mb: 2
                    }}
                  >
                    Records
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 5, alignItems: 'center' }}>
                    <PieChart width={80} height={80}>
                      <Pie
                        data={[{ name: 'Paid', value: stats.paidRecords }, { name: 'Unpaid', value: stats.unpaidRecords }]}
                        cx={40}
                        cy={40}
                        innerRadius={25}
                        outerRadius={35}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {COLORS.map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
                        ))}
                      </Pie>
                    </PieChart>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography sx={{ fontSize: 32, color: '#4CAF50', mb: 1, fontWeight: 700 }}>
                        ₱
                      </Typography>
                      <Typography sx={{ fontWeight: 700, color: '#4CAF50', fontSize: '1.1rem' }}>
                        Paid: ₱{stats.paidRecords}
                      </Typography>
                      <Typography sx={{ fontSize: 32, color: '#F44336', mb: 1, fontWeight: 700 }}>
                        ₱
                      </Typography>
                      <Typography sx={{ fontWeight: 700, color: '#F44336', fontSize: '1.1rem' }}>
                        Unpaid: ₱{stats.unpaidRecords}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography sx={{ color: '#666', mt: 1, fontSize: '0.95rem' }}>
                    Financial summary
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            {/* Bottom Row - Using flex layout to match screenshot proportions */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {/* Graphs Panel - Takes 2/3 of space */}
              <Card 
                sx={{ 
                  flex: '2 1 600px',
                  bgcolor: '#FFFFFF',
                  boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.05)',
                  '&:hover': { boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)' }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AssessmentIcon sx={{ color: '#1c444d', fontSize: 24, mr: 1 }} />
                    <Typography sx={{ fontWeight: 600, fontSize: '1.1rem', color: '#1c444d' }}>
                      Appointment Time Frequency
                    </Typography>
                  </Box>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={appointmentTimeData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" label={{ value: 'Hour', position: 'insideBottom', offset: -5 }} />
                      <YAxis allowDecimals={false} label={{ value: 'Appointments', angle: -90, position: 'insideLeft' }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#1c444d" name="Appointments" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Patients per Doctor Panel - Pie chart */}
              <Card 
                sx={{ 
                  flex: '1 1 300px',
                  bgcolor: '#FFFFFF',
                  boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.05)',
                  '&:hover': { boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)' }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AssessmentIcon sx={{ color: '#1c444d', fontSize: 24, mr: 1 }} />
                    <Typography sx={{ fontWeight: 600, fontSize: '1.1rem', color: '#1c444d' }}>
                      Patients per Doctor
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                    <PieChart width={160} height={160}>
                      <Pie
                        data={doctorPatientData}
                        cx={80}
                        cy={80}
                        innerRadius={50}
                        outerRadius={75}
                        dataKey="value"
                      >
                        {doctorPatientData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={`hsl(${index * 60}, 70%, 50%)`} />
                        ))}
                      </Pie>
                    </PieChart>
                    <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                      {doctorPatientData.map((entry, index) => (
                        <Box key={entry.name} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Box sx={{ width: 16, height: 16, bgcolor: `hsl(${index * 60}, 70%, 50%)`, borderRadius: '50%', mr: 1 }} />
                          <Typography sx={{ fontWeight: 500, color: '#1c444d', fontSize: '1rem' }}>
                            {entry.name}
                          </Typography>
                          <Typography sx={{ ml: 1, color: '#666', fontSize: '0.95rem' }}>
                            ({entry.value} patient{entry.value !== 1 ? 's' : ''})
                          </Typography>
                        </Box>
                      ))}
                      {doctorPatientData.length === 0 && (
                        <Typography sx={{ color: '#999', mt: 2, fontStyle: 'italic', textAlign: 'center' }}>
                          No patient data available
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>
        )}
      </motion.div>
    </div>
  );
}

export default AdminDashboard;
