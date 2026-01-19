import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Tutorial from '@/models/Tutorial';

/**
 * GET /api/tutorials
 * Get all tutorials or filter by category/difficulty
 */
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');

    const query: any = {};
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;

    const tutorials = await Tutorial.find(query).sort({ difficulty: 1 });

    return NextResponse.json(
      { success: true, data: tutorials },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('GET /api/tutorials error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tutorials' },
      { status: 500 }
    );
  }
}
