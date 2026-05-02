package com.alimertkaya.gateway.filter;

import com.alimertkaya.gateway.util.JwtUtils;
import io.jsonwebtoken.Claims;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class AuthenticationFilter extends AbstractGatewayFilterFactory<AuthenticationFilter.Config> {

    @Autowired
    private JwtUtils jwtUtils;

    private AuthenticationFilter() {
        super(Config.class);
    }

    public static class Config {

    }

    @Override
    public GatewayFilter apply(Config config) {
        return (((exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();

            // OPTIONS preflight isteklerini JWT kontrolü olmadan geçir (CORS için)
            if (HttpMethod.OPTIONS.equals(request.getMethod())) {
                return chain.filter(exchange);
            }

            String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

            if (authHeader == null) {
                return onError(exchange, "Yetkilendirme basligi (Authorization header) bulunamadi", HttpStatus.UNAUTHORIZED);
            }

            if (authHeader.startsWith("Bearer")) {
                authHeader = authHeader.substring(7);
            } else {
                return onError(exchange, "Gecersiz Authorization formati", HttpStatus.UNAUTHORIZED);
            }

            if (jwtUtils.isInvalid(authHeader)) {
                return onError(exchange, "Gecersiz veya suresi dolmus JWT Token", HttpStatus.UNAUTHORIZED);
            }

            Claims claims = jwtUtils.getAllClaimsFromToken(authHeader);

            ServerHttpRequest modifiedRequest = exchange.getRequest().mutate()
                    .header("X-User-Id", claims.getSubject())
                    .header("X-User-Role", String.valueOf(claims.get("role")))
                    .build();

            return chain.filter(exchange.mutate().request(modifiedRequest).build());
        }));
    }

    private Mono<Void> onError(ServerWebExchange exchange, String err, HttpStatus httpStatus) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(httpStatus);

        // Browser'ın 401'i okuyabilmesi için CORS header'larını ekle
        String origin = exchange.getRequest().getHeaders().getOrigin();
        if (origin != null) {
            HttpHeaders headers = response.getHeaders();
            headers.set(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, origin);
            headers.set(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true");
        }

        return response.setComplete();
    }
}
