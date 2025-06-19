import { get } from 'svelte/store';
import { gameState, type GameState, initialState } from './gameState';
import { timer } from './timerStore';
import { users, setUsersCallback } from './usersStore';
import { rolesAssigned, setRolesAssignedCallback } from './rolesStore';
import { enfantSauvageStates, setEnfantSauvageStatesCallback } from './enfantSauvageStore';
import { chienLoupStates, setChienLoupStatesCallback } from './chienLoupStore';
import { allies, setAlliesCallback } from './alliesStore';
import { memos, setMemosCallback } from './memosStore';
import { eliminationStore, setEliminationsCallback } from './eliminationStore';
import { dayVotes, setDayVotesCallback, setSecondRoundCallback } from './dayVoteStore';
import { setLoupVotesCallback, setLoupVictimCallback } from './chosen';
import { browser } from '$app/environment';
import { currentUser } from './authStore';

const apiURL = 'https://proactive-balance-production.up.railway.app';
let fetchInterval: ReturnType<typeof setInterval> | null = null;

// Fonction pour récupérer l'état depuis le backend
export async function fetchGameState(): Promise<void> {
    try {
        const response = await fetch(`${apiURL}/game-state`);
        if (!response.ok) throw new Error('Failed to fetch game state');
        const data = await response.json();
        gameState.set(data);
    } catch (error) {
        console.error('Error fetching game state:', error);
    }
}

// Fonction pour mettre à jour l'état sur le backend
export async function updateGameState(state: any): Promise<void> {
    try {
        const { showMayorElection, ...stateToSave } = state;
        const response = await fetch(`${apiURL}/game-state`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(stateToSave),
        });
        if (!response.ok) throw new Error('Failed to update game state');
    } catch (error) {
        console.error('Error updating game state:', error);
    }
}

// Fonction centrale d'initialisation de la logique de synchronisation
export function initializeGameLogic() {
    if (!browser) return;

    // Démarre la synchro périodique
    fetchGameState();
    fetchInterval = setInterval(fetchGameState, 2000);

    // Sauvegarde à chaque changement
    gameState.subscribe((state: GameState) => {
        updateGameState(state);
    });

    // Synchronisation du timer
    timer.subscribe(timerState => {
        gameState.update((state: GameState) => ({ ...state, timer: timerState }));
    });

    // Synchronisation des utilisateurs
    setUsersCallback(usersList => {
        gameState.update((state: GameState) => ({ ...state, users: usersList }));
    });

    // Synchronisation des rôles assignés
    setRolesAssignedCallback(assigned => {
        gameState.update((state: GameState) => ({ ...state, rolesAssigned: assigned }));
    });

    // Synchronisation des Enfants Sauvages
    setEnfantSauvageStatesCallback(states => {
        gameState.update((state: GameState) => ({ ...state, enfantSauvageStates: states }));
    });

    // Synchronisation des Chien-Loup
    setChienLoupStatesCallback(states => {
        gameState.update((state: GameState) => ({ ...state, chienLoupStates: states }));
    });

    // Synchronisation des alliés
    setAlliesCallback(assocs => {
        gameState.update((state: GameState) => ({ ...state, allies: assocs }));
    });

    // Synchronisation des mémos
    setMemosCallback(memosList => {
        gameState.update((state: GameState) => ({ ...state, memos: memosList }));
    });

    // Synchronisation des éliminations
    setEliminationsCallback(elims => {
        gameState.update((state: GameState) => ({ ...state, eliminations: elims }));
    });

    // Synchronisation des votes du jour
    setDayVotesCallback(votes => {
        gameState.update((state: GameState) => ({ ...state, dayVotes: votes }));
    });

    // Synchronisation du second tour
    setSecondRoundCallback((isSecondRound, candidates) => {
        gameState.update((state: GameState) => ({ ...state, isSecondRound, secondRoundCandidates: candidates }));
    });

    // Synchronisation des votes des loups
    setLoupVotesCallback(votes => {
        gameState.update((state: GameState) => ({ ...state, loupVotes: votes }));
    });

    // Synchronisation de la victime des loups
    setLoupVictimCallback(victim => {
        gameState.update((state: GameState) => ({ ...state, loupVictim: victim }));
    });

    // Ajoute ici d'autres synchronisations si besoin
}

// Démarrer la partie
export function startGame() {
    gameState.update((state: GameState) => ({
        ...state,
        gameStarted: true,
        phase: 'nuit',
        cycleCount: 1,
        // Ajoute ici d'autres initialisations si besoin
    }));
}

// Changer de phase (jour <-> nuit)
export function switchPhase() {
    gameState.update((state: GameState) => ({
        ...state,
        phase: state.phase === 'nuit' ? 'jour' : 'nuit',
        cycleCount: state.phase === 'nuit' ? state.cycleCount : state.cycleCount + 1,
        // Ajoute ici d'autres transitions si besoin
    }));
}

// Réinitialiser la partie
export function resetGame() {
    gameState.set(initialState);
}

// Ajouter un mémo pour l'utilisateur courant
export function addMemo(text: string) {
    const user = get(currentUser);
    if (!user) return;
    const memoText = `[${user.firstName}] ${text}`;
    memos.update(memosList => [
        ...memosList,
        {
            text: memoText,
            timestamp: Date.now()
        }
    ]);
}

// Fonction utilitaire pour obtenir un utilisateur par login
export function getUserByLogin(login: string) {
    const usersList = get(users);
    return usersList.find(u => u.login === login);
}

// Fonction utilitaire pour supprimer un mémo par index
export function deleteMemo(index: number) {
    memos.update(memosList => memosList.filter((_, i) => i !== index));
} 