import React, { useRef, useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container, IconButton, Paper, MobileStepper } from '@mui/material';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import { useNavigate } from 'react-router-dom';
import './UserDashboard.css';

const sections = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'services', label: 'Services' },
  { id: 'contact', label: 'Contact' },
  { id: 'location', label: 'location' }

];

const servicesData = [
  {
    condition: 'Dental Caries',
    treatments: ['Dental Fillings', 'Inlays / Onlays', 'Crowns', 'Root Canal Therapy'],
  },
  {
    condition: 'Pulpitis',
    treatments: ['Root Canal Therapy', 'Pulpotomy', 'Tooth Extraction'],
  },
  {
    condition: 'Periapical Abscess',
    treatments: ['Root Canal Therapy', 'Apicoectomy', 'Tooth Extraction'],
  },
  {
    condition: 'Tooth Fracture / Cracked Tooth Syndrome',
    treatments: ['Crown Placement', 'Bonding', 'Tooth Extraction'],
  },
  {
    condition: 'Erosion, Abrasion, Attrition',
    treatments: ['Dental Bonding', 'Crowns', 'Oral Hygiene Instruction'],
  },
  {
    condition: 'Impacted Tooth',
    treatments: ['Impacted Tooth Removal', 'Surgical Extraction'],
  },
  {
    condition: 'Tooth Mobility',
    treatments: ['Scaling and Root Planing', 'Splinting', 'Periodontal Surgery'],
  },
  {
    condition: 'Gingivitis',
    treatments: ['Oral Prophylaxis', 'Topical Fluoride Application'],
  },
  {
    condition: 'Periodontitis',
    treatments: ['Scaling and Root Planing', 'Flap Surgery', 'Bone Grafting'],
  },
  {
    condition: 'Gingival Recession',
    treatments: ['Gingivoplasty', 'Gingival Grafting'],
  },
  {
    condition: 'Peri-implantitis',
    treatments: ['Antibiotics', 'Implant Cleaning', 'Flap Surgery'],
  },
  {
    condition: 'Malocclusion',
    treatments: ['Braces', 'Clear Aligners'],
  },
  {
    condition: 'Crowded Teeth',
    treatments: ['Orthodontic Expansion', 'Braces'],
  },
  {
    condition: 'Overbite / Underbite / Crossbite / Open Bite',
    treatments: ['Braces', 'Jaw Surgery'],
  },
  {
    condition: 'Oral Ulcers / Aphthous Ulcers',
    treatments: ['Topical Medications'],
  },
  {
    condition: 'Oral Candidiasis',
    treatments: ['Antifungal Medications'],
  },
  {
    condition: 'TMD',
    treatments: ['Mouth Guard', 'TMD Therapy'],
  },
  {
    condition: 'Bruxism',
    treatments: ['Mouth Guard', 'Botox (optional)'],
  },
  {
    condition: 'Oral Cancer / Suspicious Lesions',
    treatments: ['Biopsy', 'Referral to Oncologist'],
  },
];

function UserDashboard() {
  const navigate = useNavigate();
  const refs = {
    home: useRef(null),
    about: useRef(null),
    services: useRef(null),
    contact: useRef(null),
  };

  const [currentService, setCurrentService] = useState(0);

  const handleScroll = (id) => {
    refs[id].current.scrollIntoView({ behavior: 'smooth' });
  };

  const nextService = () => {
    setCurrentService((prev) => (prev + 1) % servicesData.length);
  };
  const prevService = () => {
    setCurrentService((prev) => (prev - 1 + servicesData.length) % servicesData.length);
  };

  return (
    <Box>
      {/* Navbar */}
      <AppBar position="sticky" color="primary">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, cursor: 'pointer' }} onClick={() => handleScroll('home')}>
            Dental Clinic
          </Typography>
          {sections.map((section) => (
            <Button key={section.id} color="inherit" onClick={() => handleScroll(section.id)}>
              {section.label.charAt(0).toUpperCase() + section.label.slice(1)}
            </Button>
          ))}
          <Button color="inherit" onClick={() => navigate('/login')}>Login</Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Home Section */}
        <Box ref={refs.home} id="home" sx={{ my: 6 }}>
          <Typography variant="h3" gutterBottom>Welcome to Our Dental Clinic</Typography>
          <Typography variant="h6">Your smile, our passion. Experience the best dental care with us.</Typography>
        </Box>

        {/* About Section */}
        <Box ref={refs.about} id="about" sx={{ my: 6 }}>
          <Typography variant="h4" gutterBottom>About Us</Typography>
          <Typography>We are a team of experienced dental professionals dedicated to providing top-quality care in a comfortable environment.</Typography>
        </Box>

        {/* Services Carousel Section */}
        <Box ref={refs.services} id="services" sx={{ my: 6 }}>
          <Typography variant="h4" gutterBottom>Services Offered</Typography>
          <Paper elevation={3} sx={{ p: 3, mb: 2, minHeight: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="h5" gutterBottom>{servicesData[currentService].condition}</Typography>
            <Box component="ul" sx={{ pl: 3 }}>
              {servicesData[currentService].treatments.map((t, i) => (
                <li key={i}><Typography>{t}</Typography></li>
              ))}
            </Box>
          </Paper>
          <MobileStepper
            variant="dots"
            steps={servicesData.length}
            position="static"
            activeStep={currentService}
            nextButton={
              <IconButton size="small" onClick={nextService} disabled={servicesData.length <= 1}>
                <KeyboardArrowRight />
              </IconButton>
            }
            backButton={
              <IconButton size="small" onClick={prevService} disabled={servicesData.length <= 1}>
                <KeyboardArrowLeft />
              </IconButton>
            }
            sx={{ justifyContent: 'center', mt: 1 }}
          />
        </Box>

        {/* Contact Section */}
        <Box ref={refs.contact} id="contact" sx={{ my: 6 }}>
          <Typography variant="h4" gutterBottom>Contact Us</Typography>
          <Typography>Email: info@dentalclinic.com</Typography>
          <Typography>Phone: (123) 456-7890</Typography>
          <Typography>Address: 123 Smile Street, Tooth City</Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default UserDashboard;
