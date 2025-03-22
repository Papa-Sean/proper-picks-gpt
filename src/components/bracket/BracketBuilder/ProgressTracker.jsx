'use client';

import { useMemo } from 'react';

function ProgressTracker({
	gamesByRound,
	bracketSelections,
	currentStep,
	onStepChange,
	onContinueBuilding,
}) {
	// Round information
	const roundInfo = [
		{ number: 1, name: 'First Round', gameCount: 32 },
		{ number: 2, name: 'Second Round', gameCount: 16 },
		{ number: 3, name: 'Sweet 16', gameCount: 8 },
		{ number: 4, name: 'Elite Eight', gameCount: 4 },
		{ number: 5, name: 'Final Four', gameCount: 2 },
		{ number: 6, name: 'Championship', gameCount: 1 },
	];

	// Calculate overall completion percentage
	const totalProgress = useMemo(() => {
		const totalGames = Object.values(gamesByRound).reduce((acc, games) => {
			return (
				acc + games.filter((game) => game.teamA && game.teamB).length
			);
		}, 0);

		const totalSelections = Object.values(bracketSelections).reduce(
			(acc, round) => {
				return acc + Object.keys(round).length;
			},
			0
		);

		return totalGames
			? Math.round((totalSelections / totalGames) * 100)
			: 0;
	}, [gamesByRound, bracketSelections]);

	return (
		<div className='mb-8'>
			<h3 className='text-lg font-bold mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2'>
				<span>Bracket Progress</span>
				<button
					className='btn btn-primary btn-sm'
					onClick={onContinueBuilding}
				>
					Continue Building
				</button>
			</h3>

			{/* Overall progress bar */}
			<div className='mb-4'>
				<div className='flex justify-between mb-1'>
					<span className='text-sm font-medium'>
						Overall Completion
					</span>
					<span className='text-sm font-medium'>
						{totalProgress}%
					</span>
				</div>
				<div className='w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700'>
					<div
						className='bg-primary h-2.5 rounded-full'
						style={{ width: `${totalProgress}%` }}
					></div>
				</div>
			</div>

			{/* Round progress cards */}
			<div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2'>
				{roundInfo.map((round) => {
					// Calculate completion for this round
					const games = gamesByRound[round.number] || [];
					const playableGames = games.filter(
						(game) => game.teamA && game.teamB
					);
					const selections = Object.keys(
						bracketSelections[round.number] || {}
					).length;
					const total = playableGames.length;
					const percent = total
						? Math.round((selections / total) * 100)
						: 0;

					return (
						<div
							key={round.number}
							className={`card bg-base-100 shadow-sm border ${
								currentStep === round.number
									? 'border-primary'
									: 'border-base-300'
							} hover:shadow-md transition-shadow cursor-pointer`}
							onClick={() => {
								onStepChange(round.number);
								onContinueBuilding();
							}}
						>
							<div className='card-body p-3'>
								<h3 className='card-title text-sm justify-between'>
									<span className='truncate'>
										{round.name}
									</span>
									<span className='badge badge-sm'>
										{round.number}
									</span>
								</h3>
								<div className='text-xs flex justify-between items-center mt-1'>
									<span>
										{selections}/{total}
									</span>
									<span
										className={`font-semibold ${
											percent === 100
												? 'text-success'
												: 'text-base-content/70'
										}`}
									>
										{percent}%
									</span>
								</div>
								<progress
									className={`progress mt-1 ${
										percent === 100
											? 'progress-success'
											: 'progress-primary'
									}`}
									value={selections}
									max={total}
								></progress>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}

export default ProgressTracker;
