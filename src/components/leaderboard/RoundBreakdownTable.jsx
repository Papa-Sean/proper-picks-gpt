'use client';

export default function RoundBreakdownTable({
	leaderboard,
	tournamentInfo,
	user,
}) {
	// Define the possible points per round
	const possiblePointsPerRound = [32, 16, 8, 4, 2, 1].map(
		(games) => games * 1
	);

	return (
		<div className='mt-8 w-full'>
			<h3 className='text-lg font-bold mb-4'>Round-by-Round Breakdown</h3>

			{/* Desktop view (md and above) */}
			<div className='hidden md:block'>
				<div className='overflow-x-auto'>
					<table className='table table-sm w-full'>
						<thead>
							<tr>
								<th className='w-40'>Bracket</th>
								{tournamentInfo.roundNames.map(
									(name, index) => (
										<th
											key={index}
											className='text-center'
										>
											{name}
										</th>
									)
								)}
							</tr>
						</thead>
						<tbody>
							{leaderboard.map((entry) => (
								<tr
									key={`${entry.bracketId}-rounds-desktop`}
									className={
										user && entry.userId === user.uid
											? 'bg-secondary bg-opacity-10'
											: ''
									}
								>
									<td>
										<div className='font-bold text-sm'>
											{entry.bracketName}
										</div>
										<div className='text-xs opacity-70'>
											{entry.userName}
										</div>
									</td>
									{entry.roundScores.map((score, index) => (
										<td
											key={index}
											className='text-center'
										>
											{index <
											tournamentInfo.currentRound ? (
												<div className='flex flex-col items-center'>
													<div
														className='radial-progress text-sm mx-auto'
														style={{
															'--value': Math.min(
																100,
																(score /
																	possiblePointsPerRound[
																		index
																	]) *
																	100
															),
															'--size': '1.5rem',
															'--thickness':
																'0.2rem',
														}}
													>
														{Math.round(
															(score /
																possiblePointsPerRound[
																	index
																]) *
																100
														)}
														%
													</div>
													<div className='text-xs mt-1'>
														{score}/
														{
															possiblePointsPerRound[
																index
															]
														}
													</div>
												</div>
											) : (
												<span className='text-sm'>
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

			{/* Mobile view (below md) - make grid responsive */}
			<div className='md:hidden space-y-4'>
				{leaderboard.map((entry) => (
					<div
						key={`${entry.bracketId}-rounds-mobile`}
						className={`card border shadow-sm ${
							user && entry.userId === user.uid
								? 'bg-secondary bg-opacity-10 border-secondary border-opacity-20'
								: 'bg-base-100 border-base-300'
						}`}
					>
						<div className='card-body p-3'>
							<h4 className='card-title text-sm flex flex-col items-start'>
								<span className='truncate max-w-full'>
									{entry.bracketName}
								</span>
								<span className='text-xs opacity-70 font-normal'>
									{entry.userName}
								</span>
							</h4>

							{/* Change grid-cols-3 to a responsive grid */}
							<div className='grid grid-cols-2 xs:grid-cols-3 gap-2 mt-2'>
								{tournamentInfo.roundNames.map(
									(name, index) => (
										<div
											key={index}
											className='bg-base-200 rounded-lg p-2 text-center'
										>
											<div className='text-xs font-semibold mb-1'>{`R${
												index + 1
											}`}</div>
											{index <
											tournamentInfo.currentRound ? (
												<div className='flex flex-col items-center'>
													<div
														className='radial-progress text-xs mx-auto'
														style={{
															'--value': Math.min(
																100,
																(entry
																	.roundScores[
																	index
																] /
																	possiblePointsPerRound[
																		index
																	]) *
																	100
															),
															'--size': '1.5rem',
															'--thickness':
																'0.2rem',
														}}
													>
														{Math.round(
															(entry.roundScores[
																index
															] /
																possiblePointsPerRound[
																	index
																]) *
																100
														)}
														%
													</div>
													<div className='text-xs mt-1'>
														{
															entry.roundScores[
																index
															]
														}
														/
														{
															possiblePointsPerRound[
																index
															]
														}
													</div>
												</div>
											) : (
												<span className='text-xs'>
													-
												</span>
											)}
										</div>
									)
								)}
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
