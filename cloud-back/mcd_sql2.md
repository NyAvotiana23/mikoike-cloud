# 🗂️ MCD CORRIGÉ - Entités Finales

## Nouvelles spécifications prises en compte :
✅ Inscription uniquement par Manager dans PostgreSQL  
✅ Synchronisation automatique (gérée par un service dédié)  
✅ Résolution des problèmes identifiés

---

## 1️⃣ ENTITÉ USER (Corrigée)

```sql
CREATE TABLE users (
    -- Identifiant
    id BIGSERIAL PRIMARY KEY,
    
    -- Informations de base
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    
    -- Synchronisation Firebase
    firebase_uid VARCHAR(128) UNIQUE,
    firebase_synced BOOLEAN DEFAULT FALSE,
    firebase_sync_error TEXT,
    synced_at TIMESTAMP,
    
    -- Rôle
    role VARCHAR(20) NOT NULL DEFAULT 'UTILISATEUR'
        CHECK (role IN ('VISITEUR', 'UTILISATEUR', 'MANAGER')),
    
    -- Sécurité et blocage
    is_locked BOOLEAN DEFAULT FALSE,
    locked_until TIMESTAMP,
    failed_attempts INT DEFAULT 0,
    last_failed_attempt_at TIMESTAMP,
    
    -- Audit
    created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Index
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_user_firebase_uid ON users(firebase_uid);
CREATE INDEX idx_user_role ON users(role);
CREATE INDEX idx_user_is_locked ON users(is_locked);
CREATE INDEX idx_user_firebase_synced ON users(firebase_synced);

-- Contraintes
ALTER TABLE users ADD CONSTRAINT check_firebase_sync
CHECK (
    (firebase_synced = FALSE) OR 
    (firebase_synced = TRUE AND firebase_uid IS NOT NULL)
);
```

**Changements par rapport à l'ancien MCD :**
- ✅ Ajout `firebase_synced` : flag pour savoir si user est dans Firebase
- ✅ Ajout `firebase_sync_error` : message d'erreur si sync échoue
- ✅ Ajout `synced_at` : date de dernière synchronisation
- ✅ Ajout `created_by` : Manager qui a créé le compte
- ✅ Ajout `last_failed_attempt_at` : pour calcul du blocage
- ✅ Contrainte : Si synced=TRUE, alors firebase_uid doit exister

---

## 2️⃣ ENTITÉ SESSION (Inchangée mais clarifiée)

```sql

CREATE TABLE sessions (
    id BIGSERIAL PRIMARY KEY,
    
    -- Utilisateur concerné
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Token et sécurité
    token VARCHAR(500) UNIQUE NOT NULL,
    device_info VARCHAR(255),
    ip_address VARCHAR(50),
    
    -- Validité
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_activity_at TIMESTAMP DEFAULT NOW()
);

-- Index
CREATE INDEX idx_session_user_id ON sessions(user_id);
CREATE INDEX idx_session_token ON sessions(token);
CREATE INDEX idx_session_expires_at ON sessions(expires_at);
CREATE INDEX idx_session_is_active ON sessions(is_active);
```

**Changements :**
- ✅ Ajout `last_activity_at` : pour tracking activité utilisateur
- ✅ `ON DELETE CASCADE` : si user supprimé, ses sessions aussi (conformité RGPD)

---

## 3️⃣ ENTITÉ LOGIN_ATTEMPT (Totalement refaite)

```sql
CREATE TABLE login_attempts (
    id BIGSERIAL PRIMARY KEY,
    
    -- Email utilisé pour la tentative
    email VARCHAR(255) NOT NULL,
    
    -- Utilisateur (NULL si email n'existe pas)
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    
    -- Résultat de la tentative
    success BOOLEAN NOT NULL,
    failure_reason VARCHAR(50),
        CHECK (
            (success = TRUE AND failure_reason IS NULL) OR
            (success = FALSE AND failure_reason IS NOT NULL)
        ),
    
    -- Métadonnées
    ip_address VARCHAR(50),
    user_agent VARCHAR(255),
    attempted_at TIMESTAMP DEFAULT NOW()
);

-- Valeurs possibles pour failure_reason
COMMENT ON COLUMN login_attempts.failure_reason IS 
    'USER_NOT_FOUND | INVALID_PASSWORD | ACCOUNT_LOCKED | FIREBASE_ERROR';

-- Index optimisés
CREATE INDEX idx_login_attempts_email ON login_attempts(email);
CREATE INDEX idx_login_attempts_user_id ON login_attempts(user_id);
CREATE INDEX idx_login_attempts_attempted_at ON login_attempts(attempted_at DESC);
CREATE INDEX idx_login_attempts_email_time ON login_attempts(email, attempted_at DESC);
CREATE INDEX idx_login_attempts_success ON login_attempts(success, attempted_at DESC);
```

**Changements majeurs :**
- ✅ `email` toujours renseigné (même si user n'existe pas)
- ✅ `user_id` peut être NULL (email inexistant)
- ✅ Ajout `failure_reason` : diagnostic précis de l'échec
- ✅ Contrainte : Si success=FALSE, failure_reason obligatoire
- ✅ Index composite `(email, attempted_at)` pour compter échecs récents

---

## 4️⃣ NOUVELLE ENTITÉ : FAILED_LOGIN_TRACKING

**Pourquoi cette table ?**  
Pour gérer efficacement le blocage par email (et pas seulement par user_id).

```sql
CREATE TABLE failed_login_tracking (
    id BIGSERIAL PRIMARY KEY,
    
    -- Email surveillé
    email VARCHAR(255) UNIQUE NOT NULL,
    
    -- Compteurs
    failed_count INT DEFAULT 0,
    first_failed_at TIMESTAMP,
    last_failed_at TIMESTAMP,
    
    -- Blocage
    is_blocked BOOLEAN DEFAULT FALSE,
    blocked_until TIMESTAMP,
    blocked_reason VARCHAR(100),
    
    -- Déblocage
    unblocked_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    unblocked_at TIMESTAMP,
    
    -- Audit
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Index
CREATE UNIQUE INDEX idx_failed_login_email ON failed_login_tracking(email);
CREATE INDEX idx_failed_login_blocked ON failed_login_tracking(is_blocked, blocked_until);
```

**Logique de fonctionnement :**
```
1. Tentative échouée sur email "john@mail.com"
   → INSERT ou UPDATE failed_login_tracking
   → failed_count++
   
2. Si failed_count >= 3 :
   → is_blocked = TRUE
   → blocked_until = NOW() + 30 minutes
   → UPDATE users SET is_locked = TRUE WHERE email = 'john@mail.com'
   
3. Tentative réussie :
   → DELETE FROM failed_login_tracking WHERE email = 'john@mail.com'
   
4. Manager débloque :
   → UPDATE failed_login_tracking SET is_blocked = FALSE, unblocked_by = manager_id
   → UPDATE users SET is_locked = FALSE WHERE email = 'john@mail.com'
```

---

## 5️⃣ ENTITÉ SIGNALEMENT (Légèrement modifiée)

```sql
CREATE TABLE signalements (
    id BIGSERIAL PRIMARY KEY,
    
    -- Auteur du signalement
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    
    -- Synchronisation Firebase
    firebase_id VARCHAR(128) UNIQUE,
    firebase_synced BOOLEAN DEFAULT FALSE,
    last_sync_at TIMESTAMP,
    
    -- Localisation
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    adresse VARCHAR(255),
    
    -- Détails du problème
    description TEXT NOT NULL,
    photo_url VARCHAR(500),
    
    -- Statut du signalement
    status VARCHAR(20) NOT NULL DEFAULT 'NOUVEAU'
        CHECK (status IN ('NOUVEAU', 'EN_COURS', 'TERMINE')),
    
    -- Informations travaux (renseignées par Manager)
    surface_m2 DECIMAL(10,2) CHECK (surface_m2 IS NULL OR surface_m2 >= 0),
    budget DECIMAL(15,2) CHECK (budget IS NULL OR budget >= 0),
    entreprise VARCHAR(150),
    
    -- Dates
    date_signalement TIMESTAMP DEFAULT NOW(),
    date_debut_travaux TIMESTAMP,
    date_fin_travaux TIMESTAMP,
    
    -- Audit
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_modified_by BIGINT REFERENCES users(id) ON DELETE SET NULL
);

-- Index
CREATE INDEX idx_signalement_user_id ON signalements(user_id);
CREATE INDEX idx_signalement_status ON signalements(status);
CREATE INDEX idx_signalement_date ON signalements(date_signalement);
CREATE INDEX idx_signalement_location ON signalements(latitude, longitude);
CREATE INDEX idx_signalement_firebase_id ON signalements(firebase_id);
CREATE INDEX idx_signalement_firebase_synced ON signalements(firebase_synced);

-- Contraintes métier
ALTER TABLE signalements ADD CONSTRAINT check_dates_coherence
CHECK (
    (date_debut_travaux IS NULL OR date_debut_travaux >= date_signalement) AND
    (date_fin_travaux IS NULL OR date_fin_travaux >= date_debut_travaux)
);
```

**Changements :**
- ✅ Ajout `firebase_synced` : flag de synchronisation
- ✅ Ajout `last_modified_by` : qui a modifié en dernier
- ✅ Contrainte : cohérence des dates (fin >= début >= signalement)

---

## 6️⃣ ENTITÉ HISTORIQUE_STATUS (Légèrement modifiée)

```sql
CREATE TABLE historique_status (
    id BIGSERIAL PRIMARY KEY,
    
    -- Signalement concerné
    signalement_id BIGINT NOT NULL REFERENCES signalements(id) ON DELETE CASCADE,
    
    -- Changement de statut
    ancien_status VARCHAR(20) NOT NULL,
    nouveau_status VARCHAR(20) NOT NULL,
    
    -- Qui a fait le changement
    modified_by BIGINT NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    
    -- Détails
    commentaire TEXT,
    
    -- Métadonnées additionnelles
    metadata JSONB,  -- Pour stocker infos supplémentaires (surface, budget changés, etc.)
    
    -- Date
    changed_at TIMESTAMP DEFAULT NOW()
);

-- Index
CREATE INDEX idx_historique_signalement ON historique_status(signalement_id, changed_at DESC);
CREATE INDEX idx_historique_modified_by ON historique_status(modified_by);
```

**Changements :**
- ✅ Ajout `metadata` (JSONB) : pour stocker changements additionnels (ex: surface modifiée)
- ✅ `modified_by` NOT NULL : on doit toujours savoir qui a modifié

---

## 7️⃣ ENTITÉ SYNC_QUEUE (Refonte complète)

```sql
CREATE TABLE sync_queue (
    id BIGSERIAL PRIMARY KEY,
    
    -- Entité concernée
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('USER', 'SIGNALEMENT')),
    entity_id BIGINT NOT NULL,
    
    -- ID Firebase (NULL si pas encore créé)
    firebase_id VARCHAR(128),
    
    -- Action à effectuer
    action VARCHAR(20) NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE')),
    
    -- Direction de la sync
    direction VARCHAR(20) NOT NULL CHECK (direction IN ('TO_FIREBASE', 'FROM_FIREBASE')),
    
    -- Statut de la synchronisation
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED')),
    
    -- Gestion des erreurs
    error_message TEXT,
    retry_count INT DEFAULT 0,
    max_retries INT DEFAULT 3,
    
    -- Données à synchroniser (snapshot JSON)
    data_snapshot JSONB,
    
    -- Métadonnées
    synced_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    priority INT DEFAULT 5,  -- 1 = haute priorité, 10 = basse
    
    -- Dates
    created_at TIMESTAMP DEFAULT NOW(),
    scheduled_at TIMESTAMP DEFAULT NOW(),
    processing_started_at TIMESTAMP,
    processed_at TIMESTAMP
);

-- Index optimisés pour le worker de sync
CREATE INDEX idx_sync_queue_status ON sync_queue(status, priority, scheduled_at);
CREATE INDEX idx_sync_queue_entity ON sync_queue(entity_type, entity_id);
CREATE INDEX idx_sync_queue_created_at ON sync_queue(created_at);
CREATE INDEX idx_sync_queue_retry ON sync_queue(retry_count, status);

-- Index pour retrouver les sync en attente
CREATE INDEX idx_sync_queue_pending ON sync_queue(status, scheduled_at) 
    WHERE status = 'PENDING';
```

**Changements majeurs :**
- ✅ Ajout `PROCESSING` : état intermédiaire pendant traitement
- ✅ Ajout `priority` : prioriser certaines syncs
- ✅ Ajout `scheduled_at` : pour retry différé
- ✅ Ajout `processing_started_at` : tracking durée de traitement
- ✅ Ajout `max_retries` : configurable par entrée
- ✅ Ajout `data_snapshot` : snapshot des données au moment de la queue

---

## 8️⃣ NOUVELLE ENTITÉ : SYNC_HISTORY

**Pourquoi ?** Pour garder trace de TOUTES les synchronisations (réussies ou non).

```sql
CREATE TABLE sync_history (
    id BIGSERIAL PRIMARY KEY,
    
    -- Référence à la queue (peut être NULL si supprimée)
    sync_queue_id BIGINT,
    
    -- Entité synchronisée
    entity_type VARCHAR(50) NOT NULL,
    entity_id BIGINT NOT NULL,
    action VARCHAR(20) NOT NULL,
    direction VARCHAR(20) NOT NULL,
    
    -- Résultat
    status VARCHAR(20) NOT NULL CHECK (status IN ('SUCCESS', 'FAILED')),
    error_message TEXT,
    
    -- Réponse Firebase
    firebase_response JSONB,
    
    -- Durée du traitement
    duration_ms INT,
    
    -- Métadonnées
    synced_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    synced_at TIMESTAMP DEFAULT NOW(),
    
    -- Audit
    created_at TIMESTAMP DEFAULT NOW()
);

-- Index
CREATE INDEX idx_sync_history_entity ON sync_history(entity_type, entity_id, synced_at DESC);
CREATE INDEX idx_sync_history_status ON sync_history(status, synced_at DESC);
CREATE INDEX idx_sync_history_date ON sync_history(synced_at DESC);

-- Partitionnement par date (pour grandes volumétries)
-- CREATE TABLE sync_history_2026_01 PARTITION OF sync_history
--     FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
```

**Utilité :**
- Audit complet de toutes les synchronisations
- Debug : voir l'historique des tentatives
- Métriques : taux de succès, durée moyenne, etc.

---

## 📊 DIAGRAMME ENTITÉ-ASSOCIATION COMPLET

```
┌─────────────┐
│    USER     │
└──────┬──────┘
       │
       │ created_by (1:N)
       ├──────────────────┐
       │                  │
       │ crée (1:N)       │
       ├─────────┐        │
       │         │        │
       ▼         ▼        ▼
┌──────────┐ ┌─────────────┐ ┌───────────────────┐
│ SESSION  │ │ SIGNALEMENT │ │ FAILED_LOGIN_     │
└──────────┘ └──────┬──────┘ │    TRACKING       │
                    │         └───────────────────┘
                    │
                    │ possède (1:N)
                    ▼
             ┌─────────────────┐
             │ HISTORIQUE_     │
             │    STATUS       │
             └─────────────────┘

┌──────────────────┐
│ LOGIN_ATTEMPTS   │ ──→ USER (N:1, peut être NULL)
└──────────────────┘

┌──────────────┐
│ SYNC_QUEUE   │ ──→ USER (N:1 via synced_by)
└──────────────┘

┌──────────────┐
│ SYNC_HISTORY │ ──→ USER (N:1 via synced_by)
└──────────────┘ ──→ SYNC_QUEUE (N:1, peut être NULL)
```

---

## 🎯 RÉSUMÉ DES CHANGEMENTS

| Entité | Ancien MCD | Nouveau MCD | Changements |
|--------|-----------|-------------|-------------|
| **USER** | Basique | ✅ Amélioré | +firebase_synced, +created_by, +firebase_sync_error |
| **SESSION** | OK | ✅ Légèrement modifié | +last_activity_at |
| **LOGIN_ATTEMPT** | ❌ Problématique | ✅ Refait | +failure_reason, contraintes cohérentes |
| **FAILED_LOGIN_TRACKING** | ❌ N'existait pas | ✅ **NOUVEAU** | Gestion blocage par email |
| **SIGNALEMENT** | OK | ✅ Amélioré | +firebase_synced, +last_modified_by |
| **HISTORIQUE_STATUS** | OK | ✅ Légèrement modifié | +metadata (JSONB) |
| **SYNC_QUEUE** | Basique | ✅ Refait | +priority, +processing_started_at, +retry |
| **SYNC_HISTORY** | ❌ N'existait pas | ✅ **NOUVEAU** | Audit complet des syncs |

---

## 🔢 VOLUMÉTRIE ESTIMÉE (mise à jour)

| Entité | Volume Initial | Croissance/Mois | Rétention |
|--------|----------------|-----------------|-----------|
| users | 50 | +20 | Permanent |
| sessions | 150 | Variable | 7 jours après expiration |
| login_attempts | 200 | +100 | 90 jours |
| failed_login_tracking | 10 | +5 | Reset après succès |
| signalements | 100 | +50 | Permanent |
| historique_status | 50 | +30 | Permanent |
| sync_queue | 0-50 | Variable | Supprimé après SUCCESS |
| sync_history | 0 | +200 | 365 jours (partitionné) |

---

## ✅ VALIDATION FINALE

**Tous les problèmes identifiés sont résolus :**

✅ LOGIN_ATTEMPT peut tracer tentatives même sans user_id  
✅ Blocage par email fonctionne (FAILED_LOGIN_TRACKING)  
✅ Synchronisation tracée complètement (SYNC_HISTORY)  
✅ Audit complet : qui a créé/modifié quoi et quand  
✅ Gestion cohérente Firebase ↔ PostgreSQL  
✅ Contraintes d'intégrité respectées  
✅ Index optimisés pour performance

**Le MCD est maintenant prêt pour l'implémentation ! 🚀**