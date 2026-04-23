package com.hospital.controller;

import java.util.Collection;
import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.hospital.dto.request.LoginRequest;
import com.hospital.entity.Admin;
import com.hospital.entity.Doctor;
import com.hospital.repository.AdminRepository;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.PatientRepository;
import com.hospital.repository.UserRepository;
import com.hospital.security.JwtTokenUtil;
import com.hospital.entity.User;

@RestController
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
private UserRepository userRepository; // ← add this field

    @Autowired
private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private AdminRepository adminRepository;   // ← added

    @Autowired
    private DoctorRepository doctorRepository; // ← added (for doctor name on login)

    @PostMapping("/api/setup-admin")
public ResponseEntity<?> setupAdmin() {
    try {
        String email    = "admin@hospital.com";
        String password = "Admin@123";

        // Delete existing if wrong
        userRepository.findByEmail(email).ifPresent(u -> userRepository.delete(u));

        // Create with properly encoded password
        User user = User.builder()
            .email(email)
            .password(passwordEncoder.encode(password))
            .role("ROLE_ADMIN")
            .isActive(true)
            .build();
        userRepository.save(user);

        // Create admin profile if not exists
        if (adminRepository.findByEmail(email) == null) {
            Admin admin = new Admin();
            admin.setFirstName("Super");
            admin.setLastName("Admin");
            admin.setEmail(email);
            admin.setPhoneNumber("9999999999");
            adminRepository.save(admin);
        }

        return ResponseEntity.ok(Map.of(
            "success",  true,
            "message",  "Admin created. Login with Admin@123",
            "email",    email
        ));
    } catch (Exception e) {
        return ResponseEntity.internalServerError()
            .body(Map.of("success", false, "message", e.getMessage()));
    }
}

    @PostMapping("/api/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequest loginRequest) {
        String email    = loginRequest.getEmail();
        String password = loginRequest.getPassword();

        logger.info("Attempting to authenticate user with email: {}", email);

        if (email == null || email.isEmpty() || password == null || password.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                        "success", false,
                        "message", "Email and password must not be empty."
                    ));
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, password)
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
            String role = authorities.isEmpty() ? "" : authorities.iterator().next().getAuthority();

            String token = jwtTokenUtil.generateToken(userDetails, role);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("email",   userDetails.getUsername());
            response.put("role",    role);
            response.put("token",   token);

            // ── ROLE_PATIENT ───────────────────────────────────────────────
            if ("ROLE_PATIENT".equals(role)) {
                patientRepository.findByEmail(email).ifPresent(patient -> {
                    response.put("patientId", patient.getPatientId());
                    response.put("firstName", patient.getFirstName());
                    response.put("lastName",  patient.getLastName());
                });
            }

            // ── ROLE_DOCTOR ────────────────────────────────────────────────
            if ("ROLE_DOCTOR".equals(role)) {
                doctorRepository.findByEmail(email).ifPresent(doctor -> {
                    response.put("doctorId",  doctor.getId());
                    response.put("firstName", doctor.getFirstName());
                    response.put("lastName",  doctor.getLastName());
                    response.put("specialization", doctor.getSpecialization());
                });
            }

            // ── ROLE_ADMIN ─────────────────────────────────────────────────
            if ("ROLE_ADMIN".equals(role)) {
                Admin admin = adminRepository.findByEmail(email); // ← fetch admin name
                if (admin != null) {
                    response.put("adminId",   admin.getAdminId());
                    response.put("firstName", admin.getFirstName());
                    response.put("lastName",  admin.getLastName());
                }
                response.put("message", "Welcome Admin");
            }

            logger.info("Login successful for: {} with role: {}", email, role);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Authentication failed for: {}. Error: {}", email, e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                        "success", false,
                        "message", "Invalid email or password."
                    ));
        }
    }

    @org.springframework.web.bind.annotation.GetMapping("/api/generate-hash")
public ResponseEntity<?> generateHash() {
    try {
        String raw  = "Admin@123";
        String hash = passwordEncoder.encode(raw); // passwordEncoder is already @Autowired
        return ResponseEntity.ok(Map.of("password", raw, "hash", hash));
    } catch (Exception e) {
        return ResponseEntity.internalServerError()
            .body(Map.of("error", e.getMessage()));
    }
}
}