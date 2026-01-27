export const environment = {
  production: false,

  firebase: {

    
    apiKey: "AIzaSyAQhZleZxSbCPlCN7MqbX7LSlWm8aTQ87U",  // Laissez cette valeur pour désactiver Firebase
    authDomain: "cloudproject-57475.firebaseapp.com",
    projectId: "cloudproject-57475",
    storageBucket: "cloudproject-57475.appspot.com",
    messagingSenderId: "102197049737",
    appId: "1:102197049737:android:35c7da64d9f483fd4f538"
    

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