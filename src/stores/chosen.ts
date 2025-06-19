import { writable, derived, get } from 'svelte/store';
import { users } from './usersStore';
import { eliminationStore } from './eliminationStore';
import { browser } from '$app/environment';

// Callbacks
let onLoupVotesChange: ((votes: Record<string, string>) => void) | null = null;
let onLoupVictimChange: ((victim: string | null) => void) | null = null;

// Store de base pour les votes des loups
// Format: { [loginLoup]: loginVictime }
const baseLoupVotes = writable<Record<string, string>>({});

// Store avec méthodes set et update
export const loupVotes = (() => {
    const { subscribe } = derived(baseLoupVotes, ($votes) => {
        if (onLoupVotesChange) {
            onLoupVotesChange($votes);
        }
        return $votes;
    });

    return {
        subscribe,
        set: (votes: Record<string, string>) => {
            baseLoupVotes.set(votes);
        },
        update: (updater: (votes: Record<string, string>) => Record<string, string>) => {
            baseLoupVotes.update(updater);
        }
    };
})();

// Store de base pour la victime des loups
const baseLoupVictim = writable<string | null>(null);

// Store avec méthodes set et update
export const loupVictim = (() => {
    const { subscribe } = derived(baseLoupVictim, ($victim) => {
        if (onLoupVictimChange) {
            onLoupVictimChange($victim);
        }
        return $victim;
    });

    return {
        subscribe,
        set: (victim: string | null) => {
            baseLoupVictim.set(victim);
        }
    };
})();

// Fonction pour configurer le callback de changement de votes
export function setLoupVotesCallback(callback: (votes: Record<string, string>) => void) {
    onLoupVotesChange = callback;
    // Appeler le callback immédiatement avec l'état actuel
    baseLoupVotes.subscribe(votes => {
        callback(votes);
    })();
}

// Fonction pour configurer le callback de changement de victime
export function setLoupVictimCallback(callback: (victim: string | null) => void) {
    onLoupVictimChange = callback;
    // Appeler le callback immédiatement avec l'état actuel
    baseLoupVictim.subscribe(victim => {
        callback(victim);
    })();
}

// Fonction pour ajouter/modifier un vote
export function setLoupVote(loupLogin: string, victimeLogin: string) {
    baseLoupVotes.update(votes => ({
        ...votes,
        [loupLogin]: victimeLogin
    }));
}

// Fonction pour réinitialiser les votes à chaque nuit
export function resetLoupVotes() {
    baseLoupVotes.set({});
}

// Fonction pour obtenir la victime majoritaire
export function getMajorityVictim(): string | null {
    const votes = get(baseLoupVotes);
    const voteCounts: Record<string, number> = {};
    
    // Compter les votes pour chaque victime
    Object.values(votes).forEach(victimeLogin => {
        voteCounts[victimeLogin] = (voteCounts[victimeLogin] || 0) + 1;
    });
    
    // Trouver la victime avec le plus de votes
    let maxVotes = 0;
    let majorityVictim: string | null = null;
    
    Object.entries(voteCounts).forEach(([victimeLogin, count]) => {
        if (count > maxVotes) {
            maxVotes = count;
            majorityVictim = victimeLogin;
        }
    });
    
    return majorityVictim;
}

// Store dérivé pour obtenir la liste des joueurs vivants (cibles potentielles)
export const alivePlayers = derived(
    [users, eliminationStore],
    ([$users, $eliminationStore]) => {
        return $users.filter(user => {
            // Filtrer les joueurs non éliminés
            return !$eliminationStore.some(e => e.playerLogin === user.login);
        });
    }
);

// Store dérivé pour obtenir le vote d'un loup spécifique
export const getLoupVote = (loupLogin: string) => {
    return derived(loupVotes, $loupVotes => $loupVotes[loupLogin] || null);
};

// Fonction pour définir la victime des loups
export function setLoupVictim(victimLogin: string | null) {
    baseLoupVictim.set(victimLogin);
}

// Fonction pour réinitialiser la victime
export function resetLoupVictim() {
    baseLoupVictim.set(null);
}
