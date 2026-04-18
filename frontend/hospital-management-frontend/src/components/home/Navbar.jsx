import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Drawer, List, ListItem } from '@mui/material';
import { Link } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    
  ];

  return (
    <>
      <AppBar
        position="fixed"
        elevation={scrolled ? 4 : 0}
        sx={{
          backgroundColor: scrolled ? 'rgba(10, 58, 46, 0.97)' : 'transparent',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          transition: 'all 0.3s ease',
          py: 0.5,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 5 } }}>

          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 38, height: 38,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #2ecc71, #27ae60)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 900, color: '#fff', fontSize: '14px',
                letterSpacing: '-0.5px',
                boxShadow: '0 2px 12px rgba(46,204,113,0.4)',
              }}
            >
              HC
            </Box>
            <Box>
              <Typography
                sx={{
                  fontFamily: '"Playfair Display", serif',
                  fontWeight: 700,
                  fontSize: '1rem',
                  color: '#fff',
                  lineHeight: 1.1,
                  letterSpacing: '0.02em',
                }}
              >
                HEALTH
              </Typography>
              <Typography sx={{ fontSize: '0.6rem', color: '#2ecc71', letterSpacing: '0.15em', fontWeight: 600 }}>
                CARE
              </Typography>
            </Box>
          </Box>
          

          {/* CTA Buttons */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1.5 }}>
            <Button
              component={Link}
              to="/login"
              sx={{
                color: 'rgba(255,255,255,0.85)',
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '0.875rem',
                '&:hover': { color: '#fff' },
              }}
            >
              Login
            </Button>
            <Button
              component={Link}
              to="/register"
              variant="contained"
              sx={{
                background: 'linear-gradient(135deg, #2ecc71, #27ae60)',
                color: '#fff',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.875rem',
                px: 3,
                py: 1,
                borderRadius: '50px',
                boxShadow: '0 4px 15px rgba(46,204,113,0.35)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #27ae60, #1e8449)',
                  boxShadow: '0 6px 20px rgba(46,204,113,0.5)',
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.2s',
              }}
            >
              Get Started
            </Button>
          </Box>

          {/* Mobile Menu Icon */}
          <IconButton
            sx={{ display: { xs: 'flex', md: 'none' }, color: '#fff' }}
            onClick={() => setDrawerOpen(true)}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 260, backgroundColor: '#0a3a2e', height: '100%', p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
            <IconButton onClick={() => setDrawerOpen(false)} sx={{ color: '#fff' }}>
              <CloseIcon />
            </IconButton>
          </Box>
          <List>
            {[...navLinks, { label: 'Login', to: '/login' }, { label: 'Register', to: '/register' }].map((link) => (
              <ListItem key={link.label} sx={{ py: 0.5 }}>
                <Button
                  component={Link}
                  to={link.to}
                  onClick={() => setDrawerOpen(false)}
                  fullWidth
                  sx={{
                    color: '#fff', textTransform: 'none', fontWeight: 500,
                    justifyContent: 'flex-start', fontSize: '1rem',
                    '&:hover': { color: '#2ecc71' },
                  }}
                >
                  {link.label}
                </Button>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;