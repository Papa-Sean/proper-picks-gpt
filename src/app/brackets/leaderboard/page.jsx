'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
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
				<div className='flex justify-center p-12'>
					<div className='loading loading-spinner loading-lg'></div>
				</div>
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
				<div className='alert alert-info'>
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
						No brackets have been submitted yet for this tournament.
					</span>
				</div>
				<div className='mt-4 text-center'>
					<Link
						href='/brackets/create'
						className='btn btn-primary'
					>
						Create a Bracket
					</Link>
				</div>
			</CreateBracketContainer>
		);
	}

	return (
		<CreateBracketContainer title={`${tournamentInfo.name} Leaderboard`}>
			<div className='mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
				<div>
					<h2 className='text-xl font-bold mb-2'>
						Current Round:{' '}
						{
							tournamentInfo.roundNames[
								tournamentInfo.currentRound - 1
							]
						}
					</h2>
					<div className='flex flex-wrap gap-2 mb-2'>
						{tournamentInfo.roundNames.map((name, index) => (
							<div
								key={index}
								className={`badge ${
									index < tournamentInfo.currentRound
										? 'badge-primary'
										: 'badge-outline'
								}`}
							>
								{name}
							</div>
						))}
					</div>
					{tournamentInfo.lastUpdated && (
						<div className='text-sm opacity-70'>
							Last updated:{' '}
							{tournamentInfo.lastUpdated.toLocaleString()}
						</div>
					)}
				</div>

				<div className='flex gap-2'>
					<button
						className='btn btn-outline btn-sm'
						onClick={handleRefresh}
						disabled={refreshing}
					>
						{refreshing ? (
							<>
								<span className='loading loading-spinner loading-xs mr-1'></span>
								Refreshing...
							</>
						) : (
							<>
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
										d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
									/>
								</svg>
								Refresh
							</>
						)}
					</button>

					{isAdmin && (
						<Link
							href='/admin/tournament'
							className='btn btn-primary btn-sm'
						>
							Update Results
						</Link>
					)}
				</div>
			</div>

			{/* Sorting controls */}
			<div className='flex justify-end mb-4'>
				<div className='btn-group'>
					<button
						className={`btn btn-sm ${
							sortCriteria === 'points' ? 'btn-active' : ''
						}`}
						onClick={() => handleSortChange('points')}
					>
						Points
					</button>
					<button
						className={`btn btn-sm ${
							sortCriteria === 'correctPicks' ? 'btn-active' : ''
						}`}
						onClick={() => handleSortChange('correctPicks')}
					>
						Correct Picks
					</button>
					<button
						className={`btn btn-sm ${
							sortCriteria === 'maxPossible' ? 'btn-active' : ''
						}`}
						onClick={() => handleSortChange('maxPossible')}
					>
						Max Possible
					</button>
				</div>
			</div>

			{/* Leaderboard table */}
			<div className='overflow-x-auto'>
				<table className='table w-full'>
					<thead>
						<tr>
							<th>Rank</th>
							<th>Bracket</th>
							<th className='text-center'>Points</th>
							<th className='text-center'>Correct Picks</th>
							<th className='text-center'>Max Possible</th>
							<th className='text-right'>Actions</th>
						</tr>
					</thead>
					<tbody>
						{sortedLeaderboard.map((entry, index) => {
							// Check if this bracket was updated recently (within the last hour)
							const recentlyUpdated =
								entry.updatedAt &&
								new Date().getTime() -
									entry.updatedAt.getTime() <
									60 * 60 * 1000;

							return (
								<tr
									key={entry.bracketId}
									className={`
								  ${user && entry.userId === user.uid ? 'bg-primary bg-opacity-10' : ''}
								  ${recentlyUpdated ? 'bg-success bg-opacity-5' : ''}
								`}
								>
									<td className='font-bold'>{index + 1}</td>
									<td>
										<div>
											<div className='font-bold flex items-center'>
												{entry.bracketName}
												{recentlyUpdated && (
													<div className='badge badge-xs badge-success ml-2'>
														Updated
													</div>
												)}
											</div>
											<div className='text-sm opacity-70'>
												{entry.userName}
											</div>
											<div className='text-xs opacity-50'>
												Created:{' '}
												{entry.createdAt.toLocaleDateString()}
											</div>
										</div>
									</td>
									<td className='text-center font-bold'>
										{entry.points}
									</td>
									<td className='text-center'>
										{entry.correctPicks}/
										{entry.totalPicks || '-'}
										<div className='text-xs opacity-70'>
											{entry.totalPicks
												? `${Math.round(
														(entry.correctPicks /
															entry.totalPicks) *
															100
												  )}%`
												: '-'}
										</div>
									</td>
									<td className='text-center'>
										{entry.maxPossible}
									</td>
									<td className='text-right'>
										<Link
											href={`/brackets/view/${entry.bracketId}`}
											className='btn btn-sm btn-outline'
										>
											View Bracket
										</Link>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>

			{/* Round breakdown */}
			<div className='mt-8'>
				<h3 className='text-lg font-bold mb-4'>
					Round-by-Round Breakdown
				</h3>
				<div className='overflow-x-auto'>
					<table className='table w-full'>
						<thead>
							<tr>
								<th>Bracket</th>
								{tournamentInfo.roundNames.map(
									(name, index) => (
										<th
											key={index}
											className='text-center'
										>
											{name}
										</th>
									)
								)}
							</tr>
						</thead>
						<tbody>
							{sortedLeaderboard.map((entry) => (
								<tr
									key={`${entry.bracketId}-rounds`}
									className={
										user && entry.userId === user.uid
											? 'bg-primary bg-opacity-10'
											: ''
									}
								>
									<td>
										<div className='font-bold'>
											{entry.bracketName}
										</div>
										<div className='text-sm opacity-70'>
											{entry.userName}
										</div>
									</td>
									{entry.roundScores.map((score, index) => (
										<td
											key={index}
											className='text-center'
										>
											{score}
											{index <
												tournamentInfo.currentRound && (
												<div
													className='radial-progress text-xs'
													style={{
														'--value': Math.min(
															100,
															score
														),
														'--size': '1.5rem',
													}}
												>
													{score}
												</div>
											)}
										</td>
									))}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			{/* Scoring explanation */}
			<div className='mt-10 p-4 bg-base-200 rounded-lg'>
				<h3 className='text-lg font-bold mb-2'>Scoring System</h3>
				<ul className='list-disc list-inside space-y-1'>
					<li>First Round: 1 point per correct pick</li>
					<li>Second Round: 2 points per correct pick</li>
					<li>Sweet 16: 4 points per correct pick</li>
					<li>Elite 8: 8 points per correct pick</li>
					<li>Final Four: 16 points per correct pick</li>
					<li>Championship: 32 points for picking the winner</li>
				</ul>
				<p className='mt-2 text-sm opacity-70'>
					Maximum possible score: 192 points
				</p>
			</div>
		</CreateBracketContainer>
	);
}
