export const environment = {
  production: false,

  firebase: {
    apiKey: "AIzaSyAQhZleZxSbCPlCN7MqbX7LSlWm8aTQ87U",
    authDomain: "cloudproject-57d75.firebaseapp.com",
    databaseURL: "https://cloudproject-57d75-default-rtdb.firebaseio.com",
    projectId: "cloudproject-57d75",
    storageBucket: "cloudproject-57d75.firebasestorage.app",
    messagingSenderId: "1021976189737",
    appId: "1:1021976189737:android:35ce1ab84d9b883fd6f538"
  },
  
  // Configuration OpenStreetMap
  osm: {
    tileUrl: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; OpenStreetMap contributors'
  },
  
  // Position par défaut (Antananarivo, Madagascar)
  defaultLocation: {
    lat: -18.8792,
    lng: 47.5079,
    zoom: 13
  }
}