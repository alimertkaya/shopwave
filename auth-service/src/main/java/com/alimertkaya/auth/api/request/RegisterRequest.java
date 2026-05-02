package com.alimertkaya.auth.api.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "Ad boş olamaz")
        String firstName,

        @NotBlank(message = "Soyad boş olamaz")
        String lastName,

        @NotBlank(message = "Email boş olamaz")
        @Email(message = "Geçerli bir email giriniz")
        String email,

        @NotBlank(message = "Şifre boş olamaz")
        @Size(min = 8, message = "Şifre en az 8 karakter olmalıdır")
        String password
) {}
