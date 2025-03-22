'use client';

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';

export default function ProtectedRoute({ children }) {
	const { isAuthenticated } = useSelector((state) => state.auth);
	const router = useRouter();
	const pathname = usePathname();

	useEffect(() => {
		// If auth state is definitively false and we're not already on the login page
		if (isAuthenticated === false && pathname !== '/login') {
			router.replace('/login');
		}
	}, [isAuthenticated, router, pathname]);

	// While we're still determining auth state, show a loading indicator
	if (isAuthenticated === undefined) {
		return (
			<div className='flex justify-center items-center min-h-screen'>
				<div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary'></div>
			</div>
		);
	}

	// If not authenticated, don't render the children
	if (isAuthenticated === false && pathname !== '/login') {
		return null;
	}

	// If authenticated or on the login page, render the children
	return <>{children}</>;
}
