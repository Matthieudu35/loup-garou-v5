// src/stores/usersStore.ts

import { writable, derived } from 'svelte/store';
import type { User } from './types';
import { browser } from '$app/environment';

// Callbacks
let onUsersChange: ((users: User[]) => void) | null = null;
let onSelectedPlayersChange: ((players: string[]) => void) | null = null;
let onCurrentUserChange: ((login: string | null) => void) | null = null;

// Store de base pour les utilisateurs (initialisé vide)
const baseUsers = writable<User[]>([]);

// Charger les utilisateurs depuis l'API côté client
if (browser) {
	fetch('/api/users')
		.then(res => res.json())
		.then((users: User[]) => {
			baseUsers.set(users);
		})
		.catch((err) => {
			console.error('Erreur lors du chargement des utilisateurs:', err);
		});
}

// Store dérivé pour les utilisateurs avec callbacks
export const users = derived(baseUsers, ($users) => {
	if (onUsersChange) {
		onUsersChange($users);
	}
	return $users;
});

// Store pour les joueurs sélectionnés
export const selectedPlayers = (() => {
	const { subscribe, set, update } = writable<string[]>([]);

	return {
		subscribe,
		set: (players: string[]) => {
			set(players);
			if (onSelectedPlayersChange) {
				onSelectedPlayersChange(players);
			}
		},
		update,
		setSelectedPlayersCallback: (callback: (players: string[]) => void) => {
			onSelectedPlayersChange = callback;
			// Appeler le callback immédiatement avec les joueurs actuels
			subscribe(players => {
				callback(players);
			})();
		}
	};
})();

// Fonctions utilitaires pour les utilisateurs
export function getUserByLogin(login: string): User | undefined {
	let foundUser: User | undefined;
	baseUsers.subscribe(users => {
		foundUser = users.find(user => user.login === login);
	})();
	return foundUser;
}

export function getCurrentUser(): User | undefined {
	let currentUser: User | undefined;
	baseUsers.subscribe(users => {
		currentUser = users.find(user => user.isCurrentUser);
	})();
	return currentUser;
}

export function setCurrentUser(login: string | null) {
	baseUsers.update(userList => {
		const updatedList = userList.map(user => ({
			...user,
			isCurrentUser: login ? user.login === login : false
		}));
		if (onCurrentUserChange) {
			onCurrentUserChange(login);
		}
		return updatedList;
	});
}

export function setUsers(users: User[]) {
	baseUsers.set(users);
}

export function updateUsers(updater: (users: User[]) => User[]) {
	baseUsers.update(updater);
}

// Fonctions de configuration des callbacks
export function setUsersCallback(callback: (users: User[]) => void) {
	onUsersChange = callback;
	// Appeler le callback immédiatement avec les utilisateurs actuels
	baseUsers.subscribe(users => {
		callback(users);
	})();
}

export function setCurrentUserCallback(callback: (login: string | null) => void) {
	onCurrentUserChange = callback;
	// Appeler le callback immédiatement avec l'utilisateur courant
	baseUsers.subscribe(users => {
		const currentUser = users.find(user => user.isCurrentUser);
		callback(currentUser?.login || null);
	})();
}

// Fonctions utilitaires
export function getPhotoPlaceholder(user: User) {
	if (!user.firstName || !user.lastName) return null;

	const initials = `${user.firstName[0]}${user.lastName[0]}`;
	const backgroundColor = stringToColor(initials);
	return { initials, backgroundColor };
}

function stringToColor(str: string): string {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = str.charCodeAt(i) + ((hash << 5) - hash);
	}
	const color = Math.floor((Math.abs(hash) % 16777215));
	return `#${color.toString(16).padStart(6, '0')}`;
}

// Fonctions de gestion des rôles
export function setMayor(login: string, isMayor: boolean) {
	baseUsers.update(userList => {
		return userList.map(user =>
			user.login === login ? { ...user, isMayor } : { ...user, isMayor: false }
		);
	});
}

export function eliminatePlayer(login: string) {
	baseUsers.update(userList => {
		return userList.map(user =>
			user.login === login ? { ...user, isAlive: false } : user
		);
	});
}
