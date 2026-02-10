#!/bin/bash

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Script de démarrage - Ionic Vue Docker          ║${NC}"
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

# Menu de sélection
echo -e "${BLUE}Choisissez le mode de démarrage :${NC}"
echo "1) Développement (hot-reload sur http://localhost:5173)"
echo "2) Production (serveur Nginx sur http://localhost:8080)"
echo "3) Build Android (génère un APK)"
echo "4) Afficher l'aide"
echo ""
read -p "Votre choix [1-4] : " choice

case $choice in
    1)
        echo ""
        echo -e "${YELLOW}🚀 Démarrage du serveur de développement...${NC}"
        echo -e "${BLUE}L'application sera accessible sur http://localhost:5173${NC}"
        echo ""
        docker-compose up --build dev
        ;;
    2)
        echo ""
        echo -e "${YELLOW}🚀 Démarrage du serveur de production...${NC}"
        echo -e "${BLUE}L'application sera accessible sur http://localhost:8080${NC}"
        echo ""
        docker-compose up --build prod
        ;;
    3)
        echo ""
        echo -e "${YELLOW}📱 Build de l'application Android...${NC}"
        mkdir -p output
        docker-compose --profile android up --build android-build
        echo ""
        if [ -f "./output/app-debug.apk" ]; then
            echo -e "${GREEN}✓ APK généré avec succès dans ./output/app-debug.apk${NC}"
        else
            echo -e "${RED}❌ Erreur lors de la génération de l'APK${NC}"
        fi
        ;;
    4)
        echo ""
        echo -e "${BLUE}Commandes disponibles :${NC}"
        echo ""
        echo -e "${GREEN}Développement :${NC}"
        echo "  docker-compose up dev          # Démarrer en mode dev"
        echo "  docker-compose up -d dev       # Démarrer en arrière-plan"
        echo ""
        echo -e "${GREEN}Production :${NC}"
        echo "  docker-compose up prod         # Démarrer en mode prod"
        echo "  docker-compose up -d prod      # Démarrer en arrière-plan"
        echo ""
        echo -e "${GREEN}Android :${NC}"
        echo "  docker-compose --profile android up android-build"
        echo ""
        echo -e "${GREEN}Utilitaires :${NC}"
        echo "  docker-compose down            # Arrêter les conteneurs"
        echo "  docker-compose logs -f         # Voir les logs"
        echo "  make help                      # Voir toutes les commandes"
        ;;
    *)
        echo -e "${RED}❌ Choix invalide${NC}"
        exit 1
        ;;
esac