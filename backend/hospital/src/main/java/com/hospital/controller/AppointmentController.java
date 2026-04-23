package com.hospital.controller;

import com.hospital.entity.Appointment;
import com.hospital.entity.Doctor;
import com.hospital.entity.Patient;
import com.hospital.repository.AppointmentRepository;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository     patientRepository;
    private final DoctorRepository      doctorRepository;

    // Book a new appointment
    @PostMapping("/book")
    public ResponseEntity<?> bookAppointment(@RequestBody Map<String, Object> request) {
        try {
            Long patientId = Long.valueOf(request.get("patientId").toString());
            Long doctorId  = Long.valueOf(request.get("doctorId").toString());
            String dateStr  = request.get("appointmentDate").toString();
            String timeSlot = request.getOrDefault("timeSlot", "").toString();
            String reason   = request.getOrDefault("reason", "").toString();

            Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + patientId));
            Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found with id: " + doctorId));

            Appointment appointment = Appointment.builder()
                .patient(patient)
                .doctor(doctor)
                .appointmentDate(LocalDate.parse(dateStr.substring(0, 10)))
                .timeSlot(timeSlot)
                .reason(reason)
                .status("PENDING")
                .build();

            Appointment saved = appointmentRepository.save(appointment);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Appointment booked successfully",
                "appointmentId", saved.getId()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    // Get all appointments for a patient
    // Replace the getByPatient method with this:
@GetMapping("/patient/{patientId}")
public ResponseEntity<?> getByPatient(@PathVariable Long patientId) {
    try {
        List<Appointment> appointments =
            appointmentRepository.findByPatientPatientIdOrderByAppointmentDateDesc(patientId);

        // Map to safe response — no password fields exposed
        List<Map<String, Object>> result = appointments.stream().map(appt -> {
            Map<String, Object> map = new java.util.LinkedHashMap<>();
            map.put("id",              appt.getId());
            map.put("appointmentDate", appt.getAppointmentDate());
            map.put("timeSlot",        appt.getTimeSlot());
            map.put("reason",          appt.getReason());
            map.put("status",          appt.getStatus());
            map.put("createdAt",       appt.getCreatedAt());

            // Doctor info
            if (appt.getDoctor() != null) {
                Map<String, Object> doc = new java.util.LinkedHashMap<>();
                doc.put("id",             appt.getDoctor().getId());
                doc.put("firstName",      appt.getDoctor().getFirstName());
                doc.put("lastName",       appt.getDoctor().getLastName());
                doc.put("specialization", appt.getDoctor().getSpecialization());
                map.put("doctor", doc);
            }

            // Patient info (minimal)
            if (appt.getPatient() != null) {
                Map<String, Object> pat = new java.util.LinkedHashMap<>();
                pat.put("patientId",  appt.getPatient().getPatientId());
                pat.put("firstName",  appt.getPatient().getFirstName());
                pat.put("lastName",   appt.getPatient().getLastName());
                map.put("patient", pat);
            }

            return map;
        }).toList();

        return ResponseEntity.ok(result);

    } catch (Exception e) {
        return ResponseEntity.internalServerError().body(Map.of(
            "success", false,
            "message", e.getMessage()
        ));
    }
}

    // Get all appointments for a doctor
    // Replace the getByDoctor method with this:
@GetMapping("/doctor/{doctorId}")
public ResponseEntity<?> getByDoctor(@PathVariable Long doctorId) {
    try {
        List<Appointment> appointments =
            appointmentRepository.findByDoctor_IdOrderByAppointmentDateDesc(doctorId);
        return ResponseEntity.ok(appointments);
    } catch (Exception e) {
        return ResponseEntity.internalServerError().body(Map.of(
            "success", false,
            "message", e.getMessage()
        ));
    }
}

    // Get all appointments (admin)
    @GetMapping("/all")
    public ResponseEntity<List<Appointment>> getAll() {
        return ResponseEntity.ok(appointmentRepository.findAll());
    }

    // Update appointment status
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return appointmentRepository.findById(id).map(appt -> {
            appt.setStatus(body.get("status"));
            appointmentRepository.save(appt);
            return ResponseEntity.ok(Map.of("success", true));
        }).orElse(ResponseEntity.notFound().build());
    }

    // Cancel appointment
    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancel(@PathVariable Long id) {
        return appointmentRepository.findById(id).map(appt -> {
            appt.setStatus("CANCELLED");
            appointmentRepository.save(appt);
            return ResponseEntity.ok(Map.of("success", true, "message", "Appointment cancelled"));
        }).orElse(ResponseEntity.notFound().build());
    }

    // Add this to AppointmentController.java:
@DeleteMapping("/{id}/permanent")
public ResponseEntity<?> permanentDelete(@PathVariable Long id) {
    return appointmentRepository.findById(id).map(appt -> {
        appointmentRepository.delete(appt); // ← actually removes from DB
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Appointment permanently deleted"
        ));
    }).orElse(ResponseEntity.notFound().build());
}
}