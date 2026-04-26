import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { Sidebar } from "@/components/dashboard/Sidebar";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden">
      <Sidebar userEmail={session.user.email} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
