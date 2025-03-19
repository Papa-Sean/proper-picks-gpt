'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import CreateBracketContainer from '@/components/CreateBracketContainer';
import {
	doc,
	getDoc,
	collection,
	query,
	where,
	orderBy,
	getDocs,
} from 'firebase/firestore';
import { db } from '@/config/firebase';

export default function LeaderboardPage() {
	const { user } = useAuth();
	const [leaderboard, setLeaderboard] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
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
	});
	const [sortCriteria, setSortCriteria] = useState('points');

	useEffect(() => {
		const fetchLeaderboard = async () => {
			try {
				setLoading(true);

				// First, try to get tournament info
				const tournamentId = 'ncaa-2024'; // You might want to make this dynamic
				const tournamentRef = doc(db, 'tournaments', tournamentId);
				const tournamentDoc = await getDoc(tournamentRef);

				if (tournamentDoc.exists()) {
					const tournamentData = tournamentDoc.data();
					setTournamentInfo({
						name: tournamentData.name || 'NCAA Tournament 2024',
						currentRound: tournamentData.currentRound || 1,
						roundNames: tournamentData.roundNames || [
							'First Round',
							'Second Round',
							'Sweet 16',
							'Elite Eight',
							'Final Four',
							'Championship',
						],
					});
				}

				// Fetch all brackets for this tournament
				const bracketsRef = collection(db, 'brackets');
				const q = query(
					bracketsRef,
					where('tournamentId', '==', tournamentId),
					orderBy('points', 'desc')
				);

				const bracketsSnapshot = await getDocs(q);
				const brackets = [];

				if (bracketsSnapshot.empty) {
					console.log('No brackets found');
				} else {
					bracketsSnapshot.forEach((doc) => {
						const data = doc.data();
						brackets.push({
							userId: data.userId,
							userName: data.userName || 'Anonymous User',
							bracketName: data.name || 'Unnamed Bracket',
							bracketId: doc.id,
							points: data.points || 0,
							correctPicks: data.correctPicks || 0,
							totalPicks: data.totalPicks || 0,
							maxPossible: data.maxPossible || 192,
							roundScores: data.roundScores || [0, 0, 0, 0, 0, 0],
							createdAt: data.createdAt?.toDate() || new Date(),
						});
					});

					console.log(`Fetched ${brackets.length} brackets`);
				}

				setLeaderboard(brackets);
				setLoading(false);
			} catch (err) {
				console.error('Error fetching leaderboard data:', err);
				setError(
					`Failed to load leaderboard: ${
						err.message || 'Unknown error'
					}`
				);
				setLoading(false);
			}
		};

		fetchLeaderboard();
	}, []);

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

	const handleSortChange = (criteria) => {
		setSortCriteria(criteria);
	};

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
			<div className='mb-6'>
				<h2 className='text-xl font-bold mb-2'>
					Current Round:{' '}
					{tournamentInfo.roundNames[tournamentInfo.currentRound - 1]}
				</h2>
				<div className='flex flex-wrap gap-2'>
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
						{sortedLeaderboard.map((entry, index) => (
							<tr
								key={entry.bracketId}
								className={
									user && entry.userId === user.uid
										? 'bg-primary bg-opacity-10'
										: ''
								}
							>
								<td className='font-bold'>{index + 1}</td>
								<td>
									<div>
										<div className='font-bold'>
											{entry.bracketName}
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
						))}
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
