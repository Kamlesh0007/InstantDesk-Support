import Sidebar from "@/components/dashboard/sidebar";
import { isAuthorized } from "@/lib/isAuthorized";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "InstantDesk Support - Dashboard",
  description:
    "Instantly resolve customer questions with an assistant that reads your docs and speaks with empathy.",
};

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 1. Check authentication first
  const user = await isAuthorized();

  // 2. Unauthenticated users go through Home/Landing page
  if (!user) {
    redirect("/");
  }

  // 3. Check metadata only after authentication
  const cookieStore = await cookies();
  const metadataCookie = cookieStore.get("metadata");

  return (
    <div className="flex min-h-screen bg-[#050509] font-sans antialiased text-zinc-100 selection:bg-zinc-800">
      {metadataCookie?.value ? (
        <>
          <Sidebar />

          {/* pt-14: clears the fixed 56px mobile top bar. md:ml-64: clears the fixed desktop sidebar. */}
          <div className="relative flex min-h-screen min-w-0 flex-1 flex-col pt-14 md:pt-0 md:ml-64">
            <main className="flex-1 min-w-0">
              {children}
            </main>
          </div>
        </>
      ) : (
        <main className="min-h-screen w-full min-w-0">
          {children}
        </main>
      )}
    </div>
  );
}