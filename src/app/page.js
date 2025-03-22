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
						<h2 className='text-2xl text-secondary text-center sm:text-3xl font-semibold mb-4'>
							About Proper Picks
						</h2>
						<p className='text-gray-600 text-justify dark:text-gray-300 mb-4'>
							Proper Picks is your advanced sports analysis
							platform that leverages data-driven insights to help
							you make informed decisions. Whether you're a casual
							fan or a serious analyst, our platform provides the
							tools you need to understand the game better. TLDR
							I'm going to make AI models compete in a March
							Madness Bracket and present the data, let me know if
							you would like to help or register so you can see
							what I find?
						</p>
					</section>

					{/* Features Grid */}
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
							title='Expert Insights'
							description='Get access to expert commentary and analysis from industry professionals.'
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
						className='btn btn-block mb-1 btn-primary py-2 px-4 sm:py-3 sm:px-8 rounded-lg transition-colors duration-200 mr-2 sm:mr-4 text-sm sm:text-base'
					>
						Don't Click
					</button>
					<Link
						href='/register'
						className='btn btn-block btn-primary py-2 px-4 sm:py-3 sm:px-8 rounded-lg transition-colors duration-200 text-sm sm:text-base'
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
