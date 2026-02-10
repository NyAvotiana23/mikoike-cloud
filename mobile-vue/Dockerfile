# ==============================================
# Stage 1: Base - Installation des dépendances
# ==============================================
FROM node:20-alpine AS base

WORKDIR /app

# Installation des dépendances système nécessaires
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git

# Copier les fichiers de dépendances
COPY package.json package-lock.json* ./

# ==============================================
# Stage 2: Development - Environnement de dev
# ==============================================
FROM base AS development

# Installation des dépendances (dev + prod)
RUN npm ci

# Copier tous les fichiers du projet
COPY . .

# Exposer le port Vite
EXPOSE 5173

# Commande de démarrage en mode dev
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# ==============================================
# Stage 3: Builder - Build de production
# ==============================================
FROM base AS builder

# Installation des dépendances (prod uniquement pour un build plus léger)
RUN npm ci --only=production --ignore-scripts && \
    npm cache clean --force

# Copier le reste des fichiers
COPY . .

# Build de l'application
RUN npm run build

# ==============================================
# Stage 4: Production - Serveur Nginx
# ==============================================
FROM nginx:alpine AS production

# Copier la configuration Nginx personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copier les fichiers buildés depuis le stage builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Exposer le port 80
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Démarrer Nginx
CMD ["nginx", "-g", "daemon off;"]