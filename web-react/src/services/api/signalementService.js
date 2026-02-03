
import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { X, Calendar, DollarSign, TrendingUp, Wrench, AlertCircle, CheckCircle, Clock, MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix pour les icônes Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// src/services/api/signalementService.js

class SignalementService {
    static roadIssues = [
        {
            id: 1,
            type: 'critical',
            icon: '!',
            color: '#DC2626',
            position: { lat: -18.8792, lng: 47.5079 },
            title: 'Nids de poule majeurs',
            dateCreation: '2025-01-15',
            dateDebut: null,
            dateFin: null,
            status: 'nouveau',
            avancement: 0,
            surface: 45,
            budget: 2500000,
            entreprise: 'Travaux Publics Tana',
            location: 'Rue Ravoninahitriniarivo',
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
            position: { lat: -18.9134, lng: 47.5361 },
            title: 'Fuite d\'eau principale',
            dateCreation: '2025-01-10',
            dateDebut: '2025-01-14',
            dateFin: null,
            status: 'en cours',
            avancement: 50,
            surface: 30,
            budget: 3200000,
            entreprise: 'JIRAMA Réparations',
            location: 'Avenue de l\'Indépendance',
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
            position: { lat: -18.9104, lng: 47.5238 },
            title: 'Réparation route terminée',
            dateCreation: '2024-12-20',
            dateDebut: '2024-12-28',
            dateFin: '2025-01-10',
            status: 'terminé',
            avancement: 100,
            surface: 120,
            budget: 5500000,
            entreprise: 'Routes et Bâtiments',
            location: 'Gare Soarano',
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
            position: { lat: -18.8650, lng: 47.5450 },
            title: 'Dégradation chaussée',
            dateCreation: '2025-01-18',
            dateDebut: null,
            dateFin: null,
            status: 'nouveau',
            avancement: 0,
            surface: 85,
            budget: 4100000,
            entreprise: 'En attente attribution',
            location: '67 Ha',
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
            position: { lat: -18.9070, lng: 47.5200 },
            title: 'Travaux en cours',
            dateCreation: '2025-01-05',
            dateDebut: '2025-01-15',
            dateFin: null,
            status: 'en cours',
            avancement: 50,
            surface: 200,
            budget: 8500000,
            entreprise: 'Construction Moderne',
            location: 'Pont de Behoririka',
            actions: [
                { date: '2025-01-05', action: 'Projet planifié', user: 'Mairie' },
                { date: '2025-01-08', action: 'Appel d\'offres lancé', user: 'Direction' },
                { date: '2025-01-12', action: 'Entreprise sélectionnée', user: 'Commission' },
                { date: '2025-01-15', action: 'Début des travaux', user: 'CM' }
            ]
        },
        {
            id: 6,
            type: 'accident',
            icon: '🚗',
            color: '#DC2626',
            position: { lat: -18.9200, lng: 47.5300 },
            title: 'Zone accidentogène',
            dateCreation: '2025-01-12',
            dateDebut: '2025-01-17',
            dateFin: null,
            status: 'en cours',
            avancement: 50,
            surface: 60,
            budget: 3800000,
            entreprise: 'Sécurité Routière SA',
            location: 'Boulevard de l\'Europe',
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
            position: { lat: -18.9250, lng: 47.5150 },
            title: 'Réparation trottoir',
            dateCreation: '2025-01-14',
            dateDebut: null,
            dateFin: null,
            status: 'nouveau',
            avancement: 0,
            surface: 25,
            budget: 1200000,
            entreprise: 'Pavage Express',
            location: 'Analakely',
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
            position: { lat: -18.9160, lng: 47.5240 },
            title: 'Effondrement partiel',
            dateCreation: '2025-01-19',
            dateDebut: null,
            dateFin: null,
            status: 'nouveau',
            avancement: 0,
            surface: 50,
            budget: 6500000,
            entreprise: 'Urgence TP',
            location: 'Analakely Centre',
            actions: [
                { date: '2025-01-19', action: 'Alerte urgence déclenchée', user: 'Système' },
                { date: '2025-01-19', action: 'Sécurisation périmètre', user: 'Police municipale' },
                { date: '2025-01-20', action: 'Expertise technique en cours', user: 'Ingénieur' }
            ]
        }
    ];

    static getAllSignalements() {
        return this.roadIssues;
    }

    static getSignalementById(id) {
        return this.roadIssues.find(issue => issue.id === id);
    }

    static getStatistics() {
        const total = this.roadIssues.length;
        const totalSurface = this.roadIssues.reduce((sum, issue) => sum + issue.surface, 0);
        const totalBudget = this.roadIssues.reduce((sum, issue) => sum + issue.budget, 0);
        const nouveau = this.roadIssues.filter(i => i.status === 'nouveau').length;
        const enCours = this.roadIssues.filter(i => i.status === 'en cours').length;
        const termine = this.roadIssues.filter(i => i.status === 'terminé').length;
        
        // Calcul de l'avancement global
        const avancementTotal = this.roadIssues.reduce((sum, issue) => sum + issue.avancement, 0);
        const avancement = (avancementTotal / total).toFixed(1);

        // Calcul du délai moyen de traitement (en jours)
        const travauxTermines = this.roadIssues.filter(i => i.status === 'terminé');
        let delaiMoyen = 0;
        
        if (travauxTermines.length > 0) {
            const totalJours = travauxTermines.reduce((sum, issue) => {
                const debut = new Date(issue.dateCreation);
                const fin = new Date(issue.dateFin);
                const jours = Math.floor((fin - debut) / (1000 * 60 * 60 * 24));
                return sum + jours;
            }, 0);
            delaiMoyen = (totalJours / travauxTermines.length).toFixed(1);
        }

        return {
            total,
            totalSurface,
            totalBudget,
            nouveau,
            enCours,
            termine,
            avancement,
            delaiMoyen
        };
    }

    static getTraitementStatistics() {
        const travauxTermines = this.roadIssues.filter(i => i.status === 'terminé');
        const travauxEnCours = this.roadIssues.filter(i => i.status === 'en cours');
        
        const statsTermines = travauxTermines.map(issue => {
            const debut = new Date(issue.dateCreation);
            const fin = new Date(issue.dateFin);
            const duree = Math.floor((fin - debut) / (1000 * 60 * 60 * 24));
            
            return {
                id: issue.id,
                title: issue.title,
                dateCreation: issue.dateCreation,
                dateDebut: issue.dateDebut,
                dateFin: issue.dateFin,
                duree,
                surface: issue.surface,
                budget: issue.budget,
                status: issue.status
            };
        });

        const statsEnCours = travauxEnCours.map(issue => {
            const debut = new Date(issue.dateCreation);
            const aujourdhui = new Date();
            const dureeActuelle = Math.floor((aujourdhui - debut) / (1000 * 60 * 60 * 24));
            
            return {
                id: issue.id,
                title: issue.title,
                dateCreation: issue.dateCreation,
                dateDebut: issue.dateDebut,
                dateFin: null,
                dureeActuelle,
                avancement: issue.avancement,
                surface: issue.surface,
                budget: issue.budget,
                status: issue.status
            };
        });

        return {
            termine: statsTermines,
            enCours: statsEnCours
        };
    }
}

export default SignalementService;