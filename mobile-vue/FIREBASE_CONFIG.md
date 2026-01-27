# Configuration Firebase

## Configuration actuelle

L'application utilise maintenant **uniquement Firebase** pour l'authentification. Le système d'authentification locale a été supprimé.

### Détails de la configuration Firebase

```json
{
  "apiKey": "AIzaSyAQhZleZxSbCPlCN7MqbX7LSlWm8aTQ87U",
  "authDomain": "cloudproject-57d75.firebaseapp.com",
  "databaseURL": "https://cloudproject-57d75-default-rtdb.firebaseio.com",
  "projectId": "cloudproject-57d75",
  "storageBucket": "cloudproject-57d75.firebasestorage.app",
  "messagingSenderId": "1021976189737",
  "appId": "1:1021976189737:android:35ce1ab84d9b883fd6f538"
}
```

## Fonctionnalités

### Mode Visiteur
- Les utilisateurs peuvent accéder à l'application en mode **visiteur** sans authentification
- Mode lecture seule : ils peuvent voir la carte et les signalements mais ne peuvent pas en créer

### Mode Authentifié
- L'authentification se fait **uniquement via Firebase Authentication**
- **Pas d'inscription** dans l'application mobile
- Les comptes doivent être créés via le manager web (console Firebase)
- Une fois authentifié, l'utilisateur peut créer et gérer ses signalements

## Résolution du problème Tailwind

### Problèmes résolus

1. **postcss-config.js** : Correction de `plugin` → `plugins`
2. **tailwind.config.js** : Ajout de `.vue` dans la liste des fichiers à traiter
   ```javascript
   content: ['./index.html', './src/**/*.{js,ts,jsx,tsx,vue}']
   ```

## Structure des services

### `firebase.service.ts`
- Initialisation de Firebase
- Connexion avec email/password
- Déconnexion
- Écoute des changements d'état d'authentification

### `auth.service.ts`
- Wrapper autour de `firebase.service.ts`
- Gère l'état de l'utilisateur courant
- Transforme les données Firebase en format application

### `user-context.service.ts`
- Gère le contexte global de l'utilisateur (visiteur ou authentifié)
- Permet de basculer entre les modes

## Pour démarrer le projet

```bash
# Installer les dépendances
npm install

# Lancer en mode développement
npm run dev

# Build pour production
npm run build
```

## Notes importantes

- Les utilisateurs doivent être créés dans la console Firebase
- L'API key est publique et peut être exposée (c'est normal pour Firebase)
- Les règles de sécurité Firebase doivent être configurées côté backend
