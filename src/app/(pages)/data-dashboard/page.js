'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import Image from 'next/image';
import Link from 'next/link';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/config/firebase';

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
	const [brackets, setBrackets] = useState([]);

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
	// Fetch user brackets after auth is confirmed
	useEffect(() => {
		// Only run this effect after auth state is determined
		if (!isAuthenticated) return;

		const fetchUserBrackets = async () => {
			// Only proceed if auth is no longer loading

			// If no user is logged in, we'll show the login prompt (handled in render)
			if (!user) return;

			try {
				// Query Firestore for all of the user's brackets
				const bracketsRef = collection(db, 'brackets');
				const q = query(
					bracketsRef,
					where('userId', '==', user.uid),
					orderBy('createdAt', 'desc')
				);

				console.log('Querying for brackets with userId:', user.uid);
				const querySnapshot = await getDocs(q);

				// Process brackets
				const userBrackets = [];
				querySnapshot.forEach((doc) => {
					const data = doc.data();
					userBrackets.push({
						id: doc.id,
						name: data.name || 'Unnamed Bracket',
						createdAt: data.createdAt?.toDate() || new Date(),
						points: data.points || 0,
						maxPossible: data.maxPossible || 192,
						tournamentName:
							data.tournamentName || 'NCAA Tournament',
					});
				});

				console.log(`Found ${userBrackets.length} brackets for user`);
				setBrackets(userBrackets);
			} catch (err) {
				console.error('Error fetching user brackets:', err);
				setError(
					`Error loading your brackets: ${
						err.message || 'Unknown error'
					}`
				);
			}
		};

		// Only try to find brackets if user is logged in
		if (user && user.uid) {
			fetchUserBrackets();
		} else {
			console.log('User not authenticated, redirecting to login');
		}
	}, [isAuthenticated, user]);

	// Loading state
	if (!mounted || !isAuthenticated) {
		return (
			<div className='min-h-screen bg-base-100 flex items-center justify-center'>
				<div className='loading loading-spinner loading-lg'></div>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-gradient-to-b from-base-200 to-neutral'>
			{/* Hero header with accent border */}
			<div className='relative py-8 md:py-12 px-4 text-center bg-primary text-primary-content shadow-md'>
				<div className='absolute bottom-0 left-0 w-full h-1 bg-secondary'></div>
				<h1 className='text-3xl sm:text-4xl md:text-5xl font-black mb-3 md:mb-4 tracking-tight'>
					Bracket Dashboard
				</h1>
				<p className='text-base md:text-xl opacity-90 max-w-3xl mx-auto'>
					Welcome back,{' '}
					<span className='font-bold text-accent'>
						{user?.displayName ||
							user?.email?.split('@')[0] ||
							'there'}
					</span>
					!
				</p>

				{/* Decorative basketball pattern */}
				<div className='absolute top-0 left-0 w-full h-full opacity-10 z-0 overflow-hidden pointer-events-none'>
					<div className="absolute inset-0 bg-[url('/basketball-pattern.svg')] bg-repeat"></div>
				</div>
			</div>

			{/* Bracket Creation Card with enhanced styling */}
			<div className='relative bg-base-100 py-8 md:py-12 mb-8 md:mb-10 px-4 md:px-6 shadow-inner'>
				<div className='container mx-auto'>
					<div className='flex flex-col lg:flex-row items-center gap-6 md:gap-8'>
						<div className='w-full lg:w-3/5 text-center lg:text-left'>
							<h2 className='text-2xl md:text-3xl font-bold mb-3 text-primary'>
								Create Your March Madness Bracket!
							</h2>

							{isBeforeDeadline ? (
								<>
									<p className='py-3 text-base-content/80 text-sm md:text-base mb-2'>
										The tournament is about to begin! Create
										your bracket before Thursday at noon to
										join the competition.
									</p>

									<div className='py-2 flex justify-center lg:justify-start'>
										<div
											className={`badge badge-lg ${
												deadlineInfo.urgent
													? 'badge-error animate-pulse'
													: 'badge-warning'
											} gap-1 text-xs md:text-sm px-3 py-3 shadow-md`}
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

									<div className='mt-6 flex justify-center lg:justify-start'>
										<Link
											href='/brackets/create'
											className='btn btn-secondary btn-lg shadow-lg transform hover:-translate-y-1 transition-all duration-200'
										>
											Create My Bracket
											<svg
												xmlns='http://www.w3.org/2000/svg'
												className='h-5 w-5 ml-1'
												viewBox='0 0 20 20'
												fill='currentColor'
											>
												<path
													fillRule='evenodd'
													d='M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z'
													clipRule='evenodd'
												/>
											</svg>
										</Link>
									</div>
								</>
							) : (
								<>
									<p className='py-3 text-base-content/80 text-sm md:text-base mb-2'>
										The tournament has already begun! You
										can view the leaderboard.
									</p>
									<div className='mt-6 flex justify-center lg:justify-start'>
										<Link
											href='/brackets/leaderboard'
											className='btn btn-secondary btn-lg shadow-lg transform hover:-translate-y-1 transition-all duration-200'
										>
											View Leaderboard
											<svg
												xmlns='http://www.w3.org/2000/svg'
												className='h-5 w-5 ml-1'
												viewBox='0 0 20 20'
												fill='currentColor'
											>
												<path
													fillRule='evenodd'
													d='M3 3a1 1 0 000 2h10.188L3.594 14.594a1 1 0 001.414 1.414L14.6 6.414V16.5a1 1 0 102 0v-13A.5.5 0 0016.1 3H3z'
													clipRule='evenodd'
												/>
											</svg>
										</Link>
									</div>
								</>
							)}
						</div>

						<div className='w-full lg:w-2/5 flex justify-center'>
							<div className='w-64 h-64 rounded-full bg-base-300 relative overflow-hidden border-4 border-secondary shadow-xl'>
								<div className="absolute inset-0 bg-[url('/basketball-icon.svg')] bg-center bg-contain bg-no-repeat opacity-30"></div>
								<div className='absolute inset-0 flex items-center justify-center'>
									<div className='text-5xl font-black text-primary'>
										{isBeforeDeadline ? '2025' : 'LIVE'}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Decorative dots */}
				<div
					className='absolute bottom-0 left-0 w-full overflow-hidden h-4'
					style={{ transform: 'translateY(50%)' }}
				>
					<div className='flex justify-center space-x-2'>
						<div className='w-2 h-2 rounded-full bg-secondary'></div>
						<div className='w-2 h-2 rounded-full bg-secondary'></div>
						<div className='w-2 h-2 rounded-full bg-secondary'></div>
					</div>
				</div>
			</div>

			{/* AI Models Section - with gradient and enhanced styling */}
			<div className='bg-gradient-to-r from-primary to-primary-focus text-primary-content py-10 md:py-16 px-4 md:px-6 relative'>
				<div className='absolute top-0 left-0 w-full h-1 bg-accent'></div>
				<div className='container mx-auto'>
					<div className='flex flex-col lg:flex-row-reverse gap-8 items-center'>
						<div className='w-full lg:w-1/2 flex flex-col justify-center items-center lg:items-start'>
							<h2 className='text-2xl md:text-3xl font-bold mb-4 flex items-center'>
								<svg
									className='w-8 h-8 mr-3 text-accent'
									fill='currentColor'
									viewBox='0 0 20 20'
								>
									<path d='M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z'></path>
								</svg>
								AI Bracket Predictions
							</h2>
							<div className='w-24 h-1 bg-accent mb-6 rounded-full'></div>

							<p className='text-sm md:text-base mb-6 text-primary-content text-opacity-90 max-w-lg'>
								Our AI models analyze tournament data, team
								stats, and real-time information to predict
								outcomes with impressive accuracy.
							</p>

							{/* List items with improved styling */}
							<div className='grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 w-full'>
								<div className='flex items-start bg-primary-focus/30 p-3 rounded-lg border-l-2 border-accent transform hover:translate-x-1 transition-transform duration-200'>
									<svg
										className='w-5 h-5 mt-1 flex-shrink-0 text-accent'
										fill='currentColor'
										viewBox='0 0 20 20'
									>
										<path
											fillRule='evenodd'
											d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
											clipRule='evenodd'
										/>
									</svg>
									<span className='ml-3 font-medium'>
										AI predictions for upcoming games
									</span>
								</div>

								<div className='flex items-start bg-primary-focus/30 p-3 rounded-lg border-l-2 border-accent transform hover:translate-x-1 transition-transform duration-200'>
									<svg
										className='w-5 h-5 mt-1 flex-shrink-0 text-accent'
										fill='currentColor'
										viewBox='0 0 20 20'
									>
										<path
											fillRule='evenodd'
											d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
											clipRule='evenodd'
										/>
									</svg>
									<span className='ml-3 font-medium'>
										Real-time bracket analytics
									</span>
								</div>

								<div className='flex items-start bg-primary-focus/30 p-3 rounded-lg border-l-2 border-accent transform hover:translate-x-1 transition-transform duration-200'>
									<svg
										className='w-5 h-5 mt-1 flex-shrink-0 text-accent'
										fill='currentColor'
										viewBox='0 0 20 20'
									>
										<path
											fillRule='evenodd'
											d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
											clipRule='evenodd'
										/>
									</svg>
									<span className='ml-3 font-medium'>
										Human vs AI bracket comparisons
									</span>
								</div>

								<div className='flex items-start bg-primary-focus/30 p-3 rounded-lg border-l-2 border-accent transform hover:translate-x-1 transition-transform duration-200'>
									<svg
										className='w-5 h-5 mt-1 flex-shrink-0 text-accent'
										fill='currentColor'
										viewBox='0 0 20 20'
									>
										<path
											fillRule='evenodd'
											d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
											clipRule='evenodd'
										/>
									</svg>
									<span className='ml-3 font-medium'>
										Game probability visualizations
									</span>
								</div>
							</div>
						</div>

						<div className='w-full lg:w-1/2'>
							{/* Stats section with glass effect */}
							<div className='bg-primary-focus/20 backdrop-blur-sm rounded-xl p-6 border-2 border-accent/30 shadow-2xl'>
								<h3 className='text-xl font-bold mb-4 text-center text-accent'>
									AI Performance Stats
								</h3>

								<div className='stats bg-primary-focus/50 text-primary-content shadow-inner w-full'>
									<div className='stat py-4 px-6'>
										<div className='stat-figure text-accent'>
											<svg
												className='w-8 h-8'
												fill='currentColor'
												viewBox='0 0 20 20'
											>
												<path d='M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z' />
											</svg>
										</div>
										<div className='stat-title text-primary-content text-opacity-80'>
											Data Points
										</div>
										<div className='stat-value text-2xl md:text-3xl font-black'>
											10M+
										</div>
										<div className='stat-desc text-accent'>
											Per tournament
										</div>
									</div>

									<div className='stat py-4 px-6'>
										<div className='stat-figure text-accent'>
											<svg
												className='w-8 h-8'
												fill='currentColor'
												viewBox='0 0 20 20'
											>
												<path
													fillRule='evenodd'
													d='M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z'
													clipRule='evenodd'
												/>
											</svg>
										</div>
										<div className='stat-title text-primary-content text-opacity-80'>
											AI Models
										</div>
										<div className='stat-value text-2xl md:text-3xl font-black'>
											4
										</div>
										<div className='stat-desc text-accent'>
											Competing systems
										</div>
									</div>
								</div>

								<div className='mt-6 flex justify-center'>
									<div className='text-sm text-center max-w-sm text-primary-content text-opacity-90'>
										<span className='font-semibold'>
											Did you know?
										</span>{' '}
										Our AI correctly predicted 73% of games
										in last year's tournament, outperforming
										98% of human brackets!
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Resources Section - with enhanced cards */}
			<div className='py-12 md:py-16 px-4 md:px-8 bg-base-200'>
				<div className='container mx-auto'>
					<div className='text-center mb-10'>
						<h2 className='text-2xl md:text-3xl font-bold inline-block relative'>
							Tournament Resources
							<div className='absolute bottom-0 left-0 w-full h-1 bg-secondary transform translate-y-2'></div>
						</h2>
						<p className='text-base-content/70 mt-4 max-w-2xl mx-auto'>
							Everything you need to dominate your March Madness
							bracket challenge
						</p>
					</div>

					{/* 3-column grid with enhanced cards */}
					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8'>
						{/* Card 1 - My Brackets */}
						<div className='card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-t-4 border-secondary overflow-hidden'>
							<div className='absolute top-0 right-0 w-16 h-16 bg-secondary/10 rounded-full -mt-8 -mr-8'></div>
							<div className='card-body p-6'>
								<h3 className='card-title text-xl md:text-2xl flex items-center gap-2 text-primary'>
									<svg
										className='w-6 h-6 text-secondary'
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
								<div className='w-16 h-1 bg-secondary/50 rounded-full my-2'></div>
								<p className='text-base text-base-content/80 py-3'>
									View and track all your submitted brackets
									for this tournament. Compare predictions
									with actual results in real-time.
								</p>
								<div className='card-actions justify-end mt-4'>
									{brackets && brackets.length > 0 ? (
										<Link
											href={`/brackets/view/bracketview?id=${brackets[0].id}`}
											className='btn btn-secondary btn-md'
										>
											View My Bracket
										</Link>
									) : (
										<Link
											href='/brackets/view'
											className='btn btn-secondary btn-md'
										>
											View Brackets
										</Link>
									)}
								</div>
							</div>
						</div>

						{/* Card 2 - Leaderboard */}
						<div className='card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-t-4 border-secondary overflow-hidden'>
							<div className='absolute top-0 right-0 w-16 h-16 bg-secondary/10 rounded-full -mt-8 -mr-8'></div>
							<div className='card-body p-6'>
								<h3 className='card-title text-xl md:text-2xl flex items-center gap-2 text-primary'>
									<svg
										className='w-6 h-6 text-secondary'
										fill='currentColor'
										viewBox='0 0 20 20'
									>
										<path d='M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z' />
									</svg>
									Leaderboard
								</h3>
								<div className='w-16 h-1 bg-secondary/50 rounded-full my-2'></div>
								<p className='text-base text-base-content/80 py-3'>
									See how your brackets stack up against other
									participants and our AI models. Track your
									ranking as games unfold.
								</p>
								<div className='card-actions justify-end mt-4'>
									<Link
										href='/brackets/leaderboard'
										className='btn btn-primary btn-md'
									>
										Check Rankings
									</Link>
								</div>
							</div>
						</div>

						{/* Card 3 - Tournament Schedule */}
						<div className='card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-t-4 border-secondary overflow-hidden'>
							<div className='absolute top-0 right-0 w-16 h-16 bg-secondary/10 rounded-full -mt-8 -mr-8'></div>
							<div className='card-body p-6'>
								<h3 className='card-title text-xl md:text-2xl flex items-center gap-2 text-primary'>
									<svg
										className='w-6 h-6 text-secondary'
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
								<div className='w-16 h-1 bg-secondary/50 rounded-full my-2'></div>
								<p className='text-base text-base-content/80 py-3'>
									View the complete schedule of games and
									results as they happen. Never miss a crucial
									matchup again.
								</p>
								<div className='card-actions justify-end mt-4'>
									<button className='btn btn-outline btn-secondary btn-md'>
										Coming Soon
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Footer with quick stats */}
			<div className='bg-base-300 py-6 px-4'>
				<div className='container mx-auto flex flex-col md:flex-row justify-between items-center'>
					<div className='text-sm text-base-content/70 mb-4 md:mb-0'>
						<span className='font-medium'>Proper Picks</span> • 2025
						Tournament Edition
					</div>

					<div className='flex space-x-6'>
						<div className='flex items-center'>
							<span className='text-xs text-base-content/60 mr-2'>
								BRACKETS:
							</span>
							<span className='font-bold text-primary'>
								{brackets?.length || 0}
							</span>
						</div>

						<div className='flex items-center'>
							<span className='text-xs text-base-content/60 mr-2'>
								NEXT GAME:
							</span>
							<span className='font-bold text-secondary'>
								MAR 21
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
