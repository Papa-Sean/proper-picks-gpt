'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import CreateBracketContainer from '@/components/CreateBracketContainer';
import BracketViewContainer from '@/components/bracket/BracketViewContainer';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';

export default function BracketViewPage() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const { user } = useAuth();
	const [bracket, setBracket] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [tournamentData, setTournamentData] = useState(null);
	const [viewMode, setViewMode] = useState('desktop'); // 'desktop' or 'mobile'

	useEffect(() => {
		// Determine initial view mode based on screen width
		const handleResize = () => {
			setViewMode(window.innerWidth < 768 ? 'mobile' : 'desktop');
		};

		// Set initial value
		handleResize();

		// Add event listener
		window.addEventListener('resize', handleResize);

		// Clean up
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	useEffect(() => {
		async function loadBracket() {
			try {
				setLoading(true);
				// Get bracket ID from query parameter
				const bracketId = searchParams.get('id');

				if (!bracketId) {
					setError('No bracket ID provided');
					setLoading(false);
					return;
				}

				// Fetch directly from Firestore
				const bracketRef = doc(db, 'brackets', bracketId);
				const bracketDoc = await getDoc(bracketRef);

				if (!bracketDoc.exists()) {
					setError('Bracket not found');
				} else {
					setBracket({
						id: bracketDoc.id,
						...bracketDoc.data(),
					});
				}
			} catch (err) {
				console.error('Error loading bracket:', err);
				setError(`Error loading bracket: ${err.message}`);
			} finally {
				setLoading(false);
			}
		}

		loadBracket();
	}, [searchParams]);

	// Fetch tournament data for actual results
	useEffect(() => {
		const fetchTournamentData = async () => {
			try {
				const tournamentRef = doc(db, 'tournaments', 'ncaa-2025');
				const tournamentDoc = await getDoc(tournamentRef);

				if (tournamentDoc.exists()) {
					setTournamentData(tournamentDoc.data());
				}
			} catch (err) {
				console.error('Error fetching tournament data:', err);
			}
		};

		fetchTournamentData();
	}, []);

	// Process actual results from tournament data
	const processActualResults = (tournamentData) => {
		if (!tournamentData?.rounds) return {};

		const results = {};

		Object.entries(tournamentData.rounds).forEach(([roundNum, games]) => {
			const round = parseInt(roundNum);
			results[round] = {};

			games.forEach((game) => {
				if (game.gameId && game.actualWinner) {
					results[round][game.gameId] = game.actualWinner;
				}
			});
		});

		return results;
	};

	// Process actual results when tournament data is loaded
	const actualResults = useMemo(() => {
		return tournamentData ? processActualResults(tournamentData) : {};
	}, [tournamentData]);

	// Loading state with better mobile appearance
	if (loading) {
		return (
			<CreateBracketContainer title='Loading Bracket...'>
				<div className='flex flex-col justify-center items-center h-64 p-4'>
					<div className='loading loading-spinner loading-lg text-secondary'></div>
					<p className='mt-4 text-base-content/70 text-center'>
						Please wait while we load your bracket...
					</p>
				</div>
			</CreateBracketContainer>
		);
	}

	// Error state with better mobile appearance
	if (error || !bracket) {
		return (
			<CreateBracketContainer title='Bracket Not Found'>
				<div className='p-4 flex flex-col'>
					<div className='alert alert-warning shadow-md'>
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
								d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
							/>
						</svg>
						<span>
							{error ||
								'This bracket does not exist or has been deleted.'}
						</span>
					</div>
					<div className='mt-6 flex justify-center'>
						<Link
							href='/brackets/leaderboard'
							className='btn btn-secondary btn-md'
						>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								className='h-5 w-5 mr-2'
								fill='none'
								viewBox='0 0 24 24'
								stroke='currentColor'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M10 19l-7-7m0 0l7-7m-7 7h18'
								/>
							</svg>
							Back to Leaderboard
						</Link>
					</div>
				</div>
			</CreateBracketContainer>
		);
	}

	// Only define this once the bracket is loaded
	const isOwnBracket = user && bracket.userId === user.uid;

	// Calculate bracket stats - Fix the totalPicks calculation
	const bracketStats = {
		// Count actual number of selections across all rounds
		totalPicks: 0,
		correctPicks: 0,
		score: 0,
	};

	// Calculate correct picks and count totalPicks properly
	if (bracket.selections && actualResults) {
		// First calculate the total number of picks across all rounds
		Object.values(bracket.selections).forEach((roundSelections) => {
			bracketStats.totalPicks += Object.keys(roundSelections).length;
		});

		// Then calculate correct picks and score
		Object.entries(bracket.selections).forEach(([round, games]) => {
			const roundNum = parseInt(round);
			Object.entries(games).forEach(([gameId, pick]) => {
				const actualWinner = actualResults[roundNum]?.[gameId];
				if (actualWinner && actualWinner === pick) {
					bracketStats.correctPicks++;
					// Calculate score based on round
					const roundPoints = [1, 2, 4, 8, 16, 32];
					bracketStats.score += roundPoints[roundNum - 1] || 0;
				}
			});
		});
	}

	return (
		<CreateBracketContainer title={bracket.name}>
			{/* Header with responsive design */}
			<div className='mb-4 md:mb-6 px-2 md:px-0'>
				{/* Mobile view header */}
				<div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4'>
					<div>
						<h2 className='text-xl md:text-2xl font-bold truncate'>
							{bracket.name}
						</h2>
						<p className='text-sm md:text-base text-base-content/70 mt-1'>
							Created by: {bracket.userName || 'Anonymous User'}
						</p>
						{isOwnBracket && (
							<div className='badge badge-secondary my-2'>
								Your Bracket
							</div>
						)}
					</div>

					<div className='flex gap-2 self-start'>
						<Link
							href='/brackets/leaderboard'
							className='btn btn-outline btn-sm'
						>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								className='h-4 w-4 mr-1'
								fill='none'
								viewBox='0 0 24 24'
								stroke='currentColor'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M10 19l-7-7m0 0l7-7m-7 7h18'
								/>
							</svg>
							Back
						</Link>

						<button
							className='btn btn-sm btn-ghost md:hidden'
							onClick={() =>
								setViewMode(
									viewMode === 'desktop'
										? 'mobile'
										: 'desktop'
								)
							}
						>
							{viewMode === 'desktop' ? (
								<svg
									xmlns='http://www.w3.org/2000/svg'
									className='h-5 w-5'
									fill='none'
									viewBox='0 0 24 24'
									stroke='currentColor'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z'
									/>
								</svg>
							) : (
								<svg
									xmlns='http://www.w3.org/2000/svg'
									className='h-5 w-5'
									fill='none'
									viewBox='0 0 24 24'
									stroke='currentColor'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
									/>
								</svg>
							)}
						</button>
					</div>
				</div>

				{/* Bracket stats card */}
				<div className='stats stats-vertical md:stats-horizontal shadow mt-4 w-full'>
					<div className='stat'>
						<div className='stat-title'>Score</div>
						<div className='stat-value text-secondary'>
							{bracketStats.score}
						</div>
						<div className='stat-desc'>Points earned</div>
					</div>

					<div className='stat'>
						<div className='stat-title'>Accuracy</div>
						<div className='stat-value'>
							{bracketStats.totalPicks
								? Math.round(
										(bracketStats.correctPicks /
											bracketStats.totalPicks) *
											100
								  )
								: 0}
							%
						</div>
						<div className='stat-desc'>
							{bracketStats.correctPicks} correct out of{' '}
							{bracketStats.totalPicks}
						</div>
					</div>

					{tournamentData?.currentRound && (
						<div className='stat'>
							<div className='stat-title'>Current Round</div>
							<div className='stat-value'>
								{tournamentData.currentRound}
							</div>
							<div className='stat-desc'>
								{tournamentData.roundNames?.[
									tournamentData.currentRound - 1
								] || ''}
							</div>
						</div>
					)}
				</div>
			</div>

			{/* View mode controls for mobile */}
			{viewMode === 'mobile' && (
				<div className='px-2 mb-4'>
					<div className='collapse collapse-arrow bg-base-200'>
						<input
							type='checkbox'
							defaultChecked
						/>
						<div className='collapse-title text-base font-medium'>
							Mobile Bracket View
						</div>
						<div className='collapse-content'>
							<p className='text-sm text-base-content/70 text-wrap mb-2'>
								The complete bracket has been simplified for
								mobile viewing. Swipe left/right to navigate.
							</p>

							<div className='tabs tabs-boxed'>
								{[1, 2, 3, 4, 5, 6].map((round) => (
									<a
										key={round}
										className={`btn btn-secondary mb-1 ${
											round === 1 ? 'btn-ghost text-secondary border border-secondary font-black' : ''
										}`}
										onClick={() =>
											document
												.getElementById(
													`round-${round}`
												)
												.scrollIntoView({
													behavior: 'smooth',
												})
										}
									>
										{round <= 4
											? `Round ${round}`
											: round === 5
											? 'Final 4'
											: 'Final'}
									</a>
								))}
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Bracket content with responsive wrapper */}
			<div
				className={
					viewMode === 'mobile' ? 'w-full px-0' : 'overflow-x-auto'
				}
			>
				{viewMode === 'mobile' ? (
					// Mobile optimized view - vertical stacking instead of traditional bracket layout
					<div className='w-full space-y-6'>
						{[1, 2, 3, 4, 5, 6].map((round) => (
							<div
								key={round}
								id={`round-${round}`}
								className='card bg-base-100 shadow-sm w-full'
							>
								<div className='card-body p-3 sm:p-4'>
									<h3 className='card-title text-sm sm:text-base font-bold'>
										{round <= 4
											? `Round ${round}`
											: round === 5
											? 'Final Four'
											: 'Championship'}
									</h3>
									<div className='divider my-1'></div>
									<div className='space-y-2'>
										{/* Filter games from this round and render them vertically */}
										{bracket.rounds &&
											Object.values(bracket.rounds)
												.flat()
												.filter(
													(game) =>
														game.round === round
												)
												.map((game) => (
													<div
														key={game.gameId}
														className={`border rounded-lg p-3 ${
															bracket
																.selections?.[
																round
															]?.[game.gameId] ===
															game.teamA
																? actualResults[
																		round
																  ]?.[
																		game
																			.gameId
																  ] ===
																  game.teamA
																	? 'bg-success/10 border-success'
																	: actualResults[
																			round
																	  ]?.[
																			game
																				.gameId
																	  ]
																	? 'bg-warning/10 border-warning'
																	: 'bg-secondary/10 border-secondary'
																: bracket
																		.selections?.[
																		round
																  ]?.[
																		game
																			.gameId
																  ] ===
																  game.teamB
																? actualResults[
																		round
																  ]?.[
																		game
																			.gameId
																  ] ===
																  game.teamB
																	? 'bg-success/10 border-success'
																	: actualResults[
																			round
																	  ]?.[
																			game
																				.gameId
																	  ]
																	? 'bg-warning/10 border-warning'
																	: 'bg-secondary/10 border-secondary'
																: 'border-base-300'
														}`}
													>
														<div className='flex justify-between items-center mb-2'>
															<span className='text-xs opacity-70'>
																Game{' '}
																{game.gameId}
															</span>
															{actualResults[
																round
															]?.[
																game.gameId
															] && (
																<div className='badge badge-sm badge-success'>
																	Winner
																</div>
															)}
														</div>

														<div className='grid grid-cols-2 gap-2'>
															<div
																className={`flex flex-col ${
																	bracket
																		.selections?.[
																		round
																	]?.[
																		game
																			.gameId
																	] ===
																	game.teamA
																		? actualResults[
																				round
																		  ]?.[
																				game
																					.gameId
																		  ] ===
																		  game.teamA
																			? 'text-success font-bold'
																			: actualResults[
																					round
																			  ]?.[
																					game
																						.gameId
																			  ]
																			? 'text-warning line-through'
																			: 'text-secondary'
																		: ''
																}`}
															>
																<div className='flex items-center gap-1'>
																	<div className='badge badge-sm'>
																		{bracket.teams?.find(
																			(
																				t
																			) =>
																				t.team ===
																				game.teamA
																		)
																			?.seed ||
																			'-'}
																	</div>
																	<span className='text-sm font-medium'>
																		{game.teamA ||
																			'TBD'}
																	</span>
																</div>
															</div>

															<div
																className={`flex flex-col ${
																	bracket
																		.selections?.[
																		round
																	]?.[
																		game
																			.gameId
																	] ===
																	game.teamB
																		? actualResults[
																				round
																		  ]?.[
																				game
																					.gameId
																		  ] ===
																		  game.teamB
																			? 'text-success font-bold'
																			: actualResults[
																					round
																			  ]?.[
																					game
																						.gameId
																			  ]
																			? 'text-warning line-through'
																			: 'text-secondary'
																		: ''
																}`}
															>
																<div className='flex items-center gap-1'>
																	<div className='badge badge-sm'>
																		{bracket.teams?.find(
																			(
																				t
																			) =>
																				t.team ===
																				game.teamB
																		)
																			?.seed ||
																			'-'}
																	</div>
																	<span className='text-sm font-medium'>
																		{game.teamB ||
																			'TBD'}
																	</span>
																</div>
															</div>
														</div>
													</div>
												))}
									</div>
								</div>
							</div>
						))}
					</div>
				) : (
					// Desktop traditional bracket view
					<BracketViewContainer
						games={
							bracket.rounds
								? Object.values(bracket.rounds).flat()
								: []
						}
						teams={bracket.teams || []}
						bracketSelections={bracket.selections || {}}
						actualResults={actualResults}
						isReadOnly={true}
						viewMode={viewMode}
					/>
				)}
			</div>

			{/* Legend explanation - hidden on very small screens, responsive on others */}
			<div className='mt-6 hidden sm:block'>
				<div className='divider text-xs text-base-content/50'>
					LEGEND
				</div>
				<div className='flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs mt-2'>
					<div className='flex items-center'>
						<div className='w-3 h-3 bg-success/20 border border-success mr-1'></div>
						<span>Correct Pick</span>
					</div>
					<div className='flex items-center'>
						<div className='w-3 h-3 bg-warning/20 border border-warning mr-1'></div>
						<span>Incorrect Pick</span>
					</div>
					<div className='flex items-center'>
						<div className='w-3 h-3 bg-secondary/20 border border-secondary mr-1'></div>
						<span>Your Selection</span>
					</div>
				</div>
			</div>
		</CreateBracketContainer>
	);
}
