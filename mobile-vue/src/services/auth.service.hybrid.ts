import { ref, computed } from 'vue';
import databaseService from './database.service';

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

// Stockage local
const STORAGE_KEY = 'road_works_auth';
const USERS_KEY = 'road_works_users';

// Utilisateurs par défaut (pour mode local)
const DEFAULT_USERS: User[] = [
  { id: '1', email: 'user@test.com', nom: 'Dupont', prenom: 'Jean' },
  { id: '2', email: 'manager@test.com', nom: 'Martin', prenom: 'Sophie' }
];

const DEFAULT_PASSWORDS: Record<string, string> = {
  'user@test.com': 'password123',
  'manager@test.com': 'admin123'
};

class HybridAuthService {
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

  /**
   * Connexion hybride : tente Firebase puis fallback local
   */
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

    // Tenter Firebase si disponible
    if (databaseService.isFirebaseAvailable()) {
      try {
        console.log('🔥 Tentative d\'authentification Firebase...');
        const result = await this.loginWithFirebase(email, password);
        return result;
      } catch (error) {
        console.warn('⚠️ Échec Firebase, tentative locale...', error);
        // Continuer vers authentification locale
      }
    }

    // Authentification locale
    console.log('💾 Authentification locale...');
    return this.loginLocally(email, password);
  }

  /**
   * Authentification Firebase
   */
  private async loginWithFirebase(email: string, password: string): Promise<AuthResponse> {
    try {
      const { getAuth, signInWithEmailAndPassword } = await import('firebase/auth');
      const { getFirestore, doc, getDoc } = await import('firebase/firestore');
      
      const auth = getAuth();
      const db = databaseService.getFirestore();

      // Connexion Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Récupérer les infos utilisateur depuis Firestore
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      
      if (!userDoc.exists()) {
        throw new Error('Utilisateur non trouvé dans Firestore');
      }

      const userData = userDoc.data();
      const user: User = {
        id: userCredential.user.uid,
        email: userData.email || email,
        nom: userData.nom || '',
        prenom: userData.prenom || ''
      };

      // Réinitialiser tentatives
      this.loginAttempts[email] = 0;
      
      // Sauvegarder l'utilisateur
      this.currentUser.value = user;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      
      console.log('✅ Connexion Firebase réussie');
      return { success: true, user };
      
    } catch (error: any) {
      console.error('❌ Erreur Firebase Auth:', error);
      
      // Gérer les erreurs Firebase spécifiques
      if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        this.loginAttempts[email] = (this.loginAttempts[email] || 0) + 1;
        
        if (this.loginAttempts[email] >= 3) {
          this.blockedUntil[email] = Date.now() + 5 * 60 * 1000;
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
      
      throw error; // Propager l'erreur pour fallback local
    }
  }

  /**
   * Authentification locale
   */
  private async loginLocally(email: string, password: string): Promise<AuthResponse> {
    // Vérifier identifiants
    if (DEFAULT_PASSWORDS[email] !== password) {
      this.loginAttempts[email] = (this.loginAttempts[email] || 0) + 1;
      
      if (this.loginAttempts[email] >= 3) {
        this.blockedUntil[email] = Date.now() + 5 * 60 * 1000;
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
    
    console.log('✅ Connexion locale réussie');
    return { success: true, user };
  }

  /**
   * Déconnexion
   */
  async logout(): Promise<void> {
    // Déconnexion Firebase si disponible
    if (databaseService.isFirebaseAvailable()) {
      try {
        const { getAuth, signOut } = await import('firebase/auth');
        const auth = getAuth();
        await signOut(auth);
        console.log('✅ Déconnexion Firebase');
      } catch (error) {
        console.warn('⚠️ Erreur déconnexion Firebase:', error);
      }
    }

    // Déconnexion locale
    this.currentUser.value = null;
    localStorage.removeItem(STORAGE_KEY);
    console.log('✅ Déconnexion locale');
  }

  /**
   * Inscription (local uniquement pour le moment)
   */
  async register(userData: Omit<User, 'id'>, password: string): Promise<AuthResponse> {
    // TODO: Implémenter inscription Firebase si disponible
    
    const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    
    if (users.find(u => u.email === userData.email)) {
      return { success: false, error: 'Email déjà utilisé' };
    }

    const newUser: User = {
      ...userData,
      id: Date.now().toString()
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    // Sauvegarder le mot de passe (en production, il faut hasher!)
    DEFAULT_PASSWORDS[userData.email] = password;

    return { success: true, user: newUser };
  }

  getCurrentUser() {
    return this.currentUser;
  }

  isAuthenticated() {
    return computed(() => !!this.currentUser.value);
  }
}

const authService = new HybridAuthService();

export const useAuth = () => ({
  currentUser: authService.getCurrentUser(),
  isAuthenticated: authService.isAuthenticated(),
  login: authService.login.bind(authService),
  logout: authService.logout.bind(authService),
  register: authService.register.bind(authService)
});

export default authService;
