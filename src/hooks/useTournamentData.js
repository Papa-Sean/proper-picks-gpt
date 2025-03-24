'use client';

import { useState, useEffect } from 'react';
import dummyTeams from '@/dummyTeams';

/**
 * Hook to fetch tournament data
 * @param {string} userId - The user ID to check for existing brackets
 * @returns {Object} - Tournament data and loading state
 */
export function useTournamentData(userId) {
	const [tournament, setTournament] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [isDeadlinePassed, setIsDeadlinePassed] = useState(false);

	useEffect(() => {
		async function fetchTournament() {
			try {
				setLoading(true);

				// In a real app, you would fetch this from your API or database
				// This is mock data for the example
				const mockTournament = {
					id: 'ncaa-2025',
					name: 'Proper March Madness 2025',
					submissionDeadline: new Date(2025, 2, 22, 12).toISOString(),
					teams: dummyTeams,
					rounds: generateAllRoundsGames(dummyTeams),
					roundNames: [
						'First Round',
						'Second Round',
						'Sweet 16',
						'Elite Eight',
						'Final Four',
						'Championship',
					],
				};

				setTournament(mockTournament);

				// Check if deadline has passed
				setIsDeadlinePassed(
					new Date() > new Date(mockTournament.submissionDeadline)
				);

				console.log(
					'Generated tournament rounds:',
					mockTournament.rounds
				);

				setLoading(false);
			} catch (err) {
				console.error('Error fetching tournament data:', err);
				setError(
					'Failed to load tournament data: ' +
						(err.message || 'Unknown error')
				);
				setLoading(false);
			}
		}

		fetchTournament();
	}, [userId]);

	// Log tournament data after it is received
	useEffect(() => {
		if (tournament && !loading) {
			console.log('Tournament received in BracketBuilder:', tournament);
			console.log('Rounds:', Object.keys(tournament.rounds || {}).length);
		}
	}, [tournament, loading]);

	// Helper function to generate bracket rounds
	function generateAllRoundsGames(teams) {
		// Initialize rounds with all possible rounds (even if empty)
		const rounds = {
			1: [],
			2: [],
			3: [],
			4: [],
			5: [],
			6: [],
		};

		// First round - 32 games (64 teams)
		rounds[1] = [];

		// Create matchups based on seeding
		const regions = ['East', 'West', 'South', 'Midwest'];
		const seedMatchups = [
			[1, 16],
			[8, 9],
			[5, 12],
			[4, 13],
			[6, 11],
			[3, 14],
			[7, 10],
			[2, 15],
		];

		let gameId = 1;

		// Generate first round matchups
		regions.forEach((region) => {
			seedMatchups.forEach(([seedA, seedB]) => {
				const teamA = teams.find(
					(t) => t.region === region && t.seed === seedA
				);
				const teamB = teams.find(
					(t) => t.region === region && t.seed === seedB
				);

				if (teamA && teamB) {
					rounds[1].push({
						gameId,
						teamA: teamA.team,
						teamB: teamB.team,
						userSelectedWinner: '',
						region,
						round: 1,
					});
					gameId++;
				}
			});
		});

		// Initialize empty subsequent rounds (2-6)
		for (let round = 2; round <= 6; round++) {
			rounds[round] = [];

			// Calculate number of games in this round
			const numGames = Math.pow(2, 6 - round);

			for (let i = 0; i < numGames; i++) {
				rounds[round].push({
					gameId: gameId++,
					teamA: '',
					teamB: '',
					userSelectedWinner: '',
					round,
					region:
						round <= 4
							? regions[Math.floor(i / (numGames / 4))]
							: undefined,
				});
			}
		}

		return rounds; // Now it always has keys 1-6 even if some are empty
	}

	return { tournament, loading, error, isDeadlinePassed };
}
