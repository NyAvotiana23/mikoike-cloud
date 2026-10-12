package mg.projetfinal.service;

import mg.projetfinal.dto.UserDTO;
import mg.projetfinal.entity.User;
import mg.projetfinal.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;

import java.util.NoSuchElementException;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock private UserRepository userRepository;
    @InjectMocks private UserService service;

    @Test
    void getUserDTO_decoupeLeNomComplet_enPrenomEtNom() {
        User user = User.builder().id(1L).email("a@b.mg").name("Jean Rakoto Andry").build();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        UserDTO dto = service.getUserDTO(1L);

        assertEquals("Jean", dto.getPrenom());
        assertEquals("Rakoto Andry", dto.getNom());
    }

    @Test
    void getUserDTO_idInconnu_leveNoSuchElement() {
        when(userRepository.findById(9L)).thenReturn(Optional.empty());
        assertThrows(NoSuchElementException.class, () -> service.getUserDTO(9L));
    }

    @Test
    void deleteUser_idInconnu_neSupprimeRien() {
        when(userRepository.existsById(9L)).thenReturn(false);

        assertThrows(NoSuchElementException.class, () -> service.deleteUser(9L));

        verify(userRepository, never()).deleteById(9L);
    }

    @Test
    void deleteUser_utilisateurReference_leveUneErreurMetier() {
        when(userRepository.existsById(1L)).thenReturn(true);
        doThrow(new DataIntegrityViolationException("fk")).when(userRepository).deleteById(1L);

        assertThrows(IllegalStateException.class, () -> service.deleteUser(1L));
    }
}
