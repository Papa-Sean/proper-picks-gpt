'use client';

import { useEffect, useState, Suspense } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Provider } from 'react-redux';
import store from '@/store';
import AuthProvider from '@/components/AuthProvider';
import Navigation from '@/components/Navigation';
import './globals.css';

// Wrapper for search params functionality
function SearchParamsWrapper({ children }) {
	return <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>;
}

function MainLayout({ children }) {
	const pathname = usePathname();
	const router = useRouter();
	const searchParams = useSearchParams();
	const [redirectProcessed, setRedirectProcessed] = useState(false);

	// Public routes that don't require auth
	const publicRoutes = ['/', '/login', '/register', '/reset-password'];
	const isPublicRoute = publicRoutes.some((route) => pathname === route);

	// Handle redirectToBracket parameter
	useEffect(() => {
		// Only run on client side
		if (typeof window === 'undefined') return;

		// Only process the redirect once
		if (redirectProcessed) return;

		const bracketId = searchParams.get('redirectToBracket');
		if (bracketId) {
			console.log('Detected redirectToBracket parameter:', bracketId);
			setRedirectProcessed(true);

			// A slight delay allows the auth state to be loaded first
			setTimeout(() => {
				router.push(`/brackets/view/${bracketId}`);
			}, 100);
		}
	}, [searchParams, redirectProcessed, router]);

	// One-time auth state cleaner
	useEffect(() => {
		if (typeof window !== 'undefined') {
			// Check if we need to clean up auth state
			const cleanupAuth = localStorage.getItem('authCleanupNeeded');
			if (!cleanupAuth) {
				// Reset all redirect markers and counts
				localStorage.removeItem('redirectStarted');
				localStorage.removeItem('redirectCount');

				// Mark that we've done the cleanup
				localStorage.setItem('authCleanupNeeded', 'false');

				console.log('One-time auth state cleanup complete');
			}
		}
	}, []);

	return (
		<div className='flex flex-col min-h-screen max-w-full overflow-x-hidden'>
			<Navigation />
			<main className='flex-grow w-full overflow-x-hidden'>
				{children}
			</main>
			<footer className='bg-primary text-primary-content py-4 text-center w-full'>
				<p>&copy; {new Date().getFullYear()} Proper Picks</p>
			</footer>
		</div>
	);
}

export default function RootLayout({ children }) {
	return (
		<html
			lang='en'
			data-theme='auburn-tigers'
		>
			<head>
				<meta charSet='utf-8' />
				<meta
					name='viewport'
					content='width=device-width, initial-scale=1'
				/>
				<title>Proper Picks</title>
			</head>
			<body className='overflow-x-hidden'>
				<Provider store={store}>
					<AuthProvider>
						<SearchParamsWrapper>
							<MainLayout>{children}</MainLayout>
						</SearchParamsWrapper>
					</AuthProvider>
				</Provider>
			</body>
		</html>
	);
}
