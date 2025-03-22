'use client';

import { memo } from 'react';

function TournamentHeader({ tournament, isDeadlinePassed }) {
	if (!tournament) return null;

	return (
		<>
			{isDeadlinePassed ? (
				<div className='alert alert-warning mb-6 shadow-sm'>
					<svg
						xmlns='http://www.w3.org/2000/svg'
						className='stroke-current shrink-0 h-6 w-6'
						fill='none'
						viewBox='0 0 24 24'
					>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth='2'
							d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
						/>
					</svg>
					<span>
						The submission deadline has passed. You can view
						brackets but not create new ones.
					</span>
				</div>
			) : (
				<>
					<div className='alert alert-info mb-4 shadow-sm'>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							fill='none'
							viewBox='0 0 24 24'
							className='stroke-current shrink-0 w-5 h-5 sm:w-6 sm:h-6'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth='2'
								d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
							></path>
						</svg>
						<div className='text-sm sm:text-base'>
							<span className='font-medium'>Important:</span> Each
							user may submit only one bracket per tournament.
							Creating a new bracket will replace any existing
							one.
							<div className='text-xs sm:text-sm mt-1 opacity-80'>
								Deadline:{' '}
								{new Date(
									tournament.submissionDeadline
								).toLocaleString()}
							</div>
						</div>
					</div>

					<div className='alert alert-info mb-6 shadow-sm text-sm sm:text-base'>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							fill='none'
							viewBox='0 0 24 24'
							className='stroke-current shrink-0 w-5 h-5 sm:w-6 sm:h-6'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth='2'
								d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
							></path>
						</svg>
						<span>
							Complete your bracket by selecting winners for each
							round. Submission deadline:{' '}
							{new Date(
								tournament.submissionDeadline
							).toLocaleString()}
						</span>
					</div>
				</>
			)}
		</>
	);
}

export default memo(TournamentHeader);
