# Audit initial (Phase 0)

Date : 2026-10-12. Aucune modification de code. Audit partiel : lecture de la structure, du dépôt git, des configs ; build/lint lancés quand possible. Le code métier n'a pas encore été relu fichier par fichier.

## Cartographie

| Module | Techno | Taille | Rôle |
|---|---|---|---|
| `cloud-back` | Spring Boot (Java 17 cible), PostgreSQL, Firebase Admin, Swagger | ~7 570 lignes Java | API REST : auth, signalements, entreprises, config, sync Firebase, push |
| `web-react` | React + Vite + Tailwind + Leaflet | ~6 680 lignes | Back-office manager |
| `mobile-vue` | Ionic Vue + Capacitor (Android) + Firebase | ~8 360 lignes | App citoyenne |
| `map-server` | TileServer-GL + `antananarivo.mbtiles` (27 Mo) | — | Cartes hors-ligne |
| racine | `docker-compose.yml`, README, spec PDF/DOCX, TODO xlsx, collection Postman | — | Orchestration, docs |

Dépôt : 123 commits, branche `main`. Équipe de 4 (projet scolaire S5 2026).

## Résultats d'exécution

| Contrôle | Résultat |
|---|---|
| Backend `mvn -o compile` | OK (JDK local 21, cible 17) |
| Backend tests | Un seul test (`ProjetFinalApplicationTests`, contexte Spring) — non exécuté, nécessite PostgreSQL |
| `web-react` `eslint .` | **Plante** (stack trace dans le config-loader d'ESLint, avant lint) — cause à investiguer |
| `mobile-vue` `eslint .` | 9 erreurs |
| `mobile-vue` `vue-tsc --noEmit` | sortie non lue entièrement — à refaire en Phase 1 |
| Tests front | `mobile-vue/tests/unit/example.spec.ts` et `e2e/specs/test.cy.ts` = gabarits Ionic par défaut ; `web-react` : aucun |

## Problèmes

### Bloquants

1. **Secrets commités** : `cloud-back/src/main/resources/firebase-service-account.json` contient une clé privée (suivi par git, malgré `.gitignore`) ; `mobile-vue/android/google-services.json`, `mobile-vue/src/environments/*.ts`, `*/firebase.*` (clé API Firebase) ; `.env` commité ; `admin.secret-key=MySecretKey2026` et mot de passe DB `sql` en clair dans `application.properties` et `docker-compose.yml`. **Une clé privée de compte de service doit être révoquée/régénérée côté Firebase** : la nettoyer de l'historique ne suffit pas.
2. **Artefacts de build suivis** : 3 fichiers sous `cloud-back/target/` sont versionnés.
3. **Aucun filet de test** sur la logique métier (auth, verrouillage, sessions, statuts, sync).

### Importants

4. TODO non terminés dans le code :
   - `SignalementController.java:148` — statut par défaut / `dto.statusId` non géré.
   - `SignalementService.java:191` — synchronisation Firebase non implémentée.
5. Tâches inachevées d'après `TodoProjetCloud.xlsx` (heures passées < estimées) : statistiques Web (avancement global, délai moyen), modification de statut côté carte Web, section photos du détail signalement, service de notifications mobile, finitions CSS/responsive mobile, init Web (env, Firebase).
6. `application.properties` : `ddl-auto=update`, `spring.sql.init.continue-on-error=true` (erreurs SQL avalées), logs `DEBUG`/`TRACE` Hibernate + Spring Security activés par défaut (fuite de données possible), Swagger activé sans condition.
7. Docs et fichiers parasites versionnés : `~$ojet Cloud S5.docx`, `~WRL0005.tmp`, `cloud-back/.idea/**` (dont `workspace.xml`, `dataSources.local.xml`), fichiers `*.txt` dans les packages Java (`mg.projetfinal.*.txt`), `mcd2.txt`, `new_struct.txt`, `rest.txt`, `projet.md` (guide d'un autre projet : « auth-service », port 8080, `auth_db`).
8. README racine : mentionne `docker-compose.prod.yml` (inexistant dans la liste git) et des commandes non vérifiées ; Postgres 15 sans PostGIS alors que la TODO parle de PostGIS.
9. `web-react/docker-compose.yml`, `Makefile`, `start.sh` en doublon avec le compose racine.

### Confort

10. Pas de formateur/linter/CI/pre-commit uniformes ; pas de lockfile à la racine utile (`package-lock.json` de 88 octets).
11. `~$` / `.iml` / `.idea` non ignorés à la racine (pas de `.gitignore` racine).
12. Versions dépendances non auditées (`npm audit`, `mvn dependency-check` à lancer).

## Prochaine étape

Voir questions ouvertes dans la réponse (Phase 1). Complément d'audit nécessaire : lecture du code métier, `npm audit`, `vue-tsc` complet, cause du crash ESLint web, démarrage Docker.
