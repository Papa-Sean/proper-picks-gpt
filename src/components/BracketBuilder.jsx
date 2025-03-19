'use client';

import { useState, useEffect, useMemo } from 'react';
import TournamentRoundContainer from '@/components/TournamentRoundContainer';
import SelectWinner from '@/components/SelectWinner';

/**
 * BracketBuilder - A component for building and displaying tournament brackets
 */
export default function BracketBuilder({
	initialRounds = {},
	teamsData = [],
	onBracketUpdate,
	isReadOnly = false,
	showActualResults = false,
}) {
	// State for all bracket rounds (1-6 for NCAA tournament)
	const [rounds, setRounds] = useState(() => {
		// Initialize with provided rounds or generate empty structure
		if (Object.keys(initialRounds).length) {
			return initialRounds;
		}

		// Generate first round games from teamsData (64 teams = 32 games)
		return generateInitialRounds(teamsData);
	});

	const [activeRound, setActiveRound] = useState(1);
	const [allTeams, setAllTeams] = useState(teamsData);

	// Effect to notify parent component of bracket updates
	useEffect(() => {
		if (onBracketUpdate) {
			onBracketUpdate(rounds);
		}
	}, [rounds, onBracketUpdate]);

	// Generate NCAA tournament structure with all rounds
	function generateInitialRounds(teams) {
		const initialRounds = {};

		// First round - 32 games (64 teams)
		initialRounds[1] = [];

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

		// For each region
		regions.forEach((region) => {
			// For each seed matchup
			seedMatchups.forEach(([seedA, seedB]) => {
				const teamA = teams.find(
					(t) => t.region === region && t.seed === seedA
				);
				const teamB = teams.find(
					(t) => t.region === region && t.seed === seedB
				);

				if (teamA && teamB) {
					initialRounds[1].push({
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
			initialRounds[round] = [];

			// Calculate number of games in this round
			const numGames = 32 / Math.pow(2, round - 1);

			for (let i = 0; i < numGames; i++) {
				initialRounds[round].push({
					gameId: gameId++,
					teamA: '', // Will be populated when previous round has winners
					teamB: '', // Will be populated when previous round has winners
					userSelectedWinner: '',
					round,
				});
			}
		}

		return initialRounds;
	}

	// Propagate winner selections to next round
	const handleWinnerSelected = (gameId, round, winner) => {
		if (isReadOnly) return;

		// Update the current game with the selected winner
		const updatedRounds = { ...rounds };
		const currentRoundGames = updatedRounds[round];
		const gameIndex = currentRoundGames.findIndex(
			(g) => g.gameId === gameId
		);

		if (gameIndex === -1) return;

		// Update the winner for this game
		updatedRounds[round][gameIndex] = {
			...updatedRounds[round][gameIndex],
			userSelectedWinner: winner,
		};

		// Propagate to next round
		if (round < 6) {
			// Max 6 rounds in NCAA tournament
			const nextRound = round + 1;

			// The key issue is here - we need to calculate which game in the next round
			// should receive this winner based on the gameId, not the array index

			// Calculate which game in the next round will receive this winner
			// Game IDs are sequential, so we can determine the next-round game
			// For round 1 (games 1-32) feed into round 2 (games 33-48)
			// For round 2 (games 33-48) feed into round 3 (games 49-56)
			// and so on...

			let nextRoundGameId;
			let isTeamA;

			if (round === 1) {
				// Round 1: Games 1-32 feed into round 2 (games 33-48)
				nextRoundGameId = 32 + Math.ceil(gameId / 2);
				isTeamA = gameId % 2 === 1; // Odd games feed into teamA slot
			} else if (round === 2) {
				// Round 2: Games 33-48 feed into round 3 (games 49-56)
				nextRoundGameId = 48 + Math.ceil((gameId - 32) / 2);
				isTeamA = (gameId - 32) % 2 === 1;
			} else if (round === 3) {
				// Round 3: Games 49-56 feed into round 4 (games 57-60)
				nextRoundGameId = 56 + Math.ceil((gameId - 48) / 2);
				isTeamA = (gameId - 48) % 2 === 1;
			} else if (round === 4) {
				// Round 4: Games 57-60 feed into round 5 (games 61-62)
				nextRoundGameId = 60 + Math.ceil((gameId - 56) / 2);
				isTeamA = (gameId - 56) % 2 === 1;
			} else if (round === 5) {
				// Round 5: Games 61-62 feed into round 6 (game 63)
				nextRoundGameId = 63;
				isTeamA = gameId === 61; // Game 61 feeds into teamA slot, Game 62 feeds into teamB slot
			}

			// Find the game in the next round by ID
			const nextRoundGameIndex = updatedRounds[nextRound].findIndex(
				(g) => g.gameId === nextRoundGameId
			);

			if (nextRoundGameIndex !== -1) {
				const nextGame = updatedRounds[nextRound][nextRoundGameIndex];

				// Update teamA or teamB in the next round game
				if (isTeamA) {
					updatedRounds[nextRound][nextRoundGameIndex] = {
						...nextGame,
						teamA: winner,
						// Clear winner selection if team changes
						userSelectedWinner:
							nextGame.userSelectedWinner === nextGame.teamA
								? ''
								: nextGame.userSelectedWinner,
					};
				} else {
					updatedRounds[nextRound][nextRoundGameIndex] = {
						...nextGame,
						teamB: winner,
						// Clear winner selection if team changes
						userSelectedWinner:
							nextGame.userSelectedWinner === nextGame.teamB
								? ''
								: nextGame.userSelectedWinner,
					};
				}
			}
		}

		setRounds(updatedRounds);
	};

	// Round names for NCAA tournament
	const roundNames = [
		'First Round', // Round 1
		'Second Round', // Round 2
		'Sweet 16', // Round 3
		'Elite Eight', // Round 4
		'Final Four', // Round 5
		'Championship', // Round 6
	];

	// Calculate completion status for each round
	const roundCompletion = useMemo(() => {
		const completion = {};
		for (let r = 1; r <= 6; r++) {
			const roundGames = rounds[r] || [];
			const filledGames = roundGames.filter(
				(game) => game.userSelectedWinner
			).length;
			completion[r] = {
				total: roundGames.length,
				filled: filledGames,
				percent: roundGames.length
					? Math.round((filledGames / roundGames.length) * 100)
					: 0,
			};
		}
		return completion;
	}, [rounds]);

	// Transform games data for TournamentRoundContainer
	const transformGamesForDisplay = (round) => {
		return (rounds[round] || []).map((game) => ({
			gameNumber: game.gameId,
			team1: game.teamA,
			team2: game.teamB,
			winner: game.userSelectedWinner,
			actualWinner: showActualResults ? game.actualWinner : undefined,
		}));
	};

	// Get team details for SelectWinner component
	const getTeamDetails = (teamName) => {
		const team = allTeams.find((t) => t.team === teamName);
		return team
			? { seed: team.seed, record: team.record, region: team.region }
			: {};
	};

	return (
		<div className='space-y-6'>
			{/* Round navigation */}
			<div className='tabs tabs-boxed justify-center'>
				{roundNames.map((name, index) => (
					<button
						key={name}
						onClick={() => setActiveRound(index + 1)}
						className={`tab ${
							activeRound === index + 1 ? 'tab-active' : ''
						} relative`}
						disabled={
							isReadOnly &&
							!rounds[index + 1]?.some((g) => g.teamA || g.teamB)
						}
					>
						{name}
						{roundCompletion[index + 1]?.total > 0 && (
							<span className='absolute -top-1 -right-1 badge badge-sm badge-primary'>
								{roundCompletion[index + 1]?.filled}/
								{roundCompletion[index + 1]?.total}
							</span>
						)}
					</button>
				))}
			</div>

			{/* Round display - use when viewing a full bracket */}
			<div className='hidden md:grid grid-cols-6 gap-4'>
				{Object.keys(rounds).map((round) => (
					<div
						key={`round-${round}`}
						className={`${
							parseInt(round) === activeRound
								? 'ring-2 ring-primary rounded-lg'
								: ''
						}`}
					>
						<TournamentRoundContainer
							tournamentRound={roundNames[parseInt(round) - 1]}
							games={transformGamesForDisplay(parseInt(round))}
							teams={allTeams}
							isActive={parseInt(round) === activeRound}
						/>
					</div>
				))}
			</div>

			{/* Active round for mobile - shows only one round at a time */}
			<div className='md:hidden'>
				<TournamentRoundContainer
					tournamentRound={roundNames[activeRound - 1]}
					games={transformGamesForDisplay(activeRound)}
					teams={allTeams}
					isActive={true}
				/>
			</div>

			{/* Selection interface */}
			{!isReadOnly && (
				<div className='mt-10'>
					<h3 className='text-lg font-bold mb-4'>
						Make Your Selections
					</h3>
					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
						{rounds[activeRound]?.map((game) => {
							// Only show games where both teams are available
							if (!game.teamA && !game.teamB) return null;
							if (!game.teamA || !game.teamB) {
								return (
									<div
										key={game.gameId}
										className='card bg-base-100 shadow-sm border border-base-300'
									>
										<div className='card-body p-4'>
											<h3 className='text-sm font-semibold text-center mb-3'>
												Game {game.gameId}
											</h3>
											<div className='text-center text-base-content opacity-70'>
												Waiting for prior round
												results...
											</div>
										</div>
									</div>
								);
							}

							return (
								<SelectWinner
									key={`game-${game.gameId}-round-${activeRound}`} // Make sure the key is unique
									game={{
										gameId: game.gameId,
										teamA: game.teamA,
										teamB: game.teamB,
										userSelectedWinner:
											rounds[activeRound][game.gameId] ||
											'',
									}}
									teamADetails={getTeamDetails(game.teamA)}
									teamBDetails={getTeamDetails(game.teamB)}
									onSelectWinner={(gameId, winner) =>
										handleWinnerSelected(
											gameId,
											activeRound,
											winner
										)
									}
									disabled={!game.teamA || !game.teamB}
								/>
							);
						})}
					</div>

					{/* Progress guidance */}
					{activeRound < 6 &&
						roundCompletion[activeRound]?.percent === 100 && (
							<div className='alert alert-success mt-4'>
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
										d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
									/>
								</svg>
								<div>
									<h3 className='font-bold'>
										Round Complete!
									</h3>
									<div className='text-sm'>
										You can now proceed to the next round.
									</div>
								</div>
								<button
									className='btn btn-sm btn-primary'
									onClick={() =>
										setActiveRound(activeRound + 1)
									}
								>
									Next Round →
								</button>
							</div>
						)}
				</div>
			)}
		</div>
	);
}
