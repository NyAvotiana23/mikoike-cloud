// src/pages/map/RoadStats.jsx
import React from 'react';
import { MapPin, TrendingUp, DollarSign, CheckCircle, AlertCircle, Clock } from 'lucide-react';

const SignalementList = ({ roadIssues, onSelectPoint }) => {
    // Calculate statistics
    const stats = {
        total: roadIssues.length,
        totalSurface: roadIssues.reduce((sum, issue) => sum + issue.surface, 0),
        totalBudget: roadIssues.reduce((sum, issue) => sum + issue.budget, 0),
        nouveau: roadIssues.filter(i => i.status === 'nouveau').length,
        enCours: roadIssues.filter(i => i.status === 'en cours').length,
        termine: roadIssues.filter(i => i.status === 'terminé').length
    };

    const avancement = ((stats.termine / stats.total) * 100).toFixed(1);

    const getStatusColor = (status) => {
        switch(status) {
            case 'nouveau': return 'bg-red-100 text-red-800';
            case 'en cours': return 'bg-yellow-100 text-yellow-800';
            case 'terminé': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            {/* Statistics Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Points signalés</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                        <MapPin className="w-10 h-10 text-blue-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Surface totale</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.totalSurface} m²</p>
                        </div>
                        <TrendingUp className="w-10 h-10 text-green-500" />
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
                        <DollarSign className="w-10 h-10 text-purple-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Avancement</p>
                            <p className="text-3xl font-bold text-gray-900">{avancement}%</p>
                        </div>
                        <CheckCircle className="w-10 h-10 text-green-500" />
                    </div>
                </div>
            </div>

            {/* Status Breakdown */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Répartition par statut</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                            <span className="font-medium text-gray-700">Nouveau</span>
                        </div>
                        <span className="text-2xl font-bold text-red-600">{stats.nouveau}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-yellow-600" />
                            <span className="font-medium text-gray-700">En cours</span>
                        </div>
                        <span className="text-2xl font-bold text-yellow-600">{stats.enCours}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="font-medium text-gray-700">Terminé</span>
                        </div>
                        <span className="text-2xl font-bold text-green-600">{stats.termine}</span>
                    </div>
                </div>
            </div>

            {/* List of all signalements */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Liste des signalements</h2>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                    {roadIssues.map((issue) => (
                        <div
                            key={issue.id}
                            onClick={() => onSelectPoint(issue)}
                            className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                            style={{ borderLeftWidth: '4px', borderLeftColor: issue.color }}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h4 className="font-medium text-gray-900">{issue.title}</h4>
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(issue.status)}`}>
                      {issue.status}
                    </span>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-2">{issue.location}</p>
                                    <div className="flex items-center gap-4 text-xs text-gray-600">
                                        <span>📅 {issue.date}</span>
                                        <span>📏 {issue.surface} m²</span>
                                        <span>💰 {(issue.budget / 1000).toLocaleString()} Ar</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SignalementList;