import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosConfig';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  CircularProgress
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useNavigate } from 'react-router-dom';

const BookAppointment = () => {
  const [doctors, setDoctors] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    doctorId: '',
    appointmentDate: null,
    timeSlot: '',
    reason: '',
  });

  // ── Get logged-in patient ID from session ──────────────────────────────────
  const getPatientId = () => {
    try {
      const user = JSON.parse(sessionStorage.getItem('user') || '{}');
      return user.id || user.patientId || null;
    } catch {
      return null;
    }
  };

  // ── Fetch real doctors from DB ─────────────────────────────────────────────
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axiosInstance.get('/api/doctors/all');
        setDoctors(res.data);
      } catch (err) {
        // Fallback to mock if API not ready
        setDoctors([
          { id: 1, firstName: 'John', lastName: 'Doe', specialization: 'Cardiologist' },
          { id: 2, firstName: 'Jane', lastName: 'Smith', specialization: 'Dermatologist' },
          { id: 3, firstName: 'Alice', lastName: 'Brown', specialization: 'Orthopedic' },
        ]);
      }
    };
    fetchDoctors();
  }, []);

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour < 17; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    setTimeSlots(slots);
  };

  const handleDateChange = (date) => {
    setFormData({ ...formData, appointmentDate: date });
    generateTimeSlots();
  };

  // ── Submit: save to real database ─────────────────────────────────────────
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

    try {
      // Format date as YYYY-MM-DD
      const dateStr = formData.appointmentDate instanceof Date
        ? formData.appointmentDate.toISOString().split('T')[0]
        : formData.appointmentDate;

      const payload = {
        patientId: patientId,
        doctorId: formData.doctorId,
        appointmentDate: dateStr,
        timeSlot: formData.timeSlot,
        reason: formData.reason,
      };

      const response = await axiosInstance.post('/api/appointments/book', payload);

      if (response.data?.success) {
        setSuccess('Appointment booked successfully!');
        setTimeout(() => {
          navigate('/LifeBridgeHospital/view-appointments');
        }, 1500);
      } else {
        throw new Error(response.data?.message || 'Booking failed');
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto', boxShadow: 3, borderRadius: 2 }}>
      <Typography variant="h5" gutterBottom fontWeight={700}>
        Book an Appointment
      </Typography>

      {error   && <Alert severity="error"   sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>

          {/* Doctor select */}
          <Grid item xs={12}>
            <FormControl fullWidth required>
              <InputLabel>Select Doctor</InputLabel>
              <Select
                value={formData.doctorId}
                label="Select Doctor"
                onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
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

          {/* Date picker */}
          <Grid item xs={12}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Appointment Date"
                value={formData.appointmentDate}
                onChange={handleDateChange}
                minDate={new Date()}
                slotProps={{ textField: { fullWidth: true, required: true } }}
              />
            </LocalizationProvider>
          </Grid>

          {/* Time slot */}
          <Grid item xs={12}>
            <FormControl fullWidth required>
              <InputLabel>Select Time Slot</InputLabel>
              <Select
                value={formData.timeSlot}
                label="Select Time Slot"
                onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                disabled={timeSlots.length === 0}
              >
                {timeSlots.length > 0 ? (
                  timeSlots.map((slot) => (
                    <MenuItem key={slot} value={slot}>{slot}</MenuItem>
                  ))
                ) : (
                  <MenuItem value="" disabled>Select a date first</MenuItem>
                )}
              </Select>
            </FormControl>
          </Grid>

          {/* Reason */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Reason for Visit"
              multiline
              rows={4}
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              required
            />
          </Grid>

          {/* Submit */}
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                py: 1.5,
                background: 'linear-gradient(135deg, #0a3a2e, #0f5c45)',
                '&:hover': { background: 'linear-gradient(135deg, #0d4d3a, #1a7a5e)' },
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '1rem',
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Book Appointment'}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default BookAppointment;