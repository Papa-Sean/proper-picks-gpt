'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthInput from '@/components/AuthInput';
import { useAuth } from '@/hooks/useAuth';
import GoogleSignInButton from '@/components/GoogleSignInButton';

export default function Register() {
	const router = useRouter();
	const { signup, signInWithGoogle } = useAuth();
	const [formData, setFormData] = useState({
		email: '',
		password: '',
		confirmPassword: '',
	});
	const [errors, setErrors] = useState({});
	const [loading, setLoading] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const validateForm = () => {
		const newErrors = {};
		if (!formData.email) newErrors.email = 'Email is required';
		if (!formData.password) newErrors.password = 'Password is required';
		if (!formData.confirmPassword)
			newErrors.confirmPassword = 'Please confirm your password';
		if (formData.password !== formData.confirmPassword) {
			newErrors.confirmPassword = 'Passwords do not match';
		}
		return newErrors;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		const newErrors = validateForm();

		if (Object.keys(newErrors).length === 0) {
			setLoading(true);
			try {
				await signup(formData.email, formData.password);
				router.push('/data-dashboard');
			} catch (err) {
				setErrors({
					submit: 'Failed to create account. Please try again.',
				});
			} finally {
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
			await signInWithGoogle();
			router.push('/data-dashboard');
		} catch (err) {
			setErrors({
				submit: 'Failed to sign in with Google. Please try again.',
			});
		}
	};

	return (
		<div className='min-h-screen bg-base-100 py-8 px-4 sm:px-6 lg:px-8'>
			<div className='max-w-7xl mx-auto'>
				<div className='text-center mb-12'>
					<h1 className='text-4xl sm:text-5xl md:text-6xl font-bold mb-4'>
						Create Account
					</h1>
					<p className='text-xl sm:text-2xl text-gray-600 dark:text-gray-300'>
						Join Proper Picks today
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
						<AuthInput
							label='Confirm Password'
							type='password'
							name='confirmPassword'
							value={formData.confirmPassword}
							onChange={handleChange}
							error={errors.confirmPassword}
						/>
						<button
							type='submit'
							disabled={loading}
							className='btn btn-primary btn-block mt-6'
						>
							{loading ? 'Creating account...' : 'Create account'}
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
								<div className='bg-white dark:bg-gray-800 rounded-lg p-8 max-w-sm w-full mx-4 shadow-xl'>
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
							className=' hover:text-indigo-500'
						>
							Already have an account? Sign in
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
