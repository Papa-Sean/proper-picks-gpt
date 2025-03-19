'use client';

import { useState, useEffect, useCallback } from 'react';
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
	const [redirectAttempted, setRedirectAttempted] = useState(false);

	// Extract getRedirectUrl as a proper function with useCallback
	const getRedirectUrl = useCallback(() => {
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

	const handleSubmit = async (e) => {
		e.preventDefault();
		const newErrors = validateForm();

		if (Object.keys(newErrors).length === 0) {
			setLoading(true);
			try {
				console.log('Attempting login with:', formData.email);

				// Flag to prevent double redirects
				sessionStorage.setItem('loginInProgress', 'true');

				await login(formData.email, formData.password);
				console.log('Login API call succeeded');

				// Get redirect destination
				const redirectUrl = getRedirectUrl();
				console.log('Will redirect to:', redirectUrl);

				// Safe redirect with a timeout to allow state to update
				setTimeout(() => {
					sessionStorage.removeItem('loginInProgress');

					// Force navigation with window.location
					window.location.href = redirectUrl;
				}, 500);
			} catch (err) {
				console.error('Login failed:', err);
				setErrors({
					submit: 'Failed to login. Please check your credentials.',
				});
				sessionStorage.removeItem('loginInProgress');
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

	const handleGoogleSignIn = async () => {
		try {
			setLoading(true);
			console.log('Attempting Google sign-in');

			// Set login in progress flag
			sessionStorage.setItem('loginInProgress', 'true');

			await signInWithGoogle();
			console.log('Google sign-in succeeded');

			// Get redirect URL
			const redirectUrl = getRedirectUrl();
			console.log('Will redirect to:', redirectUrl);

			// Use a direct page navigation rather than Next.js router
			setTimeout(() => {
				sessionStorage.removeItem('loginInProgress');
				window.location.href = redirectUrl;
			}, 500);
		} catch (err) {
			console.error('Google sign-in failed:', err);
			setErrors({
				submit: 'Failed to sign in with Google. Please try again.',
			});
			sessionStorage.removeItem('loginInProgress');
			setLoading(false);
		}
	};

	// Handle authenticated users already on the login page
	useEffect(() => {
		// Only run this once to prevent infinite loops
		if (redirectAttempted) return;

		// Make sure we have auth state and aren't in the middle of logging in
		const inLoginProcess =
			typeof window !== 'undefined' &&
			sessionStorage.getItem('loginInProgress');

		if (!isLoading && isAuthenticated && !inLoginProcess) {
			console.log('Already authenticated, redirecting from login page');
			setRedirectAttempted(true);

			// Simple timeout to ensure this runs after all other effects
			setTimeout(() => {
				const destination = getRedirectUrl();
				window.location.href = destination;
			}, 100);
		}
	}, [isAuthenticated, isLoading, getRedirectUrl, redirectAttempted]);

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
