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
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { motion } from "framer-motion";

// Animation variants for consistent motion
const contentVariants = {
  initial: { opacity: 0, x: 20, y: 10 },
  animate: { opacity: 1, x: 0, y: 0 },
  exit: { opacity: 0, x: -20, y: 10 }
};

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
  const [auditLogs, setAuditLogs] = useState([]);
  const navigate = useNavigate();

  // Existing data fetching logic remains the same
  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/appointment/getall'),
      api.get('/record/list?status=paid'),
      api.get('/record/list?status=unpaid'),
      api.get('/auth/user')
    ]).then(([appointmentsRes, paidRes, unpaidRes, usersRes]) => {
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
      setLoading(false);
    }).catch((err) => {
      setError('Failed to load dashboard stats.');
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    // Fetch audit logs
    api.get('/audit?limit=5').then(res => {
      setAuditLogs(res.data.slice(0, 5));
    }).catch(() => setAuditLogs([]));
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
                  bgcolor: '#FFFFFF',
                  boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.05)',
                  '&:hover': { boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)' }
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
                      fontWeight: 600, 
                      fontSize: '1.1rem', 
                      color: '#1c444d',
                      mb: 3
                    }}
                  >
                    Confirmed Appointments Today
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <CheckCircleIcon sx={{ fontSize: 56, color: '#4CAF50', mb: 1 }} />
                    <Typography variant="h2" sx={{ fontWeight: 700 }}>
                      {stats.confirmedAppointments}
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
                  bgcolor: '#FFFFFF',
                  boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.05)',
                  '&:hover': { boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)' }
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
                      fontWeight: 600, 
                      fontSize: '1.1rem', 
                      color: '#1c444d',
                      mb: 3
                    }}
                  >
                    Pending Appointments
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <HourglassEmptyIcon sx={{ fontSize: 56, color: '#FF9800', mb: 1 }} />
                    <Typography variant="h2" sx={{ fontWeight: 700 }}>
                      {stats.pendingAppointments}
                    </Typography>
                    <Typography sx={{ color: '#666', mt: 0.5 }}>
                      Appointments
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
                  bgcolor: '#FFFFFF',
                  boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.05)',
                  '&:hover': { boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)' }
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
                      fontWeight: 600, 
                      fontSize: '1.1rem', 
                      color: '#1c444d',
                      mb: 3
                    }}
                  >
                    Records
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 5 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <PaidIcon sx={{ fontSize: 32, color: '#4CAF50', mb: 1 }} />
                      <Typography sx={{ fontWeight: 600, color: '#4CAF50', fontSize: '1.1rem' }}>
                        Paid: {stats.paidRecords}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ textAlign: 'center' }}>
                      <MoneyOffIcon sx={{ fontSize: 32, color: '#F44336', mb: 1 }} />
                      <Typography sx={{ fontWeight: 600, color: '#F44336', fontSize: '1.1rem' }}>
                        Unpaid: {stats.unpaidRecords}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>

            {/* Bottom Row - Using flex layout to match screenshot proportions */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {/* Pending Users Panel */}
              <Card 
                onClick={() => navigate('/ManageUser')} 
                sx={{ 
                  flex: '1 1 300px',
                  cursor: 'pointer',
                  bgcolor: '#FFFFFF',
                  boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.05)',
                  '&:hover': { boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)' }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PeopleAltIcon sx={{ color: '#1c444d', fontSize: 24, mr: 1 }} />
                    <Typography sx={{ fontWeight: 600, fontSize: '1.1rem', color: '#1c444d' }}>
                      Pending Users ({pendingUsersList.length})
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mt: 2 }}>
                    {pendingUsersList.length > 0 ? (
                      pendingUsersList.slice(0, 5).map((user, idx) => (
                        <Paper
                          key={user.userId || idx}
                          elevation={0}
                          sx={{
                            p: 2,
                            mb: 1,
                            borderRadius: 1,
                            bgcolor: '#f9fafb',
                            border: '1px solid #e0e7eb'
                          }}
                        >
                          <Typography sx={{ fontWeight: 500, fontSize: '0.95rem' }}>
                            {user.name || user.username}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" fontSize="0.85rem">
                            {user.email}
                          </Typography>
                        </Paper>
                      ))
                    ) : (
                      <Box sx={{ p: 2, textAlign: 'center' }}>
                        <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>
                          No pending users
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
              
              {/* Audit Logs Panel - Takes 2/3 of space */}
              <Card 
                onClick={() => navigate('/ViewAudit')} 
                sx={{ 
                  flex: '2 1 600px',
                  cursor: 'pointer',
                  bgcolor: '#FFFFFF',
                  boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.05)',
                  '&:hover': { boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)' }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AssessmentIcon sx={{ color: '#1c444d', fontSize: 24, mr: 1 }} />
                    <Typography sx={{ fontWeight: 600, fontSize: '1.1rem', color: '#1c444d' }}>
                      Audit Logs Preview
                    </Typography>
                  </Box>
                  
                  {auditLogs.length > 0 ? (
                    auditLogs.map((log, idx) => (
                      <Paper
                        key={log._id || idx}
                        elevation={0}
                        sx={{
                          p: 2,
                          mb: 1,
                          borderRadius: 1,
                          bgcolor: '#f9fafb',
                          border: '1px solid #e0e7eb'
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography sx={{ fontWeight: 600, color: '#1976d2', fontSize: '0.95rem' }}>
                              {log.userName}
                            </Typography>
                            <Typography component="span" sx={{ color: '#666', fontSize: '0.8rem', ml: 0.5 }}>
                              ({log.role})
                            </Typography>
                          </Box>
                          <Typography sx={{ color: '#919eab', fontSize: '0.75rem' }}>
                            {new Date(log.timestamp).toLocaleString()}
                          </Typography>
                        </Box>
                        <Typography sx={{ color: '#212B36', fontSize: '0.85rem' }}>
                          {log.details}
                        </Typography>
                      </Paper>
                    ))
                  ) : (
                    <Box sx={{ p: 2, textAlign: 'center' }}>
                      <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        No audit logs found
                      </Typography>
                    </Box>
                  )}
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
