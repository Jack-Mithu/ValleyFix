import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE } from '@/app/lib/session';

// POST (not GET) so another site can't log users out with a simple link/image.
export async function POST(request: NextRequest) {
  // 303 tells the browser to follow the redirect with a GET request.
  const response = NextResponse.redirect(new URL('/login', request.url), 303);
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
