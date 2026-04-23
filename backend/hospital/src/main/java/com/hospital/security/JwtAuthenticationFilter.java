package com.hospital.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    // ── Public paths — JWT filter skips these entirely ────────────────────
    private static final List<String> PUBLIC_PATHS = List.of(
        "/api/login",
        "/api/register",
        "/api/patients/register",
        "/api/doctors/register",
        "/api/doctors/all",
        "/error"
    );

    // ── Public path prefixes — anything starting with these is skipped ────
    private static final List<String> PUBLIC_PREFIXES = List.of(
        "/api/appointments"
    );

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain chain
    ) throws ServletException, IOException {

        // ── 1. Let ALL preflight (OPTIONS) requests pass immediately ───────
        // Browser sends OPTIONS before every cross-origin request.
        // If this filter processes it, CORS headers are never added → blocked.
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            logger.debug("Skipping JWT filter for OPTIONS preflight: {}", request.getRequestURI());
            response.setStatus(HttpServletResponse.SC_OK);
            chain.doFilter(request, response);
            return;
        }

        // ── 2. Skip JWT check for public endpoints ─────────────────────────
        String path = request.getServletPath();

        boolean isPublicPath = PUBLIC_PATHS.contains(path)
            || PUBLIC_PREFIXES.stream().anyMatch(path::startsWith);

        if (isPublicPath) {
            logger.debug("Skipping JWT filter for public path: {}", path);
            chain.doFilter(request, response);
            return;
        }

        // ── 3. JWT validation for all protected endpoints ──────────────────
        try {
            String token = getTokenFromRequest(request);
            logger.debug("Processing token: {}", token != null ? "Present" : "Not present");

            if (token != null) {
                String username = jwtTokenUtil.extractUsername(token);
                if (username != null &&
                        SecurityContextHolder.getContext().getAuthentication() == null) {

                    UserDetails userDetails =
                            userDetailsService.loadUserByUsername(username);

                    if (jwtTokenUtil.validateToken(token, userDetails)) {
                        List<SimpleGrantedAuthority> authorities =
                            jwtTokenUtil.extractRoles(token).stream()
                                .map(SimpleGrantedAuthority::new)
                                .collect(Collectors.toList());

                        UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                userDetails, null, authorities);

                        authentication.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request));

                        SecurityContextHolder.getContext().setAuthentication(authentication);
                        logger.debug("Authentication successful for user: {}", username);
                    }
                }
            }
        } catch (Exception e) {
            logger.error("Authentication error: {}", e.getMessage());
            SecurityContextHolder.clearContext();
        }

        chain.doFilter(request, response);
    }

    private String getTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}