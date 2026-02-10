// src/components/NiveauInput.jsx
import React, { useState } from 'react';
import { Check, X, Edit2, AlertTriangle } from 'lucide-react';
import signalementApiService from '../services/api/signalementApiService';

const NiveauInput = ({ signalementId, currentNiveau, onNiveauUpdate }) => {
  const [isEditing, setIsEditing] = useState(currentNiveau === null || currentNiveau === undefined);
  const [niveau, setNiveau] = useState(currentNiveau || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async () => {
    if (!niveau || niveau < 1 || niveau > 10) {
      setError('Le niveau doit être entre 1 et 10');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await signalementApiService.updateNiveau(signalementId, parseInt(niveau));
      
      setIsEditing(false);
      
      if (onNiveauUpdate) {
        onNiveauUpdate();
      }
    } catch (err) {
      console.error('Erreur lors de la mise à jour du niveau:', err);
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (currentNiveau !== null && currentNiveau !== undefined) {
      setNiveau(currentNiveau);
      setIsEditing(false);
      setError(null);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  // Si le niveau n'est pas encore défini, afficher uniquement l'input
  if (currentNiveau === null || currentNiveau === undefined || isEditing) {
    return (
      <div className="flex items-center gap-2">
        <div className="relative">
          <input
            type="number"
            min="1"
            max="10"
            value={niveau}
            onChange={(e) => {
              setNiveau(e.target.value);
              setError(null);
            }}
            onKeyPress={handleKeyPress}
            disabled={loading}
            className={`w-20 px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              error ? 'border-red-500' : 'border-gray-300'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            placeholder="1-10"
            autoFocus
          />
          {error && (
            <div className="absolute top-full left-0 mt-1 w-48 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700 z-10">
              <div className="flex items-start gap-1">
                <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={handleSave}
            disabled={loading || !niveau}
            className="p-1 text-green-600 hover:bg-green-50 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Valider"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Check className="w-4 h-4" />
            )}
          </button>
          
          {(currentNiveau !== null && currentNiveau !== undefined) && (
            <button
              onClick={handleCancel}
              disabled={loading}
              className="p-1 text-red-600 hover:bg-red-50 rounded disabled:opacity-50 transition-colors"
              title="Annuler"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Si le niveau est défini, afficher la valeur avec possibilité de modifier
  return (
    <div className="flex items-center gap-2">
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
        Niveau {currentNiveau}
      </span>
      <button
        onClick={() => setIsEditing(true)}
        className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
        title="Modifier le niveau"
      >
        <Edit2 className="w-4 h-4" />
      </button>
    </div>
  );
};

export default NiveauInput;