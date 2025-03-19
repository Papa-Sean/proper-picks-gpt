'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function AuthProvider({ children }) {
	const { isAuthenticated, isLoading } = useAuth();
	const router = useRouter();
	const pathname = usePathname();

	useEffect(() => {
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
				router.push('/data-dashboard');
				return;
			}

			// If user is not authenticated and tries to access a private route
			if (!isAuthenticated && !isPublicRoute) {
				console.log('User not authenticated, redirecting to login');
				// Store the current URL to redirect back after login
				if (typeof window !== 'undefined') {
					sessionStorage.setItem('authRedirect', pathname);
				}
				router.push('/login');
			}
		}
	}, [isAuthenticated, isLoading, pathname, router]);

	return children;
}
