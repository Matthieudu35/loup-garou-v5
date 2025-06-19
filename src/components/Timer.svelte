<script lang="ts">
    import { rolesConfig, totalPlayers, rolesAssigned, assignRoles } from '../stores/rolesStore';
    import { users, selectedPlayers } from '../stores/usersStore';
    import { gameState } from '../stores/gameState';
    import { startGame, switchPhase, resetGame } from '../stores/gameLogic';
    import { timer } from '../stores/timerStore';
    import PlayersMenu from './PlayersMenu.svelte';
    import { Team, ROLES } from '../stores/teams';
    import { onMount } from 'svelte';
    import { setTimerCompleteCallback } from '../stores/timerStore';

    let newTime: number = 3600; // Valeur par défaut pour modifier le timer
    let showPlayerSelection = false;

    // Filtrer les utilisateurs non-admin
    $: availablePlayers = $users.filter(user => !user.isAdmin);

    // Calculer si la sélection est complète
    $: isSelectionComplete = $selectedPlayers.length === $totalPlayers;

    // Formatage du timer
    $: minutes = Math.floor($timer.timer / 60);
    $: seconds = $timer.timer % 60;
    $: formattedTimeDisplay = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    

    function handleShowPlayerSelection() {
        selectedPlayers.set(availablePlayers.map(player => player.login));
        showPlayerSelection = true;
    }

    function togglePlayer(playerId: string): void {
        selectedPlayers.update(players => {
            if (players.includes(playerId)) {
                return players.filter(id => id !== playerId);
            } else {
                return [...players, playerId];
            }
        });
    }

    function updateRoleCount(role: keyof typeof $rolesConfig, value: string): void {
        const count = parseInt(value) || 0;
        rolesConfig.update(state => ({
            ...state,
            [role]: Math.max(0, count)
        }));
    }

    // Exemple d'utilisation
    const werewolves = ROLES.filter(role => role.team === Team.WEREWOLVES);
    const villagers = ROLES.filter(role => role.team === Team.VILLAGERS);
    const specialRoles = ROLES.filter(role => role.team === Team.SPECIAL);
    const soloPlayers = ROLES.filter(role => role.team === Team.SOLO);

    $: ({ timer: timeLeft, initialTimer, running } = $timer);
    $: progressPercentage = (timeLeft / initialTimer) * 100;
    
    // Fonction pour convertir les secondes en format mm:ss
    function formatTime(seconds: number): string {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    onMount(() => {
        setTimerCompleteCallback(() => {
            switchPhase();
        });
    });
</script>

<div class="container">
    {#if $gameState.gameStarted}
        <div class="timer-container" class:fade-in={$gameState.gameStarted}>
            <p class="phase-text">{$gameState.phase} {$gameState.cycleCount}</p>
            <p class="timer-text">Temps restant : {formatTime(timeLeft)}</p>
            <div class="timer-bar">
                <div 
                    class="timer-progress" 
                    style="width: {progressPercentage}%"
                ></div>
            </div>
        </div>
    {/if}

    {#if !$gameState.gameStarted}
        <div class="card">
            <h2 class="title">Début de partie</h2>

            <div class="roles-grid">
                <div class="role-item">
                    <label for="loupGarou">Loup-Garou :</label>
                    <input 
                        type="number" 
                        id="loupGarou"
                        value={$rolesConfig.loupGarou}
                        on:input={(e) => updateRoleCount('loupGarou', e.currentTarget.value)}
                        min="0"
                    />
                </div>

                <div class="role-item">
                    <label for="loupSolitaire">Loup Solitaire :</label>
                    <input 
                        type="number" 
                        id="loupSolitaire"
                        value={$rolesConfig.loupSolitaire}
                        on:input={(e) => updateRoleCount('loupSolitaire', e.currentTarget.value)}
                        min="0"
                    />
                </div>

                <div class="role-item">
                    <label for="infectPereDesLoups">Infect Père des Loups :</label>
                    <input 
                        type="number" 
                        id="infectPereDesLoups"
                        value={$rolesConfig.infectPereDesLoups}
                        on:input={(e) => updateRoleCount('infectPereDesLoups', e.currentTarget.value)}
                        min="0"
                    />
                </div>

                <div class="role-item">
                    <label for="grandMechantLoup">Grand Méchant Loup :</label>
                    <input 
                        type="number" 
                        id="grandMechantLoup"
                        value={$rolesConfig.grandMechantLoup}
                        on:input={(e) => updateRoleCount('grandMechantLoup', e.currentTarget.value)}
                        min="0"
                    />
                </div>

                <div class="role-item">
                    <label for="loupBlanc">Loup Blanc :</label>
                    <input 
                        type="number" 
                        id="loupBlanc"
                        value={$rolesConfig.loupBlanc}
                        on:input={(e) => updateRoleCount('loupBlanc', e.currentTarget.value)}
                        min="0"
                    />
                </div>

                <div class="role-item">
                    <label for="enfantSauvage">Enfant Sauvage :</label>
                    <input 
                        type="number" 
                        id="enfantSauvage"
                        value={$rolesConfig.enfantSauvage}
                        on:input={(e) => updateRoleCount('enfantSauvage', e.currentTarget.value)}
                        min="0"
                    />
                </div>

                <div class="role-item">
                    <label for="chienLoup">Chien-Loup :</label>
                    <input 
                        type="number" 
                        id="chienLoup"
                        value={$rolesConfig.chienLoup}
                        on:input={(e) => updateRoleCount('chienLoup', e.currentTarget.value)}
                        min="0"
                    />
                </div>

                <div class="role-item">
                    <label for="voyante">Voyante :</label>
                    <input 
                        type="number" 
                        id="voyante"
                        value={$rolesConfig.voyante}
                        on:input={(e) => updateRoleCount('voyante', e.currentTarget.value)}
                        min="0"
                    />
                </div>

                <div class="role-item">
                    <label for="sorciere">Sorcière :</label>
                    <input 
                        type="number" 
                        id="sorciere"
                        value={$rolesConfig.sorciere}
                        on:input={(e) => updateRoleCount('sorciere', e.currentTarget.value)}
                        min="0"
                    />
                </div>

                <div class="role-item">
                    <label for="chasseur">Chasseur :</label>
                    <input 
                        type="number" 
                        id="chasseur"
                        value={$rolesConfig.chasseur}
                        on:input={(e) => updateRoleCount('chasseur', e.currentTarget.value)}
                        min="0"
                    />
                </div>

                <div class="role-item">
                    <label for="soeurRouge">Sœur Rouge :</label>
                    <input 
                        type="number" 
                        id="soeurRouge"
                        value={$rolesConfig.soeurRouge}
                        on:input={(e) => updateRoleCount('soeurRouge', e.currentTarget.value)}
                        min="0"
                    />
                </div>

                <div class="role-item">
                    <label for="soeurBleue">Sœur Bleue :</label>
                    <input 
                        type="number" 
                        id="soeurBleue"
                        value={$rolesConfig.soeurBleue}
                        on:input={(e) => updateRoleCount('soeurBleue', e.currentTarget.value)}
                        min="0"
                    />
                </div>

                <div class="role-item">
                    <label for="frereVert">Frère Vert :</label>
                    <input 
                        type="number" 
                        id="frereVert"
                        value={$rolesConfig.frereVert}
                        on:input={(e) => updateRoleCount('frereVert', e.currentTarget.value)}
                        min="0"
                    />
                </div>

                <div class="role-item">
                    <label for="frereJaune">Frère Jaune :</label>
                    <input 
                        type="number" 
                        id="frereJaune"
                        value={$rolesConfig.frereJaune}
                        on:input={(e) => updateRoleCount('frereJaune', e.currentTarget.value)}
                        min="0"
                    />
                </div>

                <div class="role-item">
                    <label for="ancien">Ancien :</label>
                    <input 
                        type="number" 
                        id="ancien"
                        value={$rolesConfig.ancien}
                        on:input={(e) => updateRoleCount('ancien', e.currentTarget.value)}
                        min="0"
                    />
                </div>

                <div class="role-item">
                    <label for="villageois">Villageois :</label>
                    <input 
                        type="number" 
                        id="villageois"
                        value={$rolesConfig.villageois}
                        on:input={(e) => updateRoleCount('villageois', e.currentTarget.value)}
                        min="0"
                    />
                </div>
            </div>

            <p class="total">Total des joueurs : {$totalPlayers}</p>

            {#if !showPlayerSelection}
                <button 
                    on:click={handleShowPlayerSelection} 
                    class="btn-blue"
                >
                    Attribuer les rôles
                </button>
            {/if}

            {#if showPlayerSelection}
                <div class="selection-container">
                    <h3 class="selection-title">Sélection des joueurs</h3>

                    <div class="players-grid">
                        {#each availablePlayers as player}
                            <label class="player-checkbox">
                                <input 
                                    type="checkbox" 
                                    checked={$selectedPlayers.includes(player.login)}
                                    on:change={() => togglePlayer(player.login)}
                                />
                                <span>{player.firstName} {player.lastName?.[0]}.</span>
                            </label>
                        {/each}
                    </div>

                    <p class="selection-count mb-4">
                        {$selectedPlayers.length} joueurs sélectionnés sur {$totalPlayers} nécessaires
                    </p>

                    <div class="buttons-container">
                        <button 
                            class="btn-blue" 
                            disabled={!isSelectionComplete}
                            on:click={() => {
                                assignRoles();
                                alert('Les rôles ont été attribués !');
                            }}
                        >
                            OK
                        </button>
                        <button 
                            class="btn-green" 
                            disabled={!$rolesAssigned}
                            on:click={() => {
                                startGame();
                                timer.start();
                            }}
                        >
                            Lancer la partie
                        </button>
                    </div>
                </div>
            {/if}
        </div>
    {/if}

    {#if $gameState.gameStarted}
        {#if $gameState.phase === 'jour' || $gameState.phase === 'nuit'}
            <!-- Suppression de la section Elimination qui est en double -->
        {/if}

        <PlayersMenu />
    {/if}
</div>

<style>
    .container {
        padding: 1rem;
    }

    .card {
        background-color: var(--bg-color);
        border-radius: 0.5rem;
        box-shadow: var(--shadow-sm);
        padding: 1.5rem;
        max-width: 56rem;
        margin: 1rem auto;
        border: 2px solid var(--primary);
    }

    .title {
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--text-color);
        margin-bottom: 1rem;
    }

    .roles-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
        margin: 1rem 0;
    }

    .role-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .role-item label {
        flex: 1;
        text-align: right;
        color: var(--text-color);
    }

    .role-item input {
        width: 60px;
        padding: 0.25rem;
        border: 1px solid var(--primary);
        border-radius: 4px;
        background-color: var(--bg-color);
        color: var(--text-color);
    }

    .total {
        margin-top: 1rem;
        font-weight: bold;
        color: var(--text-color);
    }

    .selection-container {
        width: 100%;
        max-width: 1200px;
        margin: 2rem auto;
        padding: 1rem;
    }

    .selection-title {
        font-size: 1.5rem;
        font-weight: bold;
        margin-bottom: 1rem;
        text-align: center;
    }

    .selection-count {
        font-size: 1.1rem;
        text-align: center;
        color: var(--text-color);
    }

    .players-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 1rem;
        margin: 1rem 0;
        width: 100%;
    }

    .player-checkbox {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem;
        background-color: var(--bg-color);
        border: 1px solid var(--primary);
        border-radius: 0.5rem;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .player-checkbox:hover {
        transform: translateY(-2px);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .buttons-container {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        gap: 1rem;
        margin: 2rem auto;
    }

    .btn-blue, .btn-green {
        padding: 0.75rem 1.5rem;
        border-radius: 0.5rem;
        font-weight: bold;
        transition: all 0.2s ease;
        min-width: 160px 
    }

    .btn-blue:disabled, .btn-green:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    /* Timer styles */
    .timer-container {
        text-align: center;
        margin: 0;
        padding: 1rem;
        border-radius: 8px;
        background-color: rgba(175, 169, 137, 0.4);
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 
                   inset 0 1px rgba(255, 255, 255, 0.2),
                   0 0 20px rgba(191, 185, 153, 0.3);
        animation: glow-day 3s ease-in-out infinite alternate;
    }

    @keyframes glow-day {
        from {
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 
                       inset 0 1px rgba(255, 255, 255, 0.2),
                       0 0 20px rgba(191, 185, 153, 0.3);
        }
        to {
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 
                       inset 0 1px rgba(255, 255, 255, 0.2),
                       0 0 30px rgba(191, 185, 153, 0.5);
        }
    }

    @keyframes glow-night {
        from {
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2), 
                       inset 0 1px rgba(255, 255, 255, 0.1),
                       0 0 20px rgba(52, 73, 94, 0.4);
        }
        to {
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2), 
                       inset 0 1px rgba(255, 255, 255, 0.1),
                       0 0 30px rgba(52, 73, 94, 0.6);
        }
    }
    
    .timer-bar {
        width: 100%;
        height: 8px;
        background-color: rgba(0, 0, 0, 0.1);
        border-radius: 4px;
        overflow: hidden;
        margin-top: 8px;
        position: relative;
    }

    .timer-progress {
        height: 100%;
        background-color: #2C3E50;
        transition: width 0.5s ease-out;
        position: relative;
    }

    .timer-progress::after {
        content: '';
        position: absolute;
        top: -2px;
        right: 0;
        height: 12px;
        width: 25px;
        background: linear-gradient(90deg, transparent, #2C3E50, #2C3E50);
        filter: blur(3px);
        animation: glow-edge 2s ease-in-out infinite;
        box-shadow: 0 0 10px #2C3E50;
    }

    @keyframes glow-edge {
        0%, 100% {
            opacity: 0.7;
            filter: blur(3px);
            box-shadow: 0 0 10px #2C3E50;
        }
        50% {
            opacity: 1;
            filter: blur(5px);
            box-shadow: 0 0 15px #2C3E50;
        }
    }

    .phase-text {
        font-size: 1.4rem;
        font-weight: bold;
        color: #2C3E50;
        margin: 0 0 0.5rem 0;
        text-transform: capitalize;
    }

    .timer-text {
        font-size: 1.2rem;
        font-weight: bold;
        color: #2C3E50;
        margin: 0;
    }

    @media (max-width: 640px) {
        .timer-container {
            padding: 0.75rem;
        }

        .phase-text {
            font-size: 1.2rem;
            margin-bottom: 0.3rem;
        }

        .timer-bar {
            height: 6px;
            margin-top: 6px;
        }

        .timer-text {
            font-size: 1rem;
        }
    }

    :global(html[data-theme="nuit"]) .timer-container {
        background-color: rgba(71, 94, 117, 0.4);
        animation: glow-night 3s ease-in-out infinite alternate;
    }

    :global(html[data-theme="nuit"]) .timer-bar {
        background-color: rgba(0, 0, 0, 0.3);
    }

    :global(html[data-theme="nuit"]) .timer-progress {
        background-color: #BFB999;
    }

    :global(html[data-theme="nuit"]) .timer-progress::after {
        background: linear-gradient(90deg, transparent, #BFB999, #BFB999);
        box-shadow: 0 0 10px #BFB999;
    }

    @keyframes glow-edge-night {
        0%, 100% {
            opacity: 0.7;
            filter: blur(3px);
            box-shadow: 0 0 10px #BFB999;
        }
        50% {
        opacity: 1;
            filter: blur(5px);
            box-shadow: 0 0 15px #BFB999;
        }
    }

    :global(html[data-theme="nuit"]) .timer-progress::after {
        animation: glow-edge-night 2s ease-in-out infinite;
    }
  
    :global(html[data-theme="nuit"]) .timer-text,
    :global(html[data-theme="nuit"]) .phase-text {
        color: #BFB999;
    }
</style>
