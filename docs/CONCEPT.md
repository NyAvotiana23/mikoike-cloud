# Concept

Source : cahier des charges `Projet Cloud S5.pdf` (titres des scénarios uniquement lisibles : le contenu est en images), code, `TodoProjetCloud.xlsx`, `cloud-back/data.sql`. Ce qui n'est pas vérifiable est marqué *(à confirmer)*.

## Vision

**Mikoike Cloud** (projet S5 / ITU, promotion 17, 4 étudiants) : les habitants d'Antananarivo signalent des problèmes de voirie (nids de poule, etc.) sur une carte ; un manager de la commune suit le traitement des travaux et en publie l'avancement.

## Public cible

- **Visiteur** : consulte la carte des signalements sans compte.
- **Utilisateur** (rôle `UTILISATEUR`) : app mobile ; crée et suit ses signalements, reçoit des notifications.
- **Manager** (rôle `MANAGER`) : back-office web ; gère les utilisateurs, les signalements, les entreprises, la configuration et les statistiques.

## Fonctionnalités prévues

| Module | Fonctionnalités |
|---|---|
| Mobile (Ionic Vue) | Welcome ; carte visiteur ; login ; carte utilisateur ; détail d'un signalement ; liste de tous les signalements ; mes signalements ; mon compte ; notifications ; formulaire d'ajout (avec photo) |
| Web (React/Vite) | Login manager ; sidebar ; carte des signalements (survol = infos) ; gestion des utilisateurs mobiles (CRUD) ; changement de statut ; détail avec photos ; statistiques (avancement global, délai moyen de traitement) ; configuration (prix par m²) |
| Backend (Spring Boot) | Inscription/login, sessions à durée limitée (30 min), blocage après 3 échecs + déblocage manager, signalements, statuts, entreprises, actions de travaux (surface, budget), historique des statuts, notifications push FCM, synchronisation PostgreSQL ↔ Firebase |
| Firebase | Authentification, Firestore (dont collection de photos), push |
| Carte | TileServer-GL sur Docker avec `antananarivo.mbtiles` (hors-ligne) |

## Règles métier observées dans le code

- Statuts : `NOUVEAU` (1) → `EN_COURS` (2) → `TERMINE` (3). Un nouveau signalement démarre à `NOUVEAU`.
- Avancement = `TERMINE / total × 100`.
- Chaque changement de statut crée une ligne d'historique et déclenche une notification push.
- Budget d'un signalement = surface × prix par m² *(à confirmer : calcul exact dans `ConfigurationService`)*.
- Fonctionnement hors-ligne : si Firebase est injoignable, PostgreSQL fait foi (fallback).

## Choix de design à préserver

1. Double persistance PostgreSQL + Firebase avec synchronisation bidirectionnelle (`FirebaseSyncService`).
2. Cartes servies localement (pas de dépendance à un fournisseur de tuiles).
3. Séparation claire des 4 modules déployables via un seul `docker-compose.yml`.
4. Le mobile fonctionne principalement sur Firebase / stockage local ; le web passe par l'API Spring.

## État des fonctionnalités

| Fonctionnalité | État |
|---|---|
| Auth backend, sessions, verrouillage | Complète |
| Création de signalement (API) | Corrigée (statut par défaut) |
| Gestion des utilisateurs (web) | Était simulée (mock) → branchée sur `/api/users` |
| Statistiques, statut, photos (web) | Partielles d'après le xlsx — voir `RAPPORT_FINAL.md` |
| Notifications mobile | Données locales simulées ; réception FCM non terminée |
| Sécurité des endpoints | Désactivée (`permitAll`) — voir `AUDIT.md` et `DECISIONS.md` |
