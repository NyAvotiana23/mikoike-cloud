// Updated file: src/pages/user/UserForm.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    EnvelopeIcon,
    LockClosedIcon,
    UserIcon,
} from '@heroicons/react/24/outline';
import addUserService from '../../services/api/authService';

const UserForm = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear errors when user starts typing
        if (error) setError('');
        if (success) setSuccess('');
    };

    const validateForm = () => {
        if (!formData.email || !formData.password || !formData.name) {
            setError('Les champs Email, Mot de passe et Nom sont obligatoires');
            return false;
        }

        if (!formData.email.includes('@')) {
            setError('Veuillez entrer une adresse email valide');
            return false;
        }

        if (formData.password.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caractères');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const result = await addUserService.register(formData.email, formData.password, formData.name);

            setSuccess(`Utilisateur ${result.user.name} créé avec succès !`);

            // Reset form
            setFormData({
                email: '',
                password: '',
                name: '',
            });

            // Redirect after 2 seconds
            setTimeout(() => {
                navigate('/users');
            }, 2000);

        } catch (err) {
            setError(err.message || 'Une erreur est survenue lors de la création de l\'utilisateur');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl">
            {/* Pas de header ici car déjà dans UserLayout */}

            {/* Success Message */}
            {success && (
                <div className="mb-6 bg-success-50 border border-success-200 rounded-lg p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-success-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-body-sm text-success-800">{success}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="mb-6 bg-error-50 border border-error-200 rounded-lg p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-error-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-body-sm text-error-800">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Form */}
            <div className="bg-white shadow-sm rounded-lg border border-neutral-200">
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="block text-body-sm font-medium text-neutral-700 mb-2">
                            Email <span className="text-error-600">*</span>
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <EnvelopeIcon className="h-5 w-5 text-neutral-400" />
                            </div>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="block w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-body-md"
                                placeholder="utilisateur@example.com"
                                required
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label htmlFor="password" className="block text-body-sm font-medium text-neutral-700 mb-2">
                            Mot de passe <span className="text-error-600">*</span>
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <LockClosedIcon className="h-5 w-5 text-neutral-400" />
                            </div>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="block w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-body-md"
                                placeholder="Min. 6 caractères"
                                required
                            />
                        </div>
                    </div>

                    {/* Name */}
                    <div>
                        <label htmlFor="name" className="block text-body-sm font-medium text-neutral-700 mb-2">
                            Nom <span className="text-error-600">*</span>
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <UserIcon className="h-5 w-5 text-neutral-400" />
                            </div>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="block w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-body-md"
                                placeholder="Jean Dupont"
                                required
                            />
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center justify-end space-x-4 pt-4 border-t border-neutral-200">
                        <button
                            type="button"
                            onClick={() => navigate('/users')}
                            className="px-4 py-2 text-body-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center px-4 py-2 text-body-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Création...
                                </>
                            ) : (
                                <>
                                    <UserIcon className="h-4 w-4 mr-2" />
                                    Créer l'utilisateur
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserForm;