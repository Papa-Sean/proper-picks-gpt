'use client';

import GameCard from './GameCard';

/**
 * FinalFourBracket - Renders the Final Four and Championship games
 */
export default function FinalFourBracket({
	finalFourGames,
	championshipGame,
	teams,
	bracketSelections,
	actualResults,
	onGameClick,
	isReadOnly = true,
}) {
	// Get selection for a game
	const getGameWinner = (gameId, round) => {
		if (!gameId || !bracketSelections) return null;
		return bracketSelections[round]?.[gameId] || null;
	};

	return (
		<div className='col-span-1 row-span-16 flex flex-col justify-center items-center'>
			{/* Final Four - First Game */}
			<div className='w-full mb-4'>
				<GameCard
					game={finalFourGames[0]}
					round={5}
					userSelection={getGameWinner(finalFourGames[0]?.gameId, 5)}
					actualResults={actualResults}
					onGameClick={onGameClick}
					isReadOnly={isReadOnly}
					teams={teams}
				/>
			</div>

			{/* Championship */}
			<div className='w-full bg-base-200 p-2 rounded-lg border-2 border-primary mt-4 mb-4'>
				<GameCard
					game={championshipGame}
					round={6}
					userSelection={getGameWinner(championshipGame?.gameId, 6)}
					actualResults={actualResults}
					onGameClick={onGameClick}
					isReadOnly={isReadOnly}
					teams={teams}
				/>
				<div className='text-center mt-2 font-bold text-xs'>
					Championship
				</div>
			</div>

			{/* Final Four - Second Game */}
			<div className='w-full mt-4'>
				<GameCard
					game={finalFourGames[1]}
					round={5}
					userSelection={getGameWinner(finalFourGames[1]?.gameId, 5)}
					actualResults={actualResults}
					onGameClick={onGameClick}
					isReadOnly={isReadOnly}
					teams={teams}
				/>
			</div>
		</div>
	);
}
