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
import photoSignalementService from './photo-signalement.service';
import type { Signalement } from '@/types/signalement';
import type { PhotoSignalement } from '@/types/photo-signalement';

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
    // Le chargement sera fait explicitement par les pages
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

      // Si Firebase est vide, utiliser des données mockées pour le développement
      if (data.length === 0) {
        console.log('⚠️ Firebase vide, chargement des données mockées...');
        this.signalements.value = this.getMockSignalements();
        console.log(`✅ ${this.signalements.value.length} signalements mockés chargés`);
      } else {
        this.signalements.value = data;
        console.log(`✅ ${data.length} signalements chargés depuis Firebase`);
      }
    } catch (err: any) {
      console.error('❌ Erreur chargement signalements:', err);
      console.log('⚠️ Chargement des données mockées en fallback...');
      this.signalements.value = this.getMockSignalements();
      this.error.value = 'Firebase non disponible, utilisation des données mockées';
    } finally {
      this.loading.value = false;
    }
  }

  /**
   * Retourne des données mockées pour le développement
   */
  private getMockSignalements(): Signalement[] {
    return [
      {
        id: '1',
        userId: '1',
        location: { lat: -18.8792, lng: 47.5079 },
        date: new Date('2026-01-15').toISOString(),
        status: 'nouveau',
        surface: 120,
        budget: 5000000,
        entreprise: 'BTP Madagascar',
        description: 'Nid de poule avenue de l\'Indépendance',
        titre: 'Réparation avenue Indépendance',
        priorite: 'haute',
        dateDebut: new Date('2026-01-20').toISOString(),
        photos: [
          'https://picsum.photos/seed/road1/400/400',
          'https://picsum.photos/seed/road2/400/400',
          'https://picsum.photos/seed/road3/400/400',
        ]
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
        description: 'Réfection chaussée Route Digue',
        titre: 'Réfection Route Digue',
        priorite: 'moyenne',
        dateDebut: new Date('2026-01-12').toISOString(),
        dateFin: new Date('2026-02-15').toISOString(),
        photos: [
          'https://picsum.photos/seed/repair1/400/400',
          'https://picsum.photos/seed/repair2/400/400',
          'https://picsum.photos/seed/repair3/400/400',
        ]
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
        description: 'Réparation après inondation',
        titre: 'Réparation post-inondation',
        priorite: 'haute',
        dateDebut: new Date('2026-01-06').toISOString(),
        dateFin: new Date('2026-01-25').toISOString(),
        photos: [
          'https://picsum.photos/seed/pothole1/400/400',
          'https://picsum.photos/seed/pothole2/400/400',
        ]
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
        description: 'Dégradation route Analakely',
        titre: 'Route Analakely dégradée',
        priorite: 'moyenne',
        photos: [
          'https://picsum.photos/seed/road1/400/400',
        ]
      },
      {
        id: '5',
        userId: '2',
        location: { lat: -18.8920, lng: 47.5250 },
        date: new Date('2026-01-20').toISOString(),
        status: 'en_cours',
        surface: 180,
        budget: 8500000,
        entreprise: 'BTP Madagascar',
        description: 'Trottoir endommagé devant le marché',
        titre: 'Trottoir marché Petite Vitesse',
        priorite: 'basse',
        dateDebut: new Date('2026-01-22').toISOString(),
        photos: [
          'https://picsum.photos/seed/pothole1/400/400',
          'https://picsum.photos/seed/pothole2/400/400',
        ]
      },
      {
        id: '6',
        userId: '1',
        location: { lat: -18.8750, lng: 47.5280 },
        date: new Date('2026-01-22').toISOString(),
        status: 'nouveau',
        surface: 95,
        budget: 4200000,
        entreprise: '',
        description: 'Affaissement de chaussée suite aux pluies',
        titre: 'Affaissement chaussée',
        priorite: 'haute',
        photos: [
          'https://picsum.photos/seed/repair1/400/400',
          'https://picsum.photos/seed/repair2/400/400',
        ]
      },
      {
        id: '7',
        userId: '1',
        location: { lat: -18.8820, lng: 47.5120 },
        date: new Date('2026-01-08').toISOString(),
        status: 'termine',
        surface: 200,
        budget: 9500000,
        entreprise: 'Routes Modernes SA',
        description: 'Rénovation complète intersection',
        titre: 'Rénovation carrefour principal',
        priorite: 'haute',
        dateDebut: new Date('2026-01-09').toISOString(),
        dateFin: new Date('2026-01-26').toISOString(),
        photos: [
          'https://picsum.photos/seed/road1/400/400',
        ]
      },
      {
        id: '8',
        userId: '2',
        location: { lat: -18.8780, lng: 47.5180 },
        date: new Date('2026-01-25').toISOString(),
        status: 'annule',
        surface: 60,
        budget: 2500000,
        entreprise: 'Infrastructure Pro',
        description: 'Travaux annulés suite changement de priorité',
        titre: 'Réparation mineure (annulée)',
        priorite: 'basse',
        photos: [
          'https://picsum.photos/seed/pothole2/400/400',
        ]
      }
    ];
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
      console.log('📊 Données reçues:', data);

      const db = firebaseService.db;

      // Générer un ID numérique basé sur le timestamp
      const newId = Date.now();
      const docId = String(newId);
      const docRef = doc(db, this.COLLECTION_NAME, docId);

      // Préparer les données selon la structure Firebase Java
      const firebaseData = this.convertSignalementToFirebase(data);
      firebaseData.id = newId; // ID numérique dans le document
      firebaseData.createdAt = Timestamp.now();
      firebaseData.updatedAt = Timestamp.now();
      firebaseData.syncedAt = Timestamp.now();

      console.log('📤 Données Firebase à envoyer:', firebaseData);
      console.log('🔑 Document ID:', docId);
      console.log('👤 User ID:', firebaseData.userId, 'Type:', typeof firebaseData.userId);

      // Sauvegarder dans Firebase
      await setDoc(docRef, firebaseData);

      // Créer l'objet signalement
      const newSignalement: Signalement = {
        ...data,
        id: docId
      };

      // Ajouter au cache local
      this.signalements.value.push(newSignalement);

      console.log('✅ Signalement créé:', docId);
      return newSignalement;
    } catch (err: any) {
      console.error('❌ Erreur création signalement:', err);
      console.error('❌ Code erreur:', err.code);
      console.error('❌ Message:', err.message);
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
        updateData.statusCode = this.statusToFirebaseCode(updates.status);
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
        q = query(q, where('userId', '==', Number(filters.userId) || filters.userId));
      }
      if (filters.status) {
        // Convertir le status en code Firebase
        const firebaseStatusCode = this.statusToFirebaseCode(filters.status);
        q = query(q, where('statusCode', '==', firebaseStatusCode));
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
  private convertFirebaseToSignalement ( id : string, data : any): Signalement | null {
    try {
      // Gérer les différents formats d'ID (string ou number)
      const signalementId = data.id ? String(data.id) : id;

      // Gérer les différents formats de userId (string ou number)
      const userId = data.userId ? String(data.userId) : '';

      const signalement: Signalement = {
        id: signalementId,
        userId: userId,
        location: {
          lat: data.latitude || 0,
          lng: data.longitude || 0
        },
        date: data.dateSignalement?.toDate?.()?.toISOString() || data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        status: this.normalizeStatus(data.statusCode || 'nouveau'),
        surface: data.surface || 0,
        budget: data.budget || 0,
        entreprise: data.entreprise || '',
        description: data.description || '',
        titre: data.titre || this.generateTitleFromDescription(data.description),
        adresse: data.adresse || '',
        photoUrl: data.photoUrl || '',
        photos: data.photos || (data.photoUrl ? [data.photoUrl] : []),
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
   * Normalise les codes de status Firebase vers les codes de l'app
   */
  private normalizeStatus(statusCode: string): 'nouveau' | 'en_cours' | 'termine' | 'annule' {
    const normalized = statusCode.toLowerCase().replace(/_/g, '_');

    const statusMap: { [key: string]: 'nouveau' | 'en_cours' | 'termine' | 'annule' } = {
      'nouveau': 'nouveau',
      'en_cours': 'en_cours',
      'en cours': 'en_cours',
      'encours': 'en_cours',
      'termine': 'termine',
      'terminé': 'termine',
      'annule': 'annule',
      'annulé': 'annule'
    };

    return statusMap[normalized] || 'nouveau';
  }

  /**
   * Génère un titre à partir de la description si absent
   */
  private generateTitleFromDescription(description?: string): string {
    if (!description) return 'Signalement';

    // Prendre les 50 premiers caractères de la description
    const shortDesc = description.substring(0, 50);
    return shortDesc.length < description.length ? shortDesc + '...' : shortDesc;
  }

  /**
   * Convertit un objet Signalement en données Firebase
   * Structure minimale conforme à Firebase
   */
  private convertSignalementToFirebase(signalement: Omit<Signalement, 'id'>): any {
    // Convertir le status vers le format Firebase (MAJUSCULES)
    const statusCode = this.statusToFirebaseCode(signalement.status);

    return {
      // Champs obligatoires de la structure Firebase
      userId: Number(signalement.userId) || signalement.userId,
      userEmail: signalement.userEmail || '',
      description: signalement.description || '',
      adresse: signalement.adresse || '',
      latitude: signalement.location.lat,
      longitude: signalement.location.lng,
      photoUrl: signalement.photoUrl || '',
      statusCode: statusCode,
      statusLibelle: this.getStatusLibelle(signalement.status),
      dateSignalement: signalement.date ? Timestamp.fromDate(new Date(signalement.date)) : Timestamp.now()
    };
  }

  /**
   * Convertit le status de l'app vers le code Firebase (MAJUSCULES avec underscore)
   */
  private statusToFirebaseCode(status: string): string {
    const codeMap: { [key: string]: string } = {
      'nouveau': 'NOUVEAU',
      'en_cours': 'EN_COURS',
      'termine': 'TERMINE',
      'annule': 'ANNULE'
    };

    return codeMap[status] || 'NOUVEAU';
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

  // ===============================================
  // GESTION DES PHOTOS (Collection photo_signalement)
  // ===============================================

  /**
   * Charge les photos d'un signalement depuis la collection photo_signalement
   */
  async loadPhotosForSignalement(signalementId: string): Promise<string[]> {
    try {
      const photos = await photoSignalementService.loadPhotosForSignalement(signalementId);
      return photos.map(p => p.url);
    } catch (err: any) {
      console.error('❌ Erreur chargement photos:', err);
      return [];
    }
  }

  /**
   * Ajoute une photo à un signalement
   * Upload vers Cloudinary puis sauvegarde dans photo_signalement
   */
  async addPhotoToSignalement(
    signalementId: string,
    file: File | Blob | string,
    legende?: string
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    const result = await photoSignalementService.addPhoto(signalementId, file, legende);

    if (result.success && result.photo) {
      // Mettre à jour le cache local du signalement
      const signalement = this.signalements.value.find(s => s.id === signalementId);
      if (signalement) {
        if (!signalement.photos) {
          signalement.photos = [];
        }
        signalement.photos.push(result.photo.url);
      }

      return { success: true, url: result.photo.url };
    }

    return { success: false, error: result.error };
  }

  /**
   * Ajoute plusieurs photos à un signalement
   */
  async addPhotosToSignalement(
    signalementId: string,
    files: (File | Blob | string)[]
  ): Promise<{ success: boolean; urls: string[]; errors: string[] }> {
    const results = await photoSignalementService.addMultiplePhotos(signalementId, files);

    const urls: string[] = [];
    const errors: string[] = [];

    for (const result of results) {
      if (result.success && result.photo) {
        urls.push(result.photo.url);
      } else if (result.error) {
        errors.push(result.error);
      }
    }

    // Mettre à jour le cache local
    const signalement = this.signalements.value.find(s => s.id === signalementId);
    if (signalement) {
      if (!signalement.photos) {
        signalement.photos = [];
      }
      signalement.photos.push(...urls);
    }

    return { success: errors.length === 0, urls, errors };
  }

  /**
   * Supprime une photo d'un signalement
   */
  async deletePhotoFromSignalement(signalementId: string, photoId: string): Promise<boolean> {
    const success = await photoSignalementService.deletePhoto(photoId);

    if (success) {
      // Recharger les photos pour le cache
      await this.loadPhotosForSignalement(signalementId);
    }

    return success;
  }

  /**
   * Obtient toutes les photos d'un signalement avec leurs métadonnées
   */
  async getPhotosWithMetadata(signalementId: string): Promise<PhotoSignalement[]> {
    return await photoSignalementService.loadPhotosForSignalement(signalementId);
  }

  /**
   * Crée un signalement avec photos
   * Upload les photos vers Cloudinary puis crée le signalement
   */
  async createWithPhotos(
    data: Omit<Signalement, 'id'>,
    photoFiles: (File | Blob | string)[]
  ): Promise<{ signalement: Signalement; photoUrls: string[]; errors: string[] }> {
    // 1. Créer le signalement d'abord
    const signalement = await this.create(data);

    // 2. Uploader les photos
    const photoResults = await this.addPhotosToSignalement(signalement.id, photoFiles);

    // 3. Mettre à jour le signalement avec les URLs des photos
    signalement.photos = photoResults.urls;

    return {
      signalement,
      photoUrls: photoResults.urls,
      errors: photoResults.errors
    };
  }

  /**
   * Accès au service photo pour des opérations avancées
   */
  getPhotoService() {
    return photoSignalementService;
  }
}

export default new FirebaseSignalementsService();




