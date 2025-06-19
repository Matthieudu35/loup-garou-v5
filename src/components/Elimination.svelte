<script lang="ts">
    import { onMount } from 'svelte';
    import { eliminationStore, type Elimination } from '../stores/eliminationStore';
    import { gameState } from '../stores/gameState';
    import { users, selectedPlayers, getUserByLogin } from '../stores/usersStore';
    
    // Phase actuelle
    $: currentTheme = $gameState.phase === 'nuit' ? 'nuit' : 'jour';
    
    // Fonction pour obtenir la source d'élimination
    function getEliminationSource(elimination: Elimination): string {
        const sourceMap: Record<string, string> = {
            'admin': 'Administrateur',
            'vote': 'Vote du village',
            'loup-garou': 'Attaque des loups-garous',
            'sorciere': 'Potion de la sorcière',
            'chasseur': 'Pouvoir du chasseur',
            'other': 'Autre'
        };
        return sourceMap[elimination.source] || 'Inconnu';
    }
    
    const resurrectPlayer = (playerLogin: string) => {
        const player = getUserByLogin(playerLogin);
        if (confirm(`Voulez-vous vraiment ressusciter ${player?.firstName} ${player?.lastName || ''} ?`)) {
            eliminationStore.resurrect(playerLogin);
        }
    };

    const displayNames = {
        sorciere: 'Sorcière',
        // autres mappings...
    };
</script>

<section class="elimination-system" data-theme={currentTheme}>
    <div class="elimination-header">
        <h2>Joueurs éliminés</h2>
        <span class="count">{$eliminationStore.length}</span>
    </div>
    
    <div class="eliminated-players">
        {#if $eliminationStore.length === 0}
            <p class="no-eliminations">Aucun joueur n'a été éliminé</p>
        {:else}
            <ul class="eliminated-list">
                {#each $eliminationStore as elimination}
                    {@const player = getUserByLogin(elimination.playerLogin)}
                    <li class="eliminated-player">
                        <div class="player-info">
                            <span class="player-name">
                                {player?.firstName} {player?.lastName || ''}
                            </span>
                            <span class="elimination-source">
                                Éliminé par : {getEliminationSource(elimination)}
                            </span>
                            {#if elimination.details}
                                <span class="elimination-details">
                                    {elimination.details}
                                </span>
                            {/if}
                        </div>
                        <button 
                            class="resurrect-btn"
                            on:click={() => resurrectPlayer(elimination.playerLogin)}
                            title="ressusciter le joueur"
                        >
                            ↺
                        </button>
                    </li>
                {/each}
            </ul>
        {/if}
    </div>
</section>

<style>
    .elimination-system {
        margin: var(--spacing-lg) auto;
        padding: var(--spacing-md);
        max-width: 600px;
        border-radius: var(--border-radius-md);
        background-color: var(--primary);
        color: var(--secondary);
        box-shadow: var(--shadow-md);
    }

    .elimination-system[data-theme='nuit'] {
        background-color: var(--primary);
        color: var(--secondary);
    }

    .elimination-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: var(--spacing-md);
        padding-bottom: var(--spacing-sm);
        border-bottom: var(--border-light);
    }

    h2 {
        margin: 0;
        font-size: 1.2rem;
        font-weight: 500;
        letter-spacing: 0.5px;
    }

    .count {
        background-color: var(--disabled);
        padding: var(--spacing-sm) var(--spacing-md);
        border-radius: var(--border-radius-full);
        font-size: 0.9rem;
        font-weight: 500;
    }
    
    .no-eliminations {
        text-align: center;
        font-style: italic;
        opacity: 0.8;
        margin: var(--spacing-lg) 0;
        font-size: 1rem;
        padding: var(--spacing-md);
        background-color: rgba(191, 185, 153, 0.2);
        border-radius: var(--border-radius-md);
        border: 1px solid rgba(191, 185, 153, 0.3);
        color: #BFB999;
    }
    
    .elimination-system[data-theme='nuit'] .no-eliminations {
        background-color: rgba(44, 62, 80, 0.2);
        border: 1px solid rgba(44, 62, 80, 0.3);
        color: #2C3E50;
    }
    
    .eliminated-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: var(--spacing-sm);
    }

    .player-info {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-sm);
    }

    .elimination-source {
        font-size: 0.8rem;
        opacity: 0.7;
        font-style: italic;
    }
    
    .eliminated-player {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--spacing-md) var(--spacing-md);
        background-color: var(--disabled);
        border-radius: var(--border-radius-md);
        transition: all var(--transition-fast);
    }

    .eliminated-player:hover {
        background-color: rgba(255, 255, 255, 0.08);
    }

    .player-name {
        font-size: 0.95rem;
        opacity: 0.9;
        text-decoration: line-through;
    }
    
    .resurrect-btn {
        background: none;
        border: none;
        color: inherit;
        font-size: 1.2rem;
        cursor: pointer;
        padding: var(--spacing-sm);
        border-radius: var(--border-radius-full);
        opacity: 0.6;
        transition: all var(--transition-fast);
    }

    .resurrect-btn:hover {
        opacity: 1;
        background-color: var(--disabled);
    }

    .elimination-details {
        font-size: 0.8rem;
        opacity: 0.7;
        font-style: italic;
        margin-top: var(--spacing-sm);
    }
</style> 