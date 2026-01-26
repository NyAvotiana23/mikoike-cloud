-- ============================================
-- SCRIPT DE MIGRATION V1 → V2
-- ============================================

BEGIN;

-- 1. Création des nouvelles tables de référence
-- ===============================================

-- Table ROLES
CREATE TABLE roles (
                       id SERIAL PRIMARY KEY,
                       code VARCHAR(20) UNIQUE NOT NULL,
                       libelle VARCHAR(50) NOT NULL,
                       description TEXT,
                       niveau_acces INT NOT NULL DEFAULT 1,
                       created_at TIMESTAMP DEFAULT NOW(),
                       updated_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_role_code ON roles(code);

INSERT INTO roles (code, libelle, description, niveau_acces) VALUES
                                                                 ('VISITEUR', 'Visiteur', 'Accès consultation uniquement', 1),
                                                                 ('UTILISATEUR', 'Utilisateur', 'Peut créer des signalements', 2),
                                                                 ('MANAGER', 'Manager', 'Gestion complète du système', 3);

-- Table SIGNALEMENT_STATUS
CREATE TABLE signalement_status (
                                    id SERIAL PRIMARY KEY,
                                    code VARCHAR(20) UNIQUE NOT NULL,
                                    libelle VARCHAR(50) NOT NULL,
                                    description TEXT,
                                    couleur VARCHAR(7),
                                    ordre INT NOT NULL DEFAULT 1,
                                    created_at TIMESTAMP DEFAULT NOW(),
                                    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_signalement_status_code ON signalement_status(code);

INSERT INTO signalement_status (code, libelle, description, couleur, ordre) VALUES
                                                                                ('NOUVEAU', 'Nouveau', 'Signalement créé, non traité', '#FF6B6B', 1),
                                                                                ('EN_COURS', 'En cours', 'Travaux en cours', '#4ECDC4', 2),
                                                                                ('TERMINE', 'Terminé', 'Travaux terminés', '#95E1D3', 3);

-- Table ENTREPRISES
CREATE TABLE entreprises (
                             id SERIAL PRIMARY KEY,
                             nom VARCHAR(150) UNIQUE NOT NULL,
                             siret VARCHAR(14) UNIQUE,
                             telephone VARCHAR(20),
                             email VARCHAR(255),
                             adresse TEXT,
                             specialites TEXT[],
                             is_active BOOLEAN DEFAULT TRUE,
                             note_moyenne DECIMAL(3,2) CHECK (note_moyenne >= 0 AND note_moyenne <= 5),
                             nombre_interventions INT DEFAULT 0,
                             created_at TIMESTAMP DEFAULT NOW(),
                             updated_at TIMESTAMP DEFAULT NOW(),
                             created_by BIGINT -- FK sera ajoutée après création de users
);

CREATE UNIQUE INDEX idx_entreprise_nom ON entreprises(nom);
CREATE INDEX idx_entreprise_siret ON entreprises(siret);
CREATE INDEX idx_entreprise_is_active ON entreprises(is_active);

-- 2. Création table USERS (modifiée)
-- ===============================================

CREATE TABLE users (
                       id BIGSERIAL PRIMARY KEY,
                       email VARCHAR(255) UNIQUE NOT NULL,
                       password_hash VARCHAR(255) NOT NULL,
                       name VARCHAR(100) NOT NULL,
                       firebase_uid VARCHAR(128) UNIQUE,
                       firebase_synced BOOLEAN DEFAULT FALSE,
                       firebase_sync_error TEXT,
                       synced_at TIMESTAMP,
                       role_id INT NOT NULL REFERENCES roles(id) ON DELETE RESTRICT DEFAULT 2,
                       is_locked BOOLEAN DEFAULT FALSE,
                       locked_until TIMESTAMP,
                       failed_attempts INT DEFAULT 0,
                       last_failed_attempt_at TIMESTAMP,
                       created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
                       created_at TIMESTAMP DEFAULT NOW(),
                       updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_user_firebase_uid ON users(firebase_uid);
CREATE INDEX idx_user_role_id ON users(role_id);
CREATE INDEX idx_user_is_locked ON users(is_locked);
CREATE INDEX idx_user_firebase_synced ON users(firebase_synced);

ALTER TABLE users ADD CONSTRAINT check_firebase_sync
    CHECK (
        (firebase_synced = FALSE) OR
        (firebase_synced = TRUE AND firebase_uid IS NOT NULL)
        );

-- Ajout FK entreprise → user
ALTER TABLE entreprises ADD CONSTRAINT fk_entreprise_created_by
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

-- 3. Table SESSIONS
-- ===============================================

CREATE TABLE sessions (
                          id BIGSERIAL PRIMARY KEY,
                          user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                          token VARCHAR(500) UNIQUE NOT NULL,
                          device_info VARCHAR(255),
                          ip_address VARCHAR(50),
                          created_at TIMESTAMP DEFAULT NOW(),
                          expires_at TIMESTAMP NOT NULL,
                          is_active BOOLEAN DEFAULT TRUE,
                          last_activity_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_session_user_id ON sessions(user_id);
CREATE INDEX idx_session_token ON sessions(token);
CREATE INDEX idx_session_expires_at ON sessions(expires_at);
CREATE INDEX idx_session_is_active ON sessions(is_active);

-- 4. Table LOGIN_ATTEMPTS
-- ===============================================

CREATE TABLE login_attempts (
                                id BIGSERIAL PRIMARY KEY,
                                email VARCHAR(255) NOT NULL,
                                user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
                                success BOOLEAN NOT NULL,
                                failure_reason VARCHAR(50),
                                ip_address VARCHAR(50),
                                user_agent VARCHAR(255),
                                attempted_at TIMESTAMP DEFAULT NOW(),
                                CHECK (
                                    (success = TRUE AND failure_reason IS NULL) OR
                                    (success = FALSE AND failure_reason IS NOT NULL)
                                    )
);

COMMENT ON COLUMN login_attempts.failure_reason IS
    'USER_NOT_FOUND | INVALID_PASSWORD | ACCOUNT_LOCKED | FIREBASE_ERROR';

CREATE INDEX idx_login_attempts_email ON login_attempts(email);
CREATE INDEX idx_login_attempts_user_id ON login_attempts(user_id);
CREATE INDEX idx_login_attempts_attempted_at ON login_attempts(attempted_at DESC);
CREATE INDEX idx_login_attempts_email_time ON login_attempts(email, attempted_at DESC);
CREATE INDEX idx_login_attempts_success ON login_attempts(success, attempted_at DESC);

-- 5. Table FAILED_LOGIN_TRACKING
-- ===============================================

CREATE TABLE failed_login_tracking (
                                       id BIGSERIAL PRIMARY KEY,
                                       email VARCHAR(255) UNIQUE NOT NULL,
                                       failed_count INT DEFAULT 0,
                                       first_failed_at TIMESTAMP,
                                       last_failed_at TIMESTAMP,
                                       is_blocked BOOLEAN DEFAULT FALSE,
                                       blocked_until TIMESTAMP,
                                       blocked_reason VARCHAR(100),
                                       unblocked_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
                                       unblocked_at TIMESTAMP,
                                       created_at TIMESTAMP DEFAULT NOW(),
                                       updated_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_failed_login_email ON failed_login_tracking(email);
CREATE INDEX idx_failed_login_blocked ON failed_login_tracking(is_blocked, blocked_until);

-- 6. Table SIGNALEMENTS (modifiée)
-- ===============================================

CREATE TABLE signalements (
                              id BIGSERIAL PRIMARY KEY,
                              user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE SET NULL,
                              firebase_id VARCHAR(128) UNIQUE,
                              firebase_synced BOOLEAN DEFAULT FALSE,
                              last_sync_at TIMESTAMP,
                              latitude DECIMAL(10,8) NOT NULL,
                              longitude DECIMAL(11,8) NOT NULL,
                              adresse VARCHAR(255),
                              description TEXT NOT NULL,
                              photo_url VARCHAR(500),
                              status_id INT NOT NULL REFERENCES signalement_status(id) ON DELETE RESTRICT DEFAULT 1,
                              date_signalement TIMESTAMP DEFAULT NOW(),
                              created_at TIMESTAMP DEFAULT NOW(),
                              updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_signalement_user_id ON signalements(user_id);
CREATE INDEX idx_signalement_status_id ON signalements(status_id);
CREATE INDEX idx_signalement_date ON signalements(date_signalement);
CREATE INDEX idx_signalement_location ON signalements(latitude, longitude);
CREATE INDEX idx_signalement_firebase_id ON signalements(firebase_id);
CREATE INDEX idx_signalement_firebase_synced ON signalements(firebase_synced);

-- 7. Table SIGNALEMENT_ACTIONS (NOUVELLE)
-- ===============================================

CREATE TABLE signalement_actions (
                                     id BIGSERIAL PRIMARY KEY,
                                     signalement_id BIGINT NOT NULL REFERENCES signalements(id) ON DELETE CASCADE,
                                     entreprise_id INT REFERENCES entreprises(id) ON DELETE SET NULL,
                                     surface_m2 DECIMAL(10,2) CHECK (surface_m2 IS NULL OR surface_m2 >= 0),
                                     budget DECIMAL(15,2) CHECK (budget IS NULL OR budget >= 0),
                                     date_debut_travaux TIMESTAMP,
                                     date_fin_prevue TIMESTAMP,
                                     date_fin_reelle TIMESTAMP,
                                     description_travaux TEXT,
                                     materiel_utilise TEXT,
                                     travaux_conformes BOOLEAN,
                                     commentaire_fin TEXT,
                                     photos_avant TEXT[],
                                     photos_apres TEXT[],
                                     created_by BIGINT NOT NULL REFERENCES users(id) ON DELETE SET NULL,
                                     modified_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
                                     created_at TIMESTAMP DEFAULT NOW(),
                                     updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_signalement_action_signalement ON signalement_actions(signalement_id);
CREATE INDEX idx_signalement_action_entreprise ON signalement_actions(entreprise_id);
CREATE INDEX idx_signalement_action_dates ON signalement_actions(date_debut_travaux, date_fin_reelle);

ALTER TABLE signalement_actions ADD CONSTRAINT check_dates_action_coherence
    CHECK (
        (date_fin_prevue IS NULL OR date_debut_travaux IS NULL OR date_fin_prevue >= date_debut_travaux) AND
        (date_fin_reelle IS NULL OR date_debut_travaux IS NULL OR date_fin_reelle >= date_debut_travaux)
        );

-- 8. Table HISTORIQUE_STATUS (modifiée)
-- ===============================================

CREATE TABLE historique_status (
                                   id BIGSERIAL PRIMARY KEY,
                                   signalement_id BIGINT NOT NULL REFERENCES signalements(id) ON DELETE CASCADE,
                                   ancien_status_id INT NOT NULL REFERENCES signalement_status(id) ON DELETE RESTRICT,
                                   nouveau_status_id INT NOT NULL REFERENCES signalement_status(id) ON DELETE RESTRICT,
                                   modified_by BIGINT NOT NULL REFERENCES users(id) ON DELETE SET NULL,
                                   commentaire TEXT,
                                   metadata JSONB,
                                   changed_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_historique_signalement ON historique_status(signalement_id, changed_at DESC);
CREATE INDEX idx_historique_modified_by ON historique_status(modified_by);
CREATE INDEX idx_historique_ancien_status ON historique_status(ancien_status_id);
CREATE INDEX idx_historique_nouveau_status ON historique_status(nouveau_status_id);

ALTER TABLE historique_status ADD CONSTRAINT check_status_different
    CHECK (ancien_status_id != nouveau_status_id);

-- 9. Table SYNC_QUEUE
-- ===============================================

CREATE TABLE sync_queue (
                            id BIGSERIAL PRIMARY KEY,
                            entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('USER', 'SIGNALEMENT')),
                            entity_id BIGINT NOT NULL,
                            firebase_id VARCHAR(128),
                            action VARCHAR(20) NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE')),
    direction VARCHAR(20) NOT NULL CHECK (direction IN ('TO_FIREBASE', 'FROM_FIREBASE')),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED')),
    error_message TEXT,
    retry_count INT DEFAULT 0,
    max_retries INT DEFAULT 3,
    data_snapshot JSONB,
    synced_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    priority INT DEFAULT 5,
    created_at TIMESTAMP DEFAULT NOW(),
    scheduled_at TIMESTAMP DEFAULT NOW(),
    processing_started_at TIMESTAMP,
    processed_at TIMESTAMP
);

CREATE INDEX idx_sync_queue_status ON sync_queue(status, priority, scheduled_at);
CREATE INDEX idx_sync_queue_entity ON sync_queue(entity_type, entity_id);
CREATE INDEX idx_sync_queue_created_at ON sync_queue(created_at);
CREATE INDEX idx_sync_queue_retry ON sync_queue(retry_count, status);
CREATE INDEX idx_sync_queue_pending ON sync_queue(status, scheduled_at)
    WHERE status = 'PENDING';

-- 10. Table SYNC_HISTORY
-- ===============================================

CREATE TABLE sync_history (
                              id BIGSERIAL PRIMARY KEY,
                              sync_queue_id BIGINT,
                              entity_type VARCHAR(50) NOT NULL,
                              entity_id BIGINT NOT NULL,
                              action VARCHAR(20) NOT NULL,
                              direction VARCHAR(20) NOT NULL,
                              status VARCHAR(20) NOT NULL CHECK (status IN ('SUCCESS', 'FAILED')),
                              error_message TEXT,
                              firebase_response JSONB,
                              duration_ms INT,
                              synced_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
                              synced_at TIMESTAMP DEFAULT NOW(),
                              created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sync_history_entity ON sync_history(entity_type, entity_id, synced_at DESC);
CREATE INDEX idx_sync_history_status ON sync_history(status, synced_at DESC);
CREATE INDEX idx_sync_history_date ON sync_history(synced_at DESC);

COMMIT;