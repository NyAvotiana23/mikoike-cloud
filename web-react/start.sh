#!/bin/bash

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Script de démarrage - Web React Docker          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}"
echo ""

# Vérifier si Docker est installé
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker n'est pas installé !${NC}"
    echo -e "${YELLOW}Veuillez installer Docker : https://docs.docker.com/get-docker/${NC}"
    exit 1
fi

# Vérifier si Docker Compose est installé
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose n'est pas installé !${NC}"
    echo -e "${YELLOW}Veuillez installer Docker Compose : https://docs.docker.com/compose/install/${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker et Docker Compose sont installés${NC}"
echo ""

# Vérifier si le fichier .env existe
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  Le fichier .env n'existe pas${NC}"
    if [ -f .env.template ]; then
        echo -e "${BLUE}Création du fichier .env depuis .env.template...${NC}"
        cp .env.template .env
        echo -e "${GREEN}✓ Fichier .env créé${NC}"
    else
        echo -e "${RED}❌ Fichier .env.template introuvable${NC}"
        exit 1
    fi
    echo ""
fi

# Menu de sélection
echo -e "${BLUE}Choisissez le mode de démarrage :${NC}"
echo "1) Développement seul (http://localhost:5173)"
echo "2) Production seul (http://localhost:8080)"
echo "3) Développement + API Backend"
echo "4) Stack complète (Dev + API + Tiles Server)"
echo "5) Serveur de tiles OpenStreetMap seul"
echo "6) Afficher l'aide"
echo ""
read -p "Votre choix [1-6] : " choice

case $choice in
    1)
        echo ""
        echo -e "${YELLOW}🚀 Démarrage du serveur de développement...${NC}"
        echo -e "${BLUE}L'application sera accessible sur http://localhost:5173${NC}"
        echo ""
        docker-compose up --build web-dev
        ;;
    2)
        echo ""
        echo -e "${YELLOW}🚀 Démarrage du serveur de production...${NC}"
        echo -e "${BLUE}L'application sera accessible sur http://localhost:8080${NC}"
        echo ""
        docker-compose up --build web-prod
        ;;
    3)
        echo ""
        echo -e "${YELLOW}🚀 Démarrage de Dev + API...${NC}"
        echo -e "${BLUE}Application : http://localhost:5173${NC}"
        echo -e "${BLUE}API : http://localhost:3000${NC}"
        echo ""
        docker-compose --profile api up --build web-dev api
        ;;
    4)
        echo ""
        echo -e "${YELLOW}🚀 Démarrage de la stack complète...${NC}"
        echo -e "${BLUE}Application : http://localhost:5173${NC}"
        echo -e "${BLUE}API : http://localhost:3000${NC}"
        echo -e "${BLUE}Tiles : http://localhost:8081${NC}"
        echo -e "${YELLOW}⚠️  Attention: Le serveur de tiles peut prendre du temps à démarrer${NC}"
        echo ""
        docker-compose --profile api --profile tiles up --build web-dev api tile-server
        ;;
    5)
        echo ""
        echo -e "${YELLOW}🗺️  Démarrage du serveur de tiles OpenStreetMap...${NC}"
        echo -e "${BLUE}Tiles disponibles sur : http://localhost:8081${NC}"
        echo -e "${YELLOW}⚠️  Le téléchargement initial des données peut prendre beaucoup de temps${NC}"
        echo ""
        docker-compose --profile tiles up tile-server
        ;;
    6)
        echo ""
        echo -e "${BLUE}Commandes disponibles :${NC}"
        echo ""
        echo -e "${GREEN}Développement :${NC}"
        echo "  docker-compose up web-dev          # Démarrer en mode dev"
        echo "  docker-compose up -d web-dev       # Démarrer en arrière-plan"
        echo ""
        echo -e "${GREEN}Production :${NC}"
        echo "  docker-compose up web-prod         # Démarrer en mode prod"
        echo "  docker-compose up -d web-prod      # Démarrer en arrière-plan"
        echo ""
        echo -e "${GREEN}Backend API :${NC}"
        echo "  docker-compose --profile api up api"
        echo ""
        echo -e "${GREEN}Serveur de tiles :${NC}"
        echo "  docker-compose --profile tiles up tile-server"
        echo ""
        echo -e "${GREEN}Stack complète :${NC}"
        echo "  docker-compose --profile api --profile tiles up web-dev api tile-server"
        echo ""
        echo -e "${GREEN}Utilitaires :${NC}"
        echo "  docker-compose down                # Arrêter les conteneurs"
        echo "  docker-compose logs -f             # Voir les logs"
        echo "  make help                          # Voir toutes les commandes"
        ;;
    *)
        echo -e "${RED}❌ Choix invalide${NC}"
        exit 1
        ;;
esac