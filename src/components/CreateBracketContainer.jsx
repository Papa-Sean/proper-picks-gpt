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

	// If auth is still loading or undefined, show loading spinner
	if (isAuthenticated === undefined) {
		return (
			<div className='min-h-screen bg-base-200 flex justify-center items-center p-4'>
				<div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary'></div>
			</div>
		);
	}

	// If user is definitely not authenticated, don't render content
	if (isAuthenticated === false) {
		return null; // Return nothing as we're redirecting
	}

	return (
		<div className='min-h-screen bg-base-200 py-12 px-4 sm:px-6 lg:px-8'>
			<div className='max-w-95vw mx-auto'>
				{/* Card with shadow and contrast */}
				<div className='bg-base-100 shadow-xl rounded-lg overflow-hidden'>
					{/* Header */}
					<div className='bg-primary text-primary-content p-6'>
						<h1 className='text-2xl font-bold'>{title}</h1>
					</div>

					{/* Content area */}
					<div className='p-6'>{children}</div>
				</div>
			</div>
		</div>
	);
}
