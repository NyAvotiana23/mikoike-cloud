import { ref, computed } from 'vue';
import type { User } from './auth.service';

// Types d'utilisateurs
export type UserType = 'authenticated' | 'visitor';

export interface UserContext {
  type: UserType;
  userId?: string;
  email?: string;
  name?: string;
  displayName?: string;
}

// État global du contexte utilisateur
const userContext = ref<UserContext>({
  type: 'visitor'
});

export const useUserContext = () => {
  const setAuthenticatedUser = (user: User) => {
    userContext.value = {
      type: 'authenticated',
      userId: user.id,
      email: user.email,
      name: user.name || user.displayName || '',
      displayName: user.displayName || user.name || ''
    };
    console.log('👤 Contexte utilisateur défini:', userContext.value);
  };

  const setVisitor = () => {
    userContext.value = {
      type: 'visitor'
    };
    console.log('👤 Mode visiteur activé');
  };

  const clearContext = () => {
    userContext.value = {
      type: 'visitor'
    };
    console.log('👤 Contexte utilisateur effacé');
  };

  const isAuthenticated = computed(() => userContext.value.type === 'authenticated');
  const isVisitor = computed(() => userContext.value.type === 'visitor');
  const getCurrentUserId = computed(() => userContext.value.userId || null);
  const getCurrentUserEmail = computed(() => userContext.value.email || null);

  return {
    userContext,
    setAuthenticatedUser,
    setVisitor,
    clearContext,
    isAuthenticated,
    isVisitor,
    getCurrentUserId,
    getCurrentUserEmail
  };
};

