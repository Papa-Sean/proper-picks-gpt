'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function SignOut() {
	const router = useRouter();
	const { logout } = useAuth();
	const [error, setError] = useState(null);

	useEffect(() => {
		const signOut = async () => {
			try {
				console.log('SignOut page: Starting logout process');

				// Clear localStorage manually as a backup
				if (typeof window !== 'undefined') {
					localStorage.removeItem('auth');
				}

				// Call Firebase signOut
				await logout();

				console.log('SignOut page: Logout successful, redirecting');

				// Add a slight delay to ensure state updates
				setTimeout(() => {
					router.push('/login');
				}, 500);
			} catch (error) {
				console.error('Failed to sign out:', error);
				setError('Failed to sign out. Please try again.');
			}
		};

		signOut();
	}, [logout, router]);

	if (error) {
		return (
			<div className='min-h-screen flex flex-col items-center justify-center'>
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
				<button
					onClick={() => router.push('/login')}
					className='btn btn-secondary mt-4'
				>
					Return to Login
				</button>
			</div>
		);
	}

	return (
		<div className='min-h-screen flex flex-col items-center justify-center'>
			<div className='loading loading-spinner loading-lg'></div>
			<p className='mt-4 text-lg'>Signing out...</p>
		</div>
	);
}
