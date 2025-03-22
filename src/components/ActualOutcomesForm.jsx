'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
	doc,
	getDoc,
	updateDoc,
	collection,
	query,
	where,
	getDocs,
	writeBatch,
	serverTimestamp,
	setDoc,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import dummyTeams from '@/dummyTeams';
import { updateLeaderboardScores, processActualResults } from '@/utils/scoring';
import BracketComparisonSelector from './BracketComparisonSelector';

/**
 * ActualOutcomesForm - A component for tournament administrators to record
 * and update actual game outcomes, used for scoring user brackets
 */
export default function ActualOutcomesForm({ tournamentId = 'ncaa-2025' }) {
	const { user } = useAuth();
	const [isAdmin, setIsAdmin] = useState(false);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [tournament, setTournament] = useState(null);
	const [gamesByRound, setGamesByRound] = useState({});
	const [currentRound, setCurrentRound] = useState(1);
	const [isUpdating, setIsUpdating] = useState(false);
	const [updateSuccess, setUpdateSuccess] = useState(false);
	const [confirmAction, setConfirmAction] = useState(null);
	const [isBatchUpdating, setIsBatchUpdating] = useState(false);
	const [batchUpdateStats, setBatchUpdateStats] = useState(null);
	const [isClient, setIsClient] = useState(false);
	const [comparisonBracketId, setComparisonBracketId] = useState('actual');
	const [comparisonBracketName, setComparisonBracketName] =
		useState('Actual Results');
	const [comparisonResults, setComparisonResults] = useState({});
	const [isComparingBrackets, setIsComparingBrackets] = useState(false);

	// Round information
	const roundInfo = [
		{ number: 1, name: 'First Round', gameCount: 32 },
		{ number: 2, name: 'Second Round', gameCount: 16 },
		{ number: 3, name: 'Sweet 16', gameCount: 8 },
		{ number: 4, name: 'Elite Eight', gameCount: 4 },
		{ number: 5, name: 'Final Four', gameCount: 2 },
		{ number: 6, name: 'Championship', gameCount: 1 },
	];

	// Check if user is admin and load tournament data
	useEffect(() => {
		const checkAdminAndLoadData = async () => {
			try {
				setLoading(true);
				// Verify admin status
				if (!user) {
					setIsAdmin(false);
					setError('You must be logged in to access this page');
					setLoading(false);
					return;
				}

				// Verify admin status from Firestore
				try {
					const adminDocRef = doc(db, 'settings', 'admins');
					const adminDoc = await getDoc(adminDocRef);

					let isUserAdmin = false;
					if (adminDoc.exists()) {
						const data = adminDoc.data();
						const adminIds = data.adminIds || [];
						isUserAdmin = adminIds.includes(user.uid);
						console.log(
							'Admin status from Firestore:',
							isUserAdmin
						);
					} else {
						// If the document doesn't exist yet, create it with this user as first admin
						console.log(
							'Admin document not found, creating it with current user as admin'
						);
						await setDoc(adminDocRef, {
							adminIds: [user.uid],
							createdAt: serverTimestamp(),
						});
						isUserAdmin = true;
					}

					setIsAdmin(isUserAdmin);

					if (!isUserAdmin) {
						setError(
							'You do not have permission to update tournament results'
						);
						setLoading(false);
						return;
					}

					// Continue loading tournament data...
				} catch (error) {
					console.error('Error checking admin status:', error);
					setError(`Failed to verify admin status: ${error.message}`);
					setLoading(false);
					return;
				}

				// Load tournament data
				const tournamentRef = doc(db, 'tournaments', tournamentId);
				const tournamentDoc = await getDoc(tournamentRef);

				if (!tournamentDoc.exists()) {
					// Tournament doesn't exist - create a new one with dummy data
					const newTournament = {
						id: tournamentId,
						name: 'Proper March Madness 2025',
						submissionDeadline: new Date(
							2025,
							3,
							22,
							12
						).toISOString(),
						teams: dummyTeams,
						currentRound: 1,
						rounds: generateAllRoundsGames(dummyTeams),
						roundNames: [
							'First Round',
							'Second Round',
							'Sweet 16',
							'Elite Eight',
							'Final Four',
							'Championship',
						],
						lastUpdated: serverTimestamp(),
					};

					// Save to Firestore
					await setDoc(
						doc(db, 'tournaments', tournamentId),
						newTournament
					);
					console.log('Created new tournament in Firestore');

					setTournament(newTournament);
					setGamesByRound(newTournament.rounds);
				} else {
					// Tournament exists - load it
					const tournamentData = tournamentDoc.data();
					setTournament(tournamentData);
					setGamesByRound(tournamentData.rounds || {});
					setCurrentRound(tournamentData.currentRound || 1);
				}

				setLoading(false);
			} catch (err) {
				console.error('Error loading tournament data:', err);
				setError(
					`Failed to load tournament data: ${
						err.message || 'Unknown error'
					}`
				);
				setLoading(false);
			}
		};

		checkAdminAndLoadData();
	}, [user, tournamentId]);

	// Generate NCAA tournament structure with all rounds
	function generateAllRoundsGames(teams) {
		const rounds = {};

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

		let gameId = 1; // Start with 1 and increment for each game

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
						actualWinner: '',
						region,
						round: 1,
					});
					gameId++; // Increment for uniqueness
				}
			});
		});

		// Initialize empty subsequent rounds (2-6)
		for (let round = 2; round <= 6; round++) {
			rounds[round] = [];

			// Calculate number of games in this round
			const numGames = Math.pow(2, 6 - round);

			for (let i = 0; i < numGames; i++) {
				// Create the base game object
				const gameObj = {
					gameId: gameId++, // Ensure this is unique
					teamA: '',
					teamB: '',
					actualWinner: '',
					round,
				};

				// Only add region field for rounds 2-4
				if (round <= 4) {
					gameObj.region = regions[Math.floor(i / (numGames / 4))];
				}

				rounds[round].push(gameObj);
			}
		}

		return rounds;
	}
	// Handle actual winner selection for a game
	// Modified handleSelectWinner function
	const handleSelectWinner = (gameId, round, winner) => {
		console.log(
			`Selected ${winner} as winner for game ${gameId} in round ${round}`
		);

		setGamesByRound((prev) => {
			// Create a deep copy to avoid reference issues
			const updated = JSON.parse(JSON.stringify(prev));

			// Find the game by ID
			const roundGames = updated[round] || [];
			const gameIndex = roundGames.findIndex((g) => g.gameId === gameId);

			if (gameIndex >= 0) {
				// Update the actual winner
				updated[round][gameIndex].actualWinner = winner;
				console.log(`Updated winner for game ${gameId} to ${winner}`);
			} else {
				console.warn(`Game ${gameId} not found in round ${round}`);
			}

			return updated;
		});

		// Also update the next round with this winner if applicable
		propagateWinnerToNextRound(gameId, round, winner);
	};

	// Propagate winner to the next round
	const propagateWinnerToNextRound = (gameId, round, winner) => {
		if (round >= 6) return; // Championship has no next round

		const nextRound = round + 1;
		let nextGameId;
		let isTeamASlot;

		// Calculate which game in the next round should receive this winner
		if (round === 1) {
			// Round 1 (games 1-32) feeds into round 2 (games 33-48)
			nextGameId = 32 + Math.ceil(gameId / 2);
			isTeamASlot = gameId % 2 === 1; // Odd game IDs feed into team A slot
		} else if (round === 2) {
			// Round 2 (games 33-48) feeds into round 3 (games 49-56)
			nextGameId = 48 + Math.ceil((gameId - 32) / 2);
			isTeamASlot = (gameId - 32) % 2 === 1;
		} else if (round === 3) {
			// Round 3 (games 49-56) feeds into round 4 (games 57-60)
			nextGameId = 56 + Math.ceil((gameId - 48) / 2);
			isTeamASlot = (gameId - 48) % 2 === 1;
		} else if (round === 4) {
			// Round 4 (games 57-60) feeds into round 5 (games 61-62)
			nextGameId = 60 + Math.ceil((gameId - 56) / 2);
			isTeamASlot = (gameId - 56) % 2 === 1;
		} else if (round === 5) {
			// Round 5 (games 61-62) feeds into round 6 (game 63)
			nextGameId = 63;
			isTeamASlot = gameId === 61; // Game 61 feeds to team A, Game 62 feeds to team B
		}

		// Update the next round's game with this winner
		setGamesByRound((prev) => {
			const updated = { ...prev };
			const nextGameIndex = updated[nextRound].findIndex(
				(g) => g.gameId === nextGameId
			);

			if (nextGameIndex >= 0) {
				const nextGame = updated[nextRound][nextGameIndex];
				updated[nextRound][nextGameIndex] = {
					...nextGame,
					teamA: isTeamASlot ? winner : nextGame.teamA,
					teamB: !isTeamASlot ? winner : nextGame.teamB,
					// Clear any existing winner if a team changes
					actualWinner: '',
				};
			}

			return updated;
		});
	};

	// Add this helper function
	const prepareDataForFirestore = (data) => {
		// Create a deep copy to avoid reference issues
		const cleanedRounds = {};

		Object.keys(data).forEach((round) => {
			// Ensure round is treated as a string key
			const roundKey = round.toString();

			cleanedRounds[roundKey] = data[round].map((game) => {
				// Create a clean game object with only the fields we need
				return {
					gameId: game.gameId,
					teamA: game.teamA || '',
					teamB: game.teamB || '',
					actualWinner: game.actualWinner || '',
					round: parseInt(round),
					// Only include region if it exists
					...(game.region ? { region: game.region } : {}),
				};
			});
		});

		return cleanedRounds;
	};

	// Save tournament results to Firebase
	const saveTournamentResults = async () => {
		try {
			setIsUpdating(true);
			// More detailed logging
			console.log(
				'BEFORE SAVE - Current gamesByRound state:',
				JSON.stringify(gamesByRound)
			);
			console.log('Saving tournament results with rounds:', gamesByRound);

			// Ensure all games have the correct properties
			const cleanedRounds = prepareDataForFirestore(gamesByRound);
			// Log the cleaned data
			console.log(
				'CLEANED DATA for Firestore:',
				JSON.stringify(cleanedRounds)
			);

			const tournamentRef = doc(db, 'tournaments', tournamentId);

			// Log the reference
			console.log('Saving to document:', tournamentRef.path);

			// Update tournament document with new game results and current round
			await updateDoc(tournamentRef, {
				rounds: cleanedRounds,
				currentRound: currentRound,
				lastUpdated: serverTimestamp(),
			});

			console.log('✅ Document updated successfully');

			// Also update local state with cleaned data
			setGamesByRound(cleanedRounds);

			setUpdateSuccess(true);
			setTimeout(() => setUpdateSuccess(false), 3000);
		} catch (err) {
			console.error('❌ Error saving tournament results:', err);

			console.error('Error saving tournament results:', err);
			setError(
				`Failed to save results: ${err.message || 'Unknown error'}`
			);
		} finally {
			setIsUpdating(false);
		}
	};

	// Advance to the next tournament round
	const advanceToNextRound = () => {
		if (currentRound >= 6) return; // Already at the championship

		setConfirmAction({
			title: 'Advance Tournament Round',
			message: `Are you sure you want to advance the tournament to the ${roundInfo[currentRound].name}? This will update the current round for all users.`,
			action: async () => {
				try {
					setIsUpdating(true);

					const tournamentRef = doc(db, 'tournaments', tournamentId);
					await updateDoc(tournamentRef, {
						currentRound: currentRound + 1,
						lastUpdated: serverTimestamp(),
					});

					setCurrentRound((prev) => prev + 1);
					setUpdateSuccess(true);
					setTimeout(() => setUpdateSuccess(false), 3000);
				} catch (err) {
					console.error('Error advancing round:', err);
					setError(
						`Failed to advance round: ${
							err.message || 'Unknown error'
						}`
					);
				} finally {
					setIsUpdating(false);
					setConfirmAction(null);
				}
			},
		});
	};

	// Update all bracket scores based on actual results
	const updateAllBracketScores = async () => {
		setConfirmAction({
			title: 'Update All Bracket Scores',
			message:
				'This will recalculate scores for all brackets based on the latest game results. This operation may take some time. Continue?',
			action: async () => {
				try {
					setIsBatchUpdating(true);
					setBatchUpdateStats({
						total: 0,
						processed: 0,
						updated: 0,
					});

					// Get the tournament data with actual results
					const tournamentRef = doc(db, 'tournaments', tournamentId);
					const tournamentDoc = await getDoc(tournamentRef);

					if (!tournamentDoc.exists()) {
						throw new Error('Tournament not found');
					}

					const tournamentData = tournamentDoc.data();

					// Process results for scoring
					const actualResults = processActualResults(tournamentData);

					// Get all brackets for this tournament
					const bracketsRef = collection(db, 'brackets');
					const q = query(
						bracketsRef,
						where('tournamentId', '==', tournamentId)
					);
					const bracketsSnapshot = await getDocs(q);

					if (bracketsSnapshot.empty) {
						setBatchUpdateStats({
							total: 0,
							processed: 0,
							updated: 0,
						});
						setIsBatchUpdating(false);
						setConfirmAction(null);
						return;
					}

					// Update stats
					setBatchUpdateStats((prev) => ({
						...prev,
						total: bracketsSnapshot.size,
					}));

					// Process brackets in batches to avoid overloading Firestore
					const batchSize = 20;
					let processed = 0;
					let updated = 0;

					// Convert brackets to array for batch processing
					const brackets = [];
					bracketsSnapshot.forEach((doc) => {
						brackets.push({
							id: doc.id,
							...doc.data(),
						});
					});

					// Process in batches
					for (let i = 0; i < brackets.length; i += batchSize) {
						const batch = writeBatch(db);
						const currentBatch = brackets.slice(i, i + batchSize);

						// Update each bracket in the batch
						currentBatch.forEach((bracket) => {
							const updatedBracket = updateBracketScoring(
								bracket,
								actualResults,
								currentRound
							);

							// Only update if scores have changed
							if (
								updatedBracket.points !== bracket.points ||
								updatedBracket.correctPicks !==
									bracket.correctPicks ||
								JSON.stringify(updatedBracket.roundScores) !==
									JSON.stringify(bracket.roundScores)
							) {
								const bracketRef = doc(
									db,
									'brackets',
									bracket.id
								);

								batch.update(bracketRef, {
									points: updatedBracket.points,
									correctPicks: updatedBracket.correctPicks,
									totalPicks: updatedBracket.totalPicks,
									roundScores: updatedBracket.roundScores,
									maxPossible: updatedBracket.maxPossible,
									updatedAt: serverTimestamp(),
								});

								updated++;
							}

							processed++;
						});

						// Update stats
						setBatchUpdateStats({
							total: brackets.length,
							processed,
							updated,
						});

						// Commit the batch
						await batch.commit();
					}

					setUpdateSuccess(true);
					setTimeout(() => setUpdateSuccess(false), 3000);
				} catch (err) {
					console.error('Error updating bracket scores:', err);
					setError(
						`Failed to update bracket scores: ${
							err.message || 'Unknown error'
						}`
					);
				} finally {
					setIsBatchUpdating(false);
					setConfirmAction(null);
				}
			},
		});
	};

	// Helper function to update a single bracket's scoring
	const updateBracketScoring = (bracket, actualResults, currentRound) => {
		// Use the existing utility function from scoring.js
		const {
			calculateBracketScore,
			calculatePreciseMaxPossible,
		} = require('@/utils/scoring');

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
	};

	// Get team details (seed, record) for a team
	const getTeamDetails = (teamName) => {
		if (!teamName) return { seed: '?', record: '', region: '' };

		const team = dummyTeams.find((t) => t.team === teamName);
		return team
			? {
					seed: team.seed,
					record: team.record,
					region: team.region,
			  }
			: { seed: '?', record: '', region: '' };
	};

	// Helper to get completion status for current round
	const getCurrentRoundCompletion = () => {
		const games = gamesByRound[currentRound] || [];
		const totalGames = games.length;
		const completedGames = games.filter((game) => game.actualWinner).length;
		const percent = totalGames
			? Math.round((completedGames / totalGames) * 100)
			: 0;

		return {
			total: totalGames,
			completed: completedGames,
			percent,
		};
	};

	// Set isClient to true on mount
	useEffect(() => {
		setIsClient(true);
	}, []);

	// Add this new function to fetch and process a user's bracket selections
	const fetchBracketForComparison = async (bracketId) => {
		if (bracketId === 'actual') {
			// Reset to actual results
			setComparisonResults(actualResults || {});
			setComparisonBracketName('Actual Results');
			setIsComparingBrackets(false);
			return;
		}

		try {
			const bracketRef = doc(db, 'brackets', bracketId);
			const bracketDoc = await getDoc(bracketRef);

			if (bracketDoc.exists()) {
				const bracketData = bracketDoc.data();

				// Transform selections into the format of actualResults
				const transformedSelections = {};

				// Process each round of selections
				Object.entries(bracketData.selections || {}).forEach(
					([round, games]) => {
						const roundNum = parseInt(round);
						transformedSelections[roundNum] = {};

						// Process each game selection
						Object.entries(games).forEach(([gameId, winner]) => {
							transformedSelections[roundNum][gameId] = winner;
						});
					}
				);

				setComparisonResults(transformedSelections);
				setComparisonBracketName(
					`${bracketData.name} (${bracketData.userName})`
				);
				setIsComparingBrackets(true);
			} else {
				// Bracket not found, revert to actual results
				setComparisonResults(actualResults || {});
				setComparisonBracketName('Actual Results');
				setIsComparingBrackets(false);
			}
		} catch (err) {
			console.error('Error fetching bracket for comparison:', err);
			// Revert to actual results on error
			setComparisonResults(actualResults || {});
			setComparisonBracketName('Actual Results');
			setIsComparingBrackets(false);
		}
	};

	// Add this effect to update comparison results when bracketId changes
	useEffect(() => {
		if (comparisonBracketId) {
			fetchBracketForComparison(comparisonBracketId);
		}
	}, [comparisonBracketId]);

	// Add this effect to set the initial comparison results to the actual results
	useEffect(() => {
		if (tournament?.rounds) {
			const results = processActualResults(tournament);
			setComparisonResults(results);
		}
	}, [tournament]);

	// Loading state
	if (loading) {
		return (
			<div className='flex justify-center items-center min-h-[400px]'>
				<div className='loading loading-spinner loading-lg text-secondary'></div>
			</div>
		);
	}

	// Error state
	if (error) {
		return (
			<div className='alert alert-error'>
				<svg
					xmlns='http://www.w3.org/2000/svg'
					className='stroke-current shrink-0 h-6 w-6'
					fill='none'
					viewBox='0 0 24 24'
				>
					<path
						strokeLinecap='round'
						strokeLinejoin='round'
						strokeWidth='2'
						d='M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'
					/>
				</svg>
				<span>{error}</span>
			</div>
		);
	}

	// Check admin permissions
	if (!isAdmin) {
		return (
			<div className='alert alert-warning'>
				<svg
					xmlns='http://www.w3.org/2000/svg'
					className='stroke-current shrink-0 h-6 w-6'
					fill='none'
					viewBox='0 0 24 24'
				>
					<path
						strokeLinecap='round'
						strokeLinejoin='round'
						strokeWidth='2'
						d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
					/>
				</svg>
				<span>
					You do not have permission to update tournament results.
				</span>
			</div>
		);
	}

	// For client-side only rendering of the form
	if (!isClient) {
		return (
			<div className='loading loading-spinner loading-lg mx-auto'></div>
		);
	}

	// Get completion info for current round
	const completion = getCurrentRoundCompletion();

	return (
		<div className='space-y-8'>
			<div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
				<div>
					<h2 className='text-2xl font-bold'>
						{tournament?.name || 'Tournament'} Results
					</h2>
					<p className='text-base-content/70'>
						Update actual game outcomes to score user brackets
					</p>
				</div>

				<div className='flex flex-col sm:flex-row gap-2'>
					<button
						className='btn btn-secondary'
						onClick={saveTournamentResults}
						disabled={isUpdating}
					>
						{isUpdating ? (
							<>
								<span className='loading loading-spinner loading-xs'></span>
								Saving...
							</>
						) : (
							'Save Tournament Results'
						)}
					</button>

					<button
						className='btn btn-secondary'
						onClick={updateAllBracketScores}
						disabled={isUpdating || isBatchUpdating}
					>
						Update All Scores
					</button>

					<div className='dropdown dropdown-end'>
						<label
							tabIndex={0}
							className='btn btn-outline'
						>
							More Actions
						</label>
						<ul
							tabIndex={0}
							className='dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52'
						>
							<li>
								<button
									onClick={advanceToNextRound}
									disabled={currentRound >= 6}
								>
									Advance to Next Round
								</button>
							</li>
							<li>
								<a
									href={`/brackets/leaderboard`}
									target='_blank'
									rel='noopener noreferrer'
								>
									View Leaderboard
								</a>
							</li>
						</ul>
					</div>
				</div>
			</div>

			{/* Success message */}
			{updateSuccess && (
				<div className='alert alert-success'>
					<svg
						xmlns='http://www.w3.org/2000/svg'
						className='stroke-current shrink-0 h-6 w-6'
						fill='none'
						viewBox='0 24 24'
					>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth='2'
							d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
						/>
					</svg>
					<span>Changes saved successfully!</span>
				</div>
			)}

			{/* Tournament status */}
			<div className='bg-base-200 p-4 rounded-lg'>
				<div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
					<div>
						<h3 className='font-bold'>
							Current Round: {roundInfo[currentRound - 1]?.name}
						</h3>
						<p className='text-sm text-base-content/70'>
							{completion.completed} of {completion.total} games
							completed ({completion.percent}%)
						</p>

						{/* Add comparison mode indicator */}
						{isComparingBrackets && (
							<div className='mt-2 alert alert-warning py-1 px-3'>
								<svg
									xmlns='http://www.w3.org/2000/svg'
									className='stroke-current shrink-0 h-4 w-4'
									fill='none'
									viewBox='0 0 24 24'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth='2'
										d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
									/>
								</svg>
								<span className='text-xs'>
									Viewing "{comparisonBracketName}" bracket
									instead of actual results
								</span>
							</div>
						)}
					</div>

					{/* Add bracket comparison selector */}
					<div className='flex flex-col gap-2'>
						<BracketComparisonSelector
							tournamentId={tournamentId}
							onBracketSelect={setComparisonBracketId}
							currentBracketId={comparisonBracketId}
						/>

						{isComparingBrackets && (
							<button
								className='btn btn-sm btn-outline btn-warning'
								onClick={() => setComparisonBracketId('actual')}
							>
								Reset to Actual Results
							</button>
						)}
					</div>
				</div>
			</div>

			{/* Add the new comparison mode alert here */}
			{isComparingBrackets && (
				<div className='alert alert-warning mb-4'>
					<svg
						xmlns='http://www.w3.org/2000/svg'
						className='stroke-current shrink-0 h-6 w-6'
						fill='none'
						viewBox='0 0 24 24'
					>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth='2'
							d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
						/>
					</svg>
					<div>
						<h3 className='font-bold'>Comparison Mode Active</h3>
						<div className='text-sm'>
							You're viewing a user's bracket instead of actual
							results. Admin actions will still use the official
							results.
						</div>
					</div>
				</div>
			)}

			{/* Round tabs */}
			<div className='tabs tabs-boxed justify-center'>
				{roundInfo.map((round) => (
					<button
						key={round.number}
						className={`tab ${
							currentRound === round.number ? 'tab-active' : ''
						}`}
						onClick={() => setCurrentRound(round.number)}
					>
						{round.name}
					</button>
				))}
			</div>

			{/* Game selection interface */}
			<div className='grid grid-cols-1 gap-4'>
				{/* Show current round games */}
				<div className='overflow-x-auto'>
					<table className='table w-full'>
						<thead>
							<tr>
								<th>Game #</th>
								<th>Team 1</th>
								<th>Team 2</th>
								<th>Winner</th>
								<th>Region</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{gamesByRound[currentRound]?.map((game) => {
								const teamADetails = getTeamDetails(game.teamA);
								const teamBDetails = getTeamDetails(game.teamB);

								return (
									<tr
										key={game.gameId}
										className={
											game.actualWinner
												? 'bg-base-200'
												: ''
										}
									>
										<td className='font-mono'>
											{game.gameId}
										</td>
										<td>
											{game.teamA ? (
												<div className='flex items-center gap-2'>
													<div className='badge badge-sm'>
														{teamADetails.seed}
													</div>
													<span
														className={
															game.actualWinner ===
																game.teamA ||
															(isComparingBrackets &&
																comparisonResults[
																	currentRound
																]?.[
																	game.gameId
																] ===
																	game.teamA)
																? 'font-bold text-success'
																: ''
														}
													>
														{game.teamA}
													</span>
												</div>
											) : (
												<span className='text-base-content/50'>
													TBD
												</span>
											)}
										</td>
										<td>
											{game.teamB ? (
												<div className='flex items-center gap-2'>
													<div className='badge badge-sm'>
														{teamBDetails.seed}
													</div>
													<span
														className={
															game.actualWinner ===
																game.teamB ||
															(isComparingBrackets &&
																comparisonResults[
																	currentRound
																]?.[
																	game.gameId
																] ===
																	game.teamB)
																? 'font-bold text-success'
																: ''
														}
													>
														{game.teamB}
													</span>
												</div>
											) : (
												<span className='text-base-content/50'>
													TBD
												</span>
											)}
										</td>
										<td>
											{isComparingBrackets ? (
												comparisonResults[
													currentRound
												]?.[game.gameId] ? (
													<span className='font-bold text-success'>
														{
															comparisonResults[
																currentRound
															][game.gameId]
														}
														<span className='text-xs ml-1 opacity-70'>
															(From bracket)
														</span>
													</span>
												) : (
													<span className='text-base-content/50'>
														Not picked
													</span>
												)
											) : game.actualWinner ? (
												<span className='font-bold text-success'>
													{game.actualWinner}
												</span>
											) : (
												<span className='text-base-content/50'>
													Not set
												</span>
											)}
										</td>
										<td>{game.region || '-'}</td>
										<td>
											<div className='flex gap-2'>
												{/* Winner selection buttons */}
												{game.teamA && (
													<button
														className={`btn btn-xs ${
															game.actualWinner ===
															game.teamA
																? 'btn-success'
																: 'btn-outline'
														}`}
														onClick={() =>
															handleSelectWinner(
																game.gameId,
																currentRound,
																game.teamA
															)
														}
														disabled={!game.teamA}
													>
														Team 1 Wins
													</button>
												)}

												{game.teamB && (
													<button
														className={`btn btn-xs ${
															game.actualWinner ===
															game.teamB
																? 'btn-success'
																: 'btn-outline'
														}`}
														onClick={() =>
															handleSelectWinner(
																game.gameId,
																currentRound,
																game.teamB
															)
														}
														disabled={!game.teamB}
													>
														Team 2 Wins
													</button>
												)}

												{/* Clear button */}
												{game.actualWinner && (
													<button
														className='btn btn-xs btn-error btn-outline'
														onClick={() =>
															handleSelectWinner(
																game.gameId,
																currentRound,
																''
															)
														}
													>
														Clear
													</button>
												)}
											</div>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			</div>

			{/* Batch update status */}
			{isBatchUpdating && batchUpdateStats && (
				<div className='bg-base-200 p-4 rounded-lg'>
					<h3 className='font-bold mb-2'>
						Updating Bracket Scores...
					</h3>
					<div className='flex flex-col gap-2'>
						<progress
							className='progress progress-secondary'
							value={batchUpdateStats.processed}
							max={batchUpdateStats.total}
						></progress>
						<div className='text-sm'>
							Processed {batchUpdateStats.processed} of{' '}
							{batchUpdateStats.total} brackets (
							{batchUpdateStats.updated} updated)
						</div>
					</div>
				</div>
			)}

			{/* Confirmation modal */}
			{confirmAction && (
				<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
					<div className='modal-box'>
						<h3 className='font-bold text-lg'>
							{confirmAction.title}
						</h3>
						<p className='py-4'>{confirmAction.message}</p>
						<div className='modal-action'>
							<button
								className='btn btn-outline'
								onClick={() => setConfirmAction(null)}
							>
								Cancel
							</button>
							<button
								className='btn btn-secondary'
								onClick={confirmAction.action}
								disabled={isUpdating}
							>
								{isUpdating ? (
									<>
										<span className='loading loading-spinner loading-xs'></span>
										Processing...
									</>
								) : (
									'Confirm'
								)}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
