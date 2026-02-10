# 🔥 Configuration des Règles Firestore

## Erreur Actuelle
```
FirebaseError: Missing or insufficient permissions
```

Cette erreur signifie que vos règles Firestore bloquent la création de documents.

## Solution : Configurer les Règles Firestore

### 1. Accéder à la Console Firebase

1. Allez sur https://console.firebase.google.com
2. Sélectionnez votre projet : **cloudproject-57d75**
3. Dans le menu de gauche, cliquez sur **Firestore Database**
4. Cliquez sur l'onglet **Règles** (Rules)

### 2. Règles Recommandées pour le Développement

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Collection des signalements
    match /signalements/{signalement} {
      // Tout le monde peut lire (visiteurs inclus)
      allow read: if true;
      
      // Seuls les utilisateurs authentifiés peuvent créer
      allow create: if request.auth != null 
        && request.resource.data.userId == request.auth.uid;
      
      // Seul le créateur peut modifier/supprimer
      allow update, delete: if request.auth != null 
        && resource.data.userId == request.auth.uid;
    }
    
    // Collection des utilisateurs (optionnel)
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 3. Règles en Mode Test (Temporaire - 30 jours)

⚠️ **ATTENTION** : À utiliser UNIQUEMENT pour tester, pas en production !

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2026, 3, 15);
    }
  }
}
```

### 4. Appliquer les Règles

1. Copiez les règles choisies
2. Collez-les dans l'éditeur de la console Firebase
3. Cliquez sur **Publier** (Publish)
4. Attendez quelques secondes que les règles se propagent

### 5. Vérifier les Règles

Après avoir publié les règles, testez dans votre application :

```javascript
// Dans la console du navigateur (F12)
console.log('Auth:', firebase.auth().currentUser);
console.log('UID:', firebase.auth().currentUser?.uid);
```

## Structure des Données Validée

Votre structure Firebase est correcte :

```typescript
{
  id: 1001,                             // Numérique
  userId: 102,                          // Numérique
  userEmail: "citoyen.test@email.com",
  description: "Nid-de-poule important...",
  adresse: "Rue de la République, 13001 Marseille",
  latitude: 43.296482,
  longitude: 5.36978,
  photoUrl: "https://storage.googleapis.com/...",
  statusCode: "NOUVEAU",
  statusLibelle: "Nouveau",
  dateSignalement: Timestamp,
  createdAt: Timestamp,
  updatedAt: Timestamp,
  syncedAt: Timestamp
}
```

## Problème Possible avec userId

⚠️ **ATTENTION** : Dans votre structure, `userId` est un **nombre** (102), mais Firebase Auth utilise des **strings** (UID).

### Solution 1 : Utiliser le UID Firebase Auth

Modifiez les règles pour comparer avec le UID string :

```javascript
allow create: if request.auth != null;
```

### Solution 2 : Stocker l'ID utilisateur comme string

Dans votre application, convertissez le userId en string :

```typescript
userId: String(userContext.value.userId)
```

## Test des Règles

Dans la console Firebase, allez dans **Règles** > **Simulateur de règles** :

1. **Type d'opération** : `write`
2. **Chemin** : `signalements/test123`
3. **État d'authentification** : Authentifié avec un UID
4. **Données du document** : 
```json
{
  "userId": 102,
  "description": "Test",
  "statusCode": "NOUVEAU"
}
```

Cliquez sur **Exécuter** pour voir si la règle autorise l'opération.

## Commandes Utiles

### Vérifier l'utilisateur connecté

```javascript
// Dans la console du navigateur
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    console.log('✅ Connecté:', user.uid, user.email);
  } else {
    console.log('❌ Non connecté');
  }
});
```

### Forcer la reconnexion

```javascript
// Se déconnecter
await firebase.auth().signOut();

// Se reconnecter
await firebase.auth().signInWithEmailAndPassword('email@test.com', 'password');
```

## Résumé des Actions

1. ✅ **Aller dans la console Firebase** → Firestore Database → Règles
2. ✅ **Copier les règles recommandées** (ou mode test temporaire)
3. ✅ **Publier les règles**
4. ✅ **Tester la création** d'un signalement dans l'app
5. ✅ **Vérifier les logs** dans la console du navigateur

---

**Date de création** : 2026-02-10  
**Dernière mise à jour** : 2026-02-10

