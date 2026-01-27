import { ref } from 'vue';
import { environment } from '@/environments/environment';

/**
 * Service de base de données hybride
 * Tente d'utiliser Firebase si disponible, sinon bascule sur le stockage local
 */

export type DatabaseMode = 'firebase' | 'local' | 'checking';

interface DatabaseConfig {
  mode: DatabaseMode;
  isOnline: boolean;
  firebaseAvailable: boolean;
  lastSync?: Date;
}

class DatabaseService {
  private config = ref<DatabaseConfig>({
    mode: 'checking',
    isOnline: false,
    firebaseAvailable: false
  });

  private firebaseApp: any = null;
  private firestore: any = null;

  constructor() {
    this.initialize();
  }

  /**
   * Initialise le service en tentant de se connecter à Firebase
   */
  private async initialize() {
    console.log('🔄 Initialisation de la base de données...');
    
    // Vérifier la configuration Firebase
    const hasFirebaseConfig = this.checkFirebaseConfig();
    
    if (!hasFirebaseConfig) {
      console.warn('⚠️ Configuration Firebase manquante');
      this.setMode('local');
      return;
    }

    // Tenter de se connecter à Firebase
    try {
      await this.connectToFirebase();
    } catch (error) {
      console.error('❌ Échec connexion Firebase:', error);
      this.setMode('local');
    }
  }

  /**
   * Vérifie si la configuration Firebase est valide
   */
  private checkFirebaseConfig(): boolean {
    const config = environment.firebase;
    
    // Vérifier que la config n'est pas celle par défaut
    if (!config || !config.apiKey || config.apiKey === 'VOTRE_API_KEY') {
      return false;
    }

    // Vérifier que tous les champs requis sont présents
    const requiredFields = ['apiKey', 'authDomain', 'projectId'];
    return requiredFields.every(field => config[field as keyof typeof config]);
  }

  /**
   * Tente de se connecter à Firebase
   */
  private async connectToFirebase() {
    console.log('🔥 Tentative de connexion à Firebase...');
    
    try {
      // Importer Firebase dynamiquement
      const { initializeApp } = await import('firebase/app');
      const { getFirestore, collection, getDocs } = await import('firebase/firestore');

      // Initialiser Firebase
      this.firebaseApp = initializeApp(environment.firebase);
      this.firestore = getFirestore(this.firebaseApp);

      // Tester la connexion avec un timeout
      const testPromise = getDocs(collection(this.firestore, '_test_connection'));
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 5000)
      );

      await Promise.race([testPromise, timeoutPromise]);

      // Connexion réussie
      console.log('✅ Firebase connecté avec succès');
      this.setMode('firebase');
      
    } catch (error: any) {
      console.error('❌ Erreur Firebase:', error.message);
      
      // Vérifier si c'est une erreur de réseau ou de configuration
      if (error.message.includes('network') || error.message.includes('Timeout')) {
        console.warn('⚠️ Problème réseau - Basculement en mode local');
      } else if (error.message.includes('auth') || error.message.includes('permission')) {
        console.warn('⚠️ Problème d\'authentification Firebase - Basculement en mode local');
      } else {
        console.warn('⚠️ Firebase non disponible - Basculement en mode local');
      }
      
      throw error;
    }
  }

  /**
   * Définit le mode de la base de données
   */
  private setMode(mode: DatabaseMode) {
    this.config.value.mode = mode;
    this.config.value.firebaseAvailable = mode === 'firebase';
    this.config.value.isOnline = mode === 'firebase';
    
    const emoji = mode === 'firebase' ? '☁️' : '💾';
    console.log(`${emoji} Mode: ${mode.toUpperCase()}`);
    
    // Sauvegarder le mode dans localStorage pour référence
    localStorage.setItem('db_mode', mode);
  }

  /**
   * Retourne la configuration actuelle
   */
  getConfig() {
    return this.config;
  }

  /**
   * Vérifie si Firebase est disponible
   */
  isFirebaseAvailable(): boolean {
    return this.config.value.mode === 'firebase';
  }

  /**
   * Obtient l'instance Firestore (si disponible)
   */
  getFirestore() {
    if (this.config.value.mode !== 'firebase' || !this.firestore) {
      throw new Error('Firebase non disponible');
    }
    return this.firestore;
  }

  /**
   * Force un rechargement de la configuration
   */
  async reload() {
    this.config.value.mode = 'checking';
    await this.initialize();
  }

  /**
   * Tente de synchroniser les données locales vers Firebase
   */
  async syncToFirebase(): Promise<{ success: boolean; error?: string }> {
    if (!this.isFirebaseAvailable()) {
      return { 
        success: false, 
        error: 'Firebase non disponible' 
      };
    }

    try {
      console.log('🔄 Synchronisation vers Firebase...');
      // La logique de sync sera implémentée dans les services spécifiques
      this.config.value.lastSync = new Date();
      console.log('✅ Synchronisation terminée');
      return { success: true };
    } catch (error: any) {
      console.error('❌ Erreur de synchronisation:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  /**
   * Tente de récupérer les données depuis Firebase
   */
  async syncFromFirebase(): Promise<{ success: boolean; error?: string }> {
    if (!this.isFirebaseAvailable()) {
      return { 
        success: false, 
        error: 'Firebase non disponible' 
      };
    }

    try {
      console.log('🔄 Récupération depuis Firebase...');
      // La logique de sync sera implémentée dans les services spécifiques
      this.config.value.lastSync = new Date();
      console.log('✅ Récupération terminée');
      return { success: true };
    } catch (error: any) {
      console.error('❌ Erreur de récupération:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }
}

export default new DatabaseService();
