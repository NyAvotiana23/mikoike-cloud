# Méthode 1 : Script interactif
./start.sh

# Méthode 2 : Makefile
make dev          # Développement (http://localhost:5173)
make prod         # Production (http://localhost:8080)
make android-build # Génère l'APK

# Méthode 3 : Docker Compose
docker-compose up dev



================================================================================
INSTRUCTIONS - DOCKERISATION IONIC VUE.JS
================================================================================

📦 FICHIERS GÉNÉRÉS
-------------------
✓ Dockerfile                  - Multi-stage (dev + production)
✓ Dockerfile.android          - Build Android avec Capacitor
✓ docker-compose.yml          - Orchestration des services
✓ .dockerignore               - Optimisation des builds
✓ nginx.conf                  - Configuration serveur production
✓ .env.example                - Variables d'environnement
✓ Makefile                    - Commandes simplifiées
✓ start.sh                    - Script de démarrage interactif

================================================================================
🚀 DÉMARRAGE RAPIDE
================================================================================

1️⃣ MÉTHODE 1 : Script interactif (recommandé)
./start.sh

2️⃣ MÉTHODE 2 : Makefile
make dev          # Mode développement
make prod         # Mode production
make android-build # Build Android

3️⃣ MÉTHODE 3 : Docker Compose directement
docker-compose up dev     # Mode développement
docker-compose up prod    # Mode production

================================================================================
📝 MODES DISPONIBLES
================================================================================

🔧 MODE DÉVELOPPEMENT
- Hot-reload activé
- Port : http://localhost:5173
- Commande : docker-compose up dev
- Volume monté pour modifications en temps réel

🌐 MODE PRODUCTION
- Build optimisé
- Serveur Nginx
- Port : http://localhost:8080
- Commande : docker-compose up prod

📱 BUILD ANDROID
- Génère un APK
- Sortie : ./output/app-debug.apk
- Commande : docker-compose --profile android up android-build
- Nécessite : Capacitor configuré

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

ANDROID :
make android-build       # Générer l'APK Android

UTILITAIRES :
make stop                # Arrêter tous les conteneurs
make clean               # Nettoyer conteneurs + volumes
make logs                # Afficher tous les logs
make shell-dev           # Accéder au shell du conteneur dev
make install             # Installer les dépendances
make test                # Lancer les tests
make lint                # Lancer le linter
make rebuild             # Rebuild complet
make prune               # Nettoyer Docker complètement

================================================================================
🔍 DOCKER COMPOSE - COMMANDES DIRECTES
================================================================================

# Démarrer en mode développement
docker-compose up dev

# Démarrer en mode production
docker-compose up prod

# Démarrer en arrière-plan
docker-compose up -d dev

# Rebuild et démarrer
docker-compose up --build dev

# Arrêter les conteneurs
docker-compose down

# Voir les logs
docker-compose logs -f

# Voir les logs d'un service spécifique
docker-compose logs -f dev

# Accéder au shell d'un conteneur
docker-compose exec dev sh

# Build Android
docker-compose --profile android up --build android-build

================================================================================
📂 STRUCTURE DES VOLUMES
================================================================================

Development :
- Code source monté : .:/app
- Node modules : volume nommé (performance)

Production :
- Aucun volume (image autonome)

Android Build :
- Output : ./output (pour récupérer l'APK)
- Gradle cache : volume nommé (performance)

================================================================================
🌍 VARIABLES D'ENVIRONNEMENT
================================================================================

1. Copier .env.example vers .env
   cp .env.example .env

2. Modifier les valeurs dans .env selon vos besoins

3. Les variables sont automatiquement chargées par docker-compose

================================================================================
🔧 CONFIGURATION
================================================================================

PORTS :
- Dev   : 5173
- Prod  : 8080

CAPACITOR :
- App ID  : com.itu.mikoike
- WebDir  : public
- Cible   : Android SDK 34

FIREBASE :
- Configuré dans environment.ts et environment.prod.ts

================================================================================
🐛 DÉPANNAGE
================================================================================

Problème : Port déjà utilisé
Solution : Modifier les ports dans docker-compose.yml

Problème : Build lent
Solution : Utiliser les volumes nommés (déjà configuré)

Problème : Hot-reload ne fonctionne pas
Solution : Vérifier que les volumes sont bien montés

Problème : APK non généré
Solution : Vérifier que le dossier android/ existe et est configuré

Problème : Erreur de permissions
Solution : chmod +x start.sh

================================================================================
📚 RESSOURCES
================================================================================

Documentation :
- Ionic : https://ionicframework.com/docs
- Vue.js : https://vuejs.org/
- Capacitor : https://capacitorjs.com/
- Docker : https://docs.docker.com/

Support :
- Vérifier les logs : docker-compose logs -f
- Shell dans le conteneur : docker-compose exec dev sh

================================================================================
✅ CHECKLIST AVANT DÉPLOIEMENT
================================================================================

□ Variables d'environnement configurées (.env)
□ Firebase configuré (environment.ts)
□ Build de production testé (make prod)
□ APK Android généré et testé (si nécessaire)
□ Nginx configuré correctement (nginx.conf)
□ Tests passés (make test)
□ Lint passé (make lint)

================================================================================
🎯 PROCHAINES ÉTAPES
================================================================================

1. Tester le mode développement : ./start.sh (choix 1)
2. Vérifier que l'app fonctionne sur http://localhost:5173
3. Tester le mode production : ./start.sh (choix 2)
4. Si besoin Android : ./start.sh (choix 3)

================================================================================
💡 CONSEILS
================================================================================

- Utilisez make help pour voir toutes les commandes disponibles
- Les volumes Docker accélèrent les builds successifs
- Le mode dev permet le hot-reload pour un développement rapide
- Le mode prod optimise les assets pour la performance
- Les logs sont accessibles via make logs ou docker-compose logs -f

================================================================================