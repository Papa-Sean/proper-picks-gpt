import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
	try {
		const teams = await prisma.team.findMany({
			orderBy: [{ region: 'asc' }, { seed: 'asc' }],
			include: {
				_count: {
					select: {
						gamesWon: true,
						bracketPicks: true,
					},
				},
			},
		});

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

		const team = await prisma.team.create({
			data: {
				name: body.name,
				seed: body.seed,
				region: body.region,
				year: body.year,
				stats: body.stats || {},
				historicalPerformance: body.historical_performance || {},
			},
		});

		return NextResponse.json({ id: team.id, success: true });
	} catch (error) {
		console.error('POST /api/tournament-teams error:', error);
		return NextResponse.json(
			{ error: 'Failed to create tournament team' },
			{ status: 500 }
		);
	}
}
