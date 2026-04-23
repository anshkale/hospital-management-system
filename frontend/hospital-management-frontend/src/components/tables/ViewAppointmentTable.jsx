import React, { useEffect, useState } from "react";
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, CircularProgress, Alert, Chip,
  IconButton, Tooltip, TextField, InputAdornment, Select,
  MenuItem, FormControl, Dialog, DialogTitle, DialogContent,
  DialogActions, Button
} from "@mui/material";
import { Search, CheckCircle, Cancel, Delete } from "@mui/icons-material";
import axiosInstance from "../../api/axiosConfig";

const STATUS_COLORS = {
  PENDING:   "warning",
  CONFIRMED: "success",
  CANCELLED: "error",
  COMPLETED: "info",
};

export default function ViewAppointmentTable() {
  const [appointments, setAppointments] = useState([]);
  const [filtered, setFiltered]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [success, setSuccess]           = useState("");
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [updating, setUpdating]         = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, appointment: null });
  const [deleting, setDeleting]         = useState(false);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/api/appointments/all");
      setAppointments(res.data);
      setFiltered(res.data);
    } catch {
      setError("Failed to load appointments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, []);

  useEffect(() => {
    let list = appointments;
    if (statusFilter !== "ALL") list = list.filter(a => a.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(a =>
        a.doctor?.firstName?.toLowerCase().includes(q) ||
        a.doctor?.lastName?.toLowerCase().includes(q)  ||
        a.patient?.firstName?.toLowerCase().includes(q)||
        a.patient?.lastName?.toLowerCase().includes(q) ||
        a.reason?.toLowerCase().includes(q)
      );
    }
    setFiltered(list);
  }, [search, statusFilter, appointments]);

  const updateStatus = async (id, status) => {
    setUpdating(id);
    setError(""); setSuccess("");
    try {
      await axiosInstance.put(`/api/appointments/${id}/status`, { status });
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
      setSuccess(`Appointment #${id} marked as ${status}.`);
    } catch {
      setError("Failed to update appointment status.");
    } finally {
      setUpdating(null);
    }
  };

  // ── Hard delete from DB ────────────────────────────────────────────────
  const handleDelete = async () => {
    setDeleting(true);
    setError(""); setSuccess("");
    try {
      await axiosInstance.delete(`/api/appointments/${deleteDialog.appointment.id}/permanent`);
      // Remove from local state immediately
      setAppointments(prev =>
        prev.filter(a => a.id !== deleteDialog.appointment.id)
      );
      setSuccess(`Appointment #${deleteDialog.appointment.id} deleted successfully.`);
      setDeleteDialog({ open: false, appointment: null });
    } catch {
      setError("Failed to delete appointment.");
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
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <Box sx={{ display: "flex", justifyContent: "space-between",
        alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Typography variant="h6" fontWeight={700} sx={{ color: "#0a3a2e" }}>
          All Appointments ({filtered.length})
        </Typography>
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              sx={{ borderRadius: 2, fontSize: "0.85rem" }}>
              <MenuItem value="ALL">All Status</MenuItem>
              <MenuItem value="PENDING">Pending</MenuItem>
              <MenuItem value="CONFIRMED">Confirmed</MenuItem>
              <MenuItem value="CANCELLED">Cancelled</MenuItem>
              <MenuItem value="COMPLETED">Completed</MenuItem>
            </Select>
          </FormControl>
          <TextField size="small" placeholder="Search..."
            value={search} onChange={e => setSearch(e.target.value)}
            InputProps={{ startAdornment:
              <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>
            }}
            sx={{ width: 220, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
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
              {["#", "Patient", "Doctor", "Date", "Time", "Reason", "Status", "Actions"].map(h => (
                <TableCell key={h}
                  sx={{ color: "#fff", fontWeight: 700, fontSize: "0.8rem" }}>
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4, color: "text.secondary" }}>
                  No appointments found
                </TableCell>
              </TableRow>
            ) : filtered.map((a, i) => (
              <TableRow key={a.id}
                sx={{
                  "&:hover": { bgcolor: "#f5f9f7" },
                  // ← Dim cancelled rows so they look visually distinct
                  opacity: a.status === "CANCELLED" ? 0.7 : 1,
                  bgcolor: a.status === "CANCELLED" ? "#fff5f5" : "inherit",
                }}>
                <TableCell>{i + 1}</TableCell>
                <TableCell>
                  {a.patient
                    ? `${a.patient.firstName} ${a.patient.lastName}`
                    : `Patient #${a.patientId || "?"}`}
                </TableCell>
                <TableCell>
                  {a.doctor
                    ? `Dr. ${a.doctor.firstName} ${a.doctor.lastName}`
                    : "—"}
                </TableCell>
                <TableCell>{a.appointmentDate}</TableCell>
                <TableCell>{a.timeSlot || "—"}</TableCell>
                <TableCell sx={{
                  maxWidth: 160, overflow: "hidden",
                  textOverflow: "ellipsis", whiteSpace: "nowrap"
                }}>
                  {a.reason || "—"}
                </TableCell>
                <TableCell>
                  <Chip label={a.status} color={STATUS_COLORS[a.status] || "default"}
                    size="small" sx={{ fontWeight: 600 }} />
                </TableCell>
                <TableCell>
                  {/* Confirm / Cancel for PENDING */}
                  {a.status === "PENDING" && (
                    <>
                      <Tooltip title="Confirm">
                        <IconButton size="small" disabled={updating === a.id}
                          onClick={() => updateStatus(a.id, "CONFIRMED")}
                          sx={{ color: "#2e7d32" }}>
                          {updating === a.id
                            ? <CircularProgress size={16} />
                            : <CheckCircle fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Cancel">
                        <IconButton size="small" disabled={updating === a.id}
                          onClick={() => updateStatus(a.id, "CANCELLED")}
                          sx={{ color: "#d32f2f" }}>
                          <Cancel fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}

                  {/* Mark complete for CONFIRMED */}
                  {a.status === "CONFIRMED" && (
                    <Tooltip title="Mark as completed">
                      <IconButton size="small" disabled={updating === a.id}
                        onClick={() => updateStatus(a.id, "COMPLETED")}
                        sx={{ color: "#0288d1" }}>
                        <CheckCircle fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}

                  {/* ← Delete only for CANCELLED appointments */}
                  {a.status === "CANCELLED" && (
                    <Tooltip title="Delete permanently">
                      <IconButton size="small"
                        onClick={() => setDeleteDialog({ open: true, appointment: a })}
                        sx={{
                          color: "#d32f2f",
                          "&:hover": { bgcolor: "#ffebee" }
                        }}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ── Delete confirmation dialog ───────────────────────────────────── */}
      <Dialog open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, appointment: null })}
        PaperProps={{ sx: { borderRadius: 3, minWidth: 380 } }}>
        <DialogTitle fontWeight={700} sx={{ color: "#d32f2f" }}>
          Delete Appointment?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to permanently delete appointment{" "}
            <strong>#{deleteDialog.appointment?.id}</strong>?
            <br /><br />
            Patient: <strong>
              {deleteDialog.appointment?.patient?.firstName}{" "}
              {deleteDialog.appointment?.patient?.lastName}
            </strong>
            <br />
            Doctor: <strong>
              Dr. {deleteDialog.appointment?.doctor?.firstName}{" "}
              {deleteDialog.appointment?.doctor?.lastName}
            </strong>
            <br />
            Date: <strong>{deleteDialog.appointment?.appointmentDate}</strong>
            <br /><br />
            <Typography component="span" variant="body2"
              sx={{ color: "#d32f2f", fontWeight: 600 }}>
              This will permanently remove it from the database.
            </Typography>
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => setDeleteDialog({ open: false, appointment: null })}
            sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2 }}>
            Cancel
          </Button>
          <Button onClick={handleDelete} variant="contained" color="error"
            disabled={deleting}
            sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2, px: 3 }}>
            {deleting ? <CircularProgress size={18} color="inherit" /> : "Delete Permanently"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}