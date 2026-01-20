// src/components/Header.jsx
import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import {
    UserCircleIcon,
    Cog6ToothIcon,
    ArrowRightOnRectangleIcon,
    BellIcon,
    MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import authService from '../services/api/authService';

const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await authService.logout();
        logout();
        navigate('/login');
    };

    return (
        <header className="bg-white border-b border-neutral-200 sticky top-0 z-50 shadow-sm">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo et titre */}
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <h1 className="text-h4 font-display text-primary-600">
                                Mikoike MDG
                            </h1>
                        </div>
                    </div>

                    {/* Barre de recherche - Centre */}
                    <div className="hidden md:block flex-1 max-w-2xl mx-8">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MagnifyingGlassIcon className="h-5 w-5 text-neutral-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                className="block w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-lg text-body-sm placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                            />
                        </div>
                    </div>

                    {/* Actions à droite */}
                    <div className="flex items-center space-x-4">
                        {/* Notifications */}
                        <button className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-all">
                            <BellIcon className="h-6 w-6" />
                        </button>

                        {/* Menu utilisateur */}
                        <Menu as="div" className="relative">
                            <Menu.Button className="flex items-center space-x-3 hover:bg-neutral-50 rounded-lg px-3 py-2 transition-all">
                                <div className="hidden md:block text-right">
                                    <p className="text-body-sm font-medium text-neutral-900">
                                        {user?.name || 'Utilisateur'}
                                    </p>
                                    <p className="text-caption text-neutral-500">
                                        {user?.role || 'Membre'}
                                    </p>
                                </div>
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-semibold">
                                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                            </Menu.Button>

                            <Transition
                                as={Fragment}
                                enter="transition ease-out duration-100"
                                enterFrom="transform opacity-0 scale-95"
                                enterTo="transform opacity-100 scale-100"
                                leave="transition ease-in duration-75"
                                leaveFrom="transform opacity-100 scale-100"
                                leaveTo="transform opacity-0 scale-95"
                            >
                                <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right bg-white rounded-lg shadow-medium ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden">
                                    <div className="px-4 py-3 border-b border-neutral-100">
                                        <p className="text-body-sm font-medium text-neutral-900">
                                            {user?.name}
                                        </p>
                                        <p className="text-caption text-neutral-500 truncate">
                                            {user?.email}
                                        </p>
                                    </div>

                                    <div className="py-1">
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button
                                                    className={`${
                                                        active ? 'bg-neutral-50' : ''
                                                    } flex items-center w-full px-4 py-2 text-body-sm text-neutral-700 transition-colors`}
                                                >
                                                    <UserCircleIcon className="h-5 w-5 mr-3 text-neutral-400" />
                                                    Mon profil
                                                </button>
                                            )}
                                        </Menu.Item>

                                        <Menu.Item>
                                            {({ active }) => (
                                                <button
                                                    className={`${
                                                        active ? 'bg-neutral-50' : ''
                                                    } flex items-center w-full px-4 py-2 text-body-sm text-neutral-700 transition-colors`}
                                                >
                                                    <Cog6ToothIcon className="h-5 w-5 mr-3 text-neutral-400" />
                                                    Paramètres
                                                </button>
                                            )}
                                        </Menu.Item>
                                    </div>

                                    <div className="py-1 border-t border-neutral-100">
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button
                                                    onClick={handleLogout}
                                                    className={`${
                                                        active ? 'bg-error-light' : ''
                                                    } flex items-center w-full px-4 py-2 text-body-sm text-error transition-colors`}
                                                >
                                                    <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
                                                    Déconnexion
                                                </button>
                                            )}
                                        </Menu.Item>
                                    </div>
                                </Menu.Items>
                            </Transition>
                        </Menu>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;