<script lang="ts">
	import { gameState } from '../../stores/gameState';
	import { assignRoles } from '../../stores/rolesStore';
	import { timer } from '../../stores/timerStore';
	import { users } from '../../stores/usersStore';
	import { currentUser } from '../../stores/authStore';
	import { getUserByLogin } from '../../stores/gameLogic';
	import type { User } from '../../stores/types';
	import Day from './Day.svelte';
	import Night from './Night.svelte';
	import EliminatedPlayer from './EliminatedPlayer.svelte';

	// Utiliser le store currentUser et users pour obtenir l'utilisateur complet
	$: player = $currentUser ? getUserByLogin($currentUser.login) : undefined;
	
	// S'assurer que le joueur a bien toutes ses informations
	$: {
		if ($currentUser && (!player || !player.role)) {
			// Forcer une mise à jour du joueur
			console.log('Forcing player refresh for', $currentUser.login);
			setTimeout(() => {
				player = getUserByLogin($currentUser.login);
			}, 100);
		}
	}

	// State for player menu
	let selectedPlayer: User | null = null;
	let showPlayerMenu: boolean = false;

	// State for allies menu
	$: currentTheme = $gameState.phase as 'jour' | 'nuit';
	$: menuTheme = currentTheme === 'nuit' ? 'jour' as const : 'jour' as const;
	$: memoTheme = menuTheme === 'jour' ? 'nuit' as const : 'jour' as const;

	// Debug logs
	

	function openPlayerMenu(player: User) {
		selectedPlayer = player;
		showPlayerMenu = true;
	}

	function closePlayerMenu() {
		selectedPlayer = null;
		showPlayerMenu = false;
	}
</script>

{#if $gameState.gameStarted && player && !player.isAdmin}
<div class="p-4 bg-color rounded shadow">
	<h1 class="text-xl font-bold mb-4">Bonjour {player.firstName} !</h1>

	{#if player.role}
		<p class="mt-4 text-lg">Tu es <strong class="uppercase">{player.role}</strong></p>
	{/if}

	{#if !player.isAlive}
		<EliminatedPlayer currentUser={player} />
	{:else if $gameState.phase === 'jour'}
		<Day currentUser={player} />
	{:else if $gameState.phase === 'nuit' && player.role}
		<Night currentUser={player} />
	{:else}
		<p class="mt-4">Le jeu n'a pas encore commencé ou votre rôle n'est pas encore attribué.</p>
	{/if}
</div>
{/if}
