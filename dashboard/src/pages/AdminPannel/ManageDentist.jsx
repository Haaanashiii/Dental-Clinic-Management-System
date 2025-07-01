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

export default function ManageDentist() {
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
      const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/auth/user?role=dentist`);
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
        role: "dentist",
        password: "", // Don't pre-fill the password in case of edit
      });
    } else {
      setUserForm({ username: "", email: "", role: "dentist", password: "" });
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
      role: "dentist",
    };

    // Only add password if editing and password field is not empty
    if (password) {
      updateData.password = password;
    }

    if (isEditing) {
      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/auth/user/edit`, updateData);
    } else {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/signup`, updateData);
    }


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
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/dentist/delete/${userId}`);
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
        className="ManageDentist-content"
        variants={contentVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          Manage Dentist Users
        </motion.h1>
        
        <motion.div 
          className="BTNADD"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Button variant="contained" onClick={() => handleOpenModal()} sx={{ mb: 2 }}>
            Add Dentist
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
                  <StyledTableCell>Specialization</StyledTableCell>
                  <StyledTableCell>Role</StyledTableCell>
                  <StyledTableCell align="center">Actions</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user) => (
                  <StyledTableRow key={user.userId}>
                    <StyledTableCell>{user.username}</StyledTableCell>
                    <StyledTableCell>{user.email}</StyledTableCell>
                    <StyledTableCell>{user.specialization}</StyledTableCell>
                    <StyledTableCell>{user.role}</StyledTableCell>
                    <StyledTableCell align="center">
                      <EditIcon sx={{ cursor: "pointer" }} onClick={() => handleOpenModal(user)} />
                      <DeleteIcon sx={{ cursor: "pointer", ml: 1 }} onClick={() => handleDeleteUser(user.userId)} />
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

      {/* Modal animations */}
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
                  <h2>{isEditing ? "Edit Dentist" : "Add New Dentist"}</h2>
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
                    label="Specialization"
                    fullWidth
                    margin="normal"
                    variant="outlined"
                    value={userForm.specialization}
                    onChange={(e) => setUserForm({ ...userForm, specialization: e.target.value })}
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
                    {isEditing ? "Save Changes" : "Add Dentist"}
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
