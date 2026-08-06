package com.qr_restaurant.qr_restaurant_backend.security;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitingFilter implements Filter {

    private static final int MAX_REQUESTS_PER_MINUTE = 120;
    private final Map<String, RequestCounter> requestCounts = new ConcurrentHashMap<>();

    private static class RequestCounter {
        long startTime;
        int count;

        RequestCounter(long startTime) {
            this.startTime = startTime;
            this.count = 1;
        }
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        if (request instanceof HttpServletRequest httpRequest && response instanceof HttpServletResponse httpResponse) {
            String clientIp = getClientIp(httpRequest);
            long currentTime = System.currentTimeMillis();

            RequestCounter counter = requestCounts.compute(clientIp, (ip, existingCounter) -> {
                if (existingCounter == null || (currentTime - existingCounter.startTime) > 60000) {
                    return new RequestCounter(currentTime);
                } else {
                    existingCounter.count++;
                    return existingCounter;
                }
            });

            if (counter.count > MAX_REQUESTS_PER_MINUTE) {
                httpResponse.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                httpResponse.getWriter().write("{\"error\": \"Rate limit exceeded. Please try again later.\"}");
                return;
            }
        }

        chain.doFilter(request, response);
    }

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isEmpty() || "unknown".equalsIgnoreCase(xfHeader)) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0].trim();
    }
}
