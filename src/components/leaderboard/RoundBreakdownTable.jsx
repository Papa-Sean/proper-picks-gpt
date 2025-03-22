'use client';

export default function RoundBreakdownTable({
	leaderboard,
	tournamentInfo,
	user,
}) {
	return (
		<div className='mt-8'>
			<h3 className='text-lg font-bold mb-4'>Round-by-Round Breakdown</h3>
			<div className='overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0'>
				<table className='table table-sm sm:table-md w-full'>
					<thead>
						<tr>
							<th className='w-32 sm:w-40'>Bracket</th>
							{tournamentInfo.roundNames.map((name, index) => (
								<th
									key={index}
									className='text-center'
								>
									<span className='hidden sm:inline'>
										{name}
									</span>
									<span className='sm:hidden'>
										R{index + 1}
									</span>
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{leaderboard.map((entry) => (
							<tr
								key={`${entry.bracketId}-rounds`}
								className={
									user && entry.userId === user.uid
										? 'bg-secondary bg-opacity-10'
										: ''
								}
							>
								<td>
									<div className='font-bold text-sm truncate max-w-[120px] sm:max-w-full'>
										{entry.bracketName}
									</div>
									<div className='text-xs opacity-70 truncate max-w-[120px] sm:max-w-full'>
										{entry.userName}
									</div>
								</td>
								{entry.roundScores.map((score, index) => (
									<td
										key={index}
										className='text-center'
									>
										{index < tournamentInfo.currentRound ? (
											<div
												className='radial-progress text-xs sm:text-sm mx-auto'
												style={{
													'--value': Math.min(
														100,
														score
													),
													'--size': '1.5rem',
													'--thickness': '0.2rem',
												}}
											>
												{score}
											</div>
										) : (
											<span className='text-xs sm:text-sm'>
												-
											</span>
										)}
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
