# Mikoike Cloud

Plateforme de signalement des problèmes de voirie à Antananarivo : les citoyens signalent sur une carte (app mobile), un manager traite et suit l'avancement (back-office web). Projet Cloud S5 / ITU 2026.

## Fonctionnalités

- **Mobile (Ionic Vue)** : carte visiteur/utilisateur, signalements avec photo, suivi de ses signalements, compte, notifications.
- **Web (React)** : connexion manager, carte, gestion des utilisateurs, changement de statut, photos, statistiques (avancement, délai moyen), configuration du prix au m².
- **API (Spring Boot)** : authentification à sessions, verrouillage après 3 échecs, signalements/statuts/entreprises/photos, synchronisation PostgreSQL ↔ Firebase, notifications push.
- **Cartes hors-ligne** : TileServer-GL avec `antananarivo.mbtiles`.

Vision complète : [docs/CONCEPT.md](docs/CONCEPT.md).

## Prérequis

- Docker Desktop + Docker Compose (lancement conseillé)
- Ou, en local : JDK 17+, Maven 3.9+, Node 20+, PostgreSQL 15

## Installation et lancement

```bash
cp .env.example .env        # puis renseigner POSTGRES_PASSWORD (obligatoire) et ADMIN_SECRET_KEY
docker compose up dev --build
```

| Service | URL |
|---|---|
| API | http://localhost:8002 (Swagger : `/swagger-ui.html`) |
| Web React | http://localhost:5173 |
| Mobile Vue | http://localhost:5174 |
| Tuiles | http://localhost:8081 |
| PostgreSQL | `localhost:5432` |

Créer le premier manager : `POST /api/admin/register` avec `secretKey` égal à `ADMIN_SECRET_KEY`.

## Configuration

Toutes les variables sont dans [`.env.example`](.env.example), commentées. Pour activer Firebase : `FIREBASE_ENABLED=true` et déposer le JSON du compte de service dans `secrets/firebase-service-account.json` (jamais commité).

## Tests et lint

```bash
make test        # backend (JUnit), web (Vitest), mobile (Vitest)
make lint        # ESLint web + mobile, vue-tsc
```

Sans `make` : `cd cloud-back && mvn test`, `cd web-react && npm test && npm run lint`, `cd mobile-vue && npm run test:unit -- --run && npm run lint`.

Le test de contexte Spring (`ProjetFinalApplicationTests`) ne tourne que si `DB_URL` pointe vers un PostgreSQL.

## Structure

```
cloud-back/   API Spring Boot (controller / service / repository / entity / dto)
web-react/    back-office manager (React, Vite, Tailwind, Leaflet)
mobile-vue/   app citoyenne (Ionic Vue, Capacitor, Firebase)
map-server/   TileServer-GL + antananarivo.mbtiles
docs/         concept, architecture, décisions, audit, roadmap, rapport final
secrets/      fichiers secrets locaux (ignorés par git)
```

Architecture : [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). Contribuer : [CONTRIBUTING.md](CONTRIBUTING.md).

## Licence

Aucune licence définie à ce jour (projet académique).
