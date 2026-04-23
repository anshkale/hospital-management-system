import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Chip, Grid, Avatar,
  Divider, Button, CircularProgress, Alert, IconButton,
  Tooltip, Dialog, DialogTitle, DialogContent,
  DialogContentText, DialogActions
} from '@mui/material';
import {
  CalendarToday, AccessTime, Person, MedicalServices,
  Notes, Refresh, CancelOutlined
} from '@mui/icons-material';
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
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
    });
  } catch { return dateStr; }
};

const getPatientId = () => {
  try {
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    return user.patientId || user.id || null;
  } catch { return null; }
};

const ViewAppointments = () => {
  const [appointments, setAppointments]     = useState([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState('');

  // ── Cancel dialog state ────────────────────────────────────────────────
  const [cancelDialog, setCancelDialog]     = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);
  const [cancelling, setCancelling]         = useState(false);
  const [cancelSuccess, setCancelSuccess]   = useState('');

  const navigate = useNavigate();

  // ── Fetch appointments ─────────────────────────────────────────────────
  const fetchAppointments = async () => {
    setLoading(true);
    setError('');
    setCancelSuccess('');
    const patientId = getPatientId();
    if (!patientId) {
      setError('Could not find your patient ID. Please log in again.');
      setLoading(false);
      return;
    }
    try {
      const res = await axiosInstance.get(`/api/appointments/patient/${patientId}`);
      setAppointments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401)      setError('Session expired. Please log in again.');
      else if (status === 404) setError('Endpoint not found. Check backend URL. (404)');
      else if (status === 500) setError('Server error. Check Spring Boot console. (500)');
      else                     setError(`Failed to load appointments. ${err?.message || ''}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, []);

  // ── Open cancel confirmation dialog ───────────────────────────────────
  const openCancelDialog = (appt) => {
    setAppointmentToCancel(appt);
    setCancelDialog(true);
  };

  const closeCancelDialog = () => {
    setCancelDialog(false);
    setAppointmentToCancel(null);
  };

  // ── Confirm cancel — calls DELETE /api/appointments/{id} ──────────────
  const confirmCancel = async () => {
    if (!appointmentToCancel) return;
    setCancelling(true);
    try {
      await axiosInstance.delete(`/api/appointments/${appointmentToCancel.id}`);

      // Remove from UI immediately
      setAppointments(prev =>
        prev.filter(a => a.id !== appointmentToCancel.id)
      );

      setCancelSuccess(
        `Appointment #${appointmentToCancel.id} with ${
          appointmentToCancel.doctor
            ? `Dr. ${appointmentToCancel.doctor.firstName} ${appointmentToCancel.doctor.lastName}`
            : 'the doctor'
        } has been cancelled.`
      );
      closeCancelDialog();
    } catch (err) {
      setError(
        err?.response?.status === 404
          ? 'Appointment not found. It may have already been cancelled.'
          : `Failed to cancel appointment: ${err?.response?.data?.message || err.message}`
      );
      closeCancelDialog();
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
      <CircularProgress sx={{ color: '#0a3a2e' }} />
    </Box>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 900, mx: 'auto' }}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" fontWeight={700} sx={{ color: '#0a3a2e' }}>
          My Appointments
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchAppointments} sx={{ color: '#0a3a2e' }}>
              <Refresh />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            size="small"
            onClick={() => navigate('/patient/book-appointment')}
            sx={{
              background: 'linear-gradient(135deg, #0a3a2e, #0f5c45)',
              textTransform: 'none', fontWeight: 700, borderRadius: '10px',
              '&:hover': { background: 'linear-gradient(135deg, #0d4d3a, #1a7a5e)' }
            }}
          >
            + Book New
          </Button>
        </Box>
      </Box>

      {/* ── Alerts ──────────────────────────────────────────────────────── */}
      {error         && <Alert severity="error"   sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
      {cancelSuccess && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{cancelSuccess}</Alert>}

      {/* ── Empty state ─────────────────────────────────────────────────── */}
      {appointments.filter(a => (a.status || '').toUpperCase() !== 'CANCELLED').length === 0 && !error && (
        <Box sx={{
          textAlign: 'center', py: 10,
          border: '2px dashed', borderColor: 'divider', borderRadius: 3
        }}>
          <CalendarToday sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No appointments found
          </Typography>
          <Typography variant="body2" color="text.disabled" mb={3}>
            You haven't booked any appointments yet.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/patient/book-appointment')}
            sx={{
              background: 'linear-gradient(135deg, #0a3a2e, #0f5c45)',
              textTransform: 'none', fontWeight: 700, borderRadius: '10px'
            }}
          >
            Book Your First Appointment
          </Button>
        </Box>
      )}

      {/* ── Appointment cards ────────────────────────────────────────────── */}
      <Grid container spacing={2}>
        {appointments
  .filter(appt => (appt.status || '').toUpperCase() !== 'CANCELLED')
  .map((appt, index) =>  {
          const statusKey  = (appt.status || 'PENDING').toUpperCase();
          const statusInfo = statusColors[statusKey] || statusColors.PENDING;
          const doctorName = appt.doctor
            ? `Dr. ${appt.doctor.firstName ?? ''} ${appt.doctor.lastName ?? ''}`.trim()
            : 'Unknown Doctor';
          const specialization = appt.doctor?.specialization || '';
          const date     = appt.appointmentDate || '';
          const timeSlot = appt.timeSlot || '';
          const reason   = appt.reason || '';

          // Only PENDING and CONFIRMED appointments can be cancelled
          const canCancel = ['PENDING', 'CONFIRMED'].includes(statusKey);

          return (
            <Grid item xs={12} key={appt.id || index}>
              <Card elevation={2} sx={{
                borderRadius: 3,
                border: '1px solid',
                borderColor: statusKey === 'CANCELLED' ? 'error.light' : 'divider',
                opacity: statusKey === 'CANCELLED' ? 0.75 : 1,
                '&:hover': { boxShadow: 6 },
                transition: 'all 0.2s ease',
              }}>
                <CardContent sx={{ p: 3 }}>

                  {/* Doctor + status chip + cancel button */}
                  <Box sx={{
                    display: 'flex', alignItems: 'flex-start',
                    justifyContent: 'space-between', mb: 2
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{
                        bgcolor: statusKey === 'CANCELLED' ? '#999' : '#0a3a2e'
                      }}>
                        <MedicalServices fontSize="small" />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {doctorName}
                        </Typography>
                        {specialization && (
                          <Typography variant="caption" color="text.secondary">
                            {specialization}
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    {/* Right side: status chip + cancel button */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={statusInfo.label}
                        color={statusInfo.color}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                      {canCancel && (
                        <Tooltip title="Cancel appointment">
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<CancelOutlined fontSize="small" />}
                            onClick={() => openCancelDialog(appt)}
                            sx={{
                              textTransform: 'none',
                              fontWeight: 600,
                              borderRadius: '8px',
                              fontSize: '0.75rem',
                              px: 1.5,
                              py: 0.5,
                              borderColor: 'error.light',
                              '&:hover': {
                                backgroundColor: 'error.light',
                                color: '#fff',
                                borderColor: 'error.main',
                              }
                            }}
                          >
                            Cancel
                          </Button>
                        </Tooltip>
                      )}
                    </Box>
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  {/* Details */}
                  <Grid container spacing={1.5}>
                    <Grid item xs={12} sm={4}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarToday fontSize="small" color="action" />
                        <Box>
                          <Typography variant="caption" color="text.secondary">Date</Typography>
                          <Typography variant="body2" fontWeight={500}>{formatDate(date)}</Typography>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccessTime fontSize="small" color="action" />
                        <Box>
                          <Typography variant="caption" color="text.secondary">Time Slot</Typography>
                          <Typography variant="body2" fontWeight={500}>{timeSlot || 'N/A'}</Typography>
                        </Box>
                      </Box>
                    </Grid>

                    {appt.id && (
                      <Grid item xs={12} sm={4}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Person fontSize="small" color="action" />
                          <Box>
                            <Typography variant="caption" color="text.secondary">Appointment ID</Typography>
                            <Typography variant="body2" fontWeight={500}>#{appt.id}</Typography>
                          </Box>
                        </Box>
                      </Grid>
                    )}

                    {reason && (
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                          <Notes fontSize="small" color="action" sx={{ mt: 0.3 }} />
                          <Box>
                            <Typography variant="caption" color="text.secondary">Reason</Typography>
                            <Typography variant="body2">{reason}</Typography>
                          </Box>
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

      {/* ── Cancel confirmation dialog ────────────────────────────────────── */}
      <Dialog
        open={cancelDialog}
        onClose={closeCancelDialog}
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#0a3a2e' }}>
          Cancel Appointment?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel appointment{' '}
            <strong>#{appointmentToCancel?.id}</strong> with{' '}
            <strong>
              {appointmentToCancel?.doctor
                ? `Dr. ${appointmentToCancel.doctor.firstName} ${appointmentToCancel.doctor.lastName}`
                : 'the doctor'}
            </strong>{' '}
            on{' '}
            <strong>{formatDate(appointmentToCancel?.appointmentDate)}</strong>?
            <br /><br />
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ pb: 2, px: 3, gap: 1 }}>
          <Button
            onClick={closeCancelDialog}
            disabled={cancelling}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: '8px',
              color: '#0a3a2e',
              border: '1px solid rgba(10,58,46,0.3)',
              px: 3,
            }}
          >
            Keep It
          </Button>
          <Button
            onClick={confirmCancel}
            disabled={cancelling}
            variant="contained"
            color="error"
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: '8px',
              px: 3,
            }}
          >
            {cancelling
              ? <CircularProgress size={20} color="inherit" />
              : 'Yes, Cancel'}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default ViewAppointments;