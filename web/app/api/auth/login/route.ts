import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const backendUrl = process.env.BACKEND_API_URL;

    if (!backendUrl) {
      return NextResponse.json(
        { message: 'Backend URL is not configured.' },
        { status: 500 },
      );
    }

    const body: unknown = await request.json();

    if (
      typeof body !== 'object' ||
      body === null ||
      !('email' in body) ||
      !('password' in body) ||
      typeof body.email !== 'string' ||
      typeof body.password !== 'string' ||
      !body.email.trim() ||
      !body.password
    ) {
      return NextResponse.json(
        { message: 'Please enter a valid email and password.' },
        { status: 400 },
      );
    }

    const email = body.email.trim();
    const password = body.password;

    const backendResponse = await fetch(`${backendUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      cache: 'no-store',
    });

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      const message = Array.isArray(data.message)
        ? data.message.join(', ')
        : typeof data.message === 'string'
          ? data.message
          : 'Unable to sign in. Please check your credentials.';

      return NextResponse.json(
        { message },
        { status: backendResponse.status },
      );
    }

    if (!data.accessToken || !data.user) {
      return NextResponse.json(
        { message: 'Invalid authentication response from the server.' },
        { status: 502 },
      );
    }

    const response = NextResponse.json({
      message: 'Login successful',
      user: data.user,
    });

    response.cookies.set('valleyfix_access_token', data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    console.error('Login API error:', error);

    return NextResponse.json(
      { message: 'Unable to connect to ValleyFix. Please try again.' },
      { status: 500 },
    );
  }
}