package mg.projetfinal.service;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.UserRecord;
import com.google.firebase.cloud.FirestoreClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mg.projetfinal.entity.*;
import mg.projetfinal.enums.*;
import mg.projetfinal.repository.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FirebaseSyncService {

    private final UserRepository userRepository;
    private final SignalementRepository signalementRepository;
    private final EntrepriseRepository entrepriseRepository;
    private final SignalementStatusRepository signalementStatusRepository;
    private final SyncQueueRepository syncQueueRepository;
    private final SyncHistoryRepository syncHistoryRepository;

    private static final String COLLECTION_USERS = "users";
    private static final String COLLECTION_SIGNALEMENTS = "signalements";
    private static final String COLLECTION_ENTREPRISES = "entreprises";
    private static final String COLLECTION_STATUS = "signalement_status";

    // ==================== SYNCHRONISATION BIDIRECTIONNELLE ====================

    /**
     * Synchronisation complète bidirectionnelle
     * 1. PostgreSQL → Firebase (push local changes)
     * 2. Firebase → PostgreSQL (pull remote changes)
     */
    @Transactional
    public SyncResult syncAll() {
        log.info("=== Début de la synchronisation bidirectionnelle complète ===");
        SyncResult result = new SyncResult();

        try {
            // Phase 1: Push PostgreSQL → Firebase
            log.info("Phase 1: Synchronisation PostgreSQL → Firebase");
            result.addPostgresToFirebase(syncPostgresToFirebase());

            // Phase 2: Pull Firebase → PostgreSQL
            log.info("Phase 2: Synchronisation Firebase → PostgreSQL");
            result.addFirebaseToPostgres(syncFirebaseToPostgres());

            log.info("=== Synchronisation complète terminée avec succès ===");
            result.setSuccess(true);
        } catch (Exception e) {
            log.error("Erreur lors de la synchronisation bidirectionnelle", e);
            result.setSuccess(false);
            result.setErrorMessage(e.getMessage());
        }

        return result;
    }

    // ==================== POSTGRES → FIREBASE ====================

    /**
     * Synchronise toutes les entités de PostgreSQL vers Firebase
     */
    @Transactional
    public SyncResult syncPostgresToFirebase() {
        SyncResult result = new SyncResult();

        try {
            // Synchroniser les utilisateurs
            List<User> unsyncedUsers = userRepository.findNotSynced();
            for (User user : unsyncedUsers) {
                try {
                    syncUserToFirebase(user);
                    result.incrementSuccess("users");
                } catch (Exception e) {
                    log.error("Erreur sync user {}: {}", user.getId(), e.getMessage());
                    result.incrementError("users");
                    recordSyncError(EntityType.USER, user.getId(), e.getMessage());
                }
            }

            // Synchroniser les signalements
            List<Signalement> unsyncedSignalements = signalementRepository.findByFirebaseSyncedFalse();
            for (Signalement signalement : unsyncedSignalements) {
                try {
                    syncSignalementToFirebase(signalement);
                    result.incrementSuccess("signalements");
                } catch (Exception e) {
                    log.error("Erreur sync signalement {}: {}", signalement.getId(), e.getMessage());
                    result.incrementError("signalements");
                    recordSyncError(EntityType.SIGNALEMENT, signalement.getId(), e.getMessage());
                }
            }

            // Synchroniser les entreprises
            List<Entreprise> allEntreprises = entrepriseRepository.findAll();
            for (Entreprise entreprise : allEntreprises) {
                try {
                    syncEntrepriseToFirebase(entreprise);
                    result.incrementSuccess("entreprises");
                } catch (Exception e) {
                    log.error("Erreur sync entreprise {}: {}", entreprise.getId(), e.getMessage());
                    result.incrementError("entreprises");
                }
            }

            // Synchroniser les status
            List<SignalementStatus> allStatus = signalementStatusRepository.findAllByOrderByOrdreAsc();
            for (SignalementStatus status : allStatus) {
                try {
                    syncStatusToFirebase(status);
                    result.incrementSuccess("status");
                } catch (Exception e) {
                    log.error("Erreur sync status {}: {}", status.getId(), e.getMessage());
                    result.incrementError("status");
                }
            }

            result.setSuccess(true);
        } catch (Exception e) {
            log.error("Erreur globale sync Postgres → Firebase", e);
            result.setSuccess(false);
            result.setErrorMessage(e.getMessage());
        }

        return result;
    }

    /**
     * Synchronise un utilisateur vers Firebase (Auth + Firestore)
     */
    @Transactional
    public void syncUserToFirebase(User user) throws FirebaseAuthException, ExecutionException, InterruptedException {
        log.info("Synchronisation user {} vers Firebase", user.getId());
        Firestore firestore = FirestoreClient.getFirestore();

        // 1. Créer/Mettre à jour dans Firebase Authentication
        String firebaseUid;
        if (user.getFirebaseUid() == null || user.getFirebaseUid().isEmpty()) {
            // Créer un nouvel utilisateur Firebase Auth
            UserRecord.CreateRequest request = new UserRecord.CreateRequest()
                    .setEmail(user.getEmail())
                    .setPassword(generateTemporaryPassword()) // Mot de passe temporaire
                    .setDisplayName(user.getName())
                    .setEmailVerified(false);

            UserRecord firebaseUser = FirebaseAuth.getInstance().createUser(request);
            firebaseUid = firebaseUser.getUid();

            user.setFirebaseUid(firebaseUid);
            log.info("Utilisateur créé dans Firebase Auth: {}", firebaseUid);
        } else {
            // Mettre à jour l'utilisateur existant
            firebaseUid = user.getFirebaseUid();
            UserRecord.UpdateRequest request = new UserRecord.UpdateRequest(firebaseUid)
                    .setDisplayName(user.getName())
                    .setEmail(user.getEmail());

            FirebaseAuth.getInstance().updateUser(request);
            log.info("Utilisateur mis à jour dans Firebase Auth: {}", firebaseUid);
        }

        // 2. Synchroniser dans Firestore
        Map<String, Object> userData = new HashMap<>();
        userData.put("id", user.getId());
        userData.put("email", user.getEmail());
        userData.put("name", user.getName());
        userData.put("firebaseUid", firebaseUid);
        userData.put("roleCode", user.getRole() != null ? user.getRole().getCode() : null);
        userData.put("roleLibelle", user.getRole() != null ? user.getRole().getLibelle() : null);
        userData.put("isLocked", user.getIsLocked());
        userData.put("createdAt", convertToDate(user.getCreatedAt()));
        userData.put("updatedAt", convertToDate(user.getUpdatedAt()));
        userData.put("syncedAt", new Date());

        DocumentReference docRef = firestore.collection(COLLECTION_USERS).document(firebaseUid);
        ApiFuture<WriteResult> result = docRef.set(userData);
        result.get(); // Attendre la fin de l'opération

        // 3. Marquer comme synchronisé
        user.setFirebaseSynced(true);
        user.setSyncedAt(LocalDateTime.now());
        user.setFirebaseSyncError(null);
        userRepository.save(user);

        recordSyncSuccess(EntityType.USER, user.getId(), firebaseUid);
        log.info("User {} synchronisé avec succès vers Firebase", user.getId());
    }

    /**
     * Synchronise un signalement vers Firestore
     */
    @Transactional
    public void syncSignalementToFirebase(Signalement signalement) throws ExecutionException, InterruptedException {
        log.info("Synchronisation signalement {} vers Firebase", signalement.getId());
        Firestore firestore = FirestoreClient.getFirestore();

        Map<String, Object> data = new HashMap<>();
        data.put("id", signalement.getId());
        data.put("description", signalement.getDescription());
        data.put("adresse", signalement.getAdresse());
        data.put("latitude", signalement.getLatitude() != null ? signalement.getLatitude().doubleValue() : null);
        data.put("longitude", signalement.getLongitude() != null ? signalement.getLongitude().doubleValue() : null);
        data.put("statusCode", signalement.getStatus() != null ? signalement.getStatus().getCode() : null);
        data.put("statusLibelle", signalement.getStatus() != null ? signalement.getStatus().getLibelle() : null);
        data.put("userEmail", signalement.getUser() != null ? signalement.getUser().getEmail() : null);
        data.put("userId", signalement.getUser() != null ? signalement.getUser().getId() : null);
        data.put("dateSignalement", convertToDate(signalement.getDateSignalement()));
        data.put("createdAt", convertToDate(signalement.getCreatedAt()));
        data.put("updatedAt", convertToDate(signalement.getUpdatedAt()));
        data.put("syncedAt", new Date());
        data.put("surface",signalement.getSurface());
        data.put("budget",signalement.getBudget());
        data.put("entrepriseId",signalement.getEntreprise().getId());

        // Utiliser l'ID Firebase existant ou en générer un nouveau
        String docId = signalement.getFirebaseId() != null ?
                signalement.getFirebaseId() :
                String.valueOf(signalement.getId());

        DocumentReference docRef = firestore.collection(COLLECTION_SIGNALEMENTS).document(docId);
        ApiFuture<WriteResult> result = docRef.set(data);
        result.get();

        // Marquer comme synchronisé
        signalement.setFirebaseId(docId);
        signalement.setFirebaseSynced(true);
        signalement.setLastSyncAt(LocalDateTime.now());
        signalementRepository.save(signalement);

        recordSyncSuccess(EntityType.SIGNALEMENT, signalement.getId(), docId);
        log.info("Signalement {} synchronisé avec succès vers Firebase", signalement.getId());
    }

    /**
     * Synchronise une entreprise vers Firestore
     */
    @Transactional
    public void syncEntrepriseToFirebase(Entreprise entreprise) throws ExecutionException, InterruptedException {
        log.info("Synchronisation entreprise {} vers Firebase", entreprise.getId());
        Firestore firestore = FirestoreClient.getFirestore();

        Map<String, Object> data = new HashMap<>();
        data.put("id", entreprise.getId());
        data.put("nom", entreprise.getNom());
        data.put("siret", entreprise.getSiret());
        data.put("telephone", entreprise.getTelephone());
        data.put("email", entreprise.getEmail());
        data.put("adresse", entreprise.getAdresse());
        data.put("specialites", entreprise.getSpecialites() != null ?
                Arrays.asList(entreprise.getSpecialites()) : Collections.emptyList());
        data.put("isActive", entreprise.getIsActive());
        data.put("noteMoyenne", entreprise.getNoteMoyenne() != null ?
                entreprise.getNoteMoyenne().doubleValue() : null);
        data.put("nombreInterventions", entreprise.getNombreInterventions());
        data.put("createdAt", convertToDate(entreprise.getCreatedAt()));
        data.put("updatedAt", convertToDate(entreprise.getUpdatedAt()));
        data.put("syncedAt", new Date());

        String docId = String.valueOf(entreprise.getId());
        DocumentReference docRef = firestore.collection(COLLECTION_ENTREPRISES).document(docId);
        ApiFuture<WriteResult> result = docRef.set(data);
        result.get();

        log.info("Entreprise {} synchronisée avec succès vers Firebase", entreprise.getId());
    }

    /**
     * Synchronise un status vers Firestore
     */
    @Transactional
    public void syncStatusToFirebase(SignalementStatus status) throws ExecutionException, InterruptedException {
        log.info("Synchronisation status {} vers Firebase", status.getId());
        Firestore firestore = FirestoreClient.getFirestore();

        Map<String, Object> data = new HashMap<>();
        data.put("id", status.getId());
        data.put("code", status.getCode());
        data.put("libelle", status.getLibelle());
        data.put("description", status.getDescription());
        data.put("ordre", status.getOrdre());
        data.put("color", status.getCouleur());
        data.put("syncedAt", new Date());

        String docId = status.getCode();
        DocumentReference docRef = firestore.collection(COLLECTION_STATUS).document(docId);
        ApiFuture<WriteResult> result = docRef.set(data);
        result.get();

        log.info("Status {} synchronisé avec succès vers Firebase", status.getCode());
    }

    // ==================== FIREBASE → POSTGRES ====================

    /**
     * Synchronise toutes les entités de Firebase vers PostgreSQL
     */
    @Transactional
    public SyncResult syncFirebaseToPostgres() {
        SyncResult result = new SyncResult();

        try {
            // Synchroniser les utilisateurs
            result.addFirebaseToPostgres(syncUsersFromFirebase());

            // Synchroniser les signalements
            result.addFirebaseToPostgres(syncSignalementsFromFirebase());

            // Synchroniser les entreprises
            result.addFirebaseToPostgres(syncEntreprisesFromFirebase());

            result.setSuccess(true);
        } catch (Exception e) {
            log.error("Erreur globale sync Firebase → Postgres", e);
            result.setSuccess(false);
            result.setErrorMessage(e.getMessage());
        }

        return result;
    }

    /**
     * Synchronise les utilisateurs depuis Firebase vers PostgreSQL
     */
    @Transactional
    public SyncResult syncUsersFromFirebase() throws ExecutionException, InterruptedException {
        log.info("Synchronisation utilisateurs depuis Firebase");
        SyncResult result = new SyncResult();
        Firestore firestore = FirestoreClient.getFirestore();

        // Récupérer tous les documents de la collection users
        ApiFuture<QuerySnapshot> future = firestore.collection(COLLECTION_USERS).get();
        List<QueryDocumentSnapshot> documents = future.get().getDocuments();

        for (QueryDocumentSnapshot document : documents) {
            try {
                Map<String, Object> data = document.getData();
                String firebaseUid = document.getId();

                // Vérifier si l'utilisateur existe déjà
                Optional<User> existingUser = userRepository.findByFirebaseUid(firebaseUid);

                if (existingUser.isPresent()) {
                    // Mise à jour de l'utilisateur existant
                    User user = existingUser.get();
                    updateUserFromFirebaseData(user, data);
                    userRepository.save(user);
                    result.incrementSuccess("users_updated");
                    log.info("User mis à jour depuis Firebase: {}", firebaseUid);
                } else {
                    // Créer un nouvel utilisateur
                    // Note: On ne crée pas automatiquement un user depuis Firebase
                    // car il faut un mot de passe hashé et un rôle
                    log.warn("User Firebase trouvé mais pas dans PostgreSQL: {}", firebaseUid);
                    result.incrementError("users_not_found");
                }
            } catch (Exception e) {
                log.error("Erreur traitement user Firebase: {}", e.getMessage());
                result.incrementError("users");
            }
        }

        return result;
    }

    /**
     * Synchronise les signalements depuis Firebase vers PostgreSQL
     */
    @Transactional
    public SyncResult syncSignalementsFromFirebase() throws ExecutionException, InterruptedException {
        log.info("Synchronisation signalements depuis Firebase");
        SyncResult result = new SyncResult();
        Firestore firestore = FirestoreClient.getFirestore();

        ApiFuture<QuerySnapshot> future = firestore.collection(COLLECTION_SIGNALEMENTS).get();
        List<QueryDocumentSnapshot> documents = future.get().getDocuments();

        for (QueryDocumentSnapshot document : documents) {
            try {
                Map<String, Object> data = document.getData();
                String firebaseId = document.getId();

                // Chercher le signalement par firebaseId ou par id
                Signalement signalement = findSignalementByFirebaseId(firebaseId, data);

                if (signalement != null) {
                    // Mise à jour
                    updateSignalementFromFirebaseData(signalement, data);
                    signalementRepository.save(signalement);
                    result.incrementSuccess("signalements_updated");
                    log.info("Signalement mis à jour depuis Firebase: {}", firebaseId);
                } else {
                    // Créer un nouveau signalement
                    Signalement newSignalement = createSignalementFromFirebaseData(data, firebaseId);
                    if (newSignalement != null) {
                        signalementRepository.save(newSignalement);
                        result.incrementSuccess("signalements_created");
                        log.info("Nouveau signalement créé depuis Firebase: {}", firebaseId);
                    } else {
                        result.incrementError("signalements_invalid_data");
                    }
                }
            } catch (Exception e) {
                log.error("Erreur traitement signalement Firebase: {}", e.getMessage());
                result.incrementError("signalements");
            }
        }

        return result;
    }

    /**
     * Synchronise les entreprises depuis Firebase vers PostgreSQL
     */
    @Transactional
    public SyncResult syncEntreprisesFromFirebase() throws ExecutionException, InterruptedException {
        log.info("Synchronisation entreprises depuis Firebase");
        SyncResult result = new SyncResult();
        Firestore firestore = FirestoreClient.getFirestore();

        ApiFuture<QuerySnapshot> future = firestore.collection(COLLECTION_ENTREPRISES).get();
        List<QueryDocumentSnapshot> documents = future.get().getDocuments();

        for (QueryDocumentSnapshot document : documents) {
            try {
                Map<String, Object> data = document.getData();
                Integer id = data.get("id") != null ?
                        ((Long) data.get("id")).intValue() : null;

                if (id != null) {
                    Optional<Entreprise> existing = entrepriseRepository.findById(id);
                    if (existing.isPresent()) {
                        // Mise à jour
                        Entreprise entreprise = existing.get();
                        updateEntrepriseFromFirebaseData(entreprise, data);
                        entrepriseRepository.save(entreprise);
                        result.incrementSuccess("entreprises_updated");
                    } else {
                        // Créer nouvelle entreprise
                        Entreprise newEntreprise = createEntrepriseFromFirebaseData(data);
                        if (newEntreprise != null) {
                            entrepriseRepository.save(newEntreprise);
                            result.incrementSuccess("entreprises_created");
                        }
                    }
                }
            } catch (Exception e) {
                log.error("Erreur traitement entreprise Firebase: {}", e.getMessage());
                result.incrementError("entreprises");
            }
        }

        return result;
    }

    // ==================== MÉTHODES UTILITAIRES ====================

    private void updateUserFromFirebaseData(User user, Map<String, Object> data) {
        if (data.containsKey("name")) {
            user.setName((String) data.get("name"));
        }
        if (data.containsKey("email")) {
            user.setEmail((String) data.get("email"));
        }
        user.setFirebaseSynced(true);
        user.setSyncedAt(LocalDateTime.now());
    }

    private Signalement findSignalementByFirebaseId(String firebaseId, Map<String, Object> data) {
        // Chercher par firebaseId
        List<Signalement> byFirebaseId = signalementRepository.findAll().stream()
                .filter(s -> firebaseId.equals(s.getFirebaseId()))
                .collect(Collectors.toList());

        if (!byFirebaseId.isEmpty()) {
            return byFirebaseId.get(0);
        }

        // Chercher par ID PostgreSQL
        try {
            Long id = data.get("id") != null ? ((Number) data.get("id")).longValue() : null;
            if (id != null) {
                return signalementRepository.findById(id).orElse(null);
            }
        } catch (Exception e) {
            log.warn("Impossible de récupérer l'ID: {}", e.getMessage());
        }

        return null;
    }

    private void updateSignalementFromFirebaseData(Signalement signalement, Map<String, Object> data) {
        if (data.containsKey("description")) {
            signalement.setDescription((String) data.get("description"));
        }
        if (data.containsKey("adresse")) {
            signalement.setAdresse((String) data.get("adresse"));
        }
        if (data.containsKey("latitude")) {
            signalement.setLatitude(BigDecimal.valueOf((Double) data.get("latitude")));
        }
        if (data.containsKey("longitude")) {
            signalement.setLongitude(BigDecimal.valueOf((Double) data.get("longitude")));
        }
//        if (data.containsKey("photoUrl")) {
//            signalement.setPhotoUrl((String) data.get("photoUrl"));
//        }
        if (data.containsKey("statusCode")) {
            String statusCode = (String) data.get("statusCode");
            signalementStatusRepository.findByCode(statusCode)
                    .ifPresent(signalement::setStatus);
        }
        if(data.containsKey("entrepriseId")) {
            Entreprise entreprise = entrepriseRepository.findById(Integer.parseInt((String) data.get("entrepriseId"))).get();
            signalement.setEntreprise(entreprise);
        }
        if(data.containsKey("surface")){
            signalement.setSurface(BigDecimal.valueOf((Double) data.get("surface")));
        }
        if(data.containsKey("budget")){
            signalement.setBudget(BigDecimal.valueOf((Double) data.get("budget")));
        }

        signalement.setFirebaseSynced(true);
        signalement.setLastSyncAt(LocalDateTime.now());
    }

    private Signalement createSignalementFromFirebaseData(Map<String, Object> data, String firebaseId) {
        try {
            // Récupérer l'utilisateur
            Long userId = data.get("userId") != null ? ((Number) data.get("userId")).longValue() : null;
            if (userId == null) {
                log.error("UserId manquant pour le signalement Firebase: {}", firebaseId);
                return null;
            }

            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                log.error("User introuvable pour le signalement Firebase: {}", firebaseId);
                return null;
            }

            // Récupérer le status
            String statusCode = data.get("statusCode") != null ? (String) data.get("statusCode") : "NOUVEAU";
            SignalementStatus status = signalementStatusRepository.findByCode(statusCode)
                    .orElse(signalementStatusRepository.findByCode("NOUVEAU").orElse(null));

            if (status == null) {
                log.error("Status introuvable pour le signalement Firebase: {}", firebaseId);
                return null;
            }

            Entreprise entreprise = null;

            if(data.containsKey("entrepriseId")) {
                 entreprise = entrepriseRepository.findById(Integer.parseInt((String) data.get("entrepriseId"))).get();
            }

            // Créer le signalement
            Signalement signalement = Signalement.builder()
                    .description((String) data.get("description"))
                    .adresse((String) data.get("adresse"))
                    .latitude(data.get("latitude") != null ?
                            BigDecimal.valueOf((Double) data.get("latitude")) : null)
                    .longitude(data.get("longitude") != null ?
                            BigDecimal.valueOf((Double) data.get("longitude")) : null)
//                    .photoUrl((String) data.get("photoUrl"))
                    .user(user)
                    .status(status)
                    .entreprise(entreprise)
                    .surface(data.get("surface")!=null?BigDecimal.valueOf((Double) data.get("surface")):null)
                    .budget(data.get("budget")!=null?BigDecimal.valueOf((Double) data.get("budget")):null)
                    .firebaseId(firebaseId)
                    .firebaseSynced(true)
                    .build();

            return signalement;
        } catch (Exception e) {
            log.error("Erreur création signalement depuis Firebase: {}", e.getMessage());
            return null;
        }
    }

    private void updateEntrepriseFromFirebaseData(Entreprise entreprise, Map<String, Object> data) {
        if (data.containsKey("nom")) {
            entreprise.setNom((String) data.get("nom"));
        }
        if (data.containsKey("telephone")) {
            entreprise.setTelephone((String) data.get("telephone"));
        }
        if (data.containsKey("email")) {
            entreprise.setEmail((String) data.get("email"));
        }
        if (data.containsKey("adresse")) {
            entreprise.setAdresse((String) data.get("adresse"));
        }
        if (data.containsKey("isActive")) {
            entreprise.setIsActive((Boolean) data.get("isActive"));
        }
        if (data.containsKey("specialites")) {
            @SuppressWarnings("unchecked")
            List<String> specialitesList = (List<String>) data.get("specialites");
            entreprise.setSpecialites(specialitesList.toArray(new String[0]));
        }
    }

    private Entreprise createEntrepriseFromFirebaseData(Map<String, Object> data) {
        try {
            Entreprise entreprise = Entreprise.builder()
                    .nom((String) data.get("nom"))
                    .siret((String) data.get("siret"))
                    .telephone((String) data.get("telephone"))
                    .email((String) data.get("email"))
                    .adresse((String) data.get("adresse"))
                    .isActive(data.get("isActive") != null ? (Boolean) data.get("isActive") : true)
                    .build();

            if (data.containsKey("specialites")) {
                @SuppressWarnings("unchecked")
                List<String> specialitesList = (List<String>) data.get("specialites");
                entreprise.setSpecialites(specialitesList.toArray(new String[0]));
            }

            return entreprise;
        } catch (Exception e) {
            log.error("Erreur création entreprise depuis Firebase: {}", e.getMessage());
            return null;
        }
    }

    // ==================== GESTION DES ERREURS ET HISTORIQUE ====================

    private void recordSyncSuccess(EntityType entityType, Long entityId, String firebaseId) {
        Map<String, Object> firebaseResponse = new HashMap<>();
        firebaseResponse.put("firebaseId", firebaseId);
        firebaseResponse.put("status", "success");

        SyncHistory history = SyncHistory.builder()
                .entityType(entityType)
                .entityId(entityId)
                .action(SyncAction.UPDATE)
                .direction(SyncDirection.POSTGRES_TO_FIREBASE)
                .status(SyncStatus.SUCCESS)
                .firebaseResponse(firebaseResponse)
                .syncedAt(LocalDateTime.now())
                .build();
        syncHistoryRepository.save(history);
    }

    private void recordSyncError(EntityType entityType, Long entityId, String errorMessage) {
        SyncHistory history = SyncHistory.builder()
                .entityType(entityType)
                .entityId(entityId)
                .action(SyncAction.UPDATE)
                .direction(SyncDirection.POSTGRES_TO_FIREBASE)
                .status(SyncStatus.FAILED)
                .errorMessage(errorMessage)
                .syncedAt(LocalDateTime.now())
                .build();
        syncHistoryRepository.save(history);
    }

    // ==================== HELPERS ====================

    private Date convertToDate(LocalDateTime localDateTime) {
        if (localDateTime == null) return null;
        return Date.from(localDateTime.atZone(ZoneId.systemDefault()).toInstant());
    }

    private LocalDateTime convertToLocalDateTime(Date date) {
        if (date == null) return null;
        return date.toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime();
    }

    private String generateTemporaryPassword() {
        return UUID.randomUUID().toString().substring(0, 16);
    }

    // ==================== CLASSE RÉSULTAT ====================

    @lombok.Data
    public static class SyncResult {
        private boolean success;
        private String errorMessage;
        private Map<String, Integer> successCounts = new HashMap<>();
        private Map<String, Integer> errorCounts = new HashMap<>();

        public void incrementSuccess(String category) {
            successCounts.put(category, successCounts.getOrDefault(category, 0) + 1);
        }

        public void incrementError(String category) {
            errorCounts.put(category, errorCounts.getOrDefault(category, 0) + 1);
        }

        public void addPostgresToFirebase(SyncResult other) {
            other.successCounts.forEach((key, value) ->
                    successCounts.merge("pg_to_fb_" + key, value, Integer::sum));
            other.errorCounts.forEach((key, value) ->
                    errorCounts.merge("pg_to_fb_" + key, value, Integer::sum));
        }

        public void addFirebaseToPostgres(SyncResult other) {
            other.successCounts.forEach((key, value) ->
                    successCounts.merge("fb_to_pg_" + key, value, Integer::sum));
            other.errorCounts.forEach((key, value) ->
                    errorCounts.merge("fb_to_pg_" + key, value, Integer::sum));
        }

        public int getTotalSuccess() {
            return successCounts.values().stream().mapToInt(Integer::intValue).sum();
        }

        public int getTotalErrors() {
            return errorCounts.values().stream().mapToInt(Integer::intValue).sum();
        }
    }
}