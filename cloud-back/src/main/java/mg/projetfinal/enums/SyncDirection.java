package mg.projetfinal.enums;

/**
 * Direction de la synchronisation
 */
public enum SyncDirection {
    POSTGRES_TO_FIREBASE,   // PostgreSQL → Firebase
    FIREBASE_TO_POSTGRES,   // Firebase → PostgreSQL
    BIDIRECTIONAL           // Les deux sens
}