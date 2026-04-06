import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import mongoose from 'mongoose';
import { RBAC_POLICY, requireRoles } from '@/lib/rbac';

/**
 * GET /api/students/[id]
 * Get a specific student
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireRoles(request, RBAC_POLICY.students.read);
    if ('response' in auth) {
      return auth.response;
    }

    await dbConnect();

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid student ID' },
        { status: 400 }
      );
    }

    const student = await User.findById(params.id)
      .select('-password');

    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: student },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('GET /api/students/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch student' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/students/[id]
 * Update a student
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireRoles(request, RBAC_POLICY.students.update);
    if ('response' in auth) {
      return auth.response;
    }

    await dbConnect();

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid student ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, institution, grade, studentId } = body;

    // Don't allow updating password through this endpoint
    const updateData: any = {};
    if (name) updateData.name = name;
    if (institution) updateData.institution = institution;
    if (grade) updateData.grade = grade;
    if (studentId) updateData.studentId = studentId;

    const student = await User.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: student },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('PUT /api/students/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update student' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/students/[id]
 * Delete a student
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireRoles(request, RBAC_POLICY.students.delete);
    if ('response' in auth) {
      return auth.response;
    }

    await dbConnect();

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid student ID' },
        { status: 400 }
      );
    }

    const student = await User.findByIdAndDelete(params.id);

    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Student deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('DELETE /api/students/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete student' },
      { status: 500 }
    );
  }
}
