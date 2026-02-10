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
  private readonly HISTORIQUE_STATUS_COLLECTION = 'historique_status';

  // Constantes pour les statuts
  private readonly STATUS_NOUVEAU_ID = 1;
  private readonly STATUS_EN_COURS_ID = 2;
  private readonly STATUS_TERMINE_ID = 3;

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
        console.log(`✅ ${this.signalements.value.length} signalements mockés chargés`);
      } else {
        this.signalements.value = data;
        console.log(`✅ ${data.length} signalements chargés depuis Firebase`);
      }
    } catch (err: any) {
      console.error('❌ Erreur chargement signalements:', err);
      console.log('⚠️ Chargement des données mockées en fallback...');
      this.error.value = 'Firebase non disponible, utilisation des données mockées';
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
      console.log("Historique de statut initial en cours de création pour le signalement ID:", newId);
      // Créer l'historique de statut initial
      await this.createInitialHistoriqueStatus(newId, data.userId, data.adresse);
      console.log("---------------------------------------");

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
   * Crée l'historique de statut initial pour un nouveau signalement
   * @param signalementId ID du signalement
   * @param userId ID de l'utilisateur qui a créé le signalement
   * @param adresse Adresse du signalement (optionnel)
   */
  private async createInitialHistoriqueStatus(
    signalementId: number,
    userId: string | undefined,
    adresse: string | undefined
  ): Promise<void> {
    try {
      console.log('📤 Création historique de statut initial...');

      const db = firebaseService.db;

      // Générer un ID pour l'historique
      const historiqueId = Date.now();
      const docId = String(historiqueId);
      const docRef = doc(db, this.HISTORIQUE_STATUS_COLLECTION, docId);

      // Construire le commentaire avec l'adresse
      const commentaire = `Création de nouveau signalement à ${adresse && adresse.trim() !== '' ? adresse : 'emplacement non spécifié'}`;

      // Données de l'historique de statut
      const historiqueData = {
        id: historiqueId,
        signalementId: signalementId,
        ancienStatusId: this.STATUS_NOUVEAU_ID,
        nouveauStatusId: this.STATUS_NOUVEAU_ID,
        modifiedBy: userId ? Number(userId) : null,
        userId: userId || null,  // Requis par les règles Firestore
        commentaire: commentaire,
        metadata: null,
        changedAt: Timestamp.now()
      };

      await setDoc(docRef, historiqueData);

      console.log('✅ Historique de statut initial créé:', docId);
    } catch (err: any) {
      console.error('❌ Erreur création historique de statut:', err);
      // On ne propage pas l'erreur pour ne pas bloquer la création du signalement
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
   */
  private convertSignalementToFirebase(signalement: Omit<Signalement, 'id'>): any {
    // Convertir le status vers le format Firebase (MAJUSCULES)
    const statusCode = this.statusToFirebaseCode(signalement.status);

    return {
      // Champs EXACTS du backend Java
      description: signalement.description || '',
      adresse: signalement.adresse || '',
      latitude: signalement.location.lat,
      longitude: signalement.location.lng,
      statusCode: statusCode,
      statusLibelle: this.getStatusLibelle(signalement.status),
      userEmail: signalement.userEmail || '',
      userId: Number(signalement.userId) || signalement.userId,
      dateSignalement: signalement.date ? Timestamp.fromDate(new Date(signalement.date)) : Timestamp.now(),
      surface: signalement.surface || 0,
      budget: signalement.budget || 0,
      entrepriseId: signalement.entreprise ? String(signalement.entreprise) : null
      // createdAt, updatedAt, syncedAt seront ajoutés dans la méthode create()
      // photoUrl SUPPRIMÉ (n'est plus dans le backend Java)
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




