package com.alimertkaya.auth.config;

import com.alimertkaya.auth.domain.entity.User;
import com.alimertkaya.auth.domain.enums.Role;
import com.alimertkaya.auth.infrastructure.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class AdminSeeder implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${admin.email:admin@shopwave.com}")
    private String adminEmail;

    @Value("${admin.password:Admin123!}")
    private String adminPassword;

    @Value("${admin.firstName:Admin}")
    private String adminFirstName;

    @Value("${admin.lastName:User}")
    private String adminLastName;

    @Override
    public void run(ApplicationArguments args) {
        if (userRepository.existsByEmail(adminEmail)) {
            return;
        }

        User admin = User.builder()
                .email(adminEmail)
                .password(passwordEncoder.encode(adminPassword))
                .firstName(adminFirstName)
                .lastName(adminLastName)
                .role(Role.ADMIN)
                .build();

        userRepository.save(admin);
        log.info("Admin kullanıcısı oluşturuldu: {}", adminEmail);
    }
}
