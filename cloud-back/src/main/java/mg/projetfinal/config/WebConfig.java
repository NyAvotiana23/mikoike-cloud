package mg.projetfinal.config;


import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // Allow CORS for all endpoints
                .allowedOrigins("http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://your-frontend-domain.com") // Frontend origins
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Allowed HTTP methods
                .allowedHeaders("Authorization", "Content-Type") // Allowed headers
                .allowCredentials(true) // Allow cookies, authentication headers
                .maxAge(3600); // Cache preflight response for 1 hour
    }
}
