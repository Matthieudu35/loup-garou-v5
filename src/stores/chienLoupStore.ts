import { writable, derived, get } from 'svelte/store';
import { users } from './usersStore';
import { currentUser } from './authStore';
import { Team, getTeamByRoleName } from './teams';
import { gameState, type GameState } from './gameState';
import { browser } from '$app/environment';
import { setCurrentUserCallback, setUserStateCallback } from './authStore';
import type { User } from './types';

interface ChienLoupState {
  login: string;
  camp: 'loups' | 'village' | null;
  hasChosen: boolean;
}

// Callbacks
let onChienLoupStatesChange: ((states: Record<string, ChienLoupState>) => void) | null = null;
let onUserTeamChange: ((login: string, team: Team) => void) | null = null;

// Store de base pour les états des Chien-Loups
const baseChienLoupStates = writable<Record<string, ChienLoupState>>({});

// Store avec méthodes set et update
export const chienLoupStates = (() => {
    const { subscribe } = derived(baseChienLoupStates, ($states) => {
        if (onChienLoupStatesChange) {
            onChienLoupStatesChange($states);
        }
        return $states;
    });

    return {
        subscribe,
        set: (states: Record<string, ChienLoupState>) => {
            baseChienLoupStates.set(states);
        },
        update: (updater: (states: Record<string, ChienLoupState>) => Record<string, ChienLoupState>) => {
            baseChienLoupStates.update(updater);
        }
    };
})();

// Fonction pour configurer le callback de changement d'état
export function setChienLoupStatesCallback(callback: (states: Record<string, ChienLoupState>) => void) {
    onChienLoupStatesChange = callback;
    // Appeler le callback immédiatement avec l'état actuel
    baseChienLoupStates.subscribe(states => {
        callback(states);
    })();
}

// Fonction pour configurer le callback de changement d'équipe
export function setUserTeamCallback(callback: (login: string, team: Team) => void) {
    onUserTeamChange = callback;
}

// Fonction pour mettre à jour le camp du Chien-Loup
export function setChienLoupCamp(login: string, camp: 'loups' | 'village') {
    baseChienLoupStates.update(states => {
        const newStates = {
            ...states,
            [login]: { login, camp, hasChosen: true }
        };
        return newStates;
    });

    // Notifier le changement d'équipe si nécessaire
    if (camp === 'loups' && onUserTeamChange) {
        onUserTeamChange(login, Team.WEREWOLVES);
    }
}

// Fonction pour réinitialiser l'état de tous les Chien-Loups
export function resetChienLoupStates() {
    baseChienLoupStates.set({});
}

// Store dérivé pour obtenir l'état du chien-loup courant
export const currentChienLoupState = derived(
    [chienLoupStates],
    ([$chienLoupStates]) => {
        const currentLogin = getCurrentUserLogin();
        return currentLogin ? $chienLoupStates[currentLogin] : undefined;
    }
);

// Fonction utilitaire pour obtenir le login de l'utilisateur courant
function getCurrentUserLogin(): string | null {
    let currentLogin: string | null = null;
    // Cette fonction devrait être remplacée par une meilleure méthode d'accès à l'utilisateur courant
    return currentLogin;
}

// Store dérivé pour vérifier si le joueur courant est un Chien-Loup
export const isCurrentPlayerChienLoup = derived(
    [currentChienLoupState],
    ([$currentChienLoupState]) => {
        if (!$currentChienLoupState) return false;
        return true;
    }
);

// Fonction utilitaire pour vérifier si un rôle est celui d'un loup
export function isWolfRole(role: string): boolean {
    if (!role) return false;
    const roleLC = role.toLowerCase();
    const isWolf = /loup[\s-]?garou|loup[\s-]?blanc|grand[\s-]?m[ée]chant[\s-]?loup|infect[\s-]?p[èe]re[\s-]?des[\s-]?loups|loup[\s-]?solitaire/i.test(roleLC);
    
    console.log('isWolfRole Debug:', {
        role,
        roleLC,
        isWolf
    });
    
    return isWolf;
}

// Store dérivé pour vérifier si le joueur courant est un loup (après avoir choisi)
export const isCurrentPlayerWolf = derived(
    [currentChienLoupState],
    ([$currentChienLoupState]) => {
        if (!$currentChienLoupState) return false;
        
        if ($currentChienLoupState.hasChosen) {
            return $currentChienLoupState.camp === 'loups';
        }
        
        return false;
    }
);

// Dans initializeBrowserSubscriptions
setCurrentUserCallback((login) => {
    gameState.update((state: GameState) => ({
        ...state,
        users: state.users.map((u: User) => ({
            ...u,
            isCurrentUser: u.login === login
        }))
    }));
});

setUserStateCallback((user) => {
    // Gérer les changements d'état de l'utilisateur si nécessaire
}); 