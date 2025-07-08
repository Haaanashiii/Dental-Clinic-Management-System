import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ClientSidebar from "../UserPannel/ClientSidebar";
import {
  Box, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TablePagination, TableRow
} from "@mui/material";
import { styled } from "@mui/material/styles";
import api from '../../api';
import DeleteIcon from "@mui/icons-material/Delete";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import BlockIcon from "@mui/icons-material/Block";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./ManageDentist.css";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  "&.MuiTableCell-head": {
    backgroundColor: "#1c444d",
    color: "#ffffff",
    fontWeight: "bold",
    textAlign: "center",
  },
  "&.MuiTableCell-body": {
    fontSize: 14,
    textAlign: "center",
    color: "#1c444d",
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: "#f2fafa",
  },
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

// Content animation variants
const contentVariants = {
  initial: { opacity: 0, x: 20, y: 10 },
  animate: { opacity: 1, x: 0, y: 0 },
  exit: { opacity: 0, x: -20, y: 10 }
};

export default function ManageUser() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;
  const [roleFilter, setRoleFilter] = useState("patient");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get(`${import.meta.env.VITE_API_BASE_URL}/auth/user`);
      setUsers(data);
    } catch (error) {
      console.error("ERROR fetching users:", error);
      toast.error("Failed to fetch users");
    }
  };

  const handleStatusChange = async (userId, status) => {
    try {
      await api.put(`${import.meta.env.VITE_API_BASE_URL}/auth/status/${userId}`, { status });
      fetchUsers();
      toast.success(`User status changed to ${status} successfully!`);
    } catch (error) {
      console.error("ERROR changing status:", error);
      toast.error("Failed to change user status");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await api.delete(`${import.meta.env.VITE_API_BASE_URL}/auth/delete/${userId}`);
      fetchUsers();
      toast.success("User deleted successfully!");
    } catch (error) {
      console.error("ERROR deleting user:", error);
      toast.error("Failed to delete user");
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Filter users by selected role
  const filteredUsers = users.filter(user => user.role === roleFilter);

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
            Manage User Accounts
          </motion.h1>
          <motion.p 
            className="profile-date"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            View and manage patient, staff, and dentist accounts
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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            style={{ marginBottom: "20px" }}
          >
            <Button
              variant={roleFilter === "patient" ? "contained" : "outlined"}
              onClick={() => setRoleFilter("patient")}
              sx={{ mr: 1 }}
            >
              Show Patients
            </Button>
            <Button
              variant={roleFilter === "staff" ? "contained" : "outlined"}
              onClick={() => setRoleFilter("staff")}
              sx={{ mr: 1 }}
            >
              Show Staff
            </Button>
            <Button
              variant={roleFilter === "dentist" ? "contained" : "outlined"}
              onClick={() => setRoleFilter("dentist")}
            >
              Show Dentists
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
                    <StyledTableCell>Status</StyledTableCell>
                    <StyledTableCell align="center">Actions</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user) => (
                    <StyledTableRow key={user.userId}>
                      <StyledTableCell>{user.username}</StyledTableCell>
                      <StyledTableCell>{user.email}</StyledTableCell>
                      <StyledTableCell>{user.role}</StyledTableCell>
                      <StyledTableCell>
                        <Box sx={{
                          display: 'inline-block',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: 'medium',
                          bgcolor: user.status === 'Active' ? '#e8f5e8' : '#fff3cd',
                          color: user.status === 'Active' ? '#2e7d32' : '#856404',
                        }}>
                          {user.status}
                        </Box>
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        {user.status !== "Active" && (
                          <Button
                            size="small"
                            variant="outlined"
                            color="success"
                            onClick={() => handleStatusChange(user.userId, "Active")}
                            sx={{ mr: 1 }}
                          >
                            <ThumbUpIcon fontSize="small" />
                          </Button>
                        )}
                        {user.status !== "Deactivated" && (
                          <Button
                            size="small"
                            variant="outlined"
                            color="warning"
                            onClick={() => handleStatusChange(user.userId, "Deactivated")}
                            sx={{ mr: 1 }}
                          >
                            <BlockIcon fontSize="small" />
                          </Button>
                        )}
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => handleDeleteUser(user.userId)}
                        >
                          <DeleteIcon fontSize="small" />
                        </Button>
                      </StyledTableCell>
                    </StyledTableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={filteredUsers.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={[]}
            />
          </motion.div>
        </motion.div>
      </motion.div>
      
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        toastStyle={{
          backgroundColor: "#1c444d",
          color: "#ffffff",
          fontFamily: "inherit"
        }}
        progressStyle={{
          backgroundColor: "#f2fafa"
        }}
        style={{
          fontSize: "14px"
        }}
      />
    </div>
  );
}
