import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import type { User } from './types';

// Define a type for User without password
type UserWithoutPassword = Omit<User, 'password'>;

// Callbacks
let onCurrentUserChange: ((login: string | null) => void) | null = null;
let onUserStateChange: ((user: UserWithoutPassword | null) => void) | null = null;

// Store de base pour l'utilisateur courant
const baseCurrentUser = writable<UserWithoutPassword | null>(null);

// Store dérivé avec callbacks
export const currentUser = derived(baseCurrentUser, ($user) => {
    if (onUserStateChange) {
        onUserStateChange($user);
    }
    return $user;
});

// URL de l'API
const API_URL = browser && window.location.hostname === 'localhost' 
  ? 'http://localhost:5173' 
  : 'https://proactive-balance-production.up.railway.app';

// Fonction de connexion
export async function login(login: string, password: string): Promise<boolean> {
    try {
        const response = await fetch(`${API_URL}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ login, password }),
        });

        const data = await response.json();
        
        if (!data.success) {
            console.warn('Login failed:', data.message);
            return false;
        }

        // Mettre à jour le store avec l'utilisateur
        baseCurrentUser.set(data.user);
        
        // Notifier le changement d'utilisateur courant
        if (onCurrentUserChange) {
            onCurrentUserChange(login);
        }

        return true;
    } catch (error) {
        console.error('Login error:', error);
        return false;
    }
}

// Fonction de déconnexion
export function logout(): void {
    baseCurrentUser.set(null);
    if (onCurrentUserChange) {
        onCurrentUserChange(null);
    }
}

// Fonction pour configurer le callback de changement d'utilisateur
export function setCurrentUserCallback(callback: (login: string | null) => void) {
    onCurrentUserChange = callback;
    // Appeler le callback immédiatement avec l'utilisateur courant
    baseCurrentUser.subscribe(user => {
        callback(user?.login || null);
    })();
}

// Fonction pour configurer le callback de changement d'état de l'utilisateur
export function setUserStateCallback(callback: (user: UserWithoutPassword | null) => void) {
    onUserStateChange = callback;
    // Appeler le callback immédiatement avec l'état actuel
    baseCurrentUser.subscribe(user => {
        callback(user);
    })();
}

// Fonction pour mettre à jour l'utilisateur courant depuis l'état du jeu
export function updateCurrentUserFromGameState(users: User[]) {
    const currentUserLogin = users.find(u => u.isCurrentUser)?.login;
    if (currentUserLogin) {
        const userData = users.find(u => u.login === currentUserLogin);
        if (userData) {
            const { password: _, ...userWithoutPassword } = userData;
            baseCurrentUser.set(userWithoutPassword);
        }
    } else {
        baseCurrentUser.set(null);
    }
} 