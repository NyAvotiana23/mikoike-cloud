import { ref, computed } from 'vue';
import firebaseService from './firebase.service';

// Types
interface User {
  id: string;
  email: string;
  nom?: string;
  prenom?: string;
}

interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}

class FirebaseAuthService {
  private currentUser = ref<User | null>(null);

  constructor() {
    // Écouter les changements d'état d'authentification
    firebaseService.onAuthStateChange((firebaseUser) => {
      if (firebaseUser) {
        this.currentUser.value = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          nom: firebaseUser.displayName?.split(' ')[0] || '',
          prenom: firebaseUser.displayName?.split(' ')[1] || ''
        };
      } else {
        this.currentUser.value = null;
      }
    });
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const result = await firebaseService.login(email, password);

    if (result.success && result.user) {
      const user: User = {
        id: result.user.uid,
        email: result.user.email || '',
        nom: result.user.displayName?.split(' ')[0] || '',
        prenom: result.user.displayName?.split(' ')[1] || ''
      };
      return { success: true, user };
    }

    return { success: false, error: result.error };
  }

  async logout(): Promise<AuthResponse> {
    const result = await firebaseService.logout();
    if (result.success) {
      this.currentUser.value = null;
    }
    return result;
  }

  getCurrentUser(): User | null {
    return this.currentUser.value;
  }

  isAuthenticated = computed(() => !!this.currentUser.value);
}

const authService = new FirebaseAuthService();

export const useAuth = () => ({
  currentUser: computed(() => authService.getCurrentUser()),
  isAuthenticated: authService.isAuthenticated,
  login: authService.login.bind(authService),
  logout: authService.logout.bind(authService)
});

export default authService;