import { writable, derived, get } from 'svelte/store';
import { browser } from '$app/environment';

// Type pour stocker les votes : login du votant → login de la cible
type VoteMap = Record<string, string>;

// Callbacks
let onDayVotesChange: ((votes: VoteMap) => void) | null = null;
let onSecondRoundChange: ((isSecondRound: boolean, candidates: string[]) => void) | null = null;

// Store de base pour les votes du jour
const baseDayVotes = writable<VoteMap>({});

// Store avec méthodes set et update
export const dayVotes = (() => {
    const { subscribe } = derived(baseDayVotes, ($votes) => {
        if (onDayVotesChange) {
            onDayVotesChange($votes);
        }
        return $votes;
    });

    return {
        subscribe,
        set: (votes: VoteMap) => {
            baseDayVotes.set(votes);
        },
        update: (updater: (votes: VoteMap) => VoteMap) => {
            baseDayVotes.update(updater);
        }
    };
})();

// Store de base pour le second tour
const baseIsSecondRound = writable<boolean>(false);

// Store avec méthodes set et update
export const isSecondRound = (() => {
    const { subscribe } = derived(baseIsSecondRound, ($isSecondRound) => {
        if (onSecondRoundChange) {
            onSecondRoundChange($isSecondRound, get(baseSecondRoundCandidates));
        }
        return $isSecondRound;
    });

    return {
        subscribe,
        set: (value: boolean) => {
            baseIsSecondRound.set(value);
        },
        update: (updater: (value: boolean) => boolean) => {
            baseIsSecondRound.update(updater);
        }
    };
})();

// Store de base pour les candidats du second tour
const baseSecondRoundCandidates = writable<string[]>([]);

// Store avec méthodes set et update
export const secondRoundCandidates = (() => {
    const { subscribe } = derived(baseSecondRoundCandidates, ($candidates) => {
        if (onSecondRoundChange) {
            onSecondRoundChange(get(baseIsSecondRound), $candidates);
        }
        return $candidates;
    });

    return {
        subscribe,
        set: (candidates: string[]) => {
            baseSecondRoundCandidates.set(candidates);
        },
        update: (updater: (candidates: string[]) => string[]) => {
            baseSecondRoundCandidates.update(updater);
        }
    };
})();

// Fonction pour configurer le callback de changement de votes
export function setDayVotesCallback(callback: (votes: VoteMap) => void) {
    onDayVotesChange = callback;
    // Appeler le callback immédiatement avec l'état actuel
    baseDayVotes.subscribe(votes => {
        callback(votes);
    })();
}

// Fonction pour configurer le callback de changement de second tour
export function setSecondRoundCallback(callback: (isSecondRound: boolean, candidates: string[]) => void) {
    onSecondRoundChange = callback;
    // Appeler le callback immédiatement avec l'état actuel
    baseIsSecondRound.subscribe(isSecondRound => {
        callback(isSecondRound, get(baseSecondRoundCandidates));
    })();
}

// Enregistrer ou modifier un vote
export function setDayVote(voterLogin: string, targetLogin: string) {
    let isValidTarget = true;
    
    // Vérifier si on est au second tour
    if (get(baseIsSecondRound)) {
        const candidates = get(baseSecondRoundCandidates);
        isValidTarget = candidates.includes(targetLogin);
    }

    // Vérifier que le votant et la cible existent et que la cible est valide au second tour
    if (!voterLogin || !targetLogin || !isValidTarget) {
        console.warn('Vote invalide');
        return;
    }
    
    baseDayVotes.update(votes => ({
        ...votes,
        [voterLogin]: targetLogin
    }));
}

// Réinitialiser les votes du jour
export function resetDayVotes() {
    baseDayVotes.set({});
}

// Réinitialiser tous les votes et le second tour
export function resetAll() {
    baseDayVotes.set({});
    baseIsSecondRound.set(false);
    baseSecondRoundCandidates.set([]);
}

// Store dérivé : comptage des voix par joueur
export const voteCounts = derived(dayVotes, $votes => {
    const counts: Record<string, number> = {};
    Object.values($votes).forEach(target => {
        counts[target] = (counts[target] || 0) + 1;
    });
    return counts;
});

// Obtenir les candidats à égalité avec le plus de voix
function getTopTiedCandidates(voteCountMap: Record<string, number>): string[] {
    const sorted = Object.entries(voteCountMap).sort((a, b) => b[1] - a[1]);
    if (sorted.length === 0) return [];
    
    const maxVotes = sorted[0][1];
    return sorted
        .filter(([_, votes]) => votes === maxVotes)
        .map(([login, _]) => login);
}

// Obtenir le résultat du vote et détecter les égalités
export function getVoteResult(): { winner: string | null, isTie: boolean, tiedCandidates: string[] } {
    const voteCountMap: Record<string, number> = {};
    const votesSnapshot = get(baseDayVotes);

    for (const target of Object.values(votesSnapshot)) {
        voteCountMap[target] = (voteCountMap[target] || 0) + 1;
    }

    const sorted = Object.entries(voteCountMap).sort((a, b) => b[1] - a[1]);

    if (sorted.length === 0) return { winner: null, isTie: false, tiedCandidates: [] };
    
    if (sorted.length > 1 && sorted[0][1] === sorted[1][1]) {
        const tiedCandidates = getTopTiedCandidates(voteCountMap);
        return { winner: null, isTie: true, tiedCandidates };
    }

    return { winner: sorted[0][0], isTie: false, tiedCandidates: [] };
}

// Démarrer un second tour avec les candidats donnés
export function startSecondRound(candidates: string[]) {
    resetDayVotes();  // Réinitialiser les votes
    baseIsSecondRound.set(true);  // Activer le mode second tour
    baseSecondRoundCandidates.set(candidates);  // Définir les candidats éligibles
}
