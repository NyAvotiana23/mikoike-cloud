// Updated file: src/pages/Login.jsx
// src/pages/Login.jsx
import {useState} from 'react';
import {useNavigate, Link} from 'react-router-dom';
import {EnvelopeIcon, LockClosedIcon, ExclamationCircleIcon, EyeIcon, EyeSlashIcon} from '@heroicons/react/24/outline';
import {useAuth} from '../contexts/AuthContext';
import authService from '../services/api/authService';

const Login = () => {
    const navigate = useNavigate();
    const {login} = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [serverError, setServerError] = useState('');

    // Gestion des changements dans les champs
    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));

        // Effacer l'erreur du champ modifié
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: '',
            }));
        }

        // Effacer l'erreur serveur
        if (serverError) {
            setServerError('');
        }
    };

    // Validation du formulaire
    const validateForm = () => {
        const newErrors = {};

        // Email
        if (!formData.email) {
            newErrors.email = 'L\'email est requis';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'L\'email n\'est pas valide';
        }

        // Password
        if (!formData.password) {
            newErrors.password = 'Le mot de passe est requis';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Soumission du formulaire
    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError('');

        // Validation
        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            // Appel au service d'authentification
            const {user, sessionId} = await authService.login(
                formData.email,
                formData.password
            );

            // Stocker le token et l'userId dans le sessionStorage
            sessionStorage.setItem('sessionId', sessionId);
            sessionStorage.setItem('userId', user.id);

            // Sauvegarder dans le contexte
            login(user, sessionId);

            // Redirection vers la page d'accueil
            navigate('/');
        } catch (error) {
            setServerError(error.message || 'Une erreur est survenue lors de la connexion');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <h2 className="text-display-md font-display text-neutral-900">
                        Connexion
                    </h2>
                    <p className="mt-2 text-body text-neutral-600">
                        Accédez à votre compte
                    </p>
                </div>

                {/* Erreur serveur */}
                {serverError && (
                    <div className="bg-error-light border-l-4 border-error p-4 rounded-lg animate-slide-down">
                        <div className="flex items-start">
                            <ExclamationCircleIcon className="h-5 w-5 text-error mt-0.5 mr-3 flex-shrink-0"/>
                            <div className="flex-1">
                                <p className="text-body-sm text-error-dark font-medium">
                                    {serverError}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Formulaire */}
                <form onSubmit={handleSubmit} className="mt-8 space-y-6 bg-white p-8 rounded-2xl shadow-soft">
                    <div className="space-y-4">
                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-label text-neutral-700 mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400"/>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                                        errors.email ? 'border-error' : 'border-neutral-300'
                                    }`}
                                    placeholder="votre@email.com"
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-2 text-body-sm text-error flex items-center animate-slide-down">
                                    <ExclamationCircleIcon className="h-4 w-4 mr-1"/>
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-label text-neutral-700 mb-2">
                                Mot de passe
                            </label>
                            <div className="relative">
                                <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400"/>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`block w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                                        errors.password ? 'border-error' : 'border-neutral-300'
                                    }`}
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeSlashIcon className="h-5 w-5"/>
                                    ) : (
                                        <EyeIcon className="h-5 w-5"/>
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-2 text-body-sm text-error flex items-center animate-slide-down">
                                    <ExclamationCircleIcon className="h-4 w-4 mr-1"/>
                                    {errors.password}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Options */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-body-sm text-neutral-700">
                                Se souvenir de moi
                            </label>
                        </div>

                        <div className="text-body-sm">
                            <Link
                                to="/forgot-password"
                                className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                            >
                                Mot de passe oublié ?
                            </Link>
                        </div>
                    </div>

                    {/* Bouton de soumission */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`
              w-full flex justify-center items-center
              py-3 px-4 border border-transparent rounded-lg
              text-label-lg text-white
              bg-gradient-to-r from-primary-600 to-primary-700
              hover:from-primary-700 hover:to-primary-800
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200
              shadow-soft hover:shadow-medium
              ${loading ? 'cursor-wait' : ''}
            `}
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                     xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                            strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor"
                                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Connexion en cours...
                            </>
                        ) : (
                            'Se connecter'
                        )}
                    </button>
                </form>

                {/* Info de test */}
                <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 text-center">
                    <p className="text-body-sm text-primary-800 font-medium">
                        Mode Test
                    </p>
                    <p className="text-caption text-primary-700 mt-1">
                        Email: <span className="font-mono font-semibold">test@gmail.com</span> |
                        Mot de passe: <span className="font-mono font-semibold">test</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;