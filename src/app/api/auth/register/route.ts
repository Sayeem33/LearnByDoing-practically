import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { createAuthToken, setAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { name, email, password, studentId, institution, grade } = await request.json();

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      role: 'student',
      studentId,
      institution,
      grade,
    });

    // Return user without password
    const { password: _password, ...userResponse } = user.toObject();

    const token = createAuthToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json(
      {
        success: true, 
        message: 'Registration successful',
        data: userResponse 
      },
      { status: 201 }
    );

    setAuthCookie(response, token);

    return response;
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: 'Registration failed' },
      { status: 500 }
    );
  }
}
