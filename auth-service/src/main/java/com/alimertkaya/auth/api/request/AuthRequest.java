package com.alimertkaya.auth.api.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

// bu veriler degismez (immutable) olduklari icin record
public record AuthRequest (
        @NotBlank(message = "Email boş olamaz")
        @Email(message = "Geçerli bir email giriniz")
        String email,

        @NotBlank(message = "Şifre boş olamaz")
        @Size(min = 6, message = "Şifre en az 6 karakter olmalıdır")
        String password
) {}
