'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthInput from '@/components/AuthInput';
import { useAuth } from '@/hooks/useAuth';
import GoogleSignInButton from '@/components/GoogleSignInButton';

export default function Register() {
	const router = useRouter();
	const { signup, signInWithGoogle, isAuthenticated } = useAuth();
	const [formData, setFormData] = useState({
		email: '',
		password: '',
		confirmPassword: '',
	});
	const [errors, setErrors] = useState({});
	const [loading, setLoading] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [redirectInProgress, setRedirectInProgress] = useState(false);

	// Check if user is already authenticated
	useEffect(() => {
		if (isAuthenticated && !redirectInProgress) {
			console.log('User already authenticated, redirecting to dashboard');
			router.push('/data-dashboard');
		}
	}, [isAuthenticated, router, redirectInProgress]);

	const validateForm = () => {
		const newErrors = {};
		if (!formData.email) newErrors.email = 'Email is required';
		if (!formData.password) newErrors.password = 'Password is required';
		if (!formData.confirmPassword)
			newErrors.confirmPassword = 'Please confirm your password';
		if (formData.password !== formData.confirmPassword) {
			newErrors.confirmPassword = 'Passwords do not match';
		}

		// Validate password strength
		if (formData.password && formData.password.length < 6) {
			newErrors.password = 'Password must be at least 6 characters';
		}

		return newErrors;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		const newErrors = validateForm();

		if (Object.keys(newErrors).length === 0) {
			setLoading(true);
			try {
				console.log(
					'Attempting to create account with:',
					formData.email
				);
				await signup(formData.email, formData.password);

				// Set flag to prevent double redirects
				setRedirectInProgress(true);

				// Store a redirect flag in session storage
				if (typeof window !== 'undefined') {
					window.sessionStorage.setItem('accountCreated', 'true');
				}

				console.log('Account created successfully, redirecting...');

				// Use a small delay to ensure Firebase auth state has updated
				setTimeout(() => {
					router.push('/data-dashboard');
				}, 500);
			} catch (err) {
				console.error('Registration error:', err);

				// Extract the specific Firebase error message
				let errorMessage =
					'Failed to create account. Please try again.';

				// Map Firebase error codes to user-friendly messages
				if (err.code === 'auth/email-already-in-use') {
					errorMessage =
						'This email is already registered. Please use a different email or sign in.';
				} else if (err.code === 'auth/invalid-email') {
					errorMessage = 'Please enter a valid email address.';
				} else if (err.code === 'auth/weak-password') {
					errorMessage =
						'Password is too weak. Please use at least 6 characters.';
				} else if (err.code === 'auth/network-request-failed') {
					errorMessage =
						'Network error. Please check your internet connection and try again.';
				}

				setErrors({
					submit: errorMessage,
				});
				setLoading(false);
			}
		} else {
			setErrors(newErrors);
		}
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

			// Store a redirect flag to avoid redirect loops
			if (typeof window !== 'undefined') {
				window.sessionStorage.setItem('googleSignInAttempt', 'true');
			}

			await signInWithGoogle();

			// Set flag to prevent double redirects
			setRedirectInProgress(true);
			console.log('Google sign-in successful, redirecting...');

			// Use a more reliable approach with a small delay
			setTimeout(() => {
				router.push('/data-dashboard');
			}, 500);
		} catch (err) {
			console.error('Google sign-in error:', err);

			// Extract the specific Firebase error message
			let errorMessage =
				'Failed to sign in with Google. Please try again.';

			// Map Firebase error codes to user-friendly messages
			if (err.code === 'auth/popup-closed-by-user') {
				errorMessage =
					'Sign-in popup was closed before completion. Please try again.';
			} else if (err.code === 'auth/popup-blocked') {
				errorMessage =
					'Sign-in popup was blocked. Please allow popups for this site and try again.';
			} else if (err.code === 'auth/cancelled-popup-request') {
				errorMessage = 'Multiple popups detected. Please try again.';
			} else if (err.code === 'auth/network-request-failed') {
				errorMessage =
					'Network error. Please check your internet connection and try again.';
			}

			setErrors({
				submit: errorMessage,
			});

			if (typeof window !== 'undefined') {
				window.sessionStorage.removeItem('googleSignInAttempt');
			}

			setLoading(false);
		}
	};

	// Return early if already authenticated
	if (isAuthenticated && !loading) {
		return (
			<div className='min-h-screen bg-base-100 flex items-center justify-center'>
				<div className='text-center'>
					<div className='loading loading-spinner loading-lg'></div>
					<p className='mt-4'>Already signed in, redirecting...</p>
				</div>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-neutral py-8 px-4 sm:px-6 lg:px-8 overflow-x-hidden'>
			{' '}
			<div className='max-w-7xl mx-auto'>
				<div className='text-center mb-12'>
					<h1 className='text-4xl sm:text-5xl md:text-6xl text-secondary font-bold mb-4'>
						Create Account
					</h1>
					<p className='text-xl sm:text-2xl text-primary-content'>
						Join Proper Picks today
					</p>
				</div>

				<div className='bg-white dark:bg-base-300 rounded-lg shadow-xl p-6 sm:p-8 md:p-10 max-w-md mx-auto'>
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
							placeholder='Enter your email'
							autoComplete='email'
						/>
						<AuthInput
							label='Password'
							type='password'
							name='password'
							value={formData.password}
							onChange={handleChange}
							error={errors.password}
							placeholder='Create a password (min. 6 characters)'
							autoComplete='new-password'
						/>
						<AuthInput
							label='Confirm Password'
							type='password'
							name='confirmPassword'
							value={formData.confirmPassword}
							onChange={handleChange}
							error={errors.confirmPassword}
							placeholder='Confirm your password'
							autoComplete='new-password'
						/>
						<button
							type='submit'
							disabled={loading}
							className='btn btn-secondary btn-block mt-6'
						>
							{loading ? (
								<div className='flex items-center justify-center'>
									<span className='loading loading-spinner loading-sm mr-2'></span>
									Creating account...
								</div>
							) : (
								'Create account'
							)}
						</button>
						<div className='relative my-4'>
							<div className='absolute inset-0 flex items-center'>
								<div className='w-full border-t border-gray-300'></div>
							</div>
							<div className='relative flex justify-center text-sm'>
								<span className='px-2 bg-white dark:bg-base-300 text-gray-500'>
									Or
								</span>
							</div>
						</div>
						<GoogleSignInButton
							onClick={handleGoogleSignIn}
							disabled={loading}
						/>
						{/* Add Disclaimer Button */}
						<button
							type='button'
							onClick={() => setIsModalOpen(true)}
							className='btn btn-warning btn-block mt-3'
						>
							View Disclaimer
						</button>

						{/* Disclaimer Modal */}
						{isModalOpen && (
							<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
								<div className='bg-white dark:bg-base-300 rounded-lg p-8 max-w-sm w-full mx-4 shadow-xl'>
									<div className='text-center'>
										<h3 className='text-xl font-semibold mb-4 dark:text-white'>
											Important Disclaimer
										</h3>
										<p className='mb-6 text-gray-600 dark:text-gray-300'>
											I am pretty confident your data is
											safe because I'll be honest, I
											didn't write the code... If you
											trust Google, thats who is handling
											the ether but I also don't need to
											verify your email so dummy creds are
											just fine! Thx gang
										</p>
										<button
											onClick={() =>
												setIsModalOpen(false)
											}
											className='bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded transition-colors duration-200'
										>
											Heard
										</button>
									</div>
								</div>
							</div>
						)}
					</form>
					<div className='mt-6 text-center'>
						<Link
							href='/login'
							className='hover:text-indigo-500'
						>
							Already have an account? Sign in
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
