exports.seed = async function (knex) {
	// Clear existing data
	await knex('leaderboards').del();
	await knex('bracket_picks').del();
	await knex('brackets').del();
	await knex('model_training_data').del();
	await knex('historic_games').del();
	await knex('games').del();
	await knex('ai_models').del();
	await knex('ai_instructions').del();
	await knex('teams').del();

	// Insert teams
	const teamIds = await knex('teams')
		.insert([
			{
				name: 'Kentucky',
				seed: '1',
				region: 'South',
				year: 2024,
				stats: JSON.stringify({
					wins: 26,
					losses: 8,
					conference: 'SEC',
				}),
			},
			{
				name: 'Duke',
				seed: '2',
				region: 'South',
				year: 2024,
				stats: JSON.stringify({
					wins: 24,
					losses: 8,
					conference: 'ACC',
				}),
			},
			{
				name: 'Houston',
				seed: '1',
				region: 'East',
				year: 2024,
				stats: JSON.stringify({
					wins: 29,
					losses: 4,
					conference: 'Big 12',
				}),
			},
		])
		.returning('id');

	// Insert AI models
	const modelIds = await knex('ai_models')
		.insert([
			{
				name: 'BaseLine Predictor 2024',
				configuration: JSON.stringify({
					algorithm: 'neural_network',
					parameters: {
						layers: [64, 32, 16],
						learning_rate: 0.001,
					},
				}),
			},
		])
		.returning('id');

	// Insert brackets
	await knex('brackets').insert([
		{
			name: 'Test Bracket 1',
			user_id: 'user123',
			bracket_type: 'manual',
			picks: JSON.stringify({
				round1: [1, 2, 3, 4],
				round2: [1, 2],
				sweet16: [1],
				championship: 1,
			}),
			round_scores: JSON.stringify({
				round1: 20,
				round2: 15,
				sweet16: 10,
				elite8: 0,
				finalFour: 0,
				championship: 0,
			}),
		},
		{
			name: 'AI Test Bracket',
			user_id: 'user123',
			bracket_type: 'ai_assisted',
			ai_model_id: modelIds[0],
			picks: JSON.stringify({
				round1: [1, 2, 3, 4],
				round2: [1, 3],
				sweet16: [1],
				championship: 1,
			}),
			round_scores: JSON.stringify({
				round1: 24,
				round2: 18,
				sweet16: 10,
				elite8: 0,
				finalFour: 0,
				championship: 0,
			}),
		},
	]);

	// Insert games
	const gameIds = await knex('games')
		.insert([
			{
				team1_id: teamIds[0],
				team2_id: teamIds[1],
				round: 1,
				game_date: new Date(),
				stats: JSON.stringify({
					final_score: '75-68',
					attendance: 18000,
				}),
			},
		])
		.returning('id');
};
