import { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
import authService from '@/services/auth.service';

/**
 * Guard pour protéger les routes nécessitant une authentification
 */
export const authGuard = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  // Attendre que l'authentification soit initialisée
  const maxWait = 3000; // 3 secondes max
  const startTime = Date.now();

  while (!authService.isAuthReady.value && (Date.now() - startTime) < maxWait) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  const isAuthenticated = authService.isAuthenticated.value;

  if (isAuthenticated) {
    // L'utilisateur est authentifié, continuer
    next();
  } else {
    // L'utilisateur n'est pas authentifié, rediriger vers la page de connexion
    console.log('🚫 Accès refusé - Authentification requise');
    next({
      path: '/login',
      query: { redirect: to.fullPath } // Sauvegarder l'URL demandée pour redirection après login
    });
  }
};

/**
 * Guard pour les routes accessibles uniquement aux visiteurs (ex: login)
 */
export const guestGuard = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  // Attendre que l'authentification soit initialisée
  const maxWait = 3000;
  const startTime = Date.now();

  while (!authService.isAuthReady.value && (Date.now() - startTime) < maxWait) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  const isAuthenticated = authService.isAuthenticated.value;

  if (isAuthenticated) {
    // L'utilisateur est déjà connecté, rediriger vers l'app
    console.log('✅ Utilisateur déjà connecté - Redirection');
    next('/tabs/map');
  } else {
    // L'utilisateur n'est pas connecté, continuer
    next();
  }
};

