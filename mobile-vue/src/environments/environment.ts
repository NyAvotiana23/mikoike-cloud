export const environment = {
  production: false,
  firebase: {
    apiKey: "VOTRE_API_KEY",
    authDomain: "projet-cloud-p17.firebaseapp.com",
    projectId: "projet-cloud-p17",
    storageBucket: "projet-cloud-p17.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
  },
  osm: {
    tileUrl: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; OpenStreetMap contributors'
  },
  defaultLocation: {
    lat: -18.8792,
    lng: 47.5079,
    zoom: 13
  }
};