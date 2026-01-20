// src/pages/map/RoadMap.jsx
import React, { useState } from 'react';
import { MapPin, AlertCircle, CheckCircle, Clock, Wrench, DollarSign, Calendar, TrendingUp } from 'lucide-react';

const Map = ({ roadIssues, onSelectPoint, selectedPointId }) => {
    const [hoveredPoint, setHoveredPoint] = useState(null);

    const getStatusIcon = (status) => {
        switch(status) {
            case 'nouveau': return <AlertCircle className="w-4 h-4" />;
            case 'en cours': return <Clock className="w-4 h-4" />;
            case 'terminé': return <CheckCircle className="w-4 h-4" />;
            default: return null;
        }
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'nouveau': return 'bg-red-100 text-red-800';
            case 'en cours': return 'bg-yellow-100 text-yellow-800';
            case 'terminé': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Carte Interactive - Antananarivo</h2>

            <div className="relative w-full h-[600px] bg-gray-100 rounded-lg overflow-hidden">
                {/* Map Background - You can replace this with actual map imagery */}
                <div className="w-full h-full bg-gradient-to-br from-blue-50 to-green-50 relative">
                    {/* Grid overlay for map effect */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="grid grid-cols-12 grid-rows-12 h-full w-full">
                            {[...Array(144)].map((_, i) => (
                                <div key={i} className="border border-gray-400"></div>
                            ))}
                        </div>
                    </div>

                    {/* City name overlay */}
                    <div className="absolute top-4 left-4 bg-white/90 px-4 py-2 rounded-lg shadow">
                        <p className="font-bold text-gray-900">Antananarivo</p>
                        <p className="text-sm text-gray-600">Madagascar</p>
                    </div>
                </div>

                {/* Map Points */}
                {roadIssues.map((issue) => (
                    <div
                        key={issue.id}
                        className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all ${
                            selectedPointId === issue.id ? 'scale-150 z-40' : 'hover:scale-125 z-30'
                        }`}
                        style={{
                            left: `${issue.position.x}%`,
                            top: `${issue.position.y}%`
                        }}
                        onMouseEnter={() => setHoveredPoint(issue)}
                        onMouseLeave={() => setHoveredPoint(null)}
                        onClick={() => onSelectPoint(issue)}
                    >
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg border-2 ${
                                selectedPointId === issue.id ? 'border-yellow-400 ring-4 ring-yellow-200' : 'border-white'
                            }`}
                            style={{ backgroundColor: issue.color }}
                        >
                            {issue.icon}
                        </div>
                    </div>
                ))}

                {/* Hover Tooltip */}
                {hoveredPoint && hoveredPoint.id !== selectedPointId && (
                    <div
                        className="absolute z-50 bg-white rounded-lg shadow-xl p-4 w-72 border-2 pointer-events-none"
                        style={{
                            left: `${Math.min(hoveredPoint.position.x, 65)}%`,
                            top: `${Math.min(hoveredPoint.position.y + 5, 75)}%`,
                            borderColor: hoveredPoint.color
                        }}
                    >
                        <h3 className="font-bold text-gray-900 mb-2">{hoveredPoint.title}</h3>
                        <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-600">Date: {hoveredPoint.date}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {getStatusIcon(hoveredPoint.status)}
                                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(hoveredPoint.status)}`}>
                  {hoveredPoint.status}
                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-600">Surface: {hoveredPoint.surface} m²</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-600">Budget: {(hoveredPoint.budget / 1000).toLocaleString()} Ar</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Wrench className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-600 truncate">{hoveredPoint.entreprise}</span>
                            </div>
                        </div>
                    </div>
                )}
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
    );
};

export default Map;