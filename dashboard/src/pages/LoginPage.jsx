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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Box,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import "./LoginPage.css";

function LoginPage({ setIsAuthenticated, setUserRole }) {
  const navigate = useNavigate();
  const [userForm, setUserForm] = useState({ emailOrUsername: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState(0); // 0: email, 1: otp, 2: new password
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotOtpTimer, setForgotOtpTimer] = useState(0);
  const [forgotBlockTimer, setForgotBlockTimer] = useState(0);
  const [isSamePassword, setIsSamePassword] = useState(false);
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [showForgotConfirmPassword, setShowForgotConfirmPassword] = useState(false);

  // Timer for OTP and block
  React.useEffect(() => {
    let timer;
    if (forgotOtpTimer > 0) {
      timer = setTimeout(() => setForgotOtpTimer(forgotOtpTimer - 1), 1000);
    }
    if (forgotBlockTimer > 0) {
      timer = setTimeout(() => setForgotBlockTimer(forgotBlockTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [forgotOtpTimer, forgotBlockTimer]);

  // Check if new password is same as old password
  React.useEffect(() => {
    if (forgotStep === 2 && forgotNewPassword && forgotEmail) {
      axios.post(`${import.meta.env.VITE_API_BASE_URL}/otp/check-password`, {
        email: forgotEmail,
        password: forgotNewPassword,
      })
        .then(res => setIsSamePassword(res.data.isSame))
        .catch(() => setIsSamePassword(false));
    } else {
      setIsSamePassword(false);
    }
  }, [forgotNewPassword, forgotStep, forgotEmail]);

  const handleLogin = async () => {
    const { emailOrUsername, password } = userForm;
    const isEmail = emailOrUsername.includes("@");

    try {
      const response = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/auth/login`,
      {
        email: isEmail ? emailOrUsername.toLowerCase().trim() : "",
        username: !isEmail ? emailOrUsername.trim() : "",
        password,
      }
    );

      if (response.data.message === "Login successful") {
        const { authToken, role, userId, email, username,name } = response.data;

        sessionStorage.setItem("authToken", authToken);
        sessionStorage.setItem("userId", userId);
        sessionStorage.setItem("email", email);
        sessionStorage.setItem("role", role);
        sessionStorage.setItem("username", username); 
        sessionStorage.setItem("name", name);
        setUserRole(role);
        setIsAuthenticated(true);

        if (role === "patient") {
          try {
            const token = sessionStorage.getItem("authToken");
            const profileRes = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/patient/profile/user/${userId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (profileRes.data && profileRes.data.userId) {
              navigate("/"); 
            } else {
              navigate("/ManageProfilePage"); 
            }
          } catch (err) {
            navigate("/ManageProfilePage"); 
          }
        } else {
          navigate("/ManageUser");
        }
      } else {
        setError(response.data.message || "Invalid login");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || "An error occurred. Please try again.");
    }
  };

  const handleForgotOpen = () => {
    setForgotStep(0);
    setForgotOpen(true);
    setForgotEmail("");
    setForgotOtp("");
    setForgotNewPassword("");
    setForgotConfirmPassword("");
    setForgotError("");
    setForgotLoading(false);
    setForgotOtpTimer(0);
    setForgotBlockTimer(0);
  };

  const handleForgotClose = () => {
    setForgotOpen(false);
  };

  const handleForgotNext = async () => {
    setForgotError("");
    if (forgotStep === 0) {
      // Step 1: Send OTP
      setForgotLoading(true);
      try {
        await axios.post(`${import.meta.env.VITE_API_BASE_URL}/otp/request-otp`, { email: forgotEmail });
        setForgotStep(1);
        setForgotOtpTimer(300); // 5 min
      } catch (err) {
        if (err.response?.data?.blockTime) {
          setForgotBlockTimer(err.response.data.blockTime);
          setForgotOpen(false);
        }
        setForgotError(err.response?.data?.message || "Failed to send OTP.");
      } finally {
        setForgotLoading(false);
      }
    } else if (forgotStep === 1) {
      // Step 2: Verify OTP
      setForgotLoading(true);
      try {
        await axios.post(`${import.meta.env.VITE_API_BASE_URL}/otp/verify-otp`, {
          email: forgotEmail,
          otp: forgotOtp,
          checkOnly: true, // Only check OTP, don't reset password yet
        });
        setForgotStep(2);
      } catch (err) {
        setForgotError(err.response?.data?.message || "Invalid OTP.");
      } finally {
        setForgotLoading(false);
      }
    } else if (forgotStep === 2) {
      // Step 3: Reset password
      if (forgotNewPassword !== forgotConfirmPassword) {
        setForgotError("Passwords do not match.");
        return;
      }
      setForgotLoading(true);
      try {
        await axios.post(`${import.meta.env.VITE_API_BASE_URL}/otp/verify-otp`, {
          email: forgotEmail,
          otp: forgotOtp,
          newPassword: forgotNewPassword,
        });
        setForgotOpen(false);
        alert("Password reset successful! You can now log in.");
      } catch (err) {
        setForgotError(err.response?.data?.message || "Error resetting password.");
      } finally {
        setForgotLoading(false);
      }
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

        <a href="/SignUpPage" style={{ display: 'block', marginTop: 8, color: '#1976d2', textAlign: 'center', textDecoration: 'none' }}>
          No account? Click here to Sign up!
        </a>
        <a
          href="#"
          style={{ display: 'block', marginTop: 8, color: '#1976d2', textAlign: 'center', textDecoration: 'none' }}
          onClick={e => {
            e.preventDefault();
            handleForgotOpen();
          }}
        >
          Forgot password? Click here to reset
        </a>
        <Button variant="contained" color="primary" fullWidth onClick={handleLogin}>
          Login
        </Button>
      </div>
      {/* Forgot Password Modal (All Steps) */}
      <Dialog open={forgotOpen} onClose={handleForgotClose} maxWidth="xs" fullWidth PaperProps={{ style: { minHeight: 380 } }}>
        <DialogTitle>
          <Box sx={{ width: '100%', mb: 1 }}>
            <Stepper activeStep={forgotStep} alternativeLabel>
              <Step key={0}><StepLabel>Email</StepLabel></Step>
              <Step key={1}><StepLabel>OTP</StepLabel></Step>
              <Step key={2}><StepLabel>New Password</StepLabel></Step>
            </Stepper>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ minHeight: 120, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {forgotStep === 0 && (
            <>
              <TextField
                label="Email"
                type="email"
                fullWidth
                margin="dense"
                value={forgotEmail}
                onChange={e => setForgotEmail(e.target.value)}
                disabled={forgotLoading || forgotBlockTimer > 0}
              />
              {forgotBlockTimer > 0 && (
                <p style={{ color: 'red' }}>Too many attempts. Try again in {forgotBlockTimer}s.</p>
              )}
              {forgotError && <p style={{ color: 'red' }}>{forgotError}</p>}
            </>
          )}
          {forgotStep === 1 && (
            <>
              <TextField
                label="OTP"
                fullWidth
                margin="dense"
                value={forgotOtp}
                onChange={e => setForgotOtp(e.target.value)}
                disabled={forgotLoading || forgotOtpTimer <= 0}
              />
              {forgotOtpTimer > 0 ? (
                <p>OTP expires in {forgotOtpTimer}s</p>
              ) : (
                <p style={{ color: 'red' }}>OTP expired. Please request again.</p>
              )}
              {forgotError && <p style={{ color: 'red' }}>{forgotError}</p>}
            </>
          )}
          {forgotStep === 2 && (
            <>
              <FormControl fullWidth margin="dense" variant="outlined">
                <InputLabel htmlFor="forgot-new-password">New Password</InputLabel>
                <OutlinedInput
                  id="forgot-new-password"
                  type={showForgotNewPassword ? "text" : "password"}
                  value={forgotNewPassword}
                  onChange={e => setForgotNewPassword(e.target.value)}
                  disabled={forgotLoading}
                  error={isSamePassword}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowForgotNewPassword(v => !v)}
                        edge="end"
                        tabIndex={-1}
                      >
                        {showForgotNewPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  }
                  label="New Password"
                />
                {isSamePassword && <span style={{ color: 'red', fontSize: 12 }}>New password must be different from the old password.</span>}
              </FormControl>
              <FormControl fullWidth margin="dense" variant="outlined">
                <InputLabel htmlFor="forgot-confirm-password">Confirm Password</InputLabel>
                <OutlinedInput
                  id="forgot-confirm-password"
                  type={showForgotConfirmPassword ? "text" : "password"}
                  value={forgotConfirmPassword}
                  onChange={e => setForgotConfirmPassword(e.target.value)}
                  disabled={forgotLoading}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowForgotConfirmPassword(v => !v)}
                        edge="end"
                        tabIndex={-1}
                      >
                        {showForgotConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  }
                  label="Confirm Password"
                />
              </FormControl>
              {forgotError && <p style={{ color: 'red' }}>{forgotError}</p>}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleForgotClose} disabled={forgotLoading}>Cancel</Button>
          {forgotStep === 0 && (
            <Button onClick={handleForgotNext} disabled={forgotLoading || !forgotEmail || forgotBlockTimer > 0}>
              {forgotLoading ? <CircularProgress size={20} /> : "Send OTP"}
            </Button>
          )}
          {forgotStep === 1 && (
            <Button onClick={handleForgotNext} disabled={forgotLoading || !forgotOtp || forgotOtpTimer <= 0}>
              {forgotLoading ? <CircularProgress size={20} /> : "Verify OTP"}
            </Button>
          )}
          {forgotStep === 2 && (
            <Button onClick={handleForgotNext} disabled={forgotLoading || !forgotNewPassword || !forgotConfirmPassword || isSamePassword}>
              {forgotLoading ? <CircularProgress size={20} /> : "Proceed"}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default LoginPage;
