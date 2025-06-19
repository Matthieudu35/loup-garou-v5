<script lang="ts">
	import { memos } from '../../stores/memosStore';
	import { gameState } from '../../stores/gameState';
	import { onMount } from 'svelte';
	import { addMemo, deleteMemo } from '../../stores/gameLogic';

	// Thème actuel basé sur la phase du jeu
	$: isNight = $gameState.phase === 'nuit';
	$: currentTheme = isNight ? 'nuit' : 'jour';

	// État pour le nouveau mémo
	let newMemo = '';

	// Fonction pour ajouter un nouveau mémo
	function handleAddMemo(memo: string) {
		if (memo.trim()) {
			addMemo(memo.trim());
			newMemo = '';
		}
	}

	// Fonction pour supprimer un mémo
	function handleDeleteMemo(index: number) {
		deleteMemo(index);
	}

	// Gestionnaire d'événement pour la touche Entrée
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			handleAddMemo(newMemo);
		}
	}
</script>

<div class="memo-section" data-theme={currentTheme}>
	<h3>Mémos</h3>
	
	<div class="memo-input-container">
		<textarea
			class="memo-textarea"
			placeholder="Écrire un mémo..."
			rows="2"
			bind:value={newMemo}
			on:keydown={handleKeydown}
		></textarea>
		<button class="add-memo-btn" on:click={() => handleAddMemo(newMemo)}>
			Ajouter
		</button>
		<p class="memo-hint">↵ pour sauvegarder</p>
	</div>
	
	<div class="memos-list">
		{#if $memos.length === 0}
			<p class="no-memos">Aucun mémo pour le moment</p>
		{:else}
			{#each $memos as memo, index}
				<div class="memo-item">
					<p class="memo-text">{memo}</p>
					<button class="delete-memo-btn" on:click={() => handleDeleteMemo(index)}>×</button>
				</div>
			{/each}
		{/if}
	</div>
</div>

<style>
	.memo-section {
		padding: var(--spacing-md);
		border-radius: var(--border-radius-md);
		margin-bottom: var(--spacing-lg);
		animation: fade-in 0.3s ease;
	}

	.memo-section[data-theme='jour'] {
		background-color: var(--beige);
		color: var(--bleu);
	}

	.memo-section[data-theme='nuit'] {
		background-color: var(--bleu);
		color: var(--beige);
	}

	.memo-section h3 {
		margin-top: 0;
		margin-bottom: var(--spacing-md);
		font-size: 1.2rem;
	}

	.memo-input-container {
		margin-bottom: var(--spacing-md);
	}

	.memo-textarea {
		width: 100%;
		padding: var(--spacing-sm);
		border-radius: var(--border-radius-sm);
		border: 1px solid currentColor;
		font-family: inherit;
		resize: none;
		font-size: 0.9rem;
		line-height: 1.4;
		background-color: transparent;
		height: 60px;
		margin-bottom: var(--spacing-xs);
	}

	.add-memo-btn {
		padding: var(--spacing-xs) var(--spacing-sm);
		border-radius: var(--border-radius-sm);
		border: 1px solid currentColor;
		background-color: transparent;
		color: inherit;
		font-size: 0.8rem;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.add-memo-btn:hover {
		background-color: rgba(0, 0, 0, 0.1);
	}

	.memo-hint {
		font-size: 0.75rem;
		margin: var(--spacing-xs) 0 0 0;
		text-align: right;
		font-style: italic;
		opacity: 0.8;
	}

	.memos-list {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);
		max-height: 300px;
		overflow-y: auto;
		padding-right: var(--spacing-xs);
	}

	.memo-item {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		padding: var(--spacing-sm);
		border-radius: var(--border-radius-sm);
		background-color: rgba(0, 0, 0, 0.1);
		border: 1px solid rgba(0, 0, 0, 0.2);
	}

	.memo-text {
		margin: 0;
		flex: 1;
		word-break: break-word;
	}

	.delete-memo-btn {
		background: none;
		border: none;
		color: inherit;
		font-size: 1.2rem;
		cursor: pointer;
		padding: 0 var(--spacing-xs);
		opacity: 0.7;
		transition: opacity 0.2s ease;
	}

	.delete-memo-btn:hover {
		opacity: 1;
	}

	.no-memos {
		text-align: center;
		font-style: italic;
		opacity: 0.7;
		padding: var(--spacing-md);
	}

	@keyframes fade-in {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (max-width: 480px) {
		.memo-section {
			padding: var(--spacing-sm);
		}

		.memo-textarea {
			height: 50px;
		}

		.memos-list {
			max-height: 250px;
		}
	}
</style>
