'use client';

import { useState } from 'react';

export default function BracketForm({ onSubmit }) {
	const [formData, setFormData] = useState({
		name: '',
		data: {
			teams: [],
			predictions: [],
		},
	});
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		try {
			const response = await fetch('/api/brackets', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					name: formData.name,
					data: formData.data,
					userId: '123', // You should get this from your auth state
				}),
			});

			if (!response.ok) {
				throw new Error('Failed to create bracket');
			}

			const result = await response.json();
			setFormData({
				name: '',
				data: {
					teams: [],
					predictions: [],
				},
			});
			if (onSubmit) onSubmit(result);
		} catch (error) {
			console.error('Error creating bracket:', error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6'>
			<h2 className='text-2xl font-bold mb-4'>Create New Bracket</h2>
			<form
				onSubmit={handleSubmit}
				className='space-y-4'
			>
				<div>
					<label
						htmlFor='name'
						className='block text-sm font-medium mb-1'
					>
						Bracket Name
					</label>
					<input
						type='text'
						id='name'
						value={formData.name}
						onChange={(e) =>
							setFormData((prev) => ({
								...prev,
								name: e.target.value,
							}))
						}
						className='input input-bordered w-full'
						required
					/>
				</div>

				{/* You can add more fields here for teams and predictions */}

				<button
					type='submit'
					className='btn btn-primary w-full'
					disabled={loading}
				>
					{loading ? 'Creating...' : 'Create Bracket'}
				</button>
			</form>
		</div>
	);
}
