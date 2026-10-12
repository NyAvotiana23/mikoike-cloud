import { useEffect, useState } from 'react';
import signalementApiService from '../services/api/signalementApiService';

/**
 * Galerie des photos d'un signalement, chargées depuis l'API.
 * @param {Object} props
 * @param {number} props.signalementId
 */
const SignalementPhotos = ({ signalementId }) => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    signalementApiService
      .getPhotosBySignalement(signalementId)
      .then((data) => !cancelled && setPhotos(data))
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [signalementId]);

  if (loading) return <p className="text-sm text-gray-500">Chargement des photos...</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (photos.length === 0) return <p className="text-sm text-gray-500">Aucune photo pour ce signalement.</p>;

  return (
    <div className="grid grid-cols-2 gap-3">
      {photos.map((photo) => (
        <img
          key={photo.id}
          src={photo.url}
          alt={photo.description || `Photo du signalement ${signalementId}`}
          className="w-full h-32 object-cover rounded-lg shadow-sm border border-gray-100"
        />
      ))}
    </div>
  );
};

export default SignalementPhotos;
