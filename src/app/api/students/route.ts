import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

/**
 * GET /api/students
 * Get all students
 */
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const students = await User.find({ role: 'student' })
      .select('-password')
      .sort({ createdAt: -1 });

    return NextResponse.json(
      { success: true, data: students },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('GET /api/students error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/students
 * Create a new student
 */
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { name, email, password, studentId, institution, grade } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    const user = await User.create({
      name,
      email,
      password,
      role: 'student',
      studentId,
      institution,
      grade,
    });

    const userResponse = user.toObject();
    delete userResponse.password;

    return NextResponse.json(
      { success: true, data: userResponse },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('POST /api/students error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create student' },
      { status: 500 }
    );
  }
}
