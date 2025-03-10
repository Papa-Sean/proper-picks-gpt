import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
	try {
		const { searchParams } = new URL(request.url);
		const teamId = searchParams.get('teamId');

		if (teamId) {
			const team = await prisma.team.findUnique({
				where: { id: parseInt(teamId) },
				include: {
					gamesAsTeam1: true,
					gamesAsTeam2: true,
					gamesWon: true,
					bracketPicks: true,
				},
			});

			if (!team) {
				return NextResponse.json(
					{ error: 'Team not found' },
					{ status: 404 }
				);
			}

			return NextResponse.json({ team });
		}

		const teams = await prisma.team.findMany({
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
		console.error('GET /api/team-statistics error:', error);
		return NextResponse.json({ error: error.message }, { status: 500 });
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
				historicalPerformance: body.historicalPerformance || {},
			},
		});

		return NextResponse.json({ team });
	} catch (error) {
		console.error('POST /api/team-statistics error:', error);
		return NextResponse.json(
			{ error: 'Failed to create team statistics' },
			{ status: 500 }
		);
	}
}
