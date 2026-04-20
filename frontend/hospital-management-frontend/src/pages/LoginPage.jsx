import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Box,
  Button,
  Typography,
  TextField,
  IconButton,
  InputAdornment,
  Container,
  Alert,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Home,
  Lock,
  Email,
} from "@mui/icons-material";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import { loginUser } from "../services/authService";
import "../styles/LoginPage.css";
import isTokenExpired from "../utils/isTokenExpired";
import { motion } from "framer-motion";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!email || !password) {
      setMessage("Please enter both email and password.");
      return;
    }

    setLoading(true);
    const credentials = { email, password };
    try {
      const response = await loginUser(credentials);
      console.log("Login response:", response);

      if (isTokenExpired(response.token)) {
        setMessage("Session Expired. Please login again.");
        return;
      }

      if (!response || !response.token) {
        setMessage("Invalid response from server. Please try again.");
        return;
      }

      sessionStorage.setItem("token", response.token);

      sessionStorage.setItem("user", JSON.stringify({
  id: response.patientId || null,
  patientId: response.patientId || null,
  email: response.email || "",
  role: response.role || "",
  firstName: response.firstName || "",
  lastName: response.lastName || "",
}));

      const roleRoutes = {
        ROLE_PATIENT: "/patient/profile",
        ROLE_ADMIN: "/admin/profile",
        ROLE_DOCTOR: "/doctor/profile",
        ROLE_NURSE: "/nurse/profile",
        ROLE_STAFF: "/staff/profile",
      };

      const route = roleRoutes[response.role];
      if (route) {
        navigate(route);
      } else {
        setMessage("Unknown role. Please contact support.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage("Login failed. Please check your credentials or try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Shared TextField styles
  const inputSx = {
    mb: 2,
    "& .MuiOutlinedInput-root": {
      borderRadius: "12px",
      backgroundColor: "#f8fffe",
      "& fieldset": { borderColor: "rgba(10,58,46,0.2)" },
      "&:hover fieldset": { borderColor: "rgba(10,58,46,0.5)" },
      "&.Mui-focused fieldset": { borderColor: "#0a3a2e", borderWidth: "2px" },
    },
    "& .MuiInputLabel-root.Mui-focused": { color: "#0a3a2e" },
    "& .MuiInputAdornment-root .MuiSvgIcon-root": { color: "#0a3a2e", opacity: 0.5 },
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0a3a2e 0%, #0d4d3a 40%, #0f5c45 70%, #1a7a5e 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        py: 6,
      }}
    >
      {/* Background decorative circles */}
      <Box sx={{
        position: "absolute", top: "-10%", right: "-5%",
        width: "500px", height: "500px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(46,204,113,0.08) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <Box sx={{
        position: "absolute", bottom: "-15%", left: "-10%",
        width: "600px", height: "600px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(46,204,113,0.05) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <Container maxWidth="xs" sx={{ position: "relative", zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Brand */}
          <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box sx={{
                width: 42, height: 42, borderRadius: "50%",
                background: "linear-gradient(135deg, #2ecc71, #27ae60)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 20px rgba(46,204,113,0.4)",
              }}>
                <LocalHospitalIcon sx={{ color: "#fff", fontSize: "1.3rem" }} />
              </Box>
              <Box>
                <Typography sx={{
                  fontFamily: '"Playfair Display", serif',
                  fontWeight: 700, fontSize: "1.1rem", color: "#fff", lineHeight: 1.1,
                }}>
                  HEALTH
                </Typography>
                <Typography sx={{ fontSize: "0.6rem", color: "#2ecc71", letterSpacing: "0.15em", fontWeight: 600 }}>
                  CARE
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Card */}
          <Box sx={{
            backgroundColor: "rgba(255,255,255,0.97)",
            borderRadius: "24px",
            p: { xs: 3, md: 4.5 },
            boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
            border: "1px solid rgba(255,255,255,0.2)",
          }}>
            {/* Header */}
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Box sx={{
                width: 56, height: 56,
                borderRadius: "16px",
                background: "rgba(46,204,113,0.12)",
                display: "flex", alignItems: "center", justifyContent: "center",
                mx: "auto", mb: 2,
              }}>
                <Lock sx={{ color: "#0a3a2e", fontSize: "1.8rem" }} />
              </Box>
              <Typography sx={{
                fontFamily: '"Playfair Display", serif',
                fontWeight: 800,
                color: "#0a3a2e",
                fontSize: "1.9rem",
                mb: 0.5,
              }}>
                Welcome Back
              </Typography>
              <Typography sx={{ color: "#888", fontSize: "0.875rem" }}>
                Sign in to your HealthCare account
              </Typography>
            </Box>

            {/* Alert */}
            {message && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: "12px", fontSize: "0.875rem" }}>
                {message}
              </Alert>
            )}

            {/* Form */}
            <form onSubmit={handleLogin}>
              <TextField
                fullWidth
                label="Email"
                variant="outlined"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email />
                    </InputAdornment>
                  ),
                }}
                required
                sx={inputSx}
              />

              <TextField
                fullWidth
                label="Password"
                variant="outlined"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword((p) => !p)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                required
                sx={inputSx}
              />

              {/* Forgot password link */}
              <Box sx={{ textAlign: "right", mt: -1, mb: 2.5 }}>
                <Typography
                  component={Link}
                  to="/forgot-password"
                  sx={{
                    fontSize: "0.8rem",
                    color: "#0a3a2e",
                    textDecoration: "none",
                    fontWeight: 600,
                    "&:hover": { color: "#2ecc71" },
                    transition: "color 0.2s",
                  }}
                >
                  Forgot Password?
                </Typography>
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  background: "linear-gradient(135deg, #0a3a2e, #0f5c45)",
                  color: "#fff",
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: "1rem",
                  py: 1.6,
                  borderRadius: "12px",
                  boxShadow: "0 6px 25px rgba(10,58,46,0.35)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #0d4d3a, #1a7a5e)",
                    boxShadow: "0 8px 30px rgba(10,58,46,0.5)",
                    transform: "translateY(-1px)",
                  },
                  "&:disabled": { opacity: 0.7 },
                  transition: "all 0.25s",
                  mb: 2,
                }}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            {/* Bottom links */}
            <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1.5, mt: 1 }}>
              <Button
                component={Link}
                to="/"
                startIcon={<Home />}
                sx={{
                  flex: 1,
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: "12px",
                  border: "1px solid rgba(10,58,46,0.2)",
                  color: "#0a3a2e",
                  py: 1,
                  fontSize: "0.8rem",
                  "&:hover": {
                    borderColor: "#0a3a2e",
                    backgroundColor: "rgba(10,58,46,0.04)",
                  },
                }}
              >
                Home
              </Button>
              <Button
                component={Link}
                to="/register"
                sx={{
                  flex: 1,
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: "12px",
                  border: "1px solid rgba(10,58,46,0.2)",
                  color: "#0a3a2e",
                  py: 1,
                  fontSize: "0.8rem",
                  "&:hover": {
                    borderColor: "#0a3a2e",
                    backgroundColor: "rgba(10,58,46,0.04)",
                  },
                }}
              >
                Register
              </Button>
            </Box>
          </Box>

          <Typography sx={{ textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: "0.75rem", mt: 3 }}>
            © 2024 HealthCare. All rights reserved.
          </Typography>
        </motion.div>
      </Container>
    </Box>
  );
}

export default LoginPage;