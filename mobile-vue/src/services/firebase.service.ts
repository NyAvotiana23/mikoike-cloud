import { initializeApp } from 'firebase/app';
import { getAuth, Auth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { environment } from '@/environments/environment';

class FirebaseService {
  private app;
  public auth: Auth;
  public db: Firestore;

  constructor() {
    this.app = initializeApp(environment.firebase);
    this.auth = getAuth(this.app);
    this.db = getFirestore(this.app);
  }

  // Login uniquement (inscription via web manager)
  async login(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error: any) {
      return { success: false, error: this.handleAuthError(error) };
    }
  }

  async logout() {
    try {
      await signOut(this.auth);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  getCurrentUser() {
    return this.auth.currentUser;
  }

  onAuthStateChange(callback: (user: any) => void) {
    return onAuthStateChanged(this.auth, callback);
  }

  private handleAuthError(error: any): string {
    const errorMessages: { [key: string]: string } = {
      'auth/user-not-found': 'Utilisateur non trouvé',
      'auth/wrong-password': 'Mot de passe incorrect',
      'auth/too-many-requests': 'Trop de tentatives. Compte temporairement bloqué',
      'auth/network-request-failed': 'Erreur réseau. Vérifiez votre connexion',
      'auth/invalid-credential': 'Identifiants invalides'
    };
    return errorMessages[error.code] || 'Erreur d\'authentification';
  }
}

export default new FirebaseService();