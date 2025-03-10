exports.seed = async function (knex) {
	// Clear existing data
	await knex('user_brackets').del();
	await knex('ai_model_performance').del();
	await knex('matchup_history').del();
	await knex('team_statistics').del();
	await knex('ai_models').del();
	await knex('tournament_teams').del();

	// Insert tournament teams
	const teamIds = await knex('tournament_teams')
		.insert([
			{
				name: 'Kentucky',
				seed: 1,
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
				seed: 2,
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
				seed: 1,
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

	// Insert team statistics
	await knex('team_statistics').insert([
		{
			team_id: teamIds[0],
			season: 2024,
			win_loss_ratio: 0.765,
			strength_of_schedule: 0.82,
			points_per_game: 87.5,
			points_allowed: 70.2,
			field_goal_percentage: 0.486,
			three_point_percentage: 0.375,
			free_throw_percentage: 0.725,
			rebounds_per_game: 38.5,
			assists_per_game: 15.8,
			steals_per_game: 7.2,
			blocks_per_game: 5.1,
			turnovers_per_game: 11.3,
		},
		{
			team_id: teamIds[1],
			season: 2024,
			win_loss_ratio: 0.75,
			strength_of_schedule: 0.79,
			points_per_game: 81.4,
			points_allowed: 68.9,
			field_goal_percentage: 0.472,
			three_point_percentage: 0.368,
			free_throw_percentage: 0.738,
			rebounds_per_game: 36.2,
			assists_per_game: 14.5,
			steals_per_game: 6.8,
			blocks_per_game: 4.2,
			turnovers_per_game: 10.8,
		},
	]);

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
			{
				name: 'Upset Specialist 2024',
				configuration: JSON.stringify({
					algorithm: 'gradient_boost',
					parameters: {
						trees: 100,
						depth: 5,
					},
				}),
			},
		])
		.returning('id');

	// Insert AI model performance
	await knex('ai_model_performance').insert([
		{
			model_id: modelIds[0],
			season: 2024,
			accuracy_score: 0.68,
			rounds_accuracy: JSON.stringify({
				round1: 0.72,
				round2: 0.65,
				sweet16: 0.63,
				elite8: 0.5,
				finalFour: 0.5,
				championship: 1.0,
			}),
			upset_prediction_accuracy: 0.45,
			feature_importance: JSON.stringify({
				win_loss_ratio: 0.3,
				strength_of_schedule: 0.25,
				points_per_game: 0.2,
			}),
		},
	]);

	// Insert matchup history
	await knex('matchup_history').insert([
		{
			team1_id: teamIds[0],
			team2_id: teamIds[1],
			winner_id: teamIds[0],
			season: 2024,
			tournament_round: 'Elite Eight',
			score_difference: 8,
			upset_flag: false,
		},
	]);

	// Insert user brackets
	await knex('user_brackets').insert([
		{
			user_id: 'user123',
			bracket_type: 'manual',
			total_score: 45,
			is_active: true,
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
			user_id: 'user123',
			bracket_type: 'ai_assisted',
			ai_model_id: modelIds[0],
			total_score: 52,
			is_active: true,
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
};
