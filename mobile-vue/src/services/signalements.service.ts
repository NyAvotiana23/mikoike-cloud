import { ref } from 'vue';

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

class SignalementsService {
  private signalements = ref<Signalement[]>([]);

  constructor() {
    this.loadSignalements();
  }

  private loadSignalements() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      this.signalements.value = JSON.parse(stored);
    } else {
      // Initialiser avec données mockées
      this.signalements.value = MOCK_SIGNALEMENTS;
      this.saveToStorage();
    }
  }

  private saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.signalements.value));
  }

  getAll(userId?: string): Signalement[] {
    if (userId) {
      return this.signalements.value.filter(s => s.userId === userId);
    }
    return this.signalements.value;
  }

  getById(id: string): Signalement | undefined {
    return this.signalements.value.find(s => s.id === id);
  }

  create(data: Omit<Signalement, 'id'>): Signalement {
    const newSignalement: Signalement = {
      ...data,
      id: Date.now().toString() // ID simple basé sur timestamp
    };

    this.signalements.value.push(newSignalement);
    this.saveToStorage();

    return newSignalement;
  }

  update(id: string, updates: Partial<Signalement>): boolean {
    const index = this.signalements.value.findIndex(s => s.id === id);
    if (index === -1) return false;

    this.signalements.value[index] = {
      ...this.signalements.value[index],
      ...updates
    };
    this.saveToStorage();

    return true;
  }

  delete(id: string): boolean {
    const index = this.signalements.value.findIndex(s => s.id === id);
    if (index === -1) return false;

    this.signalements.value.splice(index, 1);
    this.saveToStorage();

    return true;
  }

  getStats() {
    const all = this.signalements.value;
    return {
      total: all.length,
      nouveau: all.filter(s => s.status === 'nouveau').length,
      en_cours: all.filter(s => s.status === 'en_cours').length,
      termine: all.filter(s => s.status === 'termine').length,
      totalSurface: all.reduce((sum, s) => sum + s.surface, 0),
      totalBudget: all.reduce((sum, s) => sum + s.budget, 0),
      avancement: Math.round((all.filter(s => s.status === 'termine').length / all.length) * 100)
    };
  }
}

export default new SignalementsService();