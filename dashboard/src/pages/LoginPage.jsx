import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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

function LoginPage({ setIsAuthenticated, setUserRole }) {
  const navigate = useNavigate();
  const [userForm, setUserForm] = useState({ emailOrUsername: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    const { emailOrUsername, password } = userForm;
    const isEmail = emailOrUsername.includes("@");

    try {
      const response = await axios.post("http://192.168.0.130:1337/auth/login", {
        email: isEmail ? emailOrUsername.toLowerCase().trim() : "",
        username: !isEmail ? emailOrUsername.trim() : "",
        password,
      });

      if (response.data.message === "Login successful") {
        const { authToken, role, userId, email } = response.data;

        sessionStorage.setItem("authToken", authToken);
        sessionStorage.setItem("userId", userId);
        sessionStorage.setItem("email", email);
        sessionStorage.setItem("role", role);

        setUserRole(role);
        setIsAuthenticated(true);

        if (role === "patient") {
          navigate("/");
        } else {
          navigate("/ManageAppointment");
        }
      } else {
        setError(response.data.message || "Invalid login");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || "An error occurred. Please try again.");
    }
  };

  return (
    <div className="LoginMain">
      <div className="LoginContent">
        <h2>Login</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}

        <TextField
          label="Email or Username"
          variant="outlined"
          fullWidth
          margin="dense"
          value={userForm.emailOrUsername}
          onChange={(e) => setUserForm({ ...userForm, emailOrUsername: e.target.value })}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <span role="img" aria-label="user">👤</span>
              </InputAdornment>
            )
          }}
        />

        <FormControl fullWidth margin="dense" variant="outlined">
          <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
          <OutlinedInput
            id="outlined-adornment-password"
            type={showPassword ? "text" : "password"}
            value={userForm.password}
            onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
            startAdornment={
              <InputAdornment position="start">
                <span role="img" aria-label="lock">🔒</span>
              </InputAdornment>
            }
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

        <a href="/SignUpPage">No account? Click here to Sign up!</a>
        <Button variant="contained" color="primary" fullWidth onClick={handleLogin}>
          Login
        </Button>
      </div>
    </div>
  );
}

export default LoginPage;
