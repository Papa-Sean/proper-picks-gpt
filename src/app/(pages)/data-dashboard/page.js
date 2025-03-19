'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import Image from 'next/image';
import Link from 'next/link';

export default function Dashboard() {
	const router = useRouter();
	const { isAuthenticated, user } = useSelector((state) => state.auth);
	// Use a ref for mounting status to avoid re-renders
	const [mounted, setMounted] = useState(false);
	// Initialize these with default values that will be the same on server and client
	const [isBeforeDeadline, setIsBeforeDeadline] = useState(true);
	const [deadlineInfo, setDeadlineInfo] = useState({
		text: 'Loading deadline information...',
		urgent: false,
	});

	// First useEffect - handle authentication check and redirect
	useEffect(() => {
		// Set mounted to true once component is mounted on client
		setMounted(true);

		// Check authentication and redirect if needed
		if (!isAuthenticated) {
			console.log('User not authenticated, redirecting to login');

			// Skip redirect if we've recently attempted one (prevents loops)
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

				// Mark that we're starting a redirect
				localStorage.setItem('redirectStarted', Date.now().toString());
				window.location.href = '/login';
			} else {
				router.push('/login');
			}
		}
	}, [isAuthenticated, router]);

	// Second useEffect - handle date calculations only when mounted
	useEffect(() => {
		// Only run this on the client after mount
		if (mounted) {
			// Calculate if it's before Thursday noon
			const now = new Date();
			const tournamentDeadline = new Date('2025-03-20T12:00:00');
			const isBefore = now < tournamentDeadline;
			setIsBeforeDeadline(isBefore);

			// Calculate days/hours remaining
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
						text: `${diffDays} days and ${diffHours} hours remaining`,
						urgent: diffDays < 2,
					});
				} else if (diffHours > 0) {
					setDeadlineInfo({
						text: `Only ${diffHours} hours remaining!`,
						urgent: true,
					});
				} else {
					setDeadlineInfo({
						text: 'Less than an hour remaining!',
						urgent: true,
					});
				}
			}
		}
	}, [mounted]);

	// Critical fix: Return a consistent loading UI during server rendering and initial client render
	if (!mounted || !isAuthenticated) {
		return (
			<div className='min-h-screen bg-base-100 flex items-center justify-center'>
				<div className='loading loading-spinner loading-lg'></div>
			</div>
		);
	}

	// Main UI - only rendered after client-side checks are complete
	return (
		<div className='min-h-screen bg-base-100'>
			<div className='text-center py-10 px-4'>
				<h1 className='text-4xl sm:text-5xl md:text-6xl font-bold mb-4'>
					Dashboard
				</h1>
				<p className='text-xl text-base-content/70 max-w-3xl mx-auto'>
					Welcome back, {user?.displayName || user?.email}! Check out
					the latest tournament information.
				</p>
			</div>

			{/* Hero section for bracket creation */}
			<div className='hero bg-base-200 py-12 mb-8'>
				<div className='hero-content flex-col lg:flex-row'>
					<Image
						src='/papaavatar.svg'
						alt='Tournament Brackets'
						width={300}
						height={300}
						className='max-w-sm rounded-lg shadow-2xl'
					/>
					<div className='lg:ml-8'>
						<h2 className='text-3xl font-bold'>
							Create Your March Madness Bracket!
						</h2>
						{isBeforeDeadline ? (
							<>
								<p className='py-4'>
									The tournament is about to begin! Create
									your bracket before Thursday at noon to join
									the fun and see how your picks compare to
									our AI models.
								</p>
								<div className='py-2'>
									<div
										className={`badge badge-lg ${
											deadlineInfo.urgent
												? 'badge-error'
												: 'badge-warning'
										} gap-2`}
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
								<Link
									href='/brackets/create'
									className='btn btn-primary mt-4'
								>
									Create My Bracket
								</Link>
							</>
						) : (
							<>
								<p className='py-4'>
									The tournament has already begun! While you
									can no longer submit a new bracket, you can
									still view the leaderboard and track how our
									AI models are performing.
								</p>
								<Link
									href='/brackets/leaderboard'
									className='btn btn-primary mt-4'
								>
									View Leaderboard
								</Link>
							</>
						)}
					</div>
				</div>
			</div>

			{/* Rest of your component remains the same */}

			{/* Hero section for AI models */}
			<div className='hero bg-primary text-primary-content py-12'>
				<div className='hero-content flex-col lg:flex-row-reverse'>
					<div className='relative w-full max-w-sm h-64 lg:h-80'>
						<Image
							src='/construction.png'
							alt='AI Models'
							fill
							className='object-contain'
							priority
						/>
					</div>
					<div className='lg:mr-8 max-w-md'>
						<h2 className='text-3xl font-bold'>
							AI Bracket Predictions
						</h2>
						<p className='py-4'>
							Our advanced AI models are analyzing historical
							tournament data, team statistics, and real-time
							information to predict game outcomes. As the
							tournament progresses, we'll display:
						</p>
						<ul className='list-disc list-inside space-y-2 pl-2'>
							<li>AI predictions for upcoming games</li>
							<li>Real-time bracket performance analytics</li>
							<li>Comparison between human and AI brackets</li>
							<li>
								Visualizations of game-winning probabilities
							</li>
						</ul>
						<div className='mt-6'>
							<div className='stats shadow'>
								<div className='stat'>
									<div className='stat-title'>
										Data Points Analyzed
									</div>
									<div className='stat-value'>10M+</div>
									<div className='stat-desc'>
										For each tournament prediction
									</div>
								</div>
								<div className='stat'>
									<div className='stat-title'>AI Models</div>
									<div className='stat-value'>4</div>
									<div className='stat-desc'>
										Competing against each other
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Additional resources section */}
			<div className='py-12 px-4'>
				<div className='max-w-7xl mx-auto'>
					<h2 className='text-2xl font-bold text-center mb-8'>
						Tournament Resources
					</h2>
					<div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
						<div className='card bg-base-100 shadow-xl'>
							<div className='card-body'>
								<h3 className='card-title'>My Brackets</h3>
								<p>
									View and track all your submitted brackets
									for this tournament.
								</p>
								<div className='card-actions justify-end'>
									<Link
										href='/brackets/view'
										className='btn btn-sm btn-primary'
									>
										View Brackets
									</Link>
								</div>
							</div>
						</div>

						<div className='card bg-base-100 shadow-xl'>
							<div className='card-body'>
								<h3 className='card-title'>Leaderboard</h3>
								<p>
									See how your brackets stack up against other
									participants and our AI models.
								</p>
								<div className='card-actions justify-end'>
									<Link
										href='/brackets/leaderboard'
										className='btn btn-sm btn-primary'
									>
										Check Rankings
									</Link>
								</div>
							</div>
						</div>

						<div className='card bg-base-100 shadow-xl'>
							<div className='card-body'>
								<h3 className='card-title'>
									Tournament Schedule
								</h3>
								<p>
									View the complete schedule of games and
									results as they happen.
								</p>
								<div className='card-actions justify-end'>
									<button className='btn btn-sm btn-outline'>
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
