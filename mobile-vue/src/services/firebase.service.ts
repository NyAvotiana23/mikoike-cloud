import { initializeApp } from 'firebase/app';
import { getAuth, Auth, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { environment } from '@/environments/environment';
import { getStorage } from 'firebase/storage';
export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
  errorCode?: string;
}

class FirebaseService {
  private app;
  public auth: Auth;
  public db: Firestore;
  public storage;
  private isInitialized = false;

  constructor() {
    try {
      this.app = initializeApp(environment.firebase);
      this.auth = getAuth(this.app);
      this.db = getFirestore(this.app);
      this.storage = getStorage(this.app);
      this.isInitialized = true;
      console.log('✅ Firebase initialisé avec succès');
    } catch (error: any) {
      console.error('❌ Erreur initialisation Firebase:', error);
      throw new Error('Impossible d\'initialiser Firebase. Vérifiez la configuration.');
    }
  }

  /**
   * Connexion utilisateur avec Firebase Authentication
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    if (!this.isInitialized) {
      return {
        success: false,
        error: 'Firebase n\'est pas initialisé',
        errorCode: 'firebase/not-initialized'
      };
    }

    try {
      console.log('🔐 Tentative de connexion:', email);
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      console.log('✅ Connexion réussie:', userCredential.user.uid);
      return { success: true, user: userCredential.user };
    } catch (error: any) {
      console.error('❌ Erreur de connexion:', error.code, error.message);
      const { message, code } = this.handleAuthError(error);
      return { success: false, error: message, errorCode: code };
    }
  }

  /**
   * Déconnexion utilisateur
   */
  async logout(): Promise<AuthResponse> {
    try {
      await signOut(this.auth);
      console.log('👋 Déconnexion réussie');
      return { success: true };
    } catch (error: any) {
      console.error('❌ Erreur de déconnexion:', error);
      return {
        success: false,
        error: 'Erreur lors de la déconnexion',
        errorCode: error.code
      };
    }
  }

  /**
   * Obtient l'utilisateur actuellement connecté
   */
  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  /**
   * Écoute les changements d'état d'authentification
   */
  onAuthStateChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(this.auth, callback);
  }

  /**
   * Vérifie si Firebase est disponible
   */
  isAvailable(): boolean {
    return this.isInitialized;
  }

  /**
   * Gestion des erreurs d'authentification Firebase
   */
  private handleAuthError(error: any): { message: string; code: string } {
    const errorMessages: { [key: string]: string } = {
      // Erreurs d'authentification
      'auth/invalid-email': 'Adresse email invalide',
      'auth/user-disabled': 'Ce compte a été désactivé',
      'auth/user-not-found': 'Aucun compte n\'existe avec cet email',
      'auth/wrong-password': 'Mot de passe incorrect',
      'auth/invalid-credential': 'Email ou mot de passe incorrect',

      // Erreurs de validation
      'auth/email-already-in-use': 'Cette adresse email est déjà utilisée',
      'auth/weak-password': 'Le mot de passe doit contenir au moins 6 caractères',

      // Erreurs de sécurité
      'auth/too-many-requests': 'Trop de tentatives échouées. Veuillez réessayer plus tard',
      'auth/operation-not-allowed': 'Cette opération n\'est pas autorisée',

      // Erreurs réseau
      'auth/network-request-failed': 'Erreur réseau. Vérifiez votre connexion internet',
      'auth/timeout': 'La requête a expiré. Veuillez réessayer',

      // Erreurs de session
      'auth/requires-recent-login': 'Cette opération nécessite une reconnexion récente',
      'auth/expired-action-code': 'Le code d\'action a expiré',
      'auth/invalid-action-code': 'Le code d\'action est invalide'
    };

    const message = errorMessages[error.code] || `Erreur d'authentification: ${error.message}`;
    return { message, code: error.code };
  }
}

export default new FirebaseService();