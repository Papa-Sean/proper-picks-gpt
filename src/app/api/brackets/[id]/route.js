import { NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';

export async function GET(request, { params }) {
	try {
		const bracketId = params.id;

		if (!bracketId) {
			return NextResponse.json(
				{ error: 'Bracket ID is required' },
				{ status: 400 }
			);
		}

		const bracketRef = doc(db, 'brackets', bracketId);
		const bracketDoc = await getDoc(bracketRef);

		if (!bracketDoc.exists()) {
			return NextResponse.json(
				{ error: 'Bracket not found' },
				{ status: 404 }
			);
		}

		// Return the bracket data
		return NextResponse.json({
			id: bracketDoc.id,
			...bracketDoc.data(),
		});
	} catch (error) {
		console.error('Error fetching bracket:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch bracket data' },
			{ status: 500 }
		);
	}
}
