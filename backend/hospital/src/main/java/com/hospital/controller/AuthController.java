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
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.hospital.dto.request.LoginRequest;
import com.hospital.entity.Patient;
import com.hospital.repository.PatientRepository;
import com.hospital.security.JwtTokenUtil;

@RestController
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Autowired
    private PatientRepository patientRepository;

    @PostMapping("/api/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequest loginRequest) {
        String email    = loginRequest.getEmail();
        String password = loginRequest.getPassword();

        logger.info("Attempting to authenticate user with email: {}", email);

        if (email == null || email.isEmpty() || password == null || password.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Email and password must not be empty.");
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

            // Build response
            Map<String, Object> response = new HashMap<>();
            response.put("email", userDetails.getUsername());
            response.put("role", role);
            response.put("token", token);

            // ── Include patientId so frontend can book/view appointments ──
            if ("ROLE_PATIENT".equals(role)) {
                patientRepository.findByEmail(email).ifPresent(patient -> {
                    response.put("patientId", patient.getPatientId());
                    response.put("firstName", patient.getFirstName());
                    response.put("lastName",  patient.getLastName());
                });
            }

            // ── Include doctorId for doctors ──────────────────────────────
            if ("ROLE_DOCTOR".equals(role)) {
                response.put("message", "Welcome Doctor");
            }

            // ── Admin ─────────────────────────────────────────────────────
            if ("ROLE_ADMIN".equals(role)) {
                response.put("message", "Welcome Admin");
            }

            logger.info("Login successful for: {} with role: {}", email, role);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Authentication failed for: {}. Error: {}", email, e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid email or password.");
        }
    }
}