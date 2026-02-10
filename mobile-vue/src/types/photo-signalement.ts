/**
 * Interface pour une photo de signalement
 * Collection Firebase: photo_signalement
 * Relation: Un signalement peut avoir plusieurs photos
 */
export interface PhotoSignalement {
  id: string;
  signalementId: string;
  url: string;
  publicId: string; // ID Cloudinary pour la gestion (suppression, transformation)
  createdAt: string;
  ordre: number; // Ordre d'affichage
  legende?: string; // Légende optionnelle de la photo
  width?: number;
  height?: number;
  format?: string; // jpg, png, webp...
}

export interface PhotoUploadResult {
  success: boolean;
  photo?: PhotoSignalement;
  error?: string;
}

export interface CloudinaryUploadResponse {
  public_id: string;
  secure_url: string;
  url: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  bytes: number;
}
