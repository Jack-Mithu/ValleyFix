import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl } from "@/app/lib/auth";

// Public technician profile photos, proxied from the backend (whose address is
// server-only). The backend only serves photos of approved technicians.
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) return new NextResponse(null, { status: 404 });

  const upstream = await fetch(`${getBackendUrl()}/catalog/technicians/${id}/photo`);
  if (!upstream.ok || !upstream.body) return new NextResponse(null, { status: 404 });

  return new NextResponse(upstream.body, {
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "image/jpeg",
      "Cache-Control": "public, max-age=3600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
