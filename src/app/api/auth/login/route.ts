import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { createAuthToken, setAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { email, password, loginRole } = await request.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (!loginRole || (loginRole !== 'student' && loginRole !== 'instructor' && loginRole !== 'admin')) {
      return NextResponse.json(
        { success: false, error: 'Invalid login role selection' },
        { status: 400 }
      );
    }

    // Find user and include password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    if (loginRole === 'student' && user.role !== 'student') {
      const errorMessage =
        user.role === 'admin'
          ? 'Please use the admin login page for this account'
          : 'Please choose Instructor login for this account';

      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 403 }
      );
    }

    if (loginRole === 'instructor' && user.role !== 'teacher') {
      return NextResponse.json(
        { success: false, error: 'Instructor login is only for teacher accounts' },
        { status: 403 }
      );
    }

    if (loginRole === 'admin' && user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin login is only for admin accounts' },
        { status: 403 }
      );
    }

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
        message: 'Login successful',
        data: userResponse,
      },
      { status: 200 }
    );

    setAuthCookie(response, token);

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    );
  }
}
