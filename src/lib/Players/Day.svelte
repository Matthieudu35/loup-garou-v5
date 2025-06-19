<script lang="ts">
	import { gameState } from '../../stores/gameState';
	import { users, selectedPlayers } from '../../stores/usersStore';
	import { eliminationStore } from '../../stores/eliminationStore';
	import { dayVotes, setDayVote, isSecondRound, secondRoundCandidates } from '../../stores/dayVoteStore';
	import { getUserByLogin } from '../../stores/gameLogic';
	import type { User } from '../../stores/types';

	export let currentUser: User;

	let selectedPlayer: User | null = null;

	// Liste des joueurs vivants (non éliminés), participants, sauf soi-même et les admins
	$: alivePlayers = $users.filter(u => {
		// Vérifier d'abord si le joueur participe à la partie
		const isParticipant = $selectedPlayers.includes(u.login);
		
		// Filtrer ensuite les joueurs non éliminés, non admin, et différents du joueur actuel
		const isAliveAndNotAdmin = isParticipant && 
			!u.isAdmin && 
			u.login !== currentUser?.login && 
			!$eliminationStore.some(e => e.playerLogin === u.login);

		// Si on est au second tour, ne montrer que les candidats
		if ($isSecondRound) {
			return isAliveAndNotAdmin && $secondRoundCandidates.includes(u.login);
		}

		return isAliveAndNotAdmin;
	});

	// Vérifier si l'utilisateur a déjà voté
	$: hasVoted = currentUser?.login in $dayVotes;

	// Obtenir le joueur pour qui l'utilisateur a voté
	$: votedFor = hasVoted ? $dayVotes[currentUser?.login] : null;

	function handleVoteClick(player: User) {
		if (!hasVoted) {
			selectedPlayer = player;
		}
	}

	function confirmVote() {
		if (selectedPlayer && !hasVoted) {
			setDayVote(currentUser.login, selectedPlayer.login);
			selectedPlayer = null;
		}
	}

	function cancelVote() {
		selectedPlayer = null;
	}
</script>

{#if currentUser}
	<div class="vote-section">
		{#if $gameState.cycleCount === 1}
			<div class="mayor-election-banner">
				<div class="mayor-icon">
					<img src="/images/maire.png" alt="Insigne du maire" />
				</div>
				<div class="mayor-election-content">
					<h2>Élection du Maire</h2>
					<p>Choisissez le maire qui guidera le village dans cette période difficile.</p>
				</div>
			</div>
		{/if}

		{#if $isSecondRound}
			<div class="second-round-banner">
				<div class="mayor-icon">
					<img src="/images/maire.png" alt="Insigne du maire" />
				</div>
				<div class="second-round-content">
					<h2>Second Tour</h2>
					<p>Suite à une égalité, un second tour est nécessaire entre les candidats suivants.</p>
				</div>
			</div>
		{/if}

		{#if hasVoted && votedFor}
			{@const votedPlayer = getUserByLogin(votedFor)}
			{#if votedPlayer}
				<p>Vous avez déjà voté pour {votedPlayer.firstName} {votedPlayer.lastName}.</p>
			{:else}
				<p>Vote enregistré</p>
			{/if}
		{:else}
			<p>Pour qui voulez-vous voter ?</p>

			<div class="players-grid">
				{#each alivePlayers as player}
					<button 
						class="vote-button"
						class:selected={selectedPlayer?.login === player.login}
						class:second-round={$isSecondRound}
						on:click={() => handleVoteClick(player)}
					>
						{player.firstName} {player.lastName?.[0]}.
					</button>
				{/each}
			</div>

			{#if selectedPlayer}
				<div class="overlay">
					<div class="confirmation-menu">
						<button 
							class="close-button" 
							on:click={cancelVote}
							aria-label="Fermer la confirmation"
						></button>
						
						{#if selectedPlayer.photoUrl}
							<img 
								src={selectedPlayer.photoUrl} 
								alt={`Photo de ${selectedPlayer.firstName}`}
								class="player-photo"
							/>
						{:else}
							<div class="photo-placeholder"></div>
						{/if}
						
						<p>Voulez-vous vraiment voter pour {selectedPlayer.firstName} {selectedPlayer.lastName} ?</p>
						
						<div class="confirmation-buttons">
							<button class="confirm-button" on:click={confirmVote}>
								Confirmer
							</button>
						</div>
					</div>
				</div>
			{/if}
		{/if}
	</div>

	{#if $gameState.gameStarted}
		<!-- GameState component needs to be imported before use -->
	{/if}
{/if}

<style>
	.vote-section {
		margin: 1rem;
	}

	p {
		font-size: 1.1rem;
		margin-bottom: 1rem;
		text-align: center;
	}

	.players-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		gap: 0.8rem;
	}

	@media (max-width: 480px) {
		.players-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	.vote-button {
		background: linear-gradient(135deg, rgba(25, 55, 109, 0.9), rgba(44, 62, 80, 0.9));
		border: 2px solid rgba(255, 215, 0, 0.3);
		color: #fff;
		padding: 1rem;
		border-radius: 0.5rem;
		cursor: pointer;
		transition: all 0.3s ease;
		font-size: 1rem;
		width: 100%;
		text-align: center;
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
	}

	.vote-button:hover {
		background: linear-gradient(135deg, rgba(25, 55, 109, 1), rgba(44, 62, 80, 1));
		border-color: rgba(255, 215, 0, 0.5);
		box-shadow: 0 0 15px rgba(255, 215, 0, 0.2);
		transform: translateY(-2px);
	}

	.vote-button.selected {
		background: linear-gradient(135deg, rgba(25, 55, 109, 1), rgba(44, 62, 80, 1));
		border-color: #FFD700;
		box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
		transform: translateY(-2px);
	}

	.vote-button.second-round {
		background: linear-gradient(135deg, rgba(25, 55, 109, 0.9), rgba(44, 62, 80, 0.9));
		border: 2px solid rgba(255, 215, 0, 0.3);
		color: #fff;
		transition: all 0.3s ease;
	}

	.vote-button.second-round:hover {
		background: linear-gradient(135deg, rgba(25, 55, 109, 1), rgba(44, 62, 80, 1));
		border-color: rgba(255, 215, 0, 0.5);
		box-shadow: 0 0 15px rgba(255, 215, 0, 0.2);
		transform: translateY(-2px);
	}

	.vote-button.second-round.selected {
		background: linear-gradient(135deg, rgba(25, 55, 109, 1), rgba(44, 62, 80, 1));
		border-color: #FFD700;
		box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
		transform: translateY(-2px);
	}

	.overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.confirmation-menu {
		background-color: #2C3E50;
		color: #BFB999;
		padding: 1.5rem;
		border-radius: 16px;
		width: 90%;
		max-width: 350px;
		text-align: center;
		position: relative;
		padding-top: 2.5rem;
	}

	.close-button {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		width: 64px;
		height: 64px;
		border-radius: 50%;
		border: none;
		background-color: #BFB999;
		cursor: pointer;
	}

	.photo-placeholder {
		width: 200px;
		height: 200px;
		border-radius: 50%;
		background-color: rgba(255, 255, 255, 0.1);
		margin: 2rem auto 1rem auto;
	}

	.confirmation-buttons {
		display: flex;
		justify-content: center;
		margin-top: 1.5rem;
	}

	.confirm-button {
		padding: 0.8rem 2rem;
		border: none;
		border-radius: 12px;
		cursor: pointer;
		font-weight: 500;
		transition: all 0.2s ease;
		background-color: var(--danger);
		color: white;
	}

	.player-photo {
		width: 200px;
		height: 200px;
		border-radius: 50%;
		object-fit: cover;
		margin: 0 auto 1.5rem auto;
	}

	.second-round-banner {
		background: linear-gradient(135deg, rgba(25, 55, 109, 0.95), rgba(44, 62, 80, 0.95));
		border-radius: 1rem;
		padding: 1.5rem;
		margin-bottom: 2rem;
		display: flex;
		align-items: center;
		gap: 1.5rem;
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
		border: 1px solid rgba(255, 215, 0, 0.2);
	}

	.mayor-icon {
		width: 60px;
		height: 60px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(255, 215, 0, 0.1);
		border-radius: 50%;
		padding: 0.5rem;
	}

	.mayor-icon img {
		width: 100%;
		height: 100%;
		object-fit: contain;
		filter: drop-shadow(0 0 5px rgba(255, 215, 0, 0.3));
	}

	.second-round-content {
		flex: 1;
	}

	.second-round-content h2 {
		color: #FFD700;
		margin: 0 0 0.5rem 0;
		font-size: 1.5rem;
		text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
	}

	.second-round-content p {
		margin: 0;
		font-size: 1rem;
		opacity: 0.9;
		color: #fff;
	}

	.mayor-election-banner {
		background: linear-gradient(135deg, rgba(25, 55, 109, 0.95), rgba(44, 62, 80, 0.95));
		border-radius: 1rem;
		padding: 1.5rem;
		margin-bottom: 2rem;
		display: flex;
		align-items: center;
		gap: 1.5rem;
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
		border: 1px solid rgba(255, 215, 0, 0.2);
	}

	.mayor-election-content {
		flex: 1;
	}

	.mayor-election-content h2 {
		color: #FFD700;
		margin: 0 0 0.5rem 0;
		font-size: 1.5rem;
		text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
	}

	.mayor-election-content p {
		margin: 0;
		font-size: 1rem;
		opacity: 0.9;
		color: #fff;
	}
</style>

