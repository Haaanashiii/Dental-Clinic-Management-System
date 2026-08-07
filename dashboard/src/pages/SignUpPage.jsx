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
import LogoColored from "../assets/LOGO-COLORED.png";
import "./SignUpPage.css";

const SignUpPage = ({ setIsAuthenticated, setUserRole }) => {
  const [userForm, setUserForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Password validation for sign up
  const passwordRequirements = {
    minLength: 8,
    hasUppercase: /[A-Z]/,
    hasNumber: /[0-9]/,
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/
  };
  const isPasswordValid =
    userForm.password.length >= passwordRequirements.minLength &&
    passwordRequirements.hasUppercase.test(userForm.password) &&
    passwordRequirements.hasNumber.test(userForm.password) &&
    passwordRequirements.hasSpecial.test(userForm.password);

  const handleSignUp = async () => {
    try {
      const userFormWithRole = { ...userForm, role: "patient" };

      const signUpResponse = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/signup`, userFormWithRole);

      if (signUpResponse.data.success) {
        navigate("/sign-in");
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
        {/* Left Panel - Sign Up Form */}
        <div className="login-form-panel">
          <div className="login-header">
            <img src={LogoColored} alt="Dental Logo" className="login-logo" />
            <h2>Sign Up</h2>
            <p className="login-subtitle">Create your account to get started</p>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <div className="input-group">
            <TextField
              variant="outlined"
              fullWidth
              placeholder="Name"
              value={userForm.name}
              onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <span role="img" aria-label="user" className="input-icon">👤</span>
                  </InputAdornment>
                ),
              }}
            />
          </div>

          <div className="input-group">
            <TextField
              variant="outlined"
              fullWidth
              placeholder="Username"
              value={userForm.username}
              onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <span role="img" aria-label="id" className="input-icon">🆔</span>
                  </InputAdornment>
                ),
              }}
            />
          </div>

          <div className="input-group">
            <TextField
              variant="outlined"
              fullWidth
              placeholder="Email"
              value={userForm.email}
              onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <span role="img" aria-label="email" className="input-icon">✉️</span>
                  </InputAdornment>
                ),
              }}
            />
          </div>
          
          <div className="input-group">
            <FormControl fullWidth variant="outlined">
              <OutlinedInput
                type={showPassword ? "text" : "password"}
                value={userForm.password}
                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                placeholder="Password"
                startAdornment={
                  <InputAdornment position="start">
                    <span role="img" aria-label="lock" className="input-icon">🔒</span>
                  </InputAdornment>
                }
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
                error={userForm.password && !isPasswordValid}
              />
              {userForm.password && !isPasswordValid && (
                <span className="password-error">
                  Password must be at least 8 characters, include a capital letter, a number, and a special character.
                </span>
              )}
            </FormControl>
          </div>
          
          <Button variant="contained" className="login-button" onClick={handleSignUp} disabled={!isPasswordValid}>
            SIGN UP
          </Button>
          
          <div className="links-container">
            <span>Already have an account? </span>
            <a href="/sign-in" className="signup-link">Login here</a>
          </div>
        </div>
        
        {/* Right Panel - Welcome */}
        <div className="welcome-panel">
          <div className="welcome-content">
            <h1>Join Us Today!</h1>
            <p>Create an account to manage your dental appointments and records conveniently.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
