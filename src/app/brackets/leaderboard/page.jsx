'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import CreateBracketContainer from '@/components/CreateBracketContainer';
import {
	doc,
	getDoc,
	collection,
	query,
	where,
	getDocs,
	onSnapshot,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { processActualResults, updateLeaderboardScores } from '@/utils/scoring';

// Import new components
import TournamentStatusHeader from '@/components/leaderboard/TournamentStatusHeader';
import LeaderboardControls from '@/components/leaderboard/LeaderboardControls';
import LeaderboardTable from '@/components/leaderboard/LeaderboardTable';
import RoundBreakdownTable from '@/components/leaderboard/RoundBreakdownTable';
import ScoringSystemCard from '@/components/leaderboard/ScoringSystemCard';
import EmptyLeaderboard from '@/components/leaderboard/EmptyLeaderboard';
import LoadingLeaderboard from '@/components/leaderboard/LoadingLeaderboard';

export default function LeaderboardPage() {
	const { user, isAdmin } = useAuth();
	const [leaderboard, setLeaderboard] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [refreshing, setRefreshing] = useState(false);
	const [tournamentInfo, setTournamentInfo] = useState({
		name: 'Proper Tournament 2025',
		currentRound: 1,
		roundNames: [
			'First Round',
			'Second Round',
			'Sweet 16',
			'Elite Eight',
			'Final Four',
			'Championship',
		],
		lastUpdated: null,
	});
	const [sortCriteria, setSortCriteria] = useState('points');

	// Add these new state variables at the top of the LeaderboardPage component
	const [comparisonBracketId, setComparisonBracketId] = useState('actual');
	const [comparisonData, setComparisonData] = useState(null);
	const [isComparingBrackets, setIsComparingBrackets] = useState(false);
	const [isLoadingComparison, setIsLoadingComparison] = useState(false);

	// Create a reusable fetch function that can be called for manual refresh
	const fetchLeaderboard = useCallback(async (showRefreshing = false) => {
		try {
			if (showRefreshing) {
				setRefreshing(true);
			} else {
				setLoading(true);
			}

			// First, get tournament info and actual results
			const tournamentId = 'ncaa-2025';
			const tournamentRef = doc(db, 'tournaments', tournamentId);
			const tournamentDoc = await getDoc(tournamentRef);

			// Get tournament info and current round
			let currentRound = 1;
			let actualResults = null;

			if (tournamentDoc.exists()) {
				const tournamentData = tournamentDoc.data();
				setTournamentInfo({
					name: tournamentData.name || 'NCAA Tournament 2025',
					currentRound: tournamentData.currentRound || 1,
					roundNames: tournamentData.roundNames || [
						'First Round',
						'Second Round',
						'Sweet 16',
						'Elite Eight',
						'Final Four',
						'Championship',
					],
					lastUpdated: tournamentData.lastUpdated?.toDate() || null,
				});
				currentRound = tournamentData.currentRound || 1;

				// Process actual results for scoring
				actualResults = processActualResults(tournamentData);

				// Fetch all brackets and apply scoring
				const bracketsRef = collection(db, 'brackets');
				const q = query(
					bracketsRef,
					where('tournamentId', '==', tournamentId)
				);

				const bracketsSnapshot = await getDocs(q);
				let brackets = [];

				if (!bracketsSnapshot.empty) {
					bracketsSnapshot.forEach((doc) => {
						const data = doc.data();
						brackets.push({
							userId: data.userId,
							userName: data.userName || 'Anonymous User',
							bracketName: data.name || 'Unnamed Bracket',
							bracketId: doc.id,
							tournamentId: data.tournamentId || 'unknown',
							selections: data.selections || {},
							rounds: data.rounds || {},
							points: data.points || 0,
							correctPicks: data.correctPicks || 0,
							totalPicks: data.totalPicks || 0,
							maxPossible: data.maxPossible || 192,
							roundScores: data.roundScores || [0, 0, 0, 0, 0, 0],
							createdAt: data.createdAt?.toDate() || new Date(),
							updatedAt: data.updatedAt?.toDate() || null,
						});
					});

					// Calculate scores for all brackets
					if (actualResults) {
						brackets = updateLeaderboardScores(
							brackets,
							actualResults,
							currentRound
						);
					}
				}

				setLeaderboard(brackets);
			}
		} catch (err) {
			console.error('Error fetching leaderboard data:', err);
			setError(
				`Failed to load leaderboard: ${err.message || 'Unknown error'}`
			);
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	}, []);

	// Add this function to fetch a bracket for comparison
	const fetchBracketForComparison = useCallback(async (bracketId) => {
		if (bracketId === 'actual') {
			setComparisonData(null);
			setIsComparingBrackets(false);
			fetchLeaderboard(true); // Refresh with actual results
			return;
		}

		try {
			setIsLoadingComparison(true);

			// Get the bracket to use as "correct" answers
			const bracketRef = doc(db, 'brackets', bracketId);
			const bracketDoc = await getDoc(bracketRef);

			if (!bracketDoc.exists()) {
				console.error('Comparison bracket not found');
				setComparisonBracketId('actual');
				setComparisonData(null);
				setIsComparingBrackets(false);
				return;
			}

			const bracketData = bracketDoc.data();

			// Transform selections into the format of actualResults
			const transformedSelections = {
				games: {},
				1: {},
				2: {},
				3: {},
				4: {},
				5: {},
				6: {},
			};

			// Process each round of selections
			Object.entries(bracketData.selections || {}).forEach(
				([round, games]) => {
					const roundNum = parseInt(round);
					transformedSelections[roundNum] = {};

					// Process each game selection
					Object.entries(games).forEach(([gameId, winner]) => {
						if (winner) {
							transformedSelections[roundNum][gameId] = winner;

							// Also add to games object for compatibility with scoring functions
							transformedSelections.games[gameId] = {
								gameId: parseInt(gameId),
								round: roundNum,
								winner: winner,
							};
						}
					});
				}
			);

			// Set comparison data and recalculate leaderboard
			setComparisonData({
				results: transformedSelections,
				bracketName: bracketData.name,
				userName: bracketData.userName,
			});
			setIsComparingBrackets(true);

			// Get all brackets again
			const tournamentId = 'ncaa-2025';
			const bracketsRef = collection(db, 'brackets');
			const q = query(
				bracketsRef,
				where('tournamentId', '==', tournamentId)
			);

			const bracketsSnapshot = await getDocs(q);
			let brackets = [];

			if (!bracketsSnapshot.empty) {
				bracketsSnapshot.forEach((doc) => {
					const data = doc.data();
					brackets.push({
						userId: data.userId,
						userName: data.userName || 'Anonymous User',
						bracketName: data.name || 'Unnamed Bracket',
						bracketId: doc.id,
						tournamentId: data.tournamentId || 'unknown',
						selections: data.selections || {},
						rounds: data.rounds || {},
						points: data.points || 0,
						correctPicks: data.correctPicks || 0,
						totalPicks: data.totalPicks || 0,
						maxPossible: data.maxPossible || 192,
						roundScores: data.roundScores || [0, 0, 0, 0, 0, 0],
						createdAt: data.createdAt?.toDate() || new Date(),
						updatedAt: data.updatedAt?.toDate() || null,
					});
				});

				// Score all brackets using the comparison bracket as "actual results"
				brackets = updateLeaderboardScores(
					brackets,
					transformedSelections,
					6 // Use all rounds for comparison
				);

				setLeaderboard(brackets);
			}
		} catch (err) {
			console.error('Error fetching bracket for comparison:', err);
			setComparisonBracketId('actual');
			setComparisonData(null);
			setIsComparingBrackets(false);
		} finally {
			setIsLoadingComparison(false);
		}
	}, []);

	// Add an effect to update when the comparison bracket changes
	useEffect(() => {
		if (comparisonBracketId) {
			fetchBracketForComparison(comparisonBracketId);
		}
	}, [comparisonBracketId, fetchBracketForComparison]);

	// Initial load
	useEffect(() => {
		fetchLeaderboard();

		// Optional: Set up a listener for tournament updates
		const tournamentRef = doc(db, 'tournaments', 'ncaa-2025');
		const unsubscribe = onSnapshot(
			tournamentRef,
			(doc) => {
				if (doc.exists() && doc.data().lastUpdated) {
					// Only refresh if the tournament was updated
					fetchLeaderboard(true);
				}
			},
			(error) => {
				console.error('Error listening to tournament updates:', error);
			}
		);

		return () => unsubscribe();
	}, [fetchLeaderboard]);

	const handleRefresh = () => {
		fetchLeaderboard(true);
	};

	const handleSortChange = (criteria) => {
		setSortCriteria(criteria);
	};

	const sortedLeaderboard = [...leaderboard].sort((a, b) => {
		if (sortCriteria === 'points') {
			return b.points - a.points;
		} else if (sortCriteria === 'correctPicks') {
			return b.correctPicks - a.correctPicks;
		} else if (sortCriteria === 'maxPossible') {
			return b.maxPossible - a.maxPossible;
		}
		return 0;
	});

	if (loading) {
		return (
			<CreateBracketContainer title='Loading Leaderboard...'>
				<LoadingLeaderboard />
			</CreateBracketContainer>
		);
	}

	if (error) {
		return (
			<CreateBracketContainer title='Leaderboard'>
				<div className='alert alert-error'>
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
							d='M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'
						/>
					</svg>
					<span>{error}</span>
				</div>
			</CreateBracketContainer>
		);
	}

	// Show message if no brackets found
	if (leaderboard.length === 0) {
		return (
			<CreateBracketContainer
				title={`${tournamentInfo.name} Leaderboard`}
			>
				<EmptyLeaderboard />
			</CreateBracketContainer>
		);
	}

	return (
		<CreateBracketContainer title={`${tournamentInfo.name} Leaderboard`}>
			<div className='space-y-6'>
				{/* Header section with tournament info and controls */}
				<div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
					<TournamentStatusHeader
						tournamentInfo={tournamentInfo}
						isComparingBrackets={isComparingBrackets}
						comparisonData={comparisonData}
					/>

					<LeaderboardControls
						onRefresh={handleRefresh}
						isRefreshing={refreshing || isLoadingComparison}
						isAdmin={isAdmin}
						sortCriteria={sortCriteria}
						onSortChange={handleSortChange}
						comparisonBracketId={comparisonBracketId}
						onComparisonChange={setComparisonBracketId}
						brackets={leaderboard}
						isLoadingBrackets={loading || isLoadingComparison}
					/>
				</div>

				{/* Add this right before the LeaderboardTable component in your return statement */}
				{isComparingBrackets && comparisonData && (
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
						<div>
							<h3 className='font-bold'>
								Bracket Comparison Mode
							</h3>
							<div className='text-sm'>
								Showing how the leaderboard would look if "
								{comparisonData.bracketName}" by{' '}
								{comparisonData.userName} had all the correct
								picks.
								<button
									onClick={() =>
										setComparisonBracketId('actual')
									}
									className='btn btn-xs btn-outline mt-1'
								>
									Return to Actual Results
								</button>
							</div>
						</div>
					</div>
				)}

				{/* Main leaderboard table */}
				<LeaderboardTable
					leaderboard={sortedLeaderboard}
					user={user}
				/>

				{/* Round-by-round breakdown */}
				<RoundBreakdownTable
					leaderboard={sortedLeaderboard}
					tournamentInfo={tournamentInfo}
					user={user}
				/>

				{/* Scoring explanation */}
				<ScoringSystemCard />
			</div>
		</CreateBracketContainer>
	);
}
