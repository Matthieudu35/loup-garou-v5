<script lang="ts">
  import { gameState } from '../../stores/gameState';
  import { users, selectedPlayers } from '../../stores/usersStore';
  import { eliminationStore } from '../../stores/eliminationStore';
  import { activeSubTimer, userHasActiveRole, subTimers } from '../../stores/subTimerStore';
  import { alivePlayers, loupVictim } from '../../stores/chosen';
  import { timer } from '../../stores/timerStore';
  import { writable } from 'svelte/store';
  import type { User } from '../../stores/types';

  export let currentUser: User;

  // Store pour suivre si l'infection a été utilisée
  const hasInfected = writable(false);

  let selectedPlayer: User | null = null;

  // Trouver spécifiquement le sous-timer de l'Infect Père des Loups
  $: iplTimer = $subTimers.find(t => t.id === 'infectPereDesLoups');
  
  // Vérifier si le timer de l'IPL est actif et en train de défiler
  $: isIPLTimerActive = iplTimer?.isActive && $timer.timer > 0;

  // Déterminer si la phase de l'IPL est terminée
  $: isIPLTimerFinished = iplTimer && !iplTimer.isActive && $timer.timer > 0;

  // Vérifier si le joueur actuel est l'Infect Père des Loups
  $: isIPL = currentUser?.role?.toLowerCase() === 'infect-pere-des-loups';

  // Trouver la victime des loups (si elle existe)
  $: victim = $loupVictim ? $users.find(u => u.login === $loupVictim) : null;

  // Liste des joueurs vivants (non éliminés), participants, sauf soi-même et les admins
  $: availableTargets = $alivePlayers.filter(u => {
      // Vérifier d'abord si le joueur participe à la partie
      const isParticipant = $selectedPlayers.includes(u.login);
      
      // Filtrer ensuite les joueurs non éliminés, non admin, et différents du joueur actuel
      return isParticipant && 
             !u.isAdmin && 
             u.login !== currentUser?.login && 
             !$eliminationStore.some(e => e.playerLogin === u.login);
  });

  // Ajouter des logs pour débugger
  $: console.log('IPL Debug:', {
      currentUser: currentUser?.login,
      role: currentUser?.role,
      isIPL,
      iplTimer: iplTimer?.id,
      iplTimerActive: iplTimer?.isActive,
      isIPLTimerActive,
      timerRunning: $timer.timer > 0,
      gamePhase: $gameState.phase,
      gameCycle: $gameState.cycleCount,
      availableTargets: availableTargets.length
  });

  // Fonctions pour le timer
  function formatTime(seconds: number): string {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  // Calculer le temps restant pour le sous-timer de l'IPL
  function getIPLSubTimerRemainingTime(): number {
      if (!iplTimer) return 0;
      
      const currentTime = $timer.initialTimer - $timer.timer;
      if (currentTime < iplTimer.startTime) {
          return iplTimer.duration;
      }
      if (currentTime > iplTimer.endTime) {
          return 0;
      }
      return iplTimer.endTime - currentTime;
  }

  // Calculer le pourcentage de progression pour le sous-timer de l'IPL
  function getIPLSubTimerProgress(): number {
      if (!iplTimer) return 0;
      
      const currentTime = $timer.initialTimer - $timer.timer;
      if (currentTime < iplTimer.startTime) {
          return 100;
      }
      if (currentTime > iplTimer.endTime) {
          return 0;
      }
      return 100 - ((currentTime - iplTimer.startTime) / iplTimer.duration) * 100;
  }

  function handleInfectClick(player: User) {
      if (!selectedPlayer && !$hasInfected) {
          selectedPlayer = player;
      }
  }

  function confirmInfect() {
      if (selectedPlayer && !$hasInfected) {
          // Marquer le joueur comme infecté
          hasInfected.set(true);
          
          // TODO: Ajouter la logique pour marquer le joueur comme infecté dans le store global
          // Par exemple, ajouter un store pour les joueurs infectés
          
          selectedPlayer = null;
      }
  }

  function cancelInfect() {
      selectedPlayer = null;
  }
</script>

{#if isIPL && (isIPLTimerActive || isIPLTimerFinished) && victim}
    <div class="vote-section">
        <div class="timer-info">
            <h2>Phase de l'Infect Père des Loups</h2>
            <div class="sub-timer" class:active={iplTimer?.isActive}>
                <div class="sub-timer-content">
                    <p class="timer-text">
                        Temps restant : {formatTime(getIPLSubTimerRemainingTime())}
                    </p>
                    <div class="timer-bar">
                        <div 
                            class="timer-progress" 
                            style="width: {getIPLSubTimerProgress()}%"
                        ></div>
                    </div>
                </div>
            </div>
        </div>

        <div class="victim-info">
            <p>Les loups ont choisi : {victim.firstName} {victim.lastName}</p>
        </div>

        {#if $hasInfected}
            <div class="infection-used">
                <p>Vous avez déjà utilisé votre pouvoir d'infection.</p>
            </div>
        {:else}
            <p>Voulez-vous infecter cette victime ?</p>
            <div class="confirmation-buttons">
                <button class="confirm-button" on:click={confirmInfect}>
                    Infecter {victim.firstName} {victim.lastName}
                </button>
            </div>
        {/if}
    </div>
{:else if isIPL}
    <div class="waiting-message">
        <h2>Phase de l'Infect Père des Loups</h2>
        {#if isIPLTimerFinished}
            <p>La phase de l'Infect Père des Loups est terminée</p>
        {:else}
            <p>Attendez que le timer de l'Infect Père des Loups soit activé...</p>
        {/if}
    </div>
{/if}

<style>
    .vote-section {
        margin: 1rem;
    }

    .waiting-message {
        text-align: center;
        margin: 2rem;
        padding: 1rem;
        background-color: rgba(255, 165, 0, 0.1);
        border-radius: 8px;
        border: 1px dashed rgba(255, 165, 0, 0.3);
    }

    .waiting-message h2 {
        color: var(--primary);
        margin-bottom: 1rem;
    }

    .waiting-message p {
        font-size: 1.1rem;
        color: var(--text-color);
    }

    .timer-info {
        text-align: center;
        margin-bottom: 2rem;
    }

    .timer-info h2 {
        color: var(--primary);
        margin-bottom: 0.5rem;
    }

    p {
        font-size: 1.1rem;
        margin-bottom: 1rem;
        text-align: center;
        color: var(--text-color);
    }

    .confirmation-buttons {
        display: flex;
        justify-content: center;
        gap: 1rem;
        margin-top: 1rem;
    }

    .confirm-button {
        background: linear-gradient(135deg, rgba(44, 62, 80, 0.9), rgba(25, 55, 109, 0.9));
        border: 2px solid rgba(255, 165, 0, 0.3);
        color: #fff;
        padding: 1rem 2rem;
        border-radius: 0.5rem;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 1rem;
        text-align: center;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    }

    .confirm-button:hover {
        background: linear-gradient(135deg, rgba(44, 62, 80, 1), rgba(25, 55, 109, 1));
        border-color: rgba(255, 165, 0, 0.5);
        box-shadow: 0 0 15px rgba(255, 165, 0, 0.2);
        transform: translateY(-2px);
    }

    .infection-used {
        text-align: center;
        margin: 1rem 0;
        padding: 1rem;
        background-color: rgba(255, 0, 0, 0.1);
        border-radius: 8px;
        border: 1px dashed rgba(255, 0, 0, 0.3);
    }

    .infection-used p {
        color: var(--text-color);
        margin: 0;
    }

    .victim-info {
        text-align: center;
        margin: 1rem 0;
        padding: 1rem;
        background-color: rgba(255, 165, 0, 0.1);
        border-radius: 8px;
        border: 1px dashed rgba(255, 165, 0, 0.3);
    }

    .victim-info p {
        margin: 0;
    }
</style> 