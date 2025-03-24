'use client';

import LeaderboardTableRow from './LeaderboardTableRow';

export default function LeaderboardTable({ leaderboard, user }) {
	return (
		// Remove the negative margins and adjust padding
		<div className='w-full overflow-x-none'>
			<table className='table table-sm sm:table-md w-full'>
				<thead className='hidden'>
					<tr>
						<th className='w-10'>Rank</th>
						<th>Bracket</th>
						<th className='text-center w-16 sm:w-24'>
							<span className='hidden xs:inline'>Points</span>
							<span className='xs:hidden'>Pts</span>
						</th>
						<th className='text-center w-24 sm:w-28'>
							<span className='hidden xs:inline'>Correct</span>
							<span className='xs:hidden'>Corr</span>
						</th>
						<th className='text-center w-20 hidden sm:table-cell'>
							Max
						</th>
						<th className='text-right w-16 sm:w-24'>Actions</th>
					</tr>
				</thead>
				<tbody>
					{leaderboard.map((entry, index) => (
						<LeaderboardTableRow
							key={entry.bracketId}
							entry={entry}
							index={index}
							user={user}
						/>
					))}
				</tbody>
			</table>
		</div>
	);
}
