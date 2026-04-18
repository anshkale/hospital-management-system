import React, { useState } from "react";
import { Link } from "react-router-dom";
import { registerPatient } from "../services/patientService";
import {
  Box,
  Button,
  Typography,
  Container,
  Alert,
} from "@mui/material";
import { Home, PersonAddAlt1 } from "@mui/icons-material";
import RegisterPatientForm from "../components/common/RegisterPatientForm";
import { validatePatientRegistration } from "../Javascript/patientValidation";
import { motion } from "framer-motion";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";

const RegisterPatient = () => {
  const [patientData, setPatientData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    gender: "",
    dateOfBirth: "",
    address: "",
    city: "",
    state: "",
    country: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPatientData({ ...patientData, [name]: value });
  };

  const validateForm = () => {
    const { errors: newErrors, isValid } = validatePatientRegistration(patientData);
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await registerPatient(patientData);
      setMessage("Patient registered successfully! You can now login.");
      setMessageType("success");
      setPatientData({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        gender: "",
        dateOfBirth: "",
        address: "",
        city: "",
        state: "",
        country: "",
        password: "",
      });
      setErrors({});
    } catch (error) {
      setMessage(error.message);
      setMessageType("error");
    }
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

      <Container maxWidth="sm" sx={{ position: "relative", zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Logo / Brand */}
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
                  Health
                </Typography>
                <Typography sx={{ fontSize: "0.6rem", color: "#2ecc71", letterSpacing: "0.15em", fontWeight: 600 }}>
                  Care
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Card */}
          <Box
            sx={{
              backgroundColor: "rgba(255,255,255,0.97)",
              borderRadius: "24px",
              p: { xs: 3, md: 5 },
              boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            {/* Header */}
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Box sx={{
                width: 56, height: 56,
                borderRadius: "16px",
                background: "rgba(46,204,113,0.12)",
                display: "flex", alignItems: "center", justifyContent: "center",
                mx: "auto", mb: 2,
              }}>
                <PersonAddAlt1 sx={{ color: "#0a3a2e", fontSize: "1.8rem" }} />
              </Box>
              <Typography
                variant="h4"
                sx={{
                  fontFamily: '"Playfair Display", serif',
                  fontWeight: 800,
                  color: "#0a3a2e",
                  fontSize: { xs: "1.6rem", md: "2rem" },
                  mb: 0.5,
                }}
              >
                Create Account
              </Typography>
              <Typography sx={{ color: "#888", fontSize: "0.9rem" }}>
                Join HealthCare as a patient today
              </Typography>
            </Box>

            {/* Alert message */}
            {message && (
              <Alert
                severity={messageType}
                sx={{
                  mb: 3,
                  borderRadius: "12px",
                  fontSize: "0.875rem",
                }}
              >
                {message}
              </Alert>
            )}

            {/* Form — uses your existing RegisterPatientForm */}
            <RegisterPatientForm
              patientData={patientData}
              errors={errors}
              handleChange={handleChange}
              handleSubmit={handleSubmit}
            />

            {/* Bottom nav links */}
            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3, gap: 2 }}>
              <Button
                component={Link}
                to="/"
                variant="outlined"
                startIcon={<Home />}
                sx={{
                  flex: 1,
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: "12px",
                  borderColor: "rgba(10,58,46,0.25)",
                  color: "#0a3a2e",
                  py: 1.2,
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
                to="/login"
                variant="outlined"
                sx={{
                  flex: 1,
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: "12px",
                  borderColor: "rgba(10,58,46,0.25)",
                  color: "#0a3a2e",
                  py: 1.2,
                  "&:hover": {
                    borderColor: "#0a3a2e",
                    backgroundColor: "rgba(10,58,46,0.04)",
                  },
                }}
              >
                Already have an account? Login
              </Button>
            </Box>
          </Box>

          {/* Footer note */}
          <Typography sx={{ textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: "0.75rem", mt: 3 }}>
            © 2026 HealthCare. All rights reserved.
          </Typography>
        </motion.div>
      </Container>
    </Box>
  );
};

export default RegisterPatient;