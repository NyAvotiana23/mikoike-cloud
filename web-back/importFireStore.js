const admin = require('firebase-admin');
const fs = require('fs');

// Remplacez par le chemin de votre fichier serviceAccountKey.json
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Données à importer
const data = {
  "roles": {
    "admin": {
      "code": "admin",
      "libelle": "Administrateur",
      "description": "Accès complet au système",
      "niveau_acces": 100
    },
    "user": {
      "code": "user",
      "libelle": "Utilisateur",
      "description": "Accès standard",
      "niveau_acces": 10
    },
    "moderator": {
      "code": "moderator",
      "libelle": "Modérateur",
      "description": "Gestion des signalements",
      "niveau_acces": 50
    }
  },
  "users": {
    "user_example": {
      "email": "exemple@email.com",
      "password_hash": "hash_example",
      "name": "Utilisateur Exemple",
      "role_id": "user",
      "role": {
        "code": "user",
        "libelle": "Utilisateur"
      },
      "firebase_uid": null,
      "is_locked": false,
      "locked_until": null,
      "failed_login_attempts": 0,
      "last_failed_attempt_at": null
    }
  },
  "signalement_status": {
    "nouveau": {
      "code": "nouveau",
      "libelle": "Nouveau",
      "description": "Statut: Nouveau",
      "ordre": 1
    },
    "en_cours": {
      "code": "en_cours",
      "libelle": "En cours",
      "description": "Statut: En cours",
      "ordre": 2
    },
    "resolu": {
      "code": "resolu",
      "libelle": "Résolu",
      "description": "Statut: Résolu",
      "ordre": 3
    },
    "cloture": {
      "code": "cloture",
      "libelle": "Clôturé",
      "description": "Statut: Clôturé",
      "ordre": 4
    }
  },
  "enterprises": {
    "enterprise_example": {
      "nom": "Entreprise Exemple",
      "siret": "12345678901234",
      "telephone": "+261340000000",
      "email": "contact@entreprise.mg",
      "address": "Antananarivo, Madagascar",
      "is_active": true,
      "specialites": ["construction", "rénovation"],
      "note_moyenne": 4.5,
      "role_employee": "employee",
      "nominal_intervention_cost": 50000
    }
  },
  "signalements": {
    "signalement_example": {
      "user_id": "user_example",
      "user_name": "Utilisateur Exemple",
      "enterprise_id": "enterprise_example",
      "enterprise_name": "Entreprise Exemple",
      "status_id": "nouveau",
      "status_libelle": "Nouveau",
      "firebase_uid": null,
      "firebase_sync_error": null,
      "latitude": -18.8792,
      "longitude": 47.5079,
      "address": "Analakely, Antananarivo",
      "description": "Nid de poule important sur la route",
      "photo_url": null,
      "data_signalement": null
    }
  },
  "sessions": {
    "session_example": {
      "user_id": "user_example",
      "token": "example_token_" + Date.now(),
      "ip_address": "127.0.0.1",
      "user_agent": "Mozilla/5.0"
    }
  },
  "login_attempts": {
    "attempt_example": {
      "email": "exemple@email.com",
      "user_id": "user_example",
      "success": false,
      "failure_reason": "INVALID_PASSWORD",
      "ip_address": "127.0.0.1",
      "user_agent": "Mozilla/5.0"
    }
  },
  "signalement_actions": {
    "action_example": {
      "signalement_id": "signalement_example",
      "entreprise_id": "enterprise_example",
      "surface_m2": 25.5,
      "budget": 150000,
      "description_travaux": "Réfection complète de la chaussée",
      "material_utilise": "Asphalte",
      "travaux_conformes": null,
      "commentaire_fin": null,
      "photos_avant": [],
      "photos_apres": [],
      "created_by": "user_example",
      "modified_by": "user_example"
    }
  },
  "sync_queue": {
    "sync_example": {
      "entity_type": "signalement",
      "entity_id": "signalement_example",
      "firebase_id": null,
      "action": "create",
      "direction": "postgres_to_firebase",
      "status": "pending",
      "data_snapshot": {
        "description": "Example data"
      },
      "retry_count": 0,
      "max_retries": 3,
      "priority": 5,
      "processing_started_at": null,
      "processed_at": null
    }
  },
  "sync_history": {
    "history_example": {
      "sync_queue_id": "sync_example",
      "entity_type": "signalement",
      "entity_id": "signalement_example",
      "action": "create",
      "direction": "postgres_to_firebase",
      "status": "success",
      "error_message": null,
      "firebase_response": null,
      "duration_ms": 250
    }
  },
  "historique_status": {
    "status_history_example": {
      "signalement_id": "signalement_example",
      "ancien_status_id": null,
      "nouveau_status_id": "nouveau",
      "modified_by": "user_example",
      "commentaire": "Création du signalement",
      "metadata": null
    }
  },
  "failed_login_tracking": {
    "tracking_example": {
      "email": "exemple@email.com",
      "failed_count": 0,
      "first_failed_at": null,
      "last_failed_at": null,
      "is_blocked": false,
      "blocked_until": null,
      "blocked_reason": null,
      "unblocked_by": null,
      "unblocked_at": null
    }
  }
};

async function importData() {
  console.log('🚀 Début de l\'import des données...\n');

  try {
    for (const [collectionName, documents] of Object.entries(data)) {
      console.log(`📁 Import de la collection "${collectionName}"...`);
      
      const batch = db.batch();
      let count = 0;

      for (const [docId, docData] of Object.entries(documents)) {
        const docRef = db.collection(collectionName).doc(docId);
        
        // Ajouter les timestamps automatiquement
        const dataWithTimestamps = {
          ...docData,
          created_at: admin.firestore.FieldValue.serverTimestamp(),
          updated_at: admin.firestore.FieldValue.serverTimestamp()
        };

        // Gérer les champs spéciaux pour certaines collections
        if (collectionName === 'sessions') {
          dataWithTimestamps.expires_at = admin.firestore.Timestamp.fromDate(
            new Date(Date.now() + 24 * 60 * 60 * 1000) // +24h
          );
          dataWithTimestamps.last_activity_at = admin.firestore.FieldValue.serverTimestamp();
        }

        if (collectionName === 'signalement_actions') {
          dataWithTimestamps.date_fin_prevue = admin.firestore.Timestamp.fromDate(
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // +30 jours
          );
        }

        if (collectionName === 'login_attempts' || collectionName === 'historique_status') {
          dataWithTimestamps.attempted_at = admin.firestore.FieldValue.serverTimestamp();
        }

        if (collectionName === 'sync_queue') {
          dataWithTimestamps.scheduled_at = admin.firestore.FieldValue.serverTimestamp();
        }

        if (collectionName === 'sync_history' || collectionName === 'historique_status') {
          dataWithTimestamps.synced_at = admin.firestore.FieldValue.serverTimestamp();
          dataWithTimestamps.changed_at = admin.firestore.FieldValue.serverTimestamp();
        }

        batch.set(docRef, dataWithTimestamps);
        count++;
      }

      await batch.commit();
      console.log(`✅ ${count} document(s) importé(s) dans "${collectionName}"\n`);
    }

    console.log('🎉 Import terminé avec succès!');
    console.log('\n📊 Collections créées:');
    Object.keys(data).forEach(collection => {
      console.log(`  - ${collection}`);
    });

  } catch (error) {
    console.error('❌ Erreur lors de l\'import:', error);
    throw error;
  }
}

// Exécution
importData()
  .then(() => {
    console.log('\n✨ Opération terminée');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Erreur fatale:', error);
    process.exit(1);
  });