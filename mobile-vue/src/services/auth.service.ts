import { ref, computed } from 'vue';
import firebaseService from './firebase.service';
import type { User as FirebaseUser } from 'firebase/auth';

// Types
export interface User {
  id: string;
  email: string;
  name?: string;
  displayName?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
  errorCode?: string;
}

class FirebaseAuthService {
  private currentUser = ref<User | null>(null);
  private authReady = ref(false);

  constructor() {
    this.initializeAuth();
  }

  /**
   * Initialise l'écoute des changements d'état d'authentification
   */
  private initializeAuth() {
    firebaseService.onAuthStateChange((firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        this.currentUser.value = this.mapFirebaseUser(firebaseUser);
        console.log('👤 Utilisateur connecté:', this.currentUser.value.email);
      } else {
        this.currentUser.value = null;
        console.log('👤 Aucun utilisateur connecté');
      }
      this.authReady.value = true;
    });
  }

  /**
   * Connexion utilisateur
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    // Validation des entrées
    if (!email || !email.trim()) {
      return {
        success: false,
        error: 'Veuillez saisir une adresse email',
        errorCode: 'validation/empty-email'
      };
    }

    if (!password || !password.trim()) {
      return {
        success: false,
        error: 'Veuillez saisir un mot de passe',
        errorCode: 'validation/empty-password'
      };
    }

    const result = await firebaseService.login(email.trim(), password);

    if (result.success && result.user) {
      const user = this.mapFirebaseUser(result.user);
      this.currentUser.value = user;
      return { success: true, user };
    }

    return {
      success: false,
      error: result.error,
      errorCode: result.errorCode
    };
  }

  /**
   * Déconnexion utilisateur
   */
  async logout(): Promise<AuthResponse> {
    const result = await firebaseService.logout();
    if (result.success) {
      this.currentUser.value = null;
    }
    return result;
  }

  /**
   * Obtient l'utilisateur actuel
   */
  getCurrentUser(): User | null {
    return this.currentUser.value;
  }

  /**
   * Vérifie si l'utilisateur est authentifié
   */
  isAuthenticated = computed(() => !!this.currentUser.value);

  /**
   * Vérifie si l'initialisation de l'authentification est terminée
   */
  isAuthReady = computed(() => this.authReady.value);

  /**
   * Mappe un utilisateur Firebase vers notre interface User
   */
  private mapFirebaseUser(firebaseUser: FirebaseUser): User {
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      name: firebaseUser.displayName || '',
      displayName: firebaseUser.displayName || ''
    };
  }

  /**
   * Obtient le UID Firebase de l'utilisateur actuel
   */
  getCurrentUserId(): string | null {
    return this.currentUser.value?.id || null;
  }

  /**
   * Obtient l'email de l'utilisateur actuel
   */
  getCurrentUserEmail(): string | null {
    return this.currentUser.value?.email || null;
  }
}

const authService = new FirebaseAuthService();

export const useAuth = () => ({
  currentUser: computed(() => authService.getCurrentUser()),
  isAuthenticated: authService.isAuthenticated,
  isAuthReady: authService.isAuthReady,
  login: authService.login.bind(authService),
  logout: authService.logout.bind(authService),
  getCurrentUserId: authService.getCurrentUserId.bind(authService),
  getCurrentUserEmail: authService.getCurrentUserEmail.bind(authService)
});

export default authService;