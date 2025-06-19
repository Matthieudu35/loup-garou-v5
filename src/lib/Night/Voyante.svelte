<script lang="ts">
    import { gameState } from '../../stores/gameState';
    import { users } from '../../stores/usersStore';
    import { eliminationStore } from '../../stores/eliminationStore';
    import { activeSubTimer, userHasActiveRole } from '../../stores/subTimerStore';
    import { isCurrentPlayerWolf } from '../../stores/chienLoupStore';
    import { isCurrentPlayerWolf as isEnfantSauvageWolf } from '../../stores/enfantSauvageStore';
    import type { User } from '../../stores/types';
    import { onDestroy } from 'svelte';

    export let currentUser: User;

    let selectedPlayer: User | null = null;
    let hasChosen = false;

    // Filtrer les joueurs vivants
    $: alivePlayers = $users.filter(user => 
        !user.isAdmin && 
        !$eliminationStore.some(e => e.playerLogin === user.login)
    );

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

    function handlePlayerClick(player: User) {
        if (!hasChosen) {
            selectedPlayer = player;
        }
    }

    function confirmChoice() {
        if (selectedPlayer) {
            hasChosen = true;
        }
    }

    function cancelChoice() {
        selectedPlayer = null;
    }

    // Réinitialiser le choix quand la nuit se termine
    let unsubscribeGameState: (() => void) | undefined;
    $: {
        if (!unsubscribeGameState) {
            unsubscribeGameState = gameState.subscribe(state => {
                if (state.phase === 'nuit') {
                    hasChosen = false;
                }
            });
        }
    }
    onDestroy(() => {
        if (unsubscribeGameState) unsubscribeGameState();
    });
</script>

<div class="vote-section">
    <div class="timer-info">
        <h2>Phase de la Voyante</h2>
    </div>

    {#if hasChosen && selectedPlayer}
        <div class="chosen-player">
            <p>Vous avez vu le rôle de {selectedPlayer.firstName} {selectedPlayer.lastName}</p>
            <p class="role">{selectedPlayer.role || 'Villageois'}</p>
        </div>
    {:else if alivePlayers.length > 0}
        <p>Qui voulez-vous observer ?</p>

        <div class="players-grid">
            {#each alivePlayers as player}
                <button 
                    class="vote-button"
                    class:selected={selectedPlayer?.login === player.login}
                    on:click={() => handlePlayerClick(player)}
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
                        on:click={cancelChoice}
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
                    
                    <p>Voulez-vous observer {selectedPlayer.firstName} {selectedPlayer.lastName} ?</p>
                    
                    <div class="confirmation-buttons">
                        <button class="confirm-button" on:click={confirmChoice}>
                            Confirmer
                        </button>
                    </div>
                </div>
            </div>
        {/if}
    {:else}
        <p>Aucun joueur disponible pour observer.</p>
    {/if}
</div>

<style>
    .vote-section {
        margin: 1rem;
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

    .chosen-player {
        text-align: center;
        padding: 1rem;
        background-color: rgba(44, 62, 80, 0.1);
        border-radius: 8px;
        margin: 1rem 0;
    }

    .chosen-player .role {
        font-size: 1.2rem;
        font-weight: bold;
        color: var(--primary);
        margin-top: 0.5rem;
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
</style>
