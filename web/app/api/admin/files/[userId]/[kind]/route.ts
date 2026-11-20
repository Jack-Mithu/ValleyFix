import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getBackendUrl } from "@/app/lib/auth";
import { SESSION_COOKIE } from "@/app/lib/session";

// Streams a technician's profile photo / ID document from the backend.
// The browser can't send the JWT itself (it's in an httpOnly cookie), so this
// route attaches it. The backend decides who may see what.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string; kind: string }> },
) {
  const { userId, kind } = await params;
  if (!/^\d+$/.test(userId) || (kind !== "identity" && kind !== "profile")) {
    return NextResponse.json({ message: "Not found." }, { status: 404 });
  }

  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ message: "Not signed in." }, { status: 401 });
  }

  const upstream = await fetch(`${getBackendUrl()}/admin/technicians/${userId}/files/${kind}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ message: "File not available." }, { status: upstream.status || 502 });
  }

  return new NextResponse(upstream.body, {
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "application/octet-stream",
      "Content-Disposition": "inline",
      // Sensitive personal documents: never cache them anywhere.
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
