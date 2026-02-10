.PHONY: help dev prod api tiles stop clean logs

# Couleurs pour les messages
BLUE=\033[0;34m
GREEN=\033[0;32m
YELLOW=\033[1;33m
NC=\033[0m # No Color

help: ## Afficher l'aide
	@echo "$(BLUE)Commandes disponibles pour le projet Web React$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(GREEN)%-20s$(NC) %s\n", $$1, $$2}'

dev: ## Lancer le serveur de développement
	@echo "$(YELLOW)Démarrage du serveur de développement...$(NC)"
	docker-compose up web-dev

dev-build: ## Build et lancer le serveur de développement
	@echo "$(YELLOW)Build et démarrage du serveur de développement...$(NC)"
	docker-compose up --build web-dev

dev-detached: ## Lancer le serveur de développement en arrière-plan
	@echo "$(YELLOW)Démarrage du serveur de développement en arrière-plan...$(NC)"
	docker-compose up -d web-dev

prod: ## Lancer le serveur de production
	@echo "$(YELLOW)Démarrage du serveur de production...$(NC)"
	docker-compose up web-prod

prod-build: ## Build et lancer le serveur de production
	@echo "$(YELLOW)Build et démarrage du serveur de production...$(NC)"
	docker-compose up --build web-prod

prod-detached: ## Lancer le serveur de production en arrière-plan
	@echo "$(YELLOW)Démarrage du serveur de production en arrière-plan...$(NC)"
	docker-compose up -d web-prod

api: ## Lancer le serveur API backend
	@echo "$(YELLOW)Démarrage du serveur API...$(NC)"
	docker-compose --profile api up api

tiles: ## Lancer le serveur de tiles OpenStreetMap
	@echo "$(YELLOW)Démarrage du serveur de tiles...$(NC)"
	@echo "$(BLUE)Attention: Le téléchargement initial peut prendre du temps$(NC)"
	docker-compose --profile tiles up tiles

full-stack: ## Lancer dev + api + tiles
	@echo "$(YELLOW)Démarrage de la stack complète...$(NC)"
	docker-compose --profile api --profile tiles up web-dev api tiles

full-stack-detached: ## Lancer la stack complète en arrière-plan
	@echo "$(YELLOW)Démarrage de la stack complète en arrière-plan...$(NC)"
	docker-compose --profile api --profile tiles up -d web-dev api tiles

stop: ## Arrêter tous les conteneurs
	@echo "$(YELLOW)Arrêt des conteneurs...$(NC)"
	docker-compose --profile api --profile tiles down

clean: ## Nettoyer les conteneurs, images et volumes
	@echo "$(YELLOW)Nettoyage des conteneurs, images et volumes...$(NC)"
	docker-compose --profile api --profile tiles down -v --rmi all
	@echo "$(GREEN)Nettoyage terminé$(NC)"

logs: ## Afficher les logs de tous les conteneurs
	docker-compose --profile api --profile tiles logs -f

logs-dev: ## Afficher les logs du conteneur de développement
	docker-compose logs -f web-dev

logs-prod: ## Afficher les logs du conteneur de production
	docker-compose logs -f web-prod

logs-api: ## Afficher les logs du conteneur API
	docker-compose logs -f api

logs-tiles: ## Afficher les logs du serveur de tiles
	docker-compose logs -f tile-server

shell-dev: ## Ouvrir un shell dans le conteneur de développement
	docker-compose exec web-dev sh

shell-prod: ## Ouvrir un shell dans le conteneur de production
	docker-compose exec web-prod sh

restart: ## Redémarrer tous les conteneurs
	@echo "$(YELLOW)Redémarrage des conteneurs...$(NC)"
	docker-compose --profile api --profile tiles restart

rebuild: ## Rebuild tous les conteneurs
	@echo "$(YELLOW)Rebuild des conteneurs...$(NC)"
	docker-compose --profile api --profile tiles up --build --force-recreate

install: ## Installer les dépendances dans le conteneur
	docker-compose run --rm web-dev npm install

test: ## Lancer les tests (si configurés)
	docker-compose run --rm web-dev npm test

lint: ## Lancer le linter
	docker-compose run --rm web-dev npm run lint

prune: ## Nettoyer les ressources Docker non utilisées
	@echo "$(YELLOW)Nettoyage des ressources Docker non utilisées...$(NC)"
	docker system prune -af --volumes
	@echo "$(GREEN)Nettoyage terminé$(NC)"

env-setup: ## Créer le fichier .env depuis .env.template
	@if [ ! -f .env ]; then \
		cp .env.template .env; \
		echo "$(GREEN)Fichier .env créé depuis .env.template$(NC)"; \
	else \
		echo "$(YELLOW)Le fichier .env existe déjà$(NC)"; \
	fi