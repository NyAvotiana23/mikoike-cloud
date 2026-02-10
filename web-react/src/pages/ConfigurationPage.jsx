// src/pages/admin/ConfigurationPage.jsx
import React, { useState, useEffect } from 'react';
import { Settings, DollarSign, Save, RefreshCw, AlertCircle, Check } from 'lucide-react';
import api from '../services/httpClient';

const ConfigurationPage = () => {
  const [prixParM2, setPrixParM2] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [calculExample, setCalculExample] = useState(null);

  useEffect(() => {
    loadPrixParM2();
  }, []);

  useEffect(() => {
    if (prixParM2) {
      calculateExample();
    }
  }, [prixParM2]);

  const loadPrixParM2 = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/configurations/prix-par-m2');
      setPrixParM2(response.data.valeur);
    } catch (err) {
      console.error('Erreur lors du chargement:', err);
      setError('Impossible de charger la configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!prixParM2 || parseFloat(prixParM2) <= 0) {
      setError('Le prix doit être supérieur à 0');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(false);
      
      await api.put(`/configurations/prix-par-m2?prix=${prixParM2}`);
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
      setError(err.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const calculateExample = () => {
    const prix = parseFloat(prixParM2) || 0;
    const examples = [
      { niveau: 1, surface: 10, budget: prix * 1 * 10 },
      { niveau: 5, surface: 20, budget: prix * 5 * 20 },
      { niveau: 10, surface: 50, budget: prix * 10 * 50 },
    ];
    setCalculExample(examples);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement de la configuration...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Settings className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Configuration</h2>
            <p className="text-sm text-gray-500 mt-1">
              Gérez les paramètres de l'application
            </p>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
          <div className="flex items-start">
            <Check className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-green-700 font-medium">
                Configuration enregistrée avec succès !
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Prix par m² */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Prix Forfaitaire par m²</h3>
              <p className="text-sm text-gray-500">
                Utilisé pour calculer le budget : Budget = Prix/m² × Niveau × Surface
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prix par m² (Ariary)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={prixParM2}
                  onChange={(e) => {
                    setPrixParM2(e.target.value);
                    setError(null);
                  }}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-medium"
                  placeholder="10000"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 font-medium">
                  Ar
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Prix de base pour 1 m² au niveau 1
              </p>

              {/* Boutons */}
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleSave}
                  disabled={saving || !prixParM2}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Enregistrer
                    </>
                  )}
                </button>

                <button
                  onClick={loadPrixParM2}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors font-medium"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Actualiser
                </button>
              </div>
            </div>

            {/* Formule */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h4 className="text-sm font-bold text-blue-900 mb-3">
                Formule de Calcul du Budget
              </h4>
              <div className="bg-white rounded p-4 font-mono text-sm text-center mb-4">
                <div className="text-gray-600 mb-1">Budget =</div>
                <div className="text-blue-600 font-bold text-lg">
                  Prix/m² × Niveau × Surface
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Prix/m² actuel:</span>
                  <span className="font-bold text-gray-900">
                    {parseFloat(prixParM2 || 0).toLocaleString()} Ar
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Niveau:</span>
                  <span className="font-medium text-gray-700">1 à 10</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Surface:</span>
                  <span className="font-medium text-gray-700">en m²</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Exemples de calcul */}
        {calculExample && (
          <div className="p-6">
            <h4 className="text-sm font-bold text-gray-900 mb-4">
              Exemples de Calcul
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {calculExample.map((example, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-medium text-gray-500">EXEMPLE {index + 1}</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      example.niveau <= 3 ? 'bg-green-100 text-green-800' :
                      example.niveau <= 7 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      Niveau {example.niveau}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Surface:</span>
                      <span className="font-medium">{example.surface} m²</span>
                    </div>
                    <div className="pt-2 border-t border-gray-300">
                      <div className="flex justify-between items-baseline">
                        <span className="text-gray-700 font-medium">Budget:</span>
                        <span className="text-lg font-bold text-gray-900">
                          {(example.budget / 1000).toLocaleString()} kAr
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Comment ça fonctionne ?</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>Le manager définit le niveau de réparation (1 à 10) pour chaque signalement</li>
              <li>Le budget est calculé automatiquement selon la formule ci-dessus</li>
              <li>Plus le niveau est élevé, plus le budget est important</li>
              <li>Modifiez le prix/m² ici pour ajuster tous les calculs</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigurationPage;