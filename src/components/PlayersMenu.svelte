<script lang="ts">
	// Types
	import type { User } from '../stores/types';

	// Stores
	import { gameState } from '../stores/gameState';
	import { currentUser } from '../stores/authStore';
	import { users, selectedPlayers, getPhotoPlaceholder, setMayor } from '../stores/usersStore';
	import { rolesAssigned } from '../stores/rolesStore';
	import { eliminationStore } from '../stores/eliminationStore';
	import { memos } from '../stores/memosStore';
	import { allies, addAssociation } from '../stores/alliesStore';
	import { addMemo } from '../stores/gameLogic';

	// Components
	// ConfirmationModal a été supprimé temporairement

	let isOpen = false;
	let selectedPlayer: User | null = null;
	let showConfirmModal = false;
	let pendingRole: string | null = null;

	// Phase actuelle
	$: isNight = $gameState.phase === 'nuit';
	// Filtrer les joueurs pour n'avoir que les participants
	$: participants = $users.filter(user => 
		!user.isAdmin && $selectedPlayers.includes(user.login)
	);
	// Nombre total de participants
	$: totalPlayers = participants.length;
	// Nombre de joueurs en vie
	$: alivePlayers = totalPlayers - $eliminationStore.length;
	// Vérifier si l'utilisateur actuel est admin
	$: isAdmin = $currentUser?.isAdmin || false;

	// État pour le menu du joueur
	let showRole = false;
	let showRoleAssociation = false;

	// Ajouter les listes de rôles
	const villageRoles = [
		'Voyante',
		'Sorcière',
		'Chasseur',
		'Soeur rouge',
		'Soeur bleue',
		'Frère vert',
		'Frère jaune',
		'Ancien',
		'Villageois'
	];

	const wolfRoles = [
		'Loup-garou',
		'Grand Méchant Loup',
		'Infect Père des loups',
		'Loup blanc',
		'Loup solitaire',
		'Enfant sauvage',
		'Chien-loup'
	];

	const specialRoles = ['Enfant sauvage', 'Chien-loup'];

	// Fonction pour émettre un événement lorsque le menu est ouvert ou fermé
	function toggleMenu(open: boolean) {
		isOpen = open;
		// Émettre un événement personnalisé
		const event = new CustomEvent('playersMenuToggle', { 
			detail: { isOpen: open } 
		});
		window.dispatchEvent(event);
	}

	function handlePlayerClick(player: User) {
	selectedPlayer = player;
	showRole = false;
}


	function closePlayerMenu() {
		selectedPlayer = null;
		showRole = false;
	}

	function toggleRoleVisibility() {
		showRole = !showRole;
	}

	// Ajoutez cette fonction de mapping des rôles
	function formatRoleName(roleKey: string): string {
		const roleMapping: Record<string, string> = {
			'loupGarou': 'Loup-garou',
			'loupSolitaire': 'Loup solitaire',
			'infectPereDesLoups': 'Infect Père des loups',
			'grandMechantLoup': 'Grand Méchant Loup',
			'loupBlanc': 'Loup blanc',
			'enfantSauvage': 'Enfant sauvage',
			'chienLoup': 'Chien-loup',
			'voyante': 'Voyante',
			'sorciere': 'Sorcière',
			'chasseur': 'Chasseur',
			'soeurRouge': 'Soeur rouge',
			'soeurBleue': 'Soeur bleue',
			'frereVert': 'Frère vert',
			'frereJaune': 'Frère jaune',
			'ancien': 'Ancien',
			'villageois': 'Villageois'
		};
		return roleMapping[roleKey] || roleKey;
	}

	function getPlayerRole(login: string): string {
		const user = $users.find(u => u.login === login);
		return user?.role || '';
	}

	function handleElimination() {
		if (!selectedPlayer) return;
		
		if (confirm(`Voulez-vous vraiment éliminer ${selectedPlayer.firstName} ${selectedPlayer.lastName || ''} ?`)) {
			eliminationStore.eliminate(selectedPlayer.login, 'admin', 'admin', 'Élimination via le menu des joueurs');
			closePlayerMenu();
		}
	}

	function handleResurrection() {
		if (!selectedPlayer) return;
		
		if (confirm(`Voulez-vous vraiment ressusciter ${selectedPlayer.firstName} ${selectedPlayer.lastName || ''} ?`)) {
			eliminationStore.resurrect(selectedPlayer.login);
			closePlayerMenu();
		}
	}

	function handleMayorToggle() {
		if (!selectedPlayer) return;
		const willBeMayor = !selectedPlayer.isMayor;
		const action = willBeMayor ? 'nommer' : 'destituer';
		
		if (confirm(`Voulez-vous vraiment ${action} ${selectedPlayer.firstName} ${selectedPlayer.lastName || ''} comme maire ?`)) {
			setMayor(selectedPlayer.login, willBeMayor);
			if (willBeMayor) {
				// Déclencher l'animation quand on nomme un maire
				const login = selectedPlayer.login; // Stocker la valeur avant la fermeture
				gameState.update(state => ({
					...state,
					showMayorElection: login
				}));
			}
			closePlayerMenu();
		}
	}

	// Vérifier si un joueur est éliminé
	function isEliminated(login: string): boolean {
		return $eliminationStore.some(e => e.playerLogin === login);
	}

	// Ajout d'une variable réactive pour le rôle
	$: playerRole = selectedPlayer ? getPlayerRole(selectedPlayer.login) : null;

	function getPlayerPhoto(player: User) {
		if (!player) return '';
		
		if (player.photoUrl) {
			return player.photoUrl;
		}
		const placeholder = getPhotoPlaceholder(player);
		return placeholder;
	}

	function handleMemoKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			const textarea = e.target as HTMLTextAreaElement;
			const memo = textarea.value.trim();
			
			// Vérifier que selectedPlayer et currentUser existent
			if (memo && selectedPlayer && $currentUser) {
				const memoText = `[${selectedPlayer.firstName}] ${memo}`;
				addMemo(memo);
				textarea.value = '';
			}
		}
	}

	async function handleRoleAssociation(role: string) {
		if (!selectedPlayer) return;
		
		if (specialRoles.includes(role)) {
			showConfirmModal = true;
			pendingRole = role;
		} else {
			createAssociation(role, wolfRoles.includes(role));
		}
	}

	function onModalChoice(event: CustomEvent<{isWolf: boolean}>) {
		if (pendingRole) {
			createAssociation(pendingRole, event.detail.isWolf);
			pendingRole = null;
		}
	}

	function createAssociation(role: string, isWolf: boolean) {
		if (!selectedPlayer || !$currentUser) return;

		addAssociation($currentUser.login, selectedPlayer.login, role, isWolf);
		closePlayerMenu();
	}
</script>

<!-- Bouton pour ouvrir le menu -->
<div class="game-status-wrapper">
	<button
		class="toggle-status open-button"
		class:menu-open={isOpen}
		class:jour={!isNight}
		class:nuit={isNight}
		on:click={() => toggleMenu(true)}
	>
		<div class="counter">
			<span class="numbers">{alivePlayers}/{totalPlayers}</span>
			<span class="label">joueurs</span>
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
					<span class="numbers">{alivePlayers}/{totalPlayers}</span>
					<span class="label">joueurs</span>
				</div>
			</button>
		</div>

		<div class="menu-content">
			<div class="players-grid">
				{#each participants as player}
					<button 
						class="player-button" 
						class:eliminated={isEliminated(player.login)}
						class:is-mayor={player.isMayor}
						on:click={() => handlePlayerClick(player)}
					>
						<span>{player.firstName} {player.lastName?.[0]}.</span>
						{#if player.isMayor}
							<img 
								src="/images/maire.png" 
								alt="Insigne du maire" 
								class="mayor-badge"
							/>
						{/if}
					</button>
				{/each}
			</div>
		</div>
	</div>
{/if}

<!-- Menu détaillé du joueur -->
{#if selectedPlayer}
	<div 
		class="player-menu-overlay" 
		on:click={closePlayerMenu}
		on:keydown={(e) => e.key === 'Escape' && closePlayerMenu()}
		role="button"
		tabindex="0"
	>
		<div 
			class="player-menu" 
			class:jour={!isNight}
			class:nuit={isNight} 
			on:click|stopPropagation
			on:keydown|stopPropagation
			role="dialog"
			aria-modal="true"
			aria-label="Menu du joueur"
			tabindex="-1"
		>
			<div class="player-menu-header">
				<div class="header-content">
					<h3>{selectedPlayer.firstName} {selectedPlayer.lastName || ''}</h3>
					{#if selectedPlayer.isMayor}
						<div class="mayor-status">
							<img src="/images/maire.png" alt="Insigne du maire" class="menu-mayor-badge" />
							<span class="mayor-title">Maire du village</span>
						</div>
					{/if}
				</div>
				<button class="close-btn" on:click={closePlayerMenu}>×</button>
			</div>

			<div class="player-menu-content">
				<div class="photo-container">
					{#if selectedPlayer.photoUrl}
						<img 
							src={selectedPlayer.photoUrl} 
							alt={`Photo de ${selectedPlayer.firstName}`}
							class="player-photo"
						/>
					{:else}
						{@const placeholder = getPhotoPlaceholder(selectedPlayer)}
						{#if placeholder}
							<div 
								class="photo-placeholder"
								style="background-color: {placeholder.backgroundColor}"
							>
								<span class="initials">{placeholder.initials}</span>
							</div>
						{:else}
							<div class="photo-placeholder">
								<span class="initials">??</span>
							</div>
						{/if}
					{/if}
				</div>
				
				<div class="role-association">
					<button 
						class="association-toggle-btn"
						on:click={() => showRoleAssociation = !showRoleAssociation}
					>
						Associer un rôle
					</button>
					
					{#if showRoleAssociation}
						<div class="roles-list" data-theme={isNight ? 'nuit' : 'jour'}>
							<div class="roles-section">
								<h4>Rôles du village</h4>
								{#each villageRoles as role}
									<button 
										class="role-choice-btn"
										on:click={() => handleRoleAssociation(role)}
									>
										{role}
									</button>
								{/each}
							</div>
							<div class="roles-section">
								<h4>Rôles des loups</h4>
								{#each wolfRoles as role}
									<button 
										class="role-choice-btn wolf-role"
										on:click={() => handleRoleAssociation(role)}
									>
										{role}
									</button>
								{/each}
							</div>
						</div>
					{/if}
				</div>
				
				<div class="quick-memo-container" data-theme={isNight ? 'nuit' : 'jour'}>
					<textarea
						class="memo-textarea"
						placeholder="Écrire un mémo..."
						rows="2"
						on:keydown={handleMemoKeydown}
					></textarea>
					<p class="memo-hint">↵ pour sauvegarder</p>
				</div>
				
				{#if isAdmin}
					<div class="admin-controls">
						{#if isEliminated(selectedPlayer.login)}
							<button class="action-btn resurrect-btn" on:click={handleResurrection}>
								Ressusciter
							</button>
						{:else}
							<button class="action-btn eliminate-btn" on:click={handleElimination}>
								Éliminer
							</button>
						{/if}
						
						<button class="action-btn mayor-btn" on:click={handleMayorToggle}>
							{selectedPlayer.isMayor ? 'Destituer le maire' : 'Nommer maire'}
						</button>
						
						<button 
							class="action-btn role-btn" 
							class:jour={!isNight}
							class:nuit={isNight}
							on:click={toggleRoleVisibility}
						>
							{showRole ? 'Cacher le rôle' : 'Voir le rôle'}
						</button>
						
						{#if showRole}
							<div class="role-display">
								<span class="role-label">Rôle</span>
								<span class="role-value">{playerRole}</span>
							</div>
						{/if}
					</div>
				{/if}
				
				<p class="placeholder-text">Fonctionnalités à venir...</p>
			</div>
		</div>
	</div>
{/if}

<!-- ConfirmationModal a été supprimé temporairement -->

<style>
	/* COULEURS DE BASE */
	:root {
		--bleu: #2C3E50;
		--beige: #BFB999;
	}

	.game-status-wrapper {
		position: fixed;
		top: var(--spacing-md);
		right: calc(var(--spacing-lg) + 80px);
		z-index: 100;
	}

	.close-wrapper {
		position: fixed;
		top: var(--spacing-md);
		right: calc(var(--spacing-lg) + 80px);
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

	/* MENU */
	.overlay {
		position: fixed;
		inset: 0;
		z-index: 1000;
		display: flex;
		flex-direction: column;
		padding: var(--spacing-lg);
		transition: background-color var(--transition-normal), color var(--transition-normal);
	}

	.overlay.jour {
		background-color: var(--bleu);
		color: var(--beige);
	}
	.overlay.nuit {
		background-color: var(--beige);
		color: var(--bleu);
	}

	.menu-content {
		flex: 1;
		display: flex;
		align-items: flex-start;
		justify-content: center;
		font-size: 1.2rem;
		padding: var(--spacing-lg);
		overflow-y: auto;
		max-height: calc(100vh - 6rem);
		scrollbar-width: thin;
		scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
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

	.players-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: var(--spacing-sm);
		width: 100%;
		max-width: 800px;
		margin: 0 auto;
		padding-bottom: var(--spacing-lg);
	}

	.player-button {
		padding: var(--spacing-sm) var(--spacing-md);
		border: none;
		border-radius: var(--border-radius-md);
		background: transparent;
		color: inherit;
		cursor: pointer;
		transition: all var(--transition-normal);
		position: relative;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--spacing-sm);
		font-size: 0.9rem;
		height: 40px;
	}

	/* Inversion des couleurs pour les boutons */
	.overlay.jour .player-button {
		background-color: var(--beige);
		color: var(--bleu);
	}

	.overlay.nuit .player-button {
		background-color: var(--bleu);
		color: var(--beige);
	}

	.player-button.eliminated {
		text-decoration: line-through;
		opacity: 0.7;
		background-color: rgba(0, 0, 0, 0.2);
	}

	.player-button:hover {
		transform: translateY(-2px);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.mayor-badge {
		width: 1.8rem;
		height: 1.8rem;
		object-fit: contain;
		transition: transform var(--transition-normal);
	}

	.player-button:hover .mayor-badge {
		transform: scale(1.1);
	}

	/* Styles du menu détaillé du joueur */
	.player-menu-overlay {
		position: fixed;
		inset: 0;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 2000;
	}

	.player-menu {
		width: 95%;
		max-width: 320px;
		max-height: 90vh;
		border-radius: var(--border-radius-md);
		overflow-y: auto;
		animation: slide-up var(--transition-normal);
		box-shadow: var(--shadow-lg);
	}



	
	.player-menu::-webkit-scrollbar {
		width: 6px;
	}

	.player-menu::-webkit-scrollbar-track {
		background: transparent;
	}

	.player-menu::-webkit-scrollbar-thumb {
		background-color: rgba(255, 255, 255, 0.2);
		border-radius: 3px;
	}

	.player-menu::-webkit-scrollbar-thumb:hover {
		background-color: rgba(255, 255, 255, 0.3);
	}

	@keyframes slide-up {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.player-menu-header {
		padding: 0.8rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}

	.player-menu-header h3 {
		margin: 0;
		font-size: 1rem;
		font-weight: 500;
	}

	.mayor-status {
		padding: 0.3rem;
		margin-top: 0.3rem;
	}

	.menu-mayor-badge {
		width: 1.2rem;
		height: 1.2rem;
	}

	.mayor-title {
		font-size: 0.75rem;
	}

	.player-menu-content {
		padding: 0.8rem;
	}

	.photo-container {
		width: 120px;
		height: 120px;
		margin: 0 auto 1rem auto;
	}

	.player-photo {
		width: 100%;
		height: 100%;
		border-radius: 50%;
		object-fit: cover;
	}

	.photo-placeholder {
		width: 100%;
		height: 100%;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.initials {
		color: white;
		font-size: 3rem;
		font-weight: bold;
	}

	.quick-memo-container {
		padding: 0.8rem;
		border-radius: 8px;
		margin: 0.5rem 0;
	}

	.quick-memo-container[data-theme='jour'] {
		background-color: var(--bleu);
		color: var(--beige);
	}

	.quick-memo-container[data-theme='nuit'] {
		background-color: var(--beige);
		color: var(--bleu);
	}

	.memo-textarea {
		width: 100%;
		padding: 0.5rem;
		border-radius: 6px;
		border: 1px solid currentColor;
		font-family: inherit;
		resize: none;
		font-size: 0.9rem;
		line-height: 1.4;
		background-color: transparent;
		height: 60px;
		box-sizing: border-box;
	}

	.memo-hint {
		font-size: 0.75rem;
		margin: 0.3rem 0 0 0;
		text-align: right;
		font-style: italic;
		opacity: 0.8;
		color: inherit;
	}

	.admin-controls {
		margin-top: 0.8rem;
		padding-top: 0.8rem;
		border-top: 1px solid rgba(255, 255, 255, 0.1);
	}

	.action-btn {
		padding: 0.5rem;
		font-size: 0.8rem;
		margin-bottom: 0.5rem;
	}

	.role-btn {
		background-color: #34495e;
		color: white;
	}

	.role-btn:hover {
		background-color: #2c3e50;
	}

	.eliminate-btn {
		background-color: var(--danger);
		color: white;
	}

	.resurrect-btn {
		background-color: #3498db;
		color: white;
	}

	.resurrect-btn:hover {
		background-color: #2980b9;
	}

	.role-display {
		background-color: rgba(255, 255, 255, 0.05);
		padding: 1.2rem;
		border-radius: 8px;
		margin-top: 1rem;
		animation: fade-in 0.3s ease;
		text-align: center;
		border: 1px solid rgba(255, 255, 255, 0.1);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}


	.role-label {
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 1px;
		opacity: 0.7;
	}

	.role-value {
		font-size: 1.1rem;
		font-weight: 500;
		text-transform: capitalize;
		letter-spacing: 0.5px;
		opacity: 0.9;
	}

	@keyframes fade-in {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.placeholder-text {
		font-style: italic;
		opacity: 0.6;
		text-align: center;
		margin-top: 2rem;
		font-size: 0.9rem;
	}

	@media (max-width: 480px) {
		.players-grid {
			gap: var(--spacing-xs);
			padding: 0 var(--spacing-sm);
		}

		.player-button {
			padding: var(--spacing-xs) var(--spacing-sm);
			font-size: 0.8rem;
			height: 36px;
		}

		.mayor-badge {
			width: 1.5rem;
			height: 1.5rem;
		}

		.game-status-wrapper {
			right: calc(var(--spacing-md) + 80px);
		}

		.close-wrapper {
			right: calc(var(--spacing-md) + 80px);
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

	.mayor-btn {
		background-color: #FFD700;
		color: #2C3E50;
	}

	.mayor-btn:hover {
		background-color: #FFE55C;
	}

	.role-association {
		margin-bottom: 1rem;
		padding: 0.8rem;
		border-radius: 8px;
	}

	.association-toggle-btn {
		width: 100%;
		padding: 0.8rem;
		border-radius: 6px;
		border: 1px solid currentColor;
		background: transparent;
		color: inherit;
		font-size: 0.9rem;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.association-toggle-btn:hover {
		background-color: rgba(0, 0, 0, 0.1);
	}

	.roles-list {
		margin-top: 0.8rem;
		border-radius: 6px;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		animation: fade-in 0.3s ease;
		background-color: inherit;
	}

	.roles-list[data-theme='jour'] {
		background-color: #2C3E50;
		color: #BFB999;
	}

	.roles-list[data-theme='nuit'] {
		background-color: #BFB999;
		color: #2C3E50;
	}

	.role-choice-btn {
		width: 100%;
		padding: 0.8rem;
		border: none;
		background: transparent;
		color: inherit;
		font-size: 0.9rem;
		text-align: left;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.role-choice-btn:hover {
		background-color: rgba(0, 0, 0, 0.1);
	}

	.role-choice-btn.wolf-role {
		color: var(--danger);
	}

	.roles-section h4 {
		margin: 0;
		padding: 0.5rem 0.8rem;
		font-size: 0.8rem;
		opacity: 0.8;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}
</style>
