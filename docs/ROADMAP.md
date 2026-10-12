# Roadmap (hors périmètre de cette intervention)

1. **Sécuriser l'API** : remplacer `anyRequest().permitAll()` par des règles par rôle (`/api/admin/**`, `/api/users/**`, `/api/sync/**` = MANAGER) et faire envoyer le jeton par tous les appels web. Priorité haute.
2. Ne plus stocker `users.password_temp` en clair : importer le hash bcrypt dans Firebase (`UserImportRecord`) ou forcer la réinitialisation.
3. Ajouter `age` et `location` à `User` (migration) si le formulaire utilisateur doit les conserver.
4. Migrations de schéma (Flyway) à la place de `ddl-auto=update` ; `data.sql` à la racine de `cloud-back` n'est pas chargé par Spring (hors `classpath`).
5. Tests d'intégration avec PostgreSQL (Testcontainers) et tests e2e Cypress côté mobile.
6. Mobile : brancher le service de notifications sur FCM au lieu des données locales.
7. Supprimer le code commenté restant dans `web-react` et `mobile-vue`.
8. Régénérer les clés Firebase et réécrire l'historique git.
