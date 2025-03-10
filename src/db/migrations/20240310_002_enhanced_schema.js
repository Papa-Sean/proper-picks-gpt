exports.up = async function (knex) {
	// Drop all existing tables in reverse dependency order
	await knex.raw('SET FOREIGN_KEY_CHECKS=0');
	await knex.schema.dropTableIfExists('user_brackets');
	await knex.schema.dropTableIfExists('ai_model_performance');
	await knex.schema.dropTableIfExists('matchup_history');
	await knex.schema.dropTableIfExists('team_statistics');
	await knex.schema.dropTableIfExists('ai_models');
	await knex.schema.dropTableIfExists('tournament_teams');
	await knex.raw('SET FOREIGN_KEY_CHECKS=1');

	// Create tables in dependency order
	return knex.schema
		.createTable('tournament_teams', (table) => {
			table.increments('id').unsigned().primary();
			table.string('name').notNullable();
			table.integer('seed').notNullable();
			table.string('region').notNullable();
			table.integer('year').notNullable();
			table.json('stats');
			table.json('historical_performance');
			table.timestamps(true, true);
		})
		.then(() =>
			knex.schema.createTable('team_statistics', (table) => {
				table.increments('id').unsigned().primary();
				table.integer('team_id').unsigned();
				table.integer('season').notNullable();
				table.float('win_loss_ratio');
				table.float('strength_of_schedule');
				table.float('points_per_game');
				table.float('points_allowed');
				table.float('field_goal_percentage');
				table.float('three_point_percentage');
				table.float('free_throw_percentage');
				table.float('rebounds_per_game');
				table.float('assists_per_game');
				table.float('steals_per_game');
				table.float('blocks_per_game');
				table.float('turnovers_per_game');
				table.timestamps(true, true);
				table
					.foreign('team_id')
					.references('tournament_teams.id')
					.onDelete('CASCADE');
			})
		)
		.then(() =>
			knex.schema.createTable('ai_models', (table) => {
				table.increments('id').unsigned().primary();
				table.string('name').notNullable();
				table.json('configuration');
				table.timestamps(true, true);
			})
		)
		.then(() =>
			knex.schema.createTable('matchup_history', (table) => {
				table.increments('id').unsigned().primary();
				table.integer('team1_id').unsigned();
				table.integer('team2_id').unsigned();
				table.integer('winner_id').unsigned();
				table.integer('season').notNullable();
				table.string('tournament_round');
				table.integer('score_difference');
				table.boolean('upset_flag').defaultTo(false);
				table.timestamps(true, true);
				table
					.foreign('team1_id')
					.references('tournament_teams.id')
					.onDelete('CASCADE');
				table
					.foreign('team2_id')
					.references('tournament_teams.id')
					.onDelete('CASCADE');
				table
					.foreign('winner_id')
					.references('tournament_teams.id')
					.onDelete('CASCADE');
			})
		)
		.then(() =>
			knex.schema.createTable('ai_model_performance', (table) => {
				table.increments('id').unsigned().primary();
				table.integer('model_id').unsigned();
				table.integer('season').notNullable();
				table.float('accuracy_score');
				table.json('rounds_accuracy');
				table.float('upset_prediction_accuracy');
				table.json('feature_importance');
				table.timestamps(true, true);
				table
					.foreign('model_id')
					.references('ai_models.id')
					.onDelete('CASCADE');
			})
		)
		.then(() =>
			knex.schema.createTable('user_brackets', (table) => {
				table.increments('id').unsigned().primary();
				table.string('user_id').notNullable();
				table
					.enum('bracket_type', ['manual', 'ai_assisted'])
					.notNullable();
				table.integer('ai_model_id').unsigned().nullable();
				table.integer('total_score').defaultTo(0);
				table.boolean('is_active').defaultTo(true);
				table.json('picks');
				table.json('round_scores');
				table.timestamps(true, true);
				table
					.foreign('ai_model_id')
					.references('ai_models.id')
					.onDelete('SET NULL');
			})
		);
};

exports.down = async function (knex) {
	await knex.raw('SET FOREIGN_KEY_CHECKS=0');
	await knex.schema.dropTableIfExists('user_brackets');
	await knex.schema.dropTableIfExists('ai_model_performance');
	await knex.schema.dropTableIfExists('matchup_history');
	await knex.schema.dropTableIfExists('team_statistics');
	await knex.schema.dropTableIfExists('ai_models');
	await knex.schema.dropTableIfExists('tournament_teams');
	await knex.raw('SET FOREIGN_KEY_CHECKS=1');
	return Promise.resolve();
};
