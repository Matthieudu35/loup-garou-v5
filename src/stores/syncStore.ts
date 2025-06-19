import { browser } from '$app/environment';

const apiURL = 'https://proactive-balance-production.up.railway.app';

// Fonction utilitaire pour synchroniser avec le backend
export async function syncWithBackend(endpoint: string, data: any): Promise<void> {
    try {
        const response = await fetch(`${apiURL}/${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error(`Failed to sync ${endpoint}`);
    } catch (error) {
        console.error(`Error syncing ${endpoint}:`, error);
    }
}

// Fonction utilitaire pour récupérer depuis le backend
export async function fetchFromBackend<T>(endpoint: string): Promise<T | null> {
    try {
        const response = await fetch(`${apiURL}/${endpoint}`);
        if (!response.ok) throw new Error(`Failed to fetch ${endpoint}`);
        return await response.json();
    } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        return null;
    }
}

// Fonction pour synchroniser tous les stores
export async function syncAllStores(): Promise<void> {
    if (!browser) return;

    try {
        const response = await fetch(`${apiURL}/all`);
        if (!response.ok) throw new Error('Failed to fetch all stores');
        const data = await response.json();
        
        // Les stores seront mis à jour via gameState
        return data;
    } catch (error) {
        console.error('Error syncing all stores:', error);
    }
}

// Mise à jour régulière de tous les stores
if (browser) {
    setInterval(syncAllStores, 2000); // toutes les 2 secondes
} 