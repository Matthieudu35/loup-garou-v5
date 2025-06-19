<script lang="ts">
  import { gameState } from '../../stores/gameState';
  import { chienLoupStates, setChienLoupCamp, isCurrentPlayerChienLoup, currentChienLoupState } from '../../stores/chienLoupStore';
  import { currentUser as currentUserStore } from '../../stores/authStore';

  // Variables réactives pour alléger la logique
  $: currentUser = $currentUserStore;
  $: isAlive = currentUser?.isAlive !== false;
  $: isChienLoup = currentUser?.role?.toLowerCase() === 'chien-loup' || 
                   currentUser?.role?.toLowerCase() === 'chienloup' || 
                   currentUser?.role?.toLowerCase() === 'chien loup';
  $: isNight0 = $gameState.phase === 'nuit' && $gameState.cycleCount === 0;
  $: chienLoupState = $currentChienLoupState;
  $: hasNotChosen = !chienLoupState?.hasChosen;

  // Pour l'affichage dynamique du message
  $: chosenCamp = chienLoupState?.camp;
  $: campLabel = chosenCamp === 'loups' ? 'les Loups' : chosenCamp === 'village' ? 'les Villageois' : '';

  function chooseCamp(camp: 'loups' | 'village') {
    if (currentUser) {
      setChienLoupCamp(currentUser.login, camp);
    }
  }
</script>

{#if isAlive && isChienLoup && isNight0}
  <div class="chien-loup-container">
    {#if hasNotChosen}
      <h2>Tu es le Chien-Loup</h2>
      <p>Choisis ton camp :</p>
      <div class="buttons-container">
        <button class="village" on:click={() => chooseCamp('village')}>Rester avec les Villageois</button>
        <button class="loup" on:click={() => chooseCamp('loups')}>Rejoindre les Loups</button>
      </div>
    {:else if chosenCamp}
      <h2>Tu es le Chien-Loup</h2>
      <p class={chosenCamp}>
        Tu as choisi de rester avec : <strong>{campLabel}</strong>
      </p>
    {/if}
  </div>
{/if}

<style>
  .chien-loup-container {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
    background-color: var(--bg-color);
    padding: var(--spacing-lg);
    border-radius: var(--border-radius-md);
    box-shadow: var(--shadow-md);
    color: var(--text-color);
    max-width: 500px;
    margin: var(--spacing-lg) auto;
  }

  .buttons-container {
    display: flex;
    gap: var(--spacing-md);
    margin-top: var(--spacing-md);
  }

  button {
    padding: var(--spacing-md);
    border: none;
    border-radius: var(--border-radius-md);
    cursor: pointer;
    transition: all var(--transition-normal);
    font-weight: bold;
    flex: 1;
  }

  button.village {
    background-color: var(--success);
    color: var(--secondary);
  }

  button.village:hover {
    opacity: 0.9;
    transform: translateY(-2px);
  }

  button.loup {
    background-color: var(--danger);
    color: var(--secondary);
  }

  button.loup:hover {
    opacity: 0.9;
    transform: translateY(-2px);
  }

  h2 {
    margin: 0;
    color: var(--primary);
    text-align: center;
  }

  p {
    margin: 0;
    text-align: center;
  }

  /* Styles dynamiques selon le camp choisi */
  p.loups {
    color: var(--danger);
    font-weight: bold;
  }

  p.village {
    color: var(--success);
    font-weight: bold;
  }
</style>
