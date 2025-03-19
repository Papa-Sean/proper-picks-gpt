import { NextResponse } from 'next/server';

// Define protected routes
const protectedRoutes = [
	'/brackets/create',
	'/brackets/view',
	'/brackets/leaderboard',
	'/data-dashboard',
];

export function middleware(request) {
	const { pathname } = request.nextUrl;

	// Check if this is a protected route
	const isProtectedRoute = protectedRoutes.some((route) =>
		pathname.startsWith(route)
	);

	if (isProtectedRoute) {
		// Check for auth cookie
		const authCookie = request.cookies.get('auth');

		if (!authCookie) {
			// No auth cookie found, redirect to login
			const url = new URL('/login', request.url);
			url.searchParams.set('callbackUrl', encodeURI(pathname));
			return NextResponse.redirect(url);
		}

		try {
			// Verify the auth cookie is valid
			const authData = JSON.parse(authCookie.value);
			if (!authData.isAuthenticated) {
				// Auth cookie exists but not authenticated
				const url = new URL('/login', request.url);
				url.searchParams.set('callbackUrl', encodeURI(pathname));
				return NextResponse.redirect(url);
			}
		} catch (e) {
			// Invalid auth cookie
			const url = new URL('/login', request.url);
			url.searchParams.set('callbackUrl', encodeURI(pathname));
			return NextResponse.redirect(url);
		}
	}

	return NextResponse.next();
}

// Configure which paths will execute the middleware
export const config = {
	matcher: [
		'/brackets/create/:path*',
		'/brackets/view/:path*',
		'/brackets/leaderboard/:path*',
		'/data-dashboard/:path*',
	],
};
