package com.alimertkaya.auth.api.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public record UpdateUserRequest(
        @Size(min = 2, message = "Ad en az 2 karakter olmalı")
        String firstName,

        @Size(min = 2, message = "Soyad en az 2 karakter olmalı")
        String lastName,

        @Email(message = "Geçerli bir e-posta adresi girin")
        String email,

        String phone
) {}
