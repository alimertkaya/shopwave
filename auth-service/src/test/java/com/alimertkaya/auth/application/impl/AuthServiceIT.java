package com.alimertkaya.auth.application.impl;

import com.alimertkaya.auth.api.request.AuthRequest;
import com.alimertkaya.auth.api.request.RegisterRequest;
import com.alimertkaya.auth.api.response.AuthResponse;
import com.alimertkaya.auth.application.service.AuthService;
import com.alimertkaya.auth.infrastructure.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.transaction.annotation.Transactional;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * AuthServiceImpl için Testcontainers tabanlı integration testleri.
 * Gerçek PostgreSQL container kullanır; her test @Transactional ile otomatik geri alınır.
 */
@SpringBootTest
@Testcontainers
@Transactional
class AuthServiceIT {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15-alpine");

    @DynamicPropertySource
    static void configureDataSource(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    private static RegisterRequest registerRequest(String email, String password) {
        return new RegisterRequest("Test", "User", email, password);
    }

    // ─── register ────────────────────────────────────────────────────────────────

    @Test
    void register_whenValidRequest_thenUserPersistedAndTokenReturned() {
        // given
        RegisterRequest request = registerRequest("newuser@example.com", "password123");

        // when
        AuthResponse response = authService.register(request);

        // then
        assertThat(response.accessToken()).isNotBlank();
        assertThat(response.user().email()).isEqualTo("newuser@example.com");
        assertThat(response.user().role()).isEqualTo("CUSTOMER");
        assertThat(userRepository.existsByEmail("newuser@example.com")).isTrue();
    }

    @Test
    void register_whenEmailAlreadyExists_thenExceptionThrown() {
        // given
        authService.register(registerRequest("duplicate@example.com", "pass12345"));

        // when / then
        assertThatThrownBy(() -> authService.register(registerRequest("duplicate@example.com", "otherpass")))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("already in use");
    }

    // ─── login ───────────────────────────────────────────────────────────────────

    @Test
    void login_whenValidCredentials_thenTokenReturned() {
        // given
        String email = "loginuser@example.com";
        String password = "securePass9";
        authService.register(registerRequest(email, password));

        // when
        AuthResponse response = authService.login(new AuthRequest(email, password));

        // then
        assertThat(response.accessToken()).isNotBlank();
        assertThat(response.user().email()).isEqualTo(email);
    }

    @Test
    void login_whenWrongPassword_thenExceptionThrown() {
        // given
        authService.register(registerRequest("wrongpass@example.com", "correctPass1"));

        // when / then
        assertThatThrownBy(() -> authService.login(new AuthRequest("wrongpass@example.com", "wrongPass")))
                .isInstanceOf(RuntimeException.class);
    }

    @Test
    void login_whenUserNotFound_thenExceptionThrown() {
        // when / then
        assertThatThrownBy(() -> authService.login(new AuthRequest("ghost@example.com", "any")))
                .isInstanceOf(RuntimeException.class);
    }
}
