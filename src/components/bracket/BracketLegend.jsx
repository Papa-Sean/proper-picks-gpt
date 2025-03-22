'use client';

/**
 * BracketLegend - Displays the legend for regions and scoring
 */
export default function BracketLegend() {
	return (
		<div className='flex justify-center items-center mt-4 gap-6 text-xs flex-wrap'>
			{/* Region colors */}
			<div className='flex items-center'>
				<div className='w-3 h-3 border-l-4 border-blue-500 mr-2'></div>
				<span>East Region</span>
			</div>
			<div className='flex items-center'>
				<div className='w-3 h-3 border-l-4 border-red-500 mr-2'></div>
				<span>West Region</span>
			</div>
			<div className='flex items-center'>
				<div className='w-3 h-3 border-l-4 border-green-500 mr-2'></div>
				<span>South Region</span>
			</div>
			<div className='flex items-center'>
				<div className='w-3 h-3 border-l-4 border-yellow-500 mr-2'></div>
				<span>Midwest Region</span>
			</div>

			{/* Scoring legend */}
			<div className='flex items-center ml-6'>
				<div className='w-3 h-3 bg-success/20 border border-success mr-2'></div>
				<span>Correct Pick</span>
			</div>
			<div className='flex items-center'>
				<div className='w-3 h-3 bg-warning/20 border border-warning mr-2'></div>
				<span>Incorrect Pick</span>
			</div>
			<div className='flex items-center'>
				<div className='w-3 h-3 bg-secondary/20 border border-secondary mr-2'></div>
				<span>Your Selection</span>
			</div>
		</div>
	);
}
