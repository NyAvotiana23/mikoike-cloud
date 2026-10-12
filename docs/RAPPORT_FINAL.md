# Rapport final

Branche : `chore/finalisation` (non poussée, non fusionnée). Date : 2026-10-12.

## Vérifié

| Contrôle | Résultat |
|---|---|
| Backend `mvn test` | 16 tests, 0 échec (1 ignoré : contexte Spring, exige PostgreSQL) |
| Web `npm run lint` | 0 erreur, 2 warnings `exhaustive-deps` |
| Web `npm test` / `vite build` | 5 tests OK / build OK |
| Mobile `eslint`, `vue-tsc --noEmit`, `vitest` | 0 erreur / 0 erreur / 3 tests OK |
| `docker compose up` (postgres + backend-dev) sur volumes vierges | API démarre ; testé en réel : création d'admin (clé vide refusée), login, validation de session, création de signalement (statut `NOUVEAU`), changement de statut, statistiques, `GET/DELETE /api/users`, logout |

## Fait

- **Sécurité** : secrets retirés de l'index git et externalisés (`.env.example`, `secrets/`), clé admin obligatoire, logs sûrs par défaut.
- **Bugs corrigés** : création de signalement impossible (statut, surface, budget NOT NULL) ; NPE dans le mapper et la sync Firebase pour un signalement sans entreprise ; création d'admin impossible hors-ligne (Firebase non initialisé) ; conflit de fusion dans `capacitor.config.ts` ; logout/validation sans jeton ; `VITE_API_URL` sans `/api` en Docker ; endpoints inexistants appelés par le web (`change-status`, `synchroniser`) ; ESLint web cassé.
- **Fonctionnalités terminées** : gestion des utilisateurs web (API réelle), photos réelles, délai moyen de traitement, sync Firebase d'un signalement, notifications mobile filtrées par utilisateur.
- **Qualité** : 24 tests, CI GitHub Actions, `Makefile`, documentation complète, `ApiExceptionHandler`, code mort et mocks inutilisés supprimés.

## Reste à faire / non vérifié

1. **Révoquer la clé de compte de service Firebase** déjà publiée (elle reste dans l'historique git ; réécriture non faite, force-push exigé).
2. **API non protégée** : `SecurityConfig` autorise tout ; compte seed `admin.tana@mg.gov` / `admin` créé au démarrage. À traiter avant tout déploiement (ROADMAP #1).
3. `users.password_temp` stocke un mot de passe en clair jusqu'à la sync Firebase (ROADMAP #2).
4. **Notifications mobile** : toujours des données locales simulées ; le plugin push Capacitor n'est pas installé. Non implémenté faute de pouvoir le vérifier sur appareil.
5. Non testés ici : web et mobile dans Docker, TileServer, sync Firebase réelle (pas de clé), build Android.
6. Code commenté résiduel dans les fronts ; 2 warnings React hooks ; doublons `web-react/docker-compose.yml`/`Makefile`/`start.sh` ; `ddl-auto=update`.
7. Le test de reprise « README seul » a été fait pour backend + PostgreSQL uniquement. Premier démarrage : le téléchargement Maven a échoué une fois (réseau), un redémarrage a suffi.
8. Piège dev : si les classes du conteneur semblent périmées après modification, supprimer `/app/target/classes` dans le conteneur `backend-dev` puis le redémarrer.

## Décisions

Voir `docs/DECISIONS.md` (D1–D8).

## Prochaines étapes recommandées

1. Révoquer/régénérer la clé Firebase.
2. Sécuriser l'API par rôles et changer le compte seed.
3. Brancher les notifications push mobile.
4. Migrations Flyway + Testcontainers.
