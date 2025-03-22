'use client';

import Link from 'next/link';

export default function LeaderboardTableRow({ entry, index, user }) {
	// Check if this bracket was updated recently (within the last hour)
	const recentlyUpdated =
		entry.updatedAt &&
		new Date().getTime() - entry.updatedAt.getTime() < 60 * 60 * 1000;

	const isUserBracket = user && entry.userId === user.uid;

	return (
		<tr
			className={`
        ${isUserBracket ? 'bg-secondary bg-opacity-10' : ''}
        ${recentlyUpdated ? 'bg-success bg-opacity-5' : ''}
      `}
		>
			<td className='font-bold'>{index + 1}</td>

			<td>
				<div>
					<div className='font-bold flex items-center text-sm sm:text-base'>
						<span className='truncate max-w-[120px] sm:max-w-full'>
							{entry.bracketName}
						</span>
						{recentlyUpdated && (
							<div className='badge badge-xs badge-success ml-2'>
								Updated
							</div>
						)}
					</div>
					<div className='text-xs sm:text-sm opacity-70 truncate max-w-[150px] sm:max-w-full'>
						{entry.userName}
					</div>
					<div className='text-xs opacity-50 hidden sm:block'>
						Created: {entry.createdAt.toLocaleDateString()}
					</div>
				</div>
			</td>

			<td className='text-center font-bold'>{entry.points}</td>

			<td className='text-center'>
				<div className='flex flex-col'>
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

			<td className='text-center hidden sm:table-cell'>
				{entry.maxPossible}
			</td>

			<td className='text-right'>
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
