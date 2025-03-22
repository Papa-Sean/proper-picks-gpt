'use client';

import { memo } from 'react';

function BracketNamingForm({
	bracketName,
	setBracketName,
	onSubmit,
	onBack,
	isSubmitting,
}) {
	return (
		<div className='card bg-base-100 shadow-md p-4 sm:p-6 mt-8'>
			<h3 className='text-lg font-bold mb-4'>Name Your Bracket</h3>
			<div className='form-control w-full'>
				<label className='label'>
					<span className='label-text'>
						Give your bracket a memorable name
					</span>
				</label>
				<input
					type='text'
					placeholder='My Winning Bracket 2025'
					className='input input-bordered w-full'
					value={bracketName}
					onChange={(e) => setBracketName(e.target.value)}
					required
				/>

				{/* Show character limit */}
				<label className='label'>
					<span className='label-text-alt'>
						{bracketName.length}/50 characters
					</span>
				</label>
			</div>

			<div className='mt-6'>
				<div className='flex flex-col sm:flex-row gap-4 sm:justify-between items-center'>
					<div className='w-full sm:w-auto order-2 sm:order-1'>
						<button
							className='btn btn-outline w-full sm:w-auto'
							onClick={onBack}
							type='button'
						>
							Back to Editing
						</button>
					</div>

					<div className='w-full sm:w-auto order-1 sm:order-2'>
						<button
							className='btn btn-secondary w-full sm:w-auto'
							onClick={onSubmit}
							disabled={isSubmitting || !bracketName.trim()}
							type='button'
						>
							{isSubmitting ? (
								<>
									<span className='loading loading-spinner loading-sm mr-2'></span>
									Submitting...
								</>
							) : (
								'Submit Bracket'
							)}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

export default memo(BracketNamingForm);
