
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

class SignalementService {
    static roadIssues = [
        {
            id: 1,
            type: 'critical',
            icon: '!',
            color: '#DC2626',
            position: { lat: -18.8792, lng: 47.5079 },
            title: 'Nids de poule majeurs',
            date: '2025-01-15',
            status: 'nouveau',
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
            position: { lat: -18.9100, lng: 47.5250 },
            title: "Fuite d'eau principale",
            date: '2025-01-10',
            status: 'en cours',
            surface: 30,
            budget: 3200000,
            entreprise: 'JIRAMA Réparations',
            location: "Avenue de l'Indépendance",
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
            position: { lat: -18.9137, lng: 47.5361 },
            title: 'Réparation route terminée',
            date: '2024-12-20',
            status: 'terminé',
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
            position: { lat: -18.8650, lng: 47.5390 },
            title: 'Dégradation chaussée',
            date: '2025-01-18',
            status: 'nouveau',
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
            position: { lat: -18.9204, lng: 47.5267 },
            title: 'Travaux en cours',
            date: '2025-01-05',
            status: 'en cours',
            surface: 200,
            budget: 8500000,
            entreprise: 'Construction Moderne',
            location: 'Pont de Behoririka',
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
            position: { lat: -18.9050, lng: 47.5300 },
            title: 'Zone accidentogène',
            date: '2025-01-12',
            status: 'en cours',
            surface: 60,
            budget: 3800000,
            entreprise: 'Sécurité Routière SA',
            location: "Boulevard de l'Europe",
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
            position: { lat: -18.9147, lng: 47.5220 },
            title: 'Réparation trottoir',
            date: '2025-01-14',
            status: 'nouveau',
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
            date: '2025-01-19',
            status: 'nouveau',
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
        const avancement = ((termine / total) * 100).toFixed(1);

        return {
            total,
            totalSurface,
            totalBudget,
            nouveau,
            enCours,
            termine,
            avancement
        };
    }
}