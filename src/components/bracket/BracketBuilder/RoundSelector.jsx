'use client';

import { memo } from 'react';
import SelectWinner from '@/components/SelectWinner';

const roundInfo = [
	{ number: 1, name: 'First Round', gameCount: 32 },
	{ number: 2, name: 'Second Round', gameCount: 16 },
	{ number: 3, name: 'Sweet 16', gameCount: 8 },
	{ number: 4, name: 'Elite Eight', gameCount: 4 },
	{ number: 5, name: 'Final Four', gameCount: 2 },
	{ number: 6, name: 'Championship', gameCount: 1 },
];

function RoundSelector({
	currentStep,
	games,
	bracketSelections,
	onSelectWinner,
	getTeamDetails,
	getRoundCompletion,
	onPrevStep,
	onNextStep,
	onStepChange,
	isRoundComplete,
}) {
	console.log('RoundSelector received props:', {
		currentStep,
		gamesLength: games?.length,
		bracketSelections,
	});

	const roundData = roundInfo[currentStep - 1];
	const completion = getRoundCompletion(currentStep);

	console.log('About to map over games:', games);

	return (
		<div>
			<h3 className='text-base sm:text-lg font-bold mb-2 sm:mb-4 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2'>
				<span>
					Round {currentStep}: {roundData.name}
				</span>
				<span className='text-xs sm:text-sm font-normal text-base-content/70'>
					({completion.completed}/{completion.total} selections made)
				</span>
			</h3>

			{/* Scroll container for games */}
			<div className='max-h-[50vh] sm:max-h-[60vh] overflow-y-auto p-1 sm:p-2 -mx-2 sm:mx-0 border border-base-200 rounded-md'>
				<div className='grid grid-cols-1 gap-2 sm:gap-4'>
					{(games || [])
						.filter((game) => game && game.gameId !== undefined)
						.map((game) => (
							<SelectWinner
								key={`game-${game.gameId}-round-${currentStep}`}
								game={{
									gameId: game.gameId,
									teamA: game.teamA,
									teamB: game.teamB,
									userSelectedWinner:
										(bracketSelections[currentStep] &&
											bracketSelections[currentStep][
												game.gameId
											]) ||
										'',
								}}
								teamADetails={getTeamDetails(game.teamA)}
								teamBDetails={getTeamDetails(game.teamB)}
								onSelectWinner={(gameId, winner) =>
									onSelectWinner(gameId, currentStep, winner)
								}
								disabled={!game.teamA || !game.teamB}
							/>
						))}
				</div>
			</div>

			{/* Action buttons - responsive for mobile */}
			<div className='mt-4 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:justify-between'>
				{/* Round navigation buttons - pills on mobile */}
				<div className='order-2 sm:order-none self-center'>
					<div className='join join-horizontal'>
						{roundInfo.map((round) => (
							<button
								key={round.number}
								className={`join-item btn btn-xs sm:btn-sm ${
									currentStep === round.number
										? 'btn-active'
										: ''
								}`}
								onClick={() => onStepChange(round.number)}
							>
								<span className='hidden sm:inline'>
									{round.number}
								</span>
								<span className='sm:hidden'>
									R{round.number}
								</span>
							</button>
						))}
					</div>
				</div>

				{/* Prev/Next buttons - full width on mobile */}
				<div className='order-3 sm:order-none grid grid-cols-2 sm:flex gap-2 w-full sm:w-auto'>
					<button
						className='btn btn-outline btn-sm'
						onClick={onPrevStep}
						disabled={currentStep === 1}
					>
						<span className='hidden sm:inline'>Previous Round</span>
						<span className='sm:hidden'>Prev</span>
					</button>

					<button
						className='btn btn-secondary btn-sm'
						onClick={onNextStep}
						disabled={!isRoundComplete(currentStep)}
					>
						{currentStep < 6 ? (
							<>
								<span className='hidden sm:inline'>
									Next Round
								</span>
								<span className='sm:hidden'>Next</span>
							</>
						) : (
							<>
								<span className='hidden sm:inline'>
									Finish & Submit
								</span>
								<span className='sm:hidden'>Finish</span>
							</>
						)}
					</button>
				</div>

				{/* Completion indicator */}
				<div className='order-1 sm:order-none self-center'>
					<div className='badge badge-secondary p-3'>
						{completion.percent}% Complete
					</div>
				</div>
			</div>
		</div>
	);
}

export default memo(RoundSelector);
