/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import ClientSidebar from "../UserPannel/ClientSidebar";
import './AdminDashboard.css';
import { 
  Card, CardContent, Typography, CircularProgress, Grid, Box, Paper,
  Container, useTheme, alpha
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
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
  PieChart, Pie, Cell, Sector
} from 'recharts';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import ScheduleIcon from '@mui/icons-material/Schedule';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

// Animation variants for consistent motion
const contentVariants = {
  initial: { opacity: 0, x: 20, y: 10 },
  animate: { opacity: 1, x: 0, y: 0 },
  exit: { opacity: 0, x: -20, y: 10 }
};

// Professional color palette that complements the system
const COLORS = ['#1c444d', '#26a69a', '#64b5f6', '#81c784', '#ffb74d'];

// Custom bar chart tooltip with improved positioning
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="label">{label}</p>
        <p className="value">
          Appointments: {payload[0].value}
        </p>
      </div>
    );
  }

  return null;
};

// Custom pie chart active shape with proper positioning
const renderActiveShape = (props) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle,
    fill, payload, percent, value } = props;
  
  const RADIAN = Math.PI / 180;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  
  // Calculate positions to prevent overlaps
  const outerR = outerRadius + 10;
  const sx = cx + outerR * cos;
  const sy = cy + outerR * sin;
  
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <text 
        x={cx} 
        y={cy} 
        dy={-15} 
        textAnchor="middle" 
        fill={fill}
        style={{ fontWeight: 600, fontSize: '0.875rem' }}
      >
        {payload.name}
      </text>
      <text 
        x={cx} 
        y={cy} 
        dy={15} 
        textAnchor="middle" 
        fill="#333"
        style={{ fontSize: '0.875rem' }}
      >
        {`${value} patients`}
      </text>
    </g>
  );
};

function AdminDashboard() {
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
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();

  // Handle pie chart hover
  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

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

  // Calculate yesterday's confirmed appointments for trend
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

        {/* Main Content - Fix spacing and layout */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress sx={{ color: '#1c444d' }} />
          </Box>
        ) : (
          <Box sx={{ width: '100%', px: 0 }}>
            {/* Top Cards - Fix spacing and layout */}
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: { xs: 2, md: 3 },
              mb: { xs: 3, md: 4 },
              width: '100%',
              // Adjusted justification to better handle 4 cards
              justifyContent: { xs: 'center', sm: 'flex-start' }
            }}>
              {/* Confirmed Appointments Card */}
              <Card 
                onClick={handleConfirmedClick} 
                sx={{ 
                  flex: '1 1 240px',  // Changed min width to prevent overflow
                  cursor: 'pointer',
                  bgcolor: '#ffffff',
                  boxShadow: '0px 2px 8px rgba(28, 68, 77, 0.08)',
                  border: '1px solid rgba(38, 166, 154, 0.3)',
                  borderRadius: 3,
                  overflow: 'hidden',
                  transition: 'all 0.2s ease-in-out',
                  display: 'flex',     // Ensure flex layout
                  flexDirection: 'column', // Stack children vertically
                  minHeight: '200px',  // Ensure minimum height
                  '&:hover': { 
                    boxShadow: '0px 6px 16px rgba(28, 68, 77, 0.15)',
                    transform: 'translateY(-4px)'
                  }
                }}
              >
                <CardContent sx={{ 
                  p: 0, 
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  height: '100%'
                }}>
                  <Box sx={{ 
                    p: 1.5, 
                    bgcolor: '#1c444d', 
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1
                  }}>
                    <EventAvailableIcon sx={{ color: '#ffffff' }} />
                    <Typography sx={{ 
                      fontWeight: 600, 
                      color: '#ffffff',
                      fontSize: '1rem'
                    }}>
                      Confirmed Appointments Today
                    </Typography>
                  </Box>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 3,
                    flexGrow: 1
                  }}>
                    <Typography variant="h2" sx={{ 
                      fontWeight: 700, 
                      color: '#1c444d',
                      fontSize: { xs: '3rem', sm: '3.5rem' },
                      mb: 1
                    }}>
                      {stats.confirmedAppointments}
                    </Typography>
                    
                    <Box sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 0.5
                    }}>
                      {confirmedTrend === 'up' && (
                        <>
                          <ArrowUpwardIcon sx={{ color: '#26a69a', fontSize: '1.2rem' }} />
                          <Typography sx={{ color: '#26a69a', fontWeight: 500 }}>
                            Compared to yesterday
                          </Typography>
                        </>
                      )}
                      {confirmedTrend === 'down' && (
                        <>
                          <ArrowDownwardIcon sx={{ color: '#ef5350', fontSize: '1.2rem' }} />
                          <Typography sx={{ color: '#ef5350', fontWeight: 500 }}>
                            Compared to yesterday
                          </Typography>
                        </>
                      )}
                      {confirmedTrend === null && (
                        <Typography sx={{ color: '#757575', fontWeight: 500 }}>
                          Same as yesterday
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* Pending Appointments Card */}
              <Card 
                onClick={handleConfirmedClick} 
                sx={{ 
                  flex: '1 1 240px',  // Changed min width to prevent overflow
                  cursor: 'pointer',
                  bgcolor: '#ffffff',
                  boxShadow: '0px 2px 8px rgba(28, 68, 77, 0.08)',
                  border: '1px solid rgba(255, 152, 0, 0.3)',
                  borderRadius: 3,
                  overflow: 'hidden',
                  transition: 'all 0.2s ease-in-out',
                  display: 'flex',     // Ensure flex layout
                  flexDirection: 'column', // Stack children vertically
                  minHeight: '200px',  // Ensure minimum height
                  '&:hover': { 
                    boxShadow: '0px 6px 16px rgba(28, 68, 77, 0.15)',
                    transform: 'translateY(-4px)'
                  }
                }}
              >
                <CardContent sx={{ 
                  p: 0, 
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  height: '100%'
                }}>
                  <Box sx={{ 
                    p: 1.5, 
                    bgcolor: '#ff9800', 
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1
                  }}>
                    <ScheduleIcon sx={{ color: '#ffffff' }} />
                    <Typography sx={{ 
                      fontWeight: 600, 
                      color: '#ffffff',
                      fontSize: '1rem'
                    }}>
                      Pending Appointments
                    </Typography>
                  </Box>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 3,
                    flexGrow: 1
                  }}>
                    <Typography variant="h2" sx={{ 
                      fontWeight: 700, 
                      color: '#ff9800',
                      fontSize: { xs: '3rem', sm: '3.5rem' },
                      mb: 1
                    }}>
                      {stats.pendingAppointments}
                    </Typography>
                    
                    <Typography sx={{ color: '#757575', fontWeight: 500 }}>
                      Awaiting confirmation
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              {/* Records Card */}
              <Card 
                onClick={() => navigate('/ManageRecord')} 
                sx={{ 
                  flex: '1 1 240px',  // Changed min width to prevent overflow
                  cursor: 'pointer',
                  bgcolor: '#ffffff',
                  boxShadow: '0px 2px 8px rgba(28, 68, 77, 0.08)',
                  border: '1px solid rgba(33, 150, 243, 0.3)',
                  borderRadius: 3,
                  overflow: 'hidden',
                  transition: 'all 0.2s ease-in-out',
                  display: 'flex',     // Ensure flex layout
                  flexDirection: 'column', // Stack children vertically
                  minHeight: '200px',  // Ensure minimum height
                  '&:hover': { 
                    boxShadow: '0px 6px 16px rgba(28, 68, 77, 0.15)',
                    transform: 'translateY(-4px)'
                  }
                }}
              >
                <CardContent sx={{ 
                  p: 0, 
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  height: '100%'
                }}>
                  <Box sx={{ 
                    p: 1.5, 
                    bgcolor: '#2196f3', 
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1
                  }}>
                    <MonetizationOnIcon sx={{ color: '#ffffff' }} />
                    <Typography sx={{ 
                      fontWeight: 600, 
                      color: '#ffffff',
                      fontSize: '1rem'
                    }}>
                      Records
                    </Typography>
                  </Box>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 3,
                    flexGrow: 1,
                    width: '100%'
                  }}>
                    {/* Chart container with fixed position */}
                    <Box sx={{ 
                      width: 100,
                      height: 100,
                      position: 'relative',
                      mb: 2
                    }}>
                      <PieChart width={100} height={100}>
                        <Pie
                          data={[
                            { name: 'Paid', value: stats.paidRecords || 0 }, 
                            { name: 'Unpaid', value: stats.unpaidRecords || 1 }
                          ]}
                          cx={50}
                          cy={50}
                          innerRadius={25}
                          outerRadius={45}
                          dataKey="value"
                          startAngle={90}
                          endAngle={-270}
                        >
                          <Cell fill="#26a69a" />
                          <Cell fill="#ef5350" />
                        </Pie>
                      </PieChart>
                    </Box>
                    
                    {/* Legend with fixed spacing */}
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-around', 
                      width: '100%', 
                      mt: 1
                    }}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        gap: 0.5
                      }}>
                        <Box sx={{ 
                          width: 12, 
                          height: 12, 
                          bgcolor: '#26a69a', 
                          borderRadius: '50%' 
                        }} />
                        <Typography sx={{ fontWeight: 600, color: '#26a69a', fontSize: '0.875rem' }}>
                          Paid: {stats.paidRecords}
                        </Typography>
                      </Box>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        gap: 0.5
                      }}>
                        <Box sx={{ 
                          width: 12, 
                          height: 12, 
                          bgcolor: '#ef5350', 
                          borderRadius: '50%' 
                        }} />
                        <Typography sx={{ fontWeight: 600, color: '#ef5350', fontSize: '0.875rem' }}>
                          Unpaid: {stats.unpaidRecords}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* Pending Users Card */}
              <Card 
                onClick={() => navigate('/ManageUser')} // Update this path if your user management page has a different route
                sx={{ 
                  flex: '1 1 240px',
                  cursor: 'pointer',
                  bgcolor: '#ffffff',
                  boxShadow: '0px 2px 8px rgba(28, 68, 77, 0.08)',
                  border: '1px solid rgba(103, 58, 183, 0.3)', // Purple-themed border
                  borderRadius: 3,
                  overflow: 'hidden',
                  transition: 'all 0.2s ease-in-out',
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: '200px',
                  '&:hover': { 
                    boxShadow: '0px 6px 16px rgba(28, 68, 77, 0.15)',
                    transform: 'translateY(-4px)'
                  }
                }}
              >
                <CardContent sx={{ 
                  p: 0, 
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  height: '100%'
                }}>
                  <Box sx={{ 
                    p: 1.5, 
                    bgcolor: '#673ab7', // Purple color for header
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1
                  }}>
                    <PeopleAltIcon sx={{ color: '#ffffff' }} />
                    <Typography sx={{ 
                      fontWeight: 600, 
                      color: '#ffffff',
                      fontSize: '1rem'
                    }}>
                      Pending Users
                    </Typography>
                  </Box>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 3,
                    flexGrow: 1
                  }}>
                    <Typography variant="h2" sx={{ 
                      fontWeight: 700, 
                      color: '#673ab7', // Purple color matching header
                      fontSize: { xs: '3rem', sm: '3.5rem' },
                      mb: 1
                    }}>
                      {stats.pendingUsers}
                    </Typography>
                    
                    <Typography sx={{ color: '#757575', fontWeight: 500 }}>
                      Awaiting approval
                    </Typography>
                    
                    {pendingUsersList.length > 0 && (
                      <Box sx={{ 
                        mt: 2, 
                        width: '100%',
                        maxHeight: '70px',
                        overflowY: 'auto',
                        pr: 1
                      }}>
                        {pendingUsersList.slice(0, 3).map((user, index) => (
                          <Box key={user.id || index} sx={{ 
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 0.5,
                            mb: 0.5
                          }}>
                            <Box sx={{ 
                              width: 8, 
                              height: 8, 
                              bgcolor: '#673ab7', 
                              borderRadius: '50%' 
                            }} />
                            <Typography sx={{ 
                              fontSize: '0.75rem',
                              color: '#555',
                              textOverflow: 'ellipsis',
                              overflow: 'hidden',
                              whiteSpace: 'nowrap',
                              maxWidth: '180px'
                            }}>
                              {user.name || user.email || "Anonymous User"}
                            </Typography>
                          </Box>
                        ))}
                        {pendingUsersList.length > 3 && (
                          <Typography sx={{ 
                            fontSize: '0.75rem', 
                            color: '#673ab7', 
                            fontStyle: 'italic',
                            mt: 0.5
                          }}>
                            +{pendingUsersList.length - 3} more
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Box>

            {/* Bottom Row - Fix chart spacing and layout */}
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: { xs: 2, md: 3 },
              mb: 2
            }}>
              {/* Graphs Panel - Fix height and responsive issues */}
              <Card 
                sx={{ 
                  flex: '2 1 500px', // Adjusted minimum width
                  bgcolor: '#FFFFFF',
                  boxShadow: '0px 2px 8px rgba(28, 68, 77, 0.08)',
                  borderRadius: 3,
                  border: '1px solid rgba(38, 166, 154, 0.2)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': { 
                    boxShadow: '0px 6px 16px rgba(28, 68, 77, 0.15)',
                  }
                }}
              >
                <CardContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ 
                    p: 2, 
                    borderBottom: '1px solid rgba(0,0,0,0.08)',
                    display: 'flex', 
                    alignItems: 'center',
                    bgcolor: 'rgba(38, 166, 154, 0.05)'
                  }}>
                    <AssessmentIcon sx={{ color: '#1c444d', fontSize: 24, mr: 1 }} />
                    <Typography sx={{ fontWeight: 600, fontSize: '1.1rem', color: '#1c444d' }}>
                      Appointment Time Frequency
                    </Typography>
                  </Box>
                  
                  {/* Fixed height chart container */}
                  <Box sx={{ p: 2, height: 360, flexGrow: 1 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={appointmentTimeData} 
                        margin={{ top: 20, right: 30, left: 20, bottom: 40 }} // Increased bottom margin
                        barSize={36}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
                        <XAxis 
                          dataKey="hour" 
                          tick={{ fill: '#1c444d', fontSize: 12 }}
                          axisLine={{ stroke: '#1c444d', strokeWidth: 1 }}
                          tickLine={{ stroke: '#1c444d' }}
                          height={40} // Increased height for labels
                        />
                        <YAxis 
                          allowDecimals={false} 
                          tick={{ fill: '#1c444d', fontSize: 12 }}
                          axisLine={{ stroke: '#1c444d', strokeWidth: 1 }}
                          tickLine={{ stroke: '#1c444d' }}
                          width={30} // Fixed width for axis
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend 
                          wrapperStyle={{ paddingTop: 20 }}
                          formatter={(value) => <span style={{ color: '#1c444d', fontWeight: 600 }}>{value}</span>}
                        />
                        <Bar 
                          dataKey="count" 
                          name="Appointments" 
                          fill="#1c444d" 
                          radius={[4, 4, 0, 0]}
                          background={{ fill: 'rgba(28, 68, 77, 0.05)' }}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>

              {/* Patients per Doctor Panel - Fix height and layout */}
              <Card 
                sx={{ 
                  flex: '1 1 270px', // Adjusted minimum width
                  bgcolor: '#FFFFFF',
                  boxShadow: '0px 2px 8px rgba(28, 68, 77, 0.08)',
                  borderRadius: 3,
                  border: '1px solid rgba(38, 166, 154, 0.2)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': { 
                    boxShadow: '0px 6px 16px rgba(28, 68, 77, 0.15)',
                  }
                }}
              >
                <CardContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ 
                    p: 2, 
                    borderBottom: '1px solid rgba(0,0,0,0.08)',
                    display: 'flex', 
                    alignItems: 'center',
                    bgcolor: 'rgba(38, 166, 154, 0.05)'
                  }}>
                    <PieChartIcon sx={{ color: '#1c444d', fontSize: 24, mr: 1 }} />
                    <Typography sx={{ fontWeight: 600, fontSize: '1.1rem', color: '#1c444d' }}>
                      Patients per Doctor
                    </Typography>
                  </Box>
                  
                  <Box sx={{ 
                    p: 2, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    height: 360,
                    flexGrow: 1
                  }}>
                    {doctorPatientData.length > 0 ? (
                      <>
                        {/* Fixed height chart container */}
                        <Box sx={{ height: 200, width: '100%', mb: 2 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                activeIndex={activeIndex}
                                activeShape={renderActiveShape}
                                data={doctorPatientData}
                                cx="50%"
                                cy="50%"
                                innerRadius={45}
                                outerRadius={65}
                                dataKey="value"
                                onMouseEnter={onPieEnter}
                                paddingAngle={2}
                              >
                                {doctorPatientData.map((entry, index) => (
                                  <Cell 
                                    key={`cell-${index}`} 
                                    fill={COLORS[index % COLORS.length]} 
                                  />
                                ))}
                              </Pie>
                            </PieChart>
                          </ResponsiveContainer>
                        </Box>
                        
                        {/* Fixed height legend container */}
                        <Box sx={{ 
                          width: '100%', 
                          display: 'flex', 
                          flexDirection: 'column', 
                          gap: 1,
                          maxHeight: 140,
                          overflowY: 'auto',
                          pr: 1,
                          mt: 'auto'
                        }}>
                          {doctorPatientData.map((entry, index) => (
                            <Box key={entry.name} sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'space-between',
                              borderBottom: '1px dashed rgba(0,0,0,0.08)',
                              pb: 0.5
                            }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box 
                                  sx={{ 
                                    width: 12, 
                                    height: 12, 
                                    bgcolor: COLORS[index % COLORS.length], 
                                    borderRadius: '50%' 
                                  }} 
                                />
                                <Typography sx={{ 
                                  fontWeight: 500, 
                                  color: '#1c444d', 
                                  fontSize: '0.85rem',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  maxWidth: '120px'
                                }}>
                                  Dr. {entry.name}
                                </Typography>
                              </Box>
                              <Typography sx={{ 
                                color: '#1c444d', 
                                fontWeight: 600, 
                                fontSize: '0.85rem',
                                whiteSpace: 'nowrap'
                              }}>
                                {entry.value} {entry.value === 1 ? 'patient' : 'patients'}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      </>
                    ) : (
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        height: '100%'
                      }}>
                        <Typography sx={{ color: '#757575', fontStyle: 'italic' }}>
                          No patient data available
                        </Typography>
                      </Box>
                    )}
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
