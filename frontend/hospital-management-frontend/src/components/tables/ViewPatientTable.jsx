import React, { useEffect, useState } from "react";
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, CircularProgress, Alert, Chip,
  IconButton, Tooltip, TextField, InputAdornment, Dialog,
  DialogTitle, DialogContent, DialogActions, Button
} from "@mui/material";
import { Delete, Search, Visibility } from "@mui/icons-material";
import axiosInstance from "../../api/axiosConfig";

export default function ViewPatientTable() {
  const [patients, setPatients]         = useState([]);
  const [filtered, setFiltered]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [success, setSuccess]           = useState("");
  const [search, setSearch]             = useState("");
  const [deleteDialog, setDeleteDialog] = useState({ open: false, patient: null });
  const [deleting, setDeleting]         = useState(false);
  const [viewDialog, setViewDialog]     = useState({ open: false, patient: null });

  const fetchPatients = async () => {
    setLoading(true);
    setError("");
    try {
      // ← correct endpoint from your PatientController
      const res = await axiosInstance.get("/api/patients/fetchAllPatients");
      const data = Array.isArray(res.data) ? res.data : [];
      setPatients(data);
      setFiltered(data);
    } catch (err) {
      setError(
        err?.response?.status === 403
          ? "Access denied. Make sure you are logged in as Admin."
          : `Failed to load patients: ${err?.response?.data || err.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPatients(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(patients.filter(p =>
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q) ||
      p.phoneNumber?.includes(q)
    ));
  }, [search, patients]);

  const handleDelete = async () => {
    setDeleting(true);
    setError("");
    try {
      // ← correct endpoint: DELETE /api/patients/delete/{email}
      await axiosInstance.delete(`/api/patients/delete/${deleteDialog.patient.email}`);
      setPatients(prev => prev.filter(p => p.email !== deleteDialog.patient.email));
      setSuccess(`Patient ${deleteDialog.patient.firstName} deleted successfully.`);
      setDeleteDialog({ open: false, patient: null });
    } catch (err) {
      setError(`Failed to delete patient: ${err?.response?.data || err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
      <CircularProgress sx={{ color: "#0a3a2e" }} />
    </Box>
  );

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h6" fontWeight={700} sx={{ color: "#0a3a2e" }}>
          Manage Patients ({filtered.length})
        </Typography>
        <TextField
          size="small"
          placeholder="Search patients..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>
            )
          }}
          sx={{ width: 260, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
        />
      </Box>

      {error   && <Alert severity="error"   sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{success}</Alert>}

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
        <Table>
          <TableHead sx={{ bgcolor: "#0a3a2e" }}>
            <TableRow>
              {["#", "Name", "Email", "Phone", "Gender", "City", "Status", "Actions"].map(h => (
                <TableCell key={h} sx={{ color: "#fff", fontWeight: 700, fontSize: "0.8rem" }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4, color: "text.secondary" }}>
                  No patients found
                </TableCell>
              </TableRow>
            ) : filtered.map((p, i) => (
              <TableRow key={p.email} sx={{ "&:hover": { bgcolor: "#f5f9f7" } }}>
                <TableCell>{i + 1}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{p.firstName} {p.lastName}</TableCell>
                <TableCell>{p.email}</TableCell>
                <TableCell>{p.phoneNumber}</TableCell>
                <TableCell>{p.gender}</TableCell>
                <TableCell>{p.city || "—"}</TableCell>
                <TableCell>
                  <Chip
                    label={p.active ? "Active" : "Inactive"}
                    color={p.active ? "success" : "default"}
                    size="small" sx={{ fontWeight: 600 }}
                  />
                </TableCell>
                <TableCell>
                  <Tooltip title="View details">
                    <IconButton size="small"
                      onClick={() => setViewDialog({ open: true, patient: p })}
                      sx={{ color: "#0a3a2e" }}>
                      <Visibility fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete patient">
                    <IconButton size="small"
                      onClick={() => setDeleteDialog({ open: true, patient: p })}
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

      {/* View dialog */}
      <Dialog open={viewDialog.open} onClose={() => setViewDialog({ open: false, patient: null })}
        PaperProps={{ sx: { borderRadius: 3, minWidth: 420 } }}>
        <DialogTitle fontWeight={700} sx={{ color: "#0a3a2e" }}>Patient Details</DialogTitle>
        <DialogContent dividers>
          {viewDialog.patient && (
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mt: 1 }}>
              {[
                ["Full Name",     `${viewDialog.patient.firstName} ${viewDialog.patient.lastName}`],
                ["Email",         viewDialog.patient.email],
                ["Phone",         viewDialog.patient.phoneNumber],
                ["Gender",        viewDialog.patient.gender],
                ["Date of Birth", viewDialog.patient.dateOfBirth || "—"],
                ["Address",       viewDialog.patient.address || "—"],
                ["City",          viewDialog.patient.city || "—"],
                ["State",         viewDialog.patient.state || "—"],
                ["Country",       viewDialog.patient.country || "—"],
              ].map(([label, val]) => (
                <Box key={label}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>{label}</Typography>
                  <Typography variant="body2" fontWeight={500}>{val}</Typography>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setViewDialog({ open: false, patient: null })}
            sx={{ textTransform: "none", fontWeight: 600, color: "#0a3a2e" }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirm dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, patient: null })}
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle fontWeight={700}>Delete Patient?</DialogTitle>
        <DialogContent>
          Are you sure you want to delete{" "}
          <strong>{deleteDialog.patient?.firstName} {deleteDialog.patient?.lastName}</strong>?
          This action cannot be undone.
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setDeleteDialog({ open: false, patient: null })}
            sx={{ textTransform: "none", fontWeight: 600 }}>
            Cancel
          </Button>
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