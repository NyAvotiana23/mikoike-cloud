-- 1. Conservation des Rôles
INSERT INTO roles (id, code, libelle, description, niveau_acces, created_at, updated_at) VALUES
                                                                                             (1, 'MANAGER', 'Manager', 'Gestionnaire système', 10, NOW(), NOW()),
                                                                                             (2, 'UTILISATEUR', 'Utilisateur', 'Utilisateur standard', 5, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET code = EXCLUDED.code, updated_at = NOW();

-- 2. Conservation des Statuts de Signalement
INSERT INTO signalement_status (id, ordre,code, libelle, description, couleur, created_at, updated_at) VALUES
                                                                                                           (1, 1,'NOUVEAU', 'Nouveau', 'Signalement reçu, en attente d''analyse', '#3B82F6', NOW(), NOW()),
                                                                                                           (2, 2,'EN_COURS', 'En cours', 'Travaux ou analyse en cours de réalisation', '#F59E0B', NOW(), NOW()),
                                                                                                           (3, 3,'TERMINE', 'Terminé', 'Problème résolu et travaux finalisés', '#10B981', NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET code = EXCLUDED.code, updated_at = NOW();

-- 3. Insertion de 3 Entreprises (Madagascar)
INSERT INTO entreprises (id, nom, telephone, email, adresse, created_at, updated_at) VALUES
                                                                                         (1, 'Colas Madagascar', '0202222222', 'contact@colas.mg', 'Ankorondrano, Antananarivo', NOW(), NOW()),
                                                                                         (2, 'SOGEA Madagascar', '0202233333', 'info@sogea.mg', 'Alarobia, Antananarivo', NOW(), NOW()),
                                                                                         (3, 'SMATP', '0202244444', 'direction@smatp.mg', 'Andraharo, Antananarivo', NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;

-- 4. Insertion de 3 Signalements à Antananarivo
-- Données modifiées : entreprise_id, surface (m2), budget (Ar)
INSERT INTO signalements (
    id, user_id, latitude, longitude, adresse, description,
    status_id, entreprise_id, surface, budget,
    date_signalement, created_at, updated_at
) VALUES
      (
          1, 101, -18.8792, 47.5079, 'Avenue de l''Indépendance, Analakely',
          'Nid de poule majeur sur la chaussée principale.',
          1, -- NOUVEAU
          NULL, 0, 0,
          NOW(), NOW(), NOW()
      ),
      (
          2, 101, -18.9100, 47.5200, 'Route de l''Université, Ankatso',
          'Réfection de la chaussée endommagée par les pluies.',
          2, -- EN_COURS
          1, 150, 45000000, -- Colas, 150m2, 45M Ar
          NOW() - INTERVAL '2 days', NOW(), NOW()
      ),
      (
          3, 101, -18.8650, 47.5150, 'Boulevard de l''Europe, Ankorondrano',
          'Réparation de glissière de sécurité et marquage au sol.',
          3, -- TERMINE
          2, 45, 12500000, -- Sogea, 45m2, 12.5M Ar
          NOW() - INTERVAL '1 week', NOW(), NOW()
      )
    ON CONFLICT (id) DO UPDATE SET
    latitude = EXCLUDED.latitude,
                            longitude = EXCLUDED.longitude,
                            entreprise_id = EXCLUDED.entreprise_id,
                            surface = EXCLUDED.surface,
                            budget = EXCLUDED.budget,
                            status_id = EXCLUDED.status_id;