import React from 'react';
import { Container, Grid, Box, Typography } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import PaymentsIcon from '@mui/icons-material/Payment';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import HistoryIcon from '@mui/icons-material/History';
import SecurityIcon from '@mui/icons-material/Security';
import { motion } from 'framer-motion';

const features = [
  {
    icon: <PersonIcon sx={{ fontSize: '2rem' }} />,
    title: 'Patient Management',
    description: 'Easily manage patient records, history, and appointments all in one place.',
    color: '#2ecc71',
  },
  {
    icon: <MedicalServicesIcon sx={{ fontSize: '2rem' }} />,
    title: 'Doctor Management',
    description: 'Assign doctors to patients and manage their schedules effortlessly.',
    color: '#3498db',
  },
  {
    icon: <CalendarMonthIcon sx={{ fontSize: '2rem' }} />,
    title: 'Appointment Booking',
    description: 'Book and track appointments with real-time availability and reminders.',
    color: '#9b59b6',
  },
  {
    icon: <PaymentsIcon sx={{ fontSize: '2rem' }} />,
    title: 'Billing & Payments',
    description: 'Track bills, payments, and financial reports seamlessly.',
    color: '#e67e22',
  },
  {
    icon: <HistoryIcon sx={{ fontSize: '2rem' }} />,
    title: 'Medical History',
    description: 'Access complete patient history, diagnoses, and prescriptions instantly.',
    color: '#e74c3c',
  },
  {
    icon: <SecurityIcon sx={{ fontSize: '2rem' }} />,
    title: 'Secure & Compliant',
    description: 'Enterprise-grade security with role-based access control and data encryption.',
    color: '#1abc9c',
  },
];

function FeaturesSection() {
  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        backgroundColor: '#f8fffe',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative top border */}
      <Box sx={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: '4px',
        background: 'linear-gradient(90deg, #0a3a2e, #2ecc71, #0a3a2e)',
      }} />

      <Container maxWidth="lg">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
            <Typography
              sx={{
                display: 'inline-block',
                backgroundColor: 'rgba(46,204,113,0.1)',
                color: '#0a3a2e',
                fontWeight: 700,
                fontSize: '0.75rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                px: 2.5, py: 0.75,
                borderRadius: '50px',
                border: '1px solid rgba(46,204,113,0.3)',
                mb: 2,
              }}
            >
              Everything You Need
            </Typography>
            <Typography
              variant="h3"
              sx={{
                fontFamily: '"Playfair Display", serif',
                fontWeight: 800,
                color: '#0a3a2e',
                fontSize: { xs: '2rem', md: '2.8rem' },
                mb: 2,
                letterSpacing: '-0.02em',
              }}
            >
              Key Features
            </Typography>
            <Typography
              sx={{
                color: '#666',
                fontSize: '1.05rem',
                maxWidth: '520px',
                mx: 'auto',
                lineHeight: 1.7,
              }}
            >
              A complete suite of tools designed to streamline every aspect of hospital management.
            </Typography>
          </Box>
        </motion.div>

        {/* Feature cards */}
        <Grid container spacing={3}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                whileHover={{ y: -6 }}
              >
                <Box
                  sx={{
                    p: 4,
                    height: '100%',
                    borderRadius: '20px',
                    backgroundColor: '#fff',
                    border: '1px solid rgba(0,0,0,0.07)',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                    transition: 'all 0.3s ease',
                    cursor: 'default',
                    '&:hover': {
                      boxShadow: `0 12px 40px rgba(0,0,0,0.12)`,
                      borderColor: feature.color + '40',
                    },
                  }}
                >
                  {/* Icon */}
                  <Box
                    sx={{
                      width: 56, height: 56,
                      borderRadius: '16px',
                      backgroundColor: feature.color + '15',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: feature.color,
                      mb: 3,
                    }}
                  >
                    {feature.icon}
                  </Box>

                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: '"Playfair Display", serif',
                      fontWeight: 700,
                      color: '#0a3a2e',
                      mb: 1.5,
                      fontSize: '1.1rem',
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    sx={{
                      color: '#777',
                      fontSize: '0.9rem',
                      lineHeight: 1.7,
                    }}
                  >
                    {feature.description}
                  </Typography>
                </Box>
              </motion.div>
            </Grid>
          ))}
        </Grid>

      </Container>
    </Box>
  );
}

export default FeaturesSection;