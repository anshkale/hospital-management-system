import React, { useEffect, useState } from "react";
import {
  AppBar, Box, CssBaseline, Drawer, List, ListItem,
  ListItemIcon, ListItemText, Toolbar, Typography,
  Avatar, Chip, CircularProgress, Divider, Card, CardContent
} from "@mui/material";
import {
  People, LocalHospital, CalendarMonth,
  Dashboard, TrendingUp, AccessTime, CheckCircle,
  Cancel, HourglassEmpty, PersonAdd
} from "@mui/icons-material";
import ViewPatientTable    from "../components/tables/ViewPatientTable";
import ViewDoctorTable     from "../components/tables/ViewDoctorTable";
import ViewAppointmentTable from "../components/tables/ViewAppointmentTable";
import LogoutButton        from "./LogoutButton";
import { useNavigate }     from "react-router-dom";
import { fetchAdminData }  from "../services/adminService";

const DRAWER_WIDTH = 250;

const NAV_ITEMS = [
  { key: "dashboard",    label: "Dashboard",       icon: <Dashboard /> },
  { key: "patients",     label: "Manage Patients", icon: <People /> },
  { key: "doctors",      label: "Manage Doctors",  icon: <LocalHospital /> },
  { key: "appointments", label: "Appointments",    icon: <CalendarMonth /> },
];

function AdminProfile() {
  const [userData, setUserData]      = useState({});
  const [activeComponent, setActive] = useState("dashboard");
  const [loading, setLoading]        = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAdminData()
      .then(data => { setUserData(data); setLoading(false); })
      .catch(() => { sessionStorage.clear(); navigate("/login"); });
  }, []);

  if (loading) return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <CircularProgress sx={{ color: "#0a3a2e" }} />
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {/* ── AppBar ──────────────────────────────────────────────────────── */}
      <AppBar position="fixed" sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        background: "linear-gradient(135deg, #0a3a2e, #0f5c45)",
        boxShadow: "0 2px 20px rgba(10,58,46,0.3)"
      }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{
              width: 36, height: 36, borderRadius: "50%",
              background: "rgba(255,255,255,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <LocalHospital sx={{ color: "#fff", fontSize: "1.1rem" }} />
            </Box>
            <Typography fontWeight={700} fontSize="1.1rem">
              HealthCare — Admin
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)", width: 34, height: 34, fontSize: "0.9rem" }}>
              {userData.firstName?.[0]}{userData.lastName?.[0]}
            </Avatar>
            <Typography fontSize="0.9rem">
              {userData.firstName} {userData.lastName}
            </Typography>
            <Chip label="Admin" size="small"
              sx={{ bgcolor: "rgba(255,255,255,0.15)", color: "#fff", fontWeight: 600 }} />
            <LogoutButton />
          </Box>
        </Toolbar>
      </AppBar>

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <Drawer variant="permanent" sx={{
        width: DRAWER_WIDTH, flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: DRAWER_WIDTH, boxSizing: "border-box",
          background: "linear-gradient(180deg, #0a3a2e 0%, #0d4d3a 100%)",
          color: "#fff", borderRight: "none",
        },
      }}>
        <Toolbar />
        <Box sx={{ p: 2, mt: 1 }}>
          <Typography variant="caption"
            sx={{ color: "rgba(255,255,255,0.4)", fontWeight: 600, letterSpacing: 1 }}>
            NAVIGATION
          </Typography>
        </Box>
        <List sx={{ px: 1 }}>
          {NAV_ITEMS.map(({ key, label, icon }) => (
            <ListItem button key={key} onClick={() => setActive(key)} sx={{
              borderRadius: 2, mb: 0.5,
              backgroundColor: activeComponent === key ? "rgba(255,255,255,0.15)" : "transparent",
              borderLeft: activeComponent === key ? "3px solid #2ecc71" : "3px solid transparent",
              "&:hover": { backgroundColor: "rgba(255,255,255,0.08)" },
              transition: "all 0.2s",
            }}>
              <ListItemIcon sx={{
                color: activeComponent === key ? "#2ecc71" : "rgba(255,255,255,0.6)",
                minWidth: 36
              }}>
                {icon}
              </ListItemIcon>
              <ListItemText primary={label} primaryTypographyProps={{
                fontSize: "0.9rem",
                fontWeight: activeComponent === key ? 700 : 400,
                color: activeComponent === key ? "#fff" : "rgba(255,255,255,0.7)"
              }} />
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <Box component="main"
        sx={{ flexGrow: 1, p: 3, mt: 8, bgcolor: "#f5f7f5", minHeight: "100vh" }}>
        {activeComponent === "dashboard"    && <DashboardOverview setActive={setActive} />}
        {activeComponent === "patients"     && <ViewPatientTable />}
        {activeComponent === "doctors"      && <ViewDoctorTable />}
        {activeComponent === "appointments" && <ViewAppointmentTable />}
      </Box>
    </Box>
  );
}

// ── Dashboard Overview ─────────────────────────────────────────────────────
function DashboardOverview({ setActive }) {
  const [stats, setStats]           = useState({ patients: 0, doctors: 0, appointments: 0 });
  const [patients, setPatients]     = useState([]);
  const [doctors, setDoctors]       = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    const token   = sessionStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      // ← fixed URL to match your PatientController
      fetch("http://localhost:8080/hospital/api/patients/fetchAllPatients", { headers })
        .then(r => r.ok ? r.json() : []).catch(() => []),
      fetch("http://localhost:8080/hospital/api/doctors/all", { headers })
        .then(r => r.ok ? r.json() : []).catch(() => []),
      fetch("http://localhost:8080/hospital/api/appointments/all", { headers })
        .then(r => r.ok ? r.json() : []).catch(() => []),
    ]).then(([p, d, a]) => {
      const pArr = Array.isArray(p) ? p : [];
      const dArr = Array.isArray(d) ? d : [];
      const aArr = Array.isArray(a) ? a : [];
      setPatients(pArr);
      setDoctors(dArr);
      setAppointments(aArr);
      setStats({ patients: pArr.length, doctors: dArr.length, appointments: aArr.length });
      setLoading(false);
    });
  }, []);

  // Appointment status counts
  const pending   = appointments.filter(a => a.status === "PENDING").length;
  const confirmed = appointments.filter(a => a.status === "CONFIRMED").length;
  const cancelled = appointments.filter(a => a.status === "CANCELLED").length;
  const completed = appointments.filter(a => a.status === "COMPLETED").length;

  // Recent 4 patients and doctors
  const recentPatients = [...patients].slice(-4).reverse();
  const recentDoctors  = [...doctors].slice(-4).reverse();

  const statCards = [
    { label: "Total Patients",     value: stats.patients,     icon: <People />,        color: "#1976d2", nav: "patients"     },
    { label: "Total Doctors",      value: stats.doctors,      icon: <LocalHospital />, color: "#0a3a2e", nav: "doctors"      },
    { label: "Total Appointments", value: stats.appointments, icon: <CalendarMonth />, color: "#ed6c02", nav: "appointments" },
  ];

  const apptStats = [
    { label: "Pending",   value: pending,   icon: <HourglassEmpty />, color: "#ed6c02", bg: "#fff3e0" },
    { label: "Confirmed", value: confirmed, icon: <CheckCircle />,    color: "#2e7d32", bg: "#e8f5e9" },
    { label: "Completed", value: completed, icon: <TrendingUp />,     color: "#1565c0", bg: "#e3f2fd" },
    { label: "Cancelled", value: cancelled, icon: <Cancel />,         color: "#c62828", bg: "#ffebee" },
  ];

  if (loading) return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
      <CircularProgress sx={{ color: "#0a3a2e" }} />
    </Box>
  );

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ color: "#0a3a2e", mb: 3 }}>
        Dashboard Overview
      </Typography>

      {/* ── Top stat cards ──────────────────────────────────────────────── */}
      <Box sx={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 2.5, mb: 3
      }}>
        {statCards.map(({ label, value, icon, color, nav }) => (
          <Box key={label} onClick={() => setActive(nav)} sx={{
            bgcolor: "#fff", borderRadius: 3, p: 3,
            boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
            cursor: "pointer", transition: "all 0.2s",
            borderLeft: `4px solid ${color}`,
            "&:hover": { transform: "translateY(-2px)", boxShadow: "0 6px 20px rgba(0,0,0,0.12)" }
          }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  {label}
                </Typography>
                <Typography variant="h4" fontWeight={700} sx={{ color, mt: 0.5 }}>
                  {value}
                </Typography>
              </Box>
              <Box sx={{
                width: 46, height: 46, borderRadius: 2,
                bgcolor: `${color}18`,
                display: "flex", alignItems: "center", justifyContent: "center", color
              }}>
                {icon}
              </Box>
            </Box>
          </Box>
        ))}
      </Box>

      {/* ── Appointment status breakdown ────────────────────────────────── */}
      <Typography variant="subtitle1" fontWeight={700} sx={{ color: "#0a3a2e", mb: 1.5 }}>
        Appointment Status Breakdown
      </Typography>
      <Box sx={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        gap: 2, mb: 3
      }}>
        {apptStats.map(({ label, value, icon, color, bg }) => (
          <Box key={label} onClick={() => setActive("appointments")} sx={{
            bgcolor: bg, borderRadius: 3, p: 2.5,
            cursor: "pointer", transition: "all 0.2s",
            "&:hover": { transform: "translateY(-2px)", boxShadow: "0 4px 16px rgba(0,0,0,0.1)" }
          }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Box sx={{ color, fontSize: 20 }}>{icon}</Box>
              <Typography variant="caption" fontWeight={700} sx={{ color }}>
                {label}
              </Typography>
            </Box>
            <Typography variant="h4" fontWeight={700} sx={{ color }}>
              {value}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* ── Recent patients + doctors side by side ──────────────────────── */}
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2.5 }}>

        {/* Recent Patients */}
        <Card elevation={0} sx={{
          borderRadius: 3, border: "1px solid", borderColor: "divider",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)"
        }}>
          <CardContent>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography fontWeight={700} sx={{ color: "#0a3a2e" }}>
                Recent Patients
              </Typography>
              <Typography variant="caption" onClick={() => setActive("patients")}
                sx={{ color: "#0a3a2e", cursor: "pointer", fontWeight: 600,
                  "&:hover": { textDecoration: "underline" } }}>
                View all →
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            {recentPatients.length === 0 ? (
              <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                No patients yet
              </Typography>
            ) : recentPatients.map((p, i) => (
              <Box key={p.email || i} sx={{
                display: "flex", alignItems: "center", gap: 1.5,
                py: 1.2, borderBottom: i < recentPatients.length - 1 ? "1px solid" : "none",
                borderColor: "divider"
              }}>
                <Avatar sx={{ width: 36, height: 36, bgcolor: "#1976d218", color: "#1976d2",
                  fontSize: "0.85rem", fontWeight: 700 }}>
                  {p.firstName?.[0]}{p.lastName?.[0]}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" fontWeight={600}>
                    {p.firstName} {p.lastName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {p.email}
                  </Typography>
                </Box>
                <Chip
                  label={p.active ? "Active" : "Inactive"}
                  size="small"
                  color={p.active ? "success" : "default"}
                  sx={{ fontSize: "0.7rem" }}
                />
              </Box>
            ))}
          </CardContent>
        </Card>

        {/* Recent Doctors */}
        <Card elevation={0} sx={{
          borderRadius: 3, border: "1px solid", borderColor: "divider",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)"
        }}>
          <CardContent>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography fontWeight={700} sx={{ color: "#0a3a2e" }}>
                Recent Doctors
              </Typography>
              <Typography variant="caption" onClick={() => setActive("doctors")}
                sx={{ color: "#0a3a2e", cursor: "pointer", fontWeight: 600,
                  "&:hover": { textDecoration: "underline" } }}>
                View all →
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            {recentDoctors.length === 0 ? (
              <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                No doctors yet
              </Typography>
            ) : recentDoctors.map((d, i) => (
              <Box key={d.id || i} sx={{
                display: "flex", alignItems: "center", gap: 1.5,
                py: 1.2, borderBottom: i < recentDoctors.length - 1 ? "1px solid" : "none",
                borderColor: "divider"
              }}>
                <Avatar sx={{ width: 36, height: 36, bgcolor: "#0a3a2e18", color: "#0a3a2e",
                  fontSize: "0.85rem", fontWeight: 700 }}>
                  {d.firstName?.[0]}{d.lastName?.[0]}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" fontWeight={600}>
                    Dr. {d.firstName} {d.lastName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {d.specialization}
                  </Typography>
                </Box>
                <Chip label={d.city || "—"} size="small"
                  sx={{ fontSize: "0.7rem", bgcolor: "#f0f0f0" }} />
              </Box>
            ))}
          </CardContent>
        </Card>

      </Box>
    </Box>
  );
}

export default AdminProfile;