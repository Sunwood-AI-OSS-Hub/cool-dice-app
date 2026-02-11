<script lang="ts">
	import Dice3D from '$lib/components/Dice3D.svelte';
	import { diceStore } from '$lib/stores/dice';

	let diceType: 'd6' | 'd20' = 'd6';
	let rolling = false;
	let lastResult = 0;
	let diceComponent: Dice3D;

	function handleRoll(result: number) {
		rolling = false;
		lastResult = result;
		diceStore.addRoll(diceType, result);
	}

	function rollDice() {
		if (rolling) return;
		rolling = true;
		diceComponent?.rollDice?.();
	}

	function switchDiceType() {
		diceType = diceType === 'd6' ? 'd20' : 'd6';
		lastResult = 0;
	}
</script>

<svelte:head>
	<title>Cool Dice App - 3D Dice Roller</title>
	<meta name="description" content="A cool and rich 3D dice roller application" />
</svelte:head>

<div class="app">
	<header class="header">
		<h1 class="title">
			<span class="title-icon">🎲</span>
			Cool Dice App
		</h1>
		<p class="subtitle">3D Dice Roller with Rich Animations</p>
	</header>

	<main class="main">
		<div class="dice-section">
			<div class="dice-display">
				{#if lastResult > 0}
					<div class="result-display">
						<span class="result-number">{lastResult}</span>
						<span class="result-label">Result</span>
					</div>
				{/if}
			</div>

			<div class="dice-canvas-wrapper">
				<Dice3D
					bind:this={diceComponent}
					diceType={diceType}
					bind:rolling
					onRollComplete={handleRoll}
				/>
			</div>

			<div class="controls">
				<button
					class="btn btn-secondary"
					onclick={switchDiceType}
					disabled={rolling}
				>
					Switch to {diceType === 'd6' ? 'D20' : 'D6'}
				</button>

				<button class="btn btn-primary" onclick={rollDice} disabled={rolling}>
					{#if rolling}
						<span class="spinner"></span>
						Rolling...
					{:else}
						<span class="dice-icon">🎲</span>
						Roll Dice
					{/if}
				</button>
			</div>
		</div>

		<div class="stats-section">
			<h2 class="section-title">Statistics</h2>
			<div class="stats-grid">
				{#each $diceStore.stats as _, type (type)}
					{@const stats = $diceStore.stats[type]}
					<div class="stat-card">
						<div class="stat-header">
							<span class="stat-type">{type.toUpperCase()}</span>
							<span class="stat-rolls">{stats.rolls} rolls</span>
						</div>
						<div class="stat-values">
							{#if stats.rolls > 0}
								<div class="stat-value">
									<span class="stat-label">Average</span>
									<span class="stat-number">{(stats.sum / stats.rolls).toFixed(1)}</span>
								</div>
								<div class="stat-value">
									<span class="stat-label">Min</span>
									<span class="stat-number">{stats.min}</span>
								</div>
								<div class="stat-value">
									<span class="stat-label">Max</span>
									<span class="stat-number">{stats.max}</span>
								</div>
							{:else}
								<span class="no-data">No rolls yet</span>
							{/if}
						</div>
					</div>
				{/each}
			</div>

			<div class="history-section">
				<div class="history-header">
					<h3>Recent Rolls</h3>
					<button
						class="btn-clear"
						onclick={() => diceStore.clearHistory()}
						disabled={$diceStore.history.length === 0}
					>
						Clear
					</button>
				</div>

				<div class="history-list">
					{#if $diceStore.history.length > 0}
						{#each $diceStore.history.slice(0, 10) as roll (roll.id)}
							<div class="history-item">
								<span class="history-dice">{roll.diceType.toUpperCase()}</span>
								<span class="history-result">{roll.result}</span>
								<span class="history-time">
									{new Date(roll.timestamp).toLocaleTimeString()}
								</span>
							</div>
						{/each}
					{:else}
						<p class="no-history">No roll history yet</p>
					{/if}
				</div>
			</div>
		</div>
	</main>

	<footer class="footer">
		<p>Generated with ❤️ by Claude Code & Happy</p>
	</footer>
</div>

<style>
	:global(html, body) {
		margin: 0;
		padding: 0;
		background: linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 50%, #16213e 100%);
		min-height: 100vh;
		font-family: 'Segoe UI', system-ui, sans-serif;
		color: #ffffff;
	}

	.app {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.header {
		text-align: center;
		padding: 2rem 1rem;
		background: rgba(15, 52, 96, 0.5);
		backdrop-filter: blur(10px);
		border-bottom: 1px solid rgba(233, 69, 96, 0.3);
	}

	.title {
		font-size: 2.5rem;
		font-weight: 700;
		margin: 0;
		background: linear-gradient(135deg, #e94560 0%, #ff6b6b 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
	}

	.title-icon {
		font-size: 2rem;
		filter: drop-shadow(0 0 10px rgba(233, 69, 96, 0.5));
	}

	.subtitle {
		margin: 0.5rem 0 0;
		color: #a0a0a0;
		font-size: 1rem;
	}

	.main {
		flex: 1;
		display: grid;
		grid-template-columns: 1fr 350px;
		gap: 2rem;
		padding: 2rem;
		max-width: 1400px;
		margin: 0 auto;
		width: 100%;
	}

	.dice-section {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.dice-display {
		display: flex;
		justify-content: center;
		min-height: 80px;
	}

	.result-display {
		display: flex;
		flex-direction: column;
		align-items: center;
		animation: popIn 0.3s ease-out;
	}

	@keyframes popIn {
		0% {
			transform: scale(0);
			opacity: 0;
		}
		50% {
			transform: scale(1.2);
		}
		100% {
			transform: scale(1);
			opacity: 1;
		}
	}

	.result-number {
		font-size: 4rem;
		font-weight: 800;
		background: linear-gradient(135deg, #e94560 0%, #ff6b6b 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		text-shadow: 0 0 30px rgba(233, 69, 96, 0.5);
	}

	.result-label {
		font-size: 0.875rem;
		color: #a0a0a0;
		text-transform: uppercase;
		letter-spacing: 2px;
	}

	.dice-canvas-wrapper {
		background: rgba(15, 52, 96, 0.3);
		border-radius: 20px;
		padding: 2rem;
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 450px;
		border: 1px solid rgba(233, 69, 96, 0.2);
		box-shadow:
			0 0 40px rgba(233, 69, 96, 0.1),
			inset 0 0 40px rgba(233, 69, 96, 0.05);
	}

	.controls {
		display: flex;
		gap: 1rem;
		justify-content: center;
	}

	.btn {
		padding: 1rem 2rem;
		font-size: 1.1rem;
		font-weight: 600;
		border: none;
		border-radius: 12px;
		cursor: pointer;
		transition: all 0.3s ease;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-primary {
		background: linear-gradient(135deg, #e94560 0%, #ff6b6b 100%);
		color: white;
		box-shadow: 0 4px 15px rgba(233, 69, 96, 0.4);
	}

	.btn-primary:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(2333, 69, 96, 0.6);
	}

	.btn-secondary {
		background: rgba(22, 33, 62, 0.8);
		color: white;
		border: 1px solid rgba(233, 69, 96, 0.3);
	}

	.btn-secondary:hover:not(:disabled) {
		background: rgba(233, 69, 96, 0.2);
		border-color: rgba(233, 69, 96, 0.5);
	}

	.dice-icon {
		font-size: 1.3rem;
		animation: shake 0.5s infinite;
	}

	@keyframes shake {
		0%,
		100% {
			transform: rotate(0deg);
		}
		25% {
			transform: rotate(-10deg);
		}
		75% {
			transform: rotate(10deg);
		}
	}

	.spinner {
		width: 20px;
		height: 20px;
		border: 3px solid rgba(255, 255, 255, 0.3);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.stats-section {
		background: rgba(15, 52, 96, 0.3);
		border-radius: 16px;
		padding: 1.5rem;
		border: 1px solid rgba(233, 69, 96, 0.2);
		height: fit-content;
	}

	.section-title {
		font-size: 1.5rem;
		margin: 0 0 1rem;
		color: #e94560;
	}

	.stats-grid {
		display: grid;
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.stat-card {
		background: rgba(22, 33, 62, 0.5);
		border-radius: 12px;
		padding: 1rem;
		border: 1px solid rgba(233, 69, 96, 0.15);
	}

	.stat-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.stat-type {
		font-weight: 700;
		color: #e94560;
	}

	.stat-rolls {
		font-size: 0.875rem;
		color: #a0a0a0;
	}

	.stat-values {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.75rem;
	}

	.stat-value {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.stat-label {
		font-size: 0.75rem;
		color: #a0a0a0;
		margin-bottom: 0.25rem;
	}

	.stat-number {
		font-size: 1.25rem;
		font-weight: 700;
	}

	.no-data {
		grid-column: 1 / -1;
		text-align: center;
		color: #a0a0a0;
		font-size: 0.875rem;
	}

	.history-section {
		border-top: 1px solid rgba(233, 69, 96, 0.2);
		padding-top: 1.5rem;
	}

	.history-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.history-header h3 {
		margin: 0;
		font-size: 1.1rem;
		color: #ffffff;
	}

	.btn-clear {
		padding: 0.5rem 1rem;
		font-size: 0.875rem;
		background: transparent;
		color: #e94560;
		border: 1px solid rgba(233, 69, 96, 0.3);
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.btn-clear:hover:not(:disabled) {
		background: rgba(233, 69, 96, 0.2);
	}

	.btn-clear:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.history-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		max-height: 300px;
		overflow-y: auto;
	}

	.history-list::-webkit-scrollbar {
		width: 6px;
	}

	.history-list::-webkit-scrollbar-track {
		background: rgba(15, 52, 96, 0.3);
		border-radius: 3px;
	}

	.history-list::-webkit-scrollbar-thumb {
		background: rgba(233, 69, 96, 0.5);
		border-radius: 3px;
	}

	.history-item {
		display: grid;
		grid-template-columns: 50px 60px 1fr;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem;
		background: rgba(22, 33, 62, 0.3);
		border-radius: 8px;
		font-size: 0.875rem;
	}

	.history-dice {
		font-weight: 700;
		color: #e94560;
	}

	.history-result {
		font-size: 1.25rem;
		font-weight: 700;
	}

	.history-time {
		color: #a0a0a0;
		font-size: 0.75rem;
		text-align: right;
	}

	.no-history {
		text-align: center;
		color: #a0a0a0;
		padding: 1rem;
	}

	.footer {
		text-align: center;
		padding: 1.5rem;
		color: #a0a0a0;
		font-size: 0.875rem;
		border-top: 1px solid rgba(233, 69, 96, 0.2);
	}

	@media (max-width: 900px) {
		.main {
			grid-template-columns: 1fr;
		}

		.title {
			font-size: 2rem;
		}

		.dice-canvas-wrapper {
			min-height: 350px;
		}
	}

	@media (max-width: 600px) {
		.controls {
			flex-direction: column;
		}

		.btn {
			width: 100%;
			justify-content: center;
		}
	}
</style>
