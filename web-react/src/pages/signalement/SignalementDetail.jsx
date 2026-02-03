// src/pages/signalement/SignalementDetail.jsx
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, DollarSign, Building2, Clock } from 'lucide-react';
import SignalementService from '../../services/api/signalementService';

function SignalementDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const signalement = SignalementService.getSignalementById(parseInt(id));

    if (!signalement) {
        return (
            <div className="p-6">
                <div className="bg-white rounded-xl shadow-soft p-8 text-center">
                    <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                        Signalement introuvable
                    </h2>
                    <button
                        onClick={() => navigate('/carte/signalements')}
                        className="text-primary-600 hover:text-primary-800"
                    >
                        Retour à la liste
                    </button>
                </div>
            </div>
        );
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'nouveau':
                return 'bg-blue-100 text-blue-800';
            case 'en cours':
                return 'bg-orange-100 text-orange-800';
            case 'terminé':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-neutral-100 text-neutral-800';
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    const formatNumber = (num) => {
        return new Intl.NumberFormat('fr-FR').format(num);
    };

    const calculerDuree = () => {
        if (!signalement.dateDebut) return null;
        
        const debut = new Date(signalement.dateDebut);
        const fin = signalement.dateFin ? new Date(signalement.dateFin) : new Date();
        const jours = Math.floor((fin - debut) / (1000 * 60 * 60 * 24));
        
        return jours;
    };

    return (
        <div className="p-6">
            {/* Bouton retour */}
            <button
                onClick={() => navigate('/carte/signalements')}
                className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-6"
            >
                <ArrowLeft size={20} />
                Retour à la liste
            </button>

            {/* En-tête */}
            <div className="bg-white rounded-xl shadow-soft border border-neutral-200 p-6 mb-6">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span
                                className="text-3xl p-3 rounded-xl"
                                style={{ backgroundColor: `${signalement.color}20` }}
                            >
                                {signalement.icon}
                            </span>
                            <div>
                                <h1 className="text-3xl font-bold text-neutral-900">
                                    {signalement.title}
                                </h1>
                                <p className="text-neutral-600 flex items-center gap-2 mt-1">
                                    <MapPin size={16} />
                                    {signalement.location}
                                </p>
                            </div>
                        </div>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(signalement.status)}`}>
                        {signalement.status}
                    </span>
                </div>

                {/* Barre de progression */}
                <div className="mt-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-neutral-700">Avancement</span>
                        <span className="text-sm font-bold text-neutral-900">{signalement.avancement}%</span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-3">
                        <div
                            className="bg-primary-600 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${signalement.avancement}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Informations principales */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Dates importantes */}
                    <div className="bg-white rounded-xl shadow-soft border border-neutral-200 p-6">
                        <h2 className="text-xl font-bold text-neutral-900 mb-4">
                            Dates Importantes
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <Calendar className="text-blue-600" size={20} />
                                    <span className="text-sm font-medium text-blue-600">Création</span>
                                </div>
                                <p className="text-lg font-bold text-blue-900">
                                    {formatDate(signalement.dateCreation)}
                                </p>
                            </div>
                            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <Clock className="text-orange-600" size={20} />
                                    <span className="text-sm font-medium text-orange-600">Début Travaux</span>
                                </div>
                                <p className="text-lg font-bold text-orange-900">
                                    {formatDate(signalement.dateDebut)}
                                </p>
                            </div>
                            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <Calendar className="text-green-600" size={20} />
                                    <span className="text-sm font-medium text-green-600">Fin Travaux</span>
                                </div>
                                <p className="text-lg font-bold text-green-900">
                                    {formatDate(signalement.dateFin)}
                                </p>
                            </div>
                        </div>
                        {calculerDuree() !== null && (
                            <div className="mt-4 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                                <p className="text-sm text-neutral-600">
                                    Durée {signalement.status === 'terminé' ? 'totale' : 'actuelle'}:
                                    <span className="ml-2 text-lg font-bold text-neutral-900">
                                        {calculerDuree()} jours
                                    </span>
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Historique des actions */}
                    <div className="bg-white rounded-xl shadow-soft border border-neutral-200 p-6">
                        <h2 className="text-xl font-bold text-neutral-900 mb-4">
                            Historique des Actions
                        </h2>
                        <div className="space-y-4">
                            {signalement.actions.map((action, index) => (
                                <div key={index} className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className="w-3 h-3 bg-primary-600 rounded-full"></div>
                                        {index < signalement.actions.length - 1 && (
                                            <div className="w-0.5 h-full bg-neutral-200 mt-1"></div>
                                        )}
                                    </div>
                                    <div className="flex-1 pb-6">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-semibold text-neutral-900">
                                                {action.action}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-neutral-600">
                                            <span className="flex items-center gap-1">
                                                <Calendar size={14} />
                                                {new Date(action.date).toLocaleDateString('fr-FR')}
                                            </span>
                                            <span>•</span>
                                            <span>{action.user}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Informations complémentaires */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-soft border border-neutral-200 p-6">
                        <h2 className="text-xl font-bold text-neutral-900 mb-4">
                            Détails du Projet
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <Building2 className="text-neutral-600" size={18} />
                                    <span className="text-sm font-medium text-neutral-600">Entreprise</span>
                                </div>
                                <p className="text-neutral-900 font-semibold ml-6">
                                    {signalement.entreprise}
                                </p>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <MapPin className="text-neutral-600" size={18} />
                                    <span className="text-sm font-medium text-neutral-600">Surface</span>
                                </div>
                                <p className="text-neutral-900 font-semibold ml-6">
                                    {formatNumber(signalement.surface)} m²
                                </p>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <DollarSign className="text-neutral-600" size={18} />
                                    <span className="text-sm font-medium text-neutral-600">Budget</span>
                                </div>
                                <p className="text-neutral-900 font-semibold ml-6">
                                    {formatNumber(signalement.budget)} Ar
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SignalementDetail;