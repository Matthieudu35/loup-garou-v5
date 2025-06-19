import { gameState, initialState, type GameState } from './gameState';
import type { TimerState } from './timerStore';
import type { User } from './types';
import type { Association, Memo } from '$lib/types';

// Callbacks pour la synchronisation (optionnels, si utilisés ailleurs)
let onTimerChange: ((timerState: TimerState) => void) | null = null;
let onRolesAssignedChange: ((assigned: boolean) => void) | null = null;
let onUsersChange: ((users: User[]) => void) | null = null;
let onSelectedPlayersChange: ((players: string[]) => void) | null = null;
let onDayVotesChange: ((votes: Record<string, string>) => void) | null = null;
let onSecondRoundChange: ((isSecondRound: boolean, candidates: string[]) => void) | null = null;
let onCurrentUserChange: ((login: string | null) => void) | null = null;

// Fonctions pour configurer les callbacks (optionnelles)
export function setTimerCallback(callback: (timerState: TimerState) => void) {
    onTimerChange = callback;
}

export function setRolesAssignedCallback(callback: (assigned: boolean) => void) {
    onRolesAssignedChange = callback;
}

export function setUsersCallback(callback: (users: User[]) => void) {
    onUsersChange = callback;
}

export function setSelectedPlayersCallback(callback: (players: string[]) => void) {
    onSelectedPlayersChange = callback;
}

export function setDayVotesCallback(callback: (votes: Record<string, string>) => void) {
    onDayVotesChange = callback;
}

export function setSecondRoundCallback(callback: (isSecondRound: boolean, candidates: string[]) => void) {
    onSecondRoundChange = callback;
}

export function setCurrentUserCallback(callback: (login: string | null) => void) {
    onCurrentUserChange = callback;
}

// Fonctions pures de manipulation d'état (exemples)
export function resetGame() {
    gameState.set(initialState);
    // Les effets de bord (updateTheme, resetAll, etc.) doivent être gérés dans gameLogic.ts ou ailleurs
}

// Ajoute ici d'autres fonctions pures si besoin

