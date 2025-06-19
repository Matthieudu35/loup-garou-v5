<script lang="ts">
    import { rolesConfig, totalPlayers, rolesAssigned, assignRoles } from '../stores/rolesStore';
    import { users, selectedPlayers } from '../stores/usersStore';
    import { gameState } from '../stores/gameState';
    import { timer } from '../stores/timerStore';
    import { subTimers, activeSubTimer, nextSubTimer, calculateSubTimers, skipToNextRoles, startSubTimer } from '../stores/subTimerStore';
    import Timer from './Timer.svelte';
    import PlayersMenu from './PlayersMenu.svelte';
    import Elimination from './Elimination.svelte';
    import { Team, ROLES } from '../stores/teams';
    import { startGame, switchPhase, resetGame } from '../stores/gameLogic';

    let newTime: number = 3600; // Valeur par défaut pour modifier le timer
    let showPlayerSelection = false;
    let showSubTimers = false;
    let isManualUpdate = false;
    let nightInitialized = false;

    // Filtrer les utilisateurs non-admin
    $: availablePlayers = $users.filter(user => !user.isAdmin);

    // Calculer si la sélection est complète
    $: isSelectionComplete = $selectedPlayers.length === $totalPlayers;

    // Initialiser les sous-timers uniquement au début de la nuit
    $: if ($gameState.phase === 'nuit' && $gameState.cycleCount > 0 && !nightInitialized) {
        calculateSubTimers($timer.initialTimer, $gameState.cycleCount);
        nightInitialized = true;
    }

    // Réinitialiser le flag quand on sort de la nuit
    $: if ($gameState.phase !== 'nuit') {
        nightInitialized = false;
    }

    // Fonction pour convertir les secondes en format mm:ss
    function formatTime(seconds: number): string {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

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

    // Calculer le temps restant pour un sous-timer
    function getSubTimerRemainingTime(subTimer: any): number {
        const currentTime = $timer.initialTimer - $timer.timer;
        if (currentTime < subTimer.startTime) {
            return subTimer.duration;
        }
        if (currentTime > subTimer.endTime) {
            return 0;
        }
        return subTimer.endTime - currentTime;
    }

    // Calculer le pourcentage de progression pour un sous-timer
    function getSubTimerProgress(subTimer: any): number {
        const currentTime = $timer.initialTimer - $timer.timer;
        if (currentTime < subTimer.startTime) {
            return 100;
        }
        if (currentTime > subTimer.endTime) {
            return 0;
        }
        return 100 - ((currentTime - subTimer.startTime) / subTimer.duration) * 100;
    }
</script>

<div class="container">
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
                                // TODO: Implement startGame
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
        {#if $gameState.phase === 'nuit' && $gameState.cycleCount > 0}
            <div class="sub-timers-toggle">
                <button 
                    class="btn-toggle" 
                    on:click={() => showSubTimers = !showSubTimers}
                >
                    {showSubTimers ? 'Masquer les sous-timers' : 'Afficher les sous-timers'}
                </button>
            </div>

            {#if showSubTimers}
                <div class="sub-timers-container">
                    {#each $subTimers as subTimer}
                        {#if !['grandMechantLoup', 'loupBlanc', 'infectPereDesLoups'].includes(subTimer.id) || subTimer.id === 'grandMechantLoup'}
                            <div class="sub-timer" class:active={subTimer.isActive}>
                                <div class="sub-timer-content">
                                    <p class="phase-text">
                                        {#if ['grandMechantLoup', 'loupBlanc', 'infectPereDesLoups'].includes(subTimer.id)}
                                            Phase 2 : GML, IPDL, LB
                                        {:else}
                                            {subTimer.label}
                                        {/if}
                                    </p>
                                    <p class="timer-text">
                                        Temps restant : {formatTime(getSubTimerRemainingTime(subTimer))}
                                    </p>
                                    <div class="timer-bar">
                                        <div 
                                            class="timer-progress" 
                                            style="width: {getSubTimerProgress(subTimer)}%"
                                        ></div>
                                    </div>
                                </div>
                                <div class="sub-timer-buttons">
                                    <button 
                                        class="btn-next-role"
                                        on:click={() => skipToNextRoles(subTimer.id)}
                                    >
                                        Passer aux rôles suivants
                                    </button>
                                </div>
                            </div>
                        {/if}
                    {/each}
                </div>
            {/if}
        {/if}

        {#if $gameState.phase === 'jour' || $gameState.phase === 'nuit'}
            <Elimination />
        {/if}

        <section class="time-master-section">
            <h2>Maître du temps</h2>
            <button class="btn-switch" on:click={() => {
                // TODO: Implement switchPhase
            }}>
                {#if $gameState.phase === 'jour'}
                    Passer à la nuit suivante
                {:else}
                    Passer au jour suivant
                {/if}
            </button>
            <div class="timer-controls">
                <label for="newTime">Modifier le timer (en secondes) :</label>
                <div class="input-group">
                    <input id="newTime" type="number" bind:value={newTime} />
                    <button class="btn-update" on:click={() => timer.updateInitial(Number(newTime))}>
                        Mettre à jour le timer
                    </button>
                </div>
            </div>

            <hr />
            <div class="reset-controls">
                <button on:click={() => {
                    // TODO: Implement resetGame
                }} class="btn-reset text-danger">
                    Réinitialiser la partie
                </button>
            </div>
        </section>

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

    .time-master-section {
        border: none;
        padding: 0.8rem;
        margin: 1rem auto;
        max-width: 300px;
        width: 90%;
        border-radius: 8px;
        box-shadow: var(--shadow-sm);
        background-color: var(--bg-color);
        color: var(--text-color);
        transition: all 0.3s ease;
    }

    .time-master-section h2 {
        margin: 0 0 0.8rem 0;
        font-size: 1.1rem;
        text-shadow: none;
        color: var(--text-color);
    }

    .time-master-section button {
        margin: 0.2rem 0;
        padding: 0.5rem 0.8rem;
        font-size: 0.85rem;
        border-radius: 4px;
        box-shadow: var(--shadow-sm);
        transition: all 0.2s ease;
        background-color: var(--primary);
        color: var(--secondary);
    }

    .time-master-section button:hover {
        transform: translateY(-1px);
        box-shadow: var(--shadow-md);
    }

    .timer-controls {
        background-color: var(--bg-color);
        padding: 0.8rem;
        border-radius: 4px;
        margin: 0.8rem 0;
        border: 1px solid var(--border-light);
    }

    .timer-controls label {
        display: block;
        font-size: 0.85rem;
        margin-bottom: 0.4rem;
        color: var(--text-color);
    }

    .input-group {
        display: flex;
        justify-content: center;
        gap: 0.4rem;
    }

    .input-group input {
        width: 80px;
        padding: 0.3rem;
        border: 1px solid var(--primary);
        border-radius: 4px;
        text-align: center;
        font-size: 0.85rem;
        background-color: var(--bg-color);
        color: var(--text-color);
    }

    hr {
        border: none;
        height: 1px;
        background-color: var(--border-light);
        margin: 0.8rem 0;
    }

    .btn-reset {
        background-color: var(--danger) !important;
        color: var(--danger);
    }

    .btn-reset:hover {
        background-color: var(--danger-hover) !important;
        opacity: 1;
    }

    .sub-timers-container {
        margin-top: 1rem;
        padding: 0.8rem;
        background-color: var(--bg-color);
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 
                   inset 0 1px rgba(255, 255, 255, 0.2),
                   0 0 20px rgba(191, 185, 153, 0.3);
        animation: glow-day 3s ease-in-out infinite alternate;
    }

    .sub-timer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
        padding: 0.5rem;
        background-color: rgba(175, 169, 137, 0.4);
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 
                   inset 0 1px rgba(255, 255, 255, 0.2),
                   0 0 20px rgba(191, 185, 153, 0.3);
        animation: glow-day 3s ease-in-out infinite alternate;
    }

    .sub-timer-content {
        flex: 1;
        margin-right: 1rem;
    }

    .sub-timer-buttons {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .btn-next-role {
        width: 160px;
        height: 30px;
        background-color: transparent;
        border: 2px solid var(--primary);
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.8rem;
        color: var(--text-color);
        white-space: nowrap;
        overflow: hidden;
        transition: all 0.3s ease;
        padding: 0 0.5rem;
    }

    .btn-next-role:hover {
        background-color: var(--primary);
        color: var(--secondary);
    }

    .sub-timer .phase-text {
        font-size: 1.1rem;
        margin-bottom: 0.5rem;
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
        background-color: #8E44AD;
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
        background: linear-gradient(90deg, transparent, #8E44AD, #8E44AD);
        filter: blur(3px);
        animation: glow-edge 2s ease-in-out infinite;
        box-shadow: 0 0 10px #8E44AD;
    }

    @keyframes glow-edge {
        0%, 100% {
            opacity: 0.7;
            filter: blur(3px);
            box-shadow: 0 0 10px #8E44AD;
        }
        50% {
            opacity: 1;
            filter: blur(5px);
            box-shadow: 0 0 15px #8E44AD;
        }
    }

    :global(html[data-theme="nuit"]) .sub-timer {
        background-color: rgba(71, 94, 117, 0.4);
        animation: glow-night 3s ease-in-out infinite alternate;
    }

    :global(html[data-theme="nuit"]) .sub-timer .timer-bar {
        background-color: rgba(0, 0, 0, 0.3);
    }

    :global(html[data-theme="nuit"]) .sub-timer .timer-progress {
        background-color: #8E44AD;
    }

    :global(html[data-theme="nuit"]) .sub-timer .timer-progress::after {
        background: linear-gradient(90deg, #8E44AD, #8E44AD, transparent);
        box-shadow: 0 0 10px #8E44AD;
        animation: glow-edge-night 2s ease-in-out infinite;
    }

    @keyframes glow-edge-night {
        0%, 100% {
            opacity: 0.7;
            filter: blur(3px);
            box-shadow: 0 0 10px #8E44AD;
        }
        50% {
            opacity: 1;
            filter: blur(5px);
            box-shadow: 0 0 15px #8E44AD;
        }
    }

    :global(html[data-theme="nuit"]) .sub-timer .phase-text {
        color: #BFB999;
    }

    .sub-timer .timer-text {
        font-size: 1.1rem;
        font-weight: bold;
        color: var(--text-color);
        margin: 0.3rem 0;
    }

    :global(html[data-theme="nuit"]) .sub-timer .timer-text {
        color: #BFB999;
    }

    .sub-timers-toggle {
        text-align: center;
        margin: 1rem 0;
    }

    .btn-toggle {
        padding: 0.5rem 1rem;
        background-color: var(--primary);
        color: var(--secondary);
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
        transition: all 0.2s ease;
    }

    .btn-toggle:hover {
        opacity: 0.9;
        transform: translateY(-1px);
    }

    :global(html[data-theme="nuit"]) .btn-toggle {
        background-color: var(--secondary);
        color: var(--primary);
    }

    :global(html[data-theme="nuit"]) .btn-next-role:hover {
        background-color: var(--secondary);
        color: var(--primary);
    }

    .sub-timer.active {
        border: 2px solid var(--primary);
        box-shadow: 0 0 15px rgba(var(--primary-rgb), 0.3);
    }

    .sub-timer.active .timer-progress {
        background-color: var(--primary);
    }

    .btn-next-role:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
</style>
