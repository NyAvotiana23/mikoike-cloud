// src/pages/signalement/SignalementStatistics.jsx
import { useState, useEffect } from 'react';
import { Calendar, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import SignalementService from '../../services/api/signalementService';

function SignalementStatistics() {
    const [stats, setStats] = useState(null);
    const [traitementStats, setTraitementStats] = useState(null);

    useEffect(() => {
        setStats(SignalementService.getStatistics());
        setTraitementStats(SignalementService.getTraitementStatistics());
    }, []);

    if (!stats || !traitementStats) {
        return <div className="p-6">Chargement...</div>;
    }

    const formatNumber = (num) => {
        return new Intl.NumberFormat('fr-FR').format(num);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('fr-FR');
    };

    return (
        <div className="p-6 space-y-6">
            {/* En-tête */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                    Statistiques des Signalements
                </h1>
                <p className="text-neutral-600">
                    Analyse et suivi des travaux routiers
                </p>
            </div>

            {/* Cartes de statistiques globales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-soft border border-neutral-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-neutral-600 font-medium">Total Signalements</h3>
                        <Calendar className="text-primary-600" size={24} />
                    </div>
                    <p className="text-3xl font-bold text-neutral-900">{stats.total}</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-soft border border-neutral-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-neutral-600 font-medium">Avancement Global</h3>
                        <TrendingUp className="text-success-600" size={24} />
                    </div>
                    <p className="text-3xl font-bold text-neutral-900">{stats.avancement}%</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-soft border border-neutral-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-neutral-600 font-medium">Délai Moyen</h3>
                        <Clock className="text-warning-600" size={24} />
                    </div>
                    <p className="text-3xl font-bold text-neutral-900">{stats.delaiMoyen} jours</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-soft border border-neutral-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-neutral-600 font-medium">Travaux Terminés</h3>
                        <CheckCircle className="text-success-600" size={24} />
                    </div>
                    <p className="text-3xl font-bold text-neutral-900">{stats.termine}</p>
                </div>
            </div>

            {/* Répartition par statut */}
            <div className="bg-white p-6 rounded-xl shadow-soft border border-neutral-200">
                <h2 className="text-xl font-bold text-neutral-900 mb-4">
                    Répartition par Statut
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-blue-600 font-medium mb-1">Nouveau</p>
                        <p className="text-2xl font-bold text-blue-900">{stats.nouveau}</p>
                        <p className="text-sm text-blue-600">
                            {((stats.nouveau / stats.total) * 100).toFixed(1)}%
                        </p>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                        <p className="text-orange-600 font-medium mb-1">En cours</p>
                        <p className="text-2xl font-bold text-orange-900">{stats.enCours}</p>
                        <p className="text-sm text-orange-600">
                            {((stats.enCours / stats.total) * 100).toFixed(1)}%
                        </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-green-600 font-medium mb-1">Terminé</p>
                        <p className="text-2xl font-bold text-green-900">{stats.termine}</p>
                        <p className="text-sm text-green-600">
                            {((stats.termine / stats.total) * 100).toFixed(1)}%
                        </p>
                    </div>
                </div>
            </div>

            {/* Tableau des travaux terminés */}
            <div className="bg-white rounded-xl shadow-soft border border-neutral-200">
                <div className="p-6 border-b border-neutral-200">
                    <h2 className="text-xl font-bold text-neutral-900">
                        Traitement des Travaux Terminés
                    </h2>
                    <p className="text-sm text-neutral-600 mt-1">
                        Analyse des délais de traitement
                    </p>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-neutral-200">
                        <thead className="bg-neutral-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                                    Signalement
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                                    Date Création
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                                    Date Début
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                                    Date Fin
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                                    Durée (jours)
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                                    Budget
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-neutral-200">
                            {traitementStats.termine.map((item) => (
                                <tr key={item.id} className="hover:bg-neutral-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-neutral-900">
                                            {item.title}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                                        {formatDate(item.dateCreation)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                                        {formatDate(item.dateDebut)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                                        {formatDate(item.dateFin)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                            {item.duree} jours
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                                        {formatNumber(item.budget)} Ar
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Tableau des travaux en cours */}
            <div className="bg-white rounded-xl shadow-soft border border-neutral-200">
                <div className="p-6 border-b border-neutral-200">
                    <h2 className="text-xl font-bold text-neutral-900">
                        Travaux En Cours
                    </h2>
                    <p className="text-sm text-neutral-600 mt-1">
                        Suivi de l'avancement actuel
                    </p>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-neutral-200">
                        <thead className="bg-neutral-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                                    Signalement
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                                    Date Création
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                                    Date Début
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                                    Durée Actuelle
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                                    Avancement
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                                    Budget
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-neutral-200">
                            {traitementStats.enCours.map((item) => (
                                <tr key={item.id} className="hover:bg-neutral-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-neutral-900">
                                            {item.title}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                                        {formatDate(item.dateCreation)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                                        {formatDate(item.dateDebut)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                            {item.dureeActuelle} jours
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="w-full bg-neutral-200 rounded-full h-2 mr-2">
                                                <div
                                                    className="bg-orange-600 h-2 rounded-full"
                                                    style={{ width: `${item.avancement}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-sm font-medium text-neutral-900">
                                                {item.avancement}%
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                                        {formatNumber(item.budget)} Ar
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default SignalementStatistics;