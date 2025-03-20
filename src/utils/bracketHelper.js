// src/utils/bracketHelper.js

/**
 * Handles direct navigation to bracket pages from various entry points
 */
export const handleBracketNavigation = (router, bracketId) => {
	if (!bracketId) return false;

	console.log(`Navigating to bracket: ${bracketId}`);

	// Clean up any temporary storage
	if (typeof window !== 'undefined') {
		sessionStorage.removeItem('bracketId');
		sessionStorage.removeItem('redirectToBracket');
	}

	// Use router to navigate
	router.push(`/brackets/view/${bracketId}`);
	return true;
};

/**
 * Extracts bracket ID from various sources (URL, session storage, etc.)
 */
export const getBracketId = (params) => {
	// Priority 1: Get from route params
	if (params?.id && params.id !== 'fallback') {
		return params.id;
	}

	// Priority 2: Get from session storage (for direct navigation)
	if (typeof window !== 'undefined') {
		const bracketId = sessionStorage.getItem('bracketId');
		if (bracketId) {
			return bracketId;
		}

		// Priority 3: Check URL query parameters
		const urlParams = new URLSearchParams(window.location.search);
		const redirectBracketId = urlParams.get('redirectToBracket');
		if (redirectBracketId) {
			return redirectBracketId;
		}
	}

	return null;
};
