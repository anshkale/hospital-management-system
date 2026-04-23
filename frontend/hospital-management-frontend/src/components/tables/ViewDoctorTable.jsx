import React, { useEffect, useState } from "react";
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, CircularProgress, Alert, IconButton,
  Tooltip, TextField, InputAdornment, Dialog, DialogTitle,
  DialogContent, DialogActions, Button, Grid, MenuItem, Divider
} from "@mui/material";
import { Delete, Search, Visibility, PersonAdd } from "@mui/icons-material";
import axiosInstance from "../../api/axiosConfig";

const SPECIALIZATIONS = [
  "Cardiologist", "Dermatologist", "Orthopedic", "Neurologist",
  "Pediatrician", "Gynecologist", "Psychiatrist", "Oncologist",
  "Radiologist", "General Physician", "ENT Specialist", "Ophthalmologist",
  "Urologist", "Endocrinologist", "Gastroenterologist"
];

const EMPTY_FORM = {
  firstName: "", lastName: "", email: "", phoneNumber: "",
  gender: "", dateOfBirth: "", city: "", state: "", country: "",
  specialization: "", bloodGroup: "", joiningDate: "", password: "",
};

export default function ViewDoctorTable() {
  const [doctors, setDoctors]           = useState([]);
  const [filtered, setFiltered]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [success, setSuccess]           = useState("");
  const [search, setSearch]             = useState("");
  const [deleteDialog, setDeleteDialog] = useState({ open: false, doctor: null });
  const [deleting, setDeleting]         = useState(false);
  const [viewDialog, setViewDialog]     = useState({ open: false, doctor: null });

  // ── Add doctor state ───────────────────────────────────────────────────
  const [addDialog, setAddDialog]       = useState(false);
  const [addForm, setAddForm]           = useState(EMPTY_FORM);
  const [addLoading, setAddLoading]     = useState(false);
  const [addError, setAddError]         = useState("");

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/api/doctors/all");
      setDoctors(res.data);
      setFiltered(res.data);
    } catch {
      setError("Failed to load doctors.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDoctors(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(doctors.filter(d =>
      `${d.firstName} ${d.lastName}`.toLowerCase().includes(q) ||
      d.email?.toLowerCase().includes(q) ||
      d.specialization?.toLowerCase().includes(q)
    ));
  }, [search, doctors]);

  // ── Add doctor submit ──────────────────────────────────────────────────
  const handleAddDoctor = async () => {
    setAddLoading(true);
    setAddError("");
    try {
      const res = await axiosInstance.post("/api/doctors/register", addForm);
      setSuccess(`Dr. ${addForm.firstName} ${addForm.lastName} added successfully!`);
      setAddDialog(false);
      setAddForm(EMPTY_FORM);
      fetchDoctors(); // refresh table
    } catch (err) {
      setAddError(
        err?.response?.data?.message ||
        err?.response?.data ||
        "Failed to add doctor. Check all fields."
      );
    } finally {
      setAddLoading(false);
    }
  };

  const handleFormChange = (field) => (e) => {
    setAddForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  // ── Delete doctor ──────────────────────────────────────────────────────
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await axiosInstance.delete(`/api/doctors/${deleteDialog.doctor.id}`);
      setDoctors(prev => prev.filter(d => d.id !== deleteDialog.doctor.id));
      setSuccess(`Dr. ${deleteDialog.doctor.firstName} ${deleteDialog.doctor.lastName} deleted.`);
      setDeleteDialog({ open: false, doctor: null });
    } catch {
      setError("Failed to delete doctor.");
    } finally {
      setDeleting(false);
    }
  };

  // Shared TextField sx
  const fieldSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "10px",
      "& fieldset": { borderColor: "rgba(10,58,46,0.2)" },
      "&:hover fieldset": { borderColor: "rgba(10,58,46,0.5)" },
      "&.Mui-focused fieldset": { borderColor: "#0a3a2e" },
    },
    "& .MuiInputLabel-root.Mui-focused": { color: "#0a3a2e" },
  };

  if (loading) return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
      <CircularProgress sx={{ color: "#0a3a2e" }} />
    </Box>
  );

  return (
    <Box>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h6" fontWeight={700} sx={{ color: "#0a3a2e" }}>
          Manage Doctors ({filtered.length})
        </Typography>
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <TextField
            size="small" placeholder="Search by name or specialization..."
            value={search} onChange={e => setSearch(e.target.value)}
            InputProps={{ startAdornment:
              <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>
            }}
            sx={{ width: 280, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
          {/* ── Add Doctor button ────────────────────────────────────────── */}
          <Button
            variant="contained"
            startIcon={<PersonAdd />}
            onClick={() => { setAddDialog(true); setAddError(""); }}
            sx={{
              background: "linear-gradient(135deg, #0a3a2e, #0f5c45)",
              textTransform: "none", fontWeight: 700, borderRadius: 2,
              "&:hover": { background: "linear-gradient(135deg, #0d4d3a, #1a7a5e)" }
            }}
          >
            Add Doctor
          </Button>
        </Box>
      </Box>

      {error   && <Alert severity="error"   sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{success}</Alert>}

      {/* ── Table ───────────────────────────────────────────────────────── */}
      <TableContainer component={Paper}
        sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
        <Table>
          <TableHead sx={{ bgcolor: "#0a3a2e" }}>
            <TableRow>
              {["#", "Name", "Specialization", "Email", "Phone", "City", "Actions"].map(h => (
                <TableCell key={h} sx={{ color: "#fff", fontWeight: 700, fontSize: "0.8rem" }}>
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4, color: "text.secondary" }}>
                  No doctors found
                </TableCell>
              </TableRow>
            ) : filtered.map((d, i) => (
              <TableRow key={d.id} sx={{ "&:hover": { bgcolor: "#f5f9f7" } }}>
                <TableCell>{i + 1}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>
                  Dr. {d.firstName} {d.lastName}
                </TableCell>
                <TableCell>{d.specialization}</TableCell>
                <TableCell>{d.email}</TableCell>
                <TableCell>{d.phoneNumber}</TableCell>
                <TableCell>{d.city || "—"}</TableCell>
                <TableCell>
                  <Tooltip title="View details">
                    <IconButton size="small"
                      onClick={() => setViewDialog({ open: true, doctor: d })}
                      sx={{ color: "#0a3a2e" }}>
                      <Visibility fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete doctor">
                    <IconButton size="small"
                      onClick={() => setDeleteDialog({ open: true, doctor: d })}
                      sx={{ color: "#d32f2f" }}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ── Add Doctor Dialog ────────────────────────────────────────────── */}
      <Dialog open={addDialog} onClose={() => setAddDialog(false)} maxWidth="md" fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700, color: "#0a3a2e", pb: 1 }}>
          Add New Doctor
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 3 }}>
          {addError && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{addError}</Alert>
          )}
          <Grid container spacing={2}>

            {/* Personal Info */}
            <Grid item xs={12}>
              <Typography variant="caption" fontWeight={700}
                sx={{ color: "#0a3a2e", letterSpacing: 0.5 }}>
                PERSONAL INFORMATION
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="First Name" required
                value={addForm.firstName} onChange={handleFormChange("firstName")} sx={fieldSx} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Last Name" required
                value={addForm.lastName} onChange={handleFormChange("lastName")} sx={fieldSx} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Email" type="email" required
                value={addForm.email} onChange={handleFormChange("email")} sx={fieldSx} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Phone Number" required
                value={addForm.phoneNumber} onChange={handleFormChange("phoneNumber")} sx={fieldSx} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth select label="Gender" required
                value={addForm.gender} onChange={handleFormChange("gender")} sx={fieldSx}>
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Date of Birth" type="date" required
                InputLabelProps={{ shrink: true }}
                value={addForm.dateOfBirth} onChange={handleFormChange("dateOfBirth")} sx={fieldSx} />
            </Grid>

            {/* Professional Info */}
            <Grid item xs={12} sx={{ mt: 1 }}>
              <Typography variant="caption" fontWeight={700}
                sx={{ color: "#0a3a2e", letterSpacing: 0.5 }}>
                PROFESSIONAL INFORMATION
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth select label="Specialization" required
                value={addForm.specialization} onChange={handleFormChange("specialization")} sx={fieldSx}>
                {SPECIALIZATIONS.map(s => (
                  <MenuItem key={s} value={s}>{s}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Joining Date" type="date" required
                InputLabelProps={{ shrink: true }}
                value={addForm.joiningDate} onChange={handleFormChange("joiningDate")} sx={fieldSx} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth select label="Blood Group" required
                value={addForm.bloodGroup} onChange={handleFormChange("bloodGroup")} sx={fieldSx}>
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => (
                  <MenuItem key={bg} value={bg}>{bg}</MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Location */}
            <Grid item xs={12} sx={{ mt: 1 }}>
              <Typography variant="caption" fontWeight={700}
                sx={{ color: "#0a3a2e", letterSpacing: 0.5 }}>
                LOCATION
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="City" required
                value={addForm.city} onChange={handleFormChange("city")} sx={fieldSx} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="State" required
                value={addForm.state} onChange={handleFormChange("state")} sx={fieldSx} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Country" required
                value={addForm.country} onChange={handleFormChange("country")} sx={fieldSx} />
            </Grid>

            {/* Account */}
            <Grid item xs={12} sx={{ mt: 1 }}>
              <Typography variant="caption" fontWeight={700}
                sx={{ color: "#0a3a2e", letterSpacing: 0.5 }}>
                ACCOUNT
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Password" type="password" required
                helperText="Min 8 characters"
                value={addForm.password} onChange={handleFormChange("password")} sx={fieldSx} />
            </Grid>
          </Grid>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button onClick={() => { setAddDialog(false); setAddForm(EMPTY_FORM); }}
            sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2 }}>
            Cancel
          </Button>
          <Button onClick={handleAddDoctor} variant="contained" disabled={addLoading}
            sx={{
              textTransform: "none", fontWeight: 700, borderRadius: 2, px: 4,
              background: "linear-gradient(135deg, #0a3a2e, #0f5c45)",
              "&:hover": { background: "linear-gradient(135deg, #0d4d3a, #1a7a5e)" }
            }}>
            {addLoading ? <CircularProgress size={20} color="inherit" /> : "Add Doctor"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── View Doctor Dialog ───────────────────────────────────────────── */}
      <Dialog open={viewDialog.open} onClose={() => setViewDialog({ open: false, doctor: null })}
        PaperProps={{ sx: { borderRadius: 3, minWidth: 420 } }}>
        <DialogTitle fontWeight={700} sx={{ color: "#0a3a2e" }}>Doctor Details</DialogTitle>
        <DialogContent dividers>
          {viewDialog.doctor && (
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mt: 1 }}>
              {[
                ["Full Name",      `Dr. ${viewDialog.doctor.firstName} ${viewDialog.doctor.lastName}`],
                ["Specialization", viewDialog.doctor.specialization],
                ["Email",          viewDialog.doctor.email],
                ["Phone",          viewDialog.doctor.phoneNumber],
                ["Gender",         viewDialog.doctor.gender],
                ["Blood Group",    viewDialog.doctor.bloodGroup],
                ["City",           viewDialog.doctor.city || "—"],
                ["Joining Date",   viewDialog.doctor.joiningDate || "—"],
              ].map(([label, val]) => (
                <Box key={label}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    {label}
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>{val}</Typography>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setViewDialog({ open: false, doctor: null })}
            sx={{ textTransform: "none", fontWeight: 600, color: "#0a3a2e" }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Dialog ────────────────────────────────────────────────── */}
      <Dialog open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, doctor: null })}
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle fontWeight={700}>Delete Doctor?</DialogTitle>
        <DialogContent>
          Are you sure you want to delete{" "}
          <strong>Dr. {deleteDialog.doctor?.firstName} {deleteDialog.doctor?.lastName}</strong>?
          This action cannot be undone.
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setDeleteDialog({ open: false, doctor: null })}
            sx={{ textTransform: "none", fontWeight: 600 }}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" color="error"
            disabled={deleting}
            sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2 }}>
            {deleting ? <CircularProgress size={18} color="inherit" /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}