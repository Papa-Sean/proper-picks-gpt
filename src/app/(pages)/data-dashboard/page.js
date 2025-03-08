'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import Image from 'next/image';

export default function Dashboard() {
	const router = useRouter();
	const { isAuthenticated, user } = useSelector((state) => state.auth);

	useEffect(() => {
		if (!isAuthenticated) {
			router.push('/login');
		}
	}, [isAuthenticated, router]);

	if (!isAuthenticated) {
		return null;
	}

	return (
		<div className='min-h-screen bg-base-100 py-8 px-4 sm:px-6 lg:px-8'>
			<div className='max-w-7xl mx-auto'>
				<div className='text-center mb-12'>
					<h1 className='text-4xl sm:text-5xl md:text-6xl font-bold mb-4'>
						Dashboard
					</h1>
					<p className='text-xl sm:text-2xl text-gray-600 dark:text-gray-300'>
						Welcome back, {user?.email}
					</p>
				</div>

				<div className='bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 sm:p-8 md:p-10'>
					{/* Dashboard content here */}
					<div className='flex flex-col items-center justify-center space-y-4'>
						<div className='relative w-full max-w-2xl aspect-[4/3]'>
							<Image
								src='/construction.png'
								alt='Under Construction'
								fill
								className='object-contain'
								priority
							/>
						</div>
						<h2 className='text-2xl font-semibold text-gray-900 dark:text-gray-100'>
							Coming Soon!
						</h2>
						<p className='text-gray-600 dark:text-gray-300 text-center max-w-2xl'>
							Our data dashboard is currently under construction.
							Check back soon for exciting updates and features!
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
