/**
 * Synchronizes Firebase auth state with localStorage to prevent conflicts
 */
export const syncAuthState = (user, isAdmin = false) => {
	if (typeof window === 'undefined') return;

	if (user) {
		// User is signed in - update localStorage
		const userData = {
			uid: user.uid,
			email: user.email,
			displayName:
				user.displayName || user.email?.split('@')[0] || 'User',
			photoURL: user.photoURL,
			isAdmin: isAdmin,
		};

		localStorage.setItem(
			'auth',
			JSON.stringify({
				user: userData,
				isAuthenticated: true,
				isAdmin: isAdmin,
				timestamp: Date.now(),
			})
		);

		// Set a cookie for SSG/SSR awareness
		document.cookie = `auth=true; path=/; max-age=${60 * 60 * 24 * 7}`;
	} else {
		// User is signed out - clear localStorage
		localStorage.removeItem('auth');
		document.cookie = 'auth=; path=/; max-age=0';
	}
};

/**
 * Prevents redirect loops by tracking redirect attempts
 */
export const canRedirect = () => {
	if (typeof window === 'undefined') return false;

	const lastRedirect = localStorage.getItem('redirectStarted');
	const redirectCount = parseInt(
		localStorage.getItem('redirectCount') || '0',
		10
	);

	if (lastRedirect) {
		const timeSinceRedirect = Date.now() - parseInt(lastRedirect, 10);
		if (timeSinceRedirect < 2000 || redirectCount > 3) {
			console.log('Recent redirect detected, preventing redirect loop');
			localStorage.removeItem('redirectStarted');
			localStorage.removeItem('redirectCount');
			return false;
		}
	}

	// Update redirect tracking
	localStorage.setItem('redirectCount', (redirectCount + 1).toString());
	localStorage.setItem('redirectStarted', Date.now().toString());

	// Auto-reset after 10 seconds
	setTimeout(() => {
		localStorage.setItem('redirectCount', '0');
	}, 10000);

	return true;
};
