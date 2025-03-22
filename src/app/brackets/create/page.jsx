'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useSelector } from 'react-redux';
import CreateBracketContainer from '@/components/CreateBracketContainer';
import BracketViewContainer from '@/components/BracketViewContainer';
import SelectWinner from '@/components/SelectWinner';
import TournamentRoundContainer from '@/components/TournamentRoundContainer';
// Fix your import path - use the correct path
import dummyTeams from '@/dummyTeams'; // Make sure this file exists at src/dummyTeams.js
import { useUserBracket } from '@/hooks/useUserBracket'
import {
	doc,
	setDoc,
	collection,
	serverTimestamp,
	query,
	where,
	orderBy,
	limit,
	getDocs,
	deleteDoc,
} from 'firebase/firestore';
import { db } from '@/config/firebase'; // Make sure your firebase.js exports db

export default function CreateBracketPage() {
	const { isAuthenticated, user } = useSelector((state) => state.auth);
	const { isLoading } = useAuth();
	const router = useRouter();
	const [tournament, setTournament] = useState(null);
	const [bracketName, setBracketName] = useState('');
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Track the current step (round 1-6, then final naming step)
	const [currentStep, setCurrentStep] = useState(1);
	const [showStepModal, setShowStepModal] = useState(false);

	// Store bracket selections by round
	const [bracketSelections, setBracketSelections] = useState({
		1: {}, // Round 1: { gameId: winnerTeam }
		2: {},
		3: {},
		4: {},
		5: {},
		6: {},
	});

	// Store all games by round
	const [gamesByRound, setGamesByRound] = useState({
		1: [], // Round 1: [{gameId, teamA, teamB, ...}]
		2: [],
		3: [],
		4: [],
		5: [],
		6: [],
	});

	// Round information
	const roundInfo = [
		{ number: 1, name: 'First Round', gameCount: 32 },
		{ number: 2, name: 'Second Round', gameCount: 16 },
		{ number: 3, name: 'Sweet 16', gameCount: 8 },
		{ number: 4, name: 'Elite Eight', gameCount: 4 },
		{ number: 5, name: 'Final Four', gameCount: 2 },
		{ number: 6, name: 'Championship', gameCount: 1 },
	];

	// Load tournament data only if authenticated
	useEffect(() => {
		if (isAuthenticated === true) {
			fetchTournament();
		}
	}, [isAuthenticated]);

	// Auto-open the first step modal when data is loaded
	useEffect(() => {
		if (tournament && !loading && !error && user) {
			checkForExistingBracket().then((hasExistingBracket) => {
				if (!hasExistingBracket) {
					setShowStepModal(true);
				}
			});
		}
	}, [tournament, loading, error, user]);

	const fetchTournament = async () => {
		try {
			setLoading(true);

			// Mock data
			const mockTournament = {
				id: 'ncaa-2025',
				name: 'Proper March Madness 2025',
				submissionDeadline: new Date(2025, 3, 22, 12).toISOString(),
				teams: dummyTeams,
				rounds: generateAllRoundsGames(dummyTeams), // Changed from generateInitialBracket
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

			// Generate all games per round
			const games = generateAllRoundsGames(dummyTeams);
			setGamesByRound(games);

			setLoading(false);
		} catch (err) {
			console.error('Error fetching tournament data:', err);
			setError(
				'Failed to load tournament data: ' +
					(err.message || 'Unknown error')
			);
			setLoading(false);
		}
	};

	// Add this after your fetchTournament function
	const checkForExistingBracket = async () => {
		if (!user || !user.uid) return false;

		try {
			// Query for existing brackets for this user and tournament
			const bracketsRef = collection(db, 'brackets');
			const q = query(
				bracketsRef,
				where('userId', '==', user.uid),
				where('tournamentId', '==', tournament.id),
				orderBy('createdAt', 'desc'),
				limit(1)
			);

			const querySnapshot = await getDocs(q);

			if (!querySnapshot.empty) {
				// User has an existing bracket
				const bracketData = querySnapshot.docs[0].data();
				const { bracketId } = useUserBracket()

				// Provide clear options for the user
				const userChoice = confirm(
					`You already have a bracket named "${bracketData.name}" for this tournament. \n\n` +
						`• Click "OK" to VIEW your existing bracket\n` +
						`• Click "Cancel" to CREATE A NEW bracket (this will replace your existing one)`
				);

				if (userChoice) {
					// User wants to view their existing bracket
					router.push(`/brackets/view/bracketview/${bracketId}`);
					return true;
				} else {
					// User wants to create a new one (will replace existing)
					// Just return false so they can continue with creation
					const confirmReplace = confirm(
						`Creating a new bracket will REPLACE your existing bracket. Are you sure?`
					);

					if (!confirmReplace) {
						// User changed their mind
						router.push(`/brackets/view/${bracketId}`);
						return true;
					}
				}
			}

			return false;
		} catch (err) {
			console.error('Error checking for existing brackets:', err);
			return false;
		}
	};

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
						gameId, // Ensure this is unique
						teamA: teamA.team,
						teamB: teamB.team,
						userSelectedWinner: '',
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
				rounds[round].push({
					gameId: gameId++, // Ensure this is unique
					teamA: '',
					teamB: '',
					userSelectedWinner: '',
					round,
					// Add region if appropriate (rounds 2-4)
					region:
						round <= 4
							? regions[Math.floor(i / (numGames / 4))]
							: undefined,
				});
			}
		}

		return rounds;
	}

	// Get team details (seed, record) for a team
	const getTeamDetails = (teamName) => {
		const team = tournament?.teams.find((t) => t.team === teamName);
		return team
			? {
					seed: team.seed,
					record: team.record,
					region: team.region,
			  }
			: {};
	};

	// Add these functions below your existing getTeamDetails function:
	const prepareDataForBracketView = () => {
		// Create a flat array of all games with proper structure
		const allGames = [];

		// Add games from each round to the allGames array
		Object.keys(gamesByRound).forEach((roundNum) => {
			const round = parseInt(roundNum);
			const games = gamesByRound[round].filter(
				(game) => game && game.gameId !== undefined
			);

			games.forEach((game) => {
				allGames.push({
					id: game.gameId,
					round: round,
					region: game.region || '',
					teamA: game.teamA || '',
					teamB: game.teamB || '',
					winner: bracketSelections[round][game.gameId] || '',
				});
			});
		});

		return allGames;
	};

	// Handle game click from BracketViewContainer
	const handleBracketGameClick = (gameId, round, region) => {
		const game = gamesByRound[round].find((g) => g.gameId === gameId);

		if (game) {
			// Show selection modal
			setCurrentStep(round);
			setShowStepModal(true);

			// Optional: scroll to or highlight the specific game
			// You could add a selectedGameId state variable to track this
		}
	};

	// Replace your handleSelectWinner function with this improved version
	const handleSelectWinner = (gameId, round, winner) => {
		// For debugging
		console.log(
			`Selecting winner ${winner} for game ${gameId} in round ${round}`
		);

		// Update the selection for this game
		setBracketSelections((prev) => ({
			...prev,
			[round]: {
				...prev[round],
				[gameId]: winner,
			},
		}));

		// Update the next round's corresponding game with this winner
		if (round < 6) {
			const nextRound = round + 1;

			// Use this improved algorithm to find the correct next game
			let nextGameId;
			let isTeamASlot;

			// Calculate next game ID based on the current round and game ID
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

			console.log(
				`This should feed into game ${nextGameId} as ${
					isTeamASlot ? 'team A' : 'team B'
				}`
			);

			// Find the next game by ID instead of by index
			const nextGameIndex = gamesByRound[nextRound].findIndex(
				(g) => g.gameId === nextGameId
			);

			if (nextGameIndex !== -1) {
				setGamesByRound((prev) => {
					const updatedGames = { ...prev };
					const gameToUpdate = {
						...updatedGames[nextRound][nextGameIndex],
					};

					if (isTeamASlot) {
						gameToUpdate.teamA = winner;
					} else {
						gameToUpdate.teamB = winner;
					}

					updatedGames[nextRound][nextGameIndex] = gameToUpdate;
					return updatedGames;
				});
			} else {
				console.error(
					`Could not find game with ID ${nextGameId} in round ${nextRound}`
				);
			}
		}
	};
	// Calculate completion percentages for each round
	const getRoundCompletion = (round) => {
		const games = gamesByRound[round] || [];

		// Only count games that can be played (have both teams)
		const playableGames = games.filter(
			(game) => game && game.teamA && game.teamB
		);
		const selections = Object.keys(bracketSelections[round] || {}).length;
		const total = playableGames.length;
		const percent = total ? Math.round((selections / total) * 100) : 0;

		return {
			completed: selections,
			total,
			percent,
		};
	};

	// Check if current round is complete and we can proceed
	const isCurrentRoundComplete = () => {
		const completion = getRoundCompletion(currentStep);
		return completion.completed === completion.total;
	};

	// Move to next step/round
	const handleNextStep = () => {
		if (currentStep < 6) {
			setCurrentStep((prev) => prev + 1);
		} else {
			// Final step - submission form
			setShowStepModal(false);
		}
	};

	// Move to previous step/round
	const handlePrevStep = () => {
		if (currentStep > 1) {
			setCurrentStep((prev) => prev - 1);
		}
	};

	// Handle bracket submission
	const handleSubmit = async () => {
		if (!bracketName.trim()) {
			alert('Please enter a bracket name');
			return;
		}

		if (!user || !user.uid) {
			// User must be logged in
			alert('You must be logged in to save a bracket');
			router.push('/login?redirect=/brackets/create');
			return;
		}

		setIsSubmitting(true);
		try {
			// Check if user already has a bracket for this tournament
			const bracketsRef = collection(db, 'brackets');
			const q = query(
				bracketsRef,
				where('userId', '==', user.uid),
				where('tournamentId', '==', tournament.id)
			);

			const existingBrackets = await getDocs(q);

			if (!existingBrackets.empty) {
				// User already has a bracket for this tournament
				if (
					confirm(
						'You already have a bracket for this tournament. Submitting a new one will replace your existing bracket. Continue?'
					)
				) {
					// Delete the existing bracket
					const existingBracketId = existingBrackets.docs[0].id;
					await deleteDoc(doc(db, 'brackets', existingBracketId));
					console.log(
						`Deleted existing bracket ${existingBracketId}`
					);
				} else {
					// User canceled submission
					setIsSubmitting(false);
					return;
				}
			}

			// Continue with your existing code to clean selections and submit the bracket
			// Clean up selections - remove any undefined values
			const cleanSelections = {};
			Object.keys(bracketSelections).forEach((round) => {
				cleanSelections[round] = {};

				// Only include defined values
				Object.entries(bracketSelections[round]).forEach(
					([gameId, winner]) => {
						if (winner !== undefined && winner !== null) {
							cleanSelections[round][gameId] = winner;
						}
					}
				);
			});

			// Clean up gamesByRound - handle any undefined values
			const cleanRounds = {};
			Object.keys(gamesByRound).forEach((round) => {
				cleanRounds[round] = gamesByRound[round]
					.filter((game) => game !== undefined && game !== null)
					.map((game) => {
						// Create a clean game object without undefined values
						const cleanGame = {};
						Object.entries(game).forEach(([key, value]) => {
							if (value !== undefined && value !== null) {
								cleanGame[key] = value;
							} else if (
								key === 'teamA' ||
								key === 'teamB' ||
								key === 'userSelectedWinner'
							) {
								// Replace undefined/null for these fields with empty string
								cleanGame[key] = '';
							}
						});
						return cleanGame;
					});
			});

			// Prepare the bracket data with cleaned values
			const bracketData = {
				name: bracketName,
				userId: user.uid,
				userName: user.displayName || 'Anonymous User',
				tournamentId: tournament.id,
				createdAt: serverTimestamp(),
				updatedAt: serverTimestamp(),
				selections: cleanSelections,
				rounds: cleanRounds,
				points: 0, // Initial score - will be updated as games are played
				maxPossible: 192, // Maximum possible points for a perfect bracket
				correctPicks: 0,
				totalPicks: 0, // Will be calculated when results are available
			};

			// Generate a unique ID for this bracket
			const bracketRef = doc(collection(db, 'brackets'));
			const bracketId = bracketRef.id;

			console.log('Saving bracket data...', {
				bracketId,
				dataSize: JSON.stringify(bracketData).length,
			});

			// Save the bracket to Firestore
			await setDoc(bracketRef, {
				...bracketData,
				id: bracketId,
			});

			console.log('Bracket saved with ID:', bracketId);

			// Show success message
			alert('Your bracket has been saved successfully!');

			// Redirect to the bracket view page
			router.push(`/brackets/view/${bracketId}`);
		} catch (err) {
			console.error('Error submitting bracket:', err);
			setError(
				`Failed to submit bracket: ${err.message || 'Unknown error'}`
			);
		} finally {
			setIsSubmitting(false);
		}
	};
	// Replace the renderStepContent function with this improved version

	const renderStepContent = () => {
		if (currentStep <= 6) {
			// Round selection steps
			const roundData = roundInfo[currentStep - 1];
			const games = gamesByRound[currentStep] || [];
			const completion = getRoundCompletion(currentStep);

			return (
				<div>
					<h3 className='text-base sm:text-lg font-bold mb-2 sm:mb-4 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2'>
						<span>
							Round {currentStep}: {roundData.name}
						</span>
						<span className='text-xs sm:text-sm font-normal text-base-content/70'>
							({completion.completed}/{completion.total}{' '}
							selections made)
						</span>
					</h3>

					{/* Overflow container with better mobile handling */}
					<div className='max-h-[50vh] sm:max-h-[60vh] overflow-y-auto p-1 sm:p-2 -mx-2 sm:mx-0'>
						<div className='grid grid-cols-1 gap-2 sm:gap-4'>
							{games
								.filter(
									(game) => game && game.gameId !== undefined
								)
								.map((game) => (
									<SelectWinner
										key={`game-${game.gameId}-round-${currentStep}`}
										game={{
											gameId: game.gameId,
											teamA: game.teamA,
											teamB: game.teamB,
											userSelectedWinner:
												bracketSelections[currentStep][
													game.gameId
												] || '',
										}}
										teamADetails={getTeamDetails(
											game.teamA
										)}
										teamBDetails={getTeamDetails(
											game.teamB
										)}
										onSelectWinner={(gameId, winner) =>
											handleSelectWinner(
												gameId,
												currentStep,
												winner
											)
										}
										disabled={!game.teamA || !game.teamB}
									/>
								))}
						</div>
					</div>

					{/* Improved mobile-friendly action buttons */}
					<div className='modal-action mt-4 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:justify-between'>
						{/* Round navigation buttons - show as pills on mobile */}
						<div className='order-2 sm:order-none self-center'>
							<div className='join join-vertical sm:join-horizontal'>
								{roundInfo.map((round) => (
									<button
										key={round.number}
										className={`join-item btn btn-xs sm:btn-sm ${
											currentStep === round.number
												? 'btn-active'
												: ''
										}`}
										onClick={() =>
											setCurrentStep(round.number)
										}
									>
										<span className='hidden sm:inline'>
											{round.number}
										</span>
										<span className='sm:hidden'>
											R{round.number}
										</span>
									</button>
								))}
							</div>
						</div>

						{/* Prev/Next buttons - full width on mobile */}
						<div className='order-3 sm:order-none grid grid-cols-2 sm:flex gap-2 w-full sm:w-auto'>
							<button
								className='btn btn-outline btn-sm'
								onClick={handlePrevStep}
								disabled={currentStep === 1}
							>
								<span className='hidden sm:inline'>
									Previous Round
								</span>
								<span className='sm:hidden'>Prev</span>
							</button>

							<button
								className='btn btn-primary btn-sm'
								onClick={handleNextStep}
								disabled={!isCurrentRoundComplete()}
							>
								{currentStep < 6 ? (
									<>
										<span className='hidden sm:inline'>
											Next Round
										</span>
										<span className='sm:hidden'>Next</span>
									</>
								) : (
									<>
										<span className='hidden sm:inline'>
											Finish & Submit
										</span>
										<span className='sm:hidden'>
											Finish
										</span>
									</>
								)}
							</button>
						</div>

						{/* Completion indicator - top on mobile */}
						<div className='order-1 sm:order-none self-center'>
							<div className='badge badge-primary p-3'>
								{completion.percent}% Complete
							</div>
						</div>
					</div>
				</div>
			);
		}
	};

	if (loading) {
		return (
			<CreateBracketContainer title='Loading Tournament...'>
				<div className='flex justify-center p-12'>
					<div className='loading loading-spinner loading-lg'></div>
				</div>
			</CreateBracketContainer>
		);
	}

	if (error) {
		return (
			<CreateBracketContainer title='Error'>
				<div className='alert alert-error'>
					<svg
						xmlns='http://www.w3.org/2000/svg'
						className='stroke-current shrink-0 h-6 w-6'
						fill='none'
						viewBox='0 0 24 24' // Fixed viewBox attribute
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
			</CreateBracketContainer>
		);
	}

	// Is the submission deadline passed?
	const isDeadlinePassed =
		new Date() > new Date(tournament.submissionDeadline);

	return (
		<CreateBracketContainer title='Create Tournament Bracket'>
			{isDeadlinePassed ? (
				<div className='alert alert-warning mb-6'>
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
						The submission deadline has passed. You can view
						brackets but not create new ones.
					</span>
				</div>
			) : (
				<>
					<div className='alert alert-info mb-6'>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							fill='none'
							viewBox='0 0 24 24'
							className='stroke-current shrink-0 w-6 h-6'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth='2'
								d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
							></path>
						</svg>
						<div>
							<span className='font-bold'>Important:</span> Each
							user may submit only one bracket per tournament.
							Creating a new bracket will replace any existing
							one.
							<div className='text-sm mt-1'>
								Deadline:{' '}
								{new Date(
									tournament.submissionDeadline
								).toLocaleString()}
							</div>
						</div>
					</div>
					<div className='alert alert-info mb-6'>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							fill='none'
							viewBox='0 0 24 24'
							className='stroke-current shrink-0 w-6 h-6'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth='2'
								d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
							></path>
						</svg>
						<span>
							Complete your bracket by selecting winners for each
							round. Submission deadline:{' '}
							{new Date(
								tournament.submissionDeadline
							).toLocaleString()}
						</span>
					</div>
					{/* Progress overview */}
					<div className='mb-8'>
						<h3 className='text-lg font-bold mb-4'>
							Bracket Progress
						</h3>
						<div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2'>
							{roundInfo.map((round) => {
								const completion = getRoundCompletion(
									round.number
								);
								return (
									<div
										key={round.number}
										className='card bg-base-100 shadow-sm cursor-pointer hover:shadow-md transition-shadow'
										onClick={() => {
											setCurrentStep(round.number);
											setShowStepModal(true);
										}}
									>
										<div className='card-body p-3 text-center'>
											<h4 className='text-xs sm:text-sm font-bold'>
												{round.name}
											</h4>
											<div
												className='radial-progress text-primary mx-auto my-1'
												style={{
													'--value':
														completion.percent,
													'--size': '2.5rem',
													'--thickness': '3px',
												}}
											>
												<span className='text-xs'>
													{completion.percent}%
												</span>
											</div>
											<p className='text-xs mt-1'>
												{completion.completed}/
												{completion.total}
											</p>
										</div>
									</div>
								);
							})}
						</div>
					</div>
					{/* NCAA Tournament Bracket Preview */}
					<div className='mb-8'>
						<h3 className='text-lg font-bold mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2'>
							<span>Bracket Preview</span>
							<button
								className='btn btn-primary btn-sm'
								onClick={() => setShowStepModal(true)}
							>
								Continue Building
							</button>
						</h3>

						<div className='alert alert-info mb-4 text-xs sm:text-sm'>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								fill='none'
								viewBox='0 0 24 24'
								className='stroke-current shrink-0 w-4 h-4 sm:w-6 sm:h-6'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth='2'
									d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
								></path>
							</svg>
							<span>
								Scroll horizontally to view the entire bracket.
								Tap on games to make selections.
							</span>
						</div>

						<div className='overflow-x-auto border border-base-300 rounded-lg'>
							<div className='min-w-[1000px] md:min-w-[1200px] p-4'>
								<BracketViewContainer
									games={prepareDataForBracketView()}
									teams={tournament?.teams || []}
									bracketSelections={bracketSelections}
									onGameClick={handleBracketGameClick}
									isReadOnly={false}
								/>
							</div>
						</div>
					</div>
					// Replace the naming and submission section with this
					{/* Naming and submission */}
					<div className='card bg-base-100 shadow-md p-4 sm:p-6 mt-8'>
						<h3 className='text-lg font-bold mb-4'>
							Name Your Bracket
						</h3>
						<div className='form-control w-full'>
							<label className='label'>
								<span className='label-text'>
									Give your bracket a memorable name
								</span>
							</label>
							<input
								type='text'
								placeholder='My Winning Bracket 2025'
								className='input input-bordered w-full'
								value={bracketName}
								onChange={(e) => setBracketName(e.target.value)}
								required
							/>
						</div>

						<div className='mt-6'>
							<div className='flex flex-col sm:flex-row gap-4 sm:justify-between items-center'>
								<div className='w-full sm:w-auto order-2 sm:order-1'>
									<button
										className='btn btn-outline w-full sm:w-auto'
										onClick={() => setShowStepModal(true)}
									>
										Back to Editing
									</button>
								</div>

								<div className='w-full sm:w-auto order-1 sm:order-2'>
									<button
										className='btn btn-primary w-full sm:w-auto'
										onClick={handleSubmit}
										disabled={
											isSubmitting || !bracketName.trim()
										}
									>
										{isSubmitting ? (
											<>
												<span className='loading loading-spinner loading-sm mr-2'></span>
												Submitting...
											</>
										) : (
											'Submit Bracket'
										)}
									</button>
								</div>
							</div>
						</div>
					</div>
					{/* Modal for step-by-step bracket building */}
					<dialog
						className={`modal ${showStepModal ? 'modal-open' : ''}`}
					>
						<div className='modal-box w-11/12 max-w-4xl p-4 sm:p-6'>
							<h2 className='text-xl font-bold mb-2'>
								{tournament.name} - Build Your Bracket
							</h2>
							<div className='divider my-2'></div>

							{renderStepContent()}

							<button
								className='btn btn-sm btn-circle absolute right-2 top-2'
								onClick={() => setShowStepModal(false)}
							>
								✕
							</button>
						</div>
						{/* Add backdrop click handler */}
						<form
							method='dialog'
							className='modal-backdrop'
						>
							<button onClick={() => setShowStepModal(false)}>
								close
							</button>
						</form>
					</dialog>
				</>
			)}
		</CreateBracketContainer>
	);
}
