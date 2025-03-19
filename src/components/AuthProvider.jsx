'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function AuthProvider({ children }) {
	const { isAuthenticated, isLoading } = useAuth();
	const router = useRouter();
	const pathname = usePathname();

	useEffect(() => {
		// Add a quick bail-out if we're getting in a redirect loop
		if (typeof window !== 'undefined') {
			const lastRedirect = localStorage.getItem('redirectStarted');
			if (lastRedirect) {
				// If we've attempted a redirect in the last 2 seconds, don't try again
				const timeSinceRedirect =
					Date.now() - parseInt(lastRedirect, 10);
				if (timeSinceRedirect < 2000) {
					console.log(
						'Recent redirect detected, preventing redirect loop'
					);
					return;
				} else {
					// Clear old redirect markers
					localStorage.removeItem('redirectStarted');
				}
			}
		}

		// List of routes that don't require authentication
		const publicRoutes = ['/', '/login', '/register', '/reset-password'];
		const isPublicRoute = publicRoutes.some(
			(route) => pathname === route || pathname.startsWith(route)
		);

		// Only check after auth state is loaded
		if (!isLoading) {
			// If user is authenticated but on login page, redirect to dashboard
			if (isAuthenticated && pathname === '/login') {
				console.log(
					'User already authenticated, redirecting to dashboard'
				);

				// Mark that we've started the redirect
				if (typeof window !== 'undefined') {
					localStorage.setItem(
						'redirectStarted',
						Date.now().toString()
					);
				}

				// Use direct navigation for Netlify
				if (typeof window !== 'undefined') {
					window.location.href = '/data-dashboard';
				} else {
					router.push('/data-dashboard');
				}
				return;
			}

			// If user is not authenticated and tries to access a private route
			if (!isAuthenticated && !isPublicRoute) {
				console.log('User not authenticated, redirecting to login');

				// Store the current URL to redirect back after login
				if (typeof window !== 'undefined') {
					sessionStorage.setItem('authRedirect', pathname);
					localStorage.setItem(
						'redirectStarted',
						Date.now().toString()
					);
					window.location.href = '/login';
				} else {
					router.push('/login');
				}
			}
		}
	}, [isAuthenticated, isLoading, pathname, router]);

	return children;
}
