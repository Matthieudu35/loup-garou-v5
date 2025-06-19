import { writable, derived, get } from 'svelte/store';
import { browser } from '$app/environment';

export interface TimerState {
  timer: number;
  initialTimer: number;
  running: boolean;
  subTimers: Record<string, number>;
}

const initialTimer = 3600; // 1 heure en secondes

const defaultState: TimerState = {
  timer: initialTimer,
  initialTimer: initialTimer,
  running: false,
  subTimers: {}
};

// Callback pour les changements d'état du timer
let onTimerStateChange: ((state: TimerState) => void) | null = null;

// Store de base pour l'état du timer
const baseTimerState = writable<TimerState>(defaultState);

let interval: ReturnType<typeof setInterval> | null = null;
let onTimerComplete: (() => void) | null = null;

export function setTimerCompleteCallback(complete: () => void) {
    onTimerComplete = complete;
}

function startTimer() {
    stopTimer();

    baseTimerState.update(state => ({ ...state, running: true }));

    interval = setInterval(() => {
        baseTimerState.update(state => {
            if (state.timer > 0) {
                return { ...state, timer: state.timer - 1 };
            } else {
                stopTimer();
                onTimerComplete?.();
                setTimeout(() => startTimer(), 100);
                return { ...state, timer: state.initialTimer };
            }
        });
    }, 1000);
}

function stopTimer() {
    if (interval) {
        clearInterval(interval);
        interval = null;
    }
    baseTimerState.update(state => ({ ...state, running: false }));
}

function updateInitialTimer(newTime: number) {
    baseTimerState.update(state => ({
        ...state,
        initialTimer: newTime,
        timer: newTime
    }));
}

function addSubTimer(role: string, duration: number) {
    baseTimerState.update(state => ({
        ...state,
        subTimers: { ...state.subTimers, [role]: duration }
    }));
}

function startSubTimer(role: string) {
    const subTimer = get(baseTimerState).subTimers[role];
    if (!subTimer) return;

    stopTimer();

    const subInterval = setInterval(() => {
        baseTimerState.update(state => {
            if (state.subTimers[role] > 0) {
                return {
                    ...state,
                    subTimers: {
                        ...state.subTimers,
                        [role]: state.subTimers[role] - 1
                    }
                };
            } else {
                clearInterval(subInterval);
                return state;
            }
        });
    }, 1000);
}

function resetTimer() {
    stopTimer();
    baseTimerState.update(state => ({
        ...state,
        timer: state.initialTimer,
        running: false,
        subTimers: {}
    }));
}

// Store avec méthodes set, update et les contrôles du timer
export const timer = (() => {
    const { subscribe } = derived(baseTimerState, ($state) => {
        if (onTimerStateChange) {
            onTimerStateChange($state);
        }
        return $state;
    });

    return {
        subscribe,
        set: (state: TimerState) => {
            baseTimerState.set(state);
        },
        update: (updater: (state: TimerState) => TimerState) => {
            baseTimerState.update(updater);
        },
        start: startTimer,
        stop: stopTimer,
        updateInitial: updateInitialTimer,
        addSubTimer,
        startSubTimer,
        reset: resetTimer
    };
})();

// Fonction pour configurer le callback de changement d'état
export function setTimerStateCallback(callback: (state: TimerState) => void) {
    onTimerStateChange = callback;
    // Appeler le callback immédiatement avec l'état actuel
    baseTimerState.subscribe(state => {
        callback(state);
    })();
}
