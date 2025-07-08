import React, { useRef, useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  Paper,
  Grid,
  Avatar
} from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import FacebookIcon from '@mui/icons-material/Facebook';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
// Add theme imports
import { ThemeProvider, createTheme, useTheme } from '@mui/material/styles';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';


import { useNavigate } from 'react-router-dom';
import './UserDashboard.css';
import './mint-navbar.css';


import DentalLogo from '../../assets/DentalLogo.png';
import Logo2 from '../../assets/Logo (2).png';
import ToothPng from '../../assets/Tooth.png';


const sections = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About Us' },
  { id: 'services', label: 'Our Dental Services' },
];


const branches = [
  { name: ' Branch Clinic', number: '+0927-372-4929' },
  { name: ' Main Clinic', number: '+0977-641-4655' },
  { name: ' Main Clinic(2)', number: '+0921-355-3335' }


];


const dentalServices = [
  {
    name: 'General Dentistry',
    icon: <svg width="48" height="48" fill="none" stroke="#1eb2a6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M2 12s2-4 10-4 10 4 10 4-2 4-10 4-10-4-10-4z"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>,
    details: 'Dental Cleaning / Oral Prophylaxis, Permanent Tooth Filling, Pit & Fissure Sealants and more.'
  },
  {
    name: 'Consultation',
    icon: <svg width="48" height="48" fill="none" stroke="#1eb2a6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12c0 5.52 4.48 10 10 10s10-4.48 10-10C22 6.48 17.52 2 12 2z"/><path d="M12 8v4l3 3"/></svg>,
    details: "Don't know where to start? Book a consultation with our specialists to know more about your oral health. We also offer diagnostics such as x-rays and 3D scans."
  },
  {
    name: 'Pain Relief',
    icon: <svg width="48" height="48" fill="none" stroke="#1eb2a6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>,
    details: "Can't sleep due to a toothache? Medications don't seem to work? Contact us or come over to our clinic for an emergency treatment."
  },
  {
    name: 'Dental Crown & Veneers',
    icon: <svg width="48" height="48" fill="none" stroke="#1eb2a6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/></svg>,
    details: 'A whole new you! We have solutions to give you a brand new smile with veneers, dental crowns or bridges.'
  },
  {
    name: 'Pediatric Dentistry',
    icon: <svg width="48" height="48" fill="none" stroke="#1eb2a6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="9" cy="10" r="1"/><circle cx="15" cy="10" r="1"/><path d="M8 16s1.5-2 4-2 4 2 4 2"/></svg>,
    details: 'Looking for the best dentist for your child? Book an appointment with our pediatric dentists that will take care of your little one.'
  },
  {
    name: 'Dental Implants',
    icon: <svg width="48" height="48" fill="none" stroke="#1eb2a6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><path d="M12 17v5"/><path d="M9 22h6"/></svg>,
    details: 'Missing a tooth? Restore those gaps with teeth that feel and look like your own.'
  },
];


function LandingPage() {
  const navigate = useNavigate();
  // Redirect if already authenticated
  React.useEffect(() => {
    const token = sessionStorage.getItem('authToken');
    const role = sessionStorage.getItem('role');
    const currentPath = window.location.pathname;
    if (currentPath === '/LandingPage') return; // Don't redirect if already on LandingPage
    if (token && role) {
      if (role === 'patient') {
        navigate('/', { replace: true });
      } else if (role === 'dentist' || role === 'staff') {
        navigate('/ManageAppointment', { replace: true });
      }
    } else {
      navigate('/login', { replace: true });
    }
  }, [navigate]);


  const refs = {
    home: useRef(null),
    about: useRef(null),
    services: useRef(null),
    contact: useRef(null),
  };


  // Theme state for dark/light mode
  const [mode, setMode] = useState('light');
  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: '#1eb2a6',
          },
          secondary: {
            main: '#b2ebe7',
          },
          background: {
            default: mode === 'light' ? '#fff' : '#181c1f',
            paper: mode === 'light' ? '#fff' : '#23272b',
          },
          text: {
            primary: mode === 'light' ? '#222' : '#fff',
            secondary: mode === 'light' ? '#444' : '#b2ebe7',
          },
        },
      }),
    [mode]
  );


  const [openService, setOpenService] = useState(null);


  const handleScroll = (id) => {
    refs[id]?.current?.scrollIntoView({ behavior: 'smooth' });
  };


  return (
    <ThemeProvider theme={theme}>
      {/* Main wrapper Box for the entire page */}
      <Box sx={{ width: '100vw', maxWidth: '100%', overflowX: 'hidden', bgcolor: 'background.default', color: 'text.primary', minHeight: '100vh' }}>
        {/* Top Contact Bar */}
        <Box sx={{ backgroundColor: 'background.paper', py: 2, px: 4 }}>
          <Grid container alignItems="center" justifyContent="center" spacing={2}>
            <Grid item>
              <img src={DentalLogo} alt="Logo" style={{ height: 70 }} />
            </Grid>
            {branches.map((branch, index) => (
              <Grid item key={index} sx={{ display: 'flex', alignItems: 'center', mx: 2 }}>
                <Avatar sx={{ bgcolor: 'transparent', color: 'gold', mr: 1 }}>
                  <PhoneIcon />
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {branch.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {branch.number}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Main Navbar */}
        <Box sx={{ display: 'flex', justifyContent: 'center', backgroundColor: 'transparent', position: 'relative', width: '100vw' }}>
          <Box
            sx={{
              backgroundColor: '#1eb2a6',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              px: { xs: 2, sm: 6 },
              py: 1,
              borderRadius: '0 0 24px 24px',
              maxWidth: { xs: '99vw', sm: '900px', md: '1200px' },
              width: { xs: '99vw', sm: '80vw', md: '70vw' },
              boxShadow: '0 12px 50px 0 rgba(30,178,166,0.18)',
              position: 'relative',
              zIndex: 30,
              top: -32,
            }}
          >
            {/* Centered Navigation */}
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', alignItems: 'center', flex: 1 }}>
              {sections.map((section) => (
                <Button
                  key={section.id}
                  onClick={() => handleScroll(section.id)}
                  className="mint-navbar-btn"
                  sx={{
                    bgcolor: '#fff',
                    color: '#1eb2a6',
                    fontWeight: 600,
                    px: 1.5,
                    py: 0.3,
                    borderRadius: 2,
                    fontSize: 13,
                    boxShadow: 1,
                    mx: 0.5,
                    minWidth: 90,
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: '#b2ebe7',
                      color: '#159a8a',
                      boxShadow: 4,
                      transform: 'scale(1.07)',
                    },
                  }}
                >
                  {section.label}
                </Button>
              ))}
            </Box>
            {/* Right: Theme toggle and Profile/Login as separate profile */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
              <IconButton onClick={() => setMode(mode === 'light' ? 'dark' : 'light')} color="inherit">
                {mode === 'dark' ? <Brightness7Icon sx={{ color: '#fff' }} /> : <Brightness4Icon sx={{ color: '#fff' }} />}
              </IconButton>
              <Button
                onClick={() => {
                  navigate('/login', { replace: true });
                }}
                className="mint-navbar-btn"
                sx={{
                  bgcolor: mode === 'light' ? '#fff' : 'rgba(30,178,166,0.10)',
                  color: '#1eb2a6',
                  fontWeight: 600,
                  borderRadius: 2,
                  fontSize: 14,
                  boxShadow: 1,
                  mx: 0.5,
                  minWidth: 90,
                  minHeight: 44,
                  border: mode === 'dark' ? '1.5px solid #1eb2a6' : 'none',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: mode === 'light' ? '#b2ebe7' : 'rgba(30,178,166,0.22)',
                    color: '#159a8a',
                    boxShadow: 4,
                    transform: 'scale(1.07)',
                  },
                  '&:active': {
                    bgcolor: mode === 'light' ? '#b2ebe7' : 'rgba(30,178,166,0.32)',
                  },
                }}
              >
                Login
              </Button>
              <IconButton
                className="mint-navbar-btn"
                onClick={() => {
                  const token = sessionStorage.getItem('authToken');
                  const role = sessionStorage.getItem('role');
                  if (token && role) {
                    if (role === 'patient') {
                      navigate('/', { replace: true });
                    } else {
                      navigate('/ManageAppointment', { replace: true });
                    }
                  } else {
                    navigate('/login', { replace: true });
                  }
                }}
                sx={{
                  bgcolor: mode === 'light' ? '#fff' : 'rgba(30,178,166,0.10)',
                  color: '#1eb2a6',
                  fontWeight: 600,
                  borderRadius: 2,
                  fontSize: 22,
                  boxShadow: 1,
                  mx: 0.5,
                  minWidth: 44,
                  minHeight: 44,
                  border: mode === 'dark' ? '1.5px solid #1eb2a6' : 'none',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: mode === 'light' ? '#b2ebe7' : 'rgba(30,178,166,0.22)',
                    color: '#159a8a',
                    boxShadow: 4,
                    transform: 'scale(1.07)',
                  },
                  '&:active': {
                    bgcolor: mode === 'light' ? '#b2ebe7' : 'rgba(30,178,166,0.32)',
                  },
                }}
              >
                <AccountCircleIcon fontSize="inherit" />
              </IconButton>
            </Box>
          </Box>
        </Box>
        {/* Home Section */}
        <Box
          ref={refs.home}
          id="home"
          sx={{
            background: mode === 'light'
              ? 'linear-gradient(120deg, #e0f7fa 55%, #b2ebe7 80%, #b2ebe7 100%)'
              : 'linear-gradient(120deg, #23272b 55%, #159a8a 80%, #159a8a 100%)',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            justifyContent: 'center',
            px: { xs: 2, md: 8 },
            py: { xs: 10, md: 14 },
            minHeight: { xs: '70vh', md: '80vh' },
            borderBottomLeftRadius: '50% 15%',
            borderBottomRightRadius: '50% 15%',
            position: 'relative',
            zIndex: 10,
            boxShadow: '0 8px 32px 0 rgba(0,0,0,0.12)',
            top: -90,
            overflow: 'hidden',
          }}
        >
          <Box sx={{ flex: 1, zIndex: 2, textAlign: 'center', pr: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            {/* Removed star icons and decorative logo */}
            <Typography variant="h2" sx={{ fontWeight: 'bold', color: 'text.primary', mb: 2, lineHeight: 1.1, textAlign: 'center', fontSize: { xs: 34, md: 52 }, letterSpacing: 1 }}>
              <span style={{
                color: theme.palette.primary.main,
                textShadow: mode === 'light'
                  ? '0 2px 12px #b2ebe7, 0 1px 0 #fff'
                  : '0 2px 12px #159a8a, 0 1px 0 #23272b',
                fontWeight: 800,
                paddingBottom: 2,
                transition: 'color 0.3s',
                display: 'inline',
              }}>
                YOUR SMILE,
              </span> Our Passion!
            </Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: 20, mb: 5, maxWidth: 560, mx: 'auto', textAlign: 'center', fontWeight: 500, letterSpacing: 0.5, textShadow: '0 1px 6px #fff' }}>
              Welcome to our clinic, where your comfort and confidence come first. We make dental visits easy, modern, and even enjoyable—so you can smile brighter every day.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', justifyContent: 'center', mb: 4 }}>
              <Button
                variant="contained"
                sx={{
                  bgcolor: '#1eb2a6',
                  color: '#fff',
                  fontWeight: 'bold',
                  px: 3,
                  py: 1,
                  borderRadius: 4,
                  fontSize: 15,
                  minWidth: 120,
                  boxShadow: '0 4px 16px 0 rgba(30,178,166,0.18)',
                  transition: 'all 0.2s',
                  '&:hover': { bgcolor: '#159a8a', transform: 'scale(1.07)' },
                }}
                onClick={() => navigate('/login')}
              >
                Book an Appointment
              </Button>
              <Button
                variant="outlined"
                sx={{
                  borderColor: '#1eb2a6',
                  color: '#1eb2a6',
                  fontWeight: 'bold',
                  px: 3,
                  py: 1,
                  borderRadius: 4,
                  fontSize: 15,
                  minWidth: 120,
                  ml: 1,
                  boxShadow: '0 2px 8px 0 rgba(30,178,166,0.10)',
                  transition: 'all 0.2s',
                  '&:hover': { bgcolor: '#e0f7fa', borderColor: '#159a8a', color: '#159a8a', transform: 'scale(1.07)' },
                }}
                onClick={() => handleScroll('about')}
              >
                Learn More
              </Button>
            </Box>
          </Box>
          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', mt: { xs: 6, md: 0 } }}>
            {/* Decorative blurred blob background for depth */}
            <Box
              sx={{
                position: 'absolute',
                width: { xs: 260, md: 360 },
                height: { xs: 260, md: 360 },
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 0,
                borderRadius: '50%',
                background: mode === 'light'
                  ? 'radial-gradient(circle at 60% 40%, #b2ebe7 0%, #e0f7fa 60%, #fff 100%)'
                  : 'radial-gradient(circle at 60% 40%, #159a8a 0%, #23272b 60%, #181c1f 100%)',
                filter: 'blur(32px)',
                opacity: 0.65,
                pointerEvents: 'none',
                boxShadow: mode === 'light'
                  ? '0 4px 32px 0 #b2ebe7, 0 2px 12px 0 #e0f7fa'
                  : '0 4px 32px 0 #159a8a, 0 2px 12px 0 #23272b',
              }}
            />


            {/* Main image: Tooth.png with outline and always visible in light mode */}
            <Box sx={{
              width: { xs: 260, md: 360 },
              height: { xs: 260, md: 360 },
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'floatY 3.5s ease-in-out infinite',
              '::before': {
                content: '""',
                position: 'absolute',
                inset: -10,
                borderRadius: 'inherit',
                zIndex: 0,
                background: mode === 'light'
                  ? 'linear-gradient(120deg, #b2ebe7 0%, #1eb2a6 100%)'
                  : 'linear-gradient(120deg, #159a8a 0%, #23272b 100%)',
                filter: 'blur(16px)',
                opacity: 0.55,
                pointerEvents: 'none',
              },
            }}>
              <img
                src={ToothPng}
                alt="Tooth"
                style={{
                  width: '90%',
                  height: '90%',
                  objectFit: 'contain',
                  zIndex: 2,
                  filter: mode === 'light'
                    ? 'drop-shadow(0 1px 6px #b2ebe7)'
                    : 'drop-shadow(0 1px 6px #159a8a)',
                  transition: 'filter 0.3s',
                  background: 'transparent',
                  borderRadius: 0,
                  boxSizing: 'border-box',
                  boxShadow: mode === 'light'
                    ? '0 2px 8px 0 #b2ebe7'
                    : '0 2px 8px 0 #159a8a',
                }}
              />
            </Box>

            
            {/* Floating animation keyframes */}
            <style>{`
              @keyframes floatY {
                0% { transform: translateY(0); }
                50% { transform: translateY(-18px); }
                100% { transform: translateY(0); }
              }
            `}</style>
          </Box>
        </Box>


        {/* About & Services Section */}
        <Box sx={{
          width: '100vw',
          background: mode === 'light'
            ? 'linear-gradient(135deg, #1eb2a6 0%, #e0f7fa 100%)'
            : 'linear-gradient(135deg, #23272b 0%, #159a8a 100%)',
          py: { xs: 12, md: 18 },
          px: 0,
          m: 0,
          mt: { xs: -32, md: -28 }, // to move the page section
          zIndex: 1,
          position: 'relative',
          minHeight: { xs: 480, md: 600 },
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <Container maxWidth={false} disableGutters sx={{ width: '100vw', px: 0, m: 0 }}>
            <Box sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              px: { xs: 2, md: 8 },
              py: 0,
              m: 0,
              gap: { xs: 4, md: 8 },
            }}>
              <Box ref={refs.about} id="about" sx={{
                flex: 1,
                pr: { md: 6 },
                py: 4,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: { xs: 'center', md: 'flex-start' },
                background: mode === 'light' ? 'rgba(255,255,255,0.95)' : 'rgba(35,39,43,0.98)',
                borderRadius: 5,
                boxShadow: '0 4px 32px 0 rgba(30,178,166,0.10)',
                p: { xs: 3, md: 5 },
                minWidth: 320,
                maxWidth: 600,
                position: 'relative',
                mt: { xs: 4, md: 6 },
              }}>
                <Box sx={{ width: 48, height: 6, bgcolor: 'primary.main', borderRadius: 3, mb: 2 }} />
                <Typography variant="h3" sx={{ fontWeight: 700, color: mode === 'light' ? 'primary.main' : 'text.primary', mb: 2, textAlign: { xs: 'center', md: 'left' }, letterSpacing: 1 }}>
                  About Us
                </Typography>
                <Typography sx={{ fontSize: 22, color: 'text.primary', fontWeight: 600, mb: 2, textAlign: { xs: 'center', md: 'left' } }}>
                  Gallevo-Marzan Dental Care Clinic
                </Typography>
                <Typography sx={{ color: 'secondary.main', fontSize: 16, mb: 2, textAlign: { xs: 'center', md: 'left' }, maxWidth: 600 }}>
                  <b>Where Smiles Begin and Confidence Grows.</b> Our clinic in Solano, Nueva Vizcaya, is dedicated to providing comprehensive, patient-centered dental care in a modern, welcoming environment. Led by <span style={{ color: theme.palette.primary.main, fontWeight: 600 }}>Dr. Narceli C. Gallevo-Marzan</span> and <span style={{ color: theme.palette.primary.main, fontWeight: 600 }}>Dr. Roceli Faye G. Marzan-Atienza</span>, we offer a full spectrum of dental services for all ages.
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 2, mt: 1 }}>
                  {['General Dentistry', 'Orthodontics', 'Prosthodontics', 'Endodontics', 'Restorative', 'Esthetic', 'Pediatric', 'X-ray Diagnostics'].map((service) => (
                    <Box
                      key={service}
                      sx={{
                        bgcolor: mode === 'light' ? 'secondary.main' : 'primary.dark',
                        color: mode === 'light' ? 'primary.main' : '#fff',
                        px: 2.5,
                        py: 0.7,
                        borderRadius: 3,
                        fontWeight: 700,
                        fontSize: 15,
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px 0 rgba(30,178,166,0.10)',
                        border: `1.5px solid ${mode === 'light' ? '#b2ebe7' : '#159a8a'}`,
                        transition: 'all 0.2s',
                        '&:hover': {
                          bgcolor: mode === 'light' ? '#b2ebe7' : '#159a8a',
                          color: mode === 'light' ? '#159a8a' : '#fff',
                          boxShadow: 4,
                          transform: 'scale(1.07)',
                        },
                      }}
                    >
                      {service}
                    </Box>
                  ))}
                </Box>
                <Typography sx={{ color: 'text.secondary', fontSize: 15, mb: 2, textAlign: { xs: 'center', md: 'left' }, maxWidth: 600 }}>
                  We blend expertise and compassion to deliver quality dental solutions in a friendly, state-of-the-art setting. Your healthy, beautiful smile is our mission—let us help you achieve it!
                </Typography>
              </Box>
              <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
                <Avatar src={DentalLogo} alt="Logo" sx={{ width: 220, height: 220, bgcolor: 'transparent', boxShadow: 3, border: `5px solid ${theme.palette.primary.main}`, p: 1, background: mode === 'light' ? 'linear-gradient(135deg, #e0f7fa 60%, #fff 100%)' : 'linear-gradient(135deg, #23272b 60%, #159a8a 100%)' }} />
              </Box>
            </Box>
          </Container>
        </Box>


        {/* Services Section Separator (Oval) - now in whitespace between sections */}
        {/* This is the oval separator between About and Services sections. It visually separates the two sections */}
        <Box sx={{ width: '100vw', display: 'flex', justifyContent: 'center', alignItems: 'center', mt: { xs: -4, md: -6 }, mb: { xs: 3, md: 4 }, zIndex: 3, position: 'relative', background: 'transparent' }}>
          <Box
            sx={{
              // The oval's width, height, color, border, and shadow for subtle separation
              width: { xs: '90vw', sm: 500, md: 700 },
              maxWidth: 900,
              minWidth: 220,
              minHeight: { xs: 40, sm: 60, md: 70 },
              px: { xs: 1, sm: 4, md: 6 },
              py: { xs: 1, sm: 2, md: 2.5 },
              bgcolor: 'background.paper',
              borderRadius: 999,
              // Make the bottom shadow much heavier
              boxShadow: mode === 'light' ? '0 18px 38px -4px rgba(30,178,166,0.38)' : '0 18px 38px -4px rgba(30,178,166,0.18)',
              border: `3px solid ${theme.palette.secondary.main}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              position: 'relative',
              top: 0,
            }}
          >
            {/* The text inside the oval separator */}
            {/* Title: Discover the Services (bold), Subtitle: We provide: (smaller font) */}
            <Box sx={{ width: '100%', textAlign: 'center' }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  color: mode === 'light' ? 'primary.main' : 'text.primary',
                  letterSpacing: 1,
                  fontSize: { xs: 20, sm: 24, md: 28 },
                  textShadow: mode === 'light' ? '0 1px 6px #fff' : '0 1px 6px #23272b',
                  mb: 0.5,
                }}
              >
                Services offered
              </Typography>
              {/* <Typography
                variant="subtitle1"
                sx={{
                  color: '#159a8a',
                  fontWeight: 600,
                  fontSize: { xs: 13, sm: 15, md: 17 },
                  letterSpacing: 0.5,
                  mt: 0,
                }}
              >
                We provide:
              </Typography> */}
            </Box>
          </Box>
        </Box>


        {/* Services Section */}
        <Box
          ref={refs.services}
          id="services"
          sx={{
            width: '100vw',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            my: 10, // Increased margin to push section further down
            px: { xs: 1, md: 4 },
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
              gap: { xs: 3, sm: 4, md: 5 },
              width: '100%',
              maxWidth: 1200,
              justifyItems: 'center',
            }}
          >
            {/* Each Paper is a service card */}
            {dentalServices.map((service, idx) => (
              <Paper
                key={service.name}
                elevation={8}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  gap: 2,
                  pt: 7,
                  pb: 4,
                  px: 3,
                  borderRadius: 5,
                  background: mode === 'light'
                    ? 'linear-gradient(135deg, #fff 80%, #e0f7fa 100%)'
                    : 'linear-gradient(135deg, #23272b 80%, #159a8a 100%)',
                  border: `2px solid ${theme.palette.secondary.main}`,
                  boxShadow: mode === 'light'
                    ? '0 4px 24px 0 rgba(30,178,166,0.10), 0 1.5px 12px 0 rgba(30,178,166,0.10)'
                    : '0 4px 24px 0 rgba(30,178,166,0.22), 0 1.5px 12px 0 rgba(30,178,166,0.18)',
                  minHeight: 320,
                  maxWidth: 340,
                  width: '100%',
                  mx: 'auto',
                  textAlign: 'center',
                  position: 'relative',
                  overflow: 'visible',
                  transition: 'box-shadow 0.3s, transform 0.3s',
                  '&:hover': {
                    boxShadow: mode === 'light'
                      ? '0 16px 48px 0 rgba(30,178,166,0.22), 0 4px 24px 0 rgba(30,178,166,0.10)'
                      : '0 24px 64px 0 rgba(30,178,166,0.32), 0 8px 32px 0 rgba(30,178,166,0.18)',
                    transform: 'translateY(-18px) scale(1.04)',
                    borderColor: theme.palette.primary.main,
                  },
                }}
              >
                {/* Icon and accent bar for each service */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: -45,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <Box
                    sx={{
                      width: 90,
                      height: 90,
                      bgcolor: mode === 'light' ? 'secondary.main' : 'primary.dark',
                      border: `4px solid ${theme.palette.primary.main}`,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: mode === 'light' ? '0 2px 8px 0 rgba(30,178,166,0.10)' : '0 2px 8px 0 rgba(30,178,166,0.22)',
                    }}
                  >
                    {service.icon}
                  </Box>
                  <Box sx={{ width: 40, height: 5, bgcolor: 'primary.main', borderRadius: 2, mt: 1, mb: 0.5 }} />
                </Box>
                {/* Service name and details */}
                <Box sx={{ flex: 1, mt: 2, zIndex: 1 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      mb: 1,
                      color: mode === 'dark' ? '#fff' : theme.palette.primary.main,
                      letterSpacing: 0.5,
                      mt: 2.5,
                      textShadow: mode === 'dark'
                        ? '0 2px 8px #fff, 0 2px 8px #159a8a, 0 1px 12px #000'
                        : '0 2px 8px #b2ebe7',
                        zIndex: 2,
                    }}
                  >
                    {service.name}
                  </Typography>
                  <Typography
                    sx={{
                      color: mode === 'dark' ? '#fff' : 'text.secondary',
                      fontSize: 16,
                      mb: 2,
                    }}
                  >
                    {service.details}
                  </Typography>
                </Box>
              </Paper>
            ))}
          </Box>
        </Box>


        {/* Footer Section */}
        <Box component="footer" sx={{
          width: '100%',
          bgcolor: 'primary.main',
          color: '#fff',
          mt: 8,
          py: { xs: 5, md: 7 },
          px: { xs: 2, md: 8 },
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'center',
          alignItems: { xs: 'flex-start', md: 'center' },
          gap: { xs: 4, md: 8 },
        }}>
       
          <Box sx={{ flex: 1, minWidth: 220, display: 'flex', flexDirection: 'column', alignItems: { xs: 'center', md: 'flex-start' }, mb: { xs: 3, md: 0 }, justifyContent: 'center' }}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: { xs: 'center', md: 'flex-start' }, width: '100%' }}>
              <img
                src={Logo2}
                alt="Logo"
                style={{
                  height: 200, // much bigger
                  width: 'auto',
                  borderRadius: 0, // no border radius
                  background: 'none', // no background
                  boxShadow: 'none', // no shadow
                  padding: 0, // no padding
                  filter: 'none', // no filter, keep it clean
                  objectFit: 'contain',
                  display: 'block',
                  maxWidth: '100%',
                }}
              />
            </Box>
          </Box>
          {/* Center: Contact Info */}
          <Box sx={{ flex: 1, minWidth: 220, display: 'flex', flexDirection: 'column', alignItems: { xs: 'center', md: 'flex-start' } }}>
            <Typography fontWeight="bold" sx={{ mb: 1 }}>Contact Us</Typography>
            <Typography fontWeight="bold" sx={{ fontSize: 15 }}>Branch Clinic</Typography>
            <Typography sx={{ fontSize: 15 }}>+0927-372-4929</Typography>
            <Typography fontWeight="bold" sx={{ fontSize: 15, mt: 1 }}>Main Clinic</Typography>
            <Typography sx={{ fontSize: 15 }}>+0977-641-4655</Typography>
            <Typography fontWeight="bold" sx={{ fontSize: 15, mt: 1 }}>Main Clinic(2)</Typography>
            <Typography sx={{ fontSize: 15 }}>+0921-355-3335</Typography>
            <Typography sx={{ fontSize: 15, mt: 2 }}>Email: info@dentalclinic.com</Typography>
            <Typography sx={{ fontSize: 15 }}>Phone: (123) 456-7890</Typography>
            <Typography sx={{ fontSize: 15 }}>Address: 123 Smile Street, Tooth City</Typography>
          </Box>
          {/* Right: Links, Social, Cert */}
          <Box sx={{ flex: 1, minWidth: 220, display: 'flex', flexDirection: 'column', alignItems: { xs: 'center', md: 'flex-start' } }}>
            <Typography fontWeight="bold" sx={{ mb: 1 }}>Links</Typography>
            <Typography sx={{ fontSize: 15 }}>Home</Typography>
            <Typography sx={{ fontSize: 15 }}>About Us</Typography>
            <Typography sx={{ fontSize: 15 }}>Dental Services</Typography>
            <Typography sx={{ fontSize: 15 }}>Contact</Typography>
         
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <IconButton
                color="inherit"
                size="small"
                component="a"
                href="https://web.facebook.com/profile.php?id=61565668835897"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FacebookIcon sx={{ color: '#fff' }} />
              </IconButton>
            </Box>
            <Typography sx={{ fontSize: 13, mt: 1, color: '#fff', width: '100%', textAlign: 'center', pb: 1 }}>
              ©2025 Gallevo-Marzan Dental Care Clinic. All rights Reserved.
            </Typography>
   
            <Box sx={{ mt: 2, mb: 1 }}>
             
            </Box>
          </Box>
        </Box> {/* End Footer main Box */}
      </Box> {/* Close main wrapper Box */}
    </ThemeProvider>
  );
}


export default LandingPage;



