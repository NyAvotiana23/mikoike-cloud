import { useState, useEffect } from 'react';
import { Calendar, TrendingUp, DollarSign, Layers, CheckCircle } from 'lucide-react';
// Utilisation du vrai service API exporté par défaut
import signalementApiService from '../../services/api/signalementApiService';

function SignalementStatistics() {
    const [stats, setStats] = useState(null);
    const [signalements, setSignalements] = useState([]); // Pour les tableaux détaillés
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // On récupère les stats globales ET la liste pour les tableaux
                const [statsData, listData] = await Promise.all([
                    signalementApiService.getStatistics(),
                    signalementApiService.getAllSignalements()
                ]);
                
                setStats(statsData);
                setSignalements(listData);
            } catch (err) {
                console.error("Erreur de chargement des stats", err);
                setError("Impossible de charger les statistiques.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div className="p-6">Chargement des statistiques...</div>;
    if (error) return <div className="p-6 text-red-600">{error}</div>;
    if (!stats) return <div className="p-6">Aucune donnée disponible.</div>;

    // Helpers de formatage
    const formatNumber = (num) => {
        return new Intl.NumberFormat('fr-FR').format(num);
    };

    const formatCurrency = (num) => {
        if (num === null || num === undefined) return '0 Ar';
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MGA' }).format(num);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('fr-FR');
    };

    // Filtrage des données pour les tableaux (Frontend processing)
    const terminés = signalements.filter(s => s.status && s.status.code === 'TERMINE');
    const enCours = signalements.filter(s => s.status && s.status.code === 'EN_COURS');

    return (
        <div className="p-6 space-y-6">
            {/* En-tête */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                    Tableau de Bord
                </h1>
                <p className="text-neutral-600">
                    Analyse globale et suivi budgétaire des travaux
                </p>
            </div>

            {/* Cartes de statistiques globales (Basées sur StatisticsDTO) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Signalements */}
                <div className="bg-white p-6 rounded-xl shadow-soft border border-neutral-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-neutral-600 font-medium">Total Signalements</h3>
                        <Calendar className="text-primary-600" size={24} />
                    </div>
                    <p className="text-3xl font-bold text-neutral-900">{formatNumber(stats.total)}</p>
                </div>

                {/* Avancement Global */}
                <div className="bg-white p-6 rounded-xl shadow-soft border border-neutral-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-neutral-600 font-medium">Avancement Global</h3>
                        <TrendingUp className="text-success-600" size={24} />
                    </div>
                    <p className="text-3xl font-bold text-neutral-900">{stats.avancement}%</p>
                    <div className="w-full bg-neutral-200 rounded-full h-1.5 mt-2">
                        <div className="bg-success-600 h-1.5 rounded-full" style={{ width: `${stats.avancement}%` }}></div>
                    </div>
                </div>

                {/* Surface Totale (Donnée venant du DTO: totalSurface) */}
                <div className="bg-white p-6 rounded-xl shadow-soft border border-neutral-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-neutral-600 font-medium">Surface Traitée</h3>
                        <Layers className="text-blue-600" size={24} />
                    </div>
                    <p className="text-3xl font-bold text-neutral-900">{formatNumber(stats.totalSurface)} m²</p>
                </div>

                {/* Budget Total (Donnée venant du DTO: totalBudget) */}
                <div className="bg-white p-6 rounded-xl shadow-soft border border-neutral-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-neutral-600 font-medium">Budget Engagé</h3>
                        <DollarSign className="text-warning-600" size={24} />
                    </div>
                    <p className="text-2xl font-bold text-neutral-900 truncate" title={formatCurrency(stats.totalBudget)}>
                        {formatCurrency(stats.totalBudget)}
                    </p>
                </div>
            </div>

            {/* Répartition par statut (Calculé par le Backend) */}
            <div className="bg-white p-6 rounded-xl shadow-soft border border-neutral-200">
                <h2 className="text-xl font-bold text-neutral-900 mb-4">
                    État des lieux
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-blue-600 font-medium mb-1">Nouveaux</p>
                        <p className="text-2xl font-bold text-blue-900">{stats.nouveau}</p>
                        <p className="text-sm text-blue-600">
                            {stats.total > 0 ? ((stats.nouveau / stats.total) * 100).toFixed(1) : 0}% du total
                        </p>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                        <p className="text-orange-600 font-medium mb-1">En cours</p>
                        <p className="text-2xl font-bold text-orange-900">{stats.enCours}</p>
                        <p className="text-sm text-orange-600">
                            {stats.total > 0 ? ((stats.enCours / stats.total) * 100).toFixed(1) : 0}% du total
                        </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-green-600 font-medium mb-1">Terminés</p>
                        <p className="text-2xl font-bold text-green-900">{stats.termine}</p>
                        <p className="text-sm text-green-600">
                            {stats.total > 0 ? ((stats.termine / stats.total) * 100).toFixed(1) : 0}% du total
                        </p>
                    </div>
                </div>
            </div>

            {/* Tableau des travaux terminés (Données filtrées côté client) */}
            <div className="bg-white rounded-xl shadow-soft border border-neutral-200">
                <div className="p-6 border-b border-neutral-200">
                    <h2 className="text-xl font-bold text-neutral-900">
                        Derniers Travaux Terminés
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-neutral-200">
                        <thead className="bg-neutral-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Signalement</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Région</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Statut</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-neutral-200">
                            {terminés.length > 0 ? terminés.slice(0, 5).map((item) => (
                                <tr key={item.id} className="hover:bg-neutral-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-neutral-900">{item.description}</div>
                                        <div className="text-xs text-neutral-500">{item.adresse}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                                        {formatDate(item.dateSignalement)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                                        {item.regionName || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                            Terminé
                                        </span>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-4 text-center text-sm text-neutral-500">
                                        Aucun travail terminé récemment.
                                    </td>
                                </tr>
                            )}
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
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-neutral-200">
                        <thead className="bg-neutral-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Signalement</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Date Création</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Lieu</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-neutral-200">
                            {enCours.length > 0 ? enCours.slice(0, 5).map((item) => (
                                <tr key={item.id} className="hover:bg-neutral-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-neutral-900">{item.description}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                                        {formatDate(item.dateSignalement)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                                        {item.adresse}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="3" className="px-6 py-4 text-center text-sm text-neutral-500">
                                        Aucun travail en cours.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default SignalementStatistics;