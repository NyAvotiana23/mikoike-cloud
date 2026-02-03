// types.ts - Types TypeScript pour l'application de gestion des signalements

// ========================================
// Types pour les Signalements
// ========================================

export interface CoordinatesDTO {
  lat: number;
  lng: number;
}

export interface ActionDTO {
  date: string;
  action: string;
  user: string;
}

export interface SignalementResponseDTO {
  id: number;
  type: string;
  icon: string;
  color: string;
  coordinates: CoordinatesDTO;
  title: string;
  date: string;
  status: string;
  surface: number;
  budget: number;
  entreprise: string;
  location: string;
  description: string;
  actions: ActionDTO[];
  // Pour la carte
  lat: number;
  lng: number;
}

export interface CreateSignalementDTO {
  latitude: number;
  longitude: number;
  description: string;
  adresse?: string;
  photoUrl?: string;
  statusId: number;
}

export interface StatisticsDTO {
  total: number;
  totalSurface: number;
  totalBudget: number;
  nouveau: number;
  enCours: number;
  termine: number;
  avancement: number;
}

// ========================================
// Types pour les Entreprises
// ========================================

export interface EntrepriseResponseDTO {
  id: number;
  nom: string;
  siret: string;
  telephone: string;
  email: string;
  adresse: string;
  specialites: string[];
  isActive: boolean;
  noteMoyenne: number;
  nombreInterventions: number;
}

// ========================================
// Types pour l'Authentification
// ========================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  userId?: number;
  email?: string;
  name?: string;
  role?: string;
  expiresAt?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  userId?: number;
  email?: string;
  name?: string;
  role?: string;
}

export interface SessionResponse {
  success: boolean;
  valid: boolean;
  message: string;
  userId?: number;
  email?: string;
  name?: string;
  role?: string;
  expiresAt?: string;
}

export interface UpdateUserRequest {
  name?: string;
  password?: string;
}

// ========================================
// Types pour les utilisateurs
// ========================================

export interface User {
  id: number;
  email: string;
  name: string;
  nom?: string;
  prenom?: string;
  role: string;
  age?: number;
  date_naissance?: string;
  location?: string;
  createdAt: string;
  isLocked?: boolean;
  firebaseSynced?: boolean;
}

// ========================================
// Types pour les Actions/Interventions
// ========================================

export interface SignalementActionDTO {
  id: number;
  signalementId: number;
  entrepriseId: number;
  entrepriseNom: string;
  description: string;
  budgetEstime: number;
  dateEstimation: string;
  dateDebutPrevue?: string;
  dateFinPrevue?: string;
  dateDebutTravaux?: string;
  dateFinReelle?: string;
  surfaceM2: number;
  travauxConformes?: boolean;
  commentaire?: string;
}

// ========================================
// Types pour les Statuts
// ========================================

export interface SignalementStatus {
  id: number;
  code: string;
  libelle: string;
  description?: string;
  ordre: number;
  couleur: string;
}

// ========================================
// Types pour les erreurs API
// ========================================

export interface ApiError {
  success: false;
  message: string;
  error?: string;
  details?: string[];
}

// ========================================
// Types pour les filtres et recherches
// ========================================

export interface SignalementFilters {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  entrepriseId?: number;
  searchTerm?: string;
}

export interface LocationFilter {
  latitude: number;
  longitude: number;
  radiusKm?: number;
}

// ========================================
// Types pour les réponses paginées
// ========================================

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// ========================================
// Types pour le dashboard manager
// ========================================

export interface DashboardStats {
  totalSignalements: number;
  nouveauxSignalements: number;
  signalementsEnCours: number;
  signalementsTermines: number;
  budgetTotal: number;
  surfaceTotal: number;
  pourcentageAvancement: number;
  utilisateursActifs: number;
  entreprisesActives: number;
}

export interface SignalementParStatus {
  status: string;
  count: number;
  percentage: number;
}

export interface BudgetParEntreprise {
  entrepriseNom: string;
  budgetTotal: number;
  nombreSignalements: number;
}

// ========================================
// Types pour les notifications
// ========================================

export interface Notification {
  id: number;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}

// ========================================
// Énumérations
// ========================================

export enum SignalementStatusCode {
  NOUVEAU = 'nouveau',
  EN_COURS = 'en_cours',
  TERMINE = 'termine',
  ANNULE = 'annule'
}

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user'
}

export enum SignalementType {
  CRITICAL = 'critical',
  WATER = 'water',
  SUCCESS = 'success',
  WARNING = 'warning',
  TRAFFIC = 'traffic',
  ACCIDENT = 'accident',
  REPAIR = 'repair',
  URGENT = 'urgent'
}