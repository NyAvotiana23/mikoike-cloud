import { ref, computed } from 'vue';

// Types d'utilisateurs
export type UserType = 'authenticated' | 'visitor';

export interface UserContext {
  type: UserType;
  userId?: string;
  email?: string;
  nom?: string;
  prenom?: string;
}

// État global du contexte utilisateur
const userContext = ref<UserContext>({
  type: 'visitor'
});

export const useUserContext = () => {
  const setAuthenticatedUser = (user: { id: string; email: string; nom?: string; prenom?: string }) => {
    userContext.value = {
      type: 'authenticated',
      userId: user.id,
      email: user.email,
      nom: user.nom || '',
      prenom: user.prenom || ''
    };
  };

  const setVisitor = () => {
    userContext.value = {
      type: 'visitor'
    };
  };

  const isAuthenticated = computed(() => userContext.value.type === 'authenticated');
  const isVisitor = computed(() => userContext.value.type === 'visitor');

  return {
    userContext,
    setAuthenticatedUser,
    setVisitor,
    isAuthenticated,
    isVisitor
  };
};

