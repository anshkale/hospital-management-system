package com.hospital.controller;

import com.hospital.entity.Doctor;
import com.hospital.entity.Patient;
import com.hospital.entity.PatientHistory;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.PatientHistoryRepository;
import com.hospital.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/patient-history")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class PatientHistoryController {

    private final PatientHistoryRepository historyRepository;
    private final PatientRepository        patientRepository;
    private final DoctorRepository         doctorRepository;

    // Add a new history entry
    @PostMapping("/add")
    public ResponseEntity<?> add(@RequestBody Map<String, Object> req) {
        try {
            Long patientId = Long.valueOf(req.get("patientId").toString());
            Long doctorId  = Long.valueOf(req.get("doctorId").toString());

            Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + patientId));
            Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found with id: " + doctorId));

            PatientHistory history = PatientHistory.builder()
                .patient(patient)
                .doctor(doctor)
                .visitDate(LocalDate.now())
                .diagnosis(req.getOrDefault("diagnosis", "").toString())
                .treatment(req.getOrDefault("treatment", "").toString())
                .notes(req.getOrDefault("notes", "").toString())
                .build();

            PatientHistory saved = historyRepository.save(history);
            return ResponseEntity.ok(Map.of("success", true, "id", saved.getId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    // Get full history for a patient
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<PatientHistory>> getByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(
            historyRepository.findByPatientPatientIdOrderByVisitDateDesc(patientId)
        );
    }

    // Get a single history entry by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        return historyRepository.findById(id)
            .map(h -> ResponseEntity.ok((Object) h))
            .orElse(ResponseEntity.notFound().build());
    }

    // Update a history entry
    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            @PathVariable Long id,
            @RequestBody Map<String, Object> req) {
        return historyRepository.findById(id).map(h -> {
            if (req.containsKey("diagnosis"))  h.setDiagnosis(req.get("diagnosis").toString());
            if (req.containsKey("treatment"))  h.setTreatment(req.get("treatment").toString());
            if (req.containsKey("notes"))      h.setNotes(req.get("notes").toString());
            historyRepository.save(h);
            return ResponseEntity.ok(Map.of("success", true));
        }).orElse(ResponseEntity.notFound().build());
    }
}