export const environment = {
  production: false,
  
  // Configuration Firebase
  // Pour activer Firebase, remplacez les valeurs ci-dessous par vos vraies credentials
  // Si Firebase n'est pas configuré ou non disponible, l'app basculera automatiquement en mode local
  firebase: {
    // IMPORTANT: Remplacez ces valeurs par vos vraies credentials Firebase
    // Pour obtenir ces valeurs:
    // 1. Allez sur https://console.firebase.google.com/
    // 2. Sélectionnez votre projet
    // 3. Allez dans Paramètres du projet > Général
    // 4. Faites défiler jusqu'à "Vos applications" et copiez la configuration
    
    apiKey: "AIzaSyAQhZleZxSbCPlCN7MqbX7LSlWm8aTQ87U",  // Laissez cette valeur pour désactiver Firebase
    authDomain: "cloudproject-57475.firebaseapp.com",
    projectId: "cloudproject-57475",
    storageBucket: "cloudproject-57475.appspot.com",
    messagingSenderId: "102197049737",
    appId: "1:102197049737:android:35c7da64d9f483fd4f538"
    
    // Exemple de configuration valide (NE PAS UTILISER en production):
    // apiKey: "AIzaSyDKj8fH3kL9mN2pQ4rS5tU6vW7xY8zA9B0",
    // authDomain: "mon-projet.firebaseapp.com",
    // projectId: "mon-projet",
    // storageBucket: "mon-projet.appspot.com",
    // messagingSenderId: "123456789012",
    // appId: "1:123456789012:web:abc123def456"
  },
  
  // Configuration OpenStreetMap
  osm: {
    tileUrl: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; OpenStreetMap contributors'
  },
  
  // Position par défaut (Antananarivo)
  defaultLocation: {
    lat: -18.8792,
    lng: 47.5079,
    zoom: 13
  }
}