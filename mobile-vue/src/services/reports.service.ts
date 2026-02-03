import firebaseService from './firebase.service';
// import { collection, addDoc, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import type { Signalement } from '@/types/signalement';

/**
 * Service pour gérer les rapports/signalements avec Firestore
 * Pour l'instant, utilise des données statiques
 * Décommentez les imports et méthodes Firestore pour activer la persistance
 */
class ReportsService {
  private collectionName = 'signalements';

  // Données statiques pour le développement
  private staticReports: Signalement[] = [
    {
      id: '1',
      userId: 'user1',
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
      userId: 'user1',
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
      userId: 'user2',
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
    }
  ];

  /**
   * Récupérer tous les rapports ou filtrer par utilisateur
   * VERSION STATIQUE
   */
  async getAllReports(userId?: string): Promise<Signalement[]> {
    // Simuler un délai réseau
    await new Promise(resolve => setTimeout(resolve, 300));

    if (userId) {
      return this.staticReports.filter(r => r.userId === userId);
    }
    return [...this.staticReports];
  }

  /**
   * Récupérer tous les rapports depuis Firestore
   * DÉCOMMENTER POUR ACTIVER FIRESTORE
   */
  // async getAllReports(userId?: string): Promise<Signalement[]> {
  //   try {
  //     const reportsRef = collection(firebaseService.db, this.collectionName);
  //     let q;
  //
  //     if (userId) {
  //       q = query(
  //         reportsRef,
  //         where('userId', '==', userId),
  //         orderBy('date', 'desc')
  //       );
  //     } else {
  //       q = query(reportsRef, orderBy('date', 'desc'));
  //     }
  //
  //     const querySnapshot = await getDocs(q);
  //     const reports: Signalement[] = [];
  //
  //     querySnapshot.forEach((doc) => {
  //       const data = doc.data();
  //       reports.push({
  //         id: doc.id,
  //         userId: data.userId,
  //         location: data.location,
  //         date: data.date.toDate().toISOString(),
  //         status: data.status,
  //         surface: data.surface,
  //         budget: data.budget,
  //         entreprise: data.entreprise,
  //         description: data.description,
  //         titre: data.titre,
  //         priorite: data.priorite,
  //         dateDebut: data.dateDebut?.toDate().toISOString(),
  //         dateFin: data.dateFin?.toDate().toISOString(),
  //         photos: data.photos || []
  //       });
  //     });
  //
  //     return reports;
  //   } catch (error) {
  //     console.error('Erreur lors de la récupération des rapports:', error);
  //     throw error;
  //   }
  // }

  /**
   * Ajouter un nouveau rapport
   * VERSION STATIQUE
   */
  async addReport(report: Omit<Signalement, 'id'>): Promise<string> {
    // Simuler un délai réseau
    await new Promise(resolve => setTimeout(resolve, 300));

    const newReport: Signalement = {
      ...report,
      id: 'report_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    };

    this.staticReports.unshift(newReport);
    return newReport.id;
  }

  /**
   * Ajouter un nouveau rapport à Firestore
   * DÉCOMMENTER POUR ACTIVER FIRESTORE
   */
  // async addReport(report: Omit<Signalement, 'id'>): Promise<string> {
  //   try {
  //     const reportsRef = collection(firebaseService.db, this.collectionName);
  //
  //     const reportData = {
  //       ...report,
  //       date: Timestamp.fromDate(new Date(report.date)),
  //       dateDebut: report.dateDebut ? Timestamp.fromDate(new Date(report.dateDebut)) : null,
  //       dateFin: report.dateFin ? Timestamp.fromDate(new Date(report.dateFin)) : null
  //     };
  //
  //     const docRef = await addDoc(reportsRef, reportData);
  //     return docRef.id;
  //   } catch (error) {
  //     console.error('Erreur lors de l\'ajout du rapport:', error);
  //     throw error;
  //   }
  // }

  /**
   * Récupérer un rapport par ID
   * VERSION STATIQUE
   */
  async getReportById(id: string): Promise<Signalement | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.staticReports.find(r => r.id === id) || null;
  }

  /**
   * Récupérer un rapport par ID depuis Firestore
   * DÉCOMMENTER POUR ACTIVER FIRESTORE
   */
  // async getReportById(id: string): Promise<Signalement | null> {
  //   try {
  //     const docRef = doc(firebaseService.db, this.collectionName, id);
  //     const docSnap = await getDoc(docRef);
  //
  //     if (docSnap.exists()) {
  //       const data = docSnap.data();
  //       return {
  //         id: docSnap.id,
  //         userId: data.userId,
  //         location: data.location,
  //         date: data.date.toDate().toISOString(),
  //         status: data.status,
  //         surface: data.surface,
  //         budget: data.budget,
  //         entreprise: data.entreprise,
  //         description: data.description,
  //         titre: data.titre,
  //         priorite: data.priorite,
  //         dateDebut: data.dateDebut?.toDate().toISOString(),
  //         dateFin: data.dateFin?.toDate().toISOString(),
  //         photos: data.photos || []
  //       };
  //     }
  //     return null;
  //   } catch (error) {
  //     console.error('Erreur lors de la récupération du rapport:', error);
  //     throw error;
  //   }
  // }
}

export default new ReportsService();
