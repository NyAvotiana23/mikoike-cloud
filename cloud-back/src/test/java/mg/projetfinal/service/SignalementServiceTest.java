package mg.projetfinal.service;

import mg.projetfinal.entity.Signalement;
import mg.projetfinal.entity.SignalementStatus;
import mg.projetfinal.entity.User;
import mg.projetfinal.repository.HistoriqueStatusRepository;
import mg.projetfinal.repository.SignalementRepository;
import mg.projetfinal.repository.SignalementStatusRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SignalementServiceTest {

    @Mock private SignalementRepository signalementRepository;
    @Mock private HistoriqueStatusService historiqueStatusService;
    @Mock private FirebasePushNotificationService pushNotificationService;
    @Mock private SignalementStatusRepository statusRepository;
    @Mock private HistoriqueStatusRepository historiqueStatusRepository;
    @InjectMocks private SignalementService service;

    private final User user = User.builder().id(7L).build();

    private Signalement draft(String description) {
        return Signalement.builder()
                .latitude(new BigDecimal("-18.8792"))
                .longitude(new BigDecimal("47.5079"))
                .description(description)
                .build();
    }

    @Test
    void create_sansStatut_appliqueLeStatutNouveau() {
        SignalementStatus nouveau = SignalementStatus.builder().code("NOUVEAU").build();
        when(statusRepository.findByCode("NOUVEAU")).thenReturn(Optional.of(nouveau));
        when(signalementRepository.save(any(Signalement.class))).thenAnswer(i -> i.getArgument(0));

        Signalement created = service.create(draft("Nid de poule"), user);

        assertSame(nouveau, created.getStatus());
        assertSame(user, created.getUser());
        verify(historiqueStatusService).createInitialHistorique(created, user);
    }

    @Test
    void create_avecStatut_ne_consulte_pas_le_statut_par_defaut() {
        SignalementStatus enCours = SignalementStatus.builder().code("EN_COURS").build();
        Signalement s = draft("Nid de poule");
        s.setStatus(enCours);
        when(signalementRepository.save(any(Signalement.class))).thenAnswer(i -> i.getArgument(0));

        assertSame(enCours, service.create(s, user).getStatus());
        verify(statusRepository, never()).findByCode(any());
    }

    @Test
    void create_statutParDefautAbsent_leveUneErreurExplicite() {
        when(statusRepository.findByCode("NOUVEAU")).thenReturn(Optional.empty());

        IllegalStateException e = assertThrows(IllegalStateException.class,
                () -> service.create(draft("Nid de poule"), user));

        assertEquals("Statut par défaut introuvable : NOUVEAU", e.getMessage());
        verify(signalementRepository, never()).save(any());
    }

    @Test
    void create_descriptionVide_estRefusee() {
        assertThrows(IllegalArgumentException.class, () -> service.create(draft("   "), user));
    }

    @Test
    void create_sansCoordonnees_estRefuse() {
        Signalement s = draft("x");
        s.setLatitude(null);
        assertThrows(IllegalArgumentException.class, () -> service.create(s, user));
    }

    @Test
    void findByLocation_ne_retourne_que_les_points_dans_le_rayon() {
        Signalement proche = draft("proche");
        Signalement loin = draft("loin");
        loin.setLatitude(new BigDecimal("-17.0"));
        when(signalementRepository.findAll()).thenReturn(java.util.List.of(proche, loin));

        var result = service.findByLocation(new BigDecimal("-18.8792"), new BigDecimal("47.5079"), 5);

        assertEquals(java.util.List.of(proche), result);
    }

    @Test
    void averageDays_moyenneEnJours() {
        var result = SignalementService.averageDays(java.util.List.of(
                java.time.Duration.ofDays(2), java.time.Duration.ofDays(4)));

        assertEquals(Optional.of(3.0), result);
    }

    @Test
    void averageDays_aucunTermine_estVide() {
        assertEquals(Optional.empty(), SignalementService.averageDays(java.util.List.of()));
    }
}
