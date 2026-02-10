// src/pages/VisitorMap.jsx
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Calendar,
  TrendingUp,
  DollarSign,
  Wrench,
  MapPin,
  XCircle,
  Image as ImageIcon,
  Eye,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import signalementApiService from '../services/api/signalementApiService';

// Fix for default marker icons in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom marker icon creator
const createCustomIcon = (color, icon) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 16px;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">${icon}</div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18]
  });
};

const MAP_URL = import.meta.env.VITE_MAP_SERVER_URL;

// Component to handle map center changes
const MapController = ({ center, zoom }) => {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);

  return null;
};

const VisitorMap = () => {
  const [roadIssues, setRoadIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [selectedIssueForPhoto, setSelectedIssueForPhoto] = useState(null);

  // Centre d'Antananarivo
  const antananarivoCenter = [-18.8792, 47.5079];
  const defaultZoom = 13;

  useEffect(() => {
    loadSignalements();
  }, []);

  const loadSignalements = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await signalementApiService.getSignalementsForMap();
      setRoadIssues(data);
    } catch (error) {
      console.error('Erreur lors du chargement des signalements:', error);
      setError(error.message || 'Impossible de charger les signalements');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'nouveau':
        return 'bg-red-100 text-red-800';
      case 'en cours':
      case 'en_cours':
        return 'bg-yellow-100 text-yellow-800';
      case 'terminé':
      case 'termine':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'nouveau':
        return <AlertCircle className="w-3 h-3" />;
      case 'en cours':
      case 'en_cours':
        return <Clock className="w-3 h-3" />;
      case 'terminé':
      case 'termine':
        return <CheckCircle className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status) => {
    switch (status.toLowerCase()) {
      case 'nouveau':
        return 'Nouveau';
      case 'en cours':
      case 'en_cours':
        return 'En cours';
      case 'terminé':
      case 'termine':
        return 'Terminé';
      default:
        return status;
    }
  };

  // Calcul des statistiques
  const stats = {
    totalPoints: roadIssues.length,
    totalSurface: roadIssues.reduce((sum, issue) => sum + (issue.surface || 0), 0),
    totalBudget: roadIssues.reduce((sum, issue) => sum + (issue.budget || 0), 0),
    completed: roadIssues.filter(s => s.status.toLowerCase().includes('termin')).length,
  };

  const progressPercentage = stats.totalPoints > 0
    ? Math.round((stats.completed / stats.totalPoints) * 100)
    : 0;

  const handleViewPhotos = (issue) => {
    setSelectedIssueForPhoto(issue);
    setPhotoModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Chargement de la carte...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-2xl shadow-lg p-8 max-w-md">
          <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur de chargement</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={loadSignalements}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Carte des Signalements Routiers
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Vue publique - Antananarivo
              </p>
            </div>
            <Link
              to="/login"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à la connexion
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tableau récapitulatif */}
        <div className="mb-6 bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Tableau Récapitulatif</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Nombre de points */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-blue-700">Nombre de points</p>
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-blue-900">{stats.totalPoints}</p>
              <p className="text-xs text-blue-600 mt-1">signalements actifs</p>
            </div>

            {/* Surface totale */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-purple-700">Surface totale</p>
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-3xl font-bold text-purple-900">
                {stats.totalSurface.toLocaleString()}
              </p>
              <p className="text-xs text-purple-600 mt-1">mètres carrés</p>
            </div>

            {/* Budget total */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-lg border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-green-700">Budget total</p>
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-green-900">
                {(stats.totalBudget / 1000000).toFixed(1)}M
              </p>
              <p className="text-xs text-green-600 mt-1">Ariary</p>
            </div>

            {/* Avancement */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-5 rounded-lg border border-orange-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-orange-700">Avancement</p>
                <CheckCircle className="w-5 h-5 text-orange-600" />
              </div>
              <p className="text-3xl font-bold text-orange-900">{progressPercentage}%</p>
              <div className="mt-2">
                <div className="w-full bg-orange-200 rounded-full h-2">
                  <div
                    className="bg-orange-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-orange-600 mt-1">
                  {stats.completed} / {stats.totalPoints} terminés
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Carte */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Carte Interactive</h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Eye className="w-4 h-4" />
              <span>Survolez les marqueurs pour voir les détails</span>
            </div>
          </div>

          <div className="relative w-full h-[600px] rounded-lg overflow-hidden shadow-inner">
            <MapContainer
              center={antananarivoCenter}
              zoom={defaultZoom}
              style={{ height: '100%', width: '100%' }}
              className="rounded-lg z-0"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url={MAP_URL}
              />

              {roadIssues.map((issue) => (
                <Marker
                  key={issue.id}
                  position={[issue.coordinates.lat, issue.coordinates.lng]}
                  icon={createCustomIcon(issue.color, issue.icon)}
                >
                  <Tooltip permanent={false} direction="top" offset={[0, -20]}>
                    <div className="min-w-[280px] p-1">
                      <h3 className="font-bold text-gray-900 mb-2 text-base">
                        {issue.title}
                      </h3>
                      
                      <div className="space-y-2">
                        {/* Date */}
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          <span className="text-gray-700">
                            <span className="font-medium">Date:</span> {issue.date}
                          </span>
                        </div>

                        {/* Statut */}
                        <div className="flex items-center gap-2 text-sm">
                          {getStatusIcon(issue.status)}
                          <span className="text-gray-700">
                            <span className="font-medium">Statut:</span>{' '}
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(issue.status)}`}>
                              {getStatusLabel(issue.status)}
                            </span>
                          </span>
                        </div>

                        {/* Surface */}
                        <div className="flex items-center gap-2 text-sm">
                          <TrendingUp className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          <span className="text-gray-700">
                            <span className="font-medium">Surface:</span> {issue.surface} m²
                          </span>
                        </div>

                        {/* Budget */}
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          <span className="text-gray-700">
                            <span className="font-medium">Budget:</span>{' '}
                            {(issue.budget / 1000).toLocaleString()} kAr
                          </span>
                        </div>

                        {/* Entreprise */}
                        <div className="flex items-center gap-2 text-sm">
                          <Wrench className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          <span className="text-gray-700">
                            <span className="font-medium">Entreprise:</span> {issue.entreprise}
                          </span>
                        </div>
                        

                        {/* Niveau */}
                        {issue.niveau && (
                          <div className="flex items-center gap-2 text-sm">
                            <AlertCircle className="w-4 h-4 text-gray-500 flex-shrink-0" />
                            <span className="text-gray-700">
                              <span className="font-medium">Niveau:</span> {issue.niveau}
                            </span>
                          </div>
                        )}

                        {/* Lien photos */}
                        <div className="pt-2 border-t border-gray-200">
                          <button
                            onClick={() => handleViewPhotos(issue)}
                            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                          >
                            <ImageIcon className="w-4 h-4" />
                            Voir les photos
                          </button>
                        </div>
                      </div>
                    </div>
                  </Tooltip>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {/* Légende */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Légende des statuts</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-600"></div>
                <span className="text-gray-700">Nouveau</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-yellow-600"></div>
                <span className="text-gray-700">En cours</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-600"></div>
                <span className="text-gray-700">Terminé</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Photos */}
      {photoModalOpen && selectedIssueForPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">
                  Photos - {selectedIssueForPhoto.title}
                </h3>
                <button
                  onClick={() => setPhotoModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((index) => (
                  <div key={index} className="aspect-video rounded-lg overflow-hidden shadow-md">
                    <img
                      src={`https://picsum.photos/seed/road${selectedIssueForPhoto.id}-${index}/600/400`}
                      alt={`Photo ${index} - ${selectedIssueForPhoto.title}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setPhotoModalOpen(false)}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisitorMap;