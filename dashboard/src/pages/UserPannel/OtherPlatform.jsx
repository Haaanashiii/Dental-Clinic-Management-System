import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ClientSidebar from "./ClientSidebar";
import jollibeeImg from "../../assets/Jollibee.png";
import itBytesImg from '../../assets/ITBYTES.png';
import NationalBImg from "../../assets/NationalB.jpeg";
import BlendedImg from "../../assets/Blended.png";
import TaraLabaImg from "../../assets/taraLaba.png";
import PNBImg from "../../assets/PNB.png";

// MUI imports
import { Box, Card, CardContent, Typography, Grid, Button, Container, Avatar, Paper, Chip, Switch, FormControlLabel, Badge } from "@mui/material";
import WifiIcon from '@mui/icons-material/Wifi';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import RefreshIcon from '@mui/icons-material/Refresh';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

// Import motion components from framer-motion
import { motion } from "framer-motion";

// Content animation variants
const contentVariants = {
  initial: { opacity: 0, x: 20, y: 10 },
  animate: { opacity: 1, x: 0, y: 0 },
  exit: { opacity: 0, x: -20, y: 10 }
};

// Updated cardData without static online status
const cardData = [
  {
    title: "Jollibee",
    image: jollibeeImg,
    url: "http://192.168.9.37:5173/",
    gradient: "linear-gradient(135deg, #FF8C00, #FF0000)",
    description: "Food ordering platform"
  },
  {
    title: "Blended",
    image: BlendedImg,
    url: "http://192.168.9.7:5173/",
    gradient: "linear-gradient(135deg, #36D1DC, #5B86E5)",
    description: "Beverage ordering system"
  },
  {
    title: "NBS",
    image: NationalBImg,
    url: "http://192.168.9.16:5173/",
    gradient: "linear-gradient(135deg, #AA4465, #861657)",
    description: "Book purchasing platform"
  },
  {
    title: "TaraLaba",
    image: TaraLabaImg,
    url: "http://192.168.9.27:5173/",
    gradient: "linear-gradient(135deg, #00B4DB, #0083B0)",
    description: "Laundry service booking"
  },
  {
    title: "IT Bytes",
    image: itBytesImg,
    url: "http://192.168.9.4:5173/",
    gradient: "linear-gradient(135deg, #1D976C, #93F9B9)",
    description: "Tech product marketplace"
  },
  {
    title: "PNB",
    image: PNBImg,
    url: "http://192.168.9.23:5173/",
    gradient: "linear-gradient(135deg, #F2994A, #F2C94C)",
    description: "Banking services platform"
  },
];

function OtherPlatform() {
  const navigate = useNavigate();
  const [platformsData, setPlatformsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Check if a platform is online
  const checkPlatformStatus = async (url) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(url, { 
        method: 'HEAD',
        mode: 'no-cors',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return true; // If no error, consider it online
    } catch (error) {
      console.log(`Error checking ${url}:`, error.message);
      return false; // If error/timeout, consider it offline
    }
  };
  
  // Check all platforms
  const checkAllPlatforms = async () => {
    setRefreshing(true);
    
    const updatedPlatforms = await Promise.all(
      cardData.map(async (platform) => {
        const isOnline = await checkPlatformStatus(platform.url);
        return { ...platform, isOnline };
      })
    );
    
    setPlatformsData(updatedPlatforms);
    setIsLoading(false);
    setRefreshing(false);
  };
  
  // Initial check and setup periodic checks
  useEffect(() => {
    checkAllPlatforms();
    
    const intervalId = setInterval(() => {
      checkAllPlatforms();
    }, 60000); // Check every minute
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Count online platforms
  const onlineCount = platformsData.filter(platform => platform.isOnline).length;

  const handleCardClick = (url) => {
    if (/^https?:\/\//.test(url)) {
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      navigate(url);
    }
  };

  return (
    <Box sx={{ 
      display: "flex", 
      minHeight: "100vh",
      bgcolor: "#f0f4f5", // Lighter teal-tinted background
      background: "linear-gradient(135deg, #f0f4f5 0%, #e6eff0 100%)",
      overflow: "hidden" // Keep the parent container from scrolling
    }}>
      {/* Sidebar with fixed width */}
      <Box>
        <ClientSidebar />
      </Box>

      {/* Main content area - FIXED: Changed to use flexbox for better layout control */}
      <Box sx={{ 
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
        height: "100vh", // Set to full viewport height
        overflow: "hidden", // Prevent this container from scrolling
      }}>
        {/* Main content with animation - improved motion container */}
        <motion.div
          style={{ 
            width: "100%", 
            height: "100%", 
            display: "flex", 
            flexDirection: "column",
            overflow: "hidden" // Prevent this container from scrolling
          }}
          variants={contentVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {/* Page header - FIXED: Added padding to prevent content from touching edges */}
          <Box sx={{ 
            p: { xs: 2, sm: 3, md: 4 },
            pb: 0, // Remove bottom padding as we handle that in the next container
          }}>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  color: "#1c444d",
                  fontWeight: "bold",
                  fontSize: { xs: "1.75rem", md: "2.125rem" },
                  mb: 0
                }}
              >
                Other Platforms
              </Typography>
              <Typography 
                variant="body1" 
                color="text.secondary"
                sx={{ mb: 0 }}
              >
                Access our partner services through these integrated platforms
              </Typography>
            </motion.div>
          </Box>

          {/* Filter switch section - FIXED: Added padding to properly position this section */}
          <Box sx={{ 
            px: { xs: 2, sm: 3, md: 4 },
            py: 2,
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between",
            flexDirection: { xs: "column", sm: "row" }
          }}>
            <Typography variant="body1" color="text.secondary" sx={{ mb: { xs: 2, sm: 0 } }}>
              {isLoading ? "Checking platform status..." : `Showing all platforms (${onlineCount} online)`}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Tooltip title="Refresh status">
                <IconButton 
                  onClick={checkAllPlatforms} 
                  disabled={refreshing || isLoading}
                  sx={{ mr: 2 }}
                >
                  {refreshing ? <CircularProgress size={20} /> : <RefreshIcon />}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Main content card - FIXED: Remove fixed height, allow content to scroll properly */}
          <Box sx={{
            flexGrow: 1,
            overflow: "auto", // This is the only scrollable container
            px: { xs: 2, sm: 3, md: 4 },
            pb: { xs: 2, sm: 3, md: 4 },
          }}>
            <Paper
              elevation={0}
              sx={{
                bgcolor: "white",
                borderRadius: 4,
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                p: { xs: 2, sm: 3, md: 4 },
                mb: 4,
                height: "auto", // FIXED: Remove fixed height to prevent overflow issues
                overflow: "visible", // FIXED: Allow content to be visible
              }}
            >
              {/* Card grid - FIXED: Improved grid spacing and alignment */}
              <Grid 
                container 
                spacing={4} 
                justifyContent={{ xs: "center", md: "flex-start" }}
                sx={{ mt: 0 }}
              >
                {platformsData.map((card, idx) => (
                  <Grid item key={idx} xs={12} sm={6} md={4} lg={4} xl={3}>
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ 
                        duration: 0.5, 
                        delay: 0.2 + idx * 0.1,
                        type: "spring",
                        stiffness: 100
                      }}
                      style={{ 
                        display: "flex", 
                        justifyContent: "center" // FIXED: Center the card
                      }}
                    >
                      <motion.div
                        whileHover={{ 
                          scale: 1.05, 
                          y: -8,
                          transition: { duration: 0.2 }
                        }}
                        whileTap={{ scale: 0.98 }}
                        style={{ width: "100%" }} // FIXED: Ensure consistent width
                      >
                        <Card
                          sx={{
                            width: "100%", // FIXED: Use 100% width to be responsive
                            maxWidth: 320, // FIXED: Add max width for larger screens
                            height: 370,
                            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
                            transition: "all 0.3s ease",
                            borderRadius: 4,
                            position: "relative",
                            overflow: "visible",
                            margin: "0 auto", // FIXED: Center the card
                          }}
                        >
                          {/* Gradient header */}
                          <Box
                            sx={{
                              height: 100,
                              background: card.gradient,
                              borderTopLeftRadius: 16,
                              borderTopRightRadius: 16,
                            }}
                          />

                          {/* Circular logo with animation - FIXED: Improved positioning */}
                          <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ 
                              delay: 0.3 + idx * 0.1,
                              type: "spring",
                              stiffness: 200
                            }}
                            style={{
                              position: "absolute",
                              top: 60,
                              left: "25%", // FIXED: Center properly
                              transform: "translateX(-50%)",
                            }}
                          >
                            <Avatar
                              src={card.image}
                              alt={card.title}
                              sx={{
                                width: 80,
                                height: 80,
                                border: "4px solid white",
                                bgcolor: "white",
                                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                                p: 1,
                                "& .MuiAvatar-img": {
                                  objectFit: "contain",
                                  width: "110%",
                                  height: "110%"
                                }
                              }}
                            />
                          </motion.div>

                          <CardContent sx={{ 
                            mt: 6, 
                            pt: 2, 
                            textAlign: "center", 
                            height: "calc(100% - 160px)", 
                            display: "flex", 
                            flexDirection: "column",
                            position: "relative" 
                          }}>
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.4 + idx * 0.1 }}
                            >
                              <Typography
                                variant="h6"
                                color="#1c444d"
                                component="div"
                                sx={{ fontWeight: 600, mb: 1 }}
                              >
                                {card.title}
                              </Typography>
                            </motion.div>
                            
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.5 + idx * 0.1 }}
                            >
                              <Typography
                                variant="body2"
                                color="#555555"
                                sx={{ mb: 3, px: 0.5 }}
                              >
                                {card.description}
                              </Typography>
                            </motion.div>
                            
                            <Box sx={{ flexGrow: 1 }} />
                            
                            {/* Online status indicator */}
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.5 + idx * 0.1 }}
                            >
                              <Box 
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  mb: 2
                                }}
                              >
                                {isLoading ? (
                                  <CircularProgress size={16} sx={{ mr: 1 }} />
                                ) : card.isOnline ? (
                                  <Chip
                                    icon={<WifiIcon fontSize="small" />}
                                    label="Online"
                                    size="small"
                                    sx={{
                                      bgcolor: 'rgba(76, 175, 80, 0.1)',
                                      color: '#388e3c',
                                      fontWeight: 500,
                                      '& .MuiChip-icon': {
                                        color: '#388e3c'
                                      }
                                    }}
                                  />
                                ) : (
                                  <Chip
                                    icon={<WifiOffIcon fontSize="small" />}
                                    label="Offline"
                                    size="small"
                                    sx={{
                                      bgcolor: 'rgba(244, 67, 54, 0.1)',
                                      color: '#d32f2f',
                                      fontWeight: 500,
                                      '& .MuiChip-icon': {
                                        color: '#d32f2f'
                                      }
                                    }}
                                  />
                                )}
                              </Box>
                            </motion.div>
                            
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Button
                                variant="contained"
                                sx={{
                                  borderRadius: 8,
                                  px: 5,
                                  py: 1,
                                  textTransform: "none",
                                  background: card.gradient,
                                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                                  fontWeight: 500,
                                  alignSelf: "center",
                                  fontSize: "1rem",
                                  minWidth: "120px",
                                  mb: 2
                                }}
                                onClick={() => handleCardClick(card.url)}
                              >
                                Visit
                              </Button>
                            </motion.div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Box>
        </motion.div>
      </Box>
    </Box>
  );
}

export default OtherPlatform;
