'use client';

import GameCard from './GameCard';
import BracketConnector from './BracketConnector';

/**
 * RegionBracket - Renders a complete region bracket (Rounds 1-4)
 */
export default function RegionBracket({
	region,
	games,
	teams,
	bracketSelections,
	actualResults,
	onGameClick,
	isReadOnly = true,
	reversed = false,
}) {
	// Get selection for a game
	const getGameWinner = (gameId, round) => {
		if (!gameId || !bracketSelections) return null;
		return bracketSelections[round]?.[gameId] || null;
	};

	// Get region text color
	const getRegionTextColor = () => {
		switch (region.toLowerCase()) {
			case 'east':
				return 'text-blue-500';
			case 'west':
				return 'text-red-500';
			case 'south':
				return 'text-green-500';
			case 'midwest':
				return 'text-yellow-500';
			default:
				return '';
		}
	};

	const renderRoundHeaders = () => {
		const headersContent = [
			<div
				key='r1'
				className={getRegionTextColor()}
			>
				{region} - Round 1
			</div>,
			<div
				key='r2'
				className={getRegionTextColor()}
			>
				{region} - Round 2
			</div>,
			<div
				key='r3'
				className={getRegionTextColor()}
			>
				{region} - Sweet 16
			</div>,
			<div
				key='r4'
				className={getRegionTextColor()}
			>
				{region} - Elite Eight
			</div>,
		];

		return reversed ? headersContent.reverse() : headersContent;
	};

	// Render different rounds of the bracket
	const renderRound = (roundNumber) => {
		const numGames =
			roundNumber === 1
				? 8
				: roundNumber === 2
				? 4
				: roundNumber === 3
				? 2
				: 1;
		const rowSpan =
			roundNumber === 1
				? 2
				: roundNumber === 2
				? 2
				: roundNumber === 3
				? 2
				: 2;
		const marginTop =
			roundNumber === 1
				? 0
				: roundNumber === 2
				? 4
				: roundNumber === 3
				? 8
				: 16;

		return (
			<div
				className={`col-span-1 row-span-16 grid grid-rows-${
					numGames * 2
				} gap-1 ${marginTop > 0 ? `mt-${marginTop}` : ''}`}
			>
				{Array(numGames)
					.fill(null)
					.map((_, idx) => (
						<div
							key={`${region.toLowerCase()}-r${roundNumber}-${idx}`}
							className={`row-span-${rowSpan} ${
								roundNumber > 1 ? 'relative' : ''
							}`}
						>
							<GameCard
								game={games[roundNumber][idx]}
								round={roundNumber}
								region={region.toLowerCase()}
								userSelection={getGameWinner(
									games[roundNumber][idx]?.gameId,
									roundNumber
								)}
								actualResults={actualResults}
								onGameClick={onGameClick}
								isReadOnly={isReadOnly}
								teams={teams}
							/>
							{roundNumber > 1 && (
								<BracketConnector type='horizontal' />
							)}
						</div>
					))}
			</div>
		);
	};

	return (
		<>
			{/* Round Headers */}
			<div className='grid grid-cols-4 gap-1 mb-2 text-center text-xs font-bold'>
				{renderRoundHeaders().map((header, i) => (
					<div
						key={`header-${i}`}
						className='col-span-1'
					>
						{header}
					</div>
				))}
			</div>

			{/* Bracket Games */}
			<div className='grid grid-cols-4 grid-rows-16 gap-1'>
				{reversed ? (
					<>
						{renderRound(4)}
						{renderRound(3)}
						{renderRound(2)}
						{renderRound(1)}
					</>
				) : (
					<>
						{renderRound(1)}
						{renderRound(2)}
						{renderRound(3)}
						{renderRound(4)}
					</>
				)}
			</div>
		</>
	);
}
