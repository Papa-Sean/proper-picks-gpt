'use client';

import { useState, useCallback, useMemo } from 'react';

export function useBracketSelection(tournamentRounds = {}) {
	// Initialize selections state with empty objects for all rounds 1-6
	const [bracketSelections, setBracketSelections] = useState(() => {
		return {
			1: {},
			2: {},
			3: {},
			4: {},
			5: {},
			6: {},
		};
	});

	// Organize tournament rounds data for easier access
	const gamesByRound = useMemo(() => {
		const result = {
			1: [],
			2: [],
			3: [],
			4: [],
			5: [],
			6: [],
		};

		// If no tournament data, return empty object with structure
		if (!tournamentRounds || Object.keys(tournamentRounds).length === 0) {
			return result;
		}

		// Convert tournament rounds to our format
		Object.entries(tournamentRounds).forEach(([round, games]) => {
			result[round] = [...games];
		});

		return result;
	}, [tournamentRounds]);

	// Handle user selecting a winner for a game
	const handleSelectWinner = useCallback((gameId, round, winner) => {
		setBracketSelections((prev) => {
			// Create a new object to avoid mutation
			const updatedSelections = { ...prev };

			// Set winner for this game
			updatedSelections[round][gameId] = winner;

			return updatedSelections;
		});
	}, []);

	// Get completion percentage for a round
	const getRoundCompletion = useCallback(
		(round) => {
			if (!gamesByRound[round])
				return { percent: 0, completed: 0, total: 0 };

			const gamesInRound = gamesByRound[round];
			const completedGames = Object.keys(
				bracketSelections[round] || {}
			).length;
			const playableGames = gamesInRound.filter(
				(game) => game.teamA && game.teamB
			).length;

			return {
				percent: playableGames
					? Math.round((completedGames / playableGames) * 100)
					: 0,
				completed: completedGames,
				total: playableGames,
			};
		},
		[gamesByRound, bracketSelections]
	);

	// Check if a round is complete
	const isRoundComplete = useCallback(
		(round) => {
			const completion = getRoundCompletion(round);
			return completion.percent === 100;
		},
		[getRoundCompletion]
	);

	// Prepare data for bracket view
	const prepareDataForBracketView = useCallback(() => {
		return gamesByRound;
	}, [gamesByRound]);

	return {
		gamesByRound,
		bracketSelections,
		handleSelectWinner,
		getRoundCompletion,
		isRoundComplete,
		prepareDataForBracketView,
	};
}
