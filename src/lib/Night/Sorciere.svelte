<script lang="ts">
    import { users, selectedPlayers } from '../../stores/usersStore';
    import { eliminationStore } from '../../stores/eliminationStore';
    import { subTimers } from '../../stores/subTimerStore';
    import { alivePlayers } from '../../stores/chosen';
    import { timer } from '../../stores/timerStore';
    import type { User } from '../../stores/types';
    import { gameState } from '../../stores/gameState';
    import { writable } from 'svelte/store';
    import { loupVictim, setLoupVictim } from '../../stores/chosen';
    import { browser } from '$app/environment';

    export let currentUser: User;

    // Store pour suivre les actions de la sorcière
    const hasSaved = writable(false);
    const hasKilled = writable(false);
    let selectedPlayer: User | null = null;
    let showSaveConfirmation = false;
    let showKillMenu = false;

    // Store pour suivre qui a sauvé le joueur
    const savedBy = writable<string | null>(null);

    // Vérifier si l'utilisateur est la sorcière
    $: isSorciere = currentUser?.role?.toLowerCase() === 'sorcière' || 
                    currentUser?.role?.toLowerCase() === 'sorciere';

    // Vérifier si les potions ont déjà été utilisées
    let hasUsedLifePotion = false;
    let hasUsedDeathPotion = false;

    if (browser) {
        const savedPotions = localStorage.getItem(`sorciere_potions_${currentUser.login}`);
        if (savedPotions) {
            const { life, death } = JSON.parse(savedPotions);
            hasUsedLifePotion = life;
            hasUsedDeathPotion = death;
        }
    }

    // Liste des joueurs vivants (non éliminés), participants, sauf soi-même et les admins
    $: availableTargets = $alivePlayers.filter(u => {
        const isParticipant = $selectedPlayers.includes(u.login);
        return isParticipant && 
               !u.isAdmin && 
               u.login !== currentUser?.login && 
               !$eliminationStore.some(e => e.playerLogin === u.login);
    });

    // Trouver spécifiquement le sous-timer de la sorcière
    $: sorciereTimer = $subTimers.find(t => t.id === 'sorciere');
    $: currentTime = $timer.initialTimer - $timer.timer;
    $: isSorciereTimerActive = !!(
        sorciereTimer &&
        currentTime >= (sorciereTimer.startTime ?? 0) &&
        currentTime < (sorciereTimer.endTime ?? 0) &&
        $timer.timer > 0
    );
    $: isSorciereTimerFinished = !!(
        sorciereTimer &&
        currentTime >= (sorciereTimer?.endTime ?? 0) &&
        $timer.timer > 0
    );

    // Obtenir les informations du joueur choisi
    $: chosenPlayer = $loupVictim ? $users.find(u => u.login === $loupVictim) : null;

    // Fonctions pour le timer
    function formatTime(seconds: number): string {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    function getSorciereSubTimerRemainingTime(): number {
        if (!sorciereTimer) return 0;
        const currentTime = $timer.initialTimer - $timer.timer;
        if (currentTime < sorciereTimer.startTime) {
            return sorciereTimer.duration;
        }
        if (currentTime > sorciereTimer.endTime) {
            return 0;
        }
        return sorciereTimer.endTime - currentTime;
    }
    function getSorciereSubTimerProgress(): number {
        if (!sorciereTimer) return 0;
        const currentTime = $timer.initialTimer - $timer.timer;
        if (currentTime < sorciereTimer.startTime) {
            return 100;
        }
        if (currentTime > sorciereTimer.endTime) {
            return 0;
        }
        return 100 - ((currentTime - sorciereTimer.startTime) / sorciereTimer.duration) * 100;
    }

    function handlePlayerClick(player: User) {
        if (!selectedPlayer) {
            selectedPlayer = player;
        }
    }

    function handleSave() {
        if (chosenPlayer && !hasUsedLifePotion) {
            setLoupVictim(null); // Enlever la victime des loups
            hasSaved.set(true);
            showSaveConfirmation = true;
            savedBy.set(currentUser.login); // Enregistrer qui a sauvé le joueur
            // Marquer la potion de vie comme utilisée
            hasUsedLifePotion = true;
            if (browser) {
                localStorage.setItem(`sorciere_potions_${currentUser.login}`, 
                    JSON.stringify({ life: true, death: hasUsedDeathPotion })
                );
            }
        }
    }

    function handleKill() {
        if (!hasUsedDeathPotion) {
            showKillMenu = true;
        }
    }

    function confirmKill() {
        if (selectedPlayer && !hasUsedDeathPotion) {
            eliminationStore.eliminate(selectedPlayer.login, 'sorcière', 'pouvoir', 'Potion de mort');
            hasKilled.set(true);
            showKillMenu = false;
            selectedPlayer = null;
            // Marquer la potion de mort comme utilisée
            hasUsedDeathPotion = true;
            if (browser) {
                localStorage.setItem(`sorciere_potions_${currentUser.login}`, 
                    JSON.stringify({ life: hasUsedLifePotion, death: true })
                );
            }
        }
    }

    function cancelKill() {
        selectedPlayer = null;
        showKillMenu = false;
    }
</script>

{#if isSorciereTimerActive && isSorciere}
    <div class="sorciere-section">
        {#if chosenPlayer && !showSaveConfirmation && !showKillMenu}
            <div class="chosen-player">
                {#if chosenPlayer.photoUrl}
                    <img 
                        src={chosenPlayer.photoUrl} 
                        alt={`Photo de ${chosenPlayer.firstName}`}
                        class="player-photo"
                    />
                {:else}
                    <div class="photo-placeholder"></div>
                {/if}
                <p class="player-name">{chosenPlayer.firstName} {chosenPlayer.lastName}</p>
                {#if $savedBy}
                    <p class="message">Une autre sorcière a déjà sauvé cette personne</p>
                {:else}
                    <p class="message">Cette personne a été tuée, veux-tu la sauver ou tuer quelqu'un d'autre ?</p>
                    
                    <div class="potion-buttons">
                        <button 
                            class="potion-button save" 
                            on:click={handleSave}
                            disabled={hasUsedLifePotion}
                            title={hasUsedLifePotion ? "Tu as déjà utilisé ta potion de vie" : "Sauver avec la potion de vie"}
                        >
                            <img src="/images/potionvie.png" alt="Potion de vie" class="potion-image" />
                            <span>Sauver</span>
                            {#if hasUsedLifePotion}
                                <span class="potion-used">Utilisée</span>
                            {/if}
                        </button>
                        <button 
                            class="potion-button kill" 
                            on:click={handleKill}
                            disabled={hasUsedDeathPotion}
                            title={hasUsedDeathPotion ? "Tu as déjà utilisé ta potion de mort" : "Tuer avec la potion de mort"}
                        >
                            <img src="/images/potionmort.png" alt="Potion de mort" class="potion-image" />
                            <span>Tuer</span>
                            {#if hasUsedDeathPotion}
                                <span class="potion-used">Utilisée</span>
                            {/if}
                        </button>
                    </div>
                {/if}
            </div>
        {:else if showSaveConfirmation && chosenPlayer}
            <div class="confirmation-message">
                <p class="save-message">Tu as sauvé {chosenPlayer.firstName} {chosenPlayer.lastName}</p>
            </div>
        {:else if showKillMenu}
            <div class="kill-menu">
                <h2>Choisir une victime</h2>
                <p>Qui voulez-vous tuer avec votre potion de mort ?</p>

                <div class="players-grid">
                    {#each availableTargets as player}
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
                                on:click={cancelKill}
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
                            
                            <p>Voulez-vous vraiment tuer {selectedPlayer.firstName} {selectedPlayer.lastName} ?</p>
                            
                            <div class="confirmation-buttons">
                                <button class="kill-button" on:click={confirmKill}>
                                    Confirmer
                                </button>
                            </div>
                        </div>
                    </div>
                {/if}
            </div>
        {/if}
    </div>
{:else}
    <div class="waiting-message">
        <h2>Phase de la Sorcière</h2>
        {#if isSorciereTimerFinished}
            <p>La phase de la sorcière est terminée</p>
        {:else}
            <p>Attendez que le timer de la sorcière soit activé...</p>
        {/if}
    </div>
{/if}

<style>
    .sorciere-section {
        margin: 1rem;
        text-align: center;
    }
    .greeting {
        font-size: 2rem;
        color: var(--primary);
        margin: 2rem 0;
    }
    .waiting-message {
        text-align: center;
        margin: 2rem;
        padding: 1rem;
        background-color: rgba(128, 0, 128, 0.1);
        border-radius: 8px;
        border: 1px dashed rgba(128, 0, 128, 0.3);
    }
    .waiting-message h2 {
        color: var(--primary);
        margin-bottom: 1rem;
    }
    .waiting-message p {
        font-size: 1.1rem;
        color: var(--text-color);
    }
    .chosen-player {
        margin-top: 2rem;
        padding: 2rem;
        background: rgba(128, 0, 128, 0.1);
        border-radius: 1rem;
        box-shadow: 0 0 20px rgba(128, 0, 128, 0.2);
    }
    .player-photo {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        object-fit: cover;
        border: 3px solid var(--primary);
        margin-bottom: 1rem;
        box-shadow: 0 0 15px rgba(128, 0, 128, 0.3);
    }
    .photo-placeholder {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        background-color: var(--primary-light);
        margin: 0 auto 1rem;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 1.5rem;
        border: 3px solid var(--primary);
        box-shadow: 0 0 15px rgba(128, 0, 128, 0.3);
    }
    .player-name {
        font-size: 1.5rem;
        color: var(--text-color);
        margin: 0 0 1rem 0;
        font-weight: bold;
    }
    .message {
        font-size: 1.2rem;
        color: var(--text-color);
        margin: 1.5rem 0;
        line-height: 1.5;
        padding: 1rem;
        background: rgba(128, 0, 128, 0.1);
        border-radius: 0.5rem;
    }
    .potion-buttons {
        display: flex;
        gap: 2rem;
        justify-content: center;
        margin-top: 2rem;
    }
    .potion-button {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        padding: 1rem;
        border: none;
        border-radius: 1rem;
        cursor: pointer;
        transition: all 0.3s ease;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(5px);
    }
    .potion-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
    }
    .potion-button:disabled:hover {
        transform: none;
        box-shadow: none;
    }
    .potion-button:hover {
        transform: translateY(-5px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    }
    .potion-button.save:hover {
        background: rgba(0, 255, 0, 0.1);
    }
    .potion-button.kill:hover {
        background: rgba(255, 0, 0, 0.1);
    }
    .potion-image {
        width: 80px;
        height: 80px;
        object-fit: contain;
    }
    .potion-button span {
        font-size: 1.1rem;
        font-weight: bold;
        color: var(--text-color);
    }
    .potion-used {
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        background: rgba(255, 0, 0, 0.8);
        color: white;
        padding: 0.2rem 0.5rem;
        border-radius: 0.3rem;
        font-size: 0.8rem;
        font-weight: bold;
    }
    .confirmation-message {
        margin-top: 2rem;
        padding: 2rem;
        background: rgba(0, 255, 0, 0.1);
        border-radius: 1rem;
        box-shadow: 0 0 20px rgba(0, 255, 0, 0.2);
        animation: fadeIn 0.5s ease-out;
    }
    .save-message {
        font-size: 1.5rem;
        color: var(--text-color);
        font-weight: bold;
    }
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    .kill-menu {
        margin-top: 2rem;
        padding: 2rem;
        background: rgba(128, 0, 128, 0.1);
        border-radius: 1rem;
        box-shadow: 0 0 20px rgba(128, 0, 128, 0.2);
    }
    .kill-menu h2 {
        color: var(--primary);
        margin-bottom: 1rem;
        text-align: center;
    }
    .players-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 0.8rem;
        margin-top: 1rem;
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
    .kill-button {
        background-color: var(--danger);
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 0.5rem;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    .kill-button:hover {
        background-color: var(--danger-dark);
        transform: translateY(-2px);
    }
</style> 