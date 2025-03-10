import { NextResponse } from 'next/server';
import knex from 'knex';

const db = knex({
	client: 'mysql2',
	connection: {
		host: process.env.DB_HOST,
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_NAME,
		port: process.env.DB_PORT,
	},
});

export async function GET(request) {
	try {
		const { searchParams } = new URL(request.url);
		const teamId = searchParams.get('teamId');
		const season = searchParams.get('season');

		const query = db('team_statistics')
			.select('team_statistics.*', 'tournament_teams.name as team_name')
			.leftJoin(
				'tournament_teams',
				'team_statistics.team_id',
				'tournament_teams.id'
			);

		if (teamId) query.where('team_id', teamId);
		if (season) query.where('season', season);

		const stats = await query;
		return NextResponse.json({ stats });
	} catch (error) {
		console.error('GET /api/team-statistics error:', error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

export async function POST(request) {
	try {
		const body = await request.json();

		const [id] = await db('team_statistics').insert({
			team_id: body.teamId,
			season: body.season,
			win_loss_ratio: body.winLossRatio,
			strength_of_schedule: body.strengthOfSchedule,
			points_per_game: body.pointsPerGame,
			points_allowed: body.pointsAllowed,
			field_goal_percentage: body.fieldGoalPercentage,
			three_point_percentage: body.threePointPercentage,
			free_throw_percentage: body.freeThrowPercentage,
			rebounds_per_game: body.reboundsPerGame,
			assists_per_game: body.assistsPerGame,
			steals_per_game: body.stealsPerGame,
			blocks_per_game: body.blocksPerGame,
			turnovers_per_game: body.turnoversPerGame,
		});

		return NextResponse.json({ id, success: true });
	} catch (error) {
		console.error('POST /api/team-statistics error:', error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
