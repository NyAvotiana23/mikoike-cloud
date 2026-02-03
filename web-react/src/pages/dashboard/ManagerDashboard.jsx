// ManagerDashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle,
  DollarSign,
  Users,
  Building,
  Calendar,
  Filter,
  Download
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const ManagerDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('sessionId');
      
      const response = await fetch(`${API_BASE_URL}/manager/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement du dashboard');
      }

      const data = await response.json();
      setDashboard(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error || 'Erreur de chargement'}</p>
          <button
            onClick={loadDashboard}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const { statistics, recentSignalements, signalementsByStatus, budgetByEntreprise, kpis } = dashboard;

  return (
    <div className="space-y-6 p-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Manager</h1>
          <p className="text-gray-500 mt-1">Vue d'ensemble de la gestion des signalements</p>
        </div>
        <div className="flex gap-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Filter className="w-4 h-4 mr-2" />
            Filtrer
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </button>
        </div>
      </div>

      {/* KPIs principaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Signalements</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{statistics.total}</p>
              <p className="text-xs text-green-600 mt-2">
                +{kpis.signalementsDuMois} ce mois
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Taux de résolution</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{kpis.tauxResolution}%</p>
              <p className="text-xs text-gray-500 mt-2">
                {statistics.termine} terminés / {statistics.total} total
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Budget Total</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {(statistics.totalBudget / 1000000).toFixed(1)}M
              </p>
              <p className="text-xs text-gray-500 mt-2">Ariary</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Délai Moyen</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {kpis.delaiMoyenResolution}
              </p>
              <p className="text-xs text-gray-500 mt-2">jours</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques et statistiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition par statut */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Répartition par Statut
          </h2>
          <div className="space-y-4">
            {signalementsByStatus.map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between text-sm text-gray-900 mb-1">
                  <span className="capitalize">{item.status}</span>
                  <span className="text-gray-600">
                    {item.count} ({item.percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      item.status === 'nouveau'
                        ? 'bg-red-500'
                        : item.status === 'en_cours'
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Entreprises */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Top Entreprises par Budget
          </h2>
          <div className="space-y-3">
            {budgetByEntreprise.slice(0, 5).map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Building className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{item.entrepriseNom}</p>
                    <p className="text-xs text-gray-500">
                      {item.nombreSignalements} signalements
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">
                    {(item.budgetTotal / 1000000).toFixed(2)}M
                  </p>
                  <p className="text-xs text-gray-500">Ariary</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Signalements récents */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Signalements Récents</h2>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">Tous</option>
            <option value="nouveau">Nouveau</option>
            <option value="en_cours">En cours</option>
            <option value="termine">Terminé</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Signalement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Localisation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Budget
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentSignalements.map((signalement) => (
                <tr key={signalement.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                        style={{ backgroundColor: signalement.color }}
                      >
                        {signalement.icon}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{signalement.title}</div>
                        <div className="text-sm text-gray-500">{signalement.type}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {signalement.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        signalement.status === 'nouveau'
                          ? 'bg-red-100 text-red-800'
                          : signalement.status === 'en cours'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {signalement.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {signalement.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {(signalement.budget / 1000).toLocaleString()} kAr
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Autres statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
          <Users className="w-8 h-8 mb-3 opacity-80" />
          <p className="text-sm opacity-90">Utilisateurs</p>
          <p className="text-3xl font-bold mt-1">{kpis.utilisateursTotal}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow p-6 text-white">
          <Building className="w-8 h-8 mb-3 opacity-80" />
          <p className="text-sm opacity-90">Entreprises Actives</p>
          <p className="text-3xl font-bold mt-1">{kpis.entreprisesActives}</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow p-6 text-white">
          <TrendingUp className="w-8 h-8 mb-3 opacity-80" />
          <p className="text-sm opacity-90">Surface Totale</p>
          <p className="text-3xl font-bold mt-1">
            {(statistics.totalSurface / 1000).toFixed(1)}k m²
          </p>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;