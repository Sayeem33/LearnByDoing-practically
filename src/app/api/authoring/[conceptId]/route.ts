import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import ConceptDefinition from '@/models/ConceptDefinition';

export async function GET(
  request: NextRequest,
  { params }: { params: { conceptId: string } }
) {
  try {
    await dbConnect();

    const definition = await ConceptDefinition.findOne({
      conceptId: params.conceptId,
      isPublished: true,
    });

    if (!definition) {
      return NextResponse.json(
        { success: false, error: 'Concept definition not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: definition }, { status: 200 });
  } catch (error: any) {
    console.error('GET /api/authoring/[conceptId] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch concept definition' },
      { status: 500 }
    );
  }
}
