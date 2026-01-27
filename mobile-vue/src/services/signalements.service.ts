import { ref } from 'vue';
import type { Signalement } from '@/types/signalement';

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
    description: 'Nid de poule avenue de l\'Indépendance',
    titre: 'Réparation avenue Indépendance',
    priorite: 'haute',
    dateDebut: new Date('2026-01-20').toISOString()
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
    dateFin: new Date('2026-02-15').toISOString()
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
    dateFin: new Date('2026-01-25').toISOString()
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
    priorite: 'moyenne'
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
    dateDebut: new Date('2026-01-22').toISOString()
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
    priorite: 'haute'
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
    dateFin: new Date('2026-01-26').toISOString()
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
    priorite: 'basse'
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
      annule: all.filter(s => s.status === 'annule').length,
      totalSurface: all.reduce((sum, s) => sum + s.surface, 0),
      totalBudget: all.reduce((sum, s) => sum + s.budget, 0),
      avancement: all.length > 0 ? Math.round((all.filter(s => s.status === 'termine').length / all.length) * 100) : 0
    };
  }
}

export default new SignalementsService();