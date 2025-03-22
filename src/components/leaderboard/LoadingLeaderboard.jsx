'use client';

export default function LoadingLeaderboard() {
	return (
		<div className='flex flex-col justify-center items-center py-12'>
			<div className='loading loading-spinner loading-lg text-secondary'></div>
			<p className='mt-4 text-base-content/70'>
				Loading leaderboard data...
			</p>
		</div>
	);
}
