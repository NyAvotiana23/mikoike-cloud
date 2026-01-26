// src/layout/CarteLayout.jsx
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Map, List, BarChart3 } from 'lucide-react';

const CarteLayout = () => {
    const location = useLocation();

    const navItems = [
        {
            path: '/carte',
            label: 'Vue Carte',
            icon: Map,
            end: true
        },
        {
            path: '/carte/signalements',
            label: 'Liste des Signalements',
            icon: List,
            end: false
        },
        {
            path: '/carte/statistiques',
            label: 'Statistiques',
            icon: BarChart3,
            end: false
        }
    ];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Gestion des Signalements Routiers</h1>
                <p className="text-gray-600 mt-1">
                    Suivi et gestion des travaux routiers de la ville d'Antananarivo
                </p>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-gray-200">
                <nav className="flex space-x-8">
                {navItems.map((item) => {
                        const Icon = item.icon;

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.end}
                                className={({ isActive }) => `
                                    flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                                    ${isActive 
                                        ? 'border-blue-500 text-blue-600' 
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                                `}
                            >
                                <Icon className="w-5 h-5" />
                                {item.label}
                            </NavLink>
                        );
                    })}
                </nav>
            </div>

            {/* Content Area */}
            <div className="min-h-[600px]">
                <Outlet />
            </div>
        </div>
    );
};

export default CarteLayout;
