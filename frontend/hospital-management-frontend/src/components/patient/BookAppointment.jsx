import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosConfig';
import {
  Box, Typography, TextField, Button, Grid,
  MenuItem, FormControl, InputLabel, Select,
  Alert, CircularProgress, Collapse
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// ── Predefined reasons ─────────────────────────────────────────────────────
const PREDEFINED_REASONS = [
  'General Checkup',
  'Fever / Cold / Flu',
  'Body Pain / Muscle Ache',
  'Headache / Migraine',
  'Skin Problem / Rash',
  'Stomach Pain / Digestive Issues',
  'Heart / Chest Pain',
  'Diabetes Consultation',
  'Blood Pressure Monitoring',
  'Eye / Vision Problem',
  'Dental Pain',
  'Mental Health / Anxiety',
  'Pregnancy / Gynecology',
  'Child Health / Pediatrics',
  'Follow-up Visit',
  'Others',  // ← triggers text box
];

const BookAppointment = () => {
  const [doctors, setDoctors]               = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(true);
  const [doctorsError, setDoctorsError]     = useState('');
  const [timeSlots, setTimeSlots]           = useState([]);
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState('');
  const [success, setSuccess]               = useState('');
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason]     = useState('');

  const [formData, setFormData] = useState({
    doctorId:        '',
    appointmentDate: null,
    timeSlot:        '',
    reason:          '',
  });

  const getPatientId = () => {
    try {
      const user = JSON.parse(sessionStorage.getItem('user') || '{}');
      return user.patientId || user.id || null;
    } catch { return null; }
  };

  // ── Fetch doctors ──────────────────────────────────────────────────────
  useEffect(() => {
    const fetchDoctors = async () => {
      setDoctorsLoading(true);
      setDoctorsError('');
      try {
        const res = await axiosInstance.get('/api/doctors/all');
        if (Array.isArray(res.data) && res.data.length > 0) {
          setDoctors(res.data);
        } else {
          setDoctorsError('No doctors found in the system.');
        }
      } catch (err) {
        console.error('Doctors fetch failed:', err);
        setDoctorsError(
          err?.response?.status === 403 ? 'Access denied. Check SecurityConfig.' :
          err?.response?.status === 404 ? 'Endpoint not found.' :
          `Failed to load doctors: ${err?.message}`
        );
      } finally {
        setDoctorsLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  // ── Generate time slots ────────────────────────────────────────────────
  useEffect(() => {
    const slots = [];
    for (let hour = 9; hour < 17; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    setTimeSlots(slots);
  }, []);

  // ── Handle reason dropdown change ──────────────────────────────────────
  const handleReasonChange = (e) => {
    const value = e.target.value;
    setSelectedReason(value);
    setCustomReason(''); // reset custom text when switching
    if (value !== 'Others') {
      setFormData({ ...formData, reason: value });
    } else {
      setFormData({ ...formData, reason: '' }); // wait for custom input
    }
  };

  const handleCustomReasonChange = (e) => {
    setCustomReason(e.target.value);
    setFormData({ ...formData, reason: e.target.value });
  };

  // ── Submit ─────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const patientId = getPatientId();
    if (!patientId) {
      setError('Could not find your patient ID. Please log in again.');
      setLoading(false);
      return;
    }

    if (!formData.appointmentDate) {
      setError('Please select an appointment date.');
      setLoading(false);
      return;
    }

    // Validate custom reason if Others selected
    if (selectedReason === 'Others' && !customReason.trim()) {
      setError('Please describe your reason for visit.');
      setLoading(false);
      return;
    }

    try {
      const dateStr = formData.appointmentDate instanceof Date
        ? formData.appointmentDate.toISOString().split('T')[0]
        : formData.appointmentDate;

      const payload = {
        patientId:       patientId,
        doctorId:        formData.doctorId,
        appointmentDate: dateStr,
        timeSlot:        formData.timeSlot,
        reason:          formData.reason,
      };

      const response = await axiosInstance.post('/api/appointments/book', payload);

      if (response.data?.success) {
        setSuccess('Appointment booked successfully!');
      } else {
        throw new Error(response.data?.message || 'Booking failed');
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  // ── Shared select styles ───────────────────────────────────────────────
  const selectSx = {
    borderRadius: '12px',
    backgroundColor: '#f8fffe',
    '& fieldset': { borderColor: 'rgba(10,58,46,0.2)' },
    '&:hover fieldset': { borderColor: 'rgba(10,58,46,0.5)' },
    '&.Mui-focused fieldset': { borderColor: '#0a3a2e', borderWidth: '2px' },
  };

  return (
    <Box sx={{
      p: 3, maxWidth: 600, mx: 'auto',
      boxShadow: '0 8px 32px rgba(10,58,46,0.10)',
      borderRadius: 4, bgcolor: '#fff'
    }}>
      <Typography variant="h5" gutterBottom fontWeight={700} sx={{ color: '#0a3a2e' }}>
        Book an Appointment
      </Typography>

      {error   && <Alert severity="error"   sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{success}</Alert>}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>

          {/* ── Doctor ──────────────────────────────────────────────────── */}
          <Grid item xs={12}>
            {doctorsError && (
              <Alert severity="warning" sx={{ mb: 1 }}>{doctorsError}</Alert>
            )}
            <FormControl fullWidth required>
              <InputLabel>
                {doctorsLoading ? 'Loading doctors...' : 'Select Doctor'}
              </InputLabel>
              <Select
                value={formData.doctorId}
                label={doctorsLoading ? 'Loading doctors...' : 'Select Doctor'}
                onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                disabled={doctorsLoading || doctors.length === 0}
                sx={selectSx}
              >
                {doctors.map((doctor) => (
                  <MenuItem key={doctor.id} value={doctor.id}>
                    Dr. {doctor.firstName} {doctor.lastName}
                    {doctor.specialization ? ` — ${doctor.specialization}` : ''}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* ── Date ────────────────────────────────────────────────────── */}
          <Grid item xs={12}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Appointment Date"
                value={formData.appointmentDate}
                onChange={(date) => setFormData({ ...formData, appointmentDate: date })}
                minDate={new Date()}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    sx: {
                      '& .MuiOutlinedInput-root': selectSx,
                      '& .MuiInputLabel-root.Mui-focused': { color: '#0a3a2e' },
                    }
                  }
                }}
              />
            </LocalizationProvider>
          </Grid>

          {/* ── Time slot ───────────────────────────────────────────────── */}
          <Grid item xs={12}>
            <FormControl fullWidth required>
              <InputLabel>Select Time Slot</InputLabel>
              <Select
                value={formData.timeSlot}
                label="Select Time Slot"
                onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                sx={selectSx}
              >
                {timeSlots.map((slot) => (
                  <MenuItem key={slot} value={slot}>{slot}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* ── Reason dropdown ─────────────────────────────────────────── */}
          <Grid item xs={12}>
            <FormControl fullWidth required>
              <InputLabel>Reason for Visit</InputLabel>
              <Select
                value={selectedReason}
                label="Reason for Visit"
                onChange={handleReasonChange}
                sx={selectSx}
              >
                {PREDEFINED_REASONS.map((reason) => (
                  <MenuItem
                    key={reason}
                    value={reason}
                    sx={reason === 'Others' ? {
                      borderTop: '1px solid rgba(10,58,46,0.15)',
                      mt: 0.5,
                      fontStyle: 'italic',
                      color: '#0a3a2e',
                      fontWeight: 600,
                    } : {}}
                  >
                    {reason}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* ── Custom reason — only shows when "Others" is selected ─────── */}
          <Grid item xs={12}>
            <Collapse in={selectedReason === 'Others'}>
              <TextField
                fullWidth
                label="Please describe your reason"
                multiline
                rows={3}
                value={customReason}
                onChange={handleCustomReasonChange}
                required={selectedReason === 'Others'}
                placeholder="Describe your symptoms or reason for visit..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    ...selectSx,
                    borderRadius: '12px',
                  },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#0a3a2e' },
                }}
              />
            </Collapse>
          </Grid>

          {/* ── Submit ──────────────────────────────────────────────────── */}
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading || doctorsLoading}
              sx={{
                py: 1.5,
                background: 'linear-gradient(135deg, #0a3a2e, #0f5c45)',
                '&:hover': { background: 'linear-gradient(135deg, #0d4d3a, #1a7a5e)' },
                '&:disabled': { opacity: 0.7 },
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '1rem',
                boxShadow: '0 6px 25px rgba(10,58,46,0.25)',
              }}
            >
              {loading
                ? <CircularProgress size={24} color="inherit" />
                : 'Book Appointment'}
            </Button>
          </Grid>

        </Grid>
      </form>
    </Box>
  );
};

export default BookAppointment;