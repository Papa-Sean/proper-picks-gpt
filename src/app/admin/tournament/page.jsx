'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import dynamic from 'next/dynamic';

// Import with dynamic loading and disabled SSR
const ActualOutcomesForm = dynamic(
	() => import('@/components/ActualOutcomesForm'),
	{
		ssr: false,
		loading: () => (
			<div className='loading loading-spinner loading-lg mx-auto'></div>
		),
	}
);

export default function TournamentAdminPage() {
	const { isAuthenticated, isAdmin } = useSelector((state) => state.auth);
	const { isClientSide, refreshUserToken } = useAuth();
	const router = useRouter();
	const [loading, setLoading] = useState(true);
	const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

	// Only run auth checks on the client
	useEffect(() => {
		if (!isClientSide) return;

		const checkAuth = async () => {
			try {
				// Wait a moment to ensure Redux state is hydrated
				await new Promise((resolve) => setTimeout(resolve, 500));

				if (!isAuthenticated) {
					router.push('/login');
					return;
				}

				// If Redux says we're not admin, try refreshing token once
				if (!isAdmin) {
					console.log(
						'Not an admin according to Redux, refreshing token...'
					);
					const isAdminAfterRefresh = await refreshUserToken();

					if (!isAdminAfterRefresh) {
						console.log(
							'Still not admin after refresh, redirecting...'
						);
						router.push('/data-dashboard');
						return;
					} else {
						console.log(
							'Admin status confirmed after token refresh'
						);
					}
				}

				setHasCheckedAuth(true);
				setLoading(false);
			} catch (err) {
				console.error('Error checking auth:', err);
				router.push('/data-dashboard');
			}
		};

		checkAuth();
	}, [isAuthenticated, isAdmin, router, isClientSide, refreshUserToken]);

	// Loading state
	if (loading || !isClientSide) {
		return (
			<div className='min-h-screen flex items-center justify-center'>
				<div className='loading loading-spinner loading-lg'></div>
			</div>
		);
	}

	// If auth check passed, show the admin content
	return (
		<div className='container mx-auto py-8 px-4'>
			<div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-8'>
				<div>
					<h1 className='text-3xl font-bold'>
						Tournament Administration
					</h1>
					<p className='text-base-content/70'>
						Manage tournament data and results
					</p>
				</div>
				<Link
					href='/admin'
					className='btn btn-outline mt-4 md:mt-0'
				>
					Back to Admin Dashboard
				</Link>
			</div>

			<div className='bg-base-100 shadow-lg rounded-lg p-6'>
				<ActualOutcomesForm tournamentId='ncaa-2025' />
			</div>
		</div>
	);
}
