import { ref } from 'vue';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp
} from 'firebase/firestore';
import firebaseService from './firebase.service';
import type { Signalement } from '@/types/signalement';

/**
 * Service de gestion des signalements avec Firebase
 * Structure conforme au service Java Spring Boot
 */
class FirebaseSignalementsService {
  private signalements = ref<Signalement[]>([]);
  private loading = ref(false);
  private error = ref<string | null>(null);
  private readonly COLLECTION_NAME = 'signalements';

  constructor() {
    // Charger les signalements au démarrage
    this.loadSignalements();
  }

  /**
   * Charge tous les signalements depuis Firebase
   */
  async loadSignalements(): Promise<void> {
    this.loading.value = true;
    this.error.value = null;

    try {
      console.log('📥 Chargement des signalements depuis Firebase...');
      const db = firebaseService.db;
      const signalementsCol = collection(db, this.COLLECTION_NAME);
      const snapshot = await getDocs(signalementsCol);

      const data: Signalement[] = [];
      snapshot.forEach((doc) => {
        const signalement = this.convertFirebaseToSignalement(doc.id, doc.data());
        if (signalement) {
          data.push(signalement);
        }
      });

      this.signalements.value = data;
      console.log(`✅ ${data.length} signalements chargés depuis Firebase`);
    } catch (err: any) {
      console.error('❌ Erreur chargement signalements:', err);
      this.error.value = 'Impossible de charger les signalements';
      throw err;
    } finally {
      this.loading.value = false;
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
  async getById(id: string): Promise<Signalement | null> {
    // Chercher d'abord dans le cache
    const cached = this.signalements.value.find(s => s.id === id);
    if (cached) {
      return cached;
    }

    // Sinon charger depuis Firebase
    try {
      const db = firebaseService.db;
      const docRef = doc(db, this.COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return this.convertFirebaseToSignalement(docSnap.id, docSnap.data());
      }
      return null;
    } catch (err: any) {
      console.error('❌ Erreur récupération signalement:', err);
      return null;
    }
  }

  /**
   * Crée un nouveau signalement
   */
  async create(data: Omit<Signalement, 'id'>): Promise<Signalement> {
    try {
      console.log('📤 Création signalement dans Firebase...');
      const db = firebaseService.db;

      // Générer un ID unique
      const newId = Date.now().toString();
      const docRef = doc(db, this.COLLECTION_NAME, newId);

      // Préparer les données selon la structure Firebase Java
      const firebaseData = this.convertSignalementToFirebase(data);
      firebaseData.id = newId;
      firebaseData.createdAt = Timestamp.now();
      firebaseData.updatedAt = Timestamp.now();
      firebaseData.syncedAt = Timestamp.now();

      // Sauvegarder dans Firebase
      await setDoc(docRef, firebaseData);

      // Créer l'objet signalement
      const newSignalement: Signalement = {
        ...data,
        id: newId
      };

      // Ajouter au cache local
      this.signalements.value.push(newSignalement);

      console.log('✅ Signalement créé:', newId);
      return newSignalement;
    } catch (err: any) {
      console.error('❌ Erreur création signalement:', err);
      throw new Error('Impossible de créer le signalement');
    }
  }

  /**
   * Met à jour un signalement
   */
  async update(id: string, updates: Partial<Signalement>): Promise<boolean> {
    try {
      console.log('📤 Mise à jour signalement:', id);
      const db = firebaseService.db;
      const docRef = doc(db, this.COLLECTION_NAME, id);

      // Préparer les données de mise à jour
      const updateData: any = {};

      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.adresse !== undefined) updateData.adresse = updates.adresse;
      if (updates.location !== undefined) {
        updateData.latitude = updates.location.lat;
        updateData.longitude = updates.location.lng;
      }
      if (updates.status !== undefined) {
        updateData.statusCode = updates.status;
        updateData.statusLibelle = this.getStatusLibelle(updates.status);
      }
      if (updates.surface !== undefined) updateData.surface = updates.surface;
      if (updates.budget !== undefined) updateData.budget = updates.budget;
      if (updates.entreprise !== undefined) updateData.entreprise = updates.entreprise;
      if (updates.photoUrl !== undefined) updateData.photoUrl = updates.photoUrl;
      if (updates.titre !== undefined) updateData.titre = updates.titre;
      if (updates.priorite !== undefined) updateData.priorite = updates.priorite;
      if (updates.dateDebut !== undefined) updateData.dateDebut = updates.dateDebut;
      if (updates.dateFin !== undefined) updateData.dateFin = updates.dateFin;

      updateData.updatedAt = Timestamp.now();
      updateData.syncedAt = Timestamp.now();

      await updateDoc(docRef, updateData);

      // Mettre à jour le cache local
      const index = this.signalements.value.findIndex(s => s.id === id);
      if (index !== -1) {
        this.signalements.value[index] = {
          ...this.signalements.value[index],
          ...updates
        };
      }

      console.log('✅ Signalement mis à jour:', id);
      return true;
    } catch (err: any) {
      console.error('❌ Erreur mise à jour signalement:', err);
      return false;
    }
  }

  /**
   * Supprime un signalement
   */
  async delete(id: string): Promise<boolean> {
    try {
      console.log('🗑️ Suppression signalement:', id);
      const db = firebaseService.db;
      const docRef = doc(db, this.COLLECTION_NAME, id);

      await deleteDoc(docRef);

      // Supprimer du cache local
      const index = this.signalements.value.findIndex(s => s.id === id);
      if (index !== -1) {
        this.signalements.value.splice(index, 1);
      }

      console.log('✅ Signalement supprimé:', id);
      return true;
    } catch (err: any) {
      console.error('❌ Erreur suppression signalement:', err);
      return false;
    }
  }

  /**
   * Obtient les statistiques des signalements
   */
  getStats() {
    const all = this.signalements.value;

    return {
      total: all.length,
      nouveau: all.filter(s => s.status === 'nouveau').length,
      en_cours: all.filter(s => s.status === 'en_cours').length,
      termine: all.filter(s => s.status === 'termine').length,
      annule: all.filter(s => s.status === 'annule').length,
      totalSurface: all.reduce((sum, s) => sum + (s.surface || 0), 0),
      totalBudget: all.reduce((sum, s) => sum + (s.budget || 0), 0),
      avancement: all.length > 0
        ? Math.round((all.filter(s => s.status === 'termine').length / all.length) * 100)
        : 0
    };
  }

  /**
   * Recherche des signalements
   */
  async search(filters: {
    userId?: string;
    status?: string;
    dateDebut?: Date;
    dateFin?: Date;
  }): Promise<Signalement[]> {
    try {
      const db = firebaseService.db;
      let q = query(collection(db, this.COLLECTION_NAME));

      if (filters.userId) {
        q = query(q, where('userId', '==', filters.userId));
      }
      if (filters.status) {
        q = query(q, where('statusCode', '==', filters.status));
      }

      const snapshot = await getDocs(q);
      const results: Signalement[] = [];

      snapshot.forEach((doc) => {
        const signalement = this.convertFirebaseToSignalement(doc.id, doc.data());
        if (signalement) {
          results.push(signalement);
        }
      });

      return results;
    } catch (err: any) {
      console.error('❌ Erreur recherche signalements:', err);
      return [];
    }
  }

  /**
   * Convertit un document Firebase en objet Signalement
   */
  private convertFirebaseToSignalement(id: string, data: any): Signalement | null {
    try {
      const signalement: Signalement = {
        id: id,
        userId: data.userId || '',
        location: {
          lat: data.latitude || 0,
          lng: data.longitude || 0
        },
        date: data.dateSignalement?.toDate?.()?.toISOString() || data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        status: data.statusCode || 'nouveau',
        surface: data.surface || 0,
        budget: data.budget || 0,
        entreprise: data.entreprise || '',
        description: data.description || '',
        titre: data.titre || '',
        adresse: data.adresse || '',
        photoUrl: data.photoUrl || '',
        photos: data.photos || [],
        priorite: data.priorite || 'moyenne',
        dateDebut: data.dateDebut || undefined,
        dateFin: data.dateFin || undefined,
        userEmail: data.userEmail || undefined
      };
      return signalement;
    } catch (err) {
      console.error('❌ Erreur conversion document Firebase:', err);
      return null;
    }
  }

  /**
   * Convertit un objet Signalement en données Firebase
   */
  private convertSignalementToFirebase(signalement: Omit<Signalement, 'id'>): any {
    return {
      userId: signalement.userId,
      description: signalement.description || '',
      adresse: signalement.adresse || '',
      latitude: signalement.location.lat,
      longitude: signalement.location.lng,
      photoUrl: signalement.photoUrl || '',
      photos: signalement.photos || [],
      statusCode: signalement.status,
      statusLibelle: this.getStatusLibelle(signalement.status),
      userEmail: signalement.userEmail || '',
      dateSignalement: signalement.date ? Timestamp.fromDate(new Date(signalement.date)) : Timestamp.now(),
      surface: signalement.surface || 0,
      budget: signalement.budget || 0,
      entreprise: signalement.entreprise || '',
      titre: signalement.titre || '',
      priorite: signalement.priorite || 'moyenne',
      dateDebut: signalement.dateDebut || null,
      dateFin: signalement.dateFin || null
    };
  }

  /**
   * Obtient le libellé d'un statut
   */
  private getStatusLibelle(status: string): string {
    const libelles: { [key: string]: string } = {
      'nouveau': 'Nouveau',
      'en_cours': 'En cours',
      'termine': 'Terminé',
      'annule': 'Annulé'
    };
    return libelles[status] || status;
  }

  /**
   * Getters pour les refs réactifs
   */
  getSignalements() {
    return this.signalements;
  }

  isLoading() {
    return this.loading;
  }

  getError() {
    return this.error;
  }
}

export default new FirebaseSignalementsService();




