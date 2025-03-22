'use client';

/**
 * GameCard - Renders a single game matchup in the tournament bracket
 */
export default function GameCard({
	game,
	round,
	region,
	userSelection,
	actualResults,
	onGameClick,
	isReadOnly = true,
	teams = [],
}) {
	if (!game) return <div className='h-16 opacity-0'></div>;

	// Get team details
	const getTeamDetails = (teamName) => {
		if (!teamName || !teams?.length) return null;
		return teams.find((t) => t.team === teamName) || null;
	};

	// Get region-specific styling
	const getRegionStyle = (region) => {
		switch (region?.toLowerCase()) {
			case 'east':
				return 'border-l-4 border-blue-500';
			case 'west':
				return 'border-l-4 border-red-500';
			case 'south':
				return 'border-l-4 border-green-500';
			case 'midwest':
				return 'border-l-4 border-yellow-500';
			default:
				return '';
		}
	};

	// Determine game result status
	const getGameResultStatus = () => {
		// If no actual result or user didn't make a selection, return null
		if (!actualResults[round]?.[game.gameId] || !userSelection) {
			return null;
		}

		// Compare user selection with actual result
		const actualWinner = actualResults[round][game.gameId];
		return userSelection === actualWinner ? 'correct' : 'incorrect';
	};

	// Get points for round
	const getPointsForRound = () => {
		const pointsPerRound = [1, 2, 4, 8, 16, 32]; // Points for rounds 1-6
		return pointsPerRound[round - 1] || 0;
	};

	const teamADetails = getTeamDetails(game.teamA);
	const teamBDetails = getTeamDetails(game.teamB);
	const resultStatus = getGameResultStatus();
	const isDisabled = !game.teamA || !game.teamB;

	// For placeholder games that don't have teams yet
	if (isDisabled) {
		return (
			<div
				className={`
        relative border border-gray-200 rounded p-1 h-16 flex flex-col justify-center
        ${isReadOnly ? 'opacity-50' : 'opacity-80'} 
        ${getRegionStyle(region)}
      `}
			>
				<div className='text-[10px] text-center text-gray-500'>
					Game {game.gameId}
				</div>
				<div className='text-xs text-center text-gray-500'>
					(Waiting for winners)
				</div>
			</div>
		);
	}

	// Set border color based on result status
	let resultStatusClasses = '';
	if (resultStatus === 'correct') {
		resultStatusClasses = 'border-success bg-success/10';
	} else if (resultStatus === 'incorrect') {
		resultStatusClasses = 'border-warning bg-warning/10';
	} else if (userSelection) {
		resultStatusClasses = 'border-secondary bg-secondary/10';
	} else {
		resultStatusClasses = 'border-gray-200';
	}

	return (
		<div
			className={`
        relative border rounded p-1 mb-1 cursor-pointer h-16 flex flex-col justify-between
        ${isReadOnly ? '' : 'hover:shadow-md transition-shadow'} 
        ${resultStatusClasses}
        ${getRegionStyle(region)}
      `}
			onClick={() =>
				onGameClick && onGameClick(game.gameId, round, region)
			}
		>
			<div className='flex justify-between items-center border-b pb-1'>
				<div
					className={`flex items-center text-xs ${
						userSelection === game.teamA
							? resultStatus === 'correct'
								? 'font-bold text-success'
								: resultStatus === 'incorrect'
								? 'font-bold text-warning line-through'
								: 'font-bold text-secondary'
							: ''
					}`}
				>
					{teamADetails?.seed && (
						<span className='inline-block w-4 text-center mr-1 opacity-70'>
							{teamADetails.seed}
						</span>
					)}
					<span className='truncate max-w-[80px]'>{game.teamA}</span>
				</div>

				{/* Show actual winner indicator */}
				{actualResults[round]?.[game.gameId] === game.teamA && (
					<span className='badge badge-xs badge-success'>✓</span>
				)}
			</div>

			<div className='flex justify-between items-center'>
				<div
					className={`flex items-center text-xs ${
						userSelection === game.teamB
							? resultStatus === 'correct'
								? 'font-bold text-success'
								: resultStatus === 'incorrect'
								? 'font-bold text-warning line-through'
								: 'font-bold text-secondary'
							: ''
					}`}
				>
					{teamBDetails?.seed && (
						<span className='inline-block w-4 text-center mr-1 opacity-70'>
							{teamBDetails.seed}
						</span>
					)}
					<span className='truncate max-w-[80px]'>{game.teamB}</span>
				</div>

				{/* Show actual winner indicator */}
				{actualResults[round]?.[game.gameId] === game.teamB && (
					<span className='badge badge-xs badge-success'>✓</span>
				)}
			</div>

			{/* Show points earned for correct pick */}
			{resultStatus === 'correct' && (
				<div className='absolute bottom-1 right-1'>
					<span className='badge badge-xs badge-success'>
						+{getPointsForRound()}
					</span>
				</div>
			)}
		</div>
	);
}
