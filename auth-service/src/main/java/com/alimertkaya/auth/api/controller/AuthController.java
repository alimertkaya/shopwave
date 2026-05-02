package com.alimertkaya.auth.api.controller;

import com.alimertkaya.auth.api.request.AuthRequest;
import com.alimertkaya.auth.api.request.RegisterRequest;
import com.alimertkaya.auth.api.request.UpdateUserRequest;
import com.alimertkaya.auth.api.response.AuthResponse;
import com.alimertkaya.auth.api.response.UserResponse;
import com.alimertkaya.auth.application.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(@RequestHeader("Authorization") String authorization) {
        UserResponse response = authService.getUserFromToken(authorization);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable java.util.UUID id) {
        return ResponseEntity.ok(authService.getUserById(id));
    }

    @PatchMapping("/me")
    public ResponseEntity<UserResponse> updateMe(
            @RequestHeader("Authorization") String authorization,
            @Valid @RequestBody UpdateUserRequest request) {
        return ResponseEntity.ok(authService.updateMe(authorization, request));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.noContent().build();
    }
}
