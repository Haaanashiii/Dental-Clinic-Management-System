import React, { useEffect, useState } from "react";
import ClientSidebar from "../UserPannel/ClientSidebar";
import {
  Box, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TablePagination, TableRow
} from "@mui/material";
import { styled } from "@mui/material/styles";
import axios from "axios";
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
      const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/auth/user`);
      setUsers(data);
    } catch (error) {
      console.error("ERROR fetching users:", error);
      toast.error("Failed to fetch users");
    }
  };

  const handleStatusChange = async (userId, status) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/auth/status/${userId}`, { status });
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
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/auth/delete/${userId}`);
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
      <div className="ManageDentist-content">
        <h1>Manage User Accounts</h1>
        <div style={{ marginBottom: "40px" }}>
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
        </div>
        <div className="ManageDentist-table">
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
                    <StyledTableCell>{user.status}</StyledTableCell>
                    <StyledTableCell align="center">
                      {user.status !== "Active" && (
                        <Button
                          size="small"
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
                          color="warning"
                          onClick={() => handleStatusChange(user.userId, "Deactivated")}
                          sx={{ mr: 1 }}
                        >
                          <BlockIcon fontSize="small" />
                        </Button>
                      )}
                      <Button
                        size="small"
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
        </div>
      </div>
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
