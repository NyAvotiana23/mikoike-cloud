package mg.projetfinal.controller;

import mg.projetfinal.entity.User;
import mg.projetfinal.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired private AuthService service;

    @PostMapping("/register")
    public User register(@RequestBody User user) {
        return service.register(user);
    }

    @PostMapping("/login")
    public String login(@RequestParam String email, @RequestParam String pwd) {
        return service.login(email, pwd);
    }

    @PutMapping("/update/{id}")
    public void update(@PathVariable Long id, @RequestBody User updates) {
        service.updateUser(id, updates);
    }

    @PostMapping("/unlock/{email}")  // Pour Manager
    public void unlock(@PathVariable String email) {
        // Vérifiez role Manager avec @PreAuthorize("hasRole('MANAGER')")
        trackingService.unlock(email);
    }
}