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
@CrossOrigin(origins = "http://localhost:3000")
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
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Appointment>> getByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(
            appointmentRepository.findByPatientPatientIdOrderByAppointmentDateDesc(patientId)
        );
    }

    // Get all appointments for a doctor
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<Appointment>> getByDoctor(@PathVariable Long doctorId) {
        return ResponseEntity.ok(
            appointmentRepository.findByDoctorIdOrderByAppointmentDateDesc(doctorId)
        );
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
}