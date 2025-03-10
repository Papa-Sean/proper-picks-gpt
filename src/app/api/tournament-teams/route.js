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

export async function GET() {
	try {
		const teams = await db('tournament_teams')
			.select('*')
			.orderBy('region', 'asc')
			.orderBy('seed', 'asc');

		return NextResponse.json({ teams });
	} catch (error) {
		console.error('GET /api/tournament-teams error:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch tournament teams' },
			{ status: 500 }
		);
	}
}

export async function POST(request) {
	try {
		const body = await request.json();

		const [id] = await db('tournament_teams').insert({
			name: body.name,
			seed: body.seed,
			region: body.region,
			year: body.year,
			stats: JSON.stringify(body.stats || {}),
			historical_performance: JSON.stringify(
				body.historical_performance || {}
			),
		});

		return NextResponse.json({ id, success: true });
	} catch (error) {
		console.error('POST /api/tournament-teams error:', error);
		return NextResponse.json(
			{ error: 'Failed to create tournament team' },
			{ status: 500 }
		);
	}
}
