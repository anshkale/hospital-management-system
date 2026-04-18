import React, { useState, useEffect } from 'react';
import axios from 'axios'; 
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Grid,
  Avatar,
  Divider,
  Button,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  CalendarToday,
  AccessTime,
  Person,
  MedicalServices,
  Notes,
  Delete,
  Refresh,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Status color mapping
const statusColors = {
  PENDING:   { color: 'warning',  label: 'Pending'   },
  CONFIRMED: { color: 'success',  label: 'Confirmed' },
  CANCELLED: { color: 'error',    label: 'Cancelled' },
  COMPLETED: { color: 'info',     label: 'Completed' },
};

// ── helpers ──────────────────────────────────────────────────────────────────

const getPatientId = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.id || user.patientId || null;
  } catch {
    return null;
  }
};

const getToken = () =>
  localStorage.getItem('token') || localStorage.getItem('authToken') || null;

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

// ── component ─────────────────────────────────────────────────────────────────

const ViewAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [source, setSource]             = useState(''); // 'api' | 'local'
  const navigate = useNavigate();

  // ── fetch ──────────────────────────────────────────────────────────────────

  const fetchAppointments = async () => {
    setLoading(true);
    setError('');

    // 1️⃣ Try real API first
    const patientId = getPatientId();
    const token     = getToken();

    if (patientId && token) {
      try {
        const res = await fetch(
          `http://localhost:8080/api/appointments/patient/${patientId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.ok) {
          const data = await res.json();
          setAppointments(Array.isArray(data) ? data : []);
          setSource('api');
          setLoading(false);
          return;
        }
      } catch {
        // fall through to localStorage
      }
    }

    // 2️⃣ Fall back to localStorage (mock / offline mode)
    try {
      const stored = JSON.parse(localStorage.getItem('appointments') || '[]');
      setAppointments(stored);
      setSource('local');
    } catch {
      setError('Could not load appointments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── delete (local only) ────────────────────────────────────────────────────

  const handleDelete = (index) => {
    const updated = appointments.filter((_, i) => i !== index);
    setAppointments(updated);
    if (source === 'local') {
      localStorage.setItem('appointments', JSON.stringify(updated));
    }
  };

  // ── render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 900, mx: 'auto' }}>

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          My Appointments
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchAppointments} color="primary">
              <Refresh />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            size="small"
            onClick={() => navigate('/LifeBridgeHospital/book-appointment')}
          >
            + Book New
          </Button>
        </Box>
      </Box>

      {/* Source badge */}
      {source === 'local' && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Showing locally saved appointments (offline / mock mode). Connect your backend for live data.
        </Alert>
      )}

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Empty state */}
      {appointments.length === 0 && !error && (
        <Box
          sx={{
            textAlign: 'center', py: 10,
            border: '2px dashed', borderColor: 'divider', borderRadius: 3,
          }}
        >
          <CalendarToday sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No appointments found
          </Typography>
          <Typography variant="body2" color="text.disabled" mb={3}>
            You haven't booked any appointments yet.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/LifeBridgeHospital/book-appointment')}
          >
            Book Your First Appointment
          </Button>
        </Box>
      )}

      {/* Appointment cards */}
      <Grid container spacing={2}>
        {appointments.map((appt, index) => {
          const statusKey = (appt.status || 'PENDING').toUpperCase();
          const statusInfo = statusColors[statusKey] || statusColors.PENDING;

          // Support both API shape and mock/localStorage shape
          const doctorName = appt.doctorName
            || (appt.doctor
              ? `Dr. ${appt.doctor.firstName ?? ''} ${appt.doctor.lastName ?? ''}`.trim()
              : appt.doctorId
                ? `Doctor #${appt.doctorId}`
                : 'N/A');

          const specialization =
            appt.specialization || appt.doctor?.specialization || '';

          const date     = appt.appointmentDate || appt.date || '';
          const timeSlot = appt.timeSlot || appt.time || '';
          const reason   = appt.reason || appt.notes || '';

          return (
            <Grid item xs={12} key={appt.id || index}>
              <Card
                elevation={2}
                sx={{
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: 'box-shadow 0.2s',
                  '&:hover': { boxShadow: 6 },
                }}
              >
                <CardContent sx={{ p: 3 }}>

                  {/* Top row: doctor + status + delete */}
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
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

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={statusInfo.label}
                        color={statusInfo.color}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                      {source === 'local' && (
                        <Tooltip title="Remove">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(index)}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  {/* Detail rows */}
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
    </Box>
  );
};

export default ViewAppointments;