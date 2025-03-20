'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Provider } from 'react-redux';
import store from '@/store';
import AuthProvider from '@/components/AuthProvider';
import Navigation from '@/components/Navigation';
import './globals.css';

export default function RootLayout({ children }) {
	const pathname = usePathname();

	// Public routes that don't require auth
	const publicRoutes = ['/', '/login', '/register', '/reset-password'];
	const isPublicRoute = publicRoutes.some((route) => pathname === route);

	// Add this useEffect to your layout component
	useEffect(() => {
		// One-time auth state cleaner - only run once
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
		<html lang='en'>
			<head>
				<meta charSet='utf-8' />
				<meta
					name='viewport'
					content='width=device-width, initial-scale=1'
				/>
				<title>Proper Picks</title>
			</head>
			<body>
				<Provider store={store}>
					<AuthProvider>
						<div className='flex flex-col min-h-screen'>
							<Navigation />
							<main className='flex-grow'>{children}</main>
							<footer className='bg-base-200 py-4 text-center'>
								<p>
									&copy; {new Date().getFullYear()} Proper
									Picks
								</p>
							</footer>
						</div>
					</AuthProvider>
				</Provider>
			</body>
		</html>
	);
}
