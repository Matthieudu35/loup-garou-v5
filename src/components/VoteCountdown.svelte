<script lang="ts">
    import { onMount } from 'svelte';
    import { gameState } from '../stores/gameState';
    import { users } from '../stores/usersStore';
    import { voteCounts } from '../stores/dayVoteStore';
    import { getUserByLogin } from '../stores/gameLogic';
    import { fade, scale } from 'svelte/transition';
    import type { User } from '../stores/types';
    import { eliminationStore } from '../stores/eliminationStore';
    import { getVoteResult, resetAll as resetVotes } from '../stores/dayVoteStore';
    import { switchPhase } from '../stores/gameLogic';
    import { get } from 'svelte/store';

    let sortedVotes: { login: string; count: number; user: User | undefined }[] = [];
    let currentIndex = 0;
    let isComplete = false;

    $: {
        // Trier les votes par ordre croissant
        sortedVotes = Object.entries($voteCounts)
            .map(([login, count]) => ({
                login,
                count,
                user: getUserByLogin(login)
            }))
            .sort((a, b) => a.count - b.count);
    }

    onMount(() => {
        // Afficher chaque vote avec un délai
        const interval = setInterval(() => {
            if (currentIndex < sortedVotes.length) {
                currentIndex++;
            } else {
                isComplete = true;
                clearInterval(interval);
            }
        }, 1000); // 1 seconde entre chaque vote

        return () => clearInterval(interval);
    });

    $: if (isComplete && $gameState.phase === 'jour' && $gameState.showVoteCountdown) {
        // Élimination automatique si pas égalité
        const result = getVoteResult();
        if (!result.isTie && result.winner) {
            eliminationStore.eliminate(result.winner, 'vote', 'vote', 'Élimination par vote du village');
        }
        // Réinitialiser les votes pour le prochain tour
        resetVotes();
        // Masquer le countdown et passer à la nuit après un court délai
        setTimeout(() => {
            gameState.update(state => ({ ...state, showVoteCountdown: false }));
            switchPhase();
        }, 2000); // 2 secondes pour laisser le temps de lire le résultat
    }
</script>

<div class="overlay" transition:fade>
    <div class="content" transition:scale>
        <div class="vote-countdown-banner">
            <div class="vote-countdown-content">
                <h2>Décompte des Votes</h2>
                <div class="votes-list">
                    {#each sortedVotes.slice(0, currentIndex) as vote}
                        <div class="vote-item">
                            <span class="player-name">
                                {vote.user?.firstName} {vote.user?.lastName || ''}
                            </span>
                            <span class="vote-count">
                                {vote.count} {vote.count > 1 ? 'voix' : 'voix'}
                            </span>
                        </div>
                    {/each}
                </div>
                {#if isComplete}
                    <p class="final-result">
                        {#if sortedVotes.length > 0}
                            {#if sortedVotes.length > 1 && sortedVotes[sortedVotes.length - 1].count === sortedVotes[sortedVotes.length - 2].count}
                                Égalité : le maire décide qui éliminer
                            {:else}
                                {sortedVotes[sortedVotes.length - 1].user?.firstName} {sortedVotes[sortedVotes.length - 1].user?.lastName || ''} 
                                est {$gameState.cycleCount === 1 ? 'élu maire' : 'éliminé'} avec {sortedVotes[sortedVotes.length - 1].count} voix !
                            {/if}
                        {:else}
                            Aucun vote n'a été enregistré.
                        {/if}
                    </p>
                {/if}
            </div>
        </div>
    </div>
</div>

<style>
    .overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
    }

    .content {
        max-width: 90%;
        width: 600px;
    }

    .vote-countdown-banner {
        background: linear-gradient(135deg, rgba(25, 55, 109, 0.95), rgba(44, 62, 80, 0.95));
        border-radius: 1rem;
        padding: 1.5rem;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        border: 1px solid rgba(255, 215, 0, 0.2);
    }

    .vote-countdown-content {
        width: 100%;
    }

    .vote-countdown-content h2 {
        color: #FFD700;
        margin: 0 0 1rem 0;
        font-size: 1.5rem;
        text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
        text-align: center;
    }

    .votes-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-bottom: 1rem;
    }

    .vote-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 0.5rem;
        color: #fff;
    }

    .player-name {
        font-weight: 500;
    }

    .vote-count {
        color: #FFD700;
        font-weight: bold;
    }

    .final-result {
        margin: 1rem 0 0 0;
        padding-top: 1rem;
        border-top: 1px solid rgba(255, 215, 0, 0.2);
        color: #FFD700;
        font-weight: bold;
        text-align: center;
    }
</style> 