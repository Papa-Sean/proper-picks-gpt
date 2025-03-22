'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import CreateBracketContainer from '@/components/CreateBracketContainer';
import BracketViewContainer from '@/components/BracketViewContainer';
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

				// Fetch directly from Firestore (you can still use API call if preferred)
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
			const tournamentRef = doc(db, 'tournaments', 'ncaa-2025');
			const tournamentDoc = await getDoc(tournamentRef);

			if (tournamentDoc.exists()) {
				setTournamentData(tournamentDoc.data());
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

	// Same rendering logic as before...
	if (loading) {
		return (
			<CreateBracketContainer title='Loading Bracket...'>
				<div className='flex justify-center items-center h-64'>
					<div className='loading loading-spinner loading-lg'></div>
				</div>
			</CreateBracketContainer>
		);
	}

	if (error || !bracket) {
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
						{error ||
							'This bracket does not exist or has been deleted.'}
					</span>
				</div>
				<div className='mt-4'>
					<Link
						href='/brackets/leaderboard'
						className='btn btn-primary'
					>
						Back to Leaderboard
					</Link>
				</div>
			</CreateBracketContainer>
		);
	}

	// Only define this once the bracket is loaded
	const isOwnBracket = user && bracket.userId === user.uid;

	return (
		<CreateBracketContainer title={bracket.name}>
			<div className='mb-6 flex justify-between items-center'>
				<div>
					<p className='text-base-content/70'>
						Created by: {bracket.userName || 'Anonymous User'}
					</p>
					{isOwnBracket && (
						<div className='badge badge-primary mt-2'>
							Your Bracket
						</div>
					)}
				</div>
				<Link
					href='/brackets/leaderboard'
					className='btn btn-outline btn-sm'
				>
					Back to Leaderboard
				</Link>
			</div>

			{/* Bracket content */}
			<BracketViewContainer
				games={
					bracket.rounds ? Object.values(bracket.rounds).flat() : []
				}
				teams={bracket.teams || []}
				bracketSelections={bracket.selections || {}}
				actualResults={actualResults}
				isReadOnly={true}
			/>
		</CreateBracketContainer>
	);
}
