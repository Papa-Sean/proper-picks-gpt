'use client';

import { useState, useEffect } from 'react';
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

	const validateForm = () => {
		const newErrors = {};
		if (!formData.email) newErrors.email = 'Email is required';
		if (!formData.password) newErrors.password = 'Password is required';
		return newErrors;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		const newErrors = validateForm();

		if (Object.keys(newErrors).length === 0) {
			setLoading(true);
			try {
				console.log('Attempting login with:', formData.email);
				await login(formData.email, formData.password);
				console.log('Login succeeded, will redirect soon');

				// Let the auth state update before redirecting
				setTimeout(() => {
					// Check for redirect URL in query params or session storage
					const redirectUrl = getRedirectUrl();
					router.push(redirectUrl || '/data-dashboard');
				}, 500);
			} catch (err) {
				console.error('Login failed:', err);
				setErrors({
					submit: 'Failed to login. Please check your credentials.',
				});
				setLoading(false);
			}
		} else {
			setErrors(newErrors);
		}
	};

	const getRedirectUrl = () => {
		if (typeof window !== 'undefined') {
			// First check URL params
			const params = new URLSearchParams(window.location.search);
			const urlRedirect =
				params.get('redirect') || params.get('callbackUrl');

			// Then check session storage
			const sessionRedirect = sessionStorage.getItem('authRedirect');

			// Clear session storage redirect
			if (sessionRedirect) {
				sessionStorage.removeItem('authRedirect');
			}

			return urlRedirect || sessionRedirect || '/data-dashboard';
		}
		return '/data-dashboard';
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
			await signInWithGoogle();

			// Let the auth state update before redirecting
			setTimeout(() => {
				const redirectUrl = getRedirectUrl();
				router.push(redirectUrl || '/data-dashboard');
			}, 500);
		} catch (err) {
			console.error('Google sign-in failed:', err);
			setErrors({
				submit: 'Failed to sign in with Google. Please try again.',
			});
			setLoading(false);
		}
	};

	// If already logged in, redirect
	useEffect(() => {
		if (!isLoading && isAuthenticated) {
			const redirectUrl = getRedirectUrl();
			router.push(redirectUrl || '/data-dashboard');
		}
	}, [isAuthenticated, isLoading, router]);

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
							{loading ? 'Signing in...' : 'Sign in'}
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
