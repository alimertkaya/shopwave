package com.alimertkaya.auth.application.impl;

import com.alimertkaya.auth.api.request.AuthRequest;
import com.alimertkaya.auth.api.request.RegisterRequest;
import com.alimertkaya.auth.api.response.AuthResponse;
import com.alimertkaya.auth.domain.entity.User;
import com.alimertkaya.auth.domain.enums.Role;
import com.alimertkaya.auth.infrastructure.repository.UserRepository;
import com.alimertkaya.auth.infrastructure.security.JwtUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtils jwtUtils;

    @InjectMocks
    private AuthServiceImpl authService;

    private static final String EMAIL = "test@shopwave.com";
    private static final String PASSWORD = "password123";
    private static final String HASHED_PASSWORD = "$2a$10$hashedPassword";
    private static final String TOKEN = "eyJhbGciOiJIUzI1NiJ9.mock.token";

    private User mockUser;

    @BeforeEach
    void setUp() {
        mockUser = User.builder()
                .id(UUID.randomUUID())
                .email(EMAIL)
                .password(HASHED_PASSWORD)
                .firstName("Test")
                .lastName("User")
                .role(Role.CUSTOMER)
                .build();
    }

    // ─── register ───────────────────────────────────────────────────────────────

    @Test
    void register_whenNewEmail_thenUserSavedAndTokenReturned() {
        // given
        RegisterRequest request = new RegisterRequest("Test", "User", EMAIL, PASSWORD);
        when(userRepository.existsByEmail(EMAIL)).thenReturn(false);
        when(passwordEncoder.encode(PASSWORD)).thenReturn(HASHED_PASSWORD);
        when(userRepository.save(any(User.class))).thenReturn(mockUser);
        when(jwtUtils.generateToken(any(), anyString(), anyString())).thenReturn(TOKEN);

        // when
        AuthResponse response = authService.register(request);

        // then
        assertThat(response).isNotNull();
        assertThat(response.accessToken()).isEqualTo(TOKEN);
        assertThat(response.user().email()).isEqualTo(EMAIL);
        assertThat(response.user().role()).isEqualTo(Role.CUSTOMER.name());

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        assertThat(userCaptor.getValue().getPassword()).isEqualTo(HASHED_PASSWORD);
    }

    @Test
    void register_whenEmailAlreadyExists_thenThrowsRuntimeException() {
        // given
        RegisterRequest request = new RegisterRequest("Test", "User", EMAIL, PASSWORD);
        when(userRepository.existsByEmail(EMAIL)).thenReturn(true);

        // when / then
        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("already in use");

        verify(userRepository, never()).save(any());
    }

    // ─── login ──────────────────────────────────────────────────────────────────

    @Test
    void login_whenValidCredentials_thenTokenReturned() {
        // given
        AuthRequest request = new AuthRequest(EMAIL, PASSWORD);
        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(mockUser));
        when(passwordEncoder.matches(PASSWORD, HASHED_PASSWORD)).thenReturn(true);
        when(jwtUtils.generateToken(any(), anyString(), anyString())).thenReturn(TOKEN);

        // when
        AuthResponse response = authService.login(request);

        // then
        assertThat(response.accessToken()).isEqualTo(TOKEN);
        assertThat(response.user().email()).isEqualTo(EMAIL);
    }

    @Test
    void login_whenUserNotFound_thenThrowsRuntimeException() {
        // given
        AuthRequest request = new AuthRequest("notexist@test.com", PASSWORD);
        when(userRepository.findByEmail("notexist@test.com")).thenReturn(Optional.empty());

        // when / then
        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("No account found");
    }

    @Test
    void login_whenWrongPassword_thenThrowsRuntimeException() {
        // given
        AuthRequest request = new AuthRequest(EMAIL, "wrongpassword");
        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(mockUser));
        when(passwordEncoder.matches("wrongpassword", HASHED_PASSWORD)).thenReturn(false);

        // when / then
        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Incorrect password");
    }
}
