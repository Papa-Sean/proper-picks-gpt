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
		const userId = searchParams.get('userId');

		const query = db('user_brackets')
			.select('user_brackets.*', 'ai_models.name as model_name')
			.leftJoin('ai_models', 'user_brackets.ai_model_id', 'ai_models.id')
			.orderBy('created_at', 'desc');

		if (userId) {
			query.where('user_id', userId);
		}

		const brackets = await query;
		return NextResponse.json({ brackets });
	} catch (error) {
		console.error('GET /api/brackets error:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch brackets' },
			{ status: 500 }
		);
	}
}

export async function POST(request) {
	try {
		const body = await request.json();

		const [id] = await db('user_brackets').insert({
			user_id: body.userId,
			bracket_type: body.bracketType,
			ai_model_id: body.aiModelId,
			picks: JSON.stringify(body.picks || {}),
			round_scores: JSON.stringify({
				round1: 0,
				round2: 0,
				sweet16: 0,
				elite8: 0,
				finalFour: 0,
				championship: 0,
			}),
		});

		return NextResponse.json({ id, success: true });
	} catch (error) {
		console.error('POST /api/brackets error:', error);
		return NextResponse.json(
			{ error: 'Failed to create bracket' },
			{ status: 500 }
		);
	}
}

export async function PUT(request) {
	try {
		const body = await request.json();

		await db('user_brackets')
			.where('id', body.id)
			.update({
				picks: JSON.stringify(body.picks || {}),
				total_score: body.totalScore,
				round_scores: JSON.stringify(body.roundScores || {}),
			});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('PUT /api/brackets error:', error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

export async function DELETE(request) {
	try {
		const { searchParams } = new URL(request.url);
		const id = searchParams.get('id');

		await db('user_brackets').where('id', id).delete();

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('DELETE /api/brackets error:', error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

export async function PATCH(request) {
	try {
		const body = await request.json();
		const bracketId = body.bracketId;

		const bracket = await db('user_brackets')
			.where('id', bracketId)
			.first();

		if (!bracket) {
			return NextResponse.json(
				{ error: 'Bracket not found' },
				{ status: 404 }
			);
		}

		const picks = JSON.parse(bracket.picks);
		let totalScore = 0;
		const roundScores = {
			round1: 0,
			round2: 0,
			sweet16: 0,
			elite8: 0,
			finalFour: 0,
			championship: 0,
		};

		// Calculate scores based on actual tournament results
		// This is a placeholder for the actual scoring logic

		await db('user_brackets')
			.where('id', bracketId)
			.update({
				total_score: totalScore,
				round_scores: JSON.stringify(roundScores),
			});

		return NextResponse.json({
			success: true,
			totalScore,
			roundScores,
		});
	} catch (error) {
		console.error('PATCH /api/brackets error:', error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
