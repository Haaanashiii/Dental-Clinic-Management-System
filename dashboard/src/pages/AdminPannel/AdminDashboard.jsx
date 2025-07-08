/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import ClientSidebar from "../UserPannel/ClientSidebar";
import './AdminDashboard.css';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import PaidIcon from '@mui/icons-material/Paid';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import api from '../../api';

function AdminDashboard() {
  // Simulated async data fetching
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
      today.setHours(0, 0, 0, 0); // Set to start of today
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
    // Fetch audit logs for preview
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
      <div className="admin-dashboard-content">
        <div className="admin-dashboard-header">
          
          {error && (
            <Typography color="error">{error}</Typography>
          )}
          {loading ? (
            <div className="admin-dashboard-loading">
              <CircularProgress />
            </div>
          ) : (
            <Grid container spacing={3} className="admin-dashboard-boxes">
              <Grid item xs={12} sm={6} md={4}>
                <Card className="admin-dashboard-card confirmed" style={{ cursor: 'pointer' }}
                  onClick={handleConfirmedClick}>
                  <CardContent style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: 150, minWidth: 250, justifyContent: 'center' }}>
                    <Typography className="admin-dashboard-card-title" style={{ fontWeight: 600, fontSize: 20, marginBottom: 18, textAlign: 'center' }}>
                      Confirmed Appointments Today
                    </Typography>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                      <CheckCircleIcon color="success" style={{ fontSize: 40 }} />
                      <Typography className="admin-dashboard-card-value" style={{ fontWeight: 700, fontSize: 36, color: '#222', margin: 0 }}>
                        {stats.confirmedAppointments}
                      </Typography>
                    </div>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card className="admin-dashboard-card pending" style={{ cursor: 'pointer' }}
                  onClick={handleConfirmedClick}>
                  <CardContent style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: 150,minWidth:250, justifyContent: 'center' }}>
                    <Typography className="admin-dashboard-card-title" style={{ fontWeight: 600, fontSize: 20, marginBottom: 18, textAlign: 'center' }}>
                      Pending Appointments
                    </Typography>
                    <div style={{ display: 'flex', flexDirection: 'row', gap: 40, justifyContent: 'center', width: '100%' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <HourglassEmptyIcon color="warning" style={{ fontSize: 36, marginBottom: 2 }} />
                        <Typography className="admin-dashboard-card-value" style={{ fontWeight: 700, fontSize: 28, color: '#222', margin: 0 }}>
                          {stats.pendingAppointments}
                        </Typography>
                        <Typography style={{ fontSize: 15, color: '#666', marginTop: 2 }}>Appointments</Typography>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={12} md={4}>
                <Card className="admin-dashboard-card records" style={{ cursor: 'pointer' }}
                  onClick={() => navigate('/ManageRecord')}>
                  <CardContent style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: 150, minWidth: 250,  justifyContent: 'center' }}>
                    <Typography className="admin-dashboard-card-title" style={{ fontWeight: 600, fontSize: 20, marginBottom: 18, textAlign: 'center' }}>
                      Records
                    </Typography>
                    <div style={{ display: 'flex', flexDirection: 'row', gap: 40, justifyContent: 'center', width: '100%' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <PaidIcon color="success" style={{ fontSize: 36, marginBottom: 2 }} />
                        <Typography className="admin-dashboard-card-paid" style={{ fontWeight: 700, fontSize: 24, color: '#43a047', margin: 0 }}>
                          Paid: {stats.paidRecords}
                        </Typography>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <MoneyOffIcon color="error" style={{ fontSize: 36, marginBottom: 2 }} />
                        <Typography className="admin-dashboard-card-unpaid" style={{ fontWeight: 700, fontSize: 24, color: '#f44336', margin: 0 }}>
                          Unpaid: {stats.unpaidRecords}
                        </Typography>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </div>
        <div className="admin-dashboard-Body">
          <div className="admin-dashboard-body-cards">
            <Grid container spacing={3} className="admin-dashboard-body-cards" style={{ marginTop: 0 }}>
              <Grid item xs={12} md={6}>
                <Card className="admin-dashboard-card pending-users" style={{ marginBottom: 24, cursor: 'pointer', width: '100%', maxWidth: '100%' }}
                  onClick={() => navigate('/ManageUsers')}>
                  <CardContent style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <Typography className="admin-dashboard-card-title" style={{ fontWeight: 600, fontSize: 20, marginBottom: 12, textAlign: 'center' }}>
                      Pending Users ({pendingUsersList.length})
                    </Typography>
                    <div style={{ width: '100%' }}>
                      {pendingUsersList.length > 0 ? (
                        pendingUsersList.slice(0, 5).map((user, idx) => (
                          <Typography key={user.userId || idx} style={{ fontSize: 16, color: '#1C444D', marginBottom: 4, textAlign: 'center', fontWeight: 500 }}>
                            {user.name} ({user.email})
                          </Typography>
                        ))
                      ) : (
                        <Typography style={{ color: '#888', textAlign: 'center' }}>No pending users</Typography>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6} style={{ marginLeft: 30 }}>
                <Card className="admin-dashboard-card audit-preview" style={{ marginBottom: 24, background: '#f8fafc', cursor: 'pointer', width: '100%', maxWidth: '100%' }}
  onClick={() => navigate('/ViewAudit')}>
                  <CardContent style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <Typography className="admin-dashboard-card-title" style={{ fontWeight: 600, fontSize: 20, marginBottom: 12, textAlign: 'center' }}>
                      Audit Logs Preview
                    </Typography>
                    {auditLogs.length === 0 ? (
                      <Typography style={{ color: '#888', textAlign: 'center' }}>No audit logs found.</Typography>
                    ) : (
                      <div style={{ width: '100%',height: 300, overflowY: 'auto', padding: 8 }}>
                        {auditLogs.map((log, idx) => (
                          <Typography key={log._id || idx} style={{ fontSize: 15, color: '#1C444D', marginBottom: 4, textAlign: 'left', fontWeight: 500 }}>
                            <span style={{ color: '#1976d2', fontWeight: 600 }}>{log.userName}</span> <span style={{ color: '#888', fontSize: 13 }}>({log.role})</span>:<br/>
                            <span style={{ color: '#333' }}>{log.details.split(' ').slice(0, 8).join(' ')}{log.details.split(' ').length > 8 ? '...' : ''}</span>
                            <span style={{ color: '#aaa', fontSize: 12, float: 'right' }}>{new Date(log.timestamp).toLocaleString()}</span>
                          </Typography>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </div>
        </div>
         
      </div>
    </div>
  );
}

export default AdminDashboard
