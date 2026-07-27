package uk.jimsimrodev.pequenos_sanos.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Global CORS configuration.
 * Allows the frontend origin defined in {@code cors-settings.url} to call all
 * API endpoints with the standard HTTP methods used by the app.
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Value("${cors-settings.url:*}")
    private String urlCors;

    /**
     * Registers CORS mappings for all endpoints.
     *
     * @param registry the CORS registry to configure
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns(urlCors)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
