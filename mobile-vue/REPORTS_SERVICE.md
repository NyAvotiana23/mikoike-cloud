# Service de Rapports - Documentation

## Configuration actuelle

Le service `reports.service.ts` utilise actuellement des **données statiques** pour le développement et les tests.

## Structure de données

Les rapports (signalements) contiennent les informations suivantes :
- **id**: Identifiant unique
- **userId**: ID de l'utilisateur créateur
- **location**: Coordonnées GPS (lat, lng)
- **date**: Date de création
- **status**: Statut ('nouveau', 'en_cours', 'termine', 'annule')
- **titre**: Titre du signalement
- **description**: Description détaillée
- **priorite**: Niveau de priorité ('basse', 'moyenne', 'haute')
- **surface**: Surface en m²
- **budget**: Budget en Ariary
- **entreprise**: Nom de l'entreprise
- **dateDebut**: Date de début des travaux (optionnel)
- **dateFin**: Date de fin des travaux (optionnel)
- **photos**: Array de URLs de photos (optionnel)

## Activation de Firestore

Pour activer la persistance Firestore, suivez ces étapes :

### 1. Configuration Firestore dans la Console Firebase

1. Allez sur [Firebase Console](https://console.firebase.google.com)
2. Sélectionnez votre projet : `cloudproject-57d75`
3. Dans le menu latéral, cliquez sur **Firestore Database**
4. Cliquez sur **Créer une base de données**
5. Choisissez le mode de sécurité :
   - **Mode test** (pour le développement) : permet toutes les lectures/écritures pendant 30 jours
   - **Mode production** : configure les règles de sécurité personnalisées

### 2. Règles de sécurité recommandées

Pour la production, utilisez ces règles de sécurité :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Les utilisateurs connectés peuvent lire tous les signalements
    match /signalements/{signalementId} {
      allow read: if true;
      allow create: if request.auth != null 
                    && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null 
                            && resource.data.userId == request.auth.uid;
    }
  }
}
```

### 3. Modifications du code

Dans le fichier `src/services/reports.service.ts` :

1. **Décommentez** la ligne d'import en haut :
   ```typescript
   import { collection, addDoc, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
   ```

2. **Commentez** les méthodes statiques actuelles :
   - `getAllReports()` (ligne ~58)
   - `addReport()` (ligne ~131)
   - `getReportById()` (ligne ~146)

3. **Décommentez** les méthodes Firestore correspondantes qui se trouvent juste en dessous de chaque méthode statique

### 4. Test de la connexion

Après avoir activé Firestore :

1. Compilez et lancez l'application
2. Connectez-vous avec un compte utilisateur
3. Activez le mode ajout en cliquant sur le bouton **+**
4. Cliquez sur la carte pour placer un nouveau rapport
5. Remplissez le formulaire et créez le rapport
6. Vérifiez dans la Console Firebase > Firestore Database que le document a été créé

## Utilisation du service

### Récupérer tous les rapports

```typescript
import reportsService from '@/services/reports.service';

// Tous les rapports
const allReports = await reportsService.getAllReports();

// Rapports d'un utilisateur spécifique
const userReports = await reportsService.getAllReports('userId123');
```

### Ajouter un rapport

```typescript
const newReportId = await reportsService.addReport({
  userId: 'userId123',
  location: { lat: -18.8792, lng: 47.5079 },
  date: new Date().toISOString(),
  status: 'nouveau',
  titre: 'Nid de poule',
  description: 'Nid de poule dangereux',
  priorite: 'haute',
  surface: 50,
  budget: 2000000,
  entreprise: 'BTP Madagascar'
});
```

### Récupérer un rapport par ID

```typescript
const report = await reportsService.getReportById('reportId123');
```

## Configuration Firebase utilisée

Le service utilise la configuration Firebase définie dans `src/environments/environment.ts` :

```typescript
firebase: {
  apiKey: "AIzaSyAQhZleZxSbCPlCN7MqbX7LSlWm8aTQ87U",
  authDomain: "cloudproject-57d75.firebaseapp.com",
  databaseURL: "https://cloudproject-57d75-default-rtdb.firebaseio.com",
  projectId: "cloudproject-57d75",
  storageBucket: "cloudproject-57d75.firebasestorage.app",
  messagingSenderId: "1021976189737",
  appId: "1:1021976189737:android:35ce1ab84d9b883fd6f538"
}
```

Cette configuration est la même que celle utilisée pour l'authentification.

## Fonctionnalités de la carte

### Mode visiteur
- Voir tous les signalements sur la carte
- Consulter les détails des signalements
- Pas d'ajout possible

### Mode connecté
- Toutes les fonctionnalités du mode visiteur
- Bouton **+** pour activer le mode ajout
- Cliquer sur la carte pour placer un nouveau rapport
- Filtrer pour voir uniquement ses propres signalements

### Processus d'ajout d'un rapport

1. Cliquez sur le bouton **+** (FAB en bas à droite)
2. Le bouton devient vert (✓) et une bannière verte apparaît
3. Cliquez sur la carte à l'endroit souhaité
4. Un formulaire s'ouvre avec les coordonnées pré-remplies
5. Remplissez les informations du rapport
6. Cliquez sur "Créer le signalement"
7. Le rapport apparaît immédiatement sur la carte

## Dépannage

### La carte ne se centre pas correctement
Le service `map.service.ts` a été mis à jour avec un délai de 100ms pour forcer le redimensionnement et le centrage après l'initialisation.

### Les marqueurs ne sont pas cliquables
Vérifiez que vous n'êtes pas en mode ajout (bannière verte). En mode ajout, les clics sur les marqueurs sont désactivés.

### Erreur Firestore
Si vous voyez des erreurs Firestore dans la console :
1. Vérifiez que Firestore est activé dans Firebase Console
2. Vérifiez les règles de sécurité
3. Vérifiez que vous avez décommenté les bonnes méthodes dans `reports.service.ts`
