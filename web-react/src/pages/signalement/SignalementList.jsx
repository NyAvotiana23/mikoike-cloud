// src/pages/signalement/SignalementList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    AlertCircle,
    CheckCircle,
    Clock,
    MapPin,
    Search,
    Filter,
    Eye,
    ChevronUp,
    ChevronDown,
    ArrowUpDown
} from 'lucide-react';
import signalementDataService from '../../services/api/signalementDataService';

const SignalementList = () => {
    const [roadIssues, setRoadIssues] = useState([]);
    const [filteredIssues, setFilteredIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
    const navigate = useNavigate();

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await signalementDataService.getAllSignalements();
                setRoadIssues(data);
                setFilteredIssues(data);
            } catch (error) {
                console.error('Erreur lors du chargement:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // Filtrage et recherche
    useEffect(() => {
        let result = [...roadIssues];

        // Filtre par statut
        if (statusFilter !== 'all') {
            result = result.filter(issue => issue.status === statusFilter);
        }

        // Recherche
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            result = result.filter(issue =>
                issue.title.toLowerCase().includes(search) ||
                issue.location.toLowerCase().includes(search) ||
                issue.entreprise.toLowerCase().includes(search)
            );
        }

        // Tri
        result.sort((a, b) => {
            let aValue = a[sortConfig.key];
            let bValue = b[sortConfig.key];

            if (sortConfig.key === 'date') {
                aValue = new Date(aValue);
                bValue = new Date(bValue);
            }

            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });

        setFilteredIssues(result);
    }, [roadIssues, searchTerm, statusFilter, sortConfig]);

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'nouveau': return 'bg-red-100 text-red-800';
            case 'en cours': return 'bg-yellow-100 text-yellow-800';
            case 'terminé': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'nouveau': return <AlertCircle className="w-4 h-4" />;
            case 'en cours': return <Clock className="w-4 h-4" />;
            case 'terminé': return <CheckCircle className="w-4 h-4" />;
            default: return null;
        }
    };

    const SortIcon = ({ columnKey }) => {
        if (sortConfig.key !== columnKey) {
            return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
        }
        return sortConfig.direction === 'asc'
            ? <ChevronUp className="w-4 h-4 text-blue-600" />
            : <ChevronDown className="w-4 h-4 text-blue-600" />;
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header avec filtres */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <h2 className="text-xl font-bold text-gray-900">Liste des Signalements</h2>

                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                            >
                                <option value="all">Tous les statuts</option>
                                <option value="nouveau">Nouveau</option>
                                <option value="en cours">En cours</option>
                                <option value="terminé">Terminé</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <button
                                        onClick={() => handleSort('title')}
                                        className="flex items-center gap-1 hover:text-gray-700"
                                    >
                                        Signalement
                                        <SortIcon columnKey="title" />
                                    </button>
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <button
                                        onClick={() => handleSort('location')}
                                        className="flex items-center gap-1 hover:text-gray-700"
                                    >
                                        Localisation
                                        <SortIcon columnKey="location" />
                                    </button>
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <button
                                        onClick={() => handleSort('status')}
                                        className="flex items-center gap-1 hover:text-gray-700"
                                    >
                                        Statut
                                        <SortIcon columnKey="status" />
                                    </button>
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <button
                                        onClick={() => handleSort('date')}
                                        className="flex items-center gap-1 hover:text-gray-700"
                                    >
                                        Date
                                        <SortIcon columnKey="date" />
                                    </button>
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <button
                                        onClick={() => handleSort('surface')}
                                        className="flex items-center gap-1 hover:text-gray-700"
                                    >
                                        Surface
                                        <SortIcon columnKey="surface" />
                                    </button>
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <button
                                        onClick={() => handleSort('budget')}
                                        className="flex items-center gap-1 hover:text-gray-700"
                                    >
                                        Budget
                                        <SortIcon columnKey="budget" />
                                    </button>
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Entreprise
                                </th>
                                <th scope="col" className="relative px-6 py-3">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredIssues.map((issue) => (
                                <tr key={issue.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                                                style={{ backgroundColor: issue.color }}
                                            >
                                                {issue.icon}
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{issue.title}</div>
                                                <div className="text-sm text-gray-500">{issue.type}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-1 text-sm text-gray-900">
                                            <MapPin className="w-4 h-4 text-gray-400" />
                                            {issue.location}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                                            {getStatusIcon(issue.status)}
                                            {issue.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {issue.date}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {issue.surface} m²
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                        {(issue.budget / 1000).toLocaleString()} kAr
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {issue.entreprise}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => navigate(`/carte/signalements/${issue.id}`)}
                                            className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                                        >
                                            <Eye className="w-4 h-4" />
                                            Voir
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer avec compteur */}
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                    <p className="text-sm text-gray-700">
                        Affichage de <span className="font-medium">{filteredIssues.length}</span> sur{' '}
                        <span className="font-medium">{roadIssues.length}</span> signalements
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignalementList;

