<script lang="ts">
	// Stores
	import { gameState } from '../../stores/gameState';
	import { currentUser } from '../../stores/authStore';
	import { onMount, onDestroy } from 'svelte';
	
	// Components
	import MemoSection from './MemoSection.svelte';
	import Villagers from './Villagers.svelte';
	import Wolvesteam from './Wolvesteam.svelte';
	import WolfSection from './WolfSection.svelte';
	import { Team, getTeamByRoleName } from '../../stores/teams';
	import { isCurrentPlayerWolf, chienLoupStates } from '../../stores/chienLoupStore';
	import { enfantSauvageStates } from '../../stores/enfantSauvageStore';

	// État du menu
	let isOpen = false;
	let isPlayersMenuOpen = false;
	
	// Thème actuel basé sur la phase du jeu
	$: isNight = $gameState.phase === 'nuit';
	$: currentTheme = isNight ? 'nuit' : 'jour';
	$: currentLogin = $currentUser?.login || '';
	$: userTeam = getTeamByRoleName($currentUser?.role || '', currentLogin);
	$: isVillager = userTeam === Team.VILLAGERS;
	$: isWolf = $isCurrentPlayerWolf;
	$: isChienLoupWolf = $currentUser?.role?.toLowerCase() === 'chien-loup' && 
	                     $chienLoupStates[currentLogin]?.camp === 'loups';
	$: isEnfantSauvageWolf = $currentUser?.role === 'Enfant sauvage' && 
	                         $enfantSauvageStates[currentLogin]?.hasSwitched;
	$: shouldShowWolfComponents = isWolf || isChienLoupWolf || isEnfantSauvageWolf;

	// Debug logs
	$: console.log('Debug IndexAllies:', {
		currentUser: $currentUser,
		currentLogin,
		userTeam,
		isVillager,
		isWolf,
		isChienLoupWolf,
		isEnfantSauvageWolf,
		shouldShowWolfComponents,
		enfantSauvageState: $enfantSauvageStates[currentLogin],
		chienLoupState: $chienLoupStates[currentLogin]
	});

	// Gestionnaire d'événements pour la synchronisation avec le menu des joueurs
	function handlePlayersMenuToggle(event: CustomEvent) {
		isPlayersMenuOpen = event.detail.isOpen;
	}

	// Fonction pour émettre un événement lorsque le menu est ouvert ou fermé
	function toggleMenu(open: boolean) {
		isOpen = open;
		// Émettre un événement personnalisé
		const event = new CustomEvent('alliesMenuToggle', { 
			detail: { isOpen: open } 
		});
		window.dispatchEvent(event);
	}

	onMount(() => {
		window.addEventListener('playersMenuToggle', handlePlayersMenuToggle as EventListener);
		
		// Debug logs au montage
		console.log('%cIndexAllies - onMount:', 'background: #2C3E50; color: white; font-size: 16px; padding: 5px;');
		console.log({
			currentUser: $currentUser,
			currentLogin,
			userTeam,
			isVillager,
			isWolf,
			isChienLoupWolf,
			isEnfantSauvageWolf,
			shouldShowWolfComponents,
			enfantSauvageState: $enfantSauvageStates[currentLogin],
			chienLoupState: $chienLoupStates[currentLogin]
		});
	});

	onDestroy(() => {
		window.removeEventListener('playersMenuToggle', handlePlayersMenuToggle as EventListener);
	});
</script>

<!-- Bouton pour ouvrir le menu -->
<div class="allies-button-wrapper">
	<button
		class="toggle-status open-button"
		class:menu-open={isOpen}
		class:jour={!isNight}
		class:nuit={isNight}
		on:click={() => toggleMenu(true)}
	>
		<div class="counter">
			<span class="numbers">Alliés</span>
			<span class="label">et mémo</span>
		</div>
	</button>
</div>

<!-- Menu -->
{#if isOpen}
	<div class="overlay" class:jour={!isNight} class:nuit={isNight}>
		<div class="close-wrapper">
			<button
				class="toggle-status close-button"
				class:jour={!isNight}
				class:nuit={isNight}
				on:click={() => toggleMenu(false)}
			>
				<div class="counter">
					<span class="numbers">Alliés</span>
					<span class="label">menu</span>
				</div>
			</button>
		</div>

		<div class="allies-menu-content">
			<h2>Menu des Alliés et Mémos</h2>

			<!-- Section des associations -->
			{#if shouldShowWolfComponents}
				<div class="wolf-section-container">
					<WolfSection />
				</div>
				<Wolvesteam />
			{:else if isVillager}
				<Villagers />
			{/if}

			<!-- Section des mémos -->
			<MemoSection />
			
			<!-- Autres sections à venir -->
			<div class="coming-soon">
				<h3>Sections à venir</h3>
				<p>Les sections pour les alliés et les associations seront bientôt disponibles.</p>
			</div>
		</div>
	</div>
{/if}

<style>
	/* COULEURS DE BASE */
	:root {
		--bleu: #2C3E50;
		--beige: #BFB999;
	}

	.allies-button-wrapper {
		position: fixed;
		top: var(--spacing-md);
		right: var(--spacing-lg);
		z-index: 100;
		transition: opacity var(--transition-normal);
	}

	.close-wrapper {
		position: fixed;
		top: var(--spacing-md);
		right: var(--spacing-lg);
		z-index: 1001;
	}

	.toggle-status {
		width: 70px;
		height: 70px;
		padding: 0;
		border-radius: var(--border-radius-full);
		cursor: pointer;
		border: none;
		box-shadow: var(--shadow-md);
		transition: all var(--transition-normal);
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: bold;
	}

	.counter {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		line-height: 1;
		gap: var(--spacing-sm);
	}

	.numbers {
		font-size: 1rem;
	}

	.label {
		font-size: 0.7rem;
	}

	/* BOUTON OUVERT / FERMÉ */
	.open-button.jour {
		background-color: var(--bleu);
		color: var(--beige);
	}
	.open-button.jour.menu-open {
		background-color: var(--beige);
		color: var(--bleu);
	}

	.open-button.nuit {
		background-color: var(--beige);
		color: var(--bleu);
	}
	.open-button.nuit.menu-open {
		background-color: var(--bleu);
		color: var(--beige);
	}

	/* BOUTON FERMER */
	.close-button.jour {
		background-color: var(--beige);
		color: var(--bleu);
	}
	.close-button.nuit {
		background-color: var(--bleu);
		color: var(--beige);
	}

	/* MENU */
	.overlay {
		position: fixed;
		inset: 0;
		z-index: 1000;
		display: flex;
		flex-direction: column;
		padding: 0;
		transition: background-color var(--transition-normal), color var(--transition-normal);
		width: 100vw;
		overflow-x: hidden;
	}

	.overlay.jour {
		background-color: var(--bleu);
		color: var(--beige);
	}
	.overlay.nuit {
		background-color: var(--beige);
		color: var(--bleu);
	}

	.allies-menu-content {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
		padding: 0;
		margin: 0;
		width: 100vw;
		height: 100%;
		overflow-x: hidden;
		overflow-y: auto;
	}

	.allies-menu-content > * {
		margin: 0;
		padding: 0;
	}

	.allies-menu-content h2 {
		margin: var(--spacing-md) var(--spacing-md) 0 var(--spacing-md);
		font-size: 1.5rem;
		text-align: center;
	}

	.coming-soon {
		padding: var(--spacing-md);
		border-radius: var(--border-radius-md);
		background-color: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		text-align: center;
		margin-top: var(--spacing-md);
	}

	.coming-soon h3 {
		margin-top: 0;
		font-size: 1.1rem;
		opacity: 0.8;
	}

	.coming-soon p {
		opacity: 0.7;
		font-style: italic;
	}

	@media (max-width: 480px) {
		.allies-button-wrapper, .close-wrapper {
			right: var(--spacing-md);
		}

		.toggle-status {
			width: 60px;
			height: 60px;
		}

		.numbers {
			font-size: 0.9rem;
		}

		.label {
			font-size: 0.65rem;
		}
	}

	.wolf-section-container {
		margin: 0.5rem 0 0.2rem 0;
		width: 100%;
	}
</style> 