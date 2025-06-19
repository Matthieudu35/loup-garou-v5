<script lang="ts">
    import { gameState } from '../../stores/gameState';
    import { users, selectedPlayers } from '../../stores/usersStore';
    import { eliminationStore } from '../../stores/eliminationStore';
    import { activeSubTimer, userHasActiveRole, subTimers } from '../../stores/subTimerStore';
    import { loupVotes, setLoupVote, alivePlayers, getLoupVote, loupVictim, setLoupVictim, getMajorityVictim } from '../../stores/chosen';
    import { isCurrentPlayerWolf } from '../../stores/chienLoupStore';
    import { isCurrentPlayerWolf as isEnfantSauvageWolf } from '../../stores/enfantSauvageStore';
    import { timer } from '../../stores/timerStore';
    import type { User } from '../../stores/types';
    import { onDestroy } from 'svelte';

    export let currentUser: User;

    let selectedPlayer: User | null = null;

    // Simplification de la logique - si on est dans ce composant, c'est qu'on est un loup
    $: isLoupGarou = true;
    $: shouldWakeUp = true;

    // Trouver spécifiquement le sous-timer des loups
    $: loupTimer = $subTimers.find(t => t.id === 'lgn');
    
    let isLoupTimerActive: boolean = false;
    let isLoupTimerFinished: boolean = false;

    // Vérifier l'état du timer des loups en fonction du temps écoulé
    $: {
        const currentTime = $timer.initialTimer - $timer.timer;
        // Le timer est actif si on est dans sa période de temps
        isLoupTimerActive = !!(
            loupTimer &&
            currentTime >= (loupTimer?.startTime ?? 0) &&
            currentTime < (loupTimer?.endTime ?? 0) &&
            $timer.timer > 0
        );
        // Le timer est terminé si on est après sa période de temps
        isLoupTimerFinished = !!(
            loupTimer &&
            currentTime >= (loupTimer?.endTime ?? 0) &&
            $timer.timer > 0
        );

        console.log('LGN Timer Debug:', {
            loupTimer,
            currentTime,
            startTime: loupTimer?.startTime ?? 0,
            endTime: loupTimer?.endTime ?? 0,
            isActive: loupTimer?.isActive,
            timerRunning: $timer.timer > 0,
            isLoupTimerActive,
            isLoupTimerFinished,
            conditions: {
                timerExists: !!loupTimer,
                inTimeRange: currentTime >= (loupTimer?.startTime ?? 0) && currentTime < (loupTimer?.endTime ?? 0),
                pastEndTime: currentTime >= (loupTimer?.endTime ?? 0),
                mainTimerRunning: $timer.timer > 0
            }
        });
    }

    // Ajouter des logs détaillés pour débugger les loups garous
    $: console.log('LGN Loup Garou Debug:', { 
        currentUser: currentUser?.login,
        role: currentUser?.role,
        roleLC: currentUser?.role?.toLowerCase(),
        isLoupGarou,
        shouldWakeUp,
        activeSubTimer: $activeSubTimer?.id,
        activeSubTimerIsActive: $activeSubTimer?.isActive,
        loupTimer: loupTimer?.id,
        loupTimerActive: loupTimer?.isActive,
        loupTimerDuration: loupTimer?.duration,
        isLoupTimerActive,
        timerRunning: $timer.timer > 0,
        gamePhase: $gameState.phase,
        gameCycle: $gameState.cycleCount,
        availableTargets: availableTargets.length
    });

    // Vérifier si le joueur a déjà voté
    $: hasVoted = currentUser?.login in $loupVotes;

    // Obtenir le joueur pour qui l'utilisateur a voté
    $: votedFor = hasVoted ? $loupVotes[currentUser?.login] : null;

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

    // Fonctions pour le timer
    function formatTime(seconds: number): string {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    // Calculer le temps restant pour le sous-timer des loups
    function getLoupSubTimerRemainingTime(): number {
        if (!loupTimer) return 0;
        
        const currentTime = $timer.initialTimer - $timer.timer;
        if (currentTime < loupTimer.startTime) {
            return loupTimer.duration;
        }
        if (currentTime > loupTimer.endTime) {
            return 0;
        }
        return loupTimer.endTime - currentTime;
    }

    // Calculer le pourcentage de progression pour le sous-timer des loups
    function getLoupSubTimerProgress(): number {
        if (!loupTimer) return 0;
        
        const currentTime = $timer.initialTimer - $timer.timer;
        if (currentTime < loupTimer.startTime) {
            return 100;
        }
        if (currentTime > loupTimer.endTime) {
            return 0;
        }
        return 100 - ((currentTime - loupTimer.startTime) / loupTimer.duration) * 100;
    }

    function handleVoteClick(player: User) {
        if (!hasVoted) {
            selectedPlayer = player;
        }
    }

    function confirmVote() {
        if (selectedPlayer && !hasVoted) {
            setLoupVote(currentUser.login, selectedPlayer.login);
            selectedPlayer = null;
        }
    }

    function cancelVote() {
        selectedPlayer = null;
    }

    // Détecter la fin du sous-timer des loups et stocker la victime
    $: if (loupTimer && !loupTimer.isActive && $timer.timer > 0) {
        setLoupVictim(getMajorityVictim());
    }

    let unsubscribeGameState: (() => void) | undefined;
    $: {
        if (!unsubscribeGameState) {
            unsubscribeGameState = gameState.subscribe(state => {
                if (state.phase === 'nuit') {
                    selectedPlayer = null;
                }
            });
        }
    }
    onDestroy(() => {
        if (unsubscribeGameState) unsubscribeGameState();
    });
</script>

{#if isLoupTimerActive}
    <!-- Affichage uniquement quand le timer des loups est actif -->
    <div class="vote-section">
        <div class="timer-info">
            <h2>Phase des Loups Garous</h2>
            
            <!-- Affichage du sous-timer de style Admin pour les loups spécifiquement -->
            <div class="sub-timer" class:active={loupTimer?.isActive}>
                <div class="sub-timer-content">
                    <p class="timer-text">
                        Temps restant : {formatTime(getLoupSubTimerRemainingTime())}
                    </p>
                    <div class="timer-bar">
                        <div 
                            class="timer-progress" 
                            style="width: {getLoupSubTimerProgress()}%"
                        ></div>
                    </div>
                </div>
            </div>
        </div>

        {#if hasVoted && votedFor}
            {@const votedPlayer = $users.find(u => u.login === votedFor)}
            {#if votedPlayer}
                <p>Vous avez déjà voté pour {votedPlayer.firstName} {votedPlayer.lastName}.</p>
            {:else}
                <p>Vote enregistré</p>
            {/if}
        {:else if availableTargets.length > 0}
            <p>Pour qui voulez-vous voter ?</p>

            <div class="players-grid">
                {#each availableTargets as player}
                    <button 
                        class="vote-button"
                        class:selected={selectedPlayer?.login === player.login}
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
        {:else}
            <p>Aucun joueur disponible pour voter.</p>
            <p>Vérifiez que des joueurs sont sélectionnés et vivants.</p>
        {/if}
    </div>
{:else}
    <div class="waiting-message">
        <h2>Phase des Loups Garous</h2>
        {#if isLoupTimerFinished}
            <p>La phase des loups est terminée</p>
        {:else}
            <p>Attendez que le timer des loups soit activé...</p>
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
        background-color: rgba(200, 24, 24, 0.1);
        border-radius: 8px;
        border: 1px dashed rgba(200, 24, 24, 0.3);
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
        background-color: var(--background);
        border-radius: 1rem;
        padding: 1.5rem;
        width: 90%;
        max-width: 400px;
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .close-button {
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        width: 2rem;
        height: 2rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background-color: var(--background-light);
    }

    .close-button::before,
    .close-button::after {
        content: '';
        position: absolute;
        width: 1rem;
        height: 2px;
        background-color: var(--text-color);
    }

    .close-button::before {
        transform: rotate(45deg);
    }

    .close-button::after {
        transform: rotate(-45deg);
    }

    .player-photo {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        object-fit: cover;
        margin-bottom: 1rem;
        border: 3px solid var(--primary);
    }

    .photo-placeholder {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background-color: var(--primary-light);
        margin-bottom: 1rem;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 1.5rem;
        border: 3px solid var(--primary);
    }

    .confirmation-buttons {
        display: flex;
        gap: 1rem;
        margin-top: 1.5rem;
        width: 100%;
        justify-content: center;
    }

    .confirm-button {
        background-color: var(--success);
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 0.5rem;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .confirm-button:hover {
        background-color: var(--success-dark);
        transform: translateY(-2px);
    }

    /* Styles pour le sous-timer */
    .sub-timer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: 1rem auto;
        padding: 0.5rem;
        background-color: rgba(175, 169, 137, 0.4);
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 
                   inset 0 1px rgba(255, 255, 255, 0.2),
                   0 0 20px rgba(191, 185, 153, 0.3);
        animation: glow-day 3s ease-in-out infinite alternate;
        width: 100%;
        max-width: 400px;
    }

    .sub-timer-content {
        flex: 1;
        margin: 0 auto;
    }

    .sub-timer .timer-bar {
        width: 100%;
        height: 8px;
        background-color: rgba(0, 0, 0, 0.1);
        border-radius: 4px;
        overflow: hidden;
        position: relative;
    }

    .sub-timer .timer-progress {
        height: 100%;
        background-color: #c81818;
        transition: width 0.5s ease-out;
        position: relative;
    }

    .sub-timer .timer-progress::after {
        content: '';
        position: absolute;
        top: -2px;
        right: 0;
        height: 12px;
        width: 25px;
        background: linear-gradient(90deg, transparent, #c81818, #c81818);
        filter: blur(3px);
        animation: glow-edge 2s ease-in-out infinite;
        box-shadow: 0 0 10px #c81818;
    }

    @keyframes glow-edge {
        0%, 100% {
            opacity: 0.7;
            filter: blur(3px);
            box-shadow: 0 0 10px #c81818;
        }
        50% {
            opacity: 1;
            filter: blur(5px);
            box-shadow: 0 0 15px #c81818;
        }
    }

    @keyframes glow-day {
        0%, 100% {
            box-shadow: 0 0 5px rgba(255, 0, 0, 0.5);
        }
        50% {
            box-shadow: 0 0 15px rgba(255, 0, 0, 0.7);
        }
    }

    .sub-timer.active {
        border: 2px solid #c81818;
        box-shadow: 0 0 15px rgba(200, 24, 24, 0.5);
    }

    .sub-timer .timer-text {
        font-size: 1.1rem;
        font-weight: bold;
        color: var(--text-color);
        margin: 0.3rem 0;
    }
</style>