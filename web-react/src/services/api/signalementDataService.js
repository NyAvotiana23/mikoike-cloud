// src/services/api/signalementDataService.js
// Service de données statiques pour les signalements routiers d'Antananarivo

// Coordonnées réelles d'Antananarivo pour les signalements
const roadIssuesData = [
    {
        id: 1,
        type: 'critical',
        icon: '!',
        color: '#DC2626',
        // Coordonnées réelles - Rue Ravoninahitriniarivo (près Analakely)
        coordinates: { lat: -18.9137, lng: 47.5256 },
        title: 'Nids de poule majeurs',
        date: '2025-01-15',
        status: 'nouveau',
        surface: 45,
        budget: 2500000,
        entreprise: 'Travaux Publics Tana',
        location: 'Rue Ravoninahitriniarivo',
        description: 'Plusieurs nids de poule dangereux nécessitant une intervention urgente',
        actions: [
            { date: '2025-01-15', action: 'Signalement créé', user: 'Agent Municipal' },
            { date: '2025-01-16', action: 'Inspection programmée', user: 'Chef de zone' }
        ]
    },
    {
        id: 2,
        type: 'water',
        icon: '💧',
        color: '#2563EB',
        // Avenue de l'Indépendance
        coordinates: { lat: -18.9100, lng: 47.5220 },
        title: "Fuite d'eau principale",
        date: '2025-01-10',
        status: 'en cours',
        surface: 30,
        budget: 3200000,
        entreprise: 'JIRAMA Réparations',
        location: "Avenue de l'Indépendance",
        description: 'Fuite importante sur la canalisation principale',
        actions: [
            { date: '2025-01-10', action: 'Signalement créé', user: 'Citoyen' },
            { date: '2025-01-11', action: 'Validation du signalement', user: 'Superviseur' },
            { date: '2025-01-12', action: 'Équipe envoyée sur place', user: 'JIRAMA' },
            { date: '2025-01-14', action: 'Travaux démarrés', user: 'Chef de chantier' }
        ]
    },
    {
        id: 3,
        type: 'success',
        icon: '✓',
        color: '#16A34A',
        // Gare Soarano
        coordinates: { lat: -18.9075, lng: 47.5217 },
        title: 'Réparation route terminée',
        date: '2024-12-20',
        status: 'terminé',
        surface: 120,
        budget: 5500000,
        entreprise: 'Routes et Bâtiments',
        location: 'Gare Soarano',
        description: 'Réfection complète de la chaussée devant la gare',
        actions: [
            { date: '2024-12-20', action: 'Signalement créé', user: 'Agent Municipal' },
            { date: '2024-12-22', action: 'Devis approuvé', user: 'Direction' },
            { date: '2024-12-28', action: 'Début des travaux', user: 'Entreprise RB' },
            { date: '2025-01-08', action: 'Travaux terminés', user: 'Chef de projet' },
            { date: '2025-01-10', action: 'Validation finale', user: 'Inspecteur' }
        ]
    },
    {
        id: 4,
        type: 'warning',
        icon: '⚠',
        color: '#F59E0B',
        // 67 Ha
        coordinates: { lat: -18.9200, lng: 47.5380 },
        title: 'Dégradation chaussée',
        date: '2025-01-18',
        status: 'nouveau',
        surface: 85,
        budget: 4100000,
        entreprise: 'En attente attribution',
        location: '67 Ha',
        description: 'Dégradation importante de la chaussée nécessitant évaluation',
        actions: [
            { date: '2025-01-18', action: 'Signalement créé', user: 'Riverain' },
            { date: '2025-01-19', action: 'En attente de validation', user: 'Système' }
        ]
    },
    {
        id: 5,
        type: 'traffic',
        icon: '🚧',
        color: '#8B5CF6',
        // Pont de Behoririka
        coordinates: { lat: -18.9050, lng: 47.5150 },
        title: 'Travaux en cours',
        date: '2025-01-05',
        status: 'en cours',
        surface: 200,
        budget: 8500000,
        entreprise: 'Construction Moderne',
        location: 'Pont de Behoririka',
        description: 'Rénovation majeure du pont et des abords',
        actions: [
            { date: '2025-01-05', action: 'Projet planifié', user: 'Mairie' },
            { date: '2025-01-08', action: "Appel d'offres lancé", user: 'Direction' },
            { date: '2025-01-12', action: 'Entreprise sélectionnée', user: 'Commission' },
            { date: '2025-01-15', action: 'Début des travaux', user: 'CM' }
        ]
    },
    {
        id: 6,
        type: 'accident',
        icon: '🚗',
        color: '#DC2626',
        // Boulevard de l'Europe (Ivandry)
        coordinates: { lat: -18.8920, lng: 47.5450 },
        title: 'Zone accidentogène',
        date: '2025-01-12',
        status: 'en cours',
        surface: 60,
        budget: 3800000,
        entreprise: 'Sécurité Routière SA',
        location: "Boulevard de l'Europe",
        description: 'Zone à forte concentration d\'accidents, signalisation à améliorer',
        actions: [
            { date: '2025-01-12', action: 'Signalement multiple accidents', user: 'Police' },
            { date: '2025-01-13', action: 'Étude de sécurité demandée', user: 'Préfecture' },
            { date: '2025-01-17', action: 'Installation signalisation temporaire', user: 'SR SA' }
        ]
    },
    {
        id: 7,
        type: 'repair',
        icon: '🔧',
        color: '#EA580C',
        // Analakely Centre
        coordinates: { lat: -18.9110, lng: 47.5235 },
        title: 'Réparation trottoir',
        date: '2025-01-14',
        status: 'nouveau',
        surface: 25,
        budget: 1200000,
        entreprise: 'Pavage Express',
        location: 'Analakely',
        description: 'Trottoir endommagé présentant un danger pour les piétons',
        actions: [
            { date: '2025-01-14', action: 'Signalement créé', user: 'Commerçant local' },
            { date: '2025-01-16', action: 'Inspection réalisée', user: 'Agent technique' }
        ]
    },
    {
        id: 8,
        type: 'urgent',
        icon: '🚨',
        color: '#EF4444',
        // Isoraka
        coordinates: { lat: -18.9160, lng: 47.5290 },
        title: 'Effondrement partiel',
        date: '2025-01-19',
        status: 'nouveau',
        surface: 50,
        budget: 6500000,
        entreprise: 'Urgence TP',
        location: 'Isoraka',
        description: 'Effondrement partiel de la chaussée - danger immédiat',
        actions: [
            { date: '2025-01-19', action: 'Alerte urgence déclenchée', user: 'Système' },
            { date: '2025-01-19', action: 'Sécurisation périmètre', user: 'Police municipale' },
            { date: '2025-01-20', action: 'Expertise technique en cours', user: 'Ingénieur' }
        ]
    },
    {
        id: 9,
        type: 'water',
        icon: '💧',
        color: '#2563EB',
        // Mahamasina
        coordinates: { lat: -18.9180, lng: 47.5170 },
        title: 'Inondation récurrente',
        date: '2025-01-08',
        status: 'en cours',
        surface: 150,
        budget: 7200000,
        entreprise: 'Assainissement Tana',
        location: 'Mahamasina',
        description: 'Zone sujette à inondations lors des pluies',
        actions: [
            { date: '2025-01-08', action: 'Signalement créé', user: 'Riverains' },
            { date: '2025-01-10', action: 'Étude hydraulique lancée', user: 'BET Hydro' },
            { date: '2025-01-15', action: 'Curage caniveaux démarré', user: 'Assainissement' }
        ]
    },
    {
        id: 10,
        type: 'success',
        icon: '✓',
        color: '#16A34A',
        // Ambohijatovo
        coordinates: { lat: -18.9095, lng: 47.5265 },
        title: 'Éclairage public réparé',
        date: '2024-12-25',
        status: 'terminé',
        surface: 80,
        budget: 2800000,
        entreprise: 'JIRAMA Éclairage',
        location: 'Ambohijatovo',
        description: 'Réparation complète de l\'éclairage public du quartier',
        actions: [
            { date: '2024-12-25', action: 'Signalement créé', user: 'Association quartier' },
            { date: '2024-12-28', action: 'Diagnostic réalisé', user: 'Technicien JIRAMA' },
            { date: '2025-01-05', action: 'Travaux terminés', user: 'Équipe éclairage' }
        ]
    }
];

// Service pour récupérer les données
const signalementDataService = {
    /**
     * Récupère tous les signalements
     * @returns {Promise<Array>} Liste des signalements
     */
    getAllSignalements: async () => {
        // Simulation d'un délai réseau
        await new Promise(resolve => setTimeout(resolve, 300));
        return [...roadIssuesData];
    },

    /**
     * Récupère un signalement par son ID
     * @param {number} id - ID du signalement
     * @returns {Promise<Object|null>} Le signalement ou null
     */
    getSignalementById: async (id) => {
        await new Promise(resolve => setTimeout(resolve, 200));
        return roadIssuesData.find(issue => issue.id === id) || null;
    },

    /**
     * Récupère les signalements par statut
     * @param {string} status - Statut (nouveau, en cours, terminé)
     * @returns {Promise<Array>} Liste des signalements filtrés
     */
    getSignalementsByStatus: async (status) => {
        await new Promise(resolve => setTimeout(resolve, 200));
        return roadIssuesData.filter(issue => issue.status === status);
    },

    /**
     * Calcule les statistiques des signalements
     * @returns {Promise<Object>} Statistiques
     */
    getStatistics: async () => {
        await new Promise(resolve => setTimeout(resolve, 200));
        const data = roadIssuesData;
        return {
            total: data.length,
            totalSurface: data.reduce((sum, issue) => sum + issue.surface, 0),
            totalBudget: data.reduce((sum, issue) => sum + issue.budget, 0),
            nouveau: data.filter(i => i.status === 'nouveau').length,
            enCours: data.filter(i => i.status === 'en cours').length,
            termine: data.filter(i => i.status === 'terminé').length
        };
    },

    /**
     * Récupère les signalements pour la carte (avec coordonnées)
     * @returns {Promise<Array>} Liste des signalements avec coordonnées
     */
    getSignalementsForMap: async () => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return roadIssuesData.map(issue => ({
            ...issue,
            lat: issue.coordinates.lat,
            lng: issue.coordinates.lng
        }));
    }
};

export default signalementDataService;
