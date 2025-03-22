import { canRedirect } from './authSync';

/**
 * Safely navigate to a URL, preventing redirect loops
 */
export const safeNavigate = (url, router) => {
	if (typeof window === 'undefined') return false;

	if (!canRedirect()) {
		console.log('Navigation blocked to prevent redirect loop');
		return false;
	}

	if (router && typeof router.push === 'function') {
		// Use Next.js router if available
		router.push(url);
	} else {
		// Fallback to window.location
		window.location.href = url;
	}

	return true;
};
