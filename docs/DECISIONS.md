# Décisions techniques

Format : contexte → choix → raison → alternatives écartées.

## D1 — 2026-10-12 — Secrets hors du dépôt
- **Contexte** : clé de compte de service Firebase, mot de passe DB et clé admin versionnés.
- **Choix** : variables d'environnement (`.env.example`), dossier `secrets/` monté en lecture seule (ignoré par git).
- **Raison** : conformité à la règle « aucun secret dans le code ».
- **Écarté** : réécriture de l'historique git (exige un force-push, non fait sans accord). **La clé Firebase déjà publiée doit être révoquée côté Firebase.**

## D2 — Statut par défaut `NOUVEAU`
- `statusId` devient optionnel dans `CreateSignalementDTO` (assouplissement compatible) ; le service applique `NOUVEAU`. Avant, la création échouait (`status_id NOT NULL`).

## D3 — Clé admin
- `ADMIN_SECRET_KEY` vide ⇒ la création d'admin est refusée (avant : clé en dur `MySecretKey2026`). Comparaison en temps constant.

## D4 — Test de contexte Spring conditionnel
- Les colonnes `text[]` ne sont pas supportées par H2. `ProjetFinalApplicationTests` ne s'exécute que si `DB_URL` est défini. Testcontainers écarté (dépendance lourde + Docker obligatoire).

## D5 — Fichiers de notes archivés
- `*.txt`/`projet.md`/`java-combined.ps1` déplacés dans `docs/archive/` plutôt que supprimés (garde-fou : aucune suppression sans accord).

## D6 — Notifications mobile filtrées par utilisateur
- `getAll(userId)` ignorait son paramètre ; il filtre désormais, conformément à la signature et aux données de démonstration.

## D7 — Service utilisateurs web
- Création via `POST /api/auth/register`, lecture/suppression via `GET|DELETE /api/users[/{id}]`. `age` et `location` n'existent pas dans l'entité `User` : non gérés (voir ROADMAP).

## D8 — Sécurité des endpoints : non modifiée
- `SecurityConfig` autorise tout. Activer l'authentification casserait potentiellement mobile/web (jetons non envoyés partout). Consigné comme **risque majeur** dans la ROADMAP, à traiter avec tests de bout en bout.
