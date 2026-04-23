package com.hospital.controller;

import com.hospital.entity.Doctor;
import com.hospital.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;



@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorRepository doctorRepository;
        @Autowired
private PasswordEncoder passwordEncoder;

    // GET /api/doctors/all
    @GetMapping("/all")
    public ResponseEntity<?> getAllDoctors() {
        try {
            List<Doctor> doctors = doctorRepository.findAll();
            List<Map<String, Object>> result = doctors.stream().map(doc -> {
                Map<String, Object> map = new java.util.LinkedHashMap<>();
                map.put("id",             doc.getId());
                map.put("firstName",      doc.getFirstName());
                map.put("lastName",       doc.getLastName());
                map.put("specialization", doc.getSpecialization());
                map.put("email",          doc.getEmail());
                map.put("phoneNumber",    doc.getPhoneNumber());
                map.put("gender",         doc.getGender());
                map.put("city",           doc.getCity());
                map.put("state",          doc.getState());
                map.put("bloodGroup",     doc.getBloodGroup());
                map.put("joiningDate",    doc.getJoiningDate());
                return map;
            }).collect(Collectors.toList());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false, "message", e.getMessage()
            ));
        }
    }

    @PostMapping("/register")
public ResponseEntity<?> registerDoctor(@RequestBody Doctor doctor) {
    try {
        // Check email not already taken
        if (doctorRepository.findByEmail(doctor.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Email already registered."
            ));
        }
        // Hash the password before saving
        doctor.setPassword(passwordEncoder.encode(doctor.getPassword()));
        Doctor saved = doctorRepository.save(doctor);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Doctor registered successfully",
            "doctorId", saved.getId()
        ));
    } catch (Exception e) {
        return ResponseEntity.internalServerError().body(Map.of(
            "success", false, "message", e.getMessage()
        ));
    }
}

    // DELETE /api/doctors/{id}  ← ADD THIS
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDoctor(@PathVariable Long id) {
        try {
            if (!doctorRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            doctorRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("success", true, "message", "Doctor deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false, "message", e.getMessage()
            ));
        }
    }
}