package mg.projetfinal.enums;

/**
 * Statut de la synchronisation
 */
public enum SyncStatus {
    PENDING,      // En attente de traitement
    PROCESSING,   // En cours de traitement
    SUCCESS,      // Synchronisation réussie
    FAILED,       // Synchronisation échouée
    CANCELLED     // Synchronisation annulée
}