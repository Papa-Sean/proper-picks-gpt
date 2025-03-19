'use client';

import { useState, useEffect } from 'react';
import { auth } from '@/config/firebase';
import {
	onAuthStateChanged,
	setPersistence,
	browserLocalPersistence,
	signInWithEmailAndPassword,
	signInWithPopup,
	GoogleAuthProvider,
	signOut,
} from 'firebase/auth';
import { useDispatch, useSelector } from 'react-redux';
import { setUser, clearUser } from '@/store/authSlice';

export function useAuth() {
	const dispatch = useDispatch();
	const { user, isAuthenticated } = useSelector((state) => state.auth);
	const [isLoading, setIsLoading] = useState(true);

	// Set up Firebase auth state listener
	useEffect(() => {
		console.log('Setting up auth state listener...');

		// Set persistence to LOCAL - this is crucial for login persistence
		setPersistence(auth, browserLocalPersistence).catch((error) => {
			console.error('Auth persistence error:', error);
		});

		const unsubscribe = onAuthStateChanged(auth, (authUser) => {
			console.log(
				'Auth state changed:',
				authUser ? 'User logged in' : 'No user'
			);

			if (authUser) {
				// User is signed in
				const userData = {
					uid: authUser.uid,
					email: authUser.email,
					displayName:
						authUser.displayName ||
						authUser.email?.split('@')[0] ||
						'User',
					photoURL: authUser.photoURL,
				};

				console.log('Dispatching setUser with:', userData);
				dispatch(setUser(userData));
			} else {
				// User is signed out
				console.log('Dispatching clearUser');
				dispatch(clearUser());
			}

			setIsLoading(false);
		});

		// Cleanup subscription on unmount
		return () => unsubscribe();
	}, [dispatch]);

	// Login with email/password
	const login = async (email, password) => {
		try {
			console.log('[AUTH] Logging in with email/password...');
			const userCredential = await signInWithEmailAndPassword(
				auth,
				email,
				password
			);
			console.log(
				'[AUTH] Login successful for user:',
				userCredential.user.uid
			);

			// Make sure Redux state is updated with the user
			const userData = {
				uid: userCredential.user.uid,
				email: userCredential.user.email,
				displayName:
					userCredential.user.displayName ||
					userCredential.user.email?.split('@')[0] ||
					'User',
				photoURL: userCredential.user.photoURL,
			};

			// Ensure the user data is set in Redux immediately
			dispatch(setUser(userData));

			console.log('[AUTH] User state updated in Redux');

			return userCredential.user;
		} catch (error) {
			console.error('[AUTH] Login error:', error.code, error.message);
			throw error;
		}
	};

	// Login with Google
	const signInWithGoogle = async () => {
		try {
			console.log('Logging in with Google...');
			const provider = new GoogleAuthProvider();
			const userCredential = await signInWithPopup(auth, provider);
			console.log('Google login successful:', userCredential.user.uid);
			return userCredential.user;
		} catch (error) {
			console.error('Google login error:', error.code, error.message);
			throw error;
		}
	};

	// Logout
	const logout = async () => {
		try {
			console.log('Signing out...');
			await signOut(auth);
			console.log('Sign out successful');
			return true;
		} catch (error) {
			console.error('Sign out error:', error);
			throw error;
		}
	};

	return {
		user,
		isAuthenticated,
		isLoading,
		login,
		signInWithGoogle,
		logout,
	};
}
