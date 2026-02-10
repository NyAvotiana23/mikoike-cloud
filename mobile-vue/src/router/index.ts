import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import { useUserContext } from '@/services/user-context.service';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/welcome'
  },
  {
    path: '/welcome',
    name: 'Welcome',
    component: () => import('@/pages/WelcomePage.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/LoginPage.vue')
  },
  {
    path: '/tabs',
    component: () => import('@/views/TabsPage.vue'),
    children: [
      {
        path: '',
        redirect: '/tabs/map'
      },
      {
        path: 'map',
        name: 'Map',
        component: () => import('@/pages/MapPage.vue')  
      },
      {
        path: 'all-signalements',
        name: 'AllSignalements',
        component: () => import('@/pages/AllSignalementsPage.vue')
      },
      {
        path: 'signalements',
        name: 'UserSignalements',
        component: () => import('@/pages/UserSignalementsPage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'account',
        name: 'Account',
        component: () => import('@/pages/AccountPage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'notifications',
        name: 'Notifications',
        component: () => import('@/pages/NotificationsPage.vue'),
        meta: { requiresAuth: true }
      }
    ]
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/pages/DashboardPage.vue'),
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

// Auth Guard
router.beforeEach((to, from, next) => {
  const { isAuthenticated } = useUserContext();

  if (to.meta.requiresAuth && !isAuthenticated.value) {
    next('/login');
  } else if (to.path === '/login' && isAuthenticated.value) {
    next('/tabs/map');
  } else {
    next();
  }
});

export default router;