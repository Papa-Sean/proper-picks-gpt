'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import CreateBracketContainer from '@/components/CreateBracketContainer';
import {
	collection,
	query,
	where,
	orderBy,
	limit,
	getDocs,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import Link from 'next/link';

export default function BracketViewRedirectPage() {
	const router = useRouter();
	const { user, isLoading, isAuthenticated } = useAuth();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [authChecked, setAuthChecked] = useState(false);

	// Handle auth check separately from bracket lookup
	useEffect(() => {
		if (!isLoading) {
			setAuthChecked(true);
		}
	}, [isLoading]);

	// Handle redirection after auth is confirmed
	useEffect(() => {
		// Only run this effect after auth state is determined
		if (!authChecked) return;

		const findUserBracket = async () => {
			// Only proceed if auth is no longer loading
			if (isLoading) return;

			// If no user is logged in, redirect to login
			if (!user) {
				console.log('No user found, redirecting to login');
				// Save the current URL to return to after login
				sessionStorage.setItem('authRedirect', '/brackets/view');
				router.push('/login');
				return;
			}

			try {
				setLoading(true);

				// Query Firestore for the user's most recent bracket
				const bracketsRef = collection(db, 'brackets');
				const q = query(
					bracketsRef,
					where('userId', '==', user.uid),
					orderBy('createdAt', 'desc'),
					limit(1)
				);

				console.log('Querying for brackets with userId:', user.uid);
				const querySnapshot = await getDocs(q);

				// Check query results
				if (!querySnapshot.empty) {
					// Found a bracket - redirect to it
					const bracketId = querySnapshot.docs[0].id;
					console.log(
						'Found user bracket, redirecting to:',
						bracketId
					);
					router.push(`/brackets/view/${bracketId}`);
				} else {
					// No brackets found - redirect to create page
					console.log(
						'No brackets found for user, redirecting to create page'
					);
					router.push('/brackets/create');
				}
			} catch (err) {
				console.error('Error finding user bracket:', err);
				setError(
					`Error finding your bracket: ${
						err.message || 'Unknown error'
					}`
				);
				setLoading(false);
			}
		};

		// Only try to find bracket if user is logged in
		if (user && user.uid) {
			findUserBracket();
		}
	}, [authChecked, router, user, isLoading]);

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

	// Display a loading state while redirection is in progress
	if (loading) {
		return (
			<CreateBracketContainer title='Locating Your Bracket...'>
				<div className='flex flex-col items-center justify-center py-12'>
					<div className='loading loading-spinner loading-lg text-primary mb-4'></div>
					<p className='text-lg'>
						Searching for your existing brackets...
					</p>
				</div>
			</CreateBracketContainer>
		);
	}

	// Display an error if redirection fails
	if (error) {
		return (
			<CreateBracketContainer title='Error Finding Brackets'>
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

	// This should rarely be seen since we're redirecting
	return (
		<CreateBracketContainer title='Finding Your Brackets'>
			<div className='text-center py-8'>
				<p>
					If you are not redirected automatically, please use one of
					these options:
				</p>
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
			</div>
		</CreateBracketContainer>
	);
}
