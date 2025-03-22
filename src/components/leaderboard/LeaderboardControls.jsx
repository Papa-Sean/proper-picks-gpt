'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function LeaderboardControls({
	onRefresh,
	isRefreshing,
	isAdmin,
	sortCriteria,
	onSortChange,
	comparisonBracketId = 'actual',
	onComparisonChange,
	brackets = [],
	isLoadingBrackets = false,
}) {
	const [showCompareOptions, setShowCompareOptions] = useState(false);

	return (
		<div className='flex flex-col w-full gap-3 mb-4'>
			<div className='flex flex-col sm:flex-row justify-between w-full gap-3'>
				<div className='flex gap-2 self-end sm:self-auto order-2 sm:order-1'>
					<button
						className='btn btn-outline btn-sm'
						onClick={onRefresh}
						disabled={isRefreshing}
					>
						{isRefreshing ? (
							<>
								<span className='loading loading-spinner loading-xs mr-1'></span>
								<span className='hidden xs:inline'>
									Refreshing...
								</span>
								<span className='xs:hidden'>...</span>
							</>
						) : (
							<>
								<svg
									xmlns='http://www.w3.org/2000/svg'
									className='h-4 w-4 mr-1'
									fill='none'
									viewBox='0 0 24 24'
									stroke='currentColor'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
									/>
								</svg>
								<span className='hidden xs:inline'>
									Refresh
								</span>
							</>
						)}
					</button>

					{isAdmin && (
						<Link
							href='/admin/tournament'
							className='btn btn-secondary btn-sm'
						>
							<span className='hidden xs:inline'>
								Update Results
							</span>
							<span className='xs:hidden'>Update</span>
						</Link>
					)}

					<button
						className={`btn btn-sm ${
							showCompareOptions ? 'btn-accent' : 'btn-outline'
						}`}
						onClick={() =>
							setShowCompareOptions(!showCompareOptions)
						}
					>
						<span className='hidden xs:inline'>
							Compare Brackets
						</span>
						<span className='xs:hidden'>Compare</span>
					</button>
				</div>

				<div className='btn-group self-end order-1 sm:order-2'>
					<button
						className={`btn btn-xs sm:btn-sm ${
							sortCriteria === 'points' ? 'btn-active' : ''
						}`}
						onClick={() => onSortChange('points')}
					>
						Points
					</button>
					<button
						className={`btn btn-xs sm:btn-sm ${
							sortCriteria === 'correctPicks' ? 'btn-active' : ''
						}`}
						onClick={() => onSortChange('correctPicks')}
					>
						<span className='hidden xs:inline'>Correct Picks</span>
						<span className='xs:hidden'>Correct</span>
					</button>
					<button
						className={`btn btn-xs sm:btn-sm ${
							sortCriteria === 'maxPossible' ? 'btn-active' : ''
						}`}
						onClick={() => onSortChange('maxPossible')}
					>
						<span className='hidden xs:inline'>Max Possible</span>
						<span className='xs:hidden'>Max</span>
					</button>
				</div>
			</div>

			{/* Comparison dropdown */}
			{showCompareOptions && (
				<div className='card bg-base-100 shadow-sm p-3 mt-1'>
					<div className='form-control'>
						<label className='label'>
							<span className='label-text font-semibold'>
								Score leaderboard as if this bracket was
								correct:
							</span>
						</label>
						<select
							className='select select-bordered w-full max-w-xs'
							value={comparisonBracketId}
							onChange={(e) => onComparisonChange(e.target.value)}
							disabled={isLoadingBrackets}
						>
							<option value='actual'>
								Actual Tournament Results (Official)
							</option>
							{brackets.map((bracket) => (
								<option
									key={bracket.bracketId}
									value={bracket.bracketId}
								>
									{bracket.bracketName} ({bracket.userName}) -{' '}
									{bracket.points} pts
								</option>
							))}
						</select>
						<label className='label'>
							<span className='label-text-alt text-info'>
								{comparisonBracketId === 'actual'
									? 'Using official tournament results to score brackets'
									: "Using another user's bracket as the 'correct' answer to score other brackets"}
							</span>
						</label>
					</div>
				</div>
			)}
		</div>
	);
}
