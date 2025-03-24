'use client';

import Link from 'next/link';

export default function LeaderboardTableRow({ entry, index, user }) {
	const recentlyUpdated =
		entry.updatedAt &&
		new Date().getTime() - entry.updatedAt.getTime() < 60 * 60 * 1000;

	const isUserBracket = user && entry.userId === user.uid;

	// For standard table view (sm and up screens)
	return (
		<tr
			className={`
        ${isUserBracket ? 'bg-secondary bg-opacity-10' : ''}
        ${recentlyUpdated ? 'bg-success bg-opacity-5' : ''}
        md:table-row flex flex-col w-full mb-4 rounded-lg border border-base-300 
        shadow-sm
      `}
		>
			<td className='font-bold md:table-cell flex justify-between py-2 border-b border-base-300'>
				<span className='md:hidden font-semibold'>Rank</span>
				<span>{index + 1}</span>
			</td>

			<td className='md:table-cell py-2 border-b border-base-300'>
				<div className='flex md:block justify-between'>
					<div className='font-bold text-sm sm:text-base'>
						<span className='md:hidden font-semibold mr-2'>
							Bracket
						</span>
						<span className='truncate max-w-[120px] sm:max-w-full'>
							{entry.bracketName}
						</span>
						{recentlyUpdated && (
							<div className='badge badge-xs badge-success ml-2'>
								Updated
							</div>
						)}
					</div>
					<div className='text-xs sm:text-sm opacity-70 truncate max-w-[120px] sm:max-w-full'>
						{entry.userName}
					</div>
					<div className='text-xs opacity-50 hidden sm:block'>
						Created: {entry.createdAt.toLocaleDateString()}
					</div>
				</div>
			</td>

			<td className='md:text-center md:table-cell flex justify-between py-2 border-b border-base-300'>
				<span className='md:hidden font-semibold'>Points</span>
				<span className='font-bold'>{entry.points}</span>
			</td>

			<td className='md:text-center md:table-cell flex justify-between py-2 border-b border-base-300'>
				<span className='md:hidden font-semibold'>Correct</span>
				<div className='flex flex-col items-end md:items-center'>
					<span>
						{entry.correctPicks}/{entry.totalPicks || '-'}
					</span>
					<span className='text-xs opacity-70'>
						{entry.totalPicks
							? `${Math.round(
									(entry.correctPicks / entry.totalPicks) *
										100
							  )}%`
							: '-'}
					</span>
				</div>
			</td>

			<td className='md:text-center hidden md:table-cell'>
				{entry.maxPossible}
			</td>

			<td className='md:text-right md:table-cell flex justify-center py-2'>
				<Link
					href={`/brackets/view/bracketview?id=${entry.bracketId}`}
					className={`btn btn-xs sm:btn-sm ${
						isUserBracket
							? 'btn-ghost text-secondary border border-secondary'
							: 'btn-outline'
					}`}
				>
					{isUserBracket ? 'Your Bracket' : 'View'}
				</Link>
			</td>
		</tr>
	);
}
