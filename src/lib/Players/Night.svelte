<script lang="ts">
  import { gameState } from '../../stores/gameState';
  import { activeSubTimer, userHasActiveRole, subTimers } from '../../stores/subTimerStore';
  import { users } from '../../stores/usersStore';
  import { isCurrentPlayerWolf } from '../../stores/chienLoupStore';
  import { isCurrentPlayerWolf as isEnfantSauvageWolf } from '../../stores/enfantSauvageStore';
  import ChienLoupAction from '../Night/ChienLoupAction.svelte';
  import LGN from '../Night/LGN.svelte';
  import LoupBlanc from '../Night/LoupBlanc.svelte';
  import InfectPereDesLoups from '../Night/InfectPereDesLoups.svelte';
  import EnfantSauvage from '../Night/EnfantSauvage.svelte';
  import Voyante from '../Night/Voyante.svelte';
  import Sorciere from '../Night/Sorciere.svelte';
  import { timer } from '../../stores/timerStore';
  import type { User } from '../../stores/types';

  export let currentUser: User;

  // Déterminer quelle phase est active
  $: activePhase = $activeSubTimer?.id;
  $: isNight0 = $gameState.phase === 'nuit' && $gameState.cycleCount === 0;
  
  // Vérifier si le joueur doit voir la phase des loups
  $: isLoupGarou = currentUser?.role && (
    userHasActiveRole(currentUser.role, currentUser.login) === 'lgn' || 
    /loup[\s-]?garou|loup/i.test(currentUser.role.toLowerCase()) ||
    (currentUser.role !== 'Enfant sauvage' && $isCurrentPlayerWolf) ||
    (currentUser.role === 'Enfant sauvage' && $isEnfantSauvageWolf)
  );

  // Logique pour la sorcière : timer basé sur la fenêtre temporelle du sous-timer
  $: sorciereTimer = $subTimers.find(t => t.id === 'sorciere');
  $: currentTime = $timer.initialTimer - $timer.timer;
  $: isSorcierePhase = !!(
    sorciereTimer &&
    currentTime >= (sorciereTimer.startTime ?? 0) &&
    currentTime < (sorciereTimer.endTime ?? 0) &&
    $timer.timer > 0
  );
  $: isSorciere = currentUser?.role?.toLowerCase() === 'sorcière' || currentUser?.role?.toLowerCase() === 'sorciere';
</script>

<div class="night-phase">
  {#if isNight0}
    <ChienLoupAction />
    <!-- Permettre à l'Enfant Sauvage de choisir son maître pendant la nuit 0 -->
    {#if currentUser?.role === 'Enfant sauvage'}
      <EnfantSauvage {currentUser} />
    {/if}
  {/if}

  {#if $gameState.phase === 'nuit' && $gameState.cycleCount > 0 && currentUser?.role}
    {#if currentUser.role === 'Voyante'}
      <Voyante {currentUser} />
    {:else if isLoupGarou}
      <LGN {currentUser} />
    {:else if activePhase === 'loupBlanc' && currentUser.role?.toLowerCase().includes('loup blanc')}
      <LoupBlanc {currentUser} />
    {:else if activePhase === 'infectPereDesLoups' && currentUser.role?.toLowerCase().includes('infect')}
      <InfectPereDesLoups {currentUser} />
    {:else if isSorcierePhase && isSorciere}
      <Sorciere {currentUser} />
    {/if}

    <!-- L'Enfant Sauvage peut avoir besoin de se réveiller à n'importe quel moment -->
    <EnfantSauvage {currentUser} />
  {/if}
</div>

<style>
  .night-phase {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
  }
</style>

