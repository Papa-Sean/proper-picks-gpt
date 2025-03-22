'use client';

import Link from 'next/link';

export default function EmptyLeaderboard() {
	return (
		<div className='flex flex-col items-center justify-center py-8'>
			<div className='alert alert-info max-w-md mx-auto'>
				<svg
					xmlns='http://www.w3.org/2000/svg'
					fill='none'
					viewBox='0 0 24 24'
					className='stroke-current shrink-0 w-6 h-6'
				>
					<path
						strokeLinecap='round'
						strokeLinejoin='round'
						strokeWidth='2'
						d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
					></path>
				</svg>
				<span>
					No brackets have been submitted yet for this tournament.
				</span>
			</div>
			<div className='mt-6'>
				<Link
					href='/brackets/create'
					className='btn btn-secondary'
				>
					Create a Bracket
				</Link>
			</div>
		</div>
	);
}
