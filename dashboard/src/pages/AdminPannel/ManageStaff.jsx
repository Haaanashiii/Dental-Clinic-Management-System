/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ClientSidebar from "../UserPannel/ClientSidebar";
import {
  Box, Button, Modal, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TablePagination, TableRow, TextField,
  tableCellClasses, Typography, Card, CardContent, Chip, IconButton,
  Fade, Backdrop, CircularProgress, Snackbar, Alert, Avatar,
  Tooltip, useTheme, alpha
} from "@mui/material";
import { styled } from "@mui/material/styles";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";
import "./ManageDentist.css";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: '#1c444d',
    color: '#ffffff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    textAlign: 'center',
    color: '#1c444d',
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: '#f2fafa',
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

// Content animation variants
const contentVariants = {
  initial: { opacity: 0, x: 20, y: 10 },
  animate: { opacity: 1, x: 0, y: 0 },
  exit: { opacity: 0, x: -20, y: 10 }
};

export default function ManageStaff() {
  const [users, setUsers] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;

  const [userForm, setUserForm] = useState({
    username: "",
    email: "",
    role: "staff",
    password: "",
  });

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/auth/user?role=staff`);
      setUsers(data);
      console.log("Fetched users:", data);
    } catch (error) {
      console.error("ERROR fetching users:", error);
    }
  };

  const handleOpenModal = (user = null) => {
    setIsEditing(!!user);
    setSelectedUser(user);
    if (user) {
      setUserForm({
        username: user.username,
        email: user.email,
        role: "staff",
        password: "", 
      });
    } else {
      setUserForm({ username: "", email: "", role: "staff", password: "" });
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedUser(null);
  };

  const handleSubmit = async () => {
  const { username, email, password } = userForm;
  
  // Ensure username, email are provided and password is required only when creating a user
  if (!username || !email || (!isEditing && !password)) {
    alert("All fields (except password when editing) are required.");
    return;
  }

  try {
    // Prepare data to send
    const updateData = {
      userId: selectedUser?.userId, // Only use selectedUser if editing
      username: userForm.username,
      email: userForm.email,
      role: "staff",
    };

    // Only add password if editing and password field is not empty
    if (password) {
      updateData.password = password;
    }

    if (isEditing) {
      // Send PUT request to update user profile
      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/auth/user/edit`, updateData);
    } else {
      // Send POST request to create new user
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/signup`, updateData);
    }

    // Reload users list and close modal
    fetchUsers();
    handleCloseModal();
  } catch (error) {
    console.error("ERROR submitting user:", error);
    alert("Failed to save user. See console for details.");
  }
};

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/auth/delete/${userId}`);
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/staff/delete/${userId}`);
      fetchUsers();
    } catch (error) {
      console.error("ERROR deleting user:", error);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  return (
    <div className="ManageDentist-dashboard">
      <ClientSidebar />
      <motion.div 
        className="profile-container" // Changed from ManageDentist-content
        variants={contentVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* Header Section with gradient background */}
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
            Staff Management
          </motion.h1>
          <motion.p 
            className="profile-date"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            Create, edit and manage staff accounts
          </motion.p>
        </motion.div>

        {/* Main Content Area */}
        <motion.div 
          className="profile-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <motion.div 
            className="BTNADD"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            style={{ marginTop: 0, marginBottom: 16 }} // Fix positioning
          >
            <Button 
              variant="contained" 
              startIcon={<AddIcon />} 
              onClick={() => handleOpenModal()}
            >
              Add Staff
            </Button>
          </motion.div>
          
          <motion.div 
            className="ManageDentist-table"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <TableContainer component={Paper}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <StyledTableCell>Username</StyledTableCell>
                    <StyledTableCell>Email</StyledTableCell>
                    <StyledTableCell>Role</StyledTableCell>
                    <StyledTableCell align="center">Actions</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user) => (
                    <StyledTableRow key={user.userId}>
                      <StyledTableCell>{user.username}</StyledTableCell>
                      <StyledTableCell>{user.email}</StyledTableCell>
                      <StyledTableCell>{user.role}</StyledTableCell>
                      <StyledTableCell align="center">
                        <Tooltip title="Edit">
                          <IconButton onClick={() => handleOpenModal(user)} size="small">
                            <EditIcon color="primary" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton onClick={() => handleDeleteUser(user.userId)} size="small">
                            <DeleteIcon color="error" />
                          </IconButton>
                        </Tooltip>
                      </StyledTableCell>
                    </StyledTableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={users.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={[]}
            />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Modal animations - Keep the existing code */}
      <AnimatePresence>
        {openModal && (
          <Modal open={openModal} onClose={handleCloseModal}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Box className="professional-modal">
                <div className="modal-header">
                  <h2>{isEditing ? "Edit Staff" : "Add New Staff"}</h2>
                </div>
                
                <div className="modal-body">
                  <TextField
                    label="Username"
                    fullWidth
                    margin="normal"
                    variant="outlined"
                    value={userForm.username}
                    onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                    className="modal-text-field"
                  />
                  <TextField
                    label="Email Address"
                    type="email"
                    fullWidth
                    margin="normal"
                    variant="outlined"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    className="modal-text-field"
                  />
                  <TextField
                    label={isEditing ? "New Password (leave blank to keep current)" : "Password"}
                    type="password"
                    fullWidth
                    margin="normal"
                    variant="outlined"
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    helperText={isEditing ? "Only fill this if you want to change the password" : ""}
                  />
                </div>
                
                <div className="modal-footer">
                  <Button 
                    variant="outlined" 
                    onClick={handleCloseModal}
                    className="modal-cancel-btn"
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="contained" 
                    onClick={handleSubmit}
                    className="modal-submit-btn"
                  >
                    {isEditing ? "Save Changes" : "Add Staff"}
                  </Button>
                </div>
              </Box>
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
