import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import firebaseService from './firebase.service';

export interface Entreprise {
  id: number;
  nom: string;
  siret?: string;
  telephone?: string;
  email?: string;
  adresse?: string;
  specialites?: string[];
  isActive?: boolean;
  noteMoyenne?: number;
  nombreInterventions?: number;
}

class EntreprisesService {
  private collectionName = 'entreprises';

  /**
   * Récupère toutes les entreprises actives depuis Firebase
   */
  async getEntreprisesActives(): Promise<Entreprise[]> {
    try {
      const db = firebaseService.db;
      const entreprisesRef = collection(db, this.collectionName);
      const q = query(entreprisesRef, orderBy('nom', 'asc'));

      const snapshot = await getDocs(q);
      const entreprises: Entreprise[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        // Ne retourner que les entreprises actives
        if (data.isActive !== false) {
          entreprises.push({
            id: data.id,
            nom: data.nom,
            siret: data.siret,
            telephone: data.telephone,
            email: data.email,
            adresse: data.adresse,
            specialites: data.specialites,
            isActive: data.isActive,
            noteMoyenne: data.noteMoyenne,
            nombreInterventions: data.nombreInterventions,
          });
        }
      });

      return entreprises;
    } catch (error) {
      console.error('Erreur lors de la récupération des entreprises:', error);
      throw error;
    }
  }

  /**
   * Récupère toutes les entreprises (actives et inactives)
   */
  async getAllEntreprises(): Promise<Entreprise[]> {
    try {
      const db = firebaseService.db;
      const entreprisesRef = collection(db, this.collectionName);
      const q = query(entreprisesRef, orderBy('nom', 'asc'));

      const snapshot = await getDocs(q);
      const entreprises: Entreprise[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        entreprises.push({
          id: data.id,
          nom: data.nom,
          siret: data.siret,
          telephone: data.telephone,
          email: data.email,
          adresse: data.adresse,
          specialites: data.specialites,
          isActive: data.isActive,
          noteMoyenne: data.noteMoyenne,
          nombreInterventions: data.nombreInterventions,
        });
      });

      return entreprises;
    } catch (error) {
      console.error('Erreur lors de la récupération des entreprises:', error);
      throw error;
    }
  }

  /**
   * Récupère une entreprise par son ID
   */
  async getEntrepriseById(id: number): Promise<Entreprise | null> {
    try {
      const entreprises = await this.getAllEntreprises();
      return entreprises.find(e => e.id === id) || null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'entreprise:', error);
      throw error;
    }
  }

  /**
   * Récupère le nom d'une entreprise par son ID
   */
  async getEntrepriseNom(id: number): Promise<string> {
    try {
      const entreprise = await this.getEntrepriseById(id);
      return entreprise?.nom || 'Non assigné';
    } catch (error) {
      console.error('Erreur lors de la récupération du nom de l\'entreprise:', error);
      return 'Non assigné';
    }
  }
}

export default new EntreprisesService();

