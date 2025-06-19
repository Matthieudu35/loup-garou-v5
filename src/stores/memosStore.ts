import { writable, derived, get } from 'svelte/store';
import { currentUser } from './authStore';
import type { User } from './types';
import type { Memo } from '$lib/types';
import { browser } from '$app/environment';

// Callback pour les changements de mémos
let onMemosChange: ((memos: Memo[]) => void) | null = null;

// Store de base pour les mémos
const baseMemos = writable<Memo[]>([]);

// Store avec méthodes set et update
export const memos = (() => {
    const { subscribe } = derived(baseMemos, ($memos) => {
        if (onMemosChange) {
            onMemosChange($memos);
        }
        return $memos;
    });

    return {
        subscribe,
        set: (newMemos: Memo[]) => {
            baseMemos.set(newMemos);
        },
        update: (updater: (memos: Memo[]) => Memo[]) => {
            baseMemos.update(updater);
        }
    };
})();

// Fonction pour configurer le callback de changement de mémos
export function setMemosCallback(callback: (memos: Memo[]) => void) {
    onMemosChange = callback;
    // Appeler le callback immédiatement avec l'état actuel
    baseMemos.subscribe(memos => {
        callback(memos);
    })();
}

// Charger les mémos au démarrage
currentUser.subscribe(user => {
    if (user) {
        const savedMemos = localStorage.getItem(`memos-${user.login}`);
        try {
            const memos = savedMemos ? JSON.parse(savedMemos) : [];
            baseMemos.set(memos);
        } catch {
            baseMemos.set([]);
        }
    } else {
        baseMemos.set([]);
    }
});

// Fonction pour ajouter un mémo
export function addMemo(text: string) {
    baseMemos.update(memos => {
        const newMemo: Memo = {
            text,
            timestamp: Date.now()
        };
        const newMemos = [...memos, newMemo];
        const user = get(currentUser);
        if (user) {
            localStorage.setItem(`memos-${user.login}`, JSON.stringify(newMemos));
        }
        return newMemos;
    });
}

// Fonction pour supprimer un mémo
export function deleteMemo(index: number) {
    baseMemos.update(memos => {
        const newMemos = memos.filter((_, i) => i !== index);
        const user = get(currentUser);
        if (user) {
            localStorage.setItem(`memos-${user.login}`, JSON.stringify(newMemos));
        }
        return newMemos;
    });
} 