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
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import firebaseService from './firebase.service';
import cloudinaryService from './cloudinary.service';
import type { PhotoSignalement, PhotoUploadResult } from '@/types/photo-signalement';

/**
 * Service de gestion des photos de signalements avec Firebase
 * Collection: photo_signalement
 * Relation: Un signalement peut avoir plusieurs photos
 */
class PhotoSignalementService {
  private photos = ref<PhotoSignalement[]>([]);
  private loading = ref(false);
  private error = ref<string | null>(null);
  private readonly COLLECTION_NAME = 'photo_signalement';

  /**
   * Charge toutes les photos d'un signalement
   */
  async loadPhotosForSignalement(signalementId: string): Promise<PhotoSignalement[]> {
    this.loading.value = true;
    this.error.value = null;

    try {
      console.log('📥 Chargement des photos pour le signalement:', signalementId);
      const db = firebaseService.db;
      const photosCol = collection(db, this.COLLECTION_NAME);

      // Query simple sans orderBy pour éviter le besoin d'index composite
      const q = query(
        photosCol,
        where('signalementId', '==', signalementId)
      );

      const snapshot = await getDocs(q);
      const data: PhotoSignalement[] = [];

      snapshot.forEach((docSnap) => {
        const photo = this.convertFirebaseToPhoto(docSnap.id, docSnap.data());
        if (photo) {
          data.push(photo);
        }
      });

      // Trier côté client par ordre
      data.sort((a, b) => a.ordre - b.ordre);

      this.photos.value = data;
      console.log(`✅ ${data.length} photos chargées pour le signalement ${signalementId}`);
      return data;

    } catch (err: any) {
      console.error('❌ Erreur chargement photos:', err);
      this.error.value = 'Erreur lors du chargement des photos';
      return [];
    } finally {
      this.loading.value = false;
    }
  }

  /**
   * Obtient une photo par ID
   */
  async getById(id: string): Promise<PhotoSignalement | null> {
    try {
      const db = firebaseService.db;
      const docRef = doc(db, this.COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return this.convertFirebaseToPhoto(docSnap.id, docSnap.data());
      }
      return null;
    } catch (err: any) {
      console.error('❌ Erreur récupération photo:', err);
      return null;
    }
  }

  /**
   * Ajoute une nouvelle photo pour un signalement
   * Upload vers Cloudinary puis sauvegarde dans Firebase
   */
  async addPhoto(
    signalementId: string,
    file: File | Blob | string,
    legende?: string
  ): Promise<PhotoUploadResult> {
    this.loading.value = true;
    this.error.value = null;

    try {
      // Obtenir l'ordre actuel (nombre de photos existantes)
      const existingPhotos = await this.loadPhotosForSignalement(signalementId);
      const ordre = existingPhotos.length;

      // 1. Upload vers Cloudinary
      console.log('📤 Upload de l\'image vers Cloudinary...');
      const uploadResult = await cloudinaryService.uploadImage(file, signalementId, ordre);

      if (!uploadResult.success || !uploadResult.photo) {
        throw new Error(uploadResult.error || 'Erreur upload Cloudinary');
      }

      const photo = uploadResult.photo;
      if (legende) {
        photo.legende = legende;
      }

      // 2. Sauvegarder dans Firebase
      console.log('📤 Sauvegarde dans Firebase...');
      const db = firebaseService.db;
      const docRef = doc(db, this.COLLECTION_NAME, photo.id);

      const firebaseData = this.convertPhotoToFirebase(photo);
      await setDoc(docRef, firebaseData);

      // 3. Ajouter au cache local
      this.photos.value.push(photo);

      console.log('✅ Photo ajoutée:', photo.id);
      return { success: true, photo };

    } catch (err: any) {
      console.error('❌ Erreur ajout photo:', err);
      this.error.value = err.message;
      return { success: false, error: err.message };
    } finally {
      this.loading.value = false;
    }
  }

  /**
   * Ajoute plusieurs photos pour un signalement
   */
  async addMultiplePhotos(
    signalementId: string,
    files: (File | Blob | string)[]
  ): Promise<PhotoUploadResult[]> {
    const results: PhotoUploadResult[] = [];

    for (let i = 0; i < files.length; i++) {
      const result = await this.addPhoto(signalementId, files[i]);
      results.push(result);
    }

    return results;
  }

  /**
   * Met à jour une photo (légende, ordre)
   */
  async updatePhoto(id: string, updates: Partial<PhotoSignalement>): Promise<boolean> {
    try {
      console.log('📤 Mise à jour photo:', id);
      const db = firebaseService.db;
      const docRef = doc(db, this.COLLECTION_NAME, id);

      const updateData: any = {};
      if (updates.legende !== undefined) updateData.legende = updates.legende;
      if (updates.ordre !== undefined) updateData.ordre = updates.ordre;
      updateData.updatedAt = Timestamp.now();

      await updateDoc(docRef, updateData);

      // Mettre à jour le cache local
      const index = this.photos.value.findIndex(p => p.id === id);
      if (index !== -1) {
        this.photos.value[index] = {
          ...this.photos.value[index],
          ...updates
        };
      }

      console.log('✅ Photo mise à jour:', id);
      return true;
    } catch (err: any) {
      console.error('❌ Erreur mise à jour photo:', err);
      return false;
    }
  }

  /**
   * Supprime une photo
   */
  async deletePhoto(id: string): Promise<boolean> {
    try {
      console.log('🗑️ Suppression photo:', id);

      // Récupérer les infos de la photo pour la suppression Cloudinary
      const photo = await this.getById(id);

      // Supprimer de Cloudinary (si possible côté client)
      if (photo?.publicId) {
        await cloudinaryService.deleteImage(photo.publicId);
      }

      // Supprimer de Firebase
      const db = firebaseService.db;
      const docRef = doc(db, this.COLLECTION_NAME, id);
      await deleteDoc(docRef);

      // Supprimer du cache local
      const index = this.photos.value.findIndex(p => p.id === id);
      if (index !== -1) {
        this.photos.value.splice(index, 1);
      }

      console.log('✅ Photo supprimée:', id);
      return true;
    } catch (err: any) {
      console.error('❌ Erreur suppression photo:', err);
      return false;
    }
  }

  /**
   * Supprime toutes les photos d'un signalement
   */
  async deletePhotosForSignalement(signalementId: string): Promise<boolean> {
    try {
      console.log('🗑️ Suppression de toutes les photos du signalement:', signalementId);

      const photos = await this.loadPhotosForSignalement(signalementId);
      const db = firebaseService.db;
      const batch = writeBatch(db);

      for (const photo of photos) {
        // Supprimer de Cloudinary
        if (photo.publicId) {
          await cloudinaryService.deleteImage(photo.publicId);
        }

        // Ajouter au batch de suppression Firebase
        const docRef = doc(db, this.COLLECTION_NAME, photo.id);
        batch.delete(docRef);
      }

      // Exécuter le batch
      await batch.commit();

      // Vider le cache local
      this.photos.value = [];

      console.log(`✅ ${photos.length} photos supprimées`);
      return true;
    } catch (err: any) {
      console.error('❌ Erreur suppression photos:', err);
      return false;
    }
  }

  /**
   * Obtient les URLs des photos d'un signalement
   */
  async getPhotoUrlsForSignalement(signalementId: string): Promise<string[]> {
    const photos = await this.loadPhotosForSignalement(signalementId);
    return photos.map(p => p.url);
  }

  /**
   * Convertit un document Firebase en objet PhotoSignalement
   */
  private convertFirebaseToPhoto(id: string, data: any): PhotoSignalement | null {
    try {
      return {
        id: data.id || id,
        signalementId: data.signalementId || '',
        url: data.url || '',
        publicId: data.publicId || '',
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        ordre: data.ordre ?? 0,
        legende: data.legende || undefined,
        width: data.width || undefined,
        height: data.height || undefined,
        format: data.format || undefined
      };
    } catch (err) {
      console.error('❌ Erreur conversion document Firebase:', err);
      return null;
    }
  }

  /**
   * Convertit un objet PhotoSignalement en données Firebase
   */
  private convertPhotoToFirebase(photo: PhotoSignalement): any {
    return {
      id: photo.id,
      signalementId: photo.signalementId,
      url: photo.url,
      publicId: photo.publicId,
      createdAt: Timestamp.fromDate(new Date(photo.createdAt)),
      ordre: photo.ordre,
      legende: photo.legende || null,
      width: photo.width || null,
      height: photo.height || null,
      format: photo.format || null,
      updatedAt: Timestamp.now()
    };
  }

  // Getters réactifs
  getPhotos() {
    return this.photos;
  }

  isLoading() {
    return this.loading;
  }

  getError() {
    return this.error;
  }

  // Accès au service Cloudinary
  getCloudinaryService() {
    return cloudinaryService;
  }
}

export default new PhotoSignalementService();
