package mg.projetfinal.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {
    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf().disable()  // Pour API REST
                .authorizeHttpRequests()
                .requestMatchers("/api/auth/**").permitAll()  // Endpoints auth ouverts
                .requestMatchers("/api/manager/**").hasRole("MANAGER")
                .requestMatchers("/api/sync/**").permitAll()
                .anyRequest().authenticated()
                .and()
                .sessionManagement().maximumSessions(1);  // Limite sessions (customisez pour durée)
        return http.build();
    }
}