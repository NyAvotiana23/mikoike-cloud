# Configuration Firebase et Cloudinary pour les Photos de Signalements

## 1. Configuration Cloudinary

### 1.1 Créer un Upload Preset non signé (obligatoire pour le client-side upload)

1. Connectez-vous à votre dashboard Cloudinary : https://console.cloudinary.com/
2. Allez dans **Settings** → **Upload**
3. Scrollez jusqu'à **Upload presets**
4. Cliquez sur **Add upload preset**
5. Configurez :
   - **Preset name** : `mikoike_signalements`
   - **Signing Mode** : `Unsigned` (important pour le client-side)
   - **Folder** : `signalements` (optionnel, les photos seront organisées par signalement)
   - **Allowed formats** : `jpg, png, gif, webp`
   - **Max file size** : `10 MB` (recommandé)
6. Cliquez sur **Save**

### 1.2 Credentials actuels (déjà configurés dans le code)

```
Cloud name: dpcpnlsim
API Key: 362239814724361
API Secret: fxhJ8onzkM-oPZnFjTONHfO7Jcc
Upload Preset: mikoike_signalements
```

> ⚠️ **Sécurité** : L'API Secret ne doit jamais être exposé côté client en production.
> Pour la production, utilisez un backend pour générer des signatures d'upload.

---

## 2. Configuration Firebase Firestore

### 2.1 Créer la collection `photo_signalement`

La collection sera créée automatiquement lors du premier upload de photo. Cependant, vous pouvez la créer manuellement :

1. Allez dans Firebase Console : https://console.firebase.google.com/
2. Sélectionnez votre projet : `cloudproject-57d75`
3. Allez dans **Firestore Database**
4. Cliquez sur **+ Démarrer une collection**
5. Nom de la collection : `photo_signalement`
6. Créez un document exemple (sera supprimé après) :
   ```
   Document ID: exemple (auto-généré)
   Fields:
     - id: string = "exemple"
     - signalementId: string = "123"
     - url: string = "https://exemple.com/photo.jpg"
     - publicId: string = "signalements/123/photo1"
     - createdAt: timestamp = (date actuelle)
     - ordre: number = 0
   ```

### 2.2 Structure de la collection `photo_signalement`

| Champ | Type | Description |
|-------|------|-------------|
| `id` | string | ID unique de la photo |
| `signalementId` | string | ID du signalement parent (relation 1-N) |
| `url` | string | URL Cloudinary de la photo |
| `publicId` | string | ID public Cloudinary (pour transformation/suppression) |
| `createdAt` | timestamp | Date de création |
| `updatedAt` | timestamp | Date de dernière modification |
| `ordre` | number | Ordre d'affichage (0, 1, 2...) |
| `legende` | string (optionnel) | Légende de la photo |
| `width` | number (optionnel) | Largeur en pixels |
| `height` | number (optionnel) | Hauteur en pixels |
| `format` | string (optionnel) | Format (jpg, png, webp...) |

### 2.3 Règles de sécurité Firestore (recommandées)

Allez dans **Firestore Database** → **Rules** et ajoutez :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Collection signalements
    match /signalements/{signalementId} {
      // Lecture publique
      allow read: if true;
      
      // Écriture uniquement pour les utilisateurs authentifiés
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         request.auth.uid == resource.data.userId.toString());
    }
    
    // Collection photo_signalement
    match /photo_signalement/{photoId} {
      // Lecture publique (les photos sont publiques)
      allow read: if true;
      
      // Création uniquement pour les utilisateurs authentifiés
      allow create: if request.auth != null;
      
      // Modification/Suppression : l'utilisateur doit être le propriétaire du signalement parent
      allow update, delete: if request.auth != null;
    }
  }
}
```

### 2.4 Créer un index composite (si nécessaire)

Si vous avez des erreurs de requête, vous devrez peut-être créer un index :

1. Allez dans **Firestore Database** → **Indexes**
2. Cliquez sur **Add index**
3. Collection ID : `photo_signalement`
4. Fields :
   - `signalementId` : Ascending
   - `ordre` : Ascending
5. Query scope : Collection
6. Cliquez sur **Create**

---

## 3. Fichiers créés/modifiés

### Nouveaux fichiers :
- `src/types/photo-signalement.ts` - Types TypeScript pour les photos
- `src/services/cloudinary.service.ts` - Service d'upload Cloudinary
- `src/services/photo-signalement.service.ts` - Service Firebase pour photo_signalement

### Fichiers modifiés :
- `src/services/signalements.service.firebase.ts` - Ajout des méthodes de gestion des photos
- `src/components/SignalementDetailModal.vue` - Chargement des photos depuis Firebase
- `src/pages/MapPage.vue` - Upload des photos vers Cloudinary lors de la création

---

## 4. Utilisation

### Créer un signalement avec photos :

```typescript
import signalementsService from '@/services/signalements.service.firebase';

// Les photos base64 seront automatiquement uploadées vers Cloudinary
const result = await signalementsService.createWithPhotos(
  {
    userId: '123',
    location: { lat: -18.87, lng: 47.50 },
    titre: 'Mon signalement',
    description: 'Description...',
    // ... autres champs
  },
  [base64Photo1, base64Photo2] // Photos en base64 ou File/Blob
);

console.log('Signalement créé:', result.signalement);
console.log('URLs des photos:', result.photoUrls);
```

### Ajouter des photos à un signalement existant :

```typescript
const result = await signalementsService.addPhotosToSignalement(
  signalementId,
  [file1, file2] // File, Blob ou base64
);

console.log('Photos ajoutées:', result.urls);
```

### Charger les photos d'un signalement :

```typescript
import photoSignalementService from '@/services/photo-signalement.service';

const photos = await photoSignalementService.loadPhotosForSignalement(signalementId);
// Retourne un tableau de PhotoSignalement avec url, publicId, etc.
```

---

## 5. Architecture des données

```
Firebase Firestore
│
├── signalements/
│   ├── {signalementId}
│   │   ├── id: string
│   │   ├── userId: string
│   │   ├── titre: string
│   │   ├── description: string
│   │   ├── photos: string[] (URLs pour rétrocompatibilité)
│   │   └── ...
│   └── ...
│
└── photo_signalement/          ← NOUVELLE COLLECTION
    ├── {photoId}
    │   ├── id: string
    │   ├── signalementId: string  ← Lien vers le signalement
    │   ├── url: string            ← URL Cloudinary
    │   ├── publicId: string       ← ID Cloudinary
    │   ├── ordre: number
    │   └── ...
    └── ...

Cloudinary Storage
│
└── signalements/
    ├── {signalementId}/
    │   ├── photo1.jpg
    │   ├── photo2.jpg
    │   └── ...
    └── ...
```

---

## 6. Tests

Pour tester l'intégration :

1. Démarrez l'application : `npm run dev`
2. Connectez-vous
3. Créez un nouveau signalement avec des photos
4. Vérifiez dans :
   - Firebase Console → Firestore → `photo_signalement` (nouvelles entrées)
   - Cloudinary Dashboard → Media Library → `signalements/` (photos uploadées)
5. Ouvrez le détail d'un signalement et vérifiez que les photos se chargent

---

## 7. Dépannage

### Erreur "Upload preset not found"
→ Créez le preset `mikoike_signalements` dans Cloudinary (voir section 1.1)

### Erreur "Missing or insufficient permissions"
→ Vérifiez les règles Firestore (voir section 2.3)

### Erreur d'index Firestore
→ Cliquez sur le lien dans l'erreur pour créer l'index automatiquement, ou suivez la section 2.4

### Les photos ne s'affichent pas
→ Vérifiez que la collection `photo_signalement` contient des données
→ Vérifiez les URLs dans Cloudinary
