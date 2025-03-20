'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import CreateBracketContainer from '@/components/CreateBracketContainer';
import BracketViewContainer from '@/components/BracketViewContainer';
import dummyTeams from '@/dummyTeams';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';

// This is required for static export - will generate a fallback page
// that client-side renders the actual bracket when JavaScript runs
export function generateStaticParams() {
	return [{ id: 'fallback' }];
}

export default function ViewBracketPage() {
	const { id } = useParams();
	const { user } = useAuth();
	const [bracket, setBracket] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchBracket = async () => {
			if (!id) return;

			try {
				setLoading(true);

				// Get the document from Firestore
				const bracketRef = doc(db, 'brackets', id);
				const bracketDoc = await getDoc(bracketRef);

				if (bracketDoc.exists()) {
					const bracketData = bracketDoc.data();
					setBracket({
						...bracketData,
						createdAt:
							bracketData.createdAt?.toDate?.() || new Date(),
						updatedAt:
							bracketData.updatedAt?.toDate?.() || new Date(),
					});
				} else {
					setError('Bracket not found');
				}

				setLoading(false);
			} catch (err) {
				console.error('Error fetching bracket:', err);
				setError(
					'Failed to load bracket: ' +
						(err.message || 'Unknown error')
				);
				setLoading(false);
			}
		};

		fetchBracket();
	}, [id]);

	// Prepare bracket data for BracketViewContainer
	const prepareGamesForBracketView = () => {
		if (!bracket || !bracket.rounds) return [];

		const allGames = [];

		// Convert rounds object to a flat array of games with necessary properties
		Object.keys(bracket.rounds).forEach((roundNum) => {
			const round = parseInt(roundNum);
			const games = bracket.rounds[roundNum] || [];

			games.forEach((game) => {
				if (game) {
					allGames.push({
						id: game.gameId,
						round: round,
						region: game.region || '',
						teamA: game.teamA || '',
						teamB: game.teamB || '',
						winner:
							bracket.selections?.[round]?.[game.gameId] || '',
						// For actual results if available
						actualWinner: game.actualWinner || '',
					});
				}
			});
		});

		return allGames;
	};

	if (loading) {
		return (
			<div className='min-h-screen flex justify-center items-center'>
				<div className='loading loading-spinner loading-lg text-primary'></div>
			</div>
		);
	}

	if (error) {
		return (
			<div className='min-h-screen flex justify-center items-center'>
				<div className='alert alert-error max-w-md'>
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
			</div>
		);
	}

	if (!bracket) {
		return (
			<CreateBracketContainer title='Bracket Not Found'>
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
						This bracket does not exist or has been deleted.
					</span>
				</div>
			</CreateBracketContainer>
		);
	}

	// Determine if this is the user's own bracket
	const isOwnBracket = user && bracket.userId === user.uid;

	// Round information for labeling
	const roundInfo = [
		{ number: 1, name: 'First Round', gameCount: 32 },
		{ number: 2, name: 'Second Round', gameCount: 16 },
		{ number: 3, name: 'Sweet 16', gameCount: 8 },
		{ number: 4, name: 'Elite Eight', gameCount: 4 },
		{ number: 5, name: 'Final Four', gameCount: 2 },
		{ number: 6, name: 'Championship', gameCount: 1 },
	];

	return (
		<CreateBracketContainer title={bracket.name}>
			<div className='mb-6 space-y-4'>
				<div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4'>
					<div>
						<p className='text-base-content/70'>
							Created by: {bracket.userName}
						</p>
						<p className='text-base-content/70'>
							Created on:{' '}
							{new Date(bracket.createdAt).toLocaleDateString()}
						</p>
					</div>

					<div className='stats shadow'>
						<div className='stat'>
							<div className='stat-title'>Current Score</div>
							<div className='stat-value text-primary'>
								{bracket.points || 0}
							</div>
							<div className='stat-desc'>
								{Math.round(
									((bracket.points || 0) /
										(bracket.maxPossiblePoints || 192)) *
										100
								)}
								% of possible points
							</div>
						</div>
					</div>
				</div>

				{isOwnBracket && (
					<div className='alert alert-success'>
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
						<span>This is your bracket!</span>
					</div>
				)}
			</div>

			{/* NCAA Tournament Bracket View */}
			<div className='overflow-x-auto mb-8'>
				<h3 className='text-xl font-bold mb-4'>Tournament Bracket</h3>
				<div className='min-w-[1200px]'>
					<BracketViewContainer
						games={prepareGamesForBracketView()}
						teams={dummyTeams}
						bracketSelections={bracket.selections || {}}
						isReadOnly={true}
						showActualResults={true}
					/>
				</div>
			</div>

			{/* Optionally, display a breakdown of points by round */}
			{bracket.roundScores && (
				<div className='mt-8'>
					<h3 className='text-lg font-bold mb-4'>Round Scores</h3>
					<div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4'>
						{roundInfo.map((round, index) => (
							<div
								key={round.number}
								className='card bg-base-100 shadow-sm'
							>
								<div className='card-body p-4 text-center'>
									<h4 className='card-title justify-center text-sm'>
										{round.name}
									</h4>
									<p className='text-2xl font-bold text-primary'>
										{bracket.roundScores?.[index] || 0}
									</p>
									<p className='text-xs'>
										{round.name === 'Championship'
											? '32'
											: round.name === 'Final Four'
											? '16'
											: round.name === 'Elite Eight'
											? '8'
											: round.name === 'Sweet 16'
											? '4'
											: round.name === 'Second Round'
											? '2'
											: '1'}{' '}
										pts per pick
									</p>
								</div>
							</div>
						))}
					</div>
				</div>
			)}
		</CreateBracketContainer>
	);
}
