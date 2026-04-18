package com.hospital.controller;

import com.hospital.entity.Appointment;
import com.hospital.entity.Doctor;
import com.hospital.entity.Patient;
import com.hospital.entity.Prescription;
import com.hospital.repository.AppointmentRepository;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.PatientRepository;
import com.hospital.repository.PrescriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/prescriptions")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class PrescriptionController {

    private final PrescriptionRepository  prescriptionRepository;
    private final PatientRepository       patientRepository;
    private final DoctorRepository        doctorRepository;
    private final AppointmentRepository   appointmentRepository;

    // Create a new prescription
    @PostMapping("/create")
    public ResponseEntity<?> create(@RequestBody Map<String, Object> req) {
        try {
            Long patientId = Long.valueOf(req.get("patientId").toString());
            Long doctorId  = Long.valueOf(req.get("doctorId").toString());

            Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + patientId));
            Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found with id: " + doctorId));

            Prescription prescription = Prescription.builder()
                .patient(patient)
                .doctor(doctor)
                .medicineDetails(req.getOrDefault("medicineDetails", "").toString())
                .dosage(req.getOrDefault("dosage", "").toString())
                .instructions(req.getOrDefault("instructions", "").toString())
                .prescribedDate(LocalDate.now())
                .build();

            // Optionally link to an appointment
            if (req.containsKey("appointmentId") && req.get("appointmentId") != null) {
                Long apptId = Long.valueOf(req.get("appointmentId").toString());
                appointmentRepository.findById(apptId)
                    .ifPresent(prescription::setAppointment);
            }

            Prescription saved = prescriptionRepository.save(prescription);
            return ResponseEntity.ok(Map.of("success", true, "id", saved.getId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    // Get all prescriptions for a patient
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Prescription>> getByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(
            prescriptionRepository.findByPatientPatientIdOrderByPrescribedDateDesc(patientId)
        );
    }

    // Get all prescriptions written by a doctor
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<Prescription>> getByDoctor(@PathVariable Long doctorId) {
        return ResponseEntity.ok(
            prescriptionRepository.findByDoctorIdOrderByPrescribedDateDesc(doctorId)
        );
    }

    // Get a single prescription by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        return prescriptionRepository.findById(id)
            .map(p -> ResponseEntity.ok((Object) p))
            .orElse(ResponseEntity.notFound().build());
    }
}