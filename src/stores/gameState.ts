import { writable } from 'svelte/store';

// Types et interfaces
export interface GameState {
    phase: 'jour' | 'nuit' | null;
    cycleCount: number;
    showMayorElection: string | null;
    mayor: string | null;
    gameStarted: boolean;
    showSecondRoundAnnouncement: boolean;
    showVoteCountdown: boolean;
    timer: {
        timer: number;
        initialTimer: number;
        running: boolean;
        subTimers: Record<string, number>;
    };
    rolesAssigned: boolean;
    enfantSauvageStates: Record<string, { login: string; masterLogin: string | null; hasSwitched: boolean; }>;
    chienLoupStates: Record<string, { login: string; camp: 'loups' | 'village' | null; hasChosen: boolean; }>;
    eliminations: Array<{ playerLogin: string; reason: string; source: string; }>;
    users: {
        login: string;
        password: string;
        firstName: string;
        lastName?: string;
        photoUrl?: string;
        isAlive: boolean;
        isAdmin: boolean;
        isCurrentUser?: boolean;
        isMayor?: boolean;
        role?: string;
        photoPlaceholder?: string;
    }[];
    allies: any[]; // Remplacer par le type Association si besoin
    memos: any[];  // Remplacer par le type Memo si besoin
    loupVotes: Record<string, string>;
    loupVictim: string | null;
    dayVotes: Record<string, string>;
    isSecondRound: boolean;
    secondRoundCandidates: string[];
    subTimers: {
        id: string;
        label: string;
        percent: number;
        startTime: number;
        endTime: number;
        duration: number;
        isActive: boolean;
        color: string;
        roles: string[];
        order?: number;
    }[];
    selectedPlayers: string[];
}

// État initial du jeu
export const initialState: GameState = {
    phase: null,
    cycleCount: 0,
    showMayorElection: null,
    mayor: null,
    gameStarted: false,
    showSecondRoundAnnouncement: false,
    showVoteCountdown: false,
    timer: {
        timer: 3600,
        initialTimer: 3600,
        running: false,
        subTimers: {}
    },
    rolesAssigned: false,
    enfantSauvageStates: {},
    chienLoupStates: {},
    eliminations: [],
    users: [],
    allies: [],
    memos: [],
    loupVotes: {},
    loupVictim: null,
    dayVotes: {},
    isSecondRound: false,
    secondRoundCandidates: [],
    subTimers: [],
    selectedPlayers: [],
};

// Déclaration du store minimaliste
export const gameState = writable<GameState>(initialState); 