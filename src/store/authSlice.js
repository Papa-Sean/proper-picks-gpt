import { createSlice } from '@reduxjs/toolkit';

// Load initial state from localStorage if available
const loadAuthState = () => {
	if (typeof window === 'undefined') {
		return { user: null, isAuthenticated: false };
	}

	try {
		const serializedAuth = localStorage.getItem('auth');
		if (serializedAuth === null) {
			return { user: null, isAuthenticated: false };
		}
		const parsedAuth = JSON.parse(serializedAuth);
		console.log('Loaded auth state from localStorage:', parsedAuth);
		return parsedAuth;
	} catch (err) {
		console.error('Error loading auth state:', err);
		return { user: null, isAuthenticated: false };
	}
};

// Function to set a cookie
const setCookie = (name, value, days = 7) => {
	if (typeof window === 'undefined') return;

	const expires = new Date();
	expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
	document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

// Function to delete a cookie
const deleteCookie = (name) => {
	if (typeof window === 'undefined') return;
	document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
};

const initialState = loadAuthState();

export const authSlice = createSlice({
	name: 'auth',
	initialState,
	reducers: {
		setUser: (state, action) => {
			state.user = action.payload;
			state.isAuthenticated = true;

			// Save to localStorage on the client side
			if (typeof window !== 'undefined') {
				localStorage.setItem('auth', JSON.stringify(state));
				console.log('Saved auth state to localStorage:', state);
			}
		},
		clearUser: (state) => {
			state.user = null;
			state.isAuthenticated = false;

			// Clear from localStorage on the client side
			if (typeof window !== 'undefined') {
				localStorage.removeItem('auth');
				console.log('Cleared auth state from localStorage');
			}
		},
	},
});

export const { setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;
