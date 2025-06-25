import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Button,
  TextField,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import "./LoginPage.css";

const SignUpPage = ({ setIsAuthenticated, setUserRole }) => {
  const [userForm, setUserForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async () => {
    try {
      const userFormWithRole = { ...userForm, role: "patient" };

      const signUpResponse = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/signup`, userFormWithRole);

      if (signUpResponse.data.success) {
        navigate("/login");
      } else {
        setError(signUpResponse.data.message || "Signup failed.");
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError(err.response?.data?.message || "An error occurred. Please try again.");
    }
  };

  return (
    <div className="LoginMain">
      <div className="LoginContent">
        <h2>Sign Up</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}

        <TextField
          label="Username"
          variant="outlined"
          fullWidth
          margin="dense"
          value={userForm.username}
          onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
        />

        <TextField
          label="Email"
          variant="outlined"
          fullWidth
          margin="dense"
          value={userForm.email}
          onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
        />

        <FormControl fullWidth margin="dense" variant="outlined">
          <InputLabel htmlFor="signup-password">Password</InputLabel>
          <OutlinedInput
            id="signup-password"
            type={showPassword ? "text" : "password"}
            value={userForm.password}
            onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
            endAdornment={
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
            label="Password"
          />
        </FormControl>

        <Button variant="contained" color="primary" fullWidth onClick={handleSignUp}>
          Sign Up
        </Button>
        <a href="/login">Already have an account? Login here!</a>
      </div>
    </div>
  );
};

export default SignUpPage;
