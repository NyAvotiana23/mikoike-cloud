# Changelog

Format [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/).

## [Non publié]

### Ajouté
- `GET /api/users/{id}`, `DELETE /api/users/{id}`, `POST /api/signalements/{id}/synchroniser`.
- `delaiMoyenJours` dans `GET /api/signalements/statistics` et carte « Délai moyen » côté web.
- Photos réelles des signalements côté web (`SignalementPhotos`).
- `.env.example`, `Makefile`, tests (JUnit, Vitest), CI GitHub Actions.

### Modifié
- `statusId` optionnel à la création d'un signalement (défaut `NOUVEAU`).
- Gestion des utilisateurs (web) branchée sur l'API (plus de données simulées).
- Configuration par variables d'environnement (DB, clé admin, Firebase, logs).
- Notifications mobile filtrées par utilisateur.

### Corrigé
- Création de signalement impossible (statut manquant) ; synchronisation Firebase plantant sans entreprise.
- Logout/validation de session sans jeton ; `VITE_API_URL` sans `/api` dans Docker ; conflit de fusion dans `capacitor.config.ts` ; ESLint web inutilisable.

### Sécurité
- Secrets retirés de l'index git (la clé Firebase publiée doit être révoquée) ; création d'admin refusée sans `ADMIN_SECRET_KEY` ; logs SQL/Security à `INFO`/`WARN` par défaut.

### Supprimé
- Services web simulés inutilisés, stubs de synchronisation morts du backend.
