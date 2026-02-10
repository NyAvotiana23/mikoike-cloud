================================================================================
INSTRUCTIONS - DOCKERISATION WEB REACT
================================================================================

📦 FICHIERS GÉNÉRÉS
-------------------
✓ Dockerfile                  - Multi-stage (dev + production)
✓ docker-compose.yml          - Orchestration complète
✓ .dockerignore               - Optimisation des builds
✓ nginx.conf                  - Configuration serveur production
✓ .env.example                - Variables d'environnement
✓ Makefile                    - Commandes simplifiées
✓ start.sh                    - Script de démarrage interactif

================================================================================
🚀 DÉMARRAGE RAPIDE
================================================================================

1️⃣ ÉTAPE PRÉLIMINAIRE : Créer le fichier .env
cp .env.template .env
# Ou utilisez .env.example si .env.template n'existe pas

2️⃣ MÉTHODE 1 : Script interactif (recommandé)
./start.sh

3️⃣ MÉTHODE 2 : Makefile
make dev           # Mode développement
make prod          # Mode production
make full-stack    # Dev + API + Tiles

4️⃣ MÉTHODE 3 : Docker Compose directement
docker-compose up web-dev      # Mode développement
docker-compose up web-prod     # Mode production

================================================================================
📝 MODES DISPONIBLES
================================================================================

🔧 MODE DÉVELOPPEMENT
- Hot-reload activé
- Port : http://localhost:5173
- Commande : docker-compose up web-dev
- Volume monté pour modifications en temps réel

🌐 MODE PRODUCTION
- Build optimisé avec Vite
- Serveur Nginx haute performance
- Port : http://localhost:8080
- Commande : docker-compose up web-prod
- Gzip, cache, security headers configurés

🔌 MODE API BACKEND (optionnel)
- Port : http://localhost:3000
- Commande : docker-compose --profile api up api
- Nécessite un dossier ./api avec votre code backend

🗺️  SERVEUR DE TILES (optionnel)
- Serveur OpenStreetMap local
- Port : http://localhost:8081
- Commande : docker-compose --profile tiles up tile-server
- ⚠️ Attention : Premier démarrage très long (téléchargement de données)

📦 STACK COMPLÈTE
- Dev + API + Tiles Server
- Commande : make full-stack
- Ou : docker-compose --profile api --profile tiles up web-dev api tile-server

================================================================================
⚙️ COMMANDES UTILES (via Makefile)
================================================================================

DÉVELOPPEMENT :
make dev                 # Démarrer le serveur dev
make dev-build           # Build + démarrer dev
make dev-detached        # Démarrer dev en arrière-plan
make logs-dev            # Voir les logs dev

PRODUCTION :
make prod                # Démarrer le serveur prod
make prod-build          # Build + démarrer prod
make prod-detached       # Démarrer prod en arrière-plan
make logs-prod           # Voir les logs prod

SERVICES ADDITIONNELS :
make api                 # Démarrer l'API backend
make tiles               # Démarrer le serveur de tiles
make full-stack          # Démarrer tout (dev + api + tiles)
make full-stack-detached # Tout en arrière-plan

UTILITAIRES :
make stop                # Arrêter tous les conteneurs
make clean               # Nettoyer conteneurs + volumes
make logs                # Afficher tous les logs
make logs-api            # Logs de l'API
make logs-tiles          # Logs du serveur de tiles
make shell-dev           # Accéder au shell du conteneur dev
make install             # Installer les dépendances
make lint                # Lancer le linter
make rebuild             # Rebuild complet
make prune               # Nettoyer Docker complètement
make env-setup           # Créer .env depuis .env.template

================================================================================
🔍 DOCKER COMPOSE - COMMANDES DIRECTES
================================================================================

# Démarrer en mode développement
docker-compose up web-dev

# Démarrer en mode production
docker-compose up web-prod

# Démarrer avec l'API
docker-compose --profile api up web-dev api

# Démarrer la stack complète
docker-compose --profile api --profile tiles up web-dev api tile-server

# Démarrer en arrière-plan
docker-compose up -d web-dev

# Rebuild et démarrer
docker-compose up --build web-dev

# Arrêter les conteneurs
docker-compose down

# Arrêter avec tous les profils
docker-compose --profile api --profile tiles down

# Voir les logs
docker-compose logs -f

# Voir les logs d'un service spécifique
docker-compose logs -f web-dev

# Accéder au shell d'un conteneur
docker-compose exec web-dev sh

================================================================================
📂 STRUCTURE DES VOLUMES
================================================================================

Development :
- Code source monté : .:/app
- Node modules : volume nommé (performance)
- Fichier .env : monté en lecture seule

Production :
- Aucun volume (image autonome)
- Build static servi par Nginx

Services additionnels :
- OSM Data : volume nommé (données de la carte)
- OSM Tiles : volume nommé (tuiles générées)

================================================================================
🌍 VARIABLES D'ENVIRONNEMENT
================================================================================

FICHIERS :
- .env.template  : Template avec toutes les variables
- .env.example   : Exemple de configuration Docker
- .env           : Votre configuration (à créer)

CRÉATION :
1. Copier .env.template vers .env :
   cp .env.template .env

2. Modifier les valeurs selon vos besoins

3. Les variables sont automatiquement chargées

VARIABLES IMPORTANTES :
- VITE_MAP_TILE_SERVER      : URL du serveur de tuiles
- VITE_MAP_DOCKER_SERVER    : URL du serveur de tuiles Docker local
- VITE_API_URL              : URL de votre API backend
- VITE_AUTH_MODE            : Mode d'authentification (local/firebase)
- VITE_FIREBASE_*           : Configuration Firebase (si utilisé)

================================================================================
🔧 CONFIGURATION
================================================================================

PORTS :
- Dev         : 5173
- Prod        : 8080
- API         : 3000
- Tile Server : 8081

TECHNOLOGIES :
- React 18
- Vite 5
- React Router
- Leaflet (cartes)
- Tailwind CSS
- Axios
- Firebase (optionnel)

NGINX (Production) :
- Compression Gzip activée
- Cache optimisé pour les assets
- Security headers configurés
- Proxy API configuré (/api → backend)
- SPA routing géré

================================================================================
🔌 INTÉGRATION API BACKEND
================================================================================

Si vous avez un backend API :

1. Créer un dossier ./api à la racine
2. Y placer votre code backend Node.js
3. Ajouter package.json avec script "start"
4. Lancer avec : make api ou docker-compose --profile api up api

Configuration :
- Le service API est exposé sur le port 3000
- Accessible depuis le frontend via VITE_API_URL
- Nginx proxy /api → http://api:3000

================================================================================
🗺️  SERVEUR DE TILES OPENSTREETMAP
================================================================================

Pour utiliser un serveur de tuiles local :

1. Lancer le serveur :
   make tiles
   # Ou
   docker-compose --profile tiles up tile-server

2. Modifier VITE_MAP_TILE_SERVER dans .env :
   VITE_MAP_TILE_SERVER=http://localhost:8081/tile/{z}/{x}/{y}.png

⚠️ ATTENTION :
- Premier démarrage très long (plusieurs heures)
- Téléchargement de données volumineuses
- Nécessite beaucoup d'espace disque (>50GB)
- RAM recommandée : 8GB minimum

Alternative recommandée :
- Utiliser les tuiles OpenStreetMap publiques
- VITE_MAP_TILE_SERVER=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png

================================================================================
🐛 DÉPANNAGE
================================================================================

Problème : Port déjà utilisé
Solution : Modifier les ports dans docker-compose.yml

Problème : Build lent
Solution :
- Volumes nommés déjà configurés
- Vérifier .dockerignore
- Utiliser docker-compose build --no-cache en dernier recours

Problème : Hot-reload ne fonctionne pas
Solution :
- Vérifier que les volumes sont bien montés
- Sur Windows, activer WSL2 pour de meilleures performances

Problème : Variables d'environnement non chargées
Solution :
- Vérifier que le fichier .env existe
- Les variables doivent commencer par VITE_
- Redémarrer le conteneur après modification

Problème : Erreur CORS avec l'API
Solution :
- Configurer CORS sur votre backend
- Ou utiliser le proxy Nginx configuré (/api)

Problème : Tiles ne se chargent pas
Solution :
- Vérifier VITE_MAP_TILE_SERVER dans .env
- Vérifier la connexion internet
- Si serveur local, attendre qu'il soit complètement démarré

================================================================================
📚 RESSOURCES
================================================================================

Documentation :
- React : https://react.dev/
- Vite : https://vitejs.dev/
- React Router : https://reactrouter.com/
- Leaflet : https://leafletjs.com/
- Tailwind : https://tailwindcss.com/
- Docker : https://docs.docker.com/

Support :
- Vérifier les logs : docker-compose logs -f
- Shell dans le conteneur : docker-compose exec web-dev sh
- Inspecter le build : docker-compose build --no-cache

================================================================================
✅ CHECKLIST AVANT DÉPLOIEMENT
================================================================================

□ Fichier .env créé et configuré
□ Variables Firebase configurées (si utilisé)
□ VITE_API_URL pointant vers l'API de production
□ Build de production testé (make prod)
□ Nginx configuré correctement (nginx.conf)
□ Tests passés
□ Lint passé (make lint)
□ Variables d'environnement de production vérifiées
□ CORS configuré sur l'API backend
□ Security headers vérifiés

================================================================================
🎯 PROCHAINES ÉTAPES
================================================================================

1. Créer le fichier .env :
   cp .env.template .env

2. Tester le mode développement :
   ./start.sh (choix 1)

3. Vérifier que l'app fonctionne sur http://localhost:5173

4. Si besoin d'API, la configurer et lancer :
   ./start.sh (choix 3)

5. Tester le mode production :
   ./start.sh (choix 2)

6. Préparer le déploiement :
    - Configurer les variables de production
    - Tester le build production localement
    - Préparer le CI/CD si nécessaire

================================================================================
💡 CONSEILS
================================================================================

DÉVELOPPEMENT :
- Utilisez make dev pour un démarrage rapide
- Le hot-reload fonctionne grâce aux volumes montés
- Les dépendances sont en cache (volume nommé)

PERFORMANCE :
- Le build de production est optimisé par Vite
- Nginx sert les fichiers avec compression et cache
- Les assets ont des noms avec hash pour le cache navigateur

DEBUGGING :
- Utilisez make logs-dev pour voir les logs en temps réel
- make shell-dev pour accéder au conteneur
- Les source maps sont disponibles en développement

PRODUCTION :
- Nginx est configuré pour servir une SPA React
- Tous les routing React sont gérés correctement
- Security headers sont configurés
- API proxy disponible si nécessaire

SÉCURITÉ :
- Ne commitez jamais le fichier .env
- Utilisez des secrets pour les credentials en production
- Les security headers sont configurés dans nginx.conf

================================================================================
