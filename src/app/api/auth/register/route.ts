import { NextRequest, NextResponse } from 'next/server';
import { dbRun } from '@/lib/database';
import { hashPassword, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, experience } = await request.json();

    // Validate input
    if (!name || !email || !password || !experience) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Insert user into database
    const result = await dbRun(
      `INSERT INTO users (full_name, email, password_hash, experience_level, role, created_at)
       VALUES (?, ?, ?, ?, 'user', datetime('now'))`,
      [name, email, hashedPassword, experience]
    );

    // Generate token
    const token = generateToken({
      userId: result.lastID!,
      email: email,
      role: 'user'
    });

    // Set cookie and return response
    const response = NextResponse.json(
      { message: 'Registration successful', userId: result.lastID },
      { status: 201 }
    );

    response.cookies.set('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Registration error:', error);
    
    if (error.message.includes('UNIQUE constraint failed')) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}