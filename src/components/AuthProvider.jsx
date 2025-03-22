'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { onAuthStateChanged } from 'firebase/auth';
import { useDispatch } from 'react-redux';
import { setUser, clearUser } from '@/store/authSlice';
import { auth, db } from '@/config/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function AuthProvider({ children }) {
	const { isAuthenticated, isLoading } = useAuth();
	const router = useRouter();
	const pathname = usePathname();
	const dispatch = useDispatch();
	const [isClient, setIsClient] = useState(false);

	// This effect runs once to mark that we're on the client
	useEffect(() => {
		setIsClient(true);
	}, []);

	// Add this to prevent server-side redirects
	const isClientSide = typeof window !== 'undefined';

	// In your redirect logic:
	useEffect(() => {
		// Only run redirects on the client side
		if (!isClientSide) return;

		// List of routes that don't require authentication
		const publicRoutes = ['/', '/login', '/register', '/reset-password'];
		const isPublicRoute = publicRoutes.some(
			(route) => pathname === route || pathname.startsWith(route)
		);

		// If still loading auth state, don't redirect yet
		if (isLoading) return;

		// Add a quick bail-out if we're getting in a redirect loop
		const lastRedirect = localStorage.getItem('redirectStarted');
		const redirectCount = parseInt(
			localStorage.getItem('redirectCount') || '0',
			10
		);

		if (lastRedirect) {
			// If we've attempted a redirect in the last 2 seconds, don't try again
			const timeSinceRedirect = Date.now() - parseInt(lastRedirect, 10);
			if (timeSinceRedirect < 2000 || redirectCount > 3) {
				console.log(
					'Recent redirect detected, preventing redirect loop'
				);
				localStorage.removeItem('redirectStarted');
				localStorage.removeItem('redirectCount');
				return;
			}
		}

		// Handle authenticated users on login page
		if (isAuthenticated && pathname === '/login') {
			console.log('User authenticated, redirecting from login');
			// Mark that we've started a redirect and increment count
			const redirectCount = parseInt(
				localStorage.getItem('redirectCount') || '0',
				10
			);
			localStorage.setItem(
				'redirectCount',
				(redirectCount + 1).toString()
			);
			localStorage.setItem('redirectStarted', Date.now().toString());

			// Use router.push instead of window.location for Next.js routing
			router.push('/data-dashboard');
			return;
		}

		// Handle non-authenticated users on protected routes
		if (!isAuthenticated && !isPublicRoute && !isLoading) {
			console.log('User not authenticated, redirecting to login');

			// Mark that we've started a redirect and increment count
			const redirectCount = parseInt(
				localStorage.getItem('redirectCount') || '0',
				10
			);
			localStorage.setItem(
				'redirectCount',
				(redirectCount + 1).toString()
			);
			localStorage.setItem('redirectStarted', Date.now().toString());

			// Save the current URL to return after login
			sessionStorage.setItem('authRedirect', pathname);

			window.location.href = '/login';
		}
	}, [isAuthenticated, isLoading, pathname, router, isClientSide]);

	// Add this useEffect before the auth state listener
	useEffect(() => {
		// Skip server-side execution
		if (!isClient) return;

		// Try to recover auth state from localStorage on initial load
		if (!isAuthenticated) {
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
	}, [isAuthenticated, dispatch, isClient]);

	useEffect(() => {
		// Skip server-side execution
		if (!isClient) return;

		// Start auth listener
		console.log('Setting up auth state listener...');

		const unsubscribe = onAuthStateChanged(auth, async (user) => {
			if (user) {
				console.log('Auth state changed: User logged in', user.uid);

				// Check if user is an admin by checking localStorage first (faster)
				let isUserAdmin = false;

				try {
					const authData = JSON.parse(
						localStorage.getItem('auth') || '{}'
					);
					isUserAdmin = authData?.isAdmin === true;
				} catch (e) {
					console.error('Error reading auth from localStorage:', e);
				}

				// If not found in localStorage, check Firestore
				if (!isUserAdmin) {
					try {
						// Get admin document from Firestore
						const settingsDocRef = doc(db, 'settings', 'admins');
						const settingsDoc = await getDoc(settingsDocRef);

						if (settingsDoc.exists()) {
							const data = settingsDoc.data();
							const adminIds = data.adminIds || [];
							isUserAdmin = adminIds.includes(user.uid);
							console.log(
								'Admin status from Firestore:',
								isUserAdmin
							);
						}
					} catch (error) {
						console.error('Error checking admin status:', error);
					}
				} else {
					console.log('Admin status from localStorage:', isUserAdmin);
				}

				const userData = {
					uid: user.uid,
					email: user.email,
					displayName:
						user.displayName || user.email?.split('@')[0] || 'User',
					photoURL: user.photoURL,
					isAdmin: isUserAdmin,
				};

				// Dispatch user data with admin status to Redux
				dispatch(setUser(userData));

				// Also update localStorage
				localStorage.setItem(
					'auth',
					JSON.stringify({
						user: userData,
						isAuthenticated: true,
						isAdmin: isUserAdmin,
						timestamp: Date.now(),
					})
				);
			} else {
				// User is signed out
				dispatch(clearUser());
				localStorage.removeItem('auth');
			}
		});

		// Cleanup
		return () => unsubscribe();
	}, [dispatch, isClient]);

	// For server-side rendering, return children directly (no auth check yet)
	// On client side, we've set up the auth state listeners
	return children;
}
