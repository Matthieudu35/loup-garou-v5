import { writable, derived, get } from 'svelte/store';
import { eliminationStore } from './eliminationStore';
import { Team, getTeamByRoleName } from './teams';
import { browser } from '$app/environment';
import type { Association } from '$lib/types';

// Callback pour la synchronisation
let onAlliesChange: ((allies: Association[]) => void) | null = null;

// Store de base pour les alliés
const baseAllies = writable<Association[]>([]);

// Store avec méthodes set et update
export const allies = (() => {
	const { subscribe } = derived(baseAllies, ($allies) => {
		if (onAlliesChange) {
			onAlliesChange($allies);
		}
		return $allies;
	});

	return {
		subscribe,
		set: (newAllies: Association[]) => {
			baseAllies.set(newAllies);
		},
		update: (updater: (allies: Association[]) => Association[]) => {
			baseAllies.update(updater);
		}
	};
})();

// Fonction pour configurer le callback
export function setAlliesCallback(callback: (allies: Association[]) => void) {
	onAlliesChange = callback;
	// Appeler le callback immédiatement avec les alliés actuels
	baseAllies.subscribe(allies => {
		callback(allies);
	})();
}

// ➕ Ajouter une association
export function addAssociation(author: string, login: string, role: string, isWolf: boolean) {
	const newEntry: Association = {
		sourceLogin: author,
		targetLogin: login,
		role,
		isWolf,
		login: login, // Pour compatibilité avec le type de $lib/types
		author: author, // Pour compatibilité avec le type de $lib/types
		timestamp: Date.now() // Pour compatibilité avec le type de $lib/types
	};

	baseAllies.update(list => {
		// Supprime toute assoc déjà faite par ce joueur vers cette cible ET ce rôle
		return [
			...list.filter(a => !(a.sourceLogin === author && a.targetLogin === login && a.role === role)),
			newEntry
		];
	});
}

// ❌ Supprimer une association
export function removeAssociation(author: string, login: string, role: string) {
	baseAllies.update(list => {
		return list.filter(a => !(a.sourceLogin === author && a.targetLogin === login && a.role === role));
	});
}

// 🔄 Récupérer toutes les associations faites par un joueur
export function getAssociationsFor(login: string) {
	return derived(allies, $allies =>
		$allies.filter(a => a.sourceLogin === login)
	);
}

// 🧠 Associations triées pour affichage (colonnes, rôles rouges, cliquables, etc.)
export function getStructuredAssociations(currentLogin: string, isWolf: boolean) {
	return derived(
		[allies, eliminationStore],
		([$allies, $eliminationStore]) => {
			const result = { gauche: [], droite: [] } as Record<
				'gauche' | 'droite',
				{
					login: string;
					role: string;
					estLaMienne: boolean;
					estElimine: boolean;
					estClickable: boolean;
					estRouge: boolean;
				}[]
			>;

			const eliminatedLogins = $eliminationStore.map(e => e.playerLogin);

			$allies.forEach(a => {
				const estLaMienne = a.sourceLogin === currentLogin;
				const estElimine = eliminatedLogins.includes(a.sourceLogin);
				const team = getTeamByRoleName(a.role);
				const estRouge = team === Team.WEREWOLVES || team === Team.SOLO;
				const estClickable = !estLaMienne && !estElimine;

				const formatted = {
					login: a.targetLogin,
					role: a.role,
					estLaMienne,
					estElimine,
					estClickable,
					estRouge
				};

				// Placement selon perspective
				if (isWolf) {
					if (a.isWolf) {
						result.gauche.push(formatted); // alliés loups
					} else {
						result.droite.push(formatted); // villageois repérés
					}
				} else {
					if (!a.isWolf) {
						result.gauche.push(formatted); // villageois identifiés
					} else {
						result.droite.push(formatted); // loups suspects
					}
				}
			});

			return result;
		}
	);
}
