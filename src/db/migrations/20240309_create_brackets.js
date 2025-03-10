exports.up = function (knex) {
	return (
		knex.schema
			// Teams table
			.createTable('teams', (table) => {
				table.increments('id').primary();
				table.string('name').notNullable();
				table.string('seed').notNullable();
				table.integer('year').notNullable();
				table.json('stats');
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
				// Add foreign key constraints
				table.foreign('team1_id').references('teams.id');
				table.foreign('team2_id').references('teams.id');
				table.foreign('winner_id').references('teams.id');
			})
			// Historic Games table
			.createTable('historic_games', (table) => {
				table.increments('id').primary();
				table.integer('team1_id').unsigned();
				table.integer('team2_id').unsigned();
				table.integer('winner_id').unsigned();
				table.integer('year').notNullable();
				table.json('stats');
				table.timestamps(true, true);
				// Add foreign key constraints
				table.foreign('team1_id').references('teams.id');
				table.foreign('team2_id').references('teams.id');
				table.foreign('winner_id').references('teams.id');
			})
			// Model Training Data table
			.createTable('model_training_data', (table) => {
				table.integer('model_id').unsigned();
				table.integer('historic_game_id').unsigned();
				table.timestamps(true, true);
				table.primary(['model_id', 'historic_game_id']);
				// Add foreign key constraints
				table.foreign('model_id').references('ai_models.id');
				table
					.foreign('historic_game_id')
					.references('historic_games.id');
			})
			// Brackets table
			.createTable('brackets', (table) => {
				table.increments('id').primary();
				table.string('name').notNullable();
				table.json('data').notNullable();
				table.string('user_id').notNullable();
				table.string('status').defaultTo('pending');
				table.integer('score').defaultTo(0);
				table.json('metadata').nullable();
				table.integer('ai_model_id').unsigned();
				table.timestamps(true, true);
				// Add foreign key constraint
				table.foreign('ai_model_id').references('ai_models.id');
			})
			// Bracket Picks table
			.createTable('bracket_picks', (table) => {
				table.increments('id').primary();
				table.integer('bracket_id').unsigned();
				table.integer('game_id').unsigned();
				table.integer('predicted_winner_id').unsigned();
				table.boolean('is_correct').nullable();
				table.timestamps(true, true);
				// Add foreign key constraints
				table.foreign('bracket_id').references('brackets.id');
				table.foreign('game_id').references('games.id');
				table.foreign('predicted_winner_id').references('teams.id');
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
				// Add foreign key constraint
				table.foreign('bracket_id').references('brackets.id');
			})
	);
};

exports.down = function (knex) {
	return knex.schema
		.dropTableIfExists('leaderboards')
		.dropTableIfExists('bracket_picks')
		.dropTableIfExists('model_training_data')
		.dropTableIfExists('historic_games')
		.dropTableIfExists('brackets')
		.dropTableIfExists('games')
		.dropTableIfExists('ai_models')
		.dropTableIfExists('ai_instructions')
		.dropTableIfExists('teams');
};
