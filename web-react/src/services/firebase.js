import { initializeApp } from 'firebase/app';
// Add other imports as needed (e.g., getAuth, getFirestore)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
};
const app = initializeApp(firebaseConfig);
export default app;