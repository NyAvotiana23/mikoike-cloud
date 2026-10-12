package mg.projetfinal.controller;

import mg.projetfinal.dto.RegisterAdminRequest;
import mg.projetfinal.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;

class AdminControllerSecretKeyTest {

    private AdminController controllerWithKey(String configuredKey) {
        AdminController controller = new AdminController(mock(AuthService.class));
        ReflectionTestUtils.setField(controller, "adminSecretKey", configuredKey);
        return controller;
    }

    private RegisterAdminRequest requestWithKey(String key) {
        RegisterAdminRequest r = new RegisterAdminRequest();
        r.setSecretKey(key);
        return r;
    }

    @Test
    void registerAdmin_cleNonConfiguree_refuseMemeUneCleVide() {
        var response = controllerWithKey("").registerAdmin(requestWithKey(""));
        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
    }

    @Test
    void registerAdmin_mauvaiseCle_estRefusee() {
        var response = controllerWithKey("secret").registerAdmin(requestWithKey("autre"));
        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
    }

    @Test
    void registerAdmin_cleAbsente_estRefusee() {
        var response = controllerWithKey("secret").registerAdmin(requestWithKey(null));
        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
    }
}
