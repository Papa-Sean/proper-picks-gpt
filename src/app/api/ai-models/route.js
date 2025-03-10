import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
	try {
		const { searchParams } = new URL(request.url);
		const includePerformance =
			searchParams.get('includePerformance') === 'true';

		const models = await prisma.aIModel.findMany({
			include: {
				performanceMetrics: includePerformance,
				brackets: true,
				trainingData: includePerformance,
			},
			orderBy: {
				createdAt: 'desc',
			},
		});

		return NextResponse.json({ models });
	} catch (error) {
		console.error('GET /api/ai-models error:', error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

export async function POST(request) {
	try {
		const body = await request.json();

		const model = await prisma.aIModel.create({
			data: {
				name: body.name,
				configuration: body.configuration || {},
				trainingParameters: body.trainingParameters || {},
				performanceMetrics: body.performanceMetrics || {},
			},
		});

		return NextResponse.json({ model });
	} catch (error) {
		console.error('POST /api/ai-models error:', error);
		return NextResponse.json(
			{ error: 'Failed to create AI model' },
			{ status: 500 }
		);
	}
}
