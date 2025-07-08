import React, { useEffect, useState } from "react";
import api from '../api';
import { Box, Typography, TextField, Button, Avatar, Modal, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import ClientSidebar from "./UserPannel/ClientSidebar";
import "./ManageProfilePage.css";
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import EditIcon from '@mui/icons-material/Edit';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import UploadIcon from '@mui/icons-material/Upload';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
// Import motion components from framer-motion
import { motion, AnimatePresence } from "framer-motion";

// Content animation variants
const contentVariants = {
  initial: { opacity: 0, x: 20, y: 10 },
  animate: { opacity: 1, x: 0, y: 0 },
  exit: { opacity: 0, x: -20, y: 10 }
};

const ManageProfilePage = () => {
  const userId = sessionStorage.getItem("userId");
  const role = sessionStorage.getItem("role");
  const [profile, setProfile] = useState(null);
  const [userDetails, setUserDetails] = useState({});
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const [openUserModal, setOpenUserModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const token = sessionStorage.getItem("authToken");
      if (!token) return;

      try {
        // Get user info
        const userRes = await api.get(`${import.meta.env.VITE_API_BASE_URL}/auth/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserDetails(userRes.data);

        // Get profile based on role
        const profileUrl = `${import.meta.env.VITE_API_BASE_URL}/${role}/profile/user/${userId}`;
        const profileRes = await api.get(profileUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(profileRes.data);
      } catch (err) {
        if (err.response?.status === 404) {
          setProfile(null);
        } else {
          console.error("Error loading profile:", err);
        }
      }
    };

    if (userId && role) fetchData();
  }, [userId, role]);

  const getImageSrc = (image) => {
    if (!image) return "";
    return image.startsWith("data:image") ? image : `data:image/png;base64,${image}`;
  };

  const getCurrentDate = () => {
    const today = new Date();
    const options = { 
      weekday: 'short', 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    };
    return today.toLocaleDateString('en-US', options);
  };

  return (
    <div className="ManageProfilePage">
      <ClientSidebar />
      <motion.div 
        className="profile-container"
        variants={contentVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* Header Section with animation */}
        <motion.div 
          className="profile-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <motion.h1 
            className="profile-welcome"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            Welcome, {profile?.name || userDetails.username || 'User'}
          </motion.h1>
          <motion.p 
            className="profile-date"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            {getCurrentDate()}
          </motion.p>
        </motion.div>

        {/* Main Content with animation */}
        <motion.div 
          className="profile-content-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {/* Row 1: Profile Information */}
          <motion.div 
            className="profile-info-section"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <motion.div 
              className="profile-avatar-section"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.6 }}
            >
              <Avatar
                className="profile-avatar"
                alt="Profile"
                src={getImageSrc(profile?.profileImage)}
                sx={{ width: 90, height: 90 }}
              />
              <div className="profile-basic-info">
                <motion.h2 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.7 }}
                >
                  {profile?.name || userDetails.username || 'No Name Set'}
                </motion.h2>
                <motion.p 
                  className="email"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.8 }}
                >
                  {userDetails.email}
                </motion.p>
                <motion.p 
                  className="role-username"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.9 }}
                >
                  {role && role.charAt(0).toUpperCase() + role.slice(1)}
                  <span className="divider">|</span>
                  {userDetails.username}
                </motion.p>
              </div>
              
              {/* Animated edit profile button */}
              <motion.button 
                className="edit-profile-btn"
                onClick={() => setOpenProfileModal(true)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                {profile ? "Edit User Profile" : "Create Profile"}
              </motion.button>
            </motion.div>

            {/* Profile Form with staggered animations */}
            <motion.div 
              className="profile-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              {/* First Row - Fields fade in with staggered delay */}
              <motion.div 
                className="form-group"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <label className="form-label">Full Name</label>
                <input 
                  className="form-input" 
                  type="text" 
                  value={profile?.name || ""} 
                  placeholder="Your Full Name"
                  readOnly
                />
              </motion.div>
              
              <motion.div 
                className="form-group"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.85 }}
              >
                <label className="form-label">Username</label>
                <input 
                  className="form-input" 
                  type="text" 
                  value={userDetails.username || ""} 
                  placeholder="Your Username"
                  readOnly
                />
              </motion.div>

              <motion.div 
                className="form-group"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                <label className="form-label">Birth Date</label>
                <input 
                  className="form-input" 
                  type="date" 
                  value={profile?.birthdate?.split("T")[0] || ""} 
                  readOnly
                />
              </motion.div>
              
              {/* Second Row */}
              <motion.div 
                className="form-group"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.95 }}
              >
                <label className="form-label">Contact Number</label>
                <input 
                  className="form-input" 
                  type="text" 
                  value={profile?.contactNumber || ""} 
                  placeholder="Your Contact Number"
                  readOnly
                />
              </motion.div>

              <motion.div 
                className="form-group"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.0 }}
              >
                <label className="form-label">Role</label>
                <input 
                  className="form-input" 
                  type="text" 
                  value={role || ""} 
                  readOnly
                />
              </motion.div>

              {/* Full width address */}
              <motion.div 
                className="form-group full-width"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.05 }}
              >
                <label className="form-label">Address</label>
                <input 
                  className="form-input" 
                  type="text" 
                  value={profile?.address || ""} 
                  placeholder="Your Address"
                  readOnly
                />
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Row 2: User Credentials */}
          <motion.div 
            className="profile-credentials-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.6 }}
          >
            <motion.div 
              className="email-section"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.7 }}
            >
              {/* New combined header with title and button on same line */}
              <div className="credentials-header">
                <motion.h3 
                  className="credentials-title"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.8 }}
                >
                  User Credentials
                </motion.h3>
                
                <div className="credentials-edit-button">
                  <motion.button 
                    className="credential-edit-btn"
                    onClick={() => setOpenUserModal(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Edit User Credentials
                  </motion.button>
                </div>
              </div>
              
              {/* Username with MUI icon */}
              <motion.div 
                className="email-item"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.9 }}
              >
                <div className="email-icon username-icon">
                  <PersonIcon sx={{ color: 'white', fontSize: 16 }} />
                </div>
                <div className="email-details">
                  <p className="email-address">{userDetails.username}</p>
                  <p className="email-time">Username</p>
                </div>
              </motion.div>
              
              {/* Email with MUI icon */}
              <motion.div 
                className="email-item"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 1.0 }}
              >
                <div className="email-icon">
                  <EmailIcon sx={{ color: 'white', fontSize: 16 }} />
                </div>
                <div className="email-details">
                  <p className="email-address">{userDetails.email}</p>
                  <p className="email-time">Primary email</p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Profile Modal without animations */}
      <AnimatePresence>
        {openProfileModal && (
          <Modal 
            open={openProfileModal} 
            onClose={() => setOpenProfileModal(false)}
            BackdropProps={{ style: { backgroundColor: 'rgba(15, 23, 42, 0.4)' } }}
          >
            <Box className="modal-box">
              <div className="modal-header">
                <h2>
                  <EditIcon sx={{ fontSize: 20, mr: 1 }} />
                  {profile ? "Edit Profile" : "Create Profile"}
                </h2>
              </div>
              <div className="modal-body">
                <EditProfileForm
                  profile={profile}
                  setProfile={setProfile}
                  userId={userId}
                  role={role}
                  onClose={() => setOpenProfileModal(false)}
                  getImageSrc={getImageSrc}
                />
              </div>
            </Box>
          </Modal>
        )}
      </AnimatePresence>

      {/* User Modal without animations */}
      <AnimatePresence>
        {openUserModal && (
          <Modal 
            open={openUserModal} 
            onClose={() => setOpenUserModal(false)}
            BackdropProps={{ style: { backgroundColor: 'rgba(15, 23, 42, 0.4)' } }}
          >
            <Box className="modal-box">
              <div className="modal-header">
                <h2>
                  <EditIcon sx={{ fontSize: 20, mr: 1 }} />
                  Edit User Details
                </h2>
              </div>
              <div className="modal-body">
                <EditUserForm
                  userDetails={userDetails}
                  setUserDetails={setUserDetails}
                  userId={userId}
                  onClose={() => setOpenUserModal(false)}
                />
              </div>
            </Box>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

const EditProfileForm = ({ profile, setProfile, userId, role, onClose, getImageSrc }) => {
  const [formData, setFormData] = useState({
    name: "",
    birthdate: "",
    address: "",
    contactNumber: "",
    profilePicture: "",
  });
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        birthdate: profile.birthdate || "",
        address: profile.address || "",
        contactNumber: profile.contactNumber || "",
        profilePicture: profile.profileImage || "",
      });
      setPreviewImage(profile.profileImage ? getImageSrc(profile.profileImage) : null);
    }
  }, [profile, getImageSrc]); // Add getImageSrc to dependency array

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result; // This is a string
        setPreviewImage(dataUrl);
        // Store the data URL string instead of the File object
        setFormData({
          ...formData,
          profilePicture: dataUrl // Store the string, not the File object
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    const token = sessionStorage.getItem("authToken");
    const endpointCheck = `${import.meta.env.VITE_API_BASE_URL}/${role}/profile/user/${userId}`;

    try {
      let exists = false;
      try {
        await api.get(endpointCheck, {
          headers: { Authorization: `Bearer ${token}` },
        });
        exists = true;
      } catch (err) {
        if (err.response && err.response.status === 404) {
          exists = false;
        } else {
          throw err;
        }
      }

      const method = exists ? "PUT" : "POST";
      const url = method === "POST"
        ? `${import.meta.env.VITE_API_BASE_URL}/${role}/create`
        : `${import.meta.env.VITE_API_BASE_URL}/${role}/profile/${userId}`;

      const base64Data = formData.profilePicture?.startsWith("data:image")
        ? formData.profilePicture.replace(/^data:image\/\w+;base64,/, "")
        : "";

      const payload = method === "POST"
        ? {
            userId,
            name: formData.name,
            birthdate: formData.birthdate,
            address: formData.address,
            contactNumber: formData.contactNumber,
            profileImage: base64Data ? `data:image/png;base64,${base64Data}` : "",
          }
        : {
            name: formData.name,
            birthdate: formData.birthdate,
            address: formData.address,
            contactNumber: formData.contactNumber,
            profileImage: base64Data ? `data:image/png;base64,${base64Data}` : "",
          };

      const res = await api({
        method,
        url,
        data: payload,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 200) {
        alert("Profile saved successfully!");
        setProfile(res.data);
        onClose();
      }
    } catch (err) {
      console.error("Error saving profile:", err);
      alert("An error occurred while saving the profile.");
    }
  };

  return (
    <>
      <div className="photo-upload-container">
        <div className="avatar-upload">
          <div className="avatar-preview">
            {previewImage || profile?.profileImage ? (
              <img 
                src={previewImage || getImageSrc(profile?.profileImage)} 
                alt="Profile Preview" 
                className="avatar-preview"
              />
            ) : (
              <AccountCircleIcon style={{ fontSize: 80, color: '#ccc' }} />
            )}
          </div>
          <div className="avatar-edit">
            <input 
              type="file" 
              id="profileImageUpload" 
              className="avatar-input" 
              accept="image/*"
              onChange={handleImageChange}
            />
            <label htmlFor="profileImageUpload">
              <CameraAltIcon fontSize="small" />
            </label>
          </div>
        </div>
        <p className="avatar-label">Profile Photo</p>
        <div className="avatar-options">
          <button 
            type="button" 
            className="avatar-option-btn"
            onClick={() => document.getElementById('profileImageUpload').click()}
          >
            <UploadIcon fontSize="small" />
            Upload Photo
          </button>
          {(previewImage || profile?.profileImage) && (
            <button 
              type="button" 
              className="avatar-option-btn"
              onClick={() => {
                setPreviewImage(null);
                setFormData({
                  ...formData,
                  profilePicture: ""
                });
              }}
            >
              <DeleteOutlineIcon fontSize="small" />
              Remove
            </button>
          )}
        </div>
      </div>
      
      <TextField 
        label="Name" 
        fullWidth 
        margin="normal" 
        value={formData.name} 
        onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
      />
      
      <TextField 
        label="Birthdate" 
        type="date" 
        fullWidth 
        margin="normal" 
        value={formData.birthdate} 
        onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })} 
        InputLabelProps={{ shrink: true }} 
      />
      
      <TextField 
        label="Address" 
        fullWidth 
        margin="normal" 
        value={formData.address} 
        onChange={(e) => setFormData({ ...formData, address: e.target.value })} 
      />
      
      <TextField 
        label="Contact Number" 
        fullWidth 
        margin="normal" 
        value={formData.contactNumber} 
        onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value.replace(/[^\d]/g, "") })} 
      />
      
      <div className="modal-footer">
        <button className="modal-cancel-btn" onClick={onClose}>
          Cancel
        </button>
        <button className="modal-submit-btn" onClick={handleSave}>
          {profile ? "Save Changes" : "Create Profile"}
        </button>
      </div>
    </>
  );
};

const EditUserForm = ({ userDetails, setUserDetails, userId, onClose }) => {
  const [formData, setFormData] = useState(userDetails);

  useEffect(() => {
    setFormData(userDetails);
  }, [userDetails]);

  const handleSave = async () => {
    const token = sessionStorage.getItem("authToken");
    const payload = { userId, ...formData };
    if (!formData.password) delete payload.password;

    try {
      const res = await api.put(`${import.meta.env.VITE_API_BASE_URL}/auth/user/edit`, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.status === 200) {
        alert("User updated!");
        setUserDetails(res.data);
        onClose();
      }
    } catch (err) {
      console.error("Error updating user:", err);
      alert("Failed to update user.");
    }
  };

  return (
    <>
      <TextField 
        label="Username" 
        fullWidth 
        margin="normal" 
        value={formData.username} 
        onChange={(e) => setFormData({ ...formData, username: e.target.value })} 
      />
      
      <TextField 
        label="Email" 
        fullWidth 
        margin="normal" 
        value={formData.email} 
        onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
      />
      
      <TextField 
        label="Password" 
        type="password" 
        fullWidth 
        margin="normal" 
        value={formData.password || ""} 
        onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
        placeholder="Leave blank to keep current password"
      />

      <div className="modal-footer">
        <button className="modal-cancel-btn" onClick={onClose}>
          Cancel
        </button>
        <button className="modal-submit-btn" onClick={handleSave}>
          Save Changes
        </button>
      </div>
    </>
  );
};

export default ManageProfilePage;
