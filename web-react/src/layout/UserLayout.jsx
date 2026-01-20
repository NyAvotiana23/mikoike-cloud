// src/layout/UserLayout.jsx
import { Outlet, NavLink } from 'react-router-dom';
import { UserGroupIcon, UserPlusIcon } from '@heroicons/react/24/outline';

const UserLayout = () => {
    return (
        <div className="space-y-6">
            {/* Header avec navigation secondaire */}
            <div className="border-b border-neutral-200 pb-4">
                <h1 className="text-heading-2xl font-bold text-neutral-900 mb-4">
                    Gestion des utilisateurs
                </h1>

                {/* Tabs Navigation */}
                <nav className="flex space-x-1">
                    <NavLink
                        to="/users"
                        end
                        className={({ isActive }) =>
                            `inline-flex items-center px-4 py-2 text-body-sm font-medium rounded-lg transition-all ${
                                isActive
                                    ? 'bg-primary-100 text-primary-700'
                                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                            }`
                        }
                    >
                        <UserGroupIcon className="h-5 w-5 mr-2" />
                        Liste des utilisateurs
                    </NavLink>
                    <NavLink
                        to="/users/add"
                        className={({ isActive }) =>
                            `inline-flex items-center px-4 py-2 text-body-sm font-medium rounded-lg transition-all ${
                                isActive
                                    ? 'bg-primary-100 text-primary-700'
                                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                            }`
                        }
                    >
                        <UserPlusIcon className="h-5 w-5 mr-2" />
                        Ajouter un utilisateur
                    </NavLink>
                </nav>
            </div>

            {/* Content Area */}
            <div>
                <Outlet />
            </div>
        </div>
    );
};

export default UserLayout;