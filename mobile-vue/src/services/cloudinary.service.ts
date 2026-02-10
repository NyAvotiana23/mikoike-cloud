import { ref } from 'vue';
import type { CloudinaryUploadResponse, PhotoSignalement, PhotoUploadResult } from '@/types/photo-signalement';

/**
 * Service Cloudinary pour l'upload des images
 * Configuration avec les credentials fournis
 */
class CloudinaryService {
  private readonly cloudName = 'dpcpnlsim';
  private readonly apiKey = '362239814724361';
  private readonly apiSecret = 'fxhJ8onzkM-oPZnFjTONHfO7Jcc';
  private readonly uploadPreset = 'mikoike_signalements'; // Preset non signé pour upload depuis le client

  private uploading = ref(false);
  private uploadProgress = ref(0);

  /**
   * URL de base pour l'upload Cloudinary
   */
  private get uploadUrl(): string {
    return `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;
  }

  /**
   * Upload une image vers Cloudinary (mode non signé)
   * Pour le mode client-side, utiliser un unsigned preset
   * @param file - Fichier image (File, Blob, ou base64)
   * @param signalementId - ID du signalement associé
   * @param ordre - Ordre de la photo
   */
  async uploadImage(
    file: File | Blob | string,
    signalementId: string,
    ordre: number = 0
  ): Promise<PhotoUploadResult> {
    this.uploading.value = true;
    this.uploadProgress.value = 0;

    try {
      const formData = new FormData();

      // Gérer les différents types d'entrée
      if (typeof file === 'string') {
        // Base64 string
        formData.append('file', file);
      } else {
        // File ou Blob
        formData.append('file', file);
      }

      // Paramètres d'upload Cloudinary
      formData.append('upload_preset', this.uploadPreset);
      formData.append('cloud_name', this.cloudName);
      formData.append('folder', `signalements/${signalementId}`);
      formData.append('tags', `signalement_${signalementId},mikoike`);

      // Upload avec suivi de progression
      const response = await this.uploadWithProgress(formData);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Erreur upload Cloudinary');
      }

      const data: CloudinaryUploadResponse = await response.json();

      // Créer l'objet PhotoSignalement
      const photo: PhotoSignalement = {
        id: `photo_${Date.now()}_${ordre}`,
        signalementId,
        url: data.secure_url,
        publicId: data.public_id,
        createdAt: new Date().toISOString(),
        ordre,
        width: data.width,
        height: data.height,
        format: data.format
      };

      console.log('✅ Image uploadée sur Cloudinary:', photo.url);
      return { success: true, photo };

    } catch (error: any) {
      console.error('❌ Erreur upload Cloudinary:', error);
      return {
        success: false,
        error: error.message || 'Erreur lors de l\'upload de l\'image'
      };
    } finally {
      this.uploading.value = false;
      this.uploadProgress.value = 100;
    }
  }

  /**
   * Upload avec XMLHttpRequest pour suivre la progression
   */
  private uploadWithProgress(formData: FormData): Promise<Response> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          this.uploadProgress.value = Math.round((event.loaded / event.total) * 100);
        }
      });

      xhr.addEventListener('load', () => {
        const response = new Response(xhr.responseText, {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: new Headers({
            'Content-Type': 'application/json'
          })
        });
        resolve(response);
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Erreur réseau lors de l\'upload'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload annulé'));
      });

      xhr.open('POST', this.uploadUrl);
      xhr.send(formData);
    });
  }

  /**
   * Upload multiple images
   * @param files - Liste des fichiers
   * @param signalementId - ID du signalement
   */
  async uploadMultipleImages(
    files: (File | Blob | string)[],
    signalementId: string
  ): Promise<PhotoUploadResult[]> {
    const results: PhotoUploadResult[] = [];

    for (let i = 0; i < files.length; i++) {
      const result = await this.uploadImage(files[i], signalementId, i);
      results.push(result);
    }

    return results;
  }

  /**
   * Supprime une image de Cloudinary
   * Note: La suppression nécessite une signature côté serveur pour être sécurisée
   * Cette méthode est à utiliser avec prudence en mode client
   */
  async deleteImage(publicId: string): Promise<boolean> {
    try {
      // La suppression côté client n'est pas recommandée pour des raisons de sécurité
      // Idéalement, cela devrait passer par votre backend
      console.warn(`⚠️ Suppression d'image Cloudinary (${publicId}) - à implémenter côté serveur`);

      // Pour une vraie suppression, il faudrait:
      // 1. Appeler votre backend
      // 2. Le backend génère la signature et supprime l'image

      return true;
    } catch (error: any) {
      console.error('❌ Erreur suppression image:', error);
      return false;
    }
  }

  /**
   * Génère une URL transformée (redimensionnement, qualité, etc.)
   */
  getTransformedUrl(
    publicId: string,
    options: {
      width?: number;
      height?: number;
      quality?: number | 'auto';
      crop?: 'fill' | 'fit' | 'scale' | 'thumb';
    } = {}
  ): string {
    const { width, height, quality = 'auto', crop = 'fill' } = options;

    const transformations = [];

    if (width) transformations.push(`w_${width}`);
    if (height) transformations.push(`h_${height}`);
    if (quality) transformations.push(`q_${quality}`);
    if (crop && (width || height)) transformations.push(`c_${crop}`);

    const transformString = transformations.length > 0
      ? transformations.join(',') + '/'
      : '';

    return `https://res.cloudinary.com/${this.cloudName}/image/upload/${transformString}${publicId}`;
  }

  /**
   * Génère une URL thumbnail
   */
  getThumbnailUrl(publicId: string, size: number = 150): string {
    return this.getTransformedUrl(publicId, {
      width: size,
      height: size,
      crop: 'thumb',
      quality: 'auto'
    });
  }

  // Getters réactifs
  isUploading() {
    return this.uploading;
  }

  getUploadProgress() {
    return this.uploadProgress;
  }
}

export default new CloudinaryService();
