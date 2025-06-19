<script lang="ts">
	import { allies, getStructuredAssociations, removeAssociation } from '../../stores/alliesStore';
	import { currentUser } from '../../stores/authStore';
	import { Team, getTeamByRoleName } from '../../stores/teams';
	import { gameState } from '../../stores/gameState';
	import { users } from '../../stores/usersStore';
	import { eliminationStore } from '../../stores/eliminationStore';
	import { isCurrentPlayerWolf, chienLoupStates } from '../../stores/chienLoupStore';
	import { enfantSauvageStates } from '../../stores/enfantSauvageStore';
	import { onMount } from 'svelte';

	$: login = $currentUser?.login || '';
	$: structured = getStructuredAssociations(login, true);
	$: gauche = $structured.gauche;
	$: droite = $structured.droite;
	$: userTeam = getTeamByRoleName($currentUser?.role || '', login);
	$: isWolf = $isCurrentPlayerWolf;
	$: isSoloWolf = $currentUser?.role === 'Loup solitaire';
	$: isChienLoupWolf = $currentUser?.role?.toLowerCase() === 'chien-loup' && 
	                     $chienLoupStates[login]?.camp === 'loups';
	$: isEnfantSauvageWolf = $currentUser?.role === 'Enfant sauvage' && 
	                         $enfantSauvageStates[login]?.hasSwitched;
	$: currentTheme = $gameState.phase as 'jour' | 'nuit';
	$: shouldShowWolfComponents = isWolf || isChienLoupWolf || isEnfantSauvageWolf;
	$: shouldHideNames = isSoloWolf || isChienLoupWolf;
	
	// Récupérer les informations nécessaires
	$: userRole = $currentUser?.role || '';
	$: allPlayers = $users.filter(user => !user.isAdmin);
	$: eliminatedPlayers = $eliminationStore.map(e => e.playerLogin);

	// Debug logs
	$: console.log('Debug Wolvesteam:', {
		currentUser: $currentUser,
		login,
		userTeam,
		isWolf,
		isSoloWolf,
		isChienLoupWolf,
		shouldShowWolfComponents,
		enfantSauvageState: $enfantSauvageStates[login],
		chienLoupState: $chienLoupStates[login]
	});

	function handleAssociationClick(assoc: any) {
		if (assoc.estLaMienne) {
			removeAssociation(login, assoc.login, assoc.role);
		}
	}

	function isWolfRole(role: string): boolean {
		const team = getTeamByRoleName(role, login);
		return team === Team.WEREWOLVES || team === Team.SOLO;
	}

	// Fonction pour déterminer si un joueur est mort
	function isEliminated(playerLogin: string): boolean {
		return eliminatedPlayers.includes(playerLogin);
	}

	// Fonction pour construire les listes de vérités
	let truthsGauche: Array<{
		login: string;
		role: string;
		estLaMienne: boolean;
		estElimine: boolean;
		estClickable: boolean;
		estRouge: boolean;
	}> = [];
	let truthsDroite: Array<{
		login: string;
		role: string;
		estLaMienne: boolean;
		estElimine: boolean;
		estClickable: boolean;
		estRouge: boolean;
	}> = [];

	$: {
		// Réinitialiser les listes
		truthsGauche = [];
		truthsDroite = [];

		// Si l'utilisateur est loup, ajouter son rôle
		if (isWolf && userRole) {
			truthsGauche.push({
				login: login,
				role: userRole,
				estLaMienne: true,
				estElimine: false,
				estClickable: false,
				estRouge: true
			});
		}

		// Ajouter les morts
		allPlayers.forEach(player => {
			if (isEliminated(player.login) && player.role) {
				const isWolf = isWolfRole(player.role);
				const targetList = isWolf ? truthsGauche : truthsDroite;
				
				targetList.push({
					login: player.login,
					role: player.role,
					estLaMienne: false,
					estElimine: true,
					estClickable: false,
					estRouge: isWolf
				});
			}
		});
	}

	onMount(() => {
		// Debug logs au montage
		console.log('%cWolvesteam - onMount:', 'background: #2C3E50; color: white; font-size: 16px; padding: 5px;');
		console.log({
			currentUser: $currentUser,
			login,
			userTeam,
			isWolf,
			isSoloWolf,
			isChienLoupWolf,
			isEnfantSauvageWolf,
			shouldShowWolfComponents,
			enfantSauvageState: $enfantSauvageStates[login],
			chienLoupState: $chienLoupStates[login]
		});
	});
</script>

{#if isWolf || isChienLoupWolf}
	<div class="allies-wrapper" data-theme={currentTheme}>
		<div class="columns">
			<div class="column">
				<h3>Membres des loups</h3>
				<div class="grid">
					{#each truthsGauche as assoc}
						<div class="association" class:eliminated={assoc.estElimine}>
							<div class="top">{assoc.login}</div>
							<div class="bottom" class:wolf-role={assoc.estRouge}>{assoc.role}</div>
						</div>
					{/each}
					{#each gauche as assoc}
						<div 
							class="association clickable"
							class:eliminated={assoc.estElimine}
							on:click={() => handleAssociationClick(assoc)}
							on:keydown={(e) => e.key === 'Enter' && handleAssociationClick(assoc)}
							role="button"
							tabindex="0"
							aria-label={`Supprimer l'association avec ${assoc.login} (${assoc.role})`}
						>
							<div class="top">{assoc.login}</div>
							<div class="bottom" class:wolf-role={assoc.estRouge}>{assoc.role}</div>
						</div>
					{/each}
				</div>
			</div>
			<div class="column">
				<h3>Autres joueurs</h3>
				<div class="grid">
					{#each truthsDroite as assoc}
						<div class="association" class:eliminated={assoc.estElimine}>
							<div class="top">{assoc.login}</div>
							<div class="bottom" class:wolf-role={assoc.estRouge}>{assoc.role}</div>
						</div>
					{/each}
					{#each droite as assoc}
						<div 
							class="association clickable"
							class:eliminated={assoc.estElimine}
							on:click={() => handleAssociationClick(assoc)}
							on:keydown={(e) => e.key === 'Enter' && handleAssociationClick(assoc)}
							role="button"
							tabindex="0"
							aria-label={`Supprimer l'association avec ${assoc.login} (${assoc.role})`}
						>
							<div class="top">{assoc.login}</div>
							<div class="bottom" class:wolf-role={assoc.estRouge}>{assoc.role}</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	:global([data-theme='jour']) {
		--bg-top: #2C3E50;
		--bg-bottom: #BFB999;
		--text-top: #BFB999;
		--text-bottom: #2C3E50;
		--danger: #e74c3c;
	}
	:global([data-theme='nuit']) {
		--bg-top: #BFB999;
		--bg-bottom: #2C3E50;
		--text-top: #2C3E50;
		--text-bottom: #BFB999;
		--danger: #e74c3c;
	}

	.allies-wrapper {
		padding: 0.5rem;
		text-align: center;
	}
	.columns {
		display: flex;
		gap: 0.5rem;
		flex-wrap: nowrap;
		justify-content: space-between;
		width: 100%;
	}
	.column {
		flex: 1;
		min-width: 0;
		padding: 0.25rem;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.5rem;
		justify-items: center;
		width: 100%;
	}
	.association {
		width: 100%;
		height: 45px;
		overflow: hidden;
		border-radius: 9999px;
		border: 1px solid currentColor;
		box-shadow: 0 1px 3px rgba(0,0,0,0.2);
		cursor: pointer;
		font-size: 0.65rem;
	}
	.top, .bottom {
		height: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 600;
		padding: 0 0.25rem;
	}
	.top {
		background-color: var(--bg-top);
		color: var(--text-top);
		border-bottom: 1px solid rgba(0,0,0,0.1);
	}
	.bottom {
		background-color: var(--bg-bottom);
		color: var(--text-bottom);
	}
	.bottom.wolf-role {
		color: var(--danger);
	}

	@media (min-width: 768px) {
		.allies-wrapper {
			padding: 1rem;
		}
		.columns {
			gap: 2rem;
			flex-wrap: wrap;
			justify-content: center;
		}
		.column {
			flex: 1;
			min-width: 220px;
			padding: 0;
		}
		.grid {
			grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
			gap: 1rem;
		}
		.association {
			width: 120px;
			height: 60px;
			font-size: 0.75rem;
		}
		.top, .bottom {
			padding: 0 0.5rem;
		}
	}

	.association.clickable {
		cursor: pointer;
	}

	.association.clickable:hover {
		transform: scale(1.05);
		box-shadow: 0 2px 8px rgba(0,0,0,0.3);
	}

	.association.eliminated {
		text-decoration: line-through;
		opacity: 0.7;
	}
</style>