<script lang="ts">
  import { gameState } from '../../stores/gameState';
  import { users, selectedPlayers } from '../../stores/usersStore';
  import { eliminationStore } from '../../stores/eliminationStore';
  import { 
    enfantSauvageStates,
    setEnfantSauvageMaster
  } from '../../stores/enfantSauvageStore';
  import type { User } from '../../stores/types';

  export let currentUser: User;

  let selectedPlayer: User | null = null;

  // Vérifier si on est à la nuit 0
  $: isNight0 = $gameState.phase === 'nuit' && $gameState.cycleCount === 0;
  $: console.log('Debug EnfantSauvage:', {
    isNight0,
    phase: $gameState.phase,
    cycleCount: $gameState.cycleCount,
    currentUser,
    hasChosenMaster: $enfantSauvageStates[currentUser.login]?.masterLogin !== undefined,
    masterIsDead: $enfantSauvageStates[currentUser.login]?.hasSwitched
  });

  // Vérifier si l'utilisateur actuel est un Enfant Sauvage
  $: isEnfantSauvage = currentUser.role === 'Enfant sauvage';

  // Vérifier si l'utilisateur a déjà choisi son maître
  $: hasChosenMaster = $enfantSauvageStates[currentUser.login]?.masterLogin !== undefined;

  // Vérifier si le maître est mort
  $: masterIsDead = hasChosenMaster && master && 
    $eliminationStore.some(e => e.playerLogin === master.login);

  // Liste des joueurs vivants (non éliminés), participants, sauf soi-même et les admins
  $: alivePlayers = $users.filter(u => {
    // Vérifier d'abord si le joueur participe à la partie
    const isParticipant = $selectedPlayers.includes(u.login);
    
    // Filtrer ensuite les joueurs non éliminés, non admin, et différents du joueur actuel
    return isParticipant && 
           !u.isAdmin && 
           u.login !== currentUser.login && 
           !$eliminationStore.some(e => e.playerLogin === u.login);
  });

  // Obtenir le joueur choisi comme maître
  $: master = hasChosenMaster ? 
    $users.find(u => u.login === $enfantSauvageStates[currentUser.login]?.masterLogin) : 
    null;

  function handleMasterClick(player: User) {
    if (!hasChosenMaster) {
      selectedPlayer = player;
    }
  }

  function confirmMaster() {
    if (selectedPlayer && !hasChosenMaster) {
      setEnfantSauvageMaster(currentUser.login, selectedPlayer.login);
      selectedPlayer = null;
    }
  }

  function cancelMaster() {
    selectedPlayer = null;
  }
</script>

{#if currentUser && isEnfantSauvage && (isNight0 || masterIsDead)}
  <div class="vote-section">
    {#if hasChosenMaster && master}
      <p>
        {#if masterIsDead}
          Vous êtes devenu un loup car votre maître {master.firstName} {master.lastName} est mort.
        {:else}
          Vous avez choisi {master.firstName} {master.lastName} comme maître.
        {/if}
      </p>
    {:else}
      <p>Choisissez votre maître :</p>

      <div class="players-grid">
        {#each alivePlayers as player}
          <button 
            class="vote-button"
            class:selected={selectedPlayer?.login === player.login}
            on:click={() => handleMasterClick(player)}
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
              on:click={cancelMaster}
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
            
            <p>Voulez-vous vraiment choisir {selectedPlayer.firstName} {selectedPlayer.lastName} comme maître ?</p>
            
            <div class="confirmation-buttons">
              <button class="confirm-button" on:click={confirmMaster}>
                Confirmer
              </button>
            </div>
          </div>
        </div>
      {/if}
    {/if}
  </div>
{/if}

<style>
  .vote-section {
    margin: 1rem;
  }

  p {
    font-size: 1.1rem;
    margin-bottom: 1rem;
    text-align: center;
    color: var(--text-color);
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
    background: linear-gradient(135deg, rgba(44, 62, 80, 0.9), rgba(25, 55, 109, 0.9));
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
    background: linear-gradient(135deg, rgba(44, 62, 80, 1), rgba(25, 55, 109, 1));
    border-color: rgba(255, 215, 0, 0.5);
    box-shadow: 0 0 15px rgba(255, 215, 0, 0.2);
    transform: translateY(-2px);
  }

  .vote-button.selected {
    background: linear-gradient(135deg, rgba(44, 62, 80, 1), rgba(25, 55, 109, 1));
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
</style> 