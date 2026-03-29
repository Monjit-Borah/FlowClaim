import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth";

export default async function AppIndexPage() {
  const user = await requireUser();
  redirect(user.role.key === "ADMIN" ? "/app/admin" : user.role.key === "MANAGER" ? "/app/manager" : "/app/employee");
}
