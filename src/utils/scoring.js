/**
 * Scoring utility functions for NCAA Tournament brackets
 */

// Points awarded per round
const POINTS_PER_ROUND = [1, 2, 4, 8, 16, 32];

/**
 * Calculates the score for a single bracket based on actual results
 *
 * @param {Object} bracket - The bracket data to score
 * @param {Object} actualResults - The actual tournament results
 * @returns {Object} Scoring data including points, correctPicks, and roundScores
 */
export function calculateBracketScore(bracket, actualResults) {
	// Initialize scoring data
	let totalPoints = 0;
	let correctPicks = 0;
	let roundScores = [0, 0, 0, 0, 0, 0]; // One element per round

	// Exit early if bracket or results aren't available
	if (!bracket?.selections || !actualResults) {
		return { points: 0, correctPicks: 0, roundScores, totalPicks: 0 };
	}

	// Get total picks made (for percentage calculation)
	let totalPicks = 0;

	// Calculate scores for each round
	for (let round = 1; round <= 6; round++) {
		const roundSelections = bracket.selections[round] || {};
		const roundResults = actualResults[round] || {};
		let roundPoints = 0;
		let roundCorrect = 0;

		// Calculate points for this round's picks
		Object.entries(roundSelections).forEach(([gameId, pickedWinner]) => {
			totalPicks++;

			// Check if the game has an actual result
			const actualWinner = roundResults[gameId];
			if (actualWinner && pickedWinner === actualWinner) {
				// Correct pick
				const pointsForThisGame = POINTS_PER_ROUND[round - 1];
				roundPoints += pointsForThisGame;
				roundCorrect++;
				correctPicks++;
			}
		});

		// Update round score
		roundScores[round - 1] = roundPoints;
		totalPoints += roundPoints;
	}

	return {
		points: totalPoints,
		correctPicks,
		roundScores,
		totalPicks,
	};
}

/**
 * Calculates the maximum possible remaining points for a bracket
 *
 * @param {Object} bracket - The bracket to evaluate
 * @param {Object} actualResults - The actual tournament results so far
 * @param {number} currentRound - The current tournament round (1-6)
 * @returns {number} Maximum possible points remaining
 */
export function calculateMaxPossiblePoints(
	bracket,
	actualResults,
	currentRound = 1
) {
	let maxPossible = 0;

	// Add points already earned
	const scoreData = calculateBracketScore(bracket, actualResults);
	maxPossible += scoreData.points;

	// If bracket or selections are missing, return current points
	if (!bracket?.selections) {
		return maxPossible;
	}

	// Add potential future points for each remaining round
	for (let round = currentRound; round <= 6; round++) {
		const roundSelections = bracket.selections[round] || {};
		const roundResults = actualResults?.[round] || {};
		const pointsPerGame = POINTS_PER_ROUND[round - 1];

		// For each game in this round
		Object.entries(roundSelections).forEach(([gameId, pickedWinner]) => {
			// If the game doesn't have a result yet, it could still be correct
			if (!roundResults[gameId] && pickedWinner) {
				maxPossible += pointsPerGame;
			}
			// If team is already eliminated, no potential points
		});
	}

	return maxPossible;
}

/**
 * Checks if a team has been eliminated from the tournament
 *
 * @param {string} teamName - The team to check
 * @param {Object} actualResults - The actual tournament results
 * @param {number} upToRound - Check elimination up to this round (default: all rounds)
 * @returns {boolean} True if the team is eliminated
 */
export function isTeamEliminated(teamName, actualResults, upToRound = 6) {
	if (!teamName || !actualResults) return false;

	// Check each round for games where this team lost
	for (let round = 1; round <= upToRound; round++) {
		const roundResults = actualResults[round] || {};

		// Find any game in the round results where this team played but didn't win
		const eliminationGame = Object.values(actualResults.games || {}).find(
			(game) => {
				return (
					game.round === round &&
					((game.teamA === teamName && game.winner !== teamName) ||
						(game.teamB === teamName &&
							game.winner !== teamName)) &&
					game.winner
				); // Make sure a winner is actually recorded
			}
		);

		if (eliminationGame) {
			return true; // Team was eliminated
		}
	}

	return false; // Team is still alive
}

/**
 * Calculates more accurate maximum possible points by considering team eliminations
 *
 * @param {Object} bracket - The bracket to evaluate
 * @param {Object} actualResults - The actual tournament results so far
 * @param {number} currentRound - The current tournament round (1-6)
 * @returns {number} Maximum possible points considering eliminations
 */
export function calculatePreciseMaxPossible(
	bracket,
	actualResults,
	currentRound = 1
) {
	// Start with points already earned
	const scoreData = calculateBracketScore(bracket, actualResults);
	let maxPossible = scoreData.points;

	// If bracket or selections are missing, return current points
	if (!bracket?.selections || !actualResults?.games) {
		return maxPossible;
	}

	// Track teams that are already eliminated
	const eliminatedTeams = new Set();

	// Pre-process elimination data once for efficiency
	Object.values(actualResults.games || {}).forEach((game) => {
		if (game.round < currentRound && game.winner) {
			// The loser is eliminated
			const loser = game.teamA === game.winner ? game.teamB : game.teamA;
			if (loser) eliminatedTeams.add(loser);
		}
	});

	// Add potential future points for each remaining round
	for (let round = currentRound; round <= 6; round++) {
		const roundSelections = bracket.selections[round] || {};
		const roundResults = actualResults[round] || {};
		const pointsPerGame = POINTS_PER_ROUND[round - 1];

		// For each game in this round
		Object.entries(roundSelections).forEach(([gameId, pickedWinner]) => {
			// If the game doesn't have a result yet and picked team isn't eliminated
			if (
				!roundResults[gameId] &&
				pickedWinner &&
				!eliminatedTeams.has(pickedWinner)
			) {
				maxPossible += pointsPerGame;
			}
		});
	}

	return maxPossible;
}

/**
 * Updates a bracket's scoring data with the latest results
 *
 * @param {Object} bracket - The bracket to update
 * @param {Object} actualResults - The actual tournament results
 * @param {number} currentRound - The current tournament round (1-6)
 * @returns {Object} Updated bracket with scoring data
 */
export function updateBracketScoring(bracket, actualResults, currentRound = 1) {
	// Calculate scores and maximum possible points
	const scoreData = calculateBracketScore(bracket, actualResults);
	const maxPossible = calculatePreciseMaxPossible(
		bracket,
		actualResults,
		currentRound
	);

	// Create a new bracket object with updated scoring
	return {
		...bracket,
		points: scoreData.points,
		correctPicks: scoreData.correctPicks,
		totalPicks: scoreData.totalPicks,
		roundScores: scoreData.roundScores,
		maxPossible: maxPossible,
	};
}

/**
 * Processes actual results from tournament data into a format usable for scoring
 *
 * @param {Object} tournamentData - Tournament data with games and results
 * @returns {Object} Formatted results for use with scoring functions
 */
export function processActualResults(tournamentData) {
	if (!tournamentData?.rounds) {
		return null;
	}

	const results = {
		games: {},
		1: {}, // Round 1 results
		2: {}, // Round 2 results
		3: {}, // Sweet 16 results
		4: {}, // Elite 8 results
		5: {}, // Final 4 results
		6: {}, // Championship result
	};

	// Process each round
	Object.entries(tournamentData.rounds).forEach(([roundNum, games]) => {
		const round = parseInt(roundNum);

		// Process each game in the round
		games.forEach((game) => {
			if (game.gameId && game.actualWinner) {
				// Store both by game ID for easy lookup and in the flat structure
				results.games[game.gameId] = {
					round: round,
					teamA: game.teamA,
					teamB: game.teamB,
					winner: game.actualWinner,
				};

				// Also store directly in the round object for easy lookup
				results[round][game.gameId] = game.actualWinner;
			}
		});
	});

	return results;
}

/**
 * Batch updates all brackets in the leaderboard with latest scores
 *
 * @param {Array} leaderboardData - Array of bracket data objects
 * @param {Object} actualResults - The actual tournament results
 * @param {number} currentRound - The current tournament round (1-6)
 * @returns {Array} Updated leaderboard data with current scores
 */
export function updateLeaderboardScores(
	leaderboardData,
	actualResults,
	currentRound = 1
) {
	if (!leaderboardData || !actualResults) {
		return leaderboardData;
	}

	// Update each bracket's scoring
	return leaderboardData.map((bracket) =>
		updateBracketScoring(bracket, actualResults, currentRound)
	);
}

/**
 * Calculate the possible elimination scenarios for future rounds
 *
 * @param {Object} bracket - The bracket to analyze
 * @param {Object} actualResults - The actual tournament results so far
 * @param {number} currentRound - The current tournament round (1-6)
 * @returns {Object} Analysis of possible future outcomes
 */
export function analyzeBracketScenarios(
	bracket,
	actualResults,
	currentRound = 1
) {
	// Calculate current score and max possible
	const scoreData = calculateBracketScore(bracket, actualResults);
	const maxPossible = calculatePreciseMaxPossible(
		bracket,
		actualResults,
		currentRound
	);

	// Track critical games that could significantly impact bracket score
	const criticalGames = [];

	// Find games in the current round that have picks but no results yet
	if (actualResults && bracket?.selections) {
		const currentRoundSelections = bracket.selections[currentRound] || {};

		Object.entries(currentRoundSelections).forEach(
			([gameId, pickedWinner]) => {
				// If this game doesn't have a result yet
				if (!actualResults[currentRound]?.[gameId] && pickedWinner) {
					// This game is critical for this bracket
					const gameInfo =
						actualResults.games?.[gameId] ||
						bracket.rounds?.[currentRound]?.find(
							(g) => g.gameId.toString() === gameId
						);

					if (gameInfo) {
						const pointValue = POINTS_PER_ROUND[currentRound - 1];
						criticalGames.push({
							gameId,
							round: currentRound,
							teamA: gameInfo.teamA,
							teamB: gameInfo.teamB,
							pickedWinner,
							pointValue,
							impactFactor: calculateGameImpact(
								bracket,
								actualResults,
								gameId,
								currentRound
							),
						});
					}
				}
			}
		);
	}

	return {
		currentScore: scoreData.points,
		maxPossible,
		correctPicks: scoreData.correctPicks,
		totalPicks: scoreData.totalPicks,
		criticalGames: criticalGames.sort(
			(a, b) => b.impactFactor - a.impactFactor
		),
	};
}

/**
 * Calculate the impact factor of a game on the bracket's final score
 * This is a heuristic that considers future rounds
 *
 * @param {Object} bracket - The bracket to analyze
 * @param {Object} actualResults - The actual tournament results so far
 * @param {string} gameId - The ID of the game to analyze
 * @param {number} gameRound - The round of the game
 * @returns {number} Impact factor (higher means more important)
 */
function calculateGameImpact(bracket, actualResults, gameId, gameRound) {
	// Start with the points for the current game
	let impact = POINTS_PER_ROUND[gameRound - 1];

	// If this is one of the last rounds, it has high impact already
	if (gameRound >= 5) return impact * 1.5;

	// Get the team picked to win this game
	const pickedWinner = bracket.selections[gameRound]?.[gameId];
	if (!pickedWinner) return impact;

	// See if this team is picked in future rounds
	let futureRoundImpact = 0;

	for (let round = gameRound + 1; round <= 6; round++) {
		const roundSelections = bracket.selections[round] || {};

		// Check if the winner appears in future round picks
		const appearsInRound =
			Object.values(roundSelections).includes(pickedWinner);

		if (appearsInRound) {
			futureRoundImpact += POINTS_PER_ROUND[round - 1] * 0.5; // Discount future rounds
		}
	}

	return impact + futureRoundImpact;
}
