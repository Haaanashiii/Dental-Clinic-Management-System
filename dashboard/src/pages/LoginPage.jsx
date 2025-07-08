import React, { useState, useEffect } from "react";
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
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { Visibility, VisibilityOff, EmailOutlined, LockOutlined, KeyOutlined, VpnKeyOutlined } from "@mui/icons-material";
import "./LoginPage.css";
import LogoColored from "../assets/LOGO-COLORED.png";
import DentalLogo from "../assets/DentalLogo.png";

// AnimatedTagline animates each letter smoothly and centers the text
function AnimatedTagline() {
  const text = "Your smile, Our Passion!";
  const [visibleCount, setVisibleCount] = useState(0);
  useEffect(() => {
    if (visibleCount < text.length) {
      const timer = setTimeout(() => setVisibleCount(visibleCount + 1), 55);
      return () => clearTimeout(timer);
    }
  }, [visibleCount, text.length]);
  return (
    <div
      className="animated-tagline"
      style={{
        minHeight: 36,
        marginBottom: 4,
        marginTop: -4,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
      }}
    >
      {text.split("").map((char, idx) => (
        <span
          key={idx}
          style={{
            opacity: idx < visibleCount ? 1 : 0,
            transform: idx < visibleCount ? 'translateY(0)' : 'translateY(10px)',
            transition: 'opacity 0.25s cubic-bezier(.4,2,.6,1), transform 0.25s cubic-bezier(.4,2,.6,1)',
            fontWeight: 700,
            fontSize: 19,
            color: 'var(--primary-color, #1eb2a6)',
            letterSpacing: 0.5,
            display: 'inline-block',
            marginRight: char === ' ' ? 4 : 0,
            whiteSpace: 'pre',
            textShadow: '0 1px 6px rgba(30,178,166,0.10), 0 1px 2px rgba(0,0,0,0.08)',
          }}
        >
          {char}
        </span>
      ))}
    </div>
  );
}

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
  const [rememberMe, setRememberMe] = useState(false);
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [pendingLogin, setPendingLogin] = useState(null); // store login info for OTP step

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
        const { authToken, role, userId, email, username, name, isFirstLogin } = response.data;
        // Check rememberMe flag in localStorage
        const rememberKey = `rememberMe_${email || username}`;
        const isRemembered = localStorage.getItem(rememberKey) === "true";
        if ((typeof isFirstLogin !== 'undefined' && isFirstLogin === true) || !isRemembered) {
          // Require OTP only, not password reset
          setPendingLogin({ authToken, role, userId, email, username, name });
          setOtpDialogOpen(true);
          // Send OTP to user (only if email is present)
          if (email) {
            await axios.post(`${import.meta.env.VITE_API_BASE_URL}/otp/request-otp`, { email });
          } else {
            setError("OTP can only be sent to a valid email address. Please use your email to log in.");
            setOtpDialogOpen(false);
            return;
          }
          return;
        }
        // No OTP needed, proceed
        sessionStorage.setItem("authToken", authToken);
        sessionStorage.setItem("userId", userId);
        sessionStorage.setItem("email", email);
        sessionStorage.setItem("role", role);
        sessionStorage.setItem("username", username);
        sessionStorage.setItem("name", name);
        setUserRole(role);
        setIsAuthenticated(true);
        if (rememberMe) localStorage.setItem(rememberKey, "true");
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

  // OTP dialog handlers
  const handleOtpVerify = async () => {
    setOtpLoading(true);
    setOtpError("");
    try {
      // Only verify OTP using email
      if (!pendingLogin?.email) {
        setOtpError("OTP verification requires a valid email.");
        setOtpLoading(false);
        return;
      }
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/otp/verify-otp`, {
        email: pendingLogin.email,
        otp: otpValue,
        checkOnly: true, // Only verify OTP, do not reset password
      });
      // OTP success, finish login
      const { authToken, role, userId, email, username, name } = pendingLogin;
      sessionStorage.setItem("authToken", authToken);
      sessionStorage.setItem("userId", userId);
      sessionStorage.setItem("email", email);
      sessionStorage.setItem("role", role);
      sessionStorage.setItem("username", username);
      sessionStorage.setItem("name", name);
      setUserRole(role);
      setIsAuthenticated(true);
      const rememberKey = `rememberMe_${email || username}`;
      if (rememberMe) localStorage.setItem(rememberKey, "true");
      setOtpDialogOpen(false);
      setOtpValue("");
      setPendingLogin(null);
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
    } catch (err) {
      setOtpError(err.response?.data?.message || "Invalid OTP.");
    } finally {
      setOtpLoading(false);
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
        {/* Left Panel - Form */}
        <div className="login-form-panel">
          <div className="login-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', marginBottom: 8 }}>
              <img src={LogoColored} alt="Dental Logo Colored" className="login-logo" style={{ height: 56, width: 'auto' }} />
              {/* <img src={DentalLogo} alt="Dental Logo" className="login-logo" style={{ height: 48, width: 'auto' }} /> */}
            </div>
            <h2>Hello!</h2>
            <p className="login-subtitle">Sign in to your account</p>
          </div>

          {/* Animated tagline below header */}
          <AnimatedTagline />

          {error && <div className="error-message">{error}</div>}
          
          <div className="input-group">
            <TextField
              variant="outlined"
              fullWidth
              value={userForm.emailOrUsername}
              onChange={(e) => setUserForm({ ...userForm, emailOrUsername: e.target.value })}
              placeholder="Email or Username"
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
              />
            </FormControl>
          </div>
          
          <div className="remember-forgot">
            <FormControlLabel
              control={<Checkbox checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />}
              label="Remember Me"
              className="remember-me"
            />
            <a
              href="#"
              className="forgot-link"
              onClick={e => {
                e.preventDefault();
                handleForgotOpen();
              }}
            >
              Forgot password?
            </a>
          </div>
          
          <Button variant="contained" className="login-button" onClick={handleLogin}>
            LOGIN
          </Button>
          
          <div className="links-container">
            <span>Don't have an account? </span>
            <a href="/SignUpPage" className="signup-link">Sign up</a>
          </div>
        </div>
        
        {/* Right Panel - Welcome */}
        <div className="welcome-panel">
          <div className="welcome-content">
            <h1>Welcome Back!</h1>
            <p>Access your dental records and appointments from anywhere.</p>
          </div>
        </div>
      </div>
      
      {/* Enhanced OTP Dialog for login verification */}
      <Dialog 
        open={otpDialogOpen} 
        onClose={() => setOtpDialogOpen(false)} 
        maxWidth="xs" 
        fullWidth 
        className="auth-dialog"
      >
        <DialogTitle className="dialog-header">
          <h2 className="dialog-title">Security Verification</h2>
        </DialogTitle>
        <DialogContent className="dialog-content">
          <div className="dialog-icon">
            <div className="icon-circle">
              <VpnKeyOutlined />
            </div>
          </div>
          <p className="dialog-subtitle">
            Please enter the verification code sent to 
            <strong> {pendingLogin?.email}</strong>
          </p>
          <TextField
            label="Verification Code"
            fullWidth
            variant="outlined"
            value={otpValue}
            onChange={e => setOtpValue(e.target.value)}
            disabled={otpLoading}
            placeholder="Enter 6-digit code"
            inputProps={{ maxLength: 6 }}
          />
          {otpError && <div className="dialog-error">{otpError}</div>}
        </DialogContent>
        <DialogActions className="dialog-actions">
          <Button onClick={() => setOtpDialogOpen(false)} disabled={otpLoading} className="dialog-cancel">
            Cancel
          </Button>
          <Button 
            onClick={handleOtpVerify} 
            disabled={otpLoading || !otpValue} 
            className="dialog-action"
          >
            {otpLoading ? <CircularProgress size={20} /> : "Verify"}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Enhanced Forgot Password Dialog */}
      <Dialog 
        open={forgotOpen} 
        onClose={handleForgotClose} 
        maxWidth="xs" 
        fullWidth 
        className="auth-dialog"
      >
        <DialogTitle className="dialog-header">
          <h2 className="dialog-title">Forgot Password</h2>
          <div className="stepper-container">
            <div className="custom-stepper">
              <div className={`step-item ${forgotStep >= 0 ? 'active' : ''}`}>
                <div className="step-number">{forgotStep > 0 ? '✓' : '1'}</div>
                <div className="step-label">Email</div>
              </div>
              <div className="step-line"></div>
              <div className={`step-item ${forgotStep >= 1 ? 'active' : ''}`}>
                <div className="step-number">{forgotStep > 1 ? '✓' : '2'}</div>
                <div className="step-label">Verification</div>
              </div>
              <div className="step-line"></div>
              <div className={`step-item ${forgotStep >= 2 ? 'active' : ''}`}>
                <div className="step-number">3</div>
                <div className="step-label">New Password</div>
              </div>
            </div>
          </div>
        </DialogTitle>

        <DialogContent className="dialog-content">
          {forgotStep === 0 && (
            <>
              <div className="dialog-icon">
                <div className="icon-circle">
                  <EmailOutlined />
                </div>
              </div>
              <p className="dialog-subtitle">
                Enter your email address to receive a verification code
              </p>
              <TextField
                label="Email Address"
                type="email"
                fullWidth
                variant="outlined"
                value={forgotEmail}
                onChange={e => setForgotEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={forgotLoading || forgotBlockTimer > 0}
              />
              {forgotBlockTimer > 0 && (
                <div className="dialog-timer">
                  <span className="timer-icon">⏱</span> 
                  Too many attempts. Try again in {forgotBlockTimer}s
                </div>
              )}
              {forgotError && <div className="dialog-error">{forgotError}</div>}
            </>
          )}

          {forgotStep === 1 && (
            <>
              <div className="dialog-icon">
                <div className="icon-circle">
                  <VpnKeyOutlined />
                </div>
              </div>
              <p className="dialog-subtitle">
                Enter the verification code sent to <strong>{forgotEmail}</strong>
              </p>
              <TextField
                label="Verification Code"
                fullWidth
                variant="outlined"
                value={forgotOtp}
                onChange={e => setForgotOtp(e.target.value)}
                placeholder="Enter 6-digit code"
                inputProps={{ maxLength: 6 }}
                disabled={forgotLoading || forgotOtpTimer <= 0}
              />
              {forgotOtpTimer > 0 ? (
                <div className="dialog-timer">
                  <span className="timer-icon">⏱</span> 
                  Code expires in {forgotOtpTimer}s
                </div>
              ) : (
                <div className="dialog-error">Code expired. Please request again.</div>
              )}
              {forgotError && <div className="dialog-error">{forgotError}</div>}
            </>
          )}

          {forgotStep === 2 && (
            <>
              <div className="dialog-icon">
                <div className="icon-circle">
                  <LockOutlined />
                </div>
              </div>
              <p className="dialog-subtitle">
                Create a new password for your account
              </p>
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
                {isSamePassword && <span className="password-error">New password must be different from the old password.</span>}
              </FormControl>
              <FormControl fullWidth margin="dense" variant="outlined" sx={{ mt: 2 }}>
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
              {forgotError && <div className="dialog-error">{forgotError}</div>}
            </>
          )}
        </DialogContent>

        <DialogActions className="dialog-actions">
          <Button onClick={handleForgotClose} disabled={forgotLoading} className="dialog-cancel">
            Cancel
          </Button>
          {forgotStep === 0 && (
            <Button 
              onClick={handleForgotNext} 
              disabled={forgotLoading || !forgotEmail || forgotBlockTimer > 0} 
              className="dialog-action"
            >
              {forgotLoading ? <CircularProgress size={20} /> : "Send Code"}
            </Button>
          )}
          {forgotStep === 1 && (
            <Button 
              onClick={handleForgotNext} 
              disabled={forgotLoading || !forgotOtp || forgotOtpTimer <= 0} 
              className="dialog-action"
            >
              {forgotLoading ? <CircularProgress size={20} /> : "Verify"}
            </Button>
          )}
          {forgotStep === 2 && (
            <Button 
              onClick={handleForgotNext} 
              disabled={forgotLoading || !forgotNewPassword || !forgotConfirmPassword || isSamePassword} 
              className="dialog-action"
            >
              {forgotLoading ? <CircularProgress size={20} /> : "Reset Password"}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default LoginPage;
