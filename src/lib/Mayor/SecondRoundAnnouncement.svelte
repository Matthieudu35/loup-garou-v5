<script lang="ts">
    import { onMount } from 'svelte';
    import { gameState } from '../../stores/gameState';
    import { fade, scale } from 'svelte/transition';

    onMount(() => {
        // Réinitialiser showSecondRoundAnnouncement après 5 secondes
        const timer = setTimeout(() => {
            gameState.update(state => ({
                ...state,
                showSecondRoundAnnouncement: false
            }));
        }, 5000);

        return () => clearTimeout(timer);
    });
</script>

<div class="overlay" transition:fade>
    <div class="content" transition:scale>
        <div class="second-round-banner">
            <div class="mayor-icon">
                <img src="/images/maire.png" alt="Insigne du maire" />
            </div>
            <div class="second-round-content">
                <h2>Second Tour</h2>
                <p>Suite à une égalité, un second tour est nécessaire entre les candidats suivants.</p>
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

    .second-round-banner {
        background: linear-gradient(135deg, rgba(25, 55, 109, 0.95), rgba(44, 62, 80, 0.95));
        border-radius: 1rem;
        padding: 1.5rem;
        display: flex;
        align-items: center;
        gap: 1.5rem;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        border: 1px solid rgba(255, 215, 0, 0.2);
    }

    .mayor-icon {
        width: 60px;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 215, 0, 0.1);
        border-radius: 50%;
        padding: 0.5rem;
    }

    .mayor-icon img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        filter: drop-shadow(0 0 5px rgba(255, 215, 0, 0.3));
    }

    .second-round-content {
        flex: 1;
    }

    .second-round-content h2 {
        color: #FFD700;
        margin: 0 0 0.5rem 0;
        font-size: 1.5rem;
        text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
    }

    .second-round-content p {
        margin: 0;
        font-size: 1rem;
        opacity: 0.9;
        color: #fff;
    }
</style> 