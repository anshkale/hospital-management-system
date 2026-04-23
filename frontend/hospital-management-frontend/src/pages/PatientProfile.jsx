import React, { useEffect, useState } from "react";
import {
  AppBar,
  Box,
  Container,
  CssBaseline,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Divider,
  Chip,
} from "@mui/material";
import {
  Home,
  CalendarToday,
  History,
  LocalPharmacy,
  LocalHospital,
  EventNote,
} from "@mui/icons-material";
import PatientDetails from "../components/patient/PatientDetails";
import BookAppointment from "../components/patient/BookAppointment";
import ViewAppointments from "../components/patient/ViewAppointments";
import MedicalHistory from "../components/patient/MedicalHistory";
import Prescriptions from "../components/patient/Prescriptions";
import LogoutButton from "./LogoutButton";
import { useNavigate } from "react-router-dom";
import { fetchPatientDetails } from "../services/patientService";

const DRAWER_WIDTH = 200;

const navItems = [
  { key: "profile",           label: "My Profile",        icon: <Home /> },
  { key: "book-appointment",  label: "Book Appointment",   icon: <CalendarToday /> },
  { key: "view-appointments", label: "My Appointments",    icon: <EventNote /> },
  { key: "medical-history",   label: "Medical History",    icon: <History /> },
  { key: "prescriptions",     label: "Prescriptions",      icon: <LocalPharmacy /> },
];

function PatientProfile() {
  const [userData, setUserData]           = useState({});
  const [activeComponent, setActiveComponent] = useState("profile");
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState("");
  const navigate = useNavigate();

  const getPatientData = async () => {
    try {
      const data = await fetchPatientDetails();
      setUserData(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching patient data:", err);
      setError("Failed to load patient data. Please log in again.");
      sessionStorage.clear();
      navigate("/HealthCare/login");
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { getPatientData(); }, []);

  if (loading) {
    return (
      <Box sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0a3a2e 0%, #0f5c45 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Box sx={{ textAlign: "center" }}>
          <LocalHospital sx={{ fontSize: 48, color: "#2ecc71", mb: 2 }} />
          <Typography sx={{ color: "#fff", fontFamily: '"Playfair Display", serif', fontSize: "1.2rem" }}>
            Loading your profile...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  const initials = `${userData.firstName?.[0] ?? ""}${userData.lastName?.[0] ?? ""}`.toUpperCase();

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#f0f7f4" }}>
      <CssBaseline />

      {/* ── Top Navbar ─────────────────────────────────────────────────────── */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: "linear-gradient(90deg, #071f17 0%, #0a3a2e 60%, #0f5c45 100%)",
          borderBottom: "1px solid rgba(46,204,113,0.2)",
        }}
      >
        <Toolbar sx={{ px: { xs: 2, md: 3 } }}>
          {/* Brand */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexGrow: 1 }}>
            <Box sx={{
              width: 34, height: 34, borderRadius: "50%",
              background: "linear-gradient(135deg, #2ecc71, #27ae60)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 10px rgba(46,204,113,0.4)",
            }}>
              <LocalHospital sx={{ color: "#fff", fontSize: "1rem" }} />
            </Box>
            <Box>
              <Typography sx={{
                fontFamily: '"Playfair Display", serif',
                fontWeight: 700, fontSize: "0.95rem", color: "#fff", lineHeight: 1.1,
              }}>
                HEALTH
              </Typography>


              
              <Typography sx={{ fontSize: "0.55rem", color: "#2ecc71", letterSpacing: "0.15em", fontWeight: 600 }}>
                CARE
              </Typography>
            </Box>
          </Box>

          {/* User info + logout */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ textAlign: "right", display: { xs: "none", sm: "block" } }}>
              <Typography sx={{ color: "#fff", fontSize: "0.875rem", fontWeight: 600, lineHeight: 1.2 }}>
                {userData.firstName} {userData.lastName}
              </Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.7rem" }}>
                Patient
              </Typography>
            </Box>
            <Avatar sx={{
              width: 36, height: 36,
              background: "linear-gradient(135deg, #2ecc71, #27ae60)",
              fontSize: "0.8rem", fontWeight: 700,
              boxShadow: "0 2px 10px rgba(46,204,113,0.3)",
            }}>
              {initials}
            </Avatar>
            <LogoutButton />
          </Box>
        </Toolbar>
      </AppBar>

      {/* ── Sidebar ────────────────────────────────────────────────────────── */}
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            background: "linear-gradient(180deg, #071f17 0%, #0a3a2e 100%)",
            borderRight: "1px solid rgba(46,204,113,0.15)",
            pt: "64px", // offset for AppBar
          },
        }}
      >

        <Divider sx={{ borderColor: "rgba(255,255,255,0.07)", mx: 2 }} />

        {/* Nav items */}
        <List sx={{ px: 1.5, pt: 1.5 }}>
          {navItems.map((item) => {
            const isActive = activeComponent === item.key;
            return (
              <ListItem
                button
                key={item.key}
                onClick={() => setActiveComponent(item.key)}
                sx={{
                  borderRadius: "12px",
                  mb: 0.5,
                  px: 2,
                  py: 1.2,
                  backgroundColor: isActive ? "rgba(46,204,113,0.15)" : "transparent",
                  border: isActive ? "1px solid rgba(46,204,113,0.25)" : "1px solid transparent",
                  transition: "all 0.2s",
                  "&:hover": {
                    backgroundColor: isActive ? "rgba(46,204,113,0.18)" : "rgba(255,255,255,0.05)",
                  },
                }}
              >
                <ListItemIcon sx={{
                  minWidth: 36,
                  color: isActive ? "#2ecc71" : "rgba(255,255,255,0.45)",
                  transition: "color 0.2s",
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: "0.875rem",
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? "#fff" : "rgba(255,255,255,0.6)",
                    transition: "all 0.2s",
                  }}
                />
                {isActive && (
                  <Box sx={{
                    width: 4, height: 4, borderRadius: "50%",
                    backgroundColor: "#2ecc71",
                    boxShadow: "0 0 6px #2ecc71",
                  }} />
                )}
              </ListItem>
            );
          })}
        </List>

        {/* Bottom hint */}
        <Box sx={{ mt: "auto", px: 2.5, pb: 3 }}>
          <Divider sx={{ borderColor: "rgba(255,255,255,0.07)", mb: 2 }} />
          <Typography sx={{ color: "rgba(255,255,255,0.2)", fontSize: "0.7rem", textAlign: "center" }}>
            © 2024 LifeBridge Hospital
          </Typography>
        </Box>
      </Drawer>

      {/* ── Main Content ───────────────────────────────────────────────────── */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: `${DRAWER_WIDTH}px`,
          mt: "64px",
          minHeight: "calc(100vh - 64px)",
          backgroundColor: "#f0f7f4",
          p: { xs: 2, md: 3 },
        }}
      >
        {/* Page header */}
        <Box sx={{ mb: 3 }}>
          <Typography sx={{
            fontFamily: '"Playfair Display", serif',
            fontWeight: 800,
            fontSize: "1.6rem",
            color: "#0a3a2e",
          }}>
            {navItems.find(n => n.key === activeComponent)?.label}
          </Typography>
          <Typography sx={{ color: "#888", fontSize: "0.85rem", mt: 0.3 }}>
            {activeComponent === "profile"           && "View and manage your personal information"}
            {activeComponent === "book-appointment"  && "Schedule a new appointment with a doctor"}
            {activeComponent === "view-appointments" && "Track all your upcoming and past appointments"}
            {activeComponent === "medical-history"   && "Review your complete medical history"}
            {activeComponent === "prescriptions"     && "View prescriptions from your doctors"}
          </Typography>
        </Box>

        {/* Content area */}
        <Box sx={{
          backgroundColor: "#fff",
  borderRadius: "20px",
  boxShadow: "0 2px 20px rgba(0,0,0,0.06)",
  border: "1px solid rgba(10,58,46,0.08)",
  overflow: "hidden",
  p: { xs: 1.5, md: 2 },

        }}>
          <Container maxWidth="md" sx={{ py: 3 }}>
            {activeComponent === "profile"           && <PatientDetails userData={userData} />}
            {activeComponent === "book-appointment"  && <BookAppointment />}
            {activeComponent === "view-appointments" && <ViewAppointments />}
            {activeComponent === "medical-history"   && <MedicalHistory />}
            {activeComponent === "prescriptions"     && <Prescriptions />}
          </Container>
        </Box>
      </Box>
    </Box>
  );
}

export default PatientProfile;