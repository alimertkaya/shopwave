package com.alimertkaya.auth.application.service;

import com.alimertkaya.auth.api.request.AuthRequest;
import com.alimertkaya.auth.api.request.RegisterRequest;
import com.alimertkaya.auth.api.request.UpdateUserRequest;
import com.alimertkaya.auth.api.response.AuthResponse;
import com.alimertkaya.auth.api.response.UserResponse;

public interface AuthService {

    /**
     * Yeni bir kullanıcı kaydeder. Email benzersizliğini kontrol eder,
     * şifreyi BCrypt ile hashler ve JWT token üretip döndürür.
     *
     * @param request Ad, soyad, email ve şifreyi içeren kayıt isteği
     * @return JWT token ve kullanıcı bilgilerini içeren yanıt
     * @throws RuntimeException Email zaten kayıtlıysa
     */
    AuthResponse register(RegisterRequest request);

    /**
     * Mevcut kullanıcıyı doğrular. Email ve şifre kontrolü yapar,
     * başarılıysa JWT token üretip döndürür.
     *
     * @param request Email ve şifreyi içeren giriş isteği
     * @return JWT token ve kullanıcı bilgilerini içeren yanıt
     * @throws RuntimeException Kullanıcı bulunamazsa veya şifre yanlışsa
     */
    AuthResponse login(AuthRequest request);

    /**
     * Bearer token'dan kullanıcı bilgilerini döndürür.
     *
     * @param bearerToken "Bearer &lt;token&gt;" formatında Authorization header değeri
     * @return Kullanıcı bilgilerini içeren yanıt
     * @throws RuntimeException Token geçersizse veya kullanıcı bulunamazsa
     */
    UserResponse getUserFromToken(String bearerToken);

    /**
     * ID'ye göre kullanıcı bilgilerini döndürür (admin).
     *
     * @param id Kullanıcı UUID'si
     * @return Kullanıcı bilgileri
     */
    UserResponse getUserById(java.util.UUID id);

    /**
     * Token sahibi kullanıcının bilgilerini (ad, soyad, e-posta) günceller.
     *
     * @param bearerToken Authorization header değeri
     * @param request     Güncellenecek alanlar
     * @return Güncel kullanıcı bilgileri
     */
    UserResponse updateMe(String bearerToken, UpdateUserRequest request);
}
