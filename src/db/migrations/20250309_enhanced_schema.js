exports.up = async function (knex) {
	// Disable foreign key checks
	await knex.raw('SET FOREIGN_KEY_CHECKS = 0');

	// Drop existing tables to ensure clean slate
	await knex.schema.dropTableIfExists('leaderboards');
	await knex.schema.dropTableIfExists('bracket_picks');
	await knex.schema.dropTableIfExists('brackets');
	await knex.schema.dropTableIfExists('model_training_data');
	await knex.schema.dropTableIfExists('historic_games');
	await knex.schema.dropTableIfExists('games');
	await knex.schema.dropTableIfExists('ai_models');
	await knex.schema.dropTableIfExists('ai_instructions');
	await knex.schema.dropTableIfExists('teams');

	// Re-enable foreign key checks
	await knex.raw('SET FOREIGN_KEY_CHECKS = 1');

	// Create tables in order
	return (
		knex.schema
			// Teams table
			.createTable('teams', (table) => {
				table.increments('id').unsigned().primary();
				table.string('name').notNullable();
				table.string('seed').notNullable();
				table.string('region').notNullable();
				table.integer('year').notNullable();
				table.json('stats');
				table.json('historical_performance');
				table.timestamps(true, true);
			})
			// AI Instructions table
			.createTable('ai_instructions', (table) => {
				table.increments('id').primary();
				table.string('user_id');
				table.string('name').notNullable();
				table.json('parameters').notNullable();
				table.timestamps(true, true);
			})
			// AI Models table
			.createTable('ai_models', (table) => {
				table.increments('id').primary();
				table.string('name').notNullable();
				table.json('configuration');
				table.json('training_parameters');
				table.json('performance_metrics');
				table.timestamps(true, true);
			})
			// Games table
			.createTable('games', (table) => {
				table.increments('id').primary();
				table.integer('team1_id').unsigned();
				table.integer('team2_id').unsigned();
				table.integer('winner_id').unsigned();
				table.integer('round').notNullable();
				table.date('game_date');
				table.json('stats');
				table.timestamps(true, true);
				table
					.foreign('team1_id')
					.references('teams.id')
					.onDelete('CASCADE');
				table
					.foreign('team2_id')
					.references('teams.id')
					.onDelete('CASCADE');
				table
					.foreign('winner_id')
					.references('teams.id')
					.onDelete('SET NULL');
			})
			// Historic Games table
			.createTable('historic_games', (table) => {
				table.increments('id').primary();
				table.integer('team1_id').unsigned();
				table.integer('team2_id').unsigned();
				table.integer('winner_id').unsigned();
				table.integer('year').notNullable();
				table.integer('round').notNullable();
				table.json('stats');
				table.timestamps(true, true);
				table
					.foreign('team1_id')
					.references('teams.id')
					.onDelete('CASCADE');
				table
					.foreign('team2_id')
					.references('teams.id')
					.onDelete('CASCADE');
				table
					.foreign('winner_id')
					.references('teams.id')
					.onDelete('SET NULL');
			})
			// Model Training Data table
			.createTable('model_training_data', (table) => {
				table.integer('model_id').unsigned();
				table.integer('historic_game_id').unsigned();
				table.json('training_data');
				table.timestamps(true, true);
				table.primary(['model_id', 'historic_game_id']);
				table
					.foreign('model_id')
					.references('ai_models.id')
					.onDelete('CASCADE');
				table
					.foreign('historic_game_id')
					.references('historic_games.id')
					.onDelete('CASCADE');
			})
			// Brackets table
			.createTable('brackets', (table) => {
				table.increments('id').primary();
				table.string('name').notNullable();
				table.string('user_id').notNullable();
				table
					.enum('bracket_type', ['manual', 'ai_assisted'])
					.notNullable();
				table.integer('ai_model_id').unsigned().nullable();
				table.json('picks');
				table.string('status').defaultTo('pending');
				table.integer('total_score').defaultTo(0);
				table.json('round_scores');
				table.boolean('is_active').defaultTo(true);
				table.timestamps(true, true);
				table
					.foreign('ai_model_id')
					.references('ai_models.id')
					.onDelete('SET NULL');
			})
			// Bracket Picks table
			.createTable('bracket_picks', (table) => {
				table.increments('id').primary();
				table.integer('bracket_id').unsigned();
				table.integer('game_id').unsigned();
				table.integer('predicted_winner_id').unsigned();
				table.boolean('is_correct').nullable();
				table.integer('points_earned').defaultTo(0);
				table.timestamps(true, true);
				table
					.foreign('bracket_id')
					.references('brackets.id')
					.onDelete('CASCADE');
				table
					.foreign('game_id')
					.references('games.id')
					.onDelete('CASCADE');
				table
					.foreign('predicted_winner_id')
					.references('teams.id')
					.onDelete('CASCADE');
			})
			// Leaderboards table
			.createTable('leaderboards', (table) => {
				table.increments('id').primary();
				table.integer('bracket_id').unsigned().unique();
				table.integer('total_score').defaultTo(0);
				table.integer('correct_picks').defaultTo(0);
				table.integer('incorrect_picks').defaultTo(0);
				table.json('round_scores');
				table.timestamps(true, true);
				table
					.foreign('bracket_id')
					.references('brackets.id')
					.onDelete('CASCADE');
			})
	);
};

exports.down = async function (knex) {
	// Disable foreign key checks
	await knex.raw('SET FOREIGN_KEY_CHECKS = 0');

	// Drop tables in reverse order
	await knex.schema.dropTableIfExists('leaderboards');
	await knex.schema.dropTableIfExists('bracket_picks');
	await knex.schema.dropTableIfExists('brackets');
	await knex.schema.dropTableIfExists('model_training_data');
	await knex.schema.dropTableIfExists('historic_games');
	await knex.schema.dropTableIfExists('games');
	await knex.schema.dropTableIfExists('ai_models');
	await knex.schema.dropTableIfExists('ai_instructions');
	await knex.schema.dropTableIfExists('teams');

	// Re-enable foreign key checks
	await knex.raw('SET FOREIGN_KEY_CHECKS = 1');

	return Promise.resolve();
};
