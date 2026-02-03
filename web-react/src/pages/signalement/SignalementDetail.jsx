// SignalementDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Calendar,
  DollarSign,
  TrendingUp,
  Wrench,
  MapPin,
  ArrowLeft,
  RefreshCw,
  Edit
} from 'lucide-react';
import signalementApiService from '../../services/api/signalementApiService';
import StatusSelector from '../../components/StatusSelector';

const SignalementDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [signalement, setSignalement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (id) {
      loadSignalement(parseInt(id));
    }
  }, [id]);

  const loadSignalement = async (signalementId) => {
    try {
      setLoading(true);
      setError(null);
      const data = await signalementApiService.getSignalementById(signalementId);
      
      if (!data) {
        setError('Signalement non trouvé');
        return;
      }
      
      setSignalement(data);
    } catch (err) {
      console.error('Erreur lors du chargement:', err);
      setError(err.message || 'Erreur lors du chargement du signalement');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!id) return;
    
    // Recharger le signalement pour obtenir les données à jour
    await loadSignalement(parseInt(id));
  };

  const handleSynchronize = async () => {
    if (!id) return;
    
    try {
      setSyncing(true);
      const token = sessionStorage.getItem('sessionId');
      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/signalements/${id}/synchroniser`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Erreur lors de la synchronisation');
      }

      const updated = await response.json();
      setSignalement(updated);
      
      // Afficher un message de succès
      alert('Synchronisation réussie avec Firebase');
    } catch (err) {
      console.error('Erreur de synchronisation:', err);
      alert('Erreur lors de la synchronisation: ' + err.message);
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement du signalement...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !signalement) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-12">
          <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">{error || 'Signalement non trouvé'}</p>
          <button
            onClick={() => navigate('/carte/signalements')}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
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
        onClick={() => navigate('/carte/signalements')}
        className="mb-6 text-gray-600 hover:text-gray-900 flex items-center gap-2 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Retour à la liste
      </button>

      <div className="bg-white rounded-lg shadow border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-2xl"
                style={{ backgroundColor: signalement.color }}
              >
                {signalement.icon}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{signalement.title}</h1>
                <p className="text-gray-600 flex items-center gap-1 mt-1">
                  <MapPin className="w-4 h-4" />
                  {signalement.location}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSynchronize}
                disabled={syncing}
                className="inline-flex items-center px-3 py-2 border border-blue-300 rounded-lg text-sm font-medium text-blue-700 bg-white hover:bg-blue-50 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                Synchroniser
              </button>
              <button
                onClick={() => navigate(`/carte/signalements/${id}/edit`)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <Edit className="w-4 h-4 mr-2" />
                Modifier
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status and Key Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="text-sm font-medium text-gray-500 mb-2 block">
                Statut
              </label>
              <StatusSelector
                signalementId={signalement.id}
                currentStatus={signalement.status}
                onStatusChange={handleStatusChange}
              />
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <label className="text-sm font-medium text-gray-500">Date de signalement</label>
              <div className="mt-2 flex items-center gap-2 text-gray-900">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span className="font-medium text-lg">{signalement.date}</span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <label className="text-sm font-medium text-gray-500">Surface affectée</label>
              <div className="mt-2 flex items-center gap-2 text-gray-900">
                <TrendingUp className="w-5 h-5 text-gray-400" />
                <span className="text-2xl font-bold">{signalement.surface} m²</span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <label className="text-sm font-medium text-gray-500">Budget estimé</label>
              <div className="mt-2 flex items-center gap-2 text-gray-900">
                <DollarSign className="w-5 h-5 text-gray-400" />
                <span className="text-2xl font-bold">
                  {(signalement.budget / 1000).toLocaleString()} kAr
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          {signalement.description && (
            <div className="bg-blue-50 rounded-lg p-4">
              <label className="text-sm font-medium text-blue-700">Description</label>
              <p className="mt-2 text-gray-700">{signalement.description}</p>
            </div>
          )}

          {/* Enterprise */}
          <div className="pt-4 border-t border-gray-200">
            <label className="text-sm font-medium text-gray-500">Entreprise concernée</label>
            <div className="mt-2 flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Wrench className="w-6 h-6 text-gray-400" />
              <span className="font-medium text-gray-900 text-lg">{signalement.entreprise}</span>
            </div>
          </div>

          {/* Coordonnées GPS */}
          <div className="pt-4 border-t border-gray-200">
            <label className="text-sm font-medium text-gray-500 mb-3 block">
              Coordonnées GPS
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Latitude</p>
                <p className="text-lg font-mono font-medium text-gray-900">
                  {signalement.lat.toFixed(6)}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Longitude</p>
                <p className="text-lg font-mono font-medium text-gray-900">
                  {signalement.lng.toFixed(6)}
                </p>
              </div>
            </div>
          </div>

          {/* Action History */}
          {signalement.actions && signalement.actions.length > 0 && (
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-blue-500 rounded"></div>
                Historique des actions
              </h3>
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                {/* Actions */}
                <div className="space-y-6">
                  {signalement.actions.map((action, index) => (
                    <div key={index} className="relative flex gap-4 pl-10">
                      {/* Timeline dot */}
                      <div
                        className="absolute left-2.5 w-3 h-3 rounded-full ring-4 ring-white"
                        style={{
                          backgroundColor:
                            index === signalement.actions.length - 1
                              ? signalement.color
                              : '#9CA3AF'
                        }}
                      ></div>

                      {/* Action content */}
                      <div className="flex-1 bg-gray-50 rounded-lg p-4">
                        <p className="font-medium text-gray-900 mb-2">{action.action}</p>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {action.date}
                          </span>
                          <span className="text-gray-400">•</span>
                          <span className="font-medium text-gray-700">{action.user}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="pt-4 border-t border-gray-200 bg-blue-50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold">ℹ</span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-blue-900 mb-1">Résumé du signalement</p>
                <p className="text-sm text-blue-700">
                  Ce signalement a été créé le {signalement.date} et concerne{' '}
                  {signalement.surface} m² de surface routière. L'entreprise{' '}
                  {signalement.entreprise} est responsable des travaux avec un budget estimé
                  à {(signalement.budget / 1000).toLocaleString()} kAr. Statut actuel:{' '}
                  <strong>{signalement.status}</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignalementDetail;