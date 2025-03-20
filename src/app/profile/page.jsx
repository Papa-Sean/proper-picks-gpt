'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
	const router = useRouter();

	useEffect(() => {
		// Force browser to redirect
		window.location.href = '/data-dashboard';
	}, []);

	// This return is just a fallback while the redirect happens
	return (
		<div className='min-h-screen flex items-center justify-center'>
			<div className='loading loading-spinner loading-lg'></div>
			<p className='ml-2'>Redirecting...</p>
		</div>
	);
}
