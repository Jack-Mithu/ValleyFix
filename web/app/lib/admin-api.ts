// Server-only helper for calling the NestJS API with the logged-in user's
// token (read from the httpOnly cookie, never exposed to the browser).
// Used by the admin, customer and technician pages.
import { cookies } from "next/headers";
import { getBackendUrl } from "./auth";
import { SESSION_COOKIE } from "./session";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export async function adminFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) throw new ApiError("You are not signed in.", 401);

  const response = await fetch(`${getBackendUrl()}${path}`, {
    ...init,
    headers: {
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = Array.isArray(data.message)
      ? data.message.join(". ")
      : typeof data.message === "string"
        ? data.message
        : `Request failed (status ${response.status}).`;
    throw new ApiError(message, response.status);
  }

  return data as T;
}

/** Same helper, neutral name for non-admin pages. */
export const apiFetch = adminFetch;

// ----- Response types (mirror backend/src/admin/admin.service.ts) -----

export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

export type AdminUserRow = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
  role: string;
  technicianProfile: { id: number; approvalStatus: ApprovalStatus } | null;
};

export type UserList = { total: number; page: number; pageSize: number; users: AdminUserRow[] };

export type UserDetail = Omit<AdminUserRow, "technicianProfile"> & {
  address: {
    id: number;
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
  }[];
  technician: {
    id: number;
    firstName: string;
    lastName: string;
    bio: string | null;
    approvalStatus: ApprovalStatus;
    reviewedAt: string | null;
    rejectionReason: string | null;
    appliedAt: string;
    niNumber: string;
    services: string[];
    areas: string[];
    availability: { dayOfWeek: number; startTime: string; endTime: string }[];
  } | null;
};

export type TechnicianRow = {
  userId: number;
  name: string;
  email: string;
  phone: string | null;
  isActive: boolean;
  approvalStatus: ApprovalStatus;
  appliedAt: string;
  services: string[];
  areas: string[];
};

export type Overview = {
  customers: number;
  technicians: number;
  pendingTechnicians: number;
  subAdmins: number | null;
};

export type AuditEntry = {
  id: number;
  action: string;
  entity: string;
  entityId: number | null;
  newValues: unknown;
  createdAt: string;
  user: { name: string; email: string } | null;
};
