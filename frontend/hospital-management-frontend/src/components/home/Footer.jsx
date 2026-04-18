import React from 'react';
import { Box, Container, Grid, Typography, IconButton, Divider, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import InstagramIcon from '@mui/icons-material/Instagram';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';

const footerLinks = {
  Platform: ['Patient Portal', 'Doctor Dashboard', 'Admin Panel', 'Appointments', 'Prescriptions'],
  Company: ['About Us', 'Careers', 'Press', 'Contact Sales', 'Partners'],
  Resources: ['Documentation', 'Blog', 'Help Center', 'Privacy Policy', 'Terms of Service'],
};

function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#071f17',
        color: '#fff',
        pt: { xs: 8, md: 10 },
        pb: 4,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top decorative line */}
      <Box sx={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: '2px',
        background: 'linear-gradient(90deg, transparent, #2ecc71, transparent)',
      }} />

      {/* Background glow */}
      <Box sx={{
        position: 'absolute', bottom: '-20%', right: '-10%',
        width: '400px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(46,204,113,0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <Container maxWidth="lg">
        <Grid container spacing={6}>

          {/* Brand column */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <Box
                sx={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2ecc71, #27ae60)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 15px rgba(46,204,113,0.3)',
                }}
              >
                <LocalHospitalIcon sx={{ color: '#fff', fontSize: '1.2rem' }} />
              </Box>
              <Box>
                <Typography sx={{
                  fontFamily: '"Playfair Display", serif',
                  fontWeight: 700, fontSize: '1.1rem', color: '#fff', lineHeight: 1.1,
                }}>
                  LifeBridge
                </Typography>
                <Typography sx={{ fontSize: '0.6rem', color: '#2ecc71', letterSpacing: '0.15em', fontWeight: 600 }}>
                  HOSPITAL
                </Typography>
              </Box>
            </Box>

            <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', lineHeight: 1.8, mb: 3, maxWidth: '280px' }}>
              Empowering healthcare professionals with smart, secure, and simple patient management tools.
            </Typography>

            {/* Social icons */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              {[FacebookIcon, TwitterIcon, LinkedInIcon, InstagramIcon].map((Icon, i) => (
                <IconButton
                  key={i}
                  size="small"
                  sx={{
                    color: 'rgba(255,255,255,0.4)',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    '&:hover': {
                      color: '#2ecc71',
                      backgroundColor: 'rgba(46,204,113,0.1)',
                      borderColor: 'rgba(46,204,113,0.3)',
                    },
                    transition: 'all 0.2s',
                  }}
                >
                  <Icon sx={{ fontSize: '1rem' }} />
                </IconButton>
              ))}
            </Box>
          </Grid>

          {/* Links columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <Grid item xs={6} sm={4} md={8/3} key={category}>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: '#2ecc71',
                  mb: 2.5,
                }}
              >
                {category}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                {links.map((link) => (
                  <Typography
                    key={link}
                    component="a"
                    href="#"
                    sx={{
                      color: 'rgba(255,255,255,0.5)',
                      fontSize: '0.875rem',
                      textDecoration: 'none',
                      transition: 'color 0.2s',
                      '&:hover': { color: '#fff' },
                      cursor: 'pointer',
                    }}
                  >
                    {link}
                  </Typography>
                ))}
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* CTA Banner */}
        <Box
          sx={{
            mt: 8, mb: 4,
            p: { xs: 3, md: 4 },
            borderRadius: '20px',
            background: 'linear-gradient(135deg, rgba(46,204,113,0.15), rgba(10,58,46,0.6))',
            border: '1px solid rgba(46,204,113,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 3,
          }}
        >
          <Box>
            <Typography sx={{ fontFamily: '"Playfair Display", serif', fontWeight: 700, fontSize: '1.3rem', color: '#fff', mb: 0.5 }}>
              Ready to transform your hospital?
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' }}>
              Join thousands of healthcare providers using LifeBridge.
            </Typography>
          </Box>
          <Button
            component={Link}
            to="/register"
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #2ecc71, #27ae60)',
              color: '#fff',
              textTransform: 'none',
              fontWeight: 700,
              px: 4, py: 1.5,
              borderRadius: '50px',
              boxShadow: '0 4px 20px rgba(46,204,113,0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #27ae60, #1e8449)',
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.2s',
            }}
          >
            Get Started Free
          </Button>
        </Box>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.07)', mb: 3 }} />

        {/* Bottom bar */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>
            © 2024 LifeBridge Hospital. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', gap: 3 }}>
            {['Privacy', 'Terms', 'Cookies'].map((item) => (
              <Typography
                key={item}
                component="a"
                href="#"
                sx={{
                  color: 'rgba(255,255,255,0.3)',
                  fontSize: '0.8rem',
                  textDecoration: 'none',
                  '&:hover': { color: 'rgba(255,255,255,0.7)' },
                  transition: 'color 0.2s',
                }}
              >
                {item}
              </Typography>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer;