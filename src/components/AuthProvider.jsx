'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { onAuthStateChanged } from 'firebase/auth';
import { useDispatch } from 'react-redux';
import { setUser, clearUser } from '@/store/userSlice';
import { auth } from '@/firebase';

export default function AuthProvider({ children }) {
	const { isAuthenticated, isLoading } = useAuth();
	const router = useRouter();
	const pathname = usePathname();
	const dispatch = useDispatch();

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

	// Add this useEffect before the auth state listener
	useEffect(() => {
		// Try to recover auth state from localStorage on initial load
		if (typeof window !== 'undefined' && !isAuthenticated) {
			try {
				const savedAuth = localStorage.getItem('auth');
				if (savedAuth) {
					const parsedAuth = JSON.parse(savedAuth);
					console.log(
						'Recovered auth state from localStorage:',
						parsedAuth
					);

					if (parsedAuth.isAuthenticated && parsedAuth.user) {
						dispatch(setUser(parsedAuth.user));
					}
				}
			} catch (error) {
				console.error('Error recovering auth state:', error);
				localStorage.removeItem('auth');
			}
		}
	}, [isAuthenticated, dispatch]);

	useEffect(() => {
		// Start auth listener
		console.log('Setting up auth state listener...');

		const unsubscribe = onAuthStateChanged(auth, (user) => {
			if (user) {
				console.log('Auth state changed: User logged in', user.uid);
				const userData = {
					uid: user.uid,
					email: user.email,
					displayName:
						user.displayName || user.email?.split('@')[0] || 'User',
					photoURL: user.photoURL,
				};

				// Dispatch user to Redux
				dispatch(setUser(userData));

				// Also save to localStorage as a backup
				if (typeof window !== 'undefined') {
					localStorage.setItem(
						'auth',
						JSON.stringify({
							user: userData,
							isAuthenticated: true,
						})
					);
					console.log('Saved auth state to localStorage');

					// Clear any redirect flags that might cause loops
					localStorage.removeItem('redirectStarted');
				}
			} else {
				console.log('Auth state changed: No user');
				dispatch(clearUser());

				if (typeof window !== 'undefined') {
					localStorage.removeItem('auth');
					console.log('Cleared auth state from localStorage');
				}
			}
		});

		// Cleanup
		return () => unsubscribe();
	}, [dispatch]);

	return children;
}
