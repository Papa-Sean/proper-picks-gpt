'use client';

import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function CreateBracketContainer({
	children,
	title = 'Create New Bracket',
}) {
	const { isAuthenticated, user } = useSelector((state) => state.auth);
	const router = useRouter();

	useEffect(() => {
		// Only redirect if we're certain the user is not authenticated
		if (isAuthenticated === false) {
			router.push(
				'/login?callbackUrl=' +
					encodeURIComponent(window.location.pathname)
			);
		}
	}, [isAuthenticated, router]);

	// Instead of conditional rendering based on auth state directly,
	// use a client-side effect to handle the authentication check
	return (
		<div className='min-h-screen bg-base-200 py-12 px-4 sm:px-6 lg:px-8'>
			<div className='max-w-95vw mx-auto'>
				<div className='bg-base-100 shadow-xl rounded-lg overflow-hidden'>
					<div className='bg-secondary text-secondary-content p-6'>
						<h1 className='text-2xl font-bold'>{title}</h1>
					</div>
					<div className='p-6'>
						{isAuthenticated === undefined ? (
							<div className='flex justify-center items-center'>
								<div className='loading loading-spinner loading-lg'></div>
							</div>
						) : (
							children
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
