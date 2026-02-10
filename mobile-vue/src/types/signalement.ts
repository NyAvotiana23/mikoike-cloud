export interface Signalement {
  id: string;
  userId: string;
  location: {
    lat: number;
    lng: number;
  };
  date: string;
  status: 'nouveau' | 'en_cours' | 'termine' | 'annule';
  surface: number; // en m²
  budget: number; // en Ar (Ariary)
  entreprise: string;
  description: string;
  titre?: string;
  adresse?: string;
  photoUrl?: string;
  photos?: string[];
  priorite?: 'basse' | 'moyenne' | 'haute';
  dateDebut?: string;
  dateFin?: string;
  userEmail?: string;
}

export interface SignalementFilters {
  status?: string[];
  priorite?: string[];
  dateDebut?: string;
  dateFin?: string;
  userId?: string;
}

export interface SignalementStats {
  total: number;
  nouveau: number;
  en_cours: number;
  termine: number;
  annule?: number;
  totalSurface: number;
  totalBudget: number;
  avancement: number;
}
