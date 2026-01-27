// src/pages/carte/Map.jsx
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { AlertCircle, CheckCircle, Clock, Calendar, TrendingUp, DollarSign, Wrench, MapPin } from 'lucide-react';
import signalementDataService from '../../services/api/signalementDataService';

const MAP_URL = import.meta.env.MAP_SERVER_URL;

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

const Map = () => {
    const [roadIssues, setRoadIssues] = useState([]);
    const [selectedPoint, setSelectedPoint] = useState(null);
    const [loading, setLoading] = useState(true);

    // Centre d'Antananarivo
    const antananarivoCenter = [-18.8985,47.5245,  12];
    const defaultZoom = 14;

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await signalementDataService.getSignalementsForMap();
                setRoadIssues(data);
            } catch (error) {
                console.error('Erreur lors du chargement des signalements:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'nouveau': return 'bg-red-100 text-red-800';
            case 'en cours': return 'bg-yellow-100 text-yellow-800';
            case 'terminé': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'nouveau': return <AlertCircle className="w-4 h-4" />;
            case 'en cours': return <Clock className="w-4 h-4" />;
            case 'terminé': return <CheckCircle className="w-4 h-4" />;
            default: return null;
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-center h-[600px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Map Section */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Carte Interactive - Antananarivo</h2>

                <div className="relative w-full h-[600px] rounded-lg overflow-hidden">
                    <MapContainer
                        center={antananarivoCenter}
                        zoom={defaultZoom}
                        style={{ height: '100%', width: '100%' }}
                        className="rounded-lg z-0"
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="http://localhost:8081/styles/basic-preview/512/{z}/{x}/{y}.png"
                            // bounds={[47.37, -19.025, 47.679, -18.772]}
                        />

                        <MapController
                            center={selectedPoint ? [selectedPoint.lat, selectedPoint.lng] : antananarivoCenter}
                            zoom={selectedPoint ? 16 : defaultZoom}
                        />

                        {roadIssues.map((issue) => (
                            <Marker
                                key={issue.id}
                                position={[issue.lat, issue.lng]}
                                icon={createCustomIcon(issue.color, issue.icon)}
                                eventHandlers={{
                                    click: () => setSelectedPoint(issue)
                                }}
                            >
                                <Popup>
                                    <div className="min-w-[200px]">
                                        <h3 className="font-bold text-gray-900 mb-2">{issue.title}</h3>
                                        <div className="space-y-1 text-sm">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-gray-500" />
                                                <span className="text-gray-600">{issue.location}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-gray-500" />
                                                <span className="text-gray-600">{issue.date}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(issue.status)}
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(issue.status)}`}>
                                                    {issue.status}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <TrendingUp className="w-4 h-4 text-gray-500" />
                                                <span className="text-gray-600">{issue.surface} m²</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <DollarSign className="w-4 h-4 text-gray-500" />
                                                <span className="text-gray-600">{(issue.budget / 1000).toLocaleString()} kAr</span>
                                            </div>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>

                {/* Legend */}
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Légende</h3>
                    <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-red-600"></div>
                            <span>Critique / Urgent</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                            <span>Attention</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-green-600"></div>
                            <span>Terminé</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-blue-600"></div>
                            <span>Eau</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-purple-600"></div>
                            <span>Travaux en cours</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-orange-600"></div>
                            <span>Réparation</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detail Panel */}
            <div className="bg-white rounded-lg shadow">
                {!selectedPoint ? (
                    <div className="p-6">
                        <div className="text-center py-12">
                            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">Cliquez sur un marqueur pour voir les détails</p>
                        </div>
                    </div>
                ) : (
                    <div>
                        {/* Header */}
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-start gap-3">
                                <div
                                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0"
                                    style={{ backgroundColor: selectedPoint.color }}
                                >
                                    {selectedPoint.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h2 className="text-xl font-bold text-gray-900 truncate">{selectedPoint.title}</h2>
                                    <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                                        <MapPin className="w-4 h-4" />
                                        {selectedPoint.location}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-gray-500">Statut</label>
                                    <div className="mt-1">
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-sm font-medium ${getStatusColor(selectedPoint.status)}`}>
                                            {getStatusIcon(selectedPoint.status)}
                                            {selectedPoint.status}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500">Date</label>
                                    <div className="mt-1 flex items-center gap-1 text-gray-900">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm">{selectedPoint.date}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-gray-500">Surface</label>
                                    <div className="mt-1 flex items-center gap-1 text-gray-900">
                                        <TrendingUp className="w-4 h-4 text-gray-400" />
                                        <span className="font-semibold">{selectedPoint.surface} m²</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500">Budget</label>
                                    <div className="mt-1 flex items-center gap-1 text-gray-900">
                                        <DollarSign className="w-4 h-4 text-gray-400" />
                                        <span className="font-semibold">{(selectedPoint.budget / 1000).toLocaleString()} kAr</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-gray-500">Entreprise</label>
                                <div className="mt-1 flex items-center gap-2 p-2 bg-gray-50 rounded">
                                    <Wrench className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm font-medium text-gray-900">{selectedPoint.entreprise}</span>
                                </div>
                            </div>

                            {/* Actions Timeline */}
                            <div className="pt-4 border-t border-gray-200">
                                <h3 className="text-sm font-bold text-gray-900 mb-3">Historique</h3>
                                <div className="space-y-3 max-h-48 overflow-y-auto">
                                    {selectedPoint.actions.map((action, index) => (
                                        <div key={index} className="flex gap-3 text-sm">
                                            <div className="flex-shrink-0 w-2 h-2 mt-1.5 rounded-full bg-blue-500"></div>
                                            <div>
                                                <p className="text-gray-900">{action.action}</p>
                                                <p className="text-xs text-gray-500">{action.date} - {action.user}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedPoint(null)}
                                className="w-full mt-4 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Map;