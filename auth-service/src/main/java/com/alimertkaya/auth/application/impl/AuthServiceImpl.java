package com.alimertkaya.auth.application.impl;

import com.alimertkaya.auth.api.request.AuthRequest;
import com.alimertkaya.auth.api.request.RegisterRequest;
import com.alimertkaya.auth.api.request.UpdateUserRequest;
import com.alimertkaya.auth.api.response.AuthResponse;
import com.alimertkaya.auth.api.response.UserResponse;
import com.alimertkaya.auth.application.service.AuthService;
import com.alimertkaya.auth.domain.entity.User;
import com.alimertkaya.auth.domain.enums.Role;
import com.alimertkaya.auth.infrastructure.repository.UserRepository;
import com.alimertkaya.auth.infrastructure.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    @Override
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new RuntimeException("This email address is already in use");
        }

        User user = User.builder()
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .firstName(request.firstName())
                .lastName(request.lastName())
                .role(Role.CUSTOMER)
                .build();

        userRepository.save(user);
        return buildAuthResponse(user);
    }

    @Override
    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new RuntimeException("No account found with this email address"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new RuntimeException("Incorrect password");
        }

        return buildAuthResponse(user);
    }

    @Override
    public UserResponse getUserFromToken(String bearerToken) {
        String token = bearerToken.startsWith("Bearer ") ? bearerToken.substring(7) : bearerToken;
        if (!jwtUtils.validateToken(token)) {
            throw new RuntimeException("Invalid or expired token");
        }
        String userId = jwtUtils.extractUserId(token);
        User user = userRepository.findById(UUID.fromString(userId))
                .orElseThrow(() -> new RuntimeException("User not found"));
        return new UserResponse(user.getId(), user.getEmail(), user.getFirstName(), user.getLastName(), user.getRole().name(), user.getPhone());
    }

    @Override
    public UserResponse getUserById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));
        return new UserResponse(user.getId(), user.getEmail(), user.getFirstName(), user.getLastName(), user.getRole().name(), user.getPhone());
    }

    @Override
    public UserResponse updateMe(String bearerToken, UpdateUserRequest request) {
        String token = bearerToken.startsWith("Bearer ") ? bearerToken.substring(7) : bearerToken;
        if (!jwtUtils.validateToken(token)) {
            throw new RuntimeException("Invalid or expired token");
        }
        String userId = jwtUtils.extractUserId(token);
        User user = userRepository.findById(UUID.fromString(userId))
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.firstName() != null && !request.firstName().isBlank()) {
            user.setFirstName(request.firstName());
        }
        if (request.lastName() != null && !request.lastName().isBlank()) {
            user.setLastName(request.lastName());
        }
        if (request.email() != null && !request.email().isBlank() && !request.email().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.email())) {
                throw new RuntimeException("This email address is already in use");
            }
            user.setEmail(request.email());
        }
        if (request.phone() != null && !request.phone().isBlank()) {
            user.setPhone(request.phone());
        }

        userRepository.save(user);
        return new UserResponse(user.getId(), user.getEmail(), user.getFirstName(), user.getLastName(), user.getRole().name(), user.getPhone());
    }

    private AuthResponse buildAuthResponse(User user) {
        String token = jwtUtils.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        UserResponse userResponse = new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole().name(),
                user.getPhone()
        );
        return new AuthResponse(token, userResponse);
    }
}
