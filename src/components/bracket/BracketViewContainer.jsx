'use client';

import { useMemo } from 'react';
import RegionBracket from './RegionBracket';
import FinalFourBracket from './FinalFourBracket';
import BracketLegend from './BracketLegend';

/**
 * BracketViewContainer - Main container for the tournament bracket display
 */
export default function BracketViewContainer({
	games = [],
	teams = [],
	bracketSelections = {},
	actualResults = {},
	onGameClick,
	isReadOnly = true,
}) {
	// Organize games by round and region
	const organizedGames = useMemo(() => {
		// Create structure to hold games organized by round and region
		const result = {
			east: { 1: [], 2: [], 3: [], 4: [] },
			west: { 1: [], 2: [], 3: [], 4: [] },
			south: { 1: [], 2: [], 3: [], 4: [] },
			midwest: { 1: [], 2: [], 3: [], 4: [] },
			finalFour: [],
			championship: null,
		};

		if (!games?.length) return result;

		// Process all games and organize them
		games.forEach((game) => {
			if (!game) return;

			const region = game.region?.toLowerCase();
			const round =
				game.round || Math.ceil(Math.log2(64 / game.gameId + 1));

			if (round <= 4 && region) {
				// Rounds 1-4 are organized by region
				if (result[region] && result[region][round]) {
					result[region][round].push(game);
				}
			} else if (round === 5) {
				// Final Four
				result.finalFour.push(game);
			} else if (round === 6) {
				// Championship
				result.championship = game;
			}
		});

		return result;
	}, [games]);

	return (
		<div className='w-full overflow-x-auto'>
			<div className='min-w-[1200px] p-2'>
				{/* Upper Half - East vs South */}
				<div className='grid grid-cols-9 gap-1'>
					{/* East Region */}
					<div className='col-span-4'>
						<RegionBracket
							region='East'
							games={organizedGames.east}
							teams={teams}
							bracketSelections={bracketSelections}
							actualResults={actualResults}
							onGameClick={onGameClick}
							isReadOnly={isReadOnly}
							reversed={false}
						/>
					</div>

					{/* Final Four and Championship */}
					<div className='col-span-1'>
						<div className='text-center mb-2 text-xs font-bold'>
							<div className='bg-base-200 py-1 rounded-t-lg'>
								Final Four
							</div>
						</div>
						<FinalFourBracket
							finalFourGames={organizedGames.finalFour}
							championshipGame={organizedGames.championship}
							teams={teams}
							bracketSelections={bracketSelections}
							actualResults={actualResults}
							onGameClick={onGameClick}
							isReadOnly={isReadOnly}
						/>
					</div>

					{/* South Region (reversed) */}
					<div className='col-span-4'>
						<RegionBracket
							region='South'
							games={organizedGames.south}
							teams={teams}
							bracketSelections={bracketSelections}
							actualResults={actualResults}
							onGameClick={onGameClick}
							isReadOnly={isReadOnly}
							reversed={true}
						/>
					</div>
				</div>

				{/* Lower Half - West vs Midwest */}
				<div className='grid grid-cols-9 gap-1 mt-8'>
					{/* West Region */}
					<div className='col-span-4'>
						<RegionBracket
							region='West'
							games={organizedGames.west}
							teams={teams}
							bracketSelections={bracketSelections}
							actualResults={actualResults}
							onGameClick={onGameClick}
							isReadOnly={isReadOnly}
							reversed={false}
						/>
					</div>

					{/* Center spacer */}
					<div className='col-span-1'>
						<div className='text-center mb-2 text-xs font-bold'>
							<div className='opacity-0'>Spacer</div>
						</div>
					</div>

					{/* Midwest Region (reversed) */}
					<div className='col-span-4'>
						<RegionBracket
							region='Midwest'
							games={organizedGames.midwest}
							teams={teams}
							bracketSelections={bracketSelections}
							actualResults={actualResults}
							onGameClick={onGameClick}
							isReadOnly={isReadOnly}
							reversed={true}
						/>
					</div>
				</div>

				{/* Legend */}
				<BracketLegend />
			</div>
		</div>
	);
}
