import React from "react";
import { Link } from "react-router-dom";
import { Box, Button, Typography, Container, Avatar, AvatarGroup, Chip } from "@mui/material";
import { motion } from "framer-motion";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StarIcon from "@mui/icons-material/Star";

function HeroSection() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a3a2e 0%, #0d4d3a 40%, #0f5c45 70%, #1a7a5e 100%)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {/* Background decorative circles */}
      <Box sx={{
        position: 'absolute', top: '-10%', right: '-5%',
        width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(46,204,113,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <Box sx={{
        position: 'absolute', bottom: '-15%', left: '-10%',
        width: '600px', height: '600px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(46,204,113,0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <Container maxWidth="lg" sx={{ pt: { xs: 12, md: 10 }, pb: 6, position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 4, md: 8 }, flexDirection: { xs: 'column', md: 'row' } }}>

          {/* LEFT — Text Content */}
          <Box sx={{ flex: 1, maxWidth: { md: '50%' } }}>

            {/* Reviews badge */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <AvatarGroup max={4} sx={{
                  '& .MuiAvatar-root': { width: 28, height: 28, fontSize: '0.7rem', border: '2px solid #0d4d3a' }
                }}>
                  {['#e74c3c','#3498db','#9b59b6','#f39c12'].map((color, i) => (
                    <Avatar key={i} sx={{ bgcolor: color }} />
                  ))}
                </AvatarGroup>
                <Chip
                  icon={<StarIcon sx={{ fontSize: '0.8rem !important', color: '#f1c40f !important' }} />}
                  label="4000+ 5★ reviews"
                  size="small"
                  sx={{
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    color: '#fff',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    border: '1px solid rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(4px)',
                  }}
                />
              </Box>
            </motion.div>

            {/* Headline */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
              <Typography
                variant="h1"
                sx={{
                  fontFamily: '"Playfair Display", serif',
                  fontWeight: 800,
                  fontSize: { xs: '2.8rem', md: '3.8rem', lg: '4.2rem' },
                  color: '#fff',
                  lineHeight: 1.1,
                  mb: 1,
                  letterSpacing: '-0.02em',
                }}
              >
                Simple &<br />Secure Hospital
              </Typography>
              <Typography
                variant="h1"
                sx={{
                  fontFamily: '"Playfair Display", serif',
                  fontStyle: 'italic',
                  fontWeight: 700,
                  fontSize: { xs: '2.8rem', md: '3.8rem', lg: '4.2rem' },
                  color: 'rgba(255,255,255,0.75)',
                  lineHeight: 1.1,
                  mb: 3,
                  letterSpacing: '-0.02em',
                }}
              >
                Management
              </Typography>
            </motion.div>

            {/* Description */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
              <Typography
                sx={{
                  color: 'rgba(255,255,255,0.65)',
                  fontSize: '1rem',
                  lineHeight: 1.7,
                  mb: 4,
                  maxWidth: '420px',
                  fontFamily: '"DM Sans", sans-serif',
                }}
              >
                HealthCare's platform automates intake &amp; check-in processes so you can put the focus back on delivering quality care.
              </Typography>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <Button
                  component={Link}
                  to="/register"
                  variant="contained"
                  size="large"
                  sx={{
                    background: 'linear-gradient(135deg, #2ecc71, #27ae60)',
                    color: '#fff',
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '1rem',
                    px: 4,
                    py: 1.5,
                    borderRadius: '50px',
                    boxShadow: '0 6px 25px rgba(46,204,113,0.4)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #27ae60, #1e8449)',
                      boxShadow: '0 8px 30px rgba(46,204,113,0.55)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.25s',
                  }}
                >
                  Get Started
                </Button>
                <Button
                  size="large"
                  startIcon={
                    <Box sx={{
                      width: 32, height: 32, borderRadius: '50%',
                      backgroundColor: 'rgba(255,255,255,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '1px solid rgba(255,255,255,0.3)',
                    }}>
                      <PlayArrowIcon sx={{ fontSize: '1rem', color: '#fff', ml: '2px' }} />
                    </Box>
                  }
                  sx={{
                    color: 'rgba(255,255,255,0.85)',
                    textTransform: 'none',
                    fontWeight: 500,
                    fontSize: '0.95rem',
                    gap: 1,
                    '&:hover': { color: '#fff', backgroundColor: 'transparent' },
                  }}
                >
                  Play Demo
                </Button>
              </Box>
            </motion.div>
          </Box>

          {/* RIGHT — Hero Image */}
          <motion.div
            style={{ flex: 1, display: 'flex', justifyContent: 'center', position: 'relative' }}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Box
              sx={{
                position: 'relative',
                width: { xs: '100%', md: '90%' },
                maxWidth: '500px',
              }}
            >
              {/* Glowing backdrop */}
              <Box sx={{
                position: 'absolute', inset: '-20px',
                borderRadius: '30px',
                background: 'radial-gradient(ellipse at center, rgba(46,204,113,0.15) 0%, transparent 70%)',
                filter: 'blur(20px)',
              }} />

              <Box
                component="img"
                src={`${process.env.PUBLIC_URL}/assets/images/Hero.png`}
                alt="Medical professionals"
                sx={{
                  width: '100%',
                  borderRadius: '24px',
                  display: 'block',
                  position: 'relative',
                  zIndex: 1,
                  boxShadow: '0 30px 80px rgba(0,0,0,0.4)',
                  objectFit: 'cover',
                  maxHeight: { xs: '350px', md: '520px' },
                }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />

              {/* Floating stat card */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                style={{ position: 'absolute', bottom: '10%', left: '-8%', zIndex: 2 }}
              >
                <Box sx={{
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  borderRadius: '16px',
                  px: 2.5, py: 1.5,
                  boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                  backdropFilter: 'blur(10px)',
                }}>
                  <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: '#0a3a2e', lineHeight: 1 }}>
                    98%
                  </Typography>
                  <Typography sx={{ fontSize: '0.7rem', color: '#666', fontWeight: 500 }}>
                    Patient Satisfaction
                  </Typography>
                </Box>
              </motion.div>

              {/* Floating doctors card */}
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                style={{ position: 'absolute', top: '12%', right: '-8%', zIndex: 2 }}
              >
                <Box sx={{
                  backgroundColor: 'rgba(10, 58, 46, 0.92)',
                  borderRadius: '16px',
                  px: 2.5, py: 1.5,
                  boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                  border: '1px solid rgba(46,204,113,0.3)',
                }}>
                  <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: '#2ecc71', lineHeight: 1 }}>
                    500+
                  </Typography>
                  <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
                    Specialists
                  </Typography>
                </Box>
              </motion.div>
            </Box>
          </motion.div>

        </Box>
      </Container>
    </Box>
  );
}

export default HeroSection;