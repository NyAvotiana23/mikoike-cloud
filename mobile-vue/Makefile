.PHONY: help dev prod android-build stop clean logs

# Couleurs pour les messages
BLUE=\033[0;34m
GREEN=\033[0;32m
YELLOW=\033[1;33m
NC=\033[0m # No Color

help: ## Afficher l'aide
	@echo "$(BLUE)Commandes disponibles pour le projet Ionic Vue$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(GREEN)%-20s$(NC) %s\n", $$1, $$2}'

dev: ## Lancer le serveur de développement
	@echo "$(YELLOW)Démarrage du serveur de développement...$(NC)"
	docker-compose up dev

dev-build: ## Build et lancer le serveur de développement
	@echo "$(YELLOW)Build et démarrage du serveur de développement...$(NC)"
	docker-compose up --build dev

dev-detached: ## Lancer le serveur de développement en arrière-plan
	@echo "$(YELLOW)Démarrage du serveur de développement en arrière-plan...$(NC)"
	docker-compose up -d dev

prod: ## Lancer le serveur de production
	@echo "$(YELLOW)Démarrage du serveur de production...$(NC)"
	docker-compose up prod

prod-build: ## Build et lancer le serveur de production
	@echo "$(YELLOW)Build et démarrage du serveur de production...$(NC)"
	docker-compose up --build prod

prod-detached: ## Lancer le serveur de production en arrière-plan
	@echo "$(YELLOW)Démarrage du serveur de production en arrière-plan...$(NC)"
	docker-compose up -d prod

android-build: ## Build l'application Android (APK)
	@echo "$(YELLOW)Build de l'application Android...$(NC)"
	@mkdir -p output
	docker-compose --profile android up --build android-build
	@echo "$(GREEN)APK généré dans le dossier ./output$(NC)"

stop: ## Arrêter tous les conteneurs
	@echo "$(YELLOW)Arrêt des conteneurs...$(NC)"
	docker-compose down

clean: ## Nettoyer les conteneurs, images et volumes
	@echo "$(YELLOW)Nettoyage des conteneurs, images et volumes...$(NC)"
	docker-compose down -v --rmi all
	@rm -rf output
	@echo "$(GREEN)Nettoyage terminé$(NC)"

logs: ## Afficher les logs des conteneurs
	docker-compose logs -f

logs-dev: ## Afficher les logs du conteneur de développement
	docker-compose logs -f dev

logs-prod: ## Afficher les logs du conteneur de production
	docker-compose logs -f prod

shell-dev: ## Ouvrir un shell dans le conteneur de développement
	docker-compose exec dev sh

shell-prod: ## Ouvrir un shell dans le conteneur de production
	docker-compose exec prod sh

restart: ## Redémarrer tous les conteneurs
	@echo "$(YELLOW)Redémarrage des conteneurs...$(NC)"
	docker-compose restart

rebuild: ## Rebuild tous les conteneurs
	@echo "$(YELLOW)Rebuild des conteneurs...$(NC)"
	docker-compose up --build --force-recreate

install: ## Installer les dépendances dans le conteneur
	docker-compose run --rm dev npm install

test: ## Lancer les tests
	docker-compose run --rm dev npm test

lint: ## Lancer le linter
	docker-compose run --rm dev npm run lint

prune: ## Nettoyer les ressources Docker non utilisées
	@echo "$(YELLOW)Nettoyage des ressources Docker non utilisées...$(NC)"
	docker system prune -af --volumes
	@echo "$(GREEN)Nettoyage terminé$(NC)"