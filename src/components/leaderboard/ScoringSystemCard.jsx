'use client';

export default function ScoringSystemCard() {
	return (
		<div className='mt-10 p-4 bg-base-200 rounded-lg'>
			<details>
				<summary className='text-lg font-bold cursor-pointer'>
					Scoring System
				</summary>
				<div className='mt-2'>
					<ul className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 list-inside'>
						<li className='flex items-center gap-2'>
							<span className='badge badge-sm'>1</span>
							First Round: 1 point
						</li>
						<li className='flex items-center gap-2'>
							<span className='badge badge-sm'>2</span>
							Second Round: 2 points
						</li>
						<li className='flex items-center gap-2'>
							<span className='badge badge-sm'>4</span>
							Sweet 16: 4 points
						</li>
						<li className='flex items-center gap-2'>
							<span className='badge badge-sm'>8</span>
							Elite 8: 8 points
						</li>
						<li className='flex items-center gap-2'>
							<span className='badge badge-sm'>16</span>
							Final Four: 16 points
						</li>
						<li className='flex items-center gap-2'>
							<span className='badge badge-sm'>32</span>
							Championship: 32 points
						</li>
					</ul>
					<p className='mt-2 text-xs sm:text-sm opacity-70'>
						Maximum possible score: 192 points
					</p>
				</div>
			</details>
		</div>
	);
}
