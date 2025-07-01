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

import { useNavigate } from 'react-router-dom';
import './UserDashboard.css';
import './mint-navbar.css';
import finalLogo from '../../assets/FinalLogo.png';
import logo2 from '../../assets/Logo (2).png';

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
  const refs = {
    home: useRef(null),
    about: useRef(null),
    services: useRef(null),
    contact: useRef(null),
  };


  const [openService, setOpenService] = useState(null);

  const handleScroll = (id) => {
    refs[id]?.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Box sx={{ width: '100vw', overflowX: 'hidden' }}>
      {/* Top Contact Bar */}
      <Box sx={{ backgroundColor: 'white', py: 2, px: 4 }}>
        <Grid container alignItems="center" spacing={2} justifyContent="space-between">
          <Grid item>
            <img src={finalLogo} alt="Logo" style={{ height: 70 }} />
          </Grid>
          {branches.map((branch, index) => (
            <Grid item key={index} sx={{ display: 'flex', alignItems: 'center' }}>
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
            px: { xs: 2, sm: 6 }, // padding for navbar
            py: 1,
            borderRadius: '0 0 24px 24px',
            maxWidth: { xs: '99vw', sm: '900px', md: '1200px' }, // Navbar length adjuster
            width: { xs: '99vw', sm: '80vw', md: '70vw' },      // longer navbar
            boxShadow: '0 12px 50px 0 rgba(30,178,166,0.18)', // for the shadow shit
            position: 'relative',
            zIndex: 30,
            top: 3
          }}
        >
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
                  px: 2,
                  py: 0.5,
                  borderRadius: 2,
                  fontSize: 15,
                  boxShadow: 1,
                  mx: 0.5,
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
            <Button
              onClick={() => navigate('/login')}
              className="mint-navbar-btn"
              sx={{
                bgcolor: '#fff',
                color: '#1eb2a6',
                fontWeight: 600,
                px: 2,
                py: 0.5,
                borderRadius: 2,
                fontSize: 15,
                boxShadow: 1,
                mx: 0.5,
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: '#b2ebe7', // lighter hover color for better contrast
                  color: '#159a8a',
                  boxShadow: 4,
                  transform: 'scale(1.07)',
                },
              }}
            >
              Login
            </Button>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
            <IconButton 
              color="inherit" 
              size="small" 
              component="a" 
              href="https://web.facebook.com/profile.php?id=61565668835897" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <FacebookIcon sx={{ color: '#fff', fontSize: 28 }} />
            </IconButton>
          </Box>
        </Box>
      </Box>
      {/* Home Section */}
      <Box
        ref={refs.home}
        id="home"
        sx={{
        //   mt: { xs: -15, md: -20 }, // move home section up behind navbar
          background: '#fff',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          justifyContent: 'center',
          px: { xs: 2, md: 6 },
          py: { xs: 6, md: 10 },
          minHeight: { xs: '60vh', md: '70vh' },
          borderBottomLeftRadius: { xs: '80px', md: '120px' },
          borderBottomRightRadius: { xs: '80px', md: '120px' },
          position: 'relative',
          zIndex: 10, 
          boxShadow: '0 8px 32px 0 rgba(0,0,0,0.08)',
          top:-50
        }}
      >
        <Box sx={{ flex: 1, zIndex: 2, textAlign: 'center', pr: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, justifyContent: 'center' }}>
            <Box sx={{ color: '#f7b267', fontSize: 22, fontWeight: 'bold' }}>★ ★ ★</Box>
          </Box>
          <Typography variant="h2" sx={{ fontWeight: 'bold', color: '#222', mb: 1, lineHeight: 1.1, textAlign: 'center' }}>
            Seeing the dentist just <span style={{ color: '#1eb2a6' }}>got cooler</span>
          </Typography>
          <Typography sx={{ color: '#444', fontSize: 17, mb: 4, maxWidth: 520, mx: 'auto', textAlign: 'center' }}>
            Welcome to our clinic, where your comfort and confidence come first. We make dental visits easy, modern, and even enjoyable—so you can smile brighter every day.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button
            variant="contained"
            sx={{ bgcolor: '#1eb2a6', color: '#fff', fontWeight: 'bold', px: 3, borderRadius: 2, boxShadow: 1, '&:hover': { bgcolor: '#159a8a' } }}
            onClick={() => navigate('/login')}
          >
            Book an Appointment
          </Button>
          </Box>
        </Box>
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', mt: { xs: 5, md: 0 } }}>
          <Box sx={{
            width: { xs: 220, md: 320 },
            height: { xs: 220, md: 320 },
            borderTopLeftRadius: '60% 70%',
            borderTopRightRadius: '40% 60%',
            borderBottomLeftRadius: '60% 40%',
            borderBottomRightRadius: '40% 60%',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #e0f7fa 60%, #fff 100%)',
            position: 'relative',
            boxShadow: '0 8px 32px 0 rgba(30,178,166,0.10)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <img src="https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=facearea&w=600&q=80" alt="Dental clinic" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </Box>
        </Box>
      </Box>

      {/* About & Services Section */}
      <Box sx={{
        width: '100vw',
        background: '#1eb2a6',
        py: { xs: 10, md: 20 },
        px: 0,
        m: 0,
        mt: { xs: -12, md: -16 }, 
        zIndex: 1,
        position: 'relative',
        minHeight: { xs: 420, md: 520 },
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0
      }}>
        <Container maxWidth={false} disableGutters sx={{ width: '100vw', px: 0, m: 0 }}>
          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            px: { xs: 2, md: 8 },
            py: 0,
            m: 0,
          }}>
            <Box ref={refs.about} id="about" sx={{ flex: 1, pr: { md: 6 }, py: 4, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: { xs: 'center', md: 'flex-start' } }}>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#fff', mb: 2, textAlign: { xs: 'center', md: 'left' } }}>
                About Us
              </Typography>
              <Typography sx={{ fontSize: 20, color: '#fff', fontWeight: 500, mb: 2, textAlign: { xs: 'center', md: 'left' } }}>
                Gallevo-Marzan Dental Care Clinic
              </Typography>
              <Typography sx={{ color: '#e0f7fa', fontSize: 16, mb: 2, textAlign: { xs: 'center', md: 'left' }, maxWidth: 600 }}>
                <b>Where Smiles Begin and Confidence Grows.</b> Our clinic in Solano, Nueva Vizcaya, is dedicated to providing comprehensive, patient-centered dental care in a modern, welcoming environment. Led by <span style={{ color: '#fff', fontWeight: 600 }}>Dr. Narceli C. Gallevo-Marzan</span> and <span style={{ color: '#fff', fontWeight: 600 }}>Dr. Roceli Faye G. Marzan-Atienza</span>, we offer a full spectrum of dental services for all ages.
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {["General Dentistry", "Orthodontics", "Prosthodontics", "Endodontics", "Restorative", "Esthetic", "Pediatric", "X-ray Diagnostics"].map((service) => (
                  <Box
                    key={service}
                    sx={{
                      bgcolor: '#fff',
                      color: '#1eb2a6',
                      px: 2,
                      py: 0.5,
                      borderRadius: 2,
                      fontWeight: 600,
                      fontSize: 15,
                      cursor: 'pointer',
                      boxShadow: 1,
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: '#e0f7fa',
                        color: '#159a8a',
                        boxShadow: 4,
                        transform: 'scale(1.07)',
                      },
                    }}
                  >
                    {service}
                  </Box>
                ))}
              </Box>
              <Typography sx={{ color: '#e0f7fa', fontSize: 15, mb: 2, textAlign: { xs: 'center', md: 'left' }, maxWidth: 600 }}>
                We blend expertise and compassion to deliver quality dental solutions in a friendly, state-of-the-art setting. Your healthy, beautiful smile is our mission—let us help you achieve it!
              </Typography>
             
            </Box>
            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
              <Avatar src={logo2} alt="Logo" sx={{ width: 200, height: 200, bgcolor: 'transparent', boxShadow: 2, border: '4px solid #fff' }} />
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Services Section */}
      <Box ref={refs.services} id="services" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 6, px: 2 }}>
        <Typography variant="h5" align="center" sx={{ fontWeight: 500, mb: 4 }}>
          Discover The Services <span style={{ color: '#1eb2a6', fontWeight: 700 }}>Dental Clinic Provides:</span>
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%', maxWidth: 600 }}>
          {dentalServices.map((service, idx) => (
            <Paper
              key={service.name}
              elevation={2}
              sx={{
                display: 'flex',
                flexDirection: 'column', // always vertical
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                p: 3,
                borderRadius: 3,
                background: '#fff',
                border: '1.5px solid #1eb2a6',
                boxShadow: '0 2px 12px 0 rgba(30,178,166,0.07)',
                minHeight: 220,
                width: '100%',
                mx: 'auto',
                textAlign: 'center',
              }}
            >
              <Box sx={{
                width: 80,
                height: 80,
                bgcolor: '#e0f7fa',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '3px solid #1eb2a6',
                boxShadow: '0 2px 8px 0 rgba(30,178,166,0.10)',
                flexShrink: 0,
                mx: 'auto',
              }}>
                {service.icon}
              </Box>
              <Box sx={{ flex: 1, mt: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#222' }}>
                  {service.name}
                </Typography>
                <Typography sx={{ color: '#444', fontSize: 15, mb: 3 }}>
                  {service.details}
                </Typography>
                <Button
                  variant="contained"
                  sx={{
                    bgcolor: '#1eb2a6',
                    color: '#fff',
                    fontWeight: 'bold',
                    borderRadius: 2,
                    px: 3,
                    boxShadow: 1,
                    '&:hover': { bgcolor: '#159a8a' },
                    textTransform: 'none',
                    mb: 1
                  }}
                  onClick={() => setOpenService(openService === idx ? null : idx)}
                >
                  {openService === idx ? 'Hide Details' : 'Read More'}
                </Button>
                {openService === idx && (
                  <Box sx={{ mt: 2, color: '#155a4a', fontSize: 15, textAlign: 'left', background: '#e0f7fa', borderRadius: 2, p: 2 }}>
                    <b>What to expect:</b> <br />
                    Our {service.name} service provides a comprehensive approach to your dental needs. Book an appointment, consult with our specialists, and receive personalized care. For more information, contact our clinic or visit us in person.
                  </Box>
                )}
              </Box>
            </Paper>
          ))}
        </Box>
      </Box>

      {/* Footer Section */}
      <Box component="footer" sx={{
        width: '100%',
        bgcolor: '#1eb2a6', // updated to match About Us
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
              src={logo2} 
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
      </Box>
    </Box>
  );
}

export default LandingPage;
