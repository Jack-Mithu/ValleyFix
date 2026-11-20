import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/app/lib/auth';
import { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from '@/app/lib/session';

// "Backend for frontend": the browser posts here, we forward to NestJS,
// then keep the JWT in an httpOnly cookie the browser can't read with JS.
export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json().catch(() => null);

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

    const email = body.email.trim().toLowerCase();
    const password = body.password;

    const backendResponse = await fetch(`${getBackendUrl()}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      cache: 'no-store',
    });

    const data = await backendResponse.json().catch(() => ({}));

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

    // Only the user goes back to the browser, never the token.
    const response = NextResponse.json({
      message: 'Login successful',
      user: data.user,
    });

    response.cookies.set(SESSION_COOKIE, data.accessToken, {
      httpOnly: true, // JavaScript (and XSS) can't read it
      secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
      sameSite: 'lax', // not sent on cross-site POSTs (CSRF protection)
      path: '/',
      maxAge: SESSION_MAX_AGE_SECONDS,
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
