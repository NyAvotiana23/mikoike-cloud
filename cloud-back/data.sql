-- 1. Insérer les rôles (nécessaires pour les utilisateurs)
INSERT INTO roles (id, code, libelle, description, niveau_acces, created_at, updated_at) VALUES
                                                                                             (1, 'MANAGER', 'Manager', 'Gestionnaire système', 10, NOW(), NOW()),
                                                                                             (2, 'UTILISATEUR', 'Utilisateur', 'Utilisateur standard', 5, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
                            libelle = EXCLUDED.libelle,
                            description = EXCLUDED.description,
                            niveau_acces = EXCLUDED.niveau_acces,
                            updated_at = NOW();

-- 2. Insérer les utilisateurs (non synchronisés)
INSERT INTO users (
    id, email, password_hash, name, firebase_uid, firebase_synced,
    firebase_sync_error, synced_at, role_id, is_locked, locked_until,
    failed_attempts, last_failed_attempt_at, created_by, created_at, updated_at
) VALUES
-- Admin non synchronisé
(
    101,
    'admin.test@ville.fr',
    '$2a$10$testhash1234567890',  -- Mot de passe hashé exemple
    'Admin Test',
    NULL,  -- firebase_uid null pour test
    false, -- firebase_synced = false
    NULL,  -- Pas d'erreur de sync
    NULL,  -- synced_at null
    1,     -- role_id = 1 (MANAGER)
    false, -- Non bloqué
    NULL,  -- locked_until null
    0,     -- failed_attempts = 0
    NULL,  -- last_failed_attempt_at null
    NULL,  -- created_by null
    NOW() - INTERVAL '7 days',
    NOW() - INTERVAL '1 day'
),
-- Citoyen non synchronisé
(
    102,
    'citoyen.test@email.com',
    '$2a$10$anotherhash123456',
    'Citoyen Test',
    NULL,   -- firebase_uid null
    false,  -- firebase_synced = false
    'Échec précédent de synchronisation', -- Erreur de sync
    NULL,   -- synced_at null
    2,      -- role_id = 2 (UTILISATEUR)
    false,  -- Non bloqué
    NULL,   -- locked_until null
    0,      -- failed_attempts = 0
    NULL,   -- last_failed_attempt_at null
    101,    -- created_by = 101 (Admin Test)
    NOW() - INTERVAL '5 days',
    NOW()
),
-- Utilisateur bloqué non synchronisé
(
    103,
    'user.bloque@test.fr',
    '$2a$10$lockedhash123456',
    'Utilisateur Bloqué',
    NULL,   -- firebase_uid null
    false,  -- firebase_synced = false
    NULL,   -- Pas d'erreur de sync
    NULL,   -- synced_at null
    2,      -- role_id = 2 (UTILISATEUR)
    true,   -- is_locked = true
    NOW() + INTERVAL '1 hour', -- Bloquer pour 1 heure
    5,      -- failed_attempts = 5
    NOW() - INTERVAL '30 minutes', -- last_failed_attempt_at
    101,    -- created_by = 101 (Admin Test)
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '30 minutes'
)
    ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
                            password_hash = EXCLUDED.password_hash,
                            name = EXCLUDED.name,
                            firebase_uid = EXCLUDED.firebase_uid,
                            firebase_synced = EXCLUDED.firebase_synced,
                            firebase_sync_error = EXCLUDED.firebase_sync_error,
                            synced_at = EXCLUDED.synced_at,
                            role_id = EXCLUDED.role_id,
                            is_locked = EXCLUDED.is_locked,
                            locked_until = EXCLUDED.locked_until,
                            failed_attempts = EXCLUDED.failed_attempts,
                            last_failed_attempt_at = EXCLUDED.last_failed_attempt_at,
                            created_by = EXCLUDED.created_by,
                            updated_at = NOW();

-- 3. Insérer les statuts de signalements
INSERT INTO signalement_status (id, code, libelle, description, couleur, ordre, created_at, updated_at) VALUES
                                                                                                            (1, 'NOUVEAU', 'Nouveau', 'Signalement non traité', '#FF0000', 1, NOW(), NOW()),
                                                                                                            (2, 'EN_COURS', 'En cours', 'Signalement en traitement', '#00FF00', 2, NOW(), NOW()),
                                                                                                            (3, 'TERMINE', 'Terminé', 'Signalement traité', '#0000FF', 3, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
                            libelle = EXCLUDED.libelle,
                            description = EXCLUDED.description,
                            couleur = EXCLUDED.couleur,
                            ordre = EXCLUDED.ordre,
                            updated_at = NOW();

-- 4. Insérer les entreprises (pour référence)
INSERT INTO entreprises (
    id, nom, siret, telephone, email, adresse, specialites,
    is_active, note_moyenne, nombre_interventions, created_by,
    created_at, updated_at
) VALUES
      (
          1,
          'Travaux Publics Marseille',
          '12345678901234',
          '0412345678',
          'contact@tp-marseille.fr',
          '123 Rue des Entrepreneurs, 13001 Marseille',
          ARRAY['VOIRIE', 'ASSAINISSEMENT', 'ÉCLAIRAGE PUBLIC'],
          true,
          4.2,
          15,
          101,  -- created_by = Admin Test
          NOW() - INTERVAL '30 days',
          NOW() - INTERVAL '2 days'
      ),
      (
          2,
          'Électricité Pro',
          '98765432109876',
          '0498765432',
          'contact@electricitepro.fr',
          '45 Avenue de l''Électricité, 13002 Marseille',
          ARRAY['ÉLECTRICITÉ', 'ÉCLAIRAGE', 'RÉNOVATION'],
          true,
          3.8,
          8,
          101,  -- created_by = Admin Test
          NOW() - INTERVAL '25 days',
          NOW() - INTERVAL '1 day'
      )
    ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
                            siret = EXCLUDED.siret,
                            telephone = EXCLUDED.telephone,
                            email = EXCLUDED.email,
                            adresse = EXCLUDED.adresse,
                            specialites = EXCLUDED.specialites,
                            is_active = EXCLUDED.is_active,
                            note_moyenne = EXCLUDED.note_moyenne,
                            nombre_interventions = EXCLUDED.nombre_interventions,
                            created_by = EXCLUDED.created_by,
                            updated_at = NOW();

-- 5. Insérer les signalements (non synchronisés)
INSERT INTO signalements (
    id, user_id, firebase_id, firebase_synced, last_sync_at,
    latitude, longitude, adresse, description, photo_url,
    status_id, date_signalement, created_at, updated_at
) VALUES
-- Signalement 1: Nid-de-poule
(
    1001,
    102,  -- user_id = Citoyen Test
    NULL,  -- firebase_id null pour test
    false, -- firebase_synced = false
    NULL,  -- last_sync_at null
    43.296482,
    5.369780,
    'Rue de la République, 13001 Marseille',
    'Nid-de-poule important au niveau du croisement avec la Rue Saint-Ferréol. Profondeur d''environ 15cm, dangereux pour les cyclistes.',
    'https://storage.googleapis.com/nid-de-poule-123.jpg',
    1,  -- status_id = 1 (NOUVEAU)
    NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '2 hours'
),
-- Signalement 2: Panneau incliné
(
    1002,
    102,  -- user_id = Citoyen Test
    NULL,  -- firebase_id null
    false, -- firebase_synced = false
    NULL,  -- last_sync_at null
    43.310000,
    5.380000,
    'Avenue du Prado, 13008 Marseille',
    'Panneau de signalisation incliné à 45 degrés, risque de chute. Hauteur: 2.5m, panneau de direction.',
    'https://storage.googleapis.com/panneau-incline-456.jpg',
    1,  -- status_id = 1 (NOUVEAU)
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
),
-- Signalement 3: Éclairage défectueux
(
    1003,
    102,  -- user_id = Citoyen Test
    NULL,  -- firebase_id null
    false, -- firebase_synced = false
    NULL,  -- last_sync_at null
    43.290000,
    5.370000,
    'Vieux Port, 13001 Marseille',
    'Éclairage public défectueux au niveau du quai. Lampe clignotante puis éteinte, secteur entier affecté.',
    NULL,  -- Pas de photo
    2,  -- status_id = 2 (EN_COURS)
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '12 hours'
),
-- Signalement 4: Banc endommagé
(
    1004,
    101,  -- user_id = Admin Test
    NULL,  -- firebase_id null
    false, -- firebase_synced = false
    NULL,  -- last_sync_at null
    43.350000,
    5.330000,
    'Rue Paradis, 13006 Marseille',
    'Banc public endommagé, dossier cassé. Référence: banc n°247, modèle ''Marseille 2020''.',
    'https://storage.googleapis.com/banc-casse-789.jpg',
    3,  -- status_id = 3 (TERMINE)
    NOW() - INTERVAL '1 month',
    NOW() - INTERVAL '1 month',
    NOW() - INTERVAL '2 weeks'
)
    ON CONFLICT (id) DO UPDATE SET
    user_id = EXCLUDED.user_id,
                            firebase_id = EXCLUDED.firebase_id,
                            firebase_synced = EXCLUDED.firebase_synced,
                            last_sync_at = EXCLUDED.last_sync_at,
                            latitude = EXCLUDED.latitude,
                            longitude = EXCLUDED.longitude,
                            adresse = EXCLUDED.adresse,
                            description = EXCLUDED.description,
                            photo_url = EXCLUDED.photo_url,
                            status_id = EXCLUDED.status_id,
                            date_signalement = EXCLUDED.date_signalement,
                            updated_at = NOW();

-- Vérification des données insérées
SELECT 'Roles insérés:' as message, COUNT(*) as count FROM roles WHERE id IN (1,2)
UNION ALL
SELECT 'Utilisateurs non synchronisés:', COUNT(*) FROM users WHERE id IN (101,102,103) AND firebase_synced = false
UNION ALL
SELECT 'Signalements non synchronisés:', COUNT(*) FROM signalements WHERE id IN (1001,1002,1003,1004) AND firebase_synced = false;