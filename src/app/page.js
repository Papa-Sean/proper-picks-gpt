'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import LoadingWrapper from '@/components/LoadingWrapper';
import HackerLoadingModal from '@/components/HackerLoadingModal';

export default function Home() {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [firstLoad, setFirstLoad] = useState(true);
	const [modalContent, setModalContent] = useState(null);
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
		const hasVisitedBefore = sessionStorage.getItem('hasVisitedHomepage');

		if (hasVisitedBefore) {
			setFirstLoad(false);
		} else {
			sessionStorage.setItem('hasVisitedHomepage', 'true');
		}

		return () => {
			sessionStorage.setItem('hasVisitedHomepage', 'true');
		};
	}, []);

	useEffect(() => {
		let closeTimer;
		if (isModalOpen) {
			closeTimer = setTimeout(() => {
				setIsModalOpen(false);
			}, 10000);
		}

		return () => {
			if (closeTimer) clearTimeout(closeTimer);
		};
	}, [isModalOpen]);

	const handleDontClick = () => {
		setModalContent(
			<div className='text-center'>
				<h3 className='text-xl font-semibold mb-4 dark:text-white'>
					Now why would you do that?
				</h3>
				<button
					onClick={() => setIsModalOpen(false)}
					className='bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded transition-colors duration-200'
				>
					Close
				</button>
			</div>
		);
		setIsModalOpen(true);
	};

	const FeatureCard = ({ title, description }) => {
		return (
			<div className='bg-primary/95 rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl border-l-4 border-accent'>
				<div className='p-6'>
					<h3 className='text-2xl text-accent text-center font-bold mb-3 break-words'>
						{title}
					</h3>
					<div className='w-16 h-1 bg-secondary mx-auto mb-4'></div>
					<p className='text-justify text-base-300 break-words leading-relaxed'>
						{description}
					</p>
				</div>
			</div>
		);
	};

	const content = (
		<div className='min-h-screen bg-base-200 py-10 px-4 sm:px-6 lg:px-8 overflow-x-hidden'>
			{/* Background pattern overlay */}
			<div className='absolute inset-0 opacity-5 z-0 overflow-hidden pointer-events-none'>
				<div className="absolute inset-0 bg-[url('/basketball-pattern.svg')] bg-repeat opacity-10"></div>
			</div>

			<div className='max-w-7xl mx-auto relative z-10'>
				{/* Hero section with enhanced styling */}
				<div className='text-center mb-14'>
					<h1 className='text-5xl text-secondary sm:text-5xl md:text-6xl font-bold mb-4 drop-shadow-md'>
						Welcome to{' '}
						<span className='text-primary'>Proper Picks</span>
					</h1>
					<p className='text-sm sm:text-2xl text-primary font-semibold bg-base-300 inline-block px-4 py-1 rounded-full shadow-sm transform -rotate-1'>
						Making smart data look dumb since 1984
					</p>
				</div>

				{/* Main content card with more visual interest */}
				<div className='bg-base-100 rounded-xl shadow-2xl p-8 sm:p-10 md:p-12 border-t-4 border-secondary'>
					{/* Lessons section */}
					<section className='mb-12'>
						<h2 className='text-4xl text-primary text-center sm:text-3xl font-bold mb-8 relative'>
							<span className='relative inline-block'>
								Headed into a Historic Final Four
								<div className='absolute bottom-0 left-0 w-full h-1 bg-secondary'></div>
							</span>
							<span className='block text-lg mt-2 text-secondary font-medium'>
								but first, lessons learned:
							</span>
						</h2>

						<div className='mt-6 py-6 flex flex-col space-y-6'>
							{/* Lesson cards with visual flair */}
							<div className='bg-base-200 rounded-lg p-6 shadow-md transform hover:scale-[1.01] transition-transform duration-200 border-l-4 border-secondary'>
								<h3 className='text-xl text-justify font-bold mb-4 flex items-start'>
									<span className='text-secondary bg-base-300 rounded-full w-8 h-8 flex items-center justify-center mr-3 shadow-sm'>
										1
									</span>
									<span>
										Sometimes you just have to walk away and
										enjoy the fact that the work was fun and
										I got a lot done.
									</span>
								</h3>
							</div>

							<div className='bg-base-200 rounded-lg p-6 shadow-md transform hover:scale-[1.01] transition-transform duration-200 border-l-4 border-secondary'>
								<h3 className='text-xl text-justify font-bold mb-4 flex items-start'>
									<span className='text-secondary bg-base-300 rounded-full w-8 h-8 flex items-center justify-center mr-3 shadow-sm'>
										2
									</span>
									<span>
										I would decide to do this the year that
										all number 1 seeds made it to the Final
										Four. I guess I should have seen that
										coming.
									</span>
								</h3>
							</div>

							<div className='bg-base-200 rounded-lg p-6 shadow-md transform hover:scale-[1.01] transition-transform duration-200 border-l-4 border-secondary'>
								<h3 className='text-xl text-justify font-bold mb-4 flex items-start'>
									<span className='text-secondary bg-base-300 rounded-full w-8 h-8 flex items-center justify-center mr-3 shadow-sm'>
										3
									</span>
									<span>
										For all the things I wish I had done
										differently, I am still proud of the
										work I did. I learned a lot about and
										have established a baseline for the work
										I want to do in the future.
									</span>
								</h3>
							</div>
						</div>
					</section>

					{/* Enhanced feature cards section with Auburn colors */}
					<section className='grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 md:gap-10 lg:grid-cols-3'>
						<FeatureCard
							title='Data Analysis'
							description='Access comprehensive statistical analysis and trends from historical sports data.'
						/>
						<FeatureCard
							title='Real-time Updates'
							description='Stay informed with live updates and dynamic predictions as games unfold.'
						/>
						<FeatureCard
							title={
								<span className='line-through text-base-300/70'>
									Expert Insights
								</span>
							}
							description={
								<span className='line-through text-base-300/70'>
									Get access to expert commentary and analysis
									from industry professionals.
								</span>
							}
						/>
					</section>
				</div>

				{/* Call to action section with more visual appeal */}
				<div className='text-center mt-14 bg-primary/10 py-8 px-6 rounded-xl shadow-lg'>
					<p className='text-xl mb-6 font-semibold text-primary'>
						Ready to elevate your sports analysis?
					</p>
					<div className='flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto'>
						<button
							onClick={handleDontClick}
							className='btn btn-secondary py-3 px-6 rounded-lg transition-all duration-200 text-base font-bold shadow-md hover:shadow-lg transform hover:-translate-y-1'
						>
							Don't Click
						</button>
						<Link
							href='/register'
							className='btn btn-primary py-3 px-6 rounded-lg transition-all duration-200 text-base font-bold shadow-md hover:shadow-lg transform hover:-translate-y-1'
						>
							Sign up
						</Link>
					</div>
				</div>

				{/* Modal content stays the same */}
				{isModalOpen && (
					<HackerLoadingModal duration={10000}>
						<div className='fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
							<div className='bg-white dark:bg-base-300 rounded-lg p-6 sm:p-8 w-full max-w-sm mx-auto shadow-2xl border-t-4 border-secondary'>
								{modalContent}
							</div>
						</div>
					</HackerLoadingModal>
				)}
			</div>
		</div>
	);

	return isClient ? (
		firstLoad ? (
			<LoadingWrapper minLoadTime={10000}>{content}</LoadingWrapper>
		) : (
			content
		)
	) : (
		<div className='min-h-screen bg-base-200 py-8 px-4 sm:px-6 lg:px-8'>
			<div className='max-w-7xl mx-auto flex items-center justify-center h-screen'>
				<div className='loading loading-spinner loading-lg text-secondary'></div>
			</div>
		</div>
	);
}
