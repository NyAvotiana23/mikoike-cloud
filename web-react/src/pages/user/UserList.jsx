// src/pages/user/UserList.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    PencilIcon,
    TrashIcon,
    EyeIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
} from '@heroicons/react/24/outline';
import addUserService from '../../services/api/addUserService';

const UserList = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await addUserService.getUsers();
            setUsers(data);
        } catch (error) {
            console.error('Erreur lors du chargement des utilisateurs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedUser) return;

        try {
            await addUserService.deleteUser(selectedUser.id);
            setUsers(users.filter(u => u.id !== selectedUser.id));
            setShowDeleteModal(false);
            setSelectedUser(null);
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            alert(error.message);
        }
    };

    const filteredUsers = users.filter(user =>
        user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    return (
        <div className="space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 max-w-md w-full">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon className="h-5 w-5 text-neutral-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Rechercher un utilisateur..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-body-sm"
                    />
                </div>

                <div className="flex gap-2">
                    <button className="inline-flex items-center px-3 py-2 border border-neutral-300 rounded-lg text-body-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50">
                        <FunnelIcon className="h-4 w-4 mr-2" />
                        Filtres
                    </button>
                    <button
                        onClick={() => navigate('/users/add')}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-body-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                    >
                        Ajouter un utilisateur
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg border border-neutral-200 p-4">
                    <p className="text-body-sm text-neutral-600">Total utilisateurs</p>
                    <p className="text-heading-xl font-bold text-neutral-900 mt-1">{users.length}</p>
                </div>
                <div className="bg-white rounded-lg border border-neutral-200 p-4">
                    <p className="text-body-sm text-neutral-600">Actifs ce mois</p>
                    <p className="text-heading-xl font-bold text-neutral-900 mt-1">{users.length}</p>
                </div>
                <div className="bg-white rounded-lg border border-neutral-200 p-4">
                    <p className="text-body-sm text-neutral-600">Nouveaux (7j)</p>
                    <p className="text-heading-xl font-bold text-neutral-900 mt-1">0</p>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white shadow-sm rounded-lg border border-neutral-200 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <svg className="animate-spin h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-body-md text-neutral-500">
                            {searchTerm ? 'Aucun utilisateur trouvé' : 'Aucun utilisateur'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-neutral-200">
                            <thead className="bg-neutral-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-caption font-semibold text-neutral-700 uppercase tracking-wider">
                                    Utilisateur
                                </th>
                                <th className="px-6 py-3 text-left text-caption font-semibold text-neutral-700 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-caption font-semibold text-neutral-700 uppercase tracking-wider">
                                    Âge
                                </th>
                                <th className="px-6 py-3 text-left text-caption font-semibold text-neutral-700 uppercase tracking-wider">
                                    Localisation
                                </th>
                                <th className="px-6 py-3 text-left text-caption font-semibold text-neutral-700 uppercase tracking-wider">
                                    Date création
                                </th>
                                <th className="px-6 py-3 text-right text-caption font-semibold text-neutral-700 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-neutral-200">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-neutral-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                                                        <span className="text-body-sm font-medium text-primary-700">
                                                            {user.prenom[0]}{user.nom[0]}
                                                        </span>
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-body-sm font-medium text-neutral-900">
                                                    {user.prenom} {user.nom}
                                                </div>
                                                <div className="text-caption text-neutral-500">
                                                    {user.role}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-body-sm text-neutral-900">{user.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-body-sm text-neutral-900">
                                            {user.age ? `${user.age} ans` : '-'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-body-sm text-neutral-900">
                                            {user.location || '-'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-body-sm text-neutral-900">
                                            {formatDate(user.createdAt)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-body-sm font-medium">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => navigate(`/users/${user.id}`)}
                                                className="text-primary-600 hover:text-primary-900 p-1 rounded hover:bg-primary-50"
                                                title="Voir"
                                            >
                                                <EyeIcon className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => navigate(`/users/${user.id}/edit`)}
                                                className="text-neutral-600 hover:text-neutral-900 p-1 rounded hover:bg-neutral-100"
                                                title="Modifier"
                                            >
                                                <PencilIcon className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedUser(user);
                                                    setShowDeleteModal(true);
                                                }}
                                                className="text-error-600 hover:text-error-900 p-1 rounded hover:bg-error-50"
                                                title="Supprimer"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h3 className="text-heading-lg font-bold text-neutral-900 mb-2">
                            Confirmer la suppression
                        </h3>
                        <p className="text-body-md text-neutral-600 mb-6">
                            Êtes-vous sûr de vouloir supprimer l'utilisateur{' '}
                            <strong>{selectedUser?.prenom} {selectedUser?.nom}</strong> ?
                            Cette action est irréversible.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setSelectedUser(null);
                                }}
                                className="px-4 py-2 text-body-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 text-body-sm font-medium text-white bg-error-600 rounded-lg hover:bg-error-700"
                            >
                                Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserList;