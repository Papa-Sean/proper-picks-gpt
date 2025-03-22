'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
	signInWithEmailAndPassword,
	createUserWithEmailAndPassword,
	signOut,
	signInWithPopup,
	GoogleAuthProvider,
} from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import { setUser, clearUser } from '@/store/authSlice';
import { syncAuthState, canRedirect } from '@/utils/authSync';

export function useAuth() {
	const { user, isAuthenticated } = useSelector((state) => state.auth);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const dispatch = useDispatch();
	const [isClientSide, setIsClientSide] = useState(false);

	useEffect(() => {
		setIsClientSide(true);

		// After we confirm we're on client-side, check if we should be loading
		const checkAuth = setTimeout(() => {
			setIsLoading(false);
		}, 1000);

		return () => clearTimeout(checkAuth);
	}, []);

	const login = useCallback(async (email, password) => {
		setIsLoading(true);
		setError(null);
		try {
			const userCredential = await signInWithEmailAndPassword(
				auth,
				email,
				password
			);
			return userCredential.user;
		} catch (err) {
			setError(err.message);
			throw err;
		} finally {
			setIsLoading(false);
		}
	}, []);

	const signup = useCallback(async (email, password) => {
		setIsLoading(true);
		setError(null);
		try {
			const userCredential = await createUserWithEmailAndPassword(
				auth,
				email,
				password
			);
			return userCredential.user;
		} catch (err) {
			setError(err.message);
			throw err;
		} finally {
			setIsLoading(false);
		}
	}, []);

	const logout = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		try {
			// Clear localStorage first to prevent redirect race conditions
			if (typeof window !== 'undefined') {
				localStorage.removeItem('auth');
				localStorage.removeItem('redirectStarted');
				localStorage.removeItem('redirectCount');
			}

			// Then sign out from Firebase
			await signOut(auth);
			dispatch(clearUser());

			return true;
		} catch (err) {
			setError(err.message);
			throw err;
		} finally {
			setIsLoading(false);
		}
	}, [dispatch]);

	const signInWithGoogle = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		try {
			const provider = new GoogleAuthProvider();
			const userCredential = await signInWithPopup(auth, provider);
			return userCredential.user;
		} catch (err) {
			setError(err.message);
			throw err;
		} finally {
			setIsLoading(false);
		}
	}, []);

	const refreshUserToken = async () => {
		if (!isClientSide) return;

		try {
			if (auth.currentUser) {
				// Force token refresh
				await auth.currentUser.getIdToken(true);
				console.log('User token refreshed');

				// Check if user is admin in Firestore
				const adminDocRef = doc(db, 'settings', 'admins');
				const adminDoc = await getDoc(adminDocRef);

				if (adminDoc.exists()) {
					const data = adminDoc.data();
					const adminIds = data.adminIds || [];
					const isUserAdmin = adminIds.includes(auth.currentUser.uid);

					// Save admin status to localStorage for persistence
					const currentAuth = JSON.parse(
						localStorage.getItem('auth') || '{}'
					);
					localStorage.setItem(
						'auth',
						JSON.stringify({
							...currentAuth,
							user: {
								...(currentAuth.user || {}),
								isAdmin: isUserAdmin,
							},
							isAdmin: isUserAdmin,
							timestamp: Date.now(),
						})
					);

					// Update Redux store with refreshed admin status
					dispatch(
						setUser({
							...(auth.currentUser || {}),
							uid: auth.currentUser.uid,
							email: auth.currentUser.email,
							displayName:
								auth.currentUser.displayName ||
								auth.currentUser.email?.split('@')[0] ||
								'User',
							photoURL: auth.currentUser.photoURL,
							isAdmin: isUserAdmin,
						})
					);

					return isUserAdmin;
				}
			}
		} catch (err) {
			console.error('Error refreshing token:', err);
		}

		return false;
	};

	return {
		user,
		isAuthenticated,
		isAdmin: user?.isAdmin || false,
		isLoading,
		error,
		login,
		signup,
		logout,
		signInWithGoogle,
		refreshUserToken,
		isClientSide,
	};
}
