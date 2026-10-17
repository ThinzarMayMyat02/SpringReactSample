package com.example.customers.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;

/**
 * Central CORS configuration, driven by the ALLOWED_ORIGIN environment variable.
 *
 * <p>Accepts a single origin, a comma-separated list, or {@code *}:
 * <pre>
 *   ALLOWED_ORIGIN=https://customers.vercel.app
 *   ALLOWED_ORIGIN=https://customers.vercel.app,http://localhost:5173
 *   ALLOWED_ORIGIN=*
 * </pre>
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final String[] allowedOrigins;

    public WebConfig(@Value("${app.cors.allowed-origin:http://localhost:5173}") String allowedOrigin) {
        this.allowedOrigins = Arrays.stream(allowedOrigin.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isEmpty())
                .toArray(String[]::new);
    }

    @Override
    public void addCorsMappings(@NonNull CorsRegistry registry) {
        registry.addMapping("/api/**")
                // allowedOriginPatterns (not allowedOrigins) so "*" can be combined with credentials.
                .allowedOriginPatterns(allowedOrigins.length > 0 ? allowedOrigins : new String[]{"*"})
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .exposedHeaders("Location")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
