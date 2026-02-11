import { writable } from 'svelte/store';

export interface RollResult {
	id: string;
	timestamp: number;
	diceType: 'd6' | 'd20';
	result: number;
}

function createDiceStore() {
	const { subscribe, update } = writable<{
		history: RollResult[];
		stats: Record<string, { rolls: number; sum: number; min: number; max: number }>;
	}>({
		history: [],
		stats: {
			d6: { rolls: 0, sum: 0, min: Infinity, max: -Infinity },
			d20: { rolls: 0, sum: 0, min: Infinity, max: -Infinity }
		}
	});

	return {
		subscribe,
		addRoll: (diceType: 'd6' | 'd20', result: number) => {
			const roll: RollResult = {
				id: crypto.randomUUID(),
				timestamp: Date.now(),
				diceType,
				result
			};

			update((state) => {
				const newHistory = [roll, ...state.history].slice(0, 100); // Keep last 100

				const stats = { ...state.stats };
				const currentStats = stats[diceType];

				stats[diceType] = {
					rolls: currentStats.rolls + 1,
					sum: currentStats.sum + result,
					min: Math.min(currentStats.min, result),
					max: Math.max(currentStats.max, result)
				};

				return { history: newHistory, stats };
			});
		},
		clearHistory: () => {
			update(() => ({
				history: [],
				stats: {
					d6: { rolls: 0, sum: 0, min: Infinity, max: -Infinity },
					d20: { rolls: 0, sum: 0, min: Infinity, max: -Infinity }
				}
			}));
		}
	};
}

export const diceStore = createDiceStore();
