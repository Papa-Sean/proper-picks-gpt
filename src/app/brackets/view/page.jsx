'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import CreateBracketContainer from '@/components/CreateBracketContainer';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';
import Link from 'next/link';

export default function BracketViewPage() {
	const router = useRouter();
	const { user, isLoading, isAuthenticated } = useAuth();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [brackets, setBrackets] = useState([]);
	const [authChecked, setAuthChecked] = useState(false);

	// Handle auth check separately from bracket lookup
	useEffect(() => {
		if (!isLoading) {
			setAuthChecked(true);
		}
	}, [isLoading]);

	// Fetch user brackets after auth is confirmed
	useEffect(() => {
		// Only run this effect after auth state is determined
		if (!authChecked) return;

		const fetchUserBrackets = async () => {
			// Only proceed if auth is no longer loading
			if (isLoading) return;

			// If no user is logged in, we'll show the login prompt (handled in render)
			if (!user) return;

			try {
				setLoading(true);

				// Query Firestore for all of the user's brackets
				const bracketsRef = collection(db, 'brackets');
				const q = query(
					bracketsRef,
					where('userId', '==', user.uid),
					orderBy('createdAt', 'desc')
				);

				console.log('Querying for brackets with userId:', user.uid);
				const querySnapshot = await getDocs(q);

				// Process brackets
				const userBrackets = [];
				querySnapshot.forEach((doc) => {
					const data = doc.data();
					userBrackets.push({
						id: doc.id,
						name: data.name || 'Unnamed Bracket',
						createdAt: data.createdAt?.toDate() || new Date(),
						points: data.points || 0,
						maxPossible: data.maxPossible || 192,
						tournamentName:
							data.tournamentName || 'NCAA Tournament',
					});
				});

				console.log(`Found ${userBrackets.length} brackets for user`);
				setBrackets(userBrackets);
				setLoading(false);
			} catch (err) {
				console.error('Error fetching user brackets:', err);
				setError(
					`Error loading your brackets: ${
						err.message || 'Unknown error'
					}`
				);
				setLoading(false);
			}
		};

		// Only try to find brackets if user is logged in
		if (user && user.uid) {
			fetchUserBrackets();
		} else {
			setLoading(false); // Not loading if no user
		}
	}, [authChecked, user, isLoading]);

	// Show a different message when checking auth vs. looking for brackets
	if (isLoading || !authChecked) {
		return (
			<CreateBracketContainer title='Checking Authentication...'>
				<div className='flex flex-col items-center justify-center py-12'>
					<div className='loading loading-spinner loading-lg text-primary mb-4'></div>
					<p className='text-lg'>Verifying your login status...</p>
				</div>
			</CreateBracketContainer>
		);
	}

	// If not authenticated, show login prompt
	if (!user) {
		return (
			<CreateBracketContainer title='Authentication Required'>
				<div className='flex flex-col items-center justify-center py-12'>
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
							You need to be logged in to view your brackets.
						</span>
					</div>
					<Link
						href='/login?redirect=/brackets/view'
						className='btn btn-primary btn-lg'
					>
						Log In
					</Link>
					<div className='mt-4'>
						<Link
							href='/brackets/leaderboard'
							className='link link-hover'
						>
							View leaderboard instead
						</Link>
					</div>
				</div>
			</CreateBracketContainer>
		);
	}

	// Display a loading state while fetching brackets
	if (loading) {
		return (
			<CreateBracketContainer title='Loading Your Brackets...'>
				<div className='flex flex-col items-center justify-center py-12'>
					<div className='loading loading-spinner loading-lg text-primary mb-4'></div>
					<p className='text-lg'>
						Loading your bracket submissions...
					</p>
				</div>
			</CreateBracketContainer>
		);
	}

	// Display an error if bracket fetching fails
	if (error) {
		return (
			<CreateBracketContainer title='Error Loading Brackets'>
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
				<div className='mt-6 flex flex-col sm:flex-row gap-4 justify-center'>
					<Link
						href='/brackets/create'
						className='btn btn-primary'
					>
						Create New Bracket
					</Link>
					<Link
						href='/brackets/leaderboard'
						className='btn btn-outline'
					>
						View Leaderboard
					</Link>
				</div>
			</CreateBracketContainer>
		);
	}

	// Display the list of user brackets or a message if none found
	return (
		<CreateBracketContainer title='Your Bracket Submissions'>
			<div className='pb-6'>
				<div className='flex justify-between items-center mb-6'>
					<h2 className='text-2xl font-bold'>
						Your Tournament Brackets
					</h2>
					<Link
						href='/brackets/create'
						className='btn btn-primary'
					>
						Create New Bracket
					</Link>
				</div>

				{brackets.length === 0 ? (
					// No brackets found
					<div className='text-center py-12 bg-base-200 rounded-lg'>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							className='h-12 w-12 mx-auto text-base-content/50 mb-4'
							fill='none'
							viewBox='0 0 24 24'
							stroke='currentColor'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
							/>
						</svg>
						<h3 className='text-xl font-bold mb-2'>
							No Brackets Found
						</h3>
						<p className='text-base-content/70 mb-6'>
							You haven't created any bracket submissions yet.
						</p>
						<Link
							href='/brackets/create'
							className='btn btn-primary'
						>
							Create Your First Bracket
						</Link>
					</div>
				) : (
					// Display brackets in a card layout
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
						{brackets.map((bracket) => (
							<div
								key={bracket.id}
								className='card bg-base-100 shadow-lg hover:shadow-xl transition-shadow'
							>
								<div className='card-body'>
									<h3 className='card-title text-lg font-bold'>
										{bracket.name}
									</h3>
									<div className='text-sm opacity-70'>
										Created:{' '}
										{bracket.createdAt.toLocaleDateString()}
									</div>

									<div className='stats bg-base-200 shadow-sm mt-2'>
										<div className='stat p-2'>
											<div className='stat-title text-xs'>
												Score
											</div>
											<div className='stat-value text-primary text-xl'>
												{bracket.points}
											</div>
											<div className='stat-desc text-xs'>
												{Math.round(
													(bracket.points /
														bracket.maxPossible) *
														100
												)}
												% complete
											</div>
										</div>
									</div>

									<div className='card-actions justify-end mt-4'>
										<Link
href={`/brackets/view/bracketview?id=${entry.bracketId}`}											className='btn btn-primary'
											prefetch={false} // Important for static export
										>
											View Bracket
										</Link>
									</div>
								</div>
							</div>
						))}
					</div>
				)}

				<div className='mt-8 text-center'>
					<Link
						href='/brackets/leaderboard'
						className='btn btn-outline'
					>
						View Tournament Leaderboard
					</Link>
				</div>
			</div>
		</CreateBracketContainer>
	);
}
