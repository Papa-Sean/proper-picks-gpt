'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import Image from 'next/image';
import Link from 'next/link';

// Create a wrapper component for client-side only features
function SearchParamsWrapper({ children }) {
	return <Suspense fallback={<DashboardSkeleton />}>{children}</Suspense>;
}

// Loading skeleton
function DashboardSkeleton() {
	return (
		<div className='min-h-screen bg-base-100 flex items-center justify-center'>
			<div className='loading loading-spinner loading-lg'></div>
		</div>
	);
}

export default function Dashboard() {
	return (
		<SearchParamsWrapper>
			<DashboardContent />
		</SearchParamsWrapper>
	);
}

function DashboardContent() {
	const router = useRouter();
	const { isAuthenticated, user } = useSelector((state) => state.auth);
	const [mounted, setMounted] = useState(false);
	const [isBeforeDeadline, setIsBeforeDeadline] = useState(true);
	const [deadlineInfo, setDeadlineInfo] = useState({
		text: 'Loading deadline information...',
		urgent: false,
	});

	// Authentication check and redirect
	useEffect(() => {
		setMounted(true);

		if (!isAuthenticated) {
			console.log('User not authenticated, redirecting to login');

			// Prevent redirect loops
			if (typeof window !== 'undefined') {
				const lastRedirect = localStorage.getItem('redirectStarted');
				if (lastRedirect) {
					const timeSinceRedirect =
						Date.now() - parseInt(lastRedirect, 10);
					if (timeSinceRedirect < 2000) {
						console.log(
							'Recent redirect detected, preventing redirect loop'
						);
						return;
					}
				}

				localStorage.setItem('redirectStarted', Date.now().toString());
				window.location.href = '/login';
			} else {
				router.push('/login');
			}
		}
	}, [isAuthenticated, router]);

	// Date calculations
	useEffect(() => {
		if (mounted) {
			const now = new Date();
			const tournamentDeadline = new Date('2025-03-20T12:00:00');
			const isBefore = now < tournamentDeadline;
			setIsBeforeDeadline(isBefore);

			if (!isBefore) {
				setDeadlineInfo({
					text: 'The deadline has passed!',
					urgent: false,
				});
			} else {
				const diffTime = Math.abs(tournamentDeadline - now);
				const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
				const diffHours = Math.floor(
					(diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
				);

				if (diffDays > 0) {
					setDeadlineInfo({
						text: `${diffDays}d ${diffHours}h left`, // Shorter for mobile
						urgent: diffDays < 2,
					});
				} else if (diffHours > 0) {
					setDeadlineInfo({
						text: `Only ${diffHours}h left!`,
						urgent: true,
					});
				} else {
					setDeadlineInfo({
						text: 'Under 1h left!',
						urgent: true,
					});
				}
			}
		}
	}, [mounted]);

	// Loading state
	if (!mounted || !isAuthenticated) {
		return (
			<div className='min-h-screen bg-base-100 flex items-center justify-center'>
				<div className='loading loading-spinner loading-lg'></div>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-base-100'>
			{/* Page Header - More compact on mobile */}
			<div className='text-center py-6 md:py-10 px-4'>
				<h1 className='text-3xl sm:text-4xl md:text-5xl font-bold mb-2 md:mb-4'>
					Dashboard
				</h1>
				<p className='text-base md:text-xl text-base-content/70 max-w-3xl mx-auto'>
					Welcome,{' '}
					<span className='font-semibold'>
						{user?.displayName ||
							user?.email?.split('@')[0] ||
							'there'}
					</span>
					!
				</p>
			</div>

			{/* Bracket Creation Card - Fixed responsive layout issues */}
			<div className='bg-base-200 py-8 md:py-12 mb-6 md:mb-8 px-4 md:px-6'>
				<div className='container mx-auto'>
					<div className='flex flex-col lg:flex-row items-center gap-6 md:gap-8'>
						{/* Image with proper responsive sizing */}

						{/* Content with better spacing for mobile */}
						<div className='w-full lg:w-1/2'>
							<h2 className='text-2xl md:text-3xl font-bold text-center lg:text-left'>
								Create Your March Madness Bracket!
							</h2>
							{isBeforeDeadline ? (
								<>
									<p className='py-3 md:py-4 text-sm md:text-base text-center lg:text-left'>
										The tournament is about to begin! Create
										your bracket before Thursday at noon to
										join the competition.
									</p>
									<div className='py-2 flex justify-center lg:justify-start'>
										<div
											className={`badge badge-lg ${
												deadlineInfo.urgent
													? 'badge-error'
													: 'badge-warning'
											} gap-1 text-xs md:text-sm px-3 py-3`}
										>
											<svg
												xmlns='http://www.w3.org/2000/svg'
												fill='none'
												viewBox='0 0 24 24'
												className='inline-block w-4 h-4 stroke-current'
											>
												<path
													strokeLinecap='round'
													strokeLinejoin='round'
													strokeWidth='2'
													d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
												></path>
											</svg>
											{deadlineInfo.text}
										</div>
									</div>
									<div className='mt-4 flex justify-center lg:justify-start'>
										<Link
											href='/brackets/create'
											className='btn btn-primary'
										>
											Create My Bracket
										</Link>
									</div>
								</>
							) : (
								<>
									<p className='py-3 md:py-4 text-sm md:text-base text-center lg:text-left'>
										The tournament has already begun! While
										you can't submit a new bracket, you can
										view the leaderboard.
									</p>
									<div className='mt-4 flex justify-center lg:justify-start'>
										<Link
											href='/brackets/leaderboard'
											className='btn btn-primary'
										>
											View Leaderboard
										</Link>
									</div>
								</>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* AI Models Section - Improved mobile layout */}
			<div className='bg-primary text-primary-content py-8 md:py-12 px-4 md:px-6'>
				<div className='container mx-auto'>
					<div className='flex flex-col lg:flex-row-reverse gap-6 items-center'>
						<div className='w-full lg:w-2/3'>
							<h2 className='text-2xl md:text-3xl font-bold text-center lg:text-left mb-3 md:mb-4'>
								AI Bracket Predictions
							</h2>
							<p className='py-2 md:py-3 text-sm md:text-base text-center lg:text-left'>
								Our AI models analyze tournament data, team
								stats, and real-time information to predict
								outcomes.
							</p>

							{/* List items in a grid for better mobile layout */}
							<div className='grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3 mt-2 md:mt-4'>
								<div className='flex items-start gap-2 text-sm md:text-base'>
									<svg
										className='w-5 h-5 mt-1 flex-shrink-0'
										fill='currentColor'
										viewBox='0 0 20 20'
									>
										<path
											fillRule='evenodd'
											d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
											clipRule='evenodd'
										/>
									</svg>
									<span>
										AI predictions for upcoming games
									</span>
								</div>
								<div className='flex items-start gap-2 text-sm md:text-base'>
									<svg
										className='w-5 h-5 mt-1 flex-shrink-0'
										fill='currentColor'
										viewBox='0 0 20 20'
									>
										<path
											fillRule='evenodd'
											d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
											clipRule='evenodd'
										/>
									</svg>
									<span>Real-time bracket analytics</span>
								</div>
								<div className='flex items-start gap-2 text-sm md:text-base'>
									<svg
										className='w-5 h-5 mt-1 flex-shrink-0'
										fill='currentColor'
										viewBox='0 0 20 20'
									>
										<path
											fillRule='evenodd'
											d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
											clipRule='evenodd'
										/>
									</svg>
									<span>Human vs AI bracket comparisons</span>
								</div>
								<div className='flex items-start gap-2 text-sm md:text-base'>
									<svg
										className='w-5 h-5 mt-1 flex-shrink-0'
										fill='currentColor'
										viewBox='0 0 20 20'
									>
										<path
											fillRule='evenodd'
											d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
											clipRule='evenodd'
										/>
									</svg>
									<span>Game probability visualizations</span>
								</div>
							</div>

							{/* Stats section with responsive design */}
							<div className='mt-6 flex justify-center lg:justify-start'>
								<div className='stats shadow flex-col sm:flex-row text-primary-content bg-primary-focus bg-opacity-50'>
									<div className='stat py-2 md:py-4 px-4 md:px-6'>
										<div className='stat-title text-primary-content text-opacity-80 text-xs md:text-sm'>
											Data Points
										</div>
										<div className='stat-value text-lg md:text-2xl'>
											10M+
										</div>
										<div className='stat-desc text-primary-content text-opacity-70 text-xs'>
											Per tournament
										</div>
									</div>
									<div className='stat py-2 md:py-4 px-4 md:px-6'>
										<div className='stat-title text-primary-content text-opacity-80 text-xs md:text-sm'>
											AI Models
										</div>
										<div className='stat-value text-lg md:text-2xl'>
											4
										</div>
										<div className='stat-desc text-primary-content text-opacity-70 text-xs'>
											Competing models
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Resources Section - Responsive grid */}
			<div className='py-8 md:py-12 px-4 md:px-6'>
				<div className='container mx-auto'>
					<h2 className='text-xl md:text-2xl font-bold text-center mb-6 md:mb-8'>
						Tournament Resources
					</h2>

					{/* 3-column grid that collapses to 1 column on mobile */}
					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6'>
						{/* Card 1 */}
						<div className='card bg-base-100 shadow-md hover:shadow-lg transition-shadow duration-300'>
							<div className='card-body p-4 md:p-6'>
								<h3 className='card-title text-lg md:text-xl flex items-center gap-2'>
									<svg
										className='w-5 h-5 text-primary'
										fill='currentColor'
										viewBox='0 0 20 20'
									>
										<path d='M9 2a1 1 0 000 2h2a1 1 0 100-2H9z' />
										<path
											fillRule='evenodd'
											d='M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z'
											clipRule='evenodd'
										/>
									</svg>
									My Brackets
								</h3>
								<p className='text-sm md:text-base text-base-content/70 py-2'>
									View and track all your submitted brackets
									for this tournament.
								</p>
								<div className='card-actions justify-end mt-2'>
									<Link
										href='/brackets/view'
										className='btn btn-sm md:btn-md btn-primary'
									>
										View Brackets
									</Link>
								</div>
							</div>
						</div>

						{/* Card 2 */}
						<div className='card bg-base-100 shadow-md hover:shadow-lg transition-shadow duration-300'>
							<div className='card-body p-4 md:p-6'>
								<h3 className='card-title text-lg md:text-xl flex items-center gap-2'>
									<svg
										className='w-5 h-5 text-primary'
										fill='currentColor'
										viewBox='0 0 20 20'
									>
										<path d='M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z' />
									</svg>
									Leaderboard
								</h3>
								<p className='text-sm md:text-base text-base-content/70 py-2'>
									See how your brackets stack up against other
									participants and our AI models.
								</p>
								<div className='card-actions justify-end mt-2'>
									<Link
										href='/brackets/leaderboard'
										className='btn btn-sm md:btn-md btn-primary'
									>
										Check Rankings
									</Link>
								</div>
							</div>
						</div>

						{/* Card 3 */}
						<div className='card bg-base-100 shadow-md hover:shadow-lg transition-shadow duration-300'>
							<div className='card-body p-4 md:p-6'>
								<h3 className='card-title text-lg md:text-xl flex items-center gap-2'>
									<svg
										className='w-5 h-5 text-primary'
										fill='currentColor'
										viewBox='0 0 20 20'
									>
										<path
											fillRule='evenodd'
											d='M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z'
											clipRule='evenodd'
										/>
									</svg>
									Tournament Schedule
								</h3>
								<p className='text-sm md:text-base text-base-content/70 py-2'>
									View the complete schedule of games and
									results as they happen.
								</p>
								<div className='card-actions justify-end mt-2'>
									<button className='btn btn-sm md:btn-md btn-outline'>
										Coming Soon
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
