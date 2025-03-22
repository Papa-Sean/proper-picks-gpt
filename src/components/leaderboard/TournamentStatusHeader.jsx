'use client';

export default function TournamentStatusHeader({
	tournamentInfo,
	isComparingBrackets = false,
	comparisonData = null,
}) {
	return (
		<div className='flex flex-col space-y-2'>
			<h2 className='text-lg sm:text-xl font-bold'>
				{isComparingBrackets && comparisonData
					? `Comparing to: ${comparisonData.bracketName}`
					: `Current Round: ${
							tournamentInfo.roundNames[
								tournamentInfo.currentRound - 1
							]
					  }`}
			</h2>

			{!isComparingBrackets && (
				<div className='flex flex-wrap gap-1 sm:gap-2'>
					{tournamentInfo.roundNames.map((name, index) => (
						<div
							key={index}
							className={`badge badge-sm sm:badge-md ${
								index < tournamentInfo.currentRound
									? 'badge-secondary'
									: 'badge-outline'
							}`}
						>
							{name}
						</div>
					))}
				</div>
			)}

			{!isComparingBrackets && tournamentInfo.lastUpdated && (
				<div className='text-xs sm:text-sm opacity-70'>
					Last updated: {tournamentInfo.lastUpdated.toLocaleString()}
				</div>
			)}

			{isComparingBrackets && comparisonData && (
				<div className='text-xs sm:text-sm italic'>
					Brackets are scored as if {comparisonData.userName}'s picks
					were all correct
				</div>
			)}
		</div>
	);
}
