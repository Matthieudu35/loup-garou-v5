<script lang="ts">
	import { currentUser } from '../../stores/authStore';
	import { gameState } from '../../stores/gameState';
	import { Team, getTeamByRoleName } from '../../stores/teams';
	import { users } from '../../stores/usersStore';
	import { eliminationStore } from '../../stores/eliminationStore';
	import { allies, addAssociation, getStructuredAssociations, removeAssociation } from '../../stores/alliesStore';
	import { isCurrentPlayerWolf as isChienLoupWolf, chienLoupStates } from '../../stores/chienLoupStore';
	import { isCurrentPlayerWolf as isEnfantSauvageWolf, enfantSauvageStates } from '../../stores/enfantSauvageStore';
	import { rolesConfig } from '../../stores/rolesStore';

	$: currentTheme = $gameState.phase as 'jour' | 'nuit';
	$: userTeam = getTeamByRoleName($currentUser?.role || '');
	$: isNormalWolfPlayer = $isChienLoupWolf;
	$: isSoloWolf = $currentUser?.role === 'Loup solitaire';
	$: isChienLoupWolfPlayer = ($currentUser?.role?.toLowerCase().includes('chien') && 
	                     $currentUser?.role?.toLowerCase().includes('loup')) && 
	                     $chienLoupStates[login]?.camp === 'loups';
	$: shouldShowWolfComponents = isNormalWolfPlayer || isChienLoupWolfPlayer || $isEnfantSauvageWolf;
	$: shouldHideNames = isSoloWolf || isChienLoupWolfPlayer;
	$: login = $currentUser?.login || '';

	// Définir le type pour les rôles de loups
	type WolfRole = 'Loup-garou' | 'Grand Méchant Loup' | 'Infect Père des loups' | 'Loup blanc' | 'Loup solitaire' | 'Chien-loup';

	// Récupérer la configuration des rôles
	let wolfRolesConfig: Record<WolfRole, number>;
	$: wolfRolesConfig = {
		'Loup-garou': $rolesConfig.loupGarou,
		'Grand Méchant Loup': $rolesConfig.grandMechantLoup,
		'Infect Père des loups': $rolesConfig.infectPereDesLoups,
		'Loup blanc': $rolesConfig.loupBlanc,
		'Loup solitaire': $rolesConfig.loupSolitaire,
		'Chien-loup': $rolesConfig.chienLoup
	};

	// Fonction pour obtenir le nombre maximum de rôles disponibles
	function getMaxRoleCount(role: string): number {
		return (role in wolfRolesConfig) ? wolfRolesConfig[role as WolfRole] : 0;
	}

	// Fonction pour compter les joueurs avec un rôle spécifique
	function countPlayersWithRole(role: string): number {
		return allPlayers.filter(player => 
			!isEliminated(player.login) && 
			player.role === role
		).length;
	}

	// Fonction pour compter les associations existantes pour un rôle
	function countAssociationsForRole(role: string): number {
		return myAssociations.filter(a => a.role === role).length;
	}

	// Récupérer tous les joueurs non-admin
	$: allPlayers = $users.filter(user => !user.isAdmin);
	$: eliminatedPlayers = $eliminationStore.map(e => e.playerLogin);

	// Récupérer les associations faites par l'utilisateur courant
	$: myAssociations = $allies.filter(a => a.author === login);

	// Fonction pour déterminer si un joueur est mort
	function isEliminated(playerLogin: string): boolean {
		return $eliminationStore.some(e => e.playerLogin === playerLogin);
	}

	// Fonction pour déterminer si un rôle est ambivalent
	function isAmbivalentRole(role: string): boolean {
		return ['Enfant sauvage', 'Chien-loup'].includes(role);
	}

	// Fonction pour déterminer si un joueur est un loup
	function isWolfRole(role: string): boolean {
		const team = getTeamByRoleName(role);
		return team === Team.WEREWOLVES || team === Team.SOLO;
	}

	// Fonction pour déterminer si un joueur est un loup normal
	function isNormalWolf(role: string): boolean {
		return ['Loup-garou', 'Grand Méchant Loup', 'Infect Père des loups', 'Loup blanc'].includes(role);
	}

	// Fonction pour déterminer si un joueur est visible pour l'enfant sauvage
	function isVisibleWolfForEnfantSauvage(player: any): boolean {
		if (isEliminated(player.login)) return false;
		if (player.login === login) return false;
		
		// Si c'est un loup normal, toujours visible
		if (isNormalWolf(player.role || '')) return true;
		
		// Si c'est un chien-loup, vérifier son camp
		if (player.role === 'Chien-loup') {
			return $chienLoupStates[player.login]?.camp === 'loups';
		}
		
		// Si c'est un loup solitaire, toujours visible
		if (player.role === 'Loup solitaire') return true;
		
		// Ne jamais montrer les autres enfants sauvages
		if (player.role === 'Enfant sauvage') return false;
		
		return false;
	}

	// Fonction pour déterminer si un joueur est un loup visible pour le chien-loup
	function isVisibleWolfForChienLoup(player: any): boolean {
		if (isEliminated(player.login)) return false;
		if (player.login === login) return false;
		
		// Si c'est un loup normal, toujours visible
		if (isNormalWolf(player.role || '')) return true;
		
		// Si c'est un chien-loup, vérifier son camp
		if (player.role === 'Chien-loup') {
			return $chienLoupStates[player.login]?.camp === 'loups';
		}
		
		// Si c'est un loup solitaire, toujours visible
		if (player.role === 'Loup solitaire') return true;
		
		// Si c'est un Enfant Sauvage devenu loup, toujours visible
		if (player.role === 'Enfant sauvage' && $enfantSauvageStates[player.login]?.hasSwitched) return true;
		
		return false;
	}

	// Ordre des rôles
	const roleOrder = [
		'Loup-garou',
		'Grand Méchant Loup',
		'Infect Père des loups',
		'Loup blanc',
		'Loup solitaire',
		'Enfant sauvage',
		'Chien-loup'
	];

	// Fonction pour obtenir l'ordre d'un rôle
	function getRoleOrder(role: string): number {
		const index = roleOrder.indexOf(role);
		return index === -1 ? 999 : index; // Les rôles non listés vont à la fin
	}

	// État pour la sélection
	let selectedName: string | null = null;
	let selectedRole: string | null = null;
	let roles: { role: string; displayRole: string; isAmbivalent: boolean }[] = [];
	let names: { displayName: string; isAmbivalent: boolean; login: string }[] = [];

	// Nouvelle logique synchronisée noms/rôles
	$: {
		// 1. Récupérer tous les rôles de loups à associer (hors associations déjà faites)
		const wolfRolesList: {role: string, isAmbivalent: boolean}[] = [];
		const wolfRolesConfigArr = [
			{ role: 'Loup-garou', count: $rolesConfig.loupGarou, isAmbivalent: false },
			{ role: 'Grand Méchant Loup', count: $rolesConfig.grandMechantLoup, isAmbivalent: false },
			{ role: 'Infect Père des loups', count: $rolesConfig.infectPereDesLoups, isAmbivalent: false },
			{ role: 'Loup blanc', count: $rolesConfig.loupBlanc, isAmbivalent: false },
			{ role: 'Loup solitaire', count: $rolesConfig.loupSolitaire, isAmbivalent: false },
			{ role: 'Chien-loup', count: $rolesConfig.chienLoup, isAmbivalent: true },
			{ role: 'Enfant sauvage', count: $rolesConfig.enfantSauvage, isAmbivalent: true },
		];

		// On compte les associations déjà faites par le joueur courant
		const assocCounts: Record<string, number> = {};
		myAssociations.forEach(a => {
			assocCounts[a.role] = (assocCounts[a.role] || 0) + 1;
		});

		wolfRolesConfigArr.forEach(({role, count, isAmbivalent}) => {
			let toAdd = count - (assocCounts[role] || 0);
			// Si le joueur courant est un chien-loup devenu loup ou un enfant sauvage devenu loup, il ne doit pas voir son propre "?"
			if ((role === 'Chien-loup' && isChienLoupWolfPlayer) || 
				(role === 'Enfant sauvage' && $currentUser?.role === 'Enfant sauvage' && $enfantSauvageStates[login]?.hasSwitched)) {
				toAdd = Math.max(0, toAdd - 1);
			}
			for (let i = 0; i < toAdd; i++) {
				wolfRolesList.push({role, isAmbivalent});
			}
		});

		// Retirer le rôle du joueur courant de la liste à associer (une seule fois)
		const currentUserRole = $currentUser?.role;
		const idxSelf = wolfRolesList.findIndex(r => r.role === currentUserRole);
		if (idxSelf !== -1) {
			wolfRolesList.splice(idxSelf, 1);
		}

		// On récupère les joueurs loups visibles (hors soi, hors éliminés, hors déjà associés)
		let availablePlayers = allPlayers.filter(player => {
			if (player.login === login) return false;
			if (isEliminated(player.login)) return false;
			if (myAssociations.some(a => a.login === player.login)) return false;
			
			// Visibilité selon le type de loup courant
			if (isChienLoupWolfPlayer) {
				return isVisibleWolfForChienLoup(player);
			}
			if ($currentUser?.role === 'Enfant sauvage' && $enfantSauvageStates[login]?.hasSwitched) {
				return isVisibleWolfForEnfantSauvage(player);
			}
			// Inclure aussi les loups solitaires
			return isNormalWolf(player.role || '') || player.role === 'Loup solitaire';
		});

		// On fait une copie pour ne pas modifier la source
		availablePlayers = [...availablePlayers];

		// 2. Construire la liste des noms synchronisée avec les rôles
		const namesList: {displayName: string, isAmbivalent: boolean, login: string}[] = [];
		// Pour chaque rôle restant à associer, on ajoute soit un nom, soit un "?"
		roles = [];
		names = [];
		wolfRolesList.forEach(({role, isAmbivalent}) => {
			if (role === 'Loup solitaire' && (!$currentUser || $currentUser.role !== 'Loup solitaire')) {
				// Toujours afficher un '?' non grisé pour les loups solitaires (sauf si c'est soi-même)
				roles.push({ role, displayRole: isAmbivalentRole(role) ? `${role} ?` : role, isAmbivalent });
				names.push({ displayName: '?', isAmbivalent: false, login: '?' });
			} else {
				const idx = availablePlayers.findIndex(p => p.role === role);
				if (idx !== -1) {
					const player = availablePlayers[idx];
					roles.push({ role, displayRole: isAmbivalentRole(role) ? `${role} ?` : role, isAmbivalent });
					names.push({ 
						displayName: shouldHideNames || ($currentUser?.role === 'Enfant sauvage' && $enfantSauvageStates[login]?.hasSwitched) ? '?' : player.login, 
						isAmbivalent: false, 
						login: player.login 
					});
					availablePlayers.splice(idx, 1); // Consommer ce joueur
				} else {
					roles.push({ role, displayRole: isAmbivalentRole(role) ? `${role} ?` : role, isAmbivalent });
					names.push({ displayName: '?', isAmbivalent, login: '?' });
				}
			}
		});
	}

	// Gestionnaire de clic sur un nom
	function handleNameClick(name: string) {
		if (selectedName === name) {
			selectedName = null;
		} else {
			selectedName = name;
			// Si un rôle est déjà sélectionné, créer l'association
			if (selectedRole) {
				createAssociation();
			}
		}
	}

	// Gestionnaire de clic sur un rôle
	function handleRoleClick(role: string) {
		if (selectedRole === role) {
			selectedRole = null;
		} else {
			selectedRole = role;
			// Si un nom est déjà sélectionné, créer l'association
			if (selectedName) {
				createAssociation();
			}
		}
	}

	// Créer une association
	function createAssociation() {
		if (selectedName && selectedRole && $currentUser) {
			// Si c'est un "?", on utilise directement "?" comme login
			const realLogin = selectedName === '?' ? '?' : selectedName;

			addAssociation($currentUser.login, realLogin, selectedRole, true);
			// Réinitialiser la sélection
			selectedName = null;
			selectedRole = null;
		}
	}

	// Fonction pour supprimer une association précise
	function handleRemoveAssociation(assoc: { login: string; role: string; estLaMienne: boolean }) {
		if (assoc.estLaMienne) {
			removeAssociation(login, assoc.login, assoc.role);
		}
	}

	$: structured = getStructuredAssociations(login, true);
</script>

{#if shouldShowWolfComponents}
	<div class="wolf-section" data-theme={currentTheme}>
		<div class="section-content">
			<h3 class="wolf-title">Voici tes alliés !</h3>
			
			<div class="columns">
				<div class="column">
					<h4>Noms</h4>
					<div class="grid">
						{#each names as name}
							<button 
								class="name-button"
								class:selected={selectedName === name.displayName}
								class:ambivalent={name.isAmbivalent}
								on:click={() => handleNameClick(name.displayName)}
							>
								{name.displayName}
							</button>
						{/each}
					</div>
				</div>
				<div class="column">
					<h4>Rôles</h4>
					<div class="grid">
						{#each roles.filter(r => r.role) as role}
							<button 
								class="role-button"
								class:selected={selectedRole === role.role}
								class:ambivalent={role.isAmbivalent}
								class:white-wolf={role.role === 'Loup blanc'}
								on:click={() => handleRoleClick(role.role)}
							>
								{role.displayRole}
							</button>
						{/each}
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	:global([data-theme='jour']) {
		--section-bg: rgba(44, 62, 80, 0.1);
		--section-border: #2C3E50;
		--section-text: #2C3E50;
		--button-bg: #BFB999;
		--button-text: #2C3E50;
		--selected-bg: #2C3E50;
		--selected-text: #BFB999;
		--ambivalent-opacity: 0.7;
	}
	:global([data-theme='nuit']) {
		--section-bg: rgba(191, 185, 153, 0.1);
		--section-border: #BFB999;
		--section-text: #BFB999;
		--button-bg: #2C3E50;
		--button-text: #BFB999;
		--selected-bg: #BFB999;
		--selected-text: #2C3E50;
		--ambivalent-opacity: 0.7;
	}

	.wolf-section {
		margin: 1rem 0 0.01rem 0;
		padding: 1rem;
		border-radius: var(--border-radius-md);
		background-color: var(--section-bg);
		border: 1px solid var(--section-border);
		width: 100%;
		overflow-x: hidden;
		box-sizing: border-box;
	}

	.section-content {
		padding: 0.2rem 0 0 0;
		width: 100%;
		overflow-x: hidden;
		box-sizing: border-box;
	}

	.columns {
		display: flex;
		gap: 0.5rem;
		justify-content: space-between;
	}

	.column {
		flex: 1;
		min-width: 0;
		width: 50%;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.column h4 {
		color: var(--section-text);
		font-size: 0.9rem;
		margin: 0 0 0.5rem 0;
		text-align: center;
	}

	.grid {
		width: 100%;
		display: grid;
		grid-template-columns: 1fr;
		gap: 0.25rem;
	}

	.name-button, .role-button {
		width: 100%;
		min-width: 90px;
		max-width: 180px;
		box-sizing: border-box;
		padding: 0.35rem;
		margin: 0 auto;
		border-radius: 9999px;
		border: 2px solid var(--section-border);
		background-color: var(--button-bg);
		color: var(--button-text);
		font-size: 0.8rem;
		cursor: pointer;
		transition: all 0.2s ease;
		text-align: center;
		box-shadow: 0 1px 3px rgba(0,0,0,0.10);
	}

	.name-button:hover, .role-button:hover {
		transform: scale(1.07);
		box-shadow: 0 2px 8px rgba(0,0,0,0.18);
		background-color: var(--selected-bg);
		color: var(--selected-text);
	}

	.name-button.selected, .role-button.selected {
		background-color: var(--selected-bg);
		color: var(--selected-text);
		border-color: var(--selected-bg);
	}

	.name-button.ambivalent, .role-button.ambivalent {
		opacity: var(--ambivalent-opacity);
	}

	.role-button.white-wolf {
		background-color: #e74c3c;
		color: #fff;
		border-color: #e74c3c;
	}

	@media (max-width: 768px) {
		.columns {
			flex-direction: row;
			gap: 0.2rem;
		}
		.column {
			width: 50%;
			min-width: 0;
			padding: 0;
		}
		.grid {
			width: 100%;
			grid-template-columns: 1fr;
			gap: 0.12rem;
		}
		.name-button, .role-button {
			width: 95%;
			min-width: 0;
			max-width: none;
			font-size: 0.7rem;
			padding: 0.28rem;
		}
	}

	.wolf-title {
		text-align: center;
		margin: 0 0 0.2rem 0;
		font-size: 1.05rem;
		opacity: 0.9;
	}
</style> 