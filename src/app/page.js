'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import LoadingWrapper from '@/components/LoadingWrapper';
import HackerLoadingModal from '@/components/HackerLoadingModal';

export default function Home() {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [firstLoad, setFirstLoad] = useState(true);
	const [modalContent, setModalContent] = useState(null);

	// Check if this is the first time visiting the site in this session
	useEffect(() => {
		// Check session storage to see if we've shown the loading animation before
		const hasVisitedBefore = sessionStorage.getItem('hasVisitedHomepage');

		if (hasVisitedBefore) {
			setFirstLoad(false);
		} else {
			// Mark that we've shown the loading animation
			sessionStorage.setItem('hasVisitedHomepage', 'true');
		}

		// Cleanup
		return () => {
			// If component unmounts, we've definitely visited
			sessionStorage.setItem('hasVisitedHomepage', 'true');
		};
	}, []);

	// Auto-close modal effect
	useEffect(() => {
		let closeTimer;
		if (isModalOpen) {
			closeTimer = setTimeout(() => {
				setIsModalOpen(false);
			}, 10000); // Auto-close after 10 seconds
		}

		return () => {
			if (closeTimer) clearTimeout(closeTimer);
		};
	}, [isModalOpen]);

	const handleDontClick = () => {
		// Set the content for what should appear after the hacker animation
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
			<div className='bg-gray-50 dark:bg-gray-700 rounded-lg p-6'>
				<h3 className='text-2xl text-secondary text-center font-semibold mb-2 break-words'>
					{title}
				</h3>
				<p className='text-gray-600 text-justify dark:text-gray-300 break-words'>
					{description}
				</p>
			</div>
		);
	};

	// Render the content, wrapped in LoadingWrapper if it's the first load
	const content = (
		<div className='min-h-screen bg-base-100 py-8 px-4 sm:px-6 lg:px-8 overflow-x-hidden'>
			{' '}
			{/* Main Container */}
			<div className='max-w-7xl mx-auto'>
				{/* Hero/Greeting Section */}
				<div className='text-center mb-12'>
					<h1 className='text-5xl text-secondary sm:text-5xl md:text-6xl font-bold mb-4'>
						Welcome to Proper Picks
					</h1>
					<p className='text-sm sm:text-2xl text-gray-600 dark:text-gray-300'>
						Making smart data look dumb since 1984
					</p>
				</div>

				{/* Content Section */}
				<div className='bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 sm:p-8 md:p-10'>
					{/* About Section */}
					<section className='mb-12'>
						<h2 className='text-4xl text-secondary text-center sm:text-3xl font-semibold my-4'>
							First Weekend Is In The Books!
						</h2>
					
						
							<div className='mt-4 py-10 flex flex-col'>
							<h3 className='text-xl text-justify font-semibold mb-4'><span className='text-secondary'>Lesson 1:</span> I had much bigger ideas for the project and hadn't worked out the framework to deliver the "BIG" idea which was a bummer BUT I ended up with a pretty functional "March Madness Office Pool" app in the meantime so I got that going for me.
							</h3>
							<h3 className='text-xl text-justify font-semibold mb-4'><span className='text-secondary'>Lesson 2:</span> Make sure your bracket can actually happen? Yep, the data is corrupt because my Final Four / Championship format is wrong... I had a 2/3 shot at getting that wrong, who knew?
							</h3>
							<h3 className='text-xl text-justify font-semibold mb-4'><span className='text-secondary'>Lesson 3:</span> This isn't easy, it isn't hard but it's definitely fun so thanks for playing/reading!
							</h3>
							</div>
							<div className="list-col-grow"></div>

						
					</section>

				
										<section className='grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3'>
											<FeatureCard
												title='Data Analysis'
												description='Access comprehensive statistical analysis and trends from historical sports data.'
											/>
											<FeatureCard
												title='Real-time Updates'
												description='Stay informed with live updates and dynamic predictions as games unfold.'
											/>
											<FeatureCard
												title={<span className="line-through">Expert Insights</span>}
												description={<span className="line-through">Get access to expert commentary and analysis from industry professionals.</span>}
											/>
										</section>
									</div>

									{/* Call to Action with Modal */}
				<div className='text-center mt-12'>
					<p className='text-lg mb-4'>
						Ready to elevate your sports analysis?
					</p>
					<button
						onClick={handleDontClick}
						className='btn btn-block mb-1 btn-secondary py-2 px-4 sm:py-3 sm:px-8 rounded-lg transition-colors duration-200 mr-2 sm:mr-4 text-sm sm:text-base'
					>
						Don't Click
					</button>
					<Link
						href='/register'
						className='btn btn-block btn-secondary py-2 px-4 sm:py-3 sm:px-8 rounded-lg transition-colors duration-200 text-sm sm:text-base'
					>
						Sign up
					</Link>
				</div>

				{/* Hacker Modal */}
				{isModalOpen && (
					<HackerLoadingModal duration={10000}>
						<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
							<div className='bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-8 w-full max-w-sm mx-auto shadow-xl'>
								{modalContent}
							</div>
						</div>
					</HackerLoadingModal>
				)}
			</div>
		</div>
	);

	// If it's the first load, wrap content in LoadingWrapper with 10 seconds duration
	return firstLoad ? (
		<LoadingWrapper minLoadTime={10000}>{content}</LoadingWrapper>
	) : (
		content
	);
}
