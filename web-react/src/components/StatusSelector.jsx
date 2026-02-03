// src/components/StatusSelector.jsx
import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check, Clock, AlertCircle, CheckCircle } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

/**
 * Composant pour changer le statut d'un signalement
 * @param {Object} props
 * @param {number} props.signalementId - ID du signalement
 * @param {string} props.currentStatus - Code du statut actuel
 * @param {Function} [props.onStatusChange] - Callback appelé après changement
 * @param {boolean} [props.disabled=false] - Désactiver le sélecteur
 */
const StatusSelector = ({
  signalementId,
  currentStatus,
  onStatusChange,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [statusOptions, setStatusOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Fermer le dropdown si on clique à l'extérieur
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadStatusOptions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = sessionStorage.getItem('sessionId');
      const response = await fetch(
        `${API_BASE_URL}/signalements/${signalementId}/on-hover`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Impossible de charger les options de statut');
      }

      const options = await response.json();
      setStatusOptions(options);
    } catch (err) {
      console.error('Erreur lors du chargement des options:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async () => {
    if (disabled) return;
    
    if (!isOpen && statusOptions.length === 0) {
      await loadStatusOptions();
    }
    setIsOpen(!isOpen);
  };

  const handleStatusChange = async (status) => {
    try {
      const token = sessionStorage.getItem('sessionId');
      const response = await fetch(
        `${API_BASE_URL}/signalements/${signalementId}/status?statusId=${status.id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Impossible de changer le statut');
      }

      await response.json(); // On consomme la réponse même si on ne l'utilise pas directement
      setIsOpen(false);
      
      if (onStatusChange) {
        onStatusChange(status);
      }
    } catch (err) {
      console.error('Erreur lors du changement de statut:', err);
      setError(err.message);
    }
  };

  const getStatusIcon = (code) => {
    switch (code?.toLowerCase()) {
      case 'nouveau':
        return <AlertCircle className="w-4 h-4" />;
      case 'en_cours':
        return <Clock className="w-4 h-4" />;
      case 'termine':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Check className="w-4 h-4" />;
    }
  };

  const getStatusColor = (code) => {
    switch (code?.toLowerCase()) {
      case 'nouveau':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'en_cours':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'termine':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bouton de statut actuel */}
      <button
        type="button"
        onClick={handleToggle}
        onMouseEnter={() => !isOpen && loadStatusOptions()}
        disabled={disabled}
        className={`
          inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border
          transition-all duration-200
          ${getStatusColor(currentStatus)}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md cursor-pointer'}
        `}
      >
        {getStatusIcon(currentStatus)}
        <span className="capitalize">
          {currentStatus ? currentStatus.replace('_', ' ') : 'Statut inconnu'}
        </span>
        {!disabled && (
          <ChevronDown
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        )}
      </button>

      {/* Dropdown des options */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2">
          {loading ? (
            <div className="px-4 py-3 text-center text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-xs mt-2">Chargement...</p>
            </div>
          ) : error ? (
            <div className="px-4 py-3 text-center text-red-600">
              <AlertCircle className="w-6 h-6 mx-auto mb-2" />
              <p className="text-xs">{error}</p>
            </div>
          ) : (
            <>
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-700 uppercase">
                  Changer le statut
                </p>
              </div>
              {statusOptions.map((status) => (
                <button
                  key={status.id}
                  type="button"
                  onClick={() => handleStatusChange(status)}
                  disabled={status.code === currentStatus}
                  className={`
                    w-full px-4 py-2 text-left hover:bg-gray-50
                    flex items-center gap-3 transition-colors
                    ${status.code === currentStatus ? 'bg-blue-50 cursor-default' : ''}
                  `}
                >
                  <div
                    className={`
                      w-8 h-8 rounded-full flex items-center justify-center
                      ${getStatusColor(status.code).replace('border-', 'bg-')}
                    `}
                  >
                    {getStatusIcon(status.code)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 capitalize">
                      {status.libelle}
                    </p>
                    {status.description && (
                      <p className="text-xs text-gray-500">{status.description}</p>
                    )}
                  </div>
                  {status.code === currentStatus && (
                    <Check className="w-5 h-5 text-blue-600" />
                  )}
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default StatusSelector;