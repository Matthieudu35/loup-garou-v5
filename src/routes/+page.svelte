<script lang="ts">
    import { currentUser, logout, login } from '../stores/authStore';
    import Admin from '../components/Admin.svelte';
    import PlayerInterface from '../lib/Players/Index.svelte';
    import Timer from '../components/Timer.svelte';
    import PlayersMenu from '../components/PlayersMenu.svelte';
    import { gameState } from '../stores/gameState';
    import MayorElection from '../lib/Mayor/MayorElection.svelte';
    import SecondRoundAnnouncement from '../lib/Mayor/SecondRoundAnnouncement.svelte';
    import VoteCountdown from '../components/VoteCountdown.svelte';
    import AlliesMenu from '../lib/AlliesMenu/IndexAllies.svelte';

    let username = '';
    let password = '';
    let isAlliesMenuOpen = false;
    let isLoading = false;
    let errorMessage = '';

    type Theme = 'jour' | 'nuit';

    // Phase actuelle
    $: currentTheme = ($gameState.phase === 'nuit' ? 'nuit' : 'jour') as Theme;
    // Le menu a la couleur INVERSE du thème
    $: menuTheme = (currentTheme === 'nuit' ? 'jour' : 'nuit') as Theme;
    // Le thème des mémos est l'inverse du menu
    $: memoTheme = (menuTheme === 'jour' ? 'nuit' : 'jour') as Theme;

    async function handleLogin() {
        isLoading = true;
        errorMessage = '';
        
        try {
            const success = await login(username, password);
            if (!success) {
                errorMessage = "Identifiants incorrects";
            }
        } catch (error) {
            console.error('Login error:', error);
            errorMessage = "Erreur de connexion";
        } finally {
            isLoading = false;
        }
    }
</script>

{#if $currentUser}
    <main class="min-h-screen bg-color p-4 text-left">
        {#if $gameState.showMayorElection}
            <MayorElection winnerLogin={$gameState.showMayorElection} />
        {/if}

        {#if $gameState.showSecondRoundAnnouncement}
            <SecondRoundAnnouncement />
        {/if}

        {#if $gameState.showVoteCountdown}
            <VoteCountdown />
        {/if}

        <h1 class="text-3xl font-bold">Mon super jeu du Loup-Garou!</h1>
        <div class="flex justify-between items-center mb-6">
            <button class="logout text-white px-4 py-2 rounded" on:click={logout}>
                Se déconnecter
            </button>
        </div>

        {#if $gameState.gameStarted}
            <Timer />
            <div class="flex justify-end gap-4 mb-4">
                <AlliesMenu />
                <PlayersMenu />
            </div>
        {/if}

        {#if $currentUser.isAdmin}
            <Admin />
        {:else}
            <PlayerInterface />
        {/if}
    </main>
{:else}
    <div class="min-h-screen flex items-center justify-center bg-color p-4">
        <div class="bg-color p-6 rounded-lg shadow-md w-full max-w-sm mx-auto">
            <h1 class="text-2xl font-bold mb-6 text-center">Connexion</h1>
            <form class="space-y-4" on:submit|preventDefault={handleLogin}>
                <input 
                    type="text" 
                    bind:value={username} 
                    placeholder="Identifiant (pnom)" 
                    class="w-full p-3 rounded focus:outline-none input-theme text-base"
                    aria-label="Identifiant"
                    disabled={isLoading}
                />
                <input 
                    type="password" 
                    bind:value={password} 
                    placeholder="Mot de passe (date de naissance : jjmmaaaa)" 
                    class="w-full p-3 rounded focus:outline-none input-theme text-base"
                    aria-label="Mot de passe"
                    disabled={isLoading}
                />
                {#if errorMessage}
                    <p class="text-red-500 text-sm">{errorMessage}</p>
                {/if}
                <button 
                    type="submit" 
                    class="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600 text-base disabled:opacity-50"
                    disabled={isLoading}
                >
                    {isLoading ? 'Connexion...' : 'Se connecter'}
                </button>
            </form>
        </div>
    </div>
{/if}

<style>
    main {
        text-align: left ;
        padding: 1rem;
    }

    @media (max-width: 640px) {
        main {
            padding: 0.5rem;
        }

        h1 {
            font-size: 1.5rem;
            margin-bottom: 1rem;
        }
    }

    .input-theme {
        background-color: var(--bg-color);
        color: var(--text-color);
        border: 1px solid var(--primary);
        opacity: 0.9;
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
        backdrop-filter: blur(2px);
        -webkit-backdrop-filter: blur(2px);
    }

    .input-theme::placeholder {
        color: var(--text-color);
        opacity: 0.6;
    }

    .input-theme:focus {
        opacity: 0.85;
        border-color: var(--secondary);
        box-shadow: 0 0 0 2px var(--secondary);
        background-color: var(--bg-color);
        backdrop-filter: blur(3px);
        -webkit-backdrop-filter: blur(3px);
    }

    .input-theme::selection {
        background-color: var(--primary);
        color: var(--secondary);
        opacity: 0.7;
    }

    .input-theme::-moz-selection {
        background-color: var(--primary);
        color: var(--secondary);
        opacity: 0.7;
    }

    .input-theme:-webkit-autofill,
    .input-theme:-webkit-autofill:hover,
    .input-theme:-webkit-autofill:focus {
        -webkit-text-fill-color: var(--text-color);
        -webkit-box-shadow: 0 0 0px 1000px var(--bg-color) inset;
        transition: background-color 5000s ease-in-out 0s;
        opacity: 0.85;
    }

    :global([data-theme="nuit"]) .input-theme {
        border-color: var(--text-color);
        background-color: var(--secondary);
        color: var(--primary);
        opacity: 0.95;
    }

    :global([data-theme="nuit"]) .input-theme::placeholder {
        color: var(--primary);
        opacity: 0.7;
    }

    :global([data-theme="nuit"]) .input-theme:focus {
        border-color: var(--primary);
        box-shadow: 0 0 0 2px var(--primary);
        background-color: var(--secondary);
        opacity: 1;
    }

    :global([data-theme="nuit"]) .input-theme::selection {
        background-color: var(--primary);
        color: var(--secondary);
        opacity: 0.9;
    }

    :global([data-theme="nuit"]) .input-theme::-moz-selection {
        background-color: var(--primary);
        color: var(--secondary);
        opacity: 0.9;
    }

</style>
