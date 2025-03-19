'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthInput from '@/components/AuthInput';
import { useAuth } from '@/hooks/useAuth';
import GoogleSignInButton from '@/components/GoogleSignInButton';

export default function Login() {
	const router = useRouter();
	const { login, signInWithGoogle, isAuthenticated, isLoading } = useAuth();
	const [formData, setFormData] = useState({
		email: '',
		password: '',
	});
	const [errors, setErrors] = useState({});
	const [loading, setLoading] = useState(false);

	// Use ref instead of state to track redirect attempts
	// This avoids hydration issues with state
	const redirectAttemptedRef = useRef(false);

	// Extract getRedirectUrl as a proper function with useCallback
	const getRedirectUrl = useCallback(() => {
		// Don't try to access browser APIs during SSR
		if (typeof window === 'undefined') return '/data-dashboard';

		// First check URL params
		const params = new URLSearchParams(window.location.search);
		const urlRedirect = params.get('redirect') || params.get('callbackUrl');

		// Then check session storage
		const sessionRedirect = sessionStorage.getItem('authRedirect');

		// Clear session storage redirect
		if (sessionRedirect) {
			sessionStorage.removeItem('authRedirect');
		}

		return urlRedirect || sessionRedirect || '/data-dashboard';
	}, []);

	// Update your handleSubmit function
	const handleSubmit = async (e) => {
		e.preventDefault();
		const newErrors = validateForm();

		if (Object.keys(newErrors).length === 0) {
			setLoading(true);
			try {
				console.log('Attempting login with:', formData.email);

				// Flag to prevent double redirects (client-side only)
				if (typeof window !== 'undefined') {
					window.sessionStorage.setItem('loginInProgress', 'true');
				}

				await login(formData.email, formData.password);
				console.log('Login API call succeeded');

				// Get redirect destination
				const redirectUrl = getRedirectUrl();
				console.log('Will redirect to:', redirectUrl);

				// Safe redirect with requestAnimationFrame for better browser timing
				if (typeof window !== 'undefined') {
					window.requestAnimationFrame(() => {
						window.sessionStorage.removeItem('loginInProgress');
						// Force navigation with window.location
						window.location.href = redirectUrl;
					});
				}
			} catch (err) {
				console.error('Login failed:', err);
				setErrors({
					submit: 'Failed to login. Please check your credentials.',
				});
				if (typeof window !== 'undefined') {
					window.sessionStorage.removeItem('loginInProgress');
				}
				setLoading(false);
			}
		} else {
			setErrors(newErrors);
		}
	};

	const handleLoginSubmit = async (e) => {
		e.preventDefault();
		const newErrors = validateForm();

		if (Object.keys(newErrors).length === 0) {
			setLoading(true);
			try {
				console.log('Attempting login with:', formData.email);

				// Flag to prevent double redirects (client-side only)
				if (typeof window !== 'undefined') {
					window.sessionStorage.setItem('loginInProgress', 'true');
				}

				await login(formData.email, formData.password);
				console.log('Login API call succeeded');

				// Clear any redirect markers
				if (typeof window !== 'undefined') {
					localStorage.removeItem('redirectStarted');
				}

				// Get redirect destination
				const redirectUrl = getRedirectUrl() || '/data-dashboard';
				console.log('Will redirect to:', redirectUrl);

				// For Netlify, use a simple redirect with slight delay
				setTimeout(() => {
					window.location.href = redirectUrl;
				}, 500);
			} catch (err) {
				console.error('Login failed:', err);
				setErrors({
					submit: 'Failed to login. Please check your credentials.',
				});
				if (typeof window !== 'undefined') {
					window.sessionStorage.removeItem('loginInProgress');
				}
				setLoading(false);
			}
		} else {
			setErrors(newErrors);
		}
	};

	const validateForm = () => {
		const newErrors = {};
		if (!formData.email) newErrors.email = 'Email is required';
		if (!formData.password) newErrors.password = 'Password is required';
		return newErrors;
	};

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
		// Clear error when user starts typing
		if (errors[name]) {
			setErrors((prev) => ({
				...prev,
				[name]: '',
			}));
		}
	};

	// Update your Google sign-in handler
	const handleGoogleSignIn = async () => {
		try {
			setLoading(true);
			console.log('Attempting Google sign-in');

			// Set login in progress flag (client-side only)
			if (typeof window !== 'undefined') {
				window.sessionStorage.setItem('loginInProgress', 'true');
			}

			await signInWithGoogle();
			console.log('Google sign-in succeeded');

			// Get redirect URL
			const redirectUrl = getRedirectUrl();
			console.log('Will redirect to:', redirectUrl);

			// Use requestAnimationFrame for more reliable browser timing
			if (typeof window !== 'undefined') {
				window.requestAnimationFrame(() => {
					window.sessionStorage.removeItem('loginInProgress');
					window.location.href = redirectUrl;
				});
			}
		} catch (err) {
			console.error('Google sign-in failed:', err);
			setErrors({
				submit: 'Failed to sign in with Google. Please try again.',
			});
			if (typeof window !== 'undefined') {
				window.sessionStorage.removeItem('loginInProgress');
			}
			setLoading(false);
		}
	};

	// Update the useEffect for authenticated users

	// Handle authenticated users already on the login page
	useEffect(() => {
		// Skip during SSR
		if (typeof window === 'undefined') return;

		// Only run this once using a ref
		if (redirectAttemptedRef.current) return;

		// Check if we're in the middle of a login process
		const inLoginProcess = sessionStorage.getItem('loginInProgress');

		// Only redirect if we're authenticated and not in the middle of logging in
		if (!isLoading && isAuthenticated && !inLoginProcess) {
			console.log('Already authenticated, redirecting from login page');
			redirectAttemptedRef.current = true;

			// Get the destination
			const destination = getRedirectUrl();
			console.log('Redirecting to:', destination);

			// IMPORTANT: Use history.replaceState to avoid browser history issues on Netlify
			if (
				window.history &&
				typeof window.history.replaceState === 'function'
			) {
				// Mark that we've started the redirect to prevent loops
				localStorage.setItem('redirectStarted', Date.now().toString());

				// Replace current URL with destination but don't navigate yet
				window.history.replaceState(null, '', destination);

				// Then use location.href for the actual navigation
				setTimeout(() => {
					window.location.href = destination;
				}, 100);
			} else {
				// Fallback for older browsers
				window.location.href = destination;
			}
		}
	}, [isAuthenticated, isLoading, getRedirectUrl]);

	// Rest of your component (no changes needed)
	return (
		<div className='min-h-screen bg-base-100 py-8 px-4 sm:px-6 lg:px-8'>
			<div className='max-w-7xl mx-auto'>
				<div className='text-center mb-12'>
					<h1 className='text-4xl sm:text-5xl md:text-6xl font-bold mb-4'>
						Sign In
					</h1>
					<p className='text-xl sm:text-2xl text-gray-600 dark:text-gray-300'>
						Access your Proper Picks account
					</p>
				</div>

				<div className='bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 sm:p-8 md:p-10 max-w-md mx-auto'>
					{errors.submit && (
						<div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4'>
							{errors.submit}
						</div>
					)}
					<form
						onSubmit={handleSubmit}
						className='space-y-6'
					>
						<AuthInput
							label='Email Address'
							type='email'
							name='email'
							value={formData.email}
							onChange={handleChange}
							error={errors.email}
						/>
						<AuthInput
							label='Password'
							type='password'
							name='password'
							value={formData.password}
							onChange={handleChange}
							error={errors.password}
						/>
						<button
							type='submit'
							disabled={loading}
							className='btn btn-primary btn-block mt-6'
						>
							{loading ? (
								<div className='flex items-center justify-center'>
									<span className='loading loading-spinner loading-sm mr-2'></span>
									Signing in...
								</div>
							) : (
								'Sign in'
							)}
						</button>
						<div className='relative my-4'>
							<div className='absolute inset-0 flex items-center'>
								<div className='w-full border-t border-gray-300'></div>
							</div>
							<div className='relative flex justify-center text-sm'>
								<span className='px-2 bg-white dark:bg-gray-800 text-gray-500'>
									Or
								</span>
							</div>
						</div>
						<GoogleSignInButton
							onClick={handleGoogleSignIn}
							disabled={loading}
						/>
					</form>
					<div className='mt-6 text-center'>
						<Link
							href='/register'
							className=' hover:text-indigo-500'
						>
							Don't have an account? Register
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
