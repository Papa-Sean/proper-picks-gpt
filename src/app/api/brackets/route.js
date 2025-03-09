import { NextResponse } from 'next/server';
import knex from 'knex';

const db = knex({
	client: 'mysql2',
	connection: {
		host: process.env.DB_HOST || 'localhost',
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_NAME,
		port: parseInt(process.env.DB_PORT || '3307'),
	},
});

export async function GET() {
	try {
		const brackets = await db('brackets').select('*');
		return NextResponse.json({ brackets });
	} catch (error) {
		console.error('Database error:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch brackets' },
			{ status: 500 }
		);
	}
}

export async function POST(request) {
	try {
		const body = await request.json();
		const [id] = await db('brackets').insert({
			name: body.name,
			data: JSON.stringify(body.data || {}),
			user_id: body.userId,
			status: 'pending',
			score: 0,
		});

		return NextResponse.json({ id, success: true });
	} catch (error) {
		console.error('Database error:', error);
		return NextResponse.json(
			{ error: 'Failed to create bracket' },
			{ status: 500 }
		);
	}
}
