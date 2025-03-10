import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
	try {
		const { searchParams } = new URL(request.url);
		const userId = searchParams.get('userId');
		const bracketId = searchParams.get('id');

		if (bracketId) {
			const bracket = await prisma.bracket.findUnique({
				where: {
					id: parseInt(bracketId),
				},
				include: {
					aiModel: true,
					leaderboard: true,
					bracketPicks: {
						include: {
							game: true,
							predictedWinner: true,
						},
					},
				},
			});

			if (!bracket) {
				return NextResponse.json(
					{ error: 'Bracket not found' },
					{ status: 404 }
				);
			}
			return NextResponse.json(bracket);
		}

		const brackets = await prisma.bracket.findMany({
			where: userId ? { userId } : undefined,
			include: {
				aiModel: true,
				leaderboard: true,
			},
			orderBy: {
				createdAt: 'desc',
			},
		});

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

		// Validate required fields
		if (!body.name || !body.userId) {
			return NextResponse.json(
				{ error: 'Name and userId are required' },
				{ status: 400 }
			);
		}

		// Start transaction
		const trx = await db.transaction();

		try {
			// Create bracket
			const [bracketId] = await trx('brackets').insert({
				name: body.name,
				user_id: body.userId,
				bracket_type: body.type || 'manual',
				ai_model_id: body.aiModelId,
				picks: JSON.stringify(body.picks || {}),
				status: 'pending',
				round_scores: JSON.stringify({
					round1: 0,
					round2: 0,
					sweet16: 0,
					elite8: 0,
					finalFour: 0,
					championship: 0,
				}),
			});

			// Initialize leaderboard entry
			await trx('leaderboards').insert({
				bracket_id: bracketId,
				total_score: 0,
				correct_picks: 0,
				incorrect_picks: 0,
				round_scores: JSON.stringify({
					round1: 0,
					round2: 0,
					sweet16: 0,
					elite8: 0,
					finalFour: 0,
					championship: 0,
				}),
			});

			await trx.commit();
			return NextResponse.json({ id: bracketId, success: true });
		} catch (error) {
			await trx.rollback();
			throw error;
		}
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

		if (!body.id) {
			return NextResponse.json(
				{ error: 'Bracket ID is required' },
				{ status: 400 }
			);
		}

		const trx = await db.transaction();

		try {
			await trx('brackets')
				.where('id', body.id)
				.update({
					picks: JSON.stringify(body.picks || {}),
					status: body.status || 'pending',
					round_scores: JSON.stringify(body.roundScores || {}),
				});

			if (body.leaderboard) {
				await trx('leaderboards')
					.where('bracket_id', body.id)
					.update({
						total_score: body.leaderboard.totalScore || 0,
						correct_picks: body.leaderboard.correctPicks || 0,
						incorrect_picks: body.leaderboard.incorrectPicks || 0,
						round_scores: JSON.stringify(
							body.leaderboard.roundScores || {}
						),
					});
			}

			await trx.commit();
			return NextResponse.json({ success: true });
		} catch (error) {
			await trx.rollback();
			throw error;
		}
	} catch (error) {
		console.error('PUT /api/brackets error:', error);
		return NextResponse.json(
			{ error: 'Failed to update bracket' },
			{ status: 500 }
		);
	}
}

export async function DELETE(request) {
	try {
		const { searchParams } = new URL(request.url);
		const id = searchParams.get('id');

		if (!id) {
			return NextResponse.json(
				{ error: 'Bracket ID is required' },
				{ status: 400 }
			);
		}

		const trx = await db.transaction();

		try {
			// Delete related records first
			await trx('leaderboards').where('bracket_id', id).delete();
			await trx('bracket_picks').where('bracket_id', id).delete();
			await trx('brackets').where('id', id).delete();

			await trx.commit();
			return NextResponse.json({ success: true });
		} catch (error) {
			await trx.rollback();
			throw error;
		}
	} catch (error) {
		console.error('DELETE /api/brackets error:', error);
		return NextResponse.json(
			{ error: 'Failed to delete bracket' },
			{ status: 500 }
		);
	}
}
