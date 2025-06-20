/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import ClientSidebar from "../UserFiling/ClientSidebar";
import {
  Box, Button, Modal, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TablePagination, TableRow, TextField,tableCellClasses 
} from "@mui/material";
import { styled } from "@mui/material/styles";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
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

const modalStyle = {
  position: "absolute",
  top: "50%", left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400, bgcolor: "background.paper",
  boxShadow: 24, p: 4,
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
      const { data } = await axios.get("http://localhost:1337/auth/user?role=dentist");
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
      await axios.put("http://localhost:1337/auth/user/edit", updateData);
    } else {
      await axios.post("http://localhost:1337/auth/signup", updateData);
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
      await axios.delete(`http://localhost:1337/auth/delete/${userId}`);
      await axios.delete(`http://localhost:1337/dentist/delete/${userId}`);
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
      <div className="ManageDentist-content">
        <h1>Manage Dentist Users</h1>
        <div className="BTNADD">
          <Button variant="contained" onClick={() => handleOpenModal()} sx={{ mb: 2 }}>
            Add Dentist
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
        </div>
      </div>

      <Modal open={openModal} onClose={handleCloseModal}>
        <Box sx={modalStyle}>
          <h2>{isEditing ? "Edit Dentist" : "Add Dentist"}</h2>
          <TextField
            label="Username"
            fullWidth
            margin="dense"
            value={userForm.username}
            onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
          />
          <TextField
            label="Email"
            fullWidth
            margin="dense"
            value={userForm.email}
            onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="dense"
            value={userForm.password}
            onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
          />
          <Button variant="contained" onClick={handleSubmit}>
            {isEditing ? "Save Changes" : "Add Dentist"}
          </Button>
          <Button variant="outlined" sx={{ ml: 1 }} onClick={handleCloseModal}>Cancel</Button>
        </Box>
      </Modal>
    </div>
  );
}
