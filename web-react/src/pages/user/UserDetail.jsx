// src/pages/user/UserDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    UserIcon,
    EnvelopeIcon,
    MapPinIcon,
    CalendarIcon,
    ArrowLeftIcon,
    PencilSquareIcon,
    TrashIcon,
} from '@heroicons/react/24/outline';
import addUserService from '../../services/api/addUserService';

const UserDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        const loadUser = async () => {
            if (id) {
                try {
                    setLoading(true);
                    const data = await addUserService.getUserById(id);
                    setUser(data);
                } catch (err) {
                    console.error('Erreur lors du chargement:', err);
                    setError(err.message || 'Erreur lors du chargement de l\'utilisateur');
                } finally {
                    setLoading(false);
                }
            }
        };
        loadUser();
    }, [id]);

    const formatDate = (dateString) => {
        if (!dateString) return 'Non renseigné';
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    };

    const handleDelete = async () => {
        try {
            await addUserService.deleteUser(id);
            navigate('/users');
        } catch (err) {
            console.error('Erreur lors de la suppression:', err);
            alert(err.message || 'Erreur lors de la suppression');
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="text-center py-12">
                    <UserIcon className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                    <p className="text-neutral-500 mb-4">{error || 'Utilisateur non trouvé'}</p>
                    <button
                        onClick={() => navigate('/users')}
                        className="text-primary-600 hover:text-primary-800 flex items-center gap-2 mx-auto"
                    >
                        <ArrowLeftIcon className="w-4 h-4" />
                        Retour à la liste
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <button
                onClick={() => navigate('/users')}
                className="mb-6 text-neutral-600 hover:text-neutral-900 flex items-center gap-2 transition-colors"
            >
                <ArrowLeftIcon className="w-5 h-5" />
                Retour à la liste
            </button>

            <div className="bg-white rounded-lg shadow border border-neutral-200">
                {/* Header */}
                <div className="p-6 border-b border-neutral-200">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
                                <UserIcon className="w-8 h-8 text-primary-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-neutral-900">
                                    {user.prenom} {user.nom}
                                </h1>
                                <p className="text-neutral-500 flex items-center gap-1 mt-1">
                                    <EnvelopeIcon className="w-4 h-4" />
                                    {user.email}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => navigate(`/users/edit/${id}`)}
                                className="inline-flex items-center px-3 py-2 border border-neutral-300 rounded-lg text-body-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 transition-colors"
                            >
                                <PencilSquareIcon className="w-4 h-4 mr-2" />
                                Modifier
                            </button>
                            <button
                                onClick={() => setShowDeleteModal(true)}
                                className="inline-flex items-center px-3 py-2 border border-red-300 rounded-lg text-body-sm font-medium text-red-700 bg-white hover:bg-red-50 transition-colors"
                            >
                                <TrashIcon className="w-4 h-4 mr-2" />
                                Supprimer
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Info Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-neutral-50 rounded-lg p-4">
                            <label className="text-sm font-medium text-neutral-500">Rôle</label>
                            <div className="mt-2">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                    user.role === 'admin' 
                                        ? 'bg-purple-100 text-purple-800' 
                                        : user.role === 'manager'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-green-100 text-green-800'
                                }`}>
                                    {user.role === 'admin' ? 'Administrateur' : user.role === 'manager' ? 'Manager' : 'Utilisateur'}
                                </span>
                            </div>
                        </div>

                        <div className="bg-neutral-50 rounded-lg p-4">
                            <label className="text-sm font-medium text-neutral-500">Date de naissance</label>
                            <div className="mt-2 flex items-center gap-2 text-neutral-900">
                                <CalendarIcon className="w-5 h-5 text-neutral-400" />
                                <span className="font-medium">
                                    {user.date_naissance ? formatDate(user.date_naissance) : (user.age ? `${user.age} ans` : 'Non renseigné')}
                                </span>
                            </div>
                        </div>

                        <div className="bg-neutral-50 rounded-lg p-4">
                            <label className="text-sm font-medium text-neutral-500">Localisation</label>
                            <div className="mt-2 flex items-center gap-2 text-neutral-900">
                                <MapPinIcon className="w-5 h-5 text-neutral-400" />
                                <span className="font-medium">{user.location || 'Non renseigné'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Additional Info */}
                    <div className="border-t border-neutral-200 pt-6">
                        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Informations supplémentaires</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-neutral-500">ID Utilisateur</label>
                                <p className="mt-1 text-neutral-900 font-mono text-sm">{user.id}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-neutral-500">Date de création</label>
                                <p className="mt-1 text-neutral-900">{formatDate(user.createdAt)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
                        <div className="fixed inset-0 transition-opacity bg-neutral-500 bg-opacity-75" onClick={() => setShowDeleteModal(false)} />

                        <div className="relative z-10 bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-red-100">
                                <TrashIcon className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                                Confirmer la suppression
                            </h3>
                            <p className="text-neutral-500 mb-6">
                                Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{user.prenom} {user.nom}</strong> ? Cette action est irréversible.
                            </p>
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700"
                                >
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserDetail;
