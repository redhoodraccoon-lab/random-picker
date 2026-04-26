import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { ResponsiveShell } from "@/components/dashboard/ResponsiveShell";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const role = (session.user as { role: string }).role ?? "USER";

  return (
    <ResponsiveShell userEmail={session.user.email ?? ""} role={role}>
      {children}
    </ResponsiveShell>
  );
}
