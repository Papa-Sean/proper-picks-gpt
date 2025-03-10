'use client';

import { useState } from 'react';

export default function AIModelForm({ onSubmit }) {
	const [formData, setFormData] = useState({
		name: '',
		instructionId: '',
		configuration: {
			learningRate: 0.001,
			epochs: 100,
			batchSize: 32,
		},
	});

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const response = await fetch('/api/ai-models', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formData),
			});

			if (!response.ok) throw new Error('Failed to create AI model');

			const result = await response.json();
			if (onSubmit) onSubmit(result);
		} catch (error) {
			console.error('Error creating AI model:', error);
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			className='space-y-4'
		>
			<div>
				<label className='block text-sm font-medium'>Model Name</label>
				<input
					type='text'
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

			<div>
				<label className='block text-sm font-medium'>
					Configuration
				</label>
				<div className='grid grid-cols-3 gap-4'>
					<input
						type='number'
						placeholder='Learning Rate'
						value={formData.configuration.learningRate}
						onChange={(e) =>
							setFormData((prev) => ({
								...prev,
								configuration: {
									...prev.configuration,
									learningRate: parseFloat(e.target.value),
								},
							}))
						}
						className='input input-bordered'
						step='0.001'
						required
					/>
					<input
						type='number'
						placeholder='Epochs'
						value={formData.configuration.epochs}
						onChange={(e) =>
							setFormData((prev) => ({
								...prev,
								configuration: {
									...prev.configuration,
									epochs: parseInt(e.target.value),
								},
							}))
						}
						className='input input-bordered'
						required
					/>
					<input
						type='number'
						placeholder='Batch Size'
						value={formData.configuration.batchSize}
						onChange={(e) =>
							setFormData((prev) => ({
								...prev,
								configuration: {
									...prev.configuration,
									batchSize: parseInt(e.target.value),
								},
							}))
						}
						className='input input-bordered'
						required
					/>
				</div>
			</div>

			<button
				type='submit'
				className='btn btn-primary w-full'
			>
				Create AI Model
			</button>
		</form>
	);
}
