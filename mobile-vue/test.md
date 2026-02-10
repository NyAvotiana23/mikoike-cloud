# 📱 TODO - Module Mobile - Amélioration & Finalisation

## 🔐 1. Authentification & Gestion Utilisateurs

### 1.1 Intégration Firebase Authentication
- [ ] **Configurer Firebase Authentication dans le projet**
    - Vérifier que les configurations Firebase sont correctes dans `environment.ts` et `environment.prod.ts`
    - Installer les dépendances Firebase Auth si nécessaire
    - Initialiser Firebase Authentication dans `firebase.service.ts`

- [ ] **Implémenter la connexion Firebase**
    - Modifier `auth.service.ts` ou `auth.service.hybrid.ts` pour utiliser `signInWithEmailAndPassword()`
    - Gérer les erreurs d'authentification Firebase (mot de passe incorrect, utilisateur non trouvé, etc.)
    - Conserver le système de fallback local en cas d'absence de connexion

- [ ] **Implémenter l'inscription Firebase**
    - Créer une fonction pour `createUserWithEmailAndPassword()`
    - Gérer la validation des emails (format, unicité)
    - Gérer les erreurs d'inscription (email déjà utilisé, mot de passe faible, etc.)

### 1.2 Synchronisation Firebase Auth ↔ Firestore
- [ ] **Créer un document Firestore lors de l'inscription**
    - Après création d'un utilisateur dans Firebase Auth, créer automatiquement un document dans `users` collection de Firestore
    - Structure suggérée du document :
      ```typescript
      {
        uid: string,          // ID de Firebase Auth
        email: string,
        nom: string,
        prenom: string,
        dateCreation: Timestamp,
        dateModification: Timestamp,
        role: 'user' | 'manager',
        notificationsActivees: boolean
      }
      ```

- [ ] **Récupérer les données Firestore après login**
    - Après authentification réussie, récupérer le document utilisateur depuis Firestore
    - Mettre à jour le contexte utilisateur avec toutes les données (nom, prénom, rôle, etc.)
    - Gérer le cas où l'utilisateur Auth existe mais pas le document Firestore

- [ ] **Synchroniser les modifications de profil**
    - Lors de la modification des infos utilisateur, mettre à jour à la fois Firebase Auth (email) et Firestore (nom, prénom, etc.)
    - Implémenter une fonction `updateUserProfile()` dans le service d'authentification

### 1.3 Adaptation dynamique mobile Login/Notification
- [ ] **Rendre LoginPage.vue dynamique**
    - Détecter automatiquement si Firebase est disponible (online) ou utiliser le mode local (offline)
    - Afficher un indicateur visuel du mode de connexion actif
    - Gérer la transition automatique entre les modes lors de la reconnexion

- [ ] **Améliorer les messages d'erreur**
    - Afficher des messages d'erreur clairs et contextuels selon le mode (Firebase ou local)
    - Ajouter des toasts pour informer l'utilisateur des tentatives de connexion échouées
    - Indiquer clairement le nombre de tentatives restantes avant blocage

## 👤 2. Page "Mon Compte" (AccountPage.vue)

### 2.1 Affichage dynamique des informations
- [ ] **Afficher les données utilisateur depuis Firestore**
    - Récupérer et afficher : nom, prénom, email, date de création du compte
    - Afficher le rôle de l'utilisateur (Utilisateur / Manager)
    - Afficher le nombre total de signalements créés par l'utilisateur

- [ ] **Créer une interface de modification de profil**
    - Ajouter des champs modifiables pour : nom, prénom
    - Ajouter la possibilité de changer le mot de passe (via Firebase Auth)
    - Ajouter un bouton "Enregistrer les modifications"
    - Valider les données avant sauvegarde

- [ ] **Afficher les statistiques personnelles**
    - Nombre de signalements créés au total
    - Nombre de signalements par statut (nouveau, en cours, terminé)
    - Date du dernier signalement créé

### 2.2 Paramètres de notifications
- [ ] **Section de gestion des notifications**
    - Ajouter un toggle pour activer/désactiver les notifications
    - Sauvegarder la préférence dans Firestore
    - Synchroniser avec le système de notifications

## 🗺️ 3. Filtres sur la Carte (MapPage.vue)

### 3.1 Problème : Disparition des filtres en mode mobile
- [ ] **Analyser le problème actuel**
    - Identifier pourquoi les filtres disparaissent sur mobile
    - Vérifier les media queries CSS ou les conditions d'affichage

- [ ] **Repositionner les filtres pour mobile**
    - Créer une version mobile des filtres (bottom sheet, floating button, etc.)
    - Les filtres doivent rester accessibles en permanence
    - Utiliser un composant Ionic comme `ion-fab` ou `ion-segment`

### 3.2 Filtres "Mes Signalements" vs "Tous les Signalements"
- [ ] **Implémenter le filtre "Mes Signalements"**
    - Bouton/toggle pour afficher uniquement les signalements de l'utilisateur connecté
    - Filtrer par `userId` dans la liste des signalements
    - Mettre à jour les marqueurs sur la carte en temps réel

- [ ] **Implémenter le filtre "Tous les Signalements"**
    - Bouton/toggle pour afficher tous les signalements (vue par défaut pour visiteurs)
    - Afficher tous les marqueurs sans restriction

- [ ] **Persister le choix du filtre**
    - Sauvegarder le filtre actif dans localStorage ou dans l'état global
    - Restaurer le filtre choisi lors de la prochaine visite

- [ ] **Design responsive des filtres**
    - Adapter le layout des filtres pour mobile (horizontal scroll, chips, segments)
    - Tester sur différentes tailles d'écran
    - Assurer que les filtres ne cachent pas la carte

## 📸 4. Photos dans les Signalements

### 4.1 Détails d'un signalement (SignalementDetailModal.vue)
- [ ] **Afficher les photos statiques (déjà fait partiellement)**
    - Vérifier que la galerie de photos s'affiche correctement
    - S'assurer que la visionneuse de photos fonctionne (zoom, navigation)

- [ ] **Ajouter une section pour ajouter des photos**
    - Ajouter un bouton "Ajouter des photos" dans la modal de détails
    - Pour l'instant, ce bouton ne fait rien (préparation pour Firebase Storage)
    - Afficher un message "Fonctionnalité bientôt disponible"

### 4.2 Ajout de signalement (formulaire de création)
- [ ] **Localiser le formulaire d'ajout de signalement**
    - Identifier dans quel composant/page se trouve le formulaire de création
    - Si non existant, créer une page/modal dédiée

- [ ] **Ajouter un champ pour les photos**
    - Créer un composant de sélection de photos
    - Utiliser `<input type="file" accept="image/*" multiple>` ou Capacitor Camera API
    - Pour l'instant, le bouton est statique (ne fait rien)
    - Prévisualiser les photos sélectionnées avant envoi

- [ ] **UI/UX du sélecteur de photos**
    - Afficher des miniatures des photos sélectionnées
    - Permettre de supprimer une photo avant envoi
    - Limiter le nombre de photos (par exemple 5 max)
    - Afficher la taille totale des photos

### 4.3 Préparation pour Firebase Storage (à faire plus tard)
- [ ] **Structure de données pour les photos**
    - Définir comment les URLs des photos seront stockées dans Firestore
    - Prévoir un champ `photos: string[]` dans le type `Signalement`
    - Définir la structure des dossiers dans Firebase Storage (ex: `/signalements/{signalementId}/{photoId}.jpg`)

## 🔔 5. Système de Notifications Firebase

### 5.1 Configuration Firebase Cloud Messaging (FCM)
- [ ] **Configurer FCM dans le projet**
    - Ajouter les dépendances Firebase Messaging
    - Configurer le fichier `firebase-messaging-sw.js` (service worker)
    - Obtenir le Server Key depuis Firebase Console

- [ ] **Demander la permission de notifications**
    - Implémenter une fonction pour demander la permission à l'utilisateur
    - Afficher une alerte explicative avant de demander la permission
    - Gérer le refus de permission

### 5.2 Enregistrement du token FCM
- [ ] **Récupérer le token FCM de l'appareil**
    - Utiliser `getToken()` de Firebase Messaging
    - Sauvegarder le token dans Firestore (dans le document utilisateur)
    - Structure suggérée : `fcmTokens: string[]` (un utilisateur peut avoir plusieurs appareils)

- [ ] **Mettre à jour le token si changement**
    - Écouter les changements de token avec `onTokenRefresh()`
    - Mettre à jour le token dans Firestore

### 5.3 Réception et affichage des notifications
- [ ] **Écouter les notifications en foreground**
    - Implémenter `onMessage()` pour recevoir les notifications quand l'app est ouverte
    - Afficher un toast ou une bannière avec le contenu de la notification

- [ ] **Écouter les notifications en background**
    - Configurer le service worker pour gérer les notifications en arrière-plan
    - Définir le comportement au clic sur la notification (ouvrir l'app, naviguer vers la page concernée)

- [ ] **Créer un service de notifications (notifications.service.ts)**
    - Centraliser toute la logique de notifications
    - Méthodes : `requestPermission()`, `subscribeToNotifications()`, `unsubscribeFromNotifications()`
    - Méthode pour afficher les notifications reçues dans NotificationsPage.vue

### 5.4 Envoi de notifications (depuis le backend Web)
- [ ] **Déclencher une notification lors d'un changement de statut**
    - Quand un manager change le statut d'un signalement, envoyer une notification FCM au créateur
    - La notification doit contenir : titre, message, `signalementId`, ancien et nouveau statut

- [ ] **Structure du payload de notification**
  ```json
  {
    "notification": {
      "title": "Mise à jour de votre signalement",
      "body": "Le statut est passé de 'nouveau' à 'en cours'"
    },
    "data": {
      "type": "status_change",
      "signalementId": "abc123",
      "oldStatus": "nouveau",
      "newStatus": "en_cours",
      "signalementTitre": "Nid de poule Avenue de l'Indépendance"
    }
  }
  ```

### 5.5 Affichage des notifications dans l'app
- [ ] **Page Notifications (NotificationsPage.vue)**
    - Afficher la liste des notifications reçues
    - Marquer les notifications comme lues/non lues
    - Permettre de naviguer vers le signalement concerné en cliquant sur la notification
    - Afficher une pastille de compteur sur l'icône de notifications (nombre de non lues)

- [ ] **Badge de notification non lue**
    - Ajouter un badge sur l'onglet "Notifications" dans TabsPage.vue
    - Mettre à jour le compteur en temps réel

## 📋 6. Améliorations Générales

### 6.1 Gestion des erreurs
- [ ] **Afficher des messages d'erreur clairs**
    - Pour chaque action (login, création signalement, etc.), afficher un toast en cas d'erreur
    - Logger les erreurs dans la console pour debug

### 6.2 Loading states
- [ ] **Ajouter des spinners de chargement**
    - Pendant la connexion
    - Pendant le chargement des signalements
    - Pendant la synchronisation Firebase

### 6.3 Offline-first
- [ ] **Tester le mode hors ligne**
    - Vérifier que l'app fonctionne sans connexion Internet
    - Les signalements créés hors ligne doivent être synchronisés plus tard

### 6.4 Tests & Validation
- [ ] **Tester sur appareil réel**
    - Générer un APK
    - Installer sur un appareil Android
    - Tester toutes les fonctionnalités (login, notifications, photos, etc.)

- [ ] **Tester les scénarios edge cases**
    - Connexion perdue pendant une synchronisation
    - Utilisateur bloqué après 3 tentatives
    - Permission de notifications refusée

## 📚 7. Documentation

- [ ] **Documenter les nouveaux services**
    - Ajouter des commentaires JSDoc dans les services
    - Documenter les interfaces TypeScript

- [ ] **Mettre à jour le README**
    - Expliquer comment configurer Firebase
    - Expliquer la structure du projet
    - Lister les dépendances nécessaires

---

## 🎯 Priorités

### ⚡ Priorité Haute (À faire en premier)
1. Intégration Firebase Authentication (1.1, 1.2)
2. Synchronisation Auth ↔ Firestore (1.2)
3. Filtres sur la carte pour mobile (3.1, 3.2)

### 🔶 Priorité Moyenne
4. Page "Mon Compte" dynamique (2.1, 2.2)
5. Ajout du champ photos dans le formulaire (4.2)
6. Configuration FCM de base (5.1, 5.2)

### 🔷 Priorité Basse (À faire en dernier)
7. Réception et affichage des notifications (5.3, 5.4, 5.5)
8. Améliorations générales (6.1, 6.2, 6.3)
9. Documentation (7)

---

## 📝 Notes Importantes

- **Firebase vs Local** : Le système doit toujours fonctionner en mode local (fallback) si Firebase n'est pas disponible
- **Sécurité** : Ne jamais exposer les clés Firebase dans le code (déjà dans environment.ts, OK)
- **Photos** : Pour l'instant, ajouter uniquement les boutons (sans fonctionnalité d'upload), en attendant la configuration Firebase Storage
- **Notifications** : Nécessite une configuration côté backend (module Web) pour l'envoi des notifications FCM

---

**Dernière mise à jour** : Février 2026  
**Version** : 1.0