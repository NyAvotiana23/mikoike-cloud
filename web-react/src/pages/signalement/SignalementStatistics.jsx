// src/pages/signalement/SignalementStatistics.jsx
import React, { useState, useEffect } from 'react';
import {
    MapPin,
    TrendingUp,
    DollarSign,
    CheckCircle,
    AlertCircle,
    Clock,
    BarChart3,
    PieChart
} from 'lucide-react';
import signalementDataService from '../../services/api/signalementDataService';

const SignalementStatistics = () => {
    const [stats, setStats] = useState(null);
    const [roadIssues, setRoadIssues] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [statsData, issuesData] = await Promise.all([
                    signalementDataService.getStatistics(),
                    signalementDataService.getAllSignalements()
                ]);
                setStats(statsData);
                setRoadIssues(issuesData);
            } catch (error) {
                console.error('Erreur lors du chargement:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading || !stats) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    const avancement = ((stats.termine / stats.total) * 100).toFixed(1);

    // Calculer les stats par type
    const typeStats = roadIssues.reduce((acc, issue) => {
        acc[issue.type] = (acc[issue.type] || 0) + 1;
        return acc;
    }, {});

    // Calculer les stats par entreprise
    const entrepriseStats = roadIssues.reduce((acc, issue) => {
        const entreprise = issue.entreprise;
        if (!acc[entreprise]) {
            acc[entreprise] = { count: 0, budget: 0 };
        }
        acc[entreprise].count += 1;
        acc[entreprise].budget += issue.budget;
        return acc;
    }, {});

    // Budget par statut
    const budgetByStatus = roadIssues.reduce((acc, issue) => {
        acc[issue.status] = (acc[issue.status] || 0) + issue.budget;
        return acc;
    }, {});

    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Points signalés</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <MapPin className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Surface totale</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.totalSurface} m²</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Budget total</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {(stats.totalBudget / 1000000).toFixed(1)}M Ar
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                            <DollarSign className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Avancement</p>
                            <p className="text-3xl font-bold text-gray-900">{avancement}%</p>
                        </div>
                        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-emerald-600" />
                        </div>
                    </div>
                    <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${avancement}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Status Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-gray-500" />
                        Répartition par statut
                    </h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <AlertCircle className="w-6 h-6 text-red-600" />
                                <div>
                                    <span className="font-medium text-gray-700">Nouveau</span>
                                    <p className="text-sm text-gray-500">En attente de traitement</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-2xl font-bold text-red-600">{stats.nouveau}</span>
                                <p className="text-sm text-gray-500">{((stats.nouveau / stats.total) * 100).toFixed(0)}%</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Clock className="w-6 h-6 text-yellow-600" />
                                <div>
                                    <span className="font-medium text-gray-700">En cours</span>
                                    <p className="text-sm text-gray-500">Travaux en progression</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-2xl font-bold text-yellow-600">{stats.enCours}</span>
                                <p className="text-sm text-gray-500">{((stats.enCours / stats.total) * 100).toFixed(0)}%</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                                <div>
                                    <span className="font-medium text-gray-700">Terminé</span>
                                    <p className="text-sm text-gray-500">Travaux achevés</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-2xl font-bold text-green-600">{stats.termine}</span>
                                <p className="text-sm text-gray-500">{((stats.termine / stats.total) * 100).toFixed(0)}%</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Budget by Status */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-gray-500" />
                        Budget par statut
                    </h2>
                    <div className="space-y-4">
                        {Object.entries(budgetByStatus).map(([status, budget]) => {
                            const percentage = (budget / stats.totalBudget) * 100;
                            const colors = {
                                'nouveau': { bg: 'bg-red-100', bar: 'bg-red-500', text: 'text-red-700' },
                                'en cours': { bg: 'bg-yellow-100', bar: 'bg-yellow-500', text: 'text-yellow-700' },
                                'terminé': { bg: 'bg-green-100', bar: 'bg-green-500', text: 'text-green-700' }
                            };
                            const color = colors[status] || { bg: 'bg-gray-100', bar: 'bg-gray-500', text: 'text-gray-700' };

                            return (
                                <div key={status} className={`p-4 ${color.bg} rounded-lg`}>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className={`font-medium capitalize ${color.text}`}>{status}</span>
                                        <span className="font-bold text-gray-900">
                                            {(budget / 1000000).toFixed(2)}M Ar
                                        </span>
                                    </div>
                                    <div className="w-full bg-white rounded-full h-3">
                                        <div
                                            className={`${color.bar} h-3 rounded-full transition-all duration-500`}
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">{percentage.toFixed(1)}% du budget total</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Entreprises */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Répartition par entreprise</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Entreprise
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Nombre de projets
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Budget total
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    % du budget
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {Object.entries(entrepriseStats)
                                .sort((a, b) => b[1].budget - a[1].budget)
                                .map(([entreprise, data]) => (
                                    <tr key={entreprise} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {entreprise}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {data.count}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                            {(data.budget / 1000).toLocaleString()} kAr
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <div className="w-24 bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-blue-600 h-2 rounded-full"
                                                        style={{ width: `${(data.budget / stats.totalBudget) * 100}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm text-gray-600">
                                                    {((data.budget / stats.totalBudget) * 100).toFixed(1)}%
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Types de signalement */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Types de signalement</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(typeStats).map(([type, count]) => (
                        <div key={type} className="text-center p-4 bg-gray-50 rounded-lg">
                            <p className="text-3xl font-bold text-gray-900">{count}</p>
                            <p className="text-sm text-gray-600 capitalize mt-1">{type}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SignalementStatistics;
