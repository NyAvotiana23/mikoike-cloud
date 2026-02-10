# 🚀 MIKOIKE CLOUD - Guide de Déploiement Docker

## 📋 Prérequis

- **Docker Desktop** installé et en cours d'exécution
- **Docker Compose** (inclus avec Docker Desktop)
- Au moins **8 Go de RAM** disponible
- **Ports disponibles** : 5432, 8002, 5173, 5174, 8081

---

## 🎯 Démarrage Rapide

### Lancer tous les services en une seule commande :

```bash
docker-compose up dev
```

### Ou en mode détaché (background) :

```bash
docker-compose up dev -d
```

---

## 🌐 Accès aux Services

| Service | URL | Description |
|---------|-----|-------------|
| 📦 **PostgreSQL** | `localhost:5432` | Base de données |
| 🚀 **Backend API** | http://localhost:8002 | API Spring Boot |
| 📚 **Swagger UI** | http://localhost:8002/swagger-ui.html | Documentation API |
| 🌐 **Web React** | http://localhost:5173 | Application Web Admin |
| 📱 **Mobile Vue** | http://localhost:5174 | Application Mobile (Ionic/Vue) |
| 🗺️ **TileServer** | http://localhost:8081 | Serveur de cartes |

---

## 🔧 Commandes Utiles

### Voir les logs de tous les services :
```bash
docker-compose logs -f
```

### Voir les logs d'un service spécifique :
```bash
docker-compose logs -f backend-dev
docker-compose logs -f web-dev
docker-compose logs -f mobile-dev
docker-compose logs -f postgres
docker-compose logs -f tileserver
```

### Arrêter tous les services :
```bash
docker-compose down
```

### Arrêter et supprimer les volumes (reset complet) :
```bash
docker-compose down -v
```

### Reconstruire les images :
```bash
docker-compose build --no-cache
```

### Reconstruire et relancer :
```bash
docker-compose up dev --build
```

---

## 📁 Structure du Projet

```
mikoike-cloud/
├── docker-compose.yml      # 🐳 Orchestration de tous les services
├── README.md               # 📖 Ce fichier
│
├── cloud-back/             # 🚀 Backend Spring Boot (Java 17)
│   ├── Dockerfile
│   ├── src/
│   └── pom.xml
│
├── web-react/              # 🌐 Frontend Web (React + Vite)
│   ├── Dockerfile
│   ├── src/
│   └── package.json
│
├── mobile-vue/             # 📱 Frontend Mobile (Vue/Ionic)
│   ├── Dockerfile
│   ├── src/
│   └── package.json
│
└── map-server/             # 🗺️ Serveur de tuiles (TileServer-GL)
    ├── Dockerfile
    └── antananarivo.mbtiles
```

---

## 🔌 Ports Utilisés

| Port | Service | Protocole |
|------|---------|-----------|
| **5432** | PostgreSQL | TCP |
| **8002** | Backend Spring Boot | HTTP |
| **5173** | Web React (Vite) | HTTP |
| **5174** | Mobile Vue (Vite) | HTTP |
| **8081** | TileServer-GL | HTTP |

---

## 🗄️ Base de Données

### Connexion PostgreSQL :
- **Host** : localhost
- **Port** : 5432
- **Database** : projet_cloud
- **Username** : postgres
- **Password** : sql

### Connexion via ligne de commande :
```bash
docker exec -it mikoike-postgres psql -U postgres -d projet_cloud
```

---

## 🔥 Hot Reload (Développement)

Les services de développement supportent le **hot reload** :

- ✅ **Backend** : Les modifications dans `cloud-back/src/` sont détectées automatiquement
- ✅ **Web React** : Les modifications dans `web-react/src/` sont appliquées instantanément
- ✅ **Mobile Vue** : Les modifications dans `mobile-vue/src/` sont appliquées instantanément

---

## 🐛 Dépannage

### Le backend ne démarre pas ?
```bash
# Vérifier que PostgreSQL est prêt
docker-compose logs postgres

# Redémarrer le backend
docker-compose restart backend-dev
```

### Erreur de port déjà utilisé ?
```bash
# Arrêter les services utilisant les ports
docker-compose down

# Sur Windows, trouver le processus
netstat -ano | findstr :5432
netstat -ano | findstr :8002
```

### Réinitialiser complètement ?
```bash
# Supprimer tout et recommencer
docker-compose down -v --rmi all
docker-compose up dev --build
```

---

## 📦 Premier Démarrage

Lors du premier démarrage, Docker va :
1. Télécharger les images de base (PostgreSQL, Node, Maven, etc.)
2. Construire les images personnalisées
3. Initialiser la base de données avec `data.sql`
4. Démarrer tous les services

**⏱️ Temps estimé : 5-10 minutes** (selon la connexion internet)

---

## 🚀 Mode Production

Pour déployer en production, utilisez les stages `production` des Dockerfiles :

```bash
# Build de production
docker-compose -f docker-compose.prod.yml up -d
```

---

## 📞 Support

En cas de problème, vérifiez :
1. Que Docker Desktop est bien démarré
2. Que les ports ne sont pas utilisés par d'autres applications
3. Les logs des services avec `docker-compose logs -f`

---

**🎉 Bonne utilisation de Mikoike Cloud !**
