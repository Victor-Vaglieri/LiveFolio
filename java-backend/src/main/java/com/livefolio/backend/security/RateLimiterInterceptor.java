package com.livefolio.backend.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.concurrent.TimeUnit;

/**
 * Interceptor para limitar requisições usando Redis.
 */
@Component
public class RateLimiterInterceptor implements HandlerInterceptor {

    private final StringRedisTemplate redisTemplate;
    private static final int LIMIT = 60;
    private static final int WINDOW_SECONDS = 60;

    public RateLimiterInterceptor(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // TODO: Usa o IP como chave. Em produção pode ser um token ou o IP fornecido pelo proxy
        String ip = request.getRemoteAddr();
        String key = "rate_limit:" + ip;

        String currentVal = redisTemplate.opsForValue().get(key);

        if (currentVal != null && Integer.parseInt(currentVal) >= LIMIT) {
            response.setStatus(429);
            response.getWriter().write("Rate limit exceeded");
            return false;
        }

        if (currentVal == null) {
            redisTemplate.opsForValue().set(key, "1", WINDOW_SECONDS, TimeUnit.SECONDS);
        } else {
            redisTemplate.opsForValue().increment(key);
        }

        return true; 
    }
}
