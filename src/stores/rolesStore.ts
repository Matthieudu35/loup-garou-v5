import { writable, derived, get } from 'svelte/store';
import { users, selectedPlayers, updateUsers } from './usersStore';
import { browser } from '$app/environment';
import type { User } from './types';

export interface RolesConfig {
  loupGarou: number;
  loupSolitaire: number;
  infectPereDesLoups: number;
  grandMechantLoup: number;
  loupBlanc: number;
  enfantSauvage: number;
  chienLoup: number;
  voyante: number;
  sorciere: number;
  chasseur: number;
  soeurRouge: number;
  soeurBleue: number;
  frereVert: number;
  frereJaune: number;
  ancien: number;
  villageois: number;
}

const initialRoles: RolesConfig = {
  loupGarou: 5,
  loupSolitaire: 3,
  infectPereDesLoups: 1,
  grandMechantLoup: 1,
  loupBlanc: 1,
  enfantSauvage: 1,
  chienLoup: 1,
  voyante: 2,
  sorciere: 2,
  chasseur: 6,
  soeurRouge: 2,
  soeurBleue: 2,
  frereVert: 3,
  frereJaune: 3,
  ancien: 1,
  villageois: 33
};

// Callback pour les changements de configuration des rôles
let onRolesConfigChange: ((config: RolesConfig) => void) | null = null;

// Store de base pour la configuration des rôles
const baseRolesConfig = writable<RolesConfig>(initialRoles);

// Store avec méthodes set et update
export const rolesConfig = (() => {
    const { subscribe } = derived(baseRolesConfig, ($config) => {
        if (onRolesConfigChange) {
            onRolesConfigChange($config);
        }
        return $config;
    });

    return {
        subscribe,
        set: (config: RolesConfig) => {
            baseRolesConfig.set(config);
        },
        update: (updater: (config: RolesConfig) => RolesConfig) => {
            baseRolesConfig.update(updater);
        }
    };
})();

// Fonction pour configurer le callback de changement de configuration
export function setRolesConfigCallback(callback: (config: RolesConfig) => void) {
    onRolesConfigChange = callback;
    // Appeler le callback immédiatement avec l'état actuel
    baseRolesConfig.subscribe(config => {
        callback(config);
    })();
}

export const totalPlayers = derived(rolesConfig, $rolesConfig =>
  Object.values($rolesConfig).reduce((sum, count) => sum + count, 0)
);

export const isSelectionComplete = derived(
  [selectedPlayers, totalPlayers],
  ([$selectedPlayers, $totalPlayers]) => $selectedPlayers.length === $totalPlayers
);

// Callback pour les changements d'état d'attribution des rôles
let onRolesAssignedChange: ((assigned: boolean) => void) | null = null;

// Store de base pour l'état d'attribution des rôles
const baseRolesAssigned = writable(false);

// Store avec méthodes set et update
export const rolesAssigned = (() => {
    const { subscribe } = derived(baseRolesAssigned, ($assigned) => {
        if (onRolesAssignedChange) {
            onRolesAssignedChange($assigned);
        }
        return $assigned;
    });

    return {
        subscribe,
        set: (assigned: boolean) => {
            baseRolesAssigned.set(assigned);
        },
        update: (updater: (assigned: boolean) => boolean) => {
            baseRolesAssigned.update(updater);
        }
    };
})();

// Fonction pour configurer le callback de changement d'état d'attribution
export function setRolesAssignedCallback(callback: (assigned: boolean) => void) {
    onRolesAssignedChange = callback;
    // Appeler le callback immédiatement avec l'état actuel
    baseRolesAssigned.subscribe(assigned => {
        callback(assigned);
    })();
}

export function assignRoles() {
  const rolesToAssign: string[] = [];

  const roleDisplayNames: Record<keyof RolesConfig, string> = {
    loupGarou: 'Loup-garou',
    loupSolitaire: 'Loup solitaire',
    infectPereDesLoups: 'Infect Père des loups',
    grandMechantLoup: 'Grand Méchant Loup',
    loupBlanc: 'Loup blanc',
    enfantSauvage: 'Enfant sauvage',
    chienLoup: 'Chien-loup',
    voyante: 'Voyante',
    sorciere: 'Sorcière',
    chasseur: 'Chasseur',
    soeurRouge: 'Soeur rouge',
    soeurBleue: 'Soeur bleue',
    frereVert: 'Frère vert',
    frereJaune: 'Frère jaune',
    ancien: 'Ancien',
    villageois: 'Villageois'
  };

  Object.entries(get(baseRolesConfig)).forEach(([role, count]) => {
    for (let i = 0; i < count; i++) {
      rolesToAssign.push(roleDisplayNames[role as keyof RolesConfig] || role);
    }
  });

  // Mélanger aléatoirement les rôles
  for (let i = rolesToAssign.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rolesToAssign[i], rolesToAssign[j]] = [rolesToAssign[j], rolesToAssign[i]];
  }

  const selectedPlayersList = get(selectedPlayers);

  // Mettre à jour les utilisateurs
  updateUsers(usersList => 
    usersList.map(user => {
      const index = selectedPlayersList.indexOf(user.login);
      if (index !== -1) {
        return { ...user, role: rolesToAssign[index] };
      }
      return user;
    })
  );

  // Afficher les rôles spéciaux
  const specialRoles = get(users)
    .filter(user => user.role && user.role !== 'Villageois')
    .map(user => `${user.login}: ${user.role}`);
  console.log('Rôles spéciaux:', specialRoles);

  // Log spécifique pour les Enfants Sauvages
  const enfantsSauvages = get(users)
    .filter(user => user.role === 'Enfant sauvage')
    .map(user => `${user.login}: ${user.role}`);
  console.log('%cENFANTS SAUVAGES:', 'background: #e74c3c; color: white; font-size: 16px; padding: 5px;');
  console.log('%c' + JSON.stringify(enfantsSauvages, null, 2), 'color: #e74c3c; font-size: 14px;');

  baseRolesAssigned.set(true);
}

export function resetRoles() {
  if (browser) {
    const usersList = get(users);
    usersList.forEach(user => {
      localStorage.removeItem(`role_${user.login}`);
    });
    baseRolesAssigned.set(false);
  }
}
