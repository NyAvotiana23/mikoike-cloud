// src/pages/map/RoadDetail.jsx
import React from 'react';
import {X, Calendar, DollarSign, TrendingUp, Wrench, AlertCircle, CheckCircle, Clock, MapPin} from 'lucide-react';

const SignalementDetail = ({selectedPoint, onClose}) => {
    if (!selectedPoint) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="text-center py-12">
                    <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4"/>
                    <p className="text-gray-500">Sélectionnez un point sur la carte pour voir les détails</p>
                </div>
            </div>
        );
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'nouveau':
                return 'bg-red-100 text-red-800';
            case 'en cours':
                return 'bg-yellow-100 text-yellow-800';
            case 'terminé':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'nouveau':
                return <AlertCircle className="w-5 h-5"/>;
            case 'en cours':
                return <Clock className="w-5 h-5"/>;
            case 'terminé':
                return <CheckCircle className="w-5 h-5"/>;
            default:
                return null;
        }
    };

    return (
        <div className="bg-white rounded-lg shadow">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <div
                                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl"
                                style={{backgroundColor: selectedPoint.color}}
                            >
                                {selectedPoint.icon}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">{selectedPoint.title}</h2>
                                <p className="text-sm text-gray-600 flex items-center gap-1">
                                    <MapPin className="w-4 h-4"/>
                                    {selectedPoint.location}
                                </p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500"/>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
                {/* Status and Key Info */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                        <div>
                            <label className="text-sm font-medium text-gray-500">Statut</label>
                            <div className="mt-1">
                <span
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${getStatusColor(selectedPoint.status)}`}>
                  {getStatusIcon(selectedPoint.status)}
                    {selectedPoint.status}
                </span>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-500">Date de signalement</label>
                            <div className="mt-1 flex items-center gap-2 text-gray-900">
                                <Calendar className="w-4 h-4 text-gray-400"/>
                                <span className="font-medium">{selectedPoint.date}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <label className="text-sm font-medium text-gray-500">Surface affectée</label>
                            <div className="mt-1 flex items-center gap-2 text-gray-900">
                                <TrendingUp className="w-4 h-4 text-gray-400"/>
                                <span className="text-2xl font-bold">{selectedPoint.surface} m²</span>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-500">Budget estimé</label>
                            <div className="mt-1 flex items-center gap-2 text-gray-900">
                                <DollarSign className="w-4 h-4 text-gray-400"/>
                                <span
                                    className="text-2xl font-bold">{(selectedPoint.budget / 1000).toLocaleString()} Ar</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enterprise */}
                <div className="pt-4 border-t border-gray-200">
                    <label className="text-sm font-medium text-gray-500">Entreprise concernée</label>
                    <div className="mt-2 flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <Wrench className="w-5 h-5 text-gray-400"/>
                        <span className="font-medium text-gray-900">{selectedPoint.entreprise}</span>
                    </div>
                </div>

                {/* Action History */}
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
                            {selectedPoint.actions.map((action, index) => (
                                <div key={index} className="relative flex gap-4 pl-10">
                                    {/* Timeline dot */}
                                    <div
                                        className="absolute left-2.5 w-3 h-3 rounded-full ring-4 ring-white"
                                        style={{
                                            backgroundColor: index === selectedPoint.actions.length - 1 ? selectedPoint.color : '#9CA3AF'
                                        }}
                                    ></div>

                                    {/* Action content */}
                                    <div className="flex-1 bg-gray-50 rounded-lg p-4">
                                        <p className="font-medium text-gray-900 mb-2">{action.action}</p>
                                        <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5"/>
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

                {/* Summary */}
                <div className="pt-4 border-t border-gray-200 bg-blue-50 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <div
                            className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-blue-600 font-bold">ℹ</span>
                        </div>
                        <div className="flex-1">
                            <p className="font-medium text-blue-900 mb-1">Résumé du signalement</p>
                            <p className="text-sm text-blue-700">
                                Ce signalement a été créé le {selectedPoint.date} et concerne {selectedPoint.surface} m²
                                de surface routière. L'entreprise {selectedPoint.entreprise} est responsable des travaux
                                avec un budget estimé à {(selectedPoint.budget / 1000).toLocaleString()} Ar.
                                Statut actuel: <strong>{selectedPoint.status}</strong>.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignalementDetail;