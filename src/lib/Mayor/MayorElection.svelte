<script lang="ts">
    import { onMount } from 'svelte';
    import { gameState } from '../../stores/gameState';
    import { users } from '../../stores/usersStore';
    import { getUserByLogin } from '../../stores/gameLogic';
    import { fade, scale } from 'svelte/transition';
    import type { User } from '../../stores/types';

    export let winnerLogin: string;
    
    let winner = getUserByLogin(winnerLogin);

    onMount(() => {
        // Réinitialiser showMayorElection après 5 secondes
        const timer = setTimeout(() => {
            gameState.update(state => ({
                ...state,
                showMayorElection: null
            }));
        }, 5000);

        return () => clearTimeout(timer);
    });
</script>

<div class="overlay" transition:fade>
    <div class="content" transition:scale>
        <img src="/images/maire.png" alt="Insigne du maire" class="mayor-badge" />
        <h2> Bienvenue à notre Maire {winner?.firstName} {winner?.lastName || ''} ! </h2>
        <p>Que son mandat soit sage et juste !</p>
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
        background-color: #2C3E50;
        color: #BFB999;
        padding: 2rem;
        border-radius: 1rem;
        text-align: center;
        max-width: 90%;
        width: 500px;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
    }

    .mayor-badge {
        width: 150px;
        height: 150px;
        margin-bottom: 1rem;
        animation: shine 2s infinite;
    }

    h2 {
        font-size: 1.5rem;
        margin: 1rem 0;
    }

    p {
        font-style: italic;
        opacity: 0.8;
    }

    @keyframes shine {
        0% {
            transform: scale(1) rotate(0deg);
            filter: brightness(1);
        }
        50% {
            transform: scale(1.1) rotate(5deg);
            filter: brightness(1.2);
        }
        100% {
            transform: scale(1) rotate(0deg);
            filter: brightness(1);
        }
    }
</style> 