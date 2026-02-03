// src/components/Sidebar.jsx
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
    HomeIcon,
    MapIcon,

    ChartBarIcon,
    Cog6ToothIcon,
    UserGroupIcon,

    ChevronDownIcon,
    ChevronRightIcon,
    ListBulletIcon,
    UserPlusIcon,
    ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@headlessui/react';

const navigation = [
    { name: 'Accueil', href: '/', icon: HomeIcon },
    { name: 'Carte', href: '/carte', icon: MapIcon },
    { name: 'Statistiques', href: '/stats', icon: ChartBarIcon },
    { name: 'Équipe', href: '/team', icon: UserGroupIcon },

];

const secondaryNavigation = [
    { name: 'Paramètres', href: '/settings', icon: Cog6ToothIcon },
];

const handleSynchroniser = ()=>{
    alert("Synchronisation des databases local et firebase");
};

const Sidebar = () => {
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(true);

    return (
        <aside className="hidden lg:flex lg:flex-shrink-0">
            <div className="flex flex-col w-64 border-r border-neutral-200 bg-white">
                {/* Navigation principale */}
                <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                    <nav className="flex-1 px-4 space-y-1">
                        <div className="space-y-1">
                            {navigation.map((item) => (
                                <NavLink
                                    key={item.name}
                                    to={item.href}
                                    className={({ isActive }) =>
                                        `group flex items-center px-3 py-2 text-body-sm font-medium rounded-lg transition-all ${
                                            isActive
                                                ? 'bg-primary-50 text-primary-700'
                                                : 'text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900'
                                        }`
                                    }
                                >
                                    {({ isActive }) => (
                                        <>
                                            <item.icon
                                                className={`mr-3 flex-shrink-0 h-6 w-6 ${
                                                    isActive
                                                        ? 'text-primary-600'
                                                        : 'text-neutral-400 group-hover:text-neutral-500'
                                                }`}
                                            />
                                            {item.name}
                                        </>
                                    )}
                                </NavLink>
                            ))}
                        </div>

                        {/* Section Gestion Utilisateur avec dropdown */}
                        <div className="pt-6">
                            <div className="border-t border-neutral-200 mb-3"></div>

                            {/* Dropdown Header */}
                            <button
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                className="w-full group flex items-center justify-between px-3 py-2 text-body-sm font-medium rounded-lg transition-all text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
                            >
                                <div className="flex items-center">
                                    <UserGroupIcon className="mr-3 flex-shrink-0 h-6 w-6 text-neutral-400 group-hover:text-neutral-500" />
                                    <span>Utilisateurs</span>
                                </div>
                                {isUserMenuOpen ? (
                                    <ChevronDownIcon className="h-4 w-4 text-neutral-400" />
                                ) : (
                                    <ChevronRightIcon className="h-4 w-4 text-neutral-400" />
                                )}
                            </button>

                            {/* Dropdown Content */}
                            {isUserMenuOpen && (
                                <div className="mt-1 ml-6 space-y-1">
                                    <NavLink
                                        to="/users"
                                        end
                                        className={({ isActive }) =>
                                            `group flex items-center px-3 py-2 text-body-sm font-medium rounded-lg transition-all ${
                                                isActive
                                                    ? 'bg-primary-50 text-primary-700'
                                                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                                            }`
                                        }
                                    >
                                        {({ isActive }) => (
                                            <>
                                                <ListBulletIcon
                                                    className={`mr-3 flex-shrink-0 h-5 w-5 ${
                                                        isActive
                                                            ? 'text-primary-600'
                                                            : 'text-neutral-400 group-hover:text-neutral-500'
                                                    }`}
                                                />
                                                Liste
                                            </>
                                        )}
                                    </NavLink>

                                    <NavLink
                                        to="/users/add"
                                        className={({ isActive }) =>
                                            `group flex items-center px-3 py-2 text-body-sm font-medium rounded-lg transition-all ${
                                                isActive
                                                    ? 'bg-primary-50 text-primary-700'
                                                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                                            }`
                                        }
                                    >
                                        {({ isActive }) => (
                                            <>
                                                <UserPlusIcon
                                                    className={`mr-3 flex-shrink-0 h-5 w-5 ${
                                                        isActive
                                                            ? 'text-primary-600'
                                                            : 'text-neutral-400 group-hover:text-neutral-500'
                                                    }`}
                                                />
                                                Ajouter
                                            </>
                                        )}
                                    </NavLink>
                                </div>
                            )}
                        </div>

                        {/* Séparateur */}
                        <div className="pt-6">
                            <div className="border-t border-neutral-200 mb-3"></div>

                            {secondaryNavigation.map((item) => (
                                <NavLink
                                    key={item.name}
                                    to={item.href}
                                    className={({ isActive }) =>
                                        `group flex items-center px-3 py-2 text-body-sm font-medium rounded-lg transition-all ${
                                            isActive
                                                ? 'bg-primary-50 text-primary-700'
                                                : 'text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900'
                                        }`
                                    }
                                >
                                    {({ isActive }) => (
                                        <>
                                            <item.icon
                                                className={`mr-3 flex-shrink-0 h-6 w-6 ${
                                                    isActive
                                                        ? 'text-primary-600'
                                                        : 'text-neutral-400 group-hover:text-neutral-500'
                                                }`}
                                            />
                                            {item.name}
                                        </>
                                    )}
                                </NavLink>
                            ))}
                            {/* Bouton Synchroniser */}
                            <Button 
                                className="w-full group flex items-center back px-3 py-2 text-body-sm font-medium rounded-lg transition-all text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 mt-1"
                                onClick={() => {
                                    handleSynchroniser();
                                }}
                            >
                                <ArrowPathIcon 
                                    className="mr-3 flex-shrink-0 h-6 w-6 text-neutral-400 group-hover:text-neutral-500" 
                                />
                                Synchroniser
                            </Button>
                        </div>
                    </nav>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;