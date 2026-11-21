import { redirect } from "next/navigation";

// The old technician home: booking requests is the new starting page.
export default function TechnicianDashboard() {
  redirect("/technician/requests");
}
