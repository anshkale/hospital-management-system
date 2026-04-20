import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Chip, Grid, Avatar, Divider, Button, CircularProgress, Alert, IconButton, Tooltip } from '@mui/material';
import { CalendarToday, AccessTime, Person, MedicalServices, Notes, Refresh } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosConfig';

const statusColors = {
  PENDING:   { color: 'warning', label: 'Pending'   },
  CONFIRMED: { color: 'success', label: 'Confirmed' },
  CANCELLED: { color: 'error',   label: 'Cancelled' },
  COMPLETED: { color: 'info',    label: 'Completed' },
};

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  try { return new Date(dateStr).toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }); }
  catch { return dateStr; }
};

const getPatientId = () => {
  try { const user = JSON.parse(sessionStorage.getItem('user') || '{}'); return user.id || user.patientId || null; }
  catch { return null; }
};

const ViewAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchAppointments = async () => {
    setLoading(true); setError('');
    const patientId = getPatientId();
    if (!patientId) { setError('Could not find your patient ID. Please log in again.'); setLoading(false); return; }
    try {
      const res = await axiosInstance.get(`/api/appointments/patient/${patientId}`);
      setAppointments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err?.response?.status === 401 ? 'Session expired. Please log in again.' : 'Failed to load appointments. Please try again.');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchAppointments(); }, []);

  if (loading) return <Box sx={{ display:'flex', justifyContent:'center', mt:10 }}><CircularProgress sx={{ color:'#0a3a2e' }} /></Box>;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 900, mx: 'auto' }}>
      <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', mb:3 }}>
        <Typography variant="h5" fontWeight={700} sx={{ color:'#0a3a2e' }}>My Appointments</Typography>
        <Box sx={{ display:'flex', gap:1 }}>
          <Tooltip title="Refresh"><IconButton onClick={fetchAppointments} sx={{ color:'#0a3a2e' }}><Refresh /></IconButton></Tooltip>
          <Button variant="contained" size="small" onClick={() => navigate('/LifeBridgeHospital/book-appointment')}
            sx={{ background:'linear-gradient(135deg, #0a3a2e, #0f5c45)', textTransform:'none', fontWeight:700, borderRadius:'10px', '&:hover':{ background:'linear-gradient(135deg, #0d4d3a, #1a7a5e)' } }}>
            + Book New
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb:2 }}>{error}</Alert>}

      {appointments.length === 0 && !error && (
        <Box sx={{ textAlign:'center', py:10, border:'2px dashed', borderColor:'divider', borderRadius:3 }}>
          <CalendarToday sx={{ fontSize:56, color:'text.disabled', mb:2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>No appointments found</Typography>
          <Typography variant="body2" color="text.disabled" mb={3}>You haven't booked any appointments yet.</Typography>
          <Button variant="contained" onClick={() => navigate('/LifeBridgeHospital/book-appointment')}
            sx={{ background:'linear-gradient(135deg, #0a3a2e, #0f5c45)', textTransform:'none', fontWeight:700, borderRadius:'10px' }}>
            Book Your First Appointment
          </Button>
        </Box>
      )}

      <Grid container spacing={2}>
        {appointments.map((appt, index) => {
          const statusKey  = (appt.status || 'PENDING').toUpperCase();
          const statusInfo = statusColors[statusKey] || statusColors.PENDING;
          const doctorName = appt.doctorName || (appt.doctor ? `Dr. ${appt.doctor.firstName ?? ''} ${appt.doctor.lastName ?? ''}`.trim() : `Doctor #${appt.doctorId ?? ''}`);
          const specialization = appt.specialization || appt.doctor?.specialization || '';
          const date = appt.appointmentDate || appt.date || '';
          const timeSlot = appt.timeSlot || appt.time || '';
          const reason = appt.reason || appt.notes || '';

          return (
            <Grid item xs={12} key={appt.id || index}>
              <Card elevation={2} sx={{ borderRadius:3, border:'1px solid', borderColor:'divider', '&:hover':{ boxShadow:6 } }}>
                <CardContent sx={{ p:3 }}>
                  <Box sx={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', mb:2 }}>
                    <Box sx={{ display:'flex', alignItems:'center', gap:1.5 }}>
                      <Avatar sx={{ bgcolor:'#0a3a2e' }}><MedicalServices fontSize="small" /></Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={600}>{doctorName}</Typography>
                        {specialization && <Typography variant="caption" color="text.secondary">{specialization}</Typography>}
                      </Box>
                    </Box>
                    <Chip label={statusInfo.label} color={statusInfo.color} size="small" sx={{ fontWeight:600 }} />
                  </Box>
                  <Divider sx={{ mb:2 }} />
                  <Grid container spacing={1.5}>
                    <Grid item xs={12} sm={4}>
                      <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
                        <CalendarToday fontSize="small" color="action" />
                        <Box><Typography variant="caption" color="text.secondary">Date</Typography><Typography variant="body2" fontWeight={500}>{formatDate(date)}</Typography></Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
                        <AccessTime fontSize="small" color="action" />
                        <Box><Typography variant="caption" color="text.secondary">Time Slot</Typography><Typography variant="body2" fontWeight={500}>{timeSlot || 'N/A'}</Typography></Box>
                      </Box>
                    </Grid>
                    {appt.id && (
                      <Grid item xs={12} sm={4}>
                        <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
                          <Person fontSize="small" color="action" />
                          <Box><Typography variant="caption" color="text.secondary">Appointment ID</Typography><Typography variant="body2" fontWeight={500}>#{appt.id}</Typography></Box>
                        </Box>
                      </Grid>
                    )}
                    {reason && (
                      <Grid item xs={12}>
                        <Box sx={{ display:'flex', alignItems:'flex-start', gap:1 }}>
                          <Notes fontSize="small" color="action" sx={{ mt:0.3 }} />
                          <Box><Typography variant="caption" color="text.secondary">Reason</Typography><Typography variant="body2">{reason}</Typography></Box>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default ViewAppointments;