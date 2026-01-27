import { ref } from 'vue';
import databaseService from './database.service';

export interface Signalement {
  id: string;
  userId: string;
  location: {
    lat: number;
    lng: number;
  };
  date: string;
  status: 'nouveau' | 'en_cours' | 'termine';
  surface: number;
  budget: number;
  entreprise: string;
  description?: string;
  syncStatus?: 'local' | 'synced' | 'pending';
}

const STORAGE_KEY = 'road_works_signalements';

// Données mockées pour Antananarivo
const MOCK_SIGNALEMENTS: Signalement[] = [
  {
    id: '1',
    userId: '1',
    location: { lat: -18.8792, lng: 47.5079 },
    date: new Date('2026-01-15').toISOString(),
    status: 'nouveau',
    surface: 120,
    budget: 5000000,
    entreprise: 'BTP Madagascar',
    description: 'Nid de poule avenue de l\'Indépendance'
  },
  {
    id: '2',
    userId: '2',
    location: { lat: -18.8850, lng: 47.5100 },
    date: new Date('2026-01-10').toISOString(),
    status: 'en_cours',
    surface: 250,
    budget: 12000000,
    entreprise: 'Routes Modernes SA',
    description: 'Réfection chaussée Route Digue'
  },
  {
    id: '3',
    userId: '1',
    location: { lat: -18.8700, lng: 47.5150 },
    date: new Date('2026-01-05').toISOString(),
    status: 'termine',
    surface: 80,
    budget: 3500000,
    entreprise: 'Travaux Publics Ltd',
    description: 'Réparation après inondation'
  },
  {
    id: '4',
    userId: '1',
    location: { lat: -18.8900, lng: 47.5200 },
    date: new Date('2026-01-18').toISOString(),
    status: 'nouveau',
    surface: 150,
    budget: 7000000,
    entreprise: 'Infrastructure Pro',
    description: 'Dégradation route Analakely'
  }
];

class HybridSignalementsService {
  private signalements = ref<Signalement[]>([]);
  private pendingSync = ref<string[]>([]); // IDs des signalements à synchroniser

  constructor() {
    this.initialize();
  }

  private async initialize() {
    // Charger d'abord les données locales
    this.loadFromLocalStorage();

    // Si Firebase est disponible, tenter de synchroniser
    if (databaseService.isFirebaseAvailable()) {
      await this.syncFromFirebase();
    }
  }

  /**
   * Charge les signalements depuis localStorage
   */
  private loadFromLocalStorage() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      this.signalements.value = JSON.parse(stored);
    } else {
      // Initialiser avec données mockées
      this.signalements.value = MOCK_SIGNALEMENTS.map(s => ({
        ...s,
        syncStatus: 'local'
      }));
      this.saveToLocalStorage();
    }
    console.log('💾 Signalements chargés depuis localStorage:', this.signalements.value.length);
  }

  /**
   * Sauvegarde dans localStorage
   */
  private saveToLocalStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.signalements.value));
  }

  /**
   * Synchronise depuis Firebase
   */
  async syncFromFirebase(): Promise<{ success: boolean; count?: number; error?: string }> {
    if (!databaseService.isFirebaseAvailable()) {
      return { 
        success: false, 
        error: 'Firebase non disponible' 
      };
    }

    try {
      console.log('🔄 Synchronisation depuis Firebase...');
      const { collection, getDocs } = await import('firebase/firestore');
      const db = databaseService.getFirestore();
      
      const querySnapshot = await getDocs(collection(db, 'signalements'));
      const firebaseData: Signalement[] = [];
      
      querySnapshot.forEach((doc) => {
        firebaseData.push({
          id: doc.id,
          ...doc.data(),
          syncStatus: 'synced'
        } as Signalement);
      });

      // Fusionner avec les données locales (prioriser Firebase pour les doublons)
      const localIds = new Set(this.signalements.value.map(s => s.id));
      const merged = [...this.signalements.value];

      firebaseData.forEach(fbSignalement => {
        const localIndex = merged.findIndex(s => s.id === fbSignalement.id);
        if (localIndex !== -1) {
          // Mettre à jour si existe
          merged[localIndex] = fbSignalement;
        } else {
          // Ajouter si nouveau
          merged.push(fbSignalement);
        }
      });

      this.signalements.value = merged;
      this.saveToLocalStorage();
      
      console.log('✅ Synchronisation depuis Firebase réussie:', firebaseData.length);
      return { success: true, count: firebaseData.length };
      
    } catch (error: any) {
      console.error('❌ Erreur sync Firebase:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  /**
   * Synchronise vers Firebase
   */
  async syncToFirebase(): Promise<{ success: boolean; count?: number; error?: string }> {
    if (!databaseService.isFirebaseAvailable()) {
      return { 
        success: false, 
        error: 'Firebase non disponible' 
      };
    }

    try {
      console.log('🔄 Synchronisation vers Firebase...');
      const { collection, doc, setDoc } = await import('firebase/firestore');
      const db = databaseService.getFirestore();
      
      // Récupérer les signalements non synchronisés
      const toSync = this.signalements.value.filter(
        s => s.syncStatus === 'local' || s.syncStatus === 'pending'
      );

      let syncCount = 0;
      for (const signalement of toSync) {
        const { syncStatus, ...data } = signalement; // Enlever syncStatus avant d'envoyer
        await setDoc(doc(db, 'signalements', signalement.id), data);
        
        // Marquer comme synchronisé
        const index = this.signalements.value.findIndex(s => s.id === signalement.id);
        if (index !== -1) {
          this.signalements.value[index].syncStatus = 'synced';
        }
        syncCount++;
      }

      this.saveToLocalStorage();
      console.log('✅ Synchronisation vers Firebase réussie:', syncCount);
      return { success: true, count: syncCount };
      
    } catch (error: any) {
      console.error('❌ Erreur sync Firebase:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  /**
   * Obtient tous les signalements (optionnellement filtrés par userId)
   */
  getAll(userId?: string): Signalement[] {
    if (userId) {
      return this.signalements.value.filter(s => s.userId === userId);
    }
    return this.signalements.value;
  }

  /**
   * Obtient un signalement par ID
   */
  getById(id: string): Signalement | undefined {
    return this.signalements.value.find(s => s.id === id);
  }

  /**
   * Crée un nouveau signalement
   */
  async create(data: Omit<Signalement, 'id' | 'syncStatus'>): Promise<Signalement> {
    const newSignalement: Signalement = {
      ...data,
      id: Date.now().toString(),
      syncStatus: 'pending' // Marquer comme en attente de sync
    };

    this.signalements.value.push(newSignalement);
    this.saveToLocalStorage();

    // Tenter de synchroniser immédiatement si Firebase est disponible
    if (databaseService.isFirebaseAvailable()) {
      try {
        const { collection, doc, setDoc } = await import('firebase/firestore');
        const db = databaseService.getFirestore();
        const { syncStatus, ...dataToSync } = newSignalement;
        
        await setDoc(doc(db, 'signalements', newSignalement.id), dataToSync);
        
        // Marquer comme synchronisé
        const index = this.signalements.value.findIndex(s => s.id === newSignalement.id);
        if (index !== -1) {
          this.signalements.value[index].syncStatus = 'synced';
          this.saveToLocalStorage();
        }
        
        console.log('✅ Signalement créé et synchronisé avec Firebase');
      } catch (error) {
        console.warn('⚠️ Signalement créé localement, sync Firebase échoué:', error);
      }
    } else {
      console.log('💾 Signalement créé localement (Firebase non disponible)');
    }

    return newSignalement;
  }

  /**
   * Met à jour un signalement
   */
  async update(id: string, updates: Partial<Signalement>): Promise<boolean> {
    const index = this.signalements.value.findIndex(s => s.id === id);
    if (index === -1) return false;

    this.signalements.value[index] = {
      ...this.signalements.value[index],
      ...updates,
      syncStatus: 'pending' // Marquer comme en attente de sync
    };
    this.saveToLocalStorage();

    // Tenter de synchroniser si Firebase est disponible
    if (databaseService.isFirebaseAvailable()) {
      try {
        const { doc, updateDoc } = await import('firebase/firestore');
        const db = databaseService.getFirestore();
        const { syncStatus, ...dataToSync } = this.signalements.value[index];
        
        await updateDoc(doc(db, 'signalements', id), dataToSync);
        
        this.signalements.value[index].syncStatus = 'synced';
        this.saveToLocalStorage();
        
        console.log('✅ Signalement mis à jour et synchronisé');
      } catch (error) {
        console.warn('⚠️ Mise à jour locale, sync Firebase échoué:', error);
      }
    }

    return true;
  }

  /**
   * Supprime un signalement
   */
  async delete(id: string): Promise<boolean> {
    const index = this.signalements.value.findIndex(s => s.id === id);
    if (index === -1) return false;

    // Supprimer de Firebase si disponible
    if (databaseService.isFirebaseAvailable()) {
      try {
        const { doc, deleteDoc } = await import('firebase/firestore');
        const db = databaseService.getFirestore();
        await deleteDoc(doc(db, 'signalements', id));
        console.log('✅ Signalement supprimé de Firebase');
      } catch (error) {
        console.warn('⚠️ Erreur suppression Firebase:', error);
      }
    }

    // Supprimer localement
    this.signalements.value.splice(index, 1);
    this.saveToLocalStorage();

    return true;
  }

  /**
   * Obtient les statistiques
   */
  getStats() {
    const all = this.signalements.value;
    const synced = all.filter(s => s.syncStatus === 'synced').length;
    const pending = all.filter(s => s.syncStatus === 'pending' || s.syncStatus === 'local').length;
    
    return {
      total: all.length,
      nouveau: all.filter(s => s.status === 'nouveau').length,
      en_cours: all.filter(s => s.status === 'en_cours').length,
      termine: all.filter(s => s.status === 'termine').length,
      totalSurface: all.reduce((sum, s) => sum + s.surface, 0),
      totalBudget: all.reduce((sum, s) => sum + s.budget, 0),
      avancement: all.length > 0 
        ? Math.round((all.filter(s => s.status === 'termine').length / all.length) * 100)
        : 0,
      syncStatus: {
        synced,
        pending,
        isFirebaseAvailable: databaseService.isFirebaseAvailable()
      }
    };
  }

  /**
   * Obtient les signalements en attente de synchronisation
   */
  getPendingSync(): Signalement[] {
    return this.signalements.value.filter(
      s => s.syncStatus === 'pending' || s.syncStatus === 'local'
    );
  }
}

export default new HybridSignalementsService();
