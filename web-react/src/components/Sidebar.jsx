// src/components/Sidebar.tsx
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  MapIcon,
  ChartBarIcon,
  CalculatorIcon,
  Cog6ToothIcon,
  UserGroupIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ListBulletIcon,
  UserPlusIcon,
  ArrowPathIcon,
  BellIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const navigation = [
  { name: 'Accueil', href: '/', icon: HomeIcon },
  { name: 'Carte', href: '/carte', icon: MapIcon },
];

const secondaryNavigation = [
  { name: 'Paramètres', href: '/settings', icon: Cog6ToothIcon }
];

const Sidebar = () => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(true);
  const [isSignalementMenuOpen, setIsSignalementMenuOpen] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  /**
   * Fonction de synchronisation des signalements avec Firebase
   */
  const handleSynchroniser = async () => {
    try {
      setIsSyncing(true);
      const token = sessionStorage.getItem('sessionId');

      if (!token) {
        alert('Veuillez vous connecter pour synchroniser');
        return;
      }

    //   // Récupérer tous les signalements non synchronisés
    //   const response = await fetch(`${API_BASE_URL}/signalements`, {
    //     headers: {
    //       Authorization: `Bearer ${token}`,
    //       'Content-Type': 'application/json'
    //     }
    //   });

    //   if (!response.ok) {
    //     throw new Error('Erreur lors de la récupération des signalements');
    //   }

    //   const signalements = await response.json();

    //   // Synchroniser chaque signalement
    //   let syncCount = 0;
    //   let errorCount = 0;

    //   for (const signalement of signalements) {
    //     try {
          const syncResponse = await fetch(
            `${API_BASE_URL}/sync/all`,
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );

    //       if (syncResponse.ok) {
    //         syncCount++;
    //       } else {
    //         errorCount++;
    //       }
    //     } catch (err) {
    //       console.error(`Erreur sync signalement ${signalement.id}:`, err);
    //       errorCount++;
    //     }
    //   }

      // Afficher le résultat
    //   if (errorCount === 0) {
    //     alert(
    //       `✅ Synchronisation réussie!\n\n${syncCount} signalements synchronisés avec Firebase.`
    //     );
    //   } else {
    //     alert(
    //       `⚠️ Synchronisation partielle\n\n✓ ${syncCount} synchronisés\n✗ ${errorCount} erreurs`
    //     );
    //   }
    } catch (error) {
      console.error('Erreur de synchronisation:', error);
      alert('❌ Erreur lors de la synchronisation:\n' + error.message);
    } finally {
      setIsSyncing(false);
    }
  };

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

            {/* Section Signalements avec dropdown */}
            <div className="pt-6">
              <div className="border-t border-neutral-200 mb-3"></div>

              {/* Dropdown Header - Signalements */}
              <button
                onClick={() => setIsSignalementMenuOpen(!isSignalementMenuOpen)}
                className="w-full group flex items-center justify-between px-3 py-2 text-body-sm font-medium rounded-lg transition-all text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
              >
                <div className="flex items-center">
                  <BellIcon className="mr-3 flex-shrink-0 h-6 w-6 text-neutral-400 group-hover:text-neutral-500" />
                  <span>Signalements</span>
                </div>
                {isSignalementMenuOpen ? (
                  <ChevronDownIcon className="h-4 w-4 text-neutral-400" />
                ) : (
                  <ChevronRightIcon className="h-4 w-4 text-neutral-400" />
                )}
              </button>

              {/* Dropdown Content - Signalements */}
              {isSignalementMenuOpen && (
                <div className="mt-1 ml-6 space-y-1">
                  <NavLink
                    to="/carte/signalements"
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
                    to="/carte"
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
                        <MapIcon
                          className={`mr-3 flex-shrink-0 h-5 w-5 ${
                            isActive
                              ? 'text-primary-600'
                              : 'text-neutral-400 group-hover:text-neutral-500'
                          }`}
                        />
                        Carte
                      </>
                    )}
                  </NavLink>
                </div>
              )}
            </div>

            {/* Section Gestion Utilisateur avec dropdown */}
            <div className="pt-3">
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
              <NavLink
                    to="/configurations"
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
                        <CalculatorIcon
                          className={`mr-3 flex-shrink-0 h-5 w-5 ${
                            isActive
                              ? 'text-primary-600'
                              : 'text-neutral-400 group-hover:text-neutral-500'
                          }`}
                        />
                        Configurations
                      </>
                    )}
                  </NavLink>
              

              {/* Bouton Synchroniser */}
              <button
                className="w-full group flex items-center px-3 py-2 text-body-sm font-medium rounded-lg transition-all text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSynchroniser}
                disabled={isSyncing}
              >
                <ArrowPathIcon
                  className={`mr-3 flex-shrink-0 h-6 w-6 text-neutral-400 group-hover:text-neutral-500 ${
                    isSyncing ? 'animate-spin' : ''
                  }`}
                />
                {isSyncing ? 'Synchronisation...' : 'Synchroniser'}
              </button>
            </div>
          </nav>
        </div>

        {/* Footer - Status de sync */}
        <div className="flex-shrink-0 border-t border-neutral-200 p-4">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}
            ></div>
            <span className="text-xs text-neutral-600">
              {isSyncing ? 'Synchronisation...' : 'Synchronisé'}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;