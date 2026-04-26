import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { Sidebar } from "@/components/dashboard/Sidebar";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const role = (session.user as { role: string }).role ?? "USER";

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden">
      <Sidebar userEmail={session.user.email} role={role} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
