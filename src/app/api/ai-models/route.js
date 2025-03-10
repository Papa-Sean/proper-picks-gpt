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
		const includePerformance =
			searchParams.get('includePerformance') === 'true';

		const query = db('ai_models').select('ai_models.*');

		if (includePerformance) {
			query
				.leftJoin(
					'ai_model_performance',
					'ai_models.id',
					'ai_model_performance.model_id'
				)
				.select(
					'ai_model_performance.accuracy_score',
					'ai_model_performance.rounds_accuracy'
				);
		}

		const models = await query;
		return NextResponse.json({ models });
	} catch (error) {
		console.error('GET /api/ai-models error:', error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

export async function POST(request) {
	try {
		const body = await request.json();

		const [id] = await db('ai_models').insert({
			name: body.name,
			configuration: JSON.stringify(body.configuration || {}),
		});

		if (body.performance) {
			await db('ai_model_performance').insert({
				model_id: id,
				season: body.performance.season,
				accuracy_score: body.performance.accuracy_score,
				rounds_accuracy: JSON.stringify(
					body.performance.rounds_accuracy || {}
				),
			});
		}

		return NextResponse.json({ id, success: true });
	} catch (error) {
		console.error('POST /api/ai-models error:', error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
