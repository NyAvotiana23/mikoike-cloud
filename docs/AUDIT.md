# Audit initial (Phase 0)

Date : 2026-10-12. État **avant** intervention ; la colonne « Suite » indique le traitement (détails : `RAPPORT_FINAL.md`).

## Cartographie

| Module | Techno | Taille | Rôle |
|---|---|---|---|
| `cloud-back` | Spring Boot (Java 17), PostgreSQL, Firebase Admin, Swagger | ~7 570 lignes Java | API REST |
| `web-react` | React + Vite + Tailwind + Leaflet | ~6 680 lignes | Back-office manager |
| `mobile-vue` | Ionic Vue + Capacitor (Android) + Firebase | ~8 360 lignes | App citoyenne |
| `map-server` | TileServer-GL + `antananarivo.mbtiles` (27 Mo) | — | Cartes hors-ligne |

Dépôt : 123 commits, équipe de 4 (projet scolaire S5 2026).

## Résultats d'exécution initiaux

| Contrôle | Résultat initial |
|---|---|
| Backend compile | OK |
| Backend tests | 1 test (contexte Spring), nécessitait PostgreSQL |
| `web-react` ESLint | Plantait (`reactHooks.configs.flat` inexistant en v5.2) |
| `mobile-vue` ESLint | 9 erreurs, dont un **marqueur de conflit git** dans `capacitor.config.ts` |
| Tests front | Gabarits Ionic par défaut / aucun |

## Problèmes

### Bloquants

| # | Problème | Suite |
|---|---|---|
| 1 | Secrets versionnés : clé privée `firebase-service-account.json`, `.env`, mot de passe DB, `admin.secret-key=MySecretKey2026` | Retirés de l'index, externalisés. **Clé à révoquer côté Firebase ; historique git non réécrit** |
| 2 | `cloud-back/target/` versionné | Retiré |
| 3 | Création de signalement impossible (`status_id NOT NULL`, TODO non traité) | Corrigé |
| 4 | Conflit de fusion non résolu dans `capacitor.config.ts` | Corrigé |
| 5 | Aucun test de logique métier | Tests ajoutés (backend, web, mobile) |

### Importants

| # | Problème | Suite |
|---|---|---|
| 6 | `SecurityConfig` : `anyRequest().permitAll()` — aucun contrôle de rôle sur `/api/admin`, `/api/sync`, `/api/users`… | **Non corrigé** (risque de régression front) → ROADMAP #1 |
| 7 | `users.password_temp` contient le mot de passe en clair jusqu'à la sync Firebase | **Non corrigé** → ROADMAP #2 |
| 8 | Gestion des utilisateurs (web) entièrement simulée ; `UserForm` appelait une méthode inexistante | Branchée sur l'API |
| 9 | Web : photos factices (picsum), statistiques sans délai moyen, `changeStatus` vers un endpoint inexistant, bouton « Synchroniser » vers un endpoint inexistant | Corrigés |
| 10 | Sync Firebase : NPE si signalement sans entreprise | Corrigé |
| 11 | Logs DEBUG/TRACE (SQL, Security) par défaut ; `sql.init.continue-on-error=true` | Corrigé (valeurs par défaut sûres) |
| 12 | `VITE_API_URL` sans `/api` dans Docker → front web cassé | Corrigé |
| 13 | Dockerfile prod : `COPY firebase-service-account.json` (fichier non versionné) et healthcheck sur `/actuator/health` (actuator absent) | Corrigé |
| 14 | Notifications mobile : données simulées locales, `getAll(userId)` ignorait `userId` ; réception FCM non faite | Filtre corrigé ; FCM **non fait** (voir RAPPORT_FINAL) |
| 15 | Erreurs métier (`IllegalArgumentException`) renvoyées en 500 | Handler global → 400 |
| 16 | Fichiers parasites versionnés (`.idea`, `~$*.docx`, `~WRL*.tmp`, dumps `.txt`, `projet.md` d'un autre projet) | Retirés / archivés dans `docs/archive/` |
| 17 | `data.sql` à la racine de `cloud-back` : jamais chargé par Spring | Non traité (le `DataInitializer` crée les données de base) → ROADMAP #4 |

### Confort

| # | Problème | Suite |
|---|---|---|
| 18 | Pas de formateur / pre-commit uniformes | CI + lint ; pre-commit non ajouté |
| 19 | Beaucoup de code commenté dans `web-react` / `mobile-vue` | Partiellement nettoyé → ROADMAP #7 |
| 20 | Doublons `web-react/docker-compose.yml`, `Makefile`, `start.sh` avec le compose racine | Non traité |
| 21 | `ddl-auto=update` sans migrations | Non traité → ROADMAP #4 |
| 22 | Warnings `react-hooks/exhaustive-deps` (2) | Non traité |
