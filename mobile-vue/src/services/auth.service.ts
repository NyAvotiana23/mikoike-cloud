// import { ref, computed } from 'vue';
// import firebaseService from './firebase.service';

// const currentUser = ref<any>(null);
// const isAuthenticated = computed(() => !!currentUser.value);

// export const useAuth = () => {
//   firebaseService.onAuthStateChange((user) => {
//     currentUser.value = user;
//   });

//   return {
//     currentUser,
//     isAuthenticated,
//     login: firebaseService.login.bind(firebaseService),
//     logout: firebaseService.logout.bind(firebaseService)
//   };
// };

import { ref, computed } from 'vue';

// Types
interface User {
  id: string;
  email: string;
  nom: string;
  prenom: string;
}

interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}

// Stockage local simulé
const STORAGE_KEY = 'road_works_auth';
const USERS_KEY = 'road_works_users';

// Utilisateurs par défaut (simuler la base de données)
const DEFAULT_USERS: User[] = [
  { id: '1', email: 'user@test.com', nom: 'Dupont', prenom: 'Jean' },
  { id: '2', email: 'manager@test.com', nom: 'Martin', prenom: 'Sophie' }
];

// Mots de passe par défaut (en production, utiliser hash!)
const DEFAULT_PASSWORDS: Record<string, string> = {
  'user@test.com': 'password123',
  'manager@test.com': 'admin123'
};

class LocalAuthService {
  private currentUser = ref<User | null>(null);
  private loginAttempts: Record<string, number> = {};
  private blockedUntil: Record<string, number> = {};
  
  constructor() {
    this.initUsers();
    this.loadCurrentUser();
  }

  private initUsers() {
    if (!localStorage.getItem(USERS_KEY)) {
      localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
    }
  }

  private loadCurrentUser() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        this.currentUser.value = JSON.parse(stored);
      } catch (e) {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    // Simuler délai réseau
    await new Promise(resolve => setTimeout(resolve, 500));

    // Vérifier si compte bloqué
    const now = Date.now();
    if (this.blockedUntil[email] && this.blockedUntil[email] > now) {
      const remainingMinutes = Math.ceil((this.blockedUntil[email] - now) / 60000);
      return {
        success: false,
        error: `Compte bloqué. Réessayez dans ${remainingMinutes} minute(s).`
      };
    }

    // Vérifier identifiants
    if (DEFAULT_PASSWORDS[email] !== password) {
      this.loginAttempts[email] = (this.loginAttempts[email] || 0) + 1;
      
      if (this.loginAttempts[email] >= 3) {
        this.blockedUntil[email] = now + 5 * 60 * 1000; // Bloquer 5 minutes
        this.loginAttempts[email] = 0;
        return {
          success: false,
          error: 'Trop de tentatives. Compte bloqué pendant 5 minutes.'
        };
      }

      const remaining = 3 - this.loginAttempts[email];
      return {
        success: false,
        error: `Identifiants invalides. ${remaining} tentative(s) restante(s).`
      };
    }

    // Connexion réussie
    this.loginAttempts[email] = 0;
    const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const user = users.find(u => u.email === email);

    if (!user) {
      return { success: false, error: 'Utilisateur non trouvé' };
    }

    this.currentUser.value = user;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));

    return { success: true, user };
  }

  async logout(): Promise<AuthResponse> {
    this.currentUser.value = null;
    localStorage.removeItem(STORAGE_KEY);
    return { success: true };
  }

  getCurrentUser(): User | null {
    return this.currentUser.value;
  }

  isAuthenticated = computed(() => !!this.currentUser.value);
}

const authService = new LocalAuthService();

export const useAuth = () => ({
  currentUser: computed(() => authService.getCurrentUser()),
  isAuthenticated: authService.isAuthenticated,
  login: authService.login.bind(authService),
  logout: authService.logout.bind(authService)
});

export default authService;