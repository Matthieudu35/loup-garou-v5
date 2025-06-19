import { writable, derived, get } from 'svelte/store';
import { users, eliminatePlayer as updateUserAlive } from './usersStore';
import { browser } from '$app/environment';
import { checkMasterDeath } from './enfantSauvageStore';
import type { User } from './types';

// Types
export type EliminationSource = 'admin' | 'vote' | 'loup-garou' | 'sorcière' | 'chasseur' | 'other';
export type EliminationReason = 'vote' | 'attaque' | 'pouvoir' | 'admin' | 'other';

export interface Elimination {
    playerLogin: string;
    source: EliminationSource;
    reason: EliminationReason;
    timestamp: number;
    details?: string;
}

// Callbacks
let onEliminationsChange: ((eliminations: Elimination[]) => void) | null = null;

// Store de base pour la liste des éliminations
const baseEliminations = writable<Elimination[]>([]);

// Store avec méthodes set et update
export const eliminationStore = (() => {
    const { subscribe } = derived(baseEliminations, ($eliminations) => {
        if (onEliminationsChange) {
            onEliminationsChange($eliminations);
        }
        return $eliminations;
    });

    return {
        subscribe,
        eliminate: (playerLogin: string, source: EliminationSource, reason: EliminationReason, details?: string) => {
            // Vérifier si le joueur est déjà éliminé
            const currentEliminations = get(baseEliminations);
            const isAlreadyEliminated = currentEliminations.some(e => e.playerLogin === playerLogin);
            if (isAlreadyEliminated) {
                console.warn(`Le joueur ${playerLogin} est déjà éliminé`);
                return false;
            }

            // Vérifier si l'élimination est valide selon la phase du jeu
            if (!isValidElimination(playerLogin, source, reason)) {
                console.warn(`Élimination invalide pour ${playerLogin} (${source}, ${reason})`);
                return false;
            }

            // Créer la nouvelle élimination
            const elimination: Elimination = {
                playerLogin,
                source,
                reason,
                timestamp: Date.now(),
                details
            };

            // Mettre à jour les stores
            baseEliminations.update(eliminations => [...eliminations, elimination]);
            updateUserAlive(playerLogin);

            // Gérer les conséquences de l'élimination
            handleEliminationConsequences(playerLogin, source, reason);

            // Appeler la vérification de l'enfant sauvage
            checkMasterDeath();

            return true;
        },
        resurrect: (playerLogin: string) => {
            baseEliminations.update(eliminations => eliminations.filter(e => e.playerLogin !== playerLogin));
            updateUserAlive(playerLogin);
            return true;
        },
        reset: () => {
            baseEliminations.set([]);
        }
    };
})();

// Fonction pour configurer le callback de changement d'éliminations
export function setEliminationsCallback(callback: (eliminations: Elimination[]) => void) {
    onEliminationsChange = callback;
    // Appeler le callback immédiatement avec l'état actuel
    baseEliminations.subscribe(eliminations => {
        callback(eliminations);
    })();
}

// Fonction pour vérifier si une élimination est valide
function isValidElimination(playerLogin: string, source: EliminationSource, reason: EliminationReason): boolean {
    if (source === 'admin') return true; // L'admin peut toujours éliminer
    return true; // Pour l'instant, on autorise toutes les éliminations
}

// Fonction pour gérer les conséquences d'une élimination
function handleEliminationConsequences(playerLogin: string, source: EliminationSource, reason: EliminationReason) {
    // TODO: Implémenter les conséquences spécifiques
    // - Vérifier la victoire
    // - Gérer les pouvoirs spéciaux (chasseur, etc.)
    // - Notifier les autres joueurs
    // - Mettre à jour les statistiques
}

// Store dérivé pour les joueurs éliminés
export const eliminatedPlayers = derived(eliminationStore, $eliminationStore => 
    $eliminationStore.map(e => e.playerLogin)
);

// Store dérivé pour les éliminations par source
export const eliminationsBySource = derived(eliminationStore, $eliminationStore => {
    const bySource: Record<EliminationSource, Elimination[]> = {
        'admin': [],
        'vote': [],
        'loup-garou': [],
        'sorcière': [],
        'chasseur': [],
        'other': []
    };
    
    $eliminationStore.forEach(elimination => {
        bySource[elimination.source].push(elimination);
    });
    
    return bySource;
});

// Store dérivé pour les éliminations par raison
export const eliminationsByReason = derived(eliminationStore, $eliminationStore => {
    const byReason: Record<EliminationReason, Elimination[]> = {
        'vote': [],
        'attaque': [],
        'pouvoir': [],
        'admin': [],
        'other': []
    };
    
    $eliminationStore.forEach(elimination => {
        byReason[elimination.reason].push(elimination);
    });
    
    return byReason;
}); 