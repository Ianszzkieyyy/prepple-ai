import Navbar from "@/components/navbar";
import { createClient } from "@/lib/supabase/server";
import AdminSidebar from "@/components/admin-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { cookies } from "next/headers"


export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const supabase = createClient();
    const { data: { user } } = await (await supabase).auth.getUser();

    const { data: userProfile, error: profileError } = await (await supabase)
    .from('users')
    .select('name')
    .eq('id', user?.id)
    .single();
    if (profileError) {
      console.error('Error fetching user profile:', profileError);
    }

    const cookieStore = await cookies()
    const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"


    return (
      <SidebarProvider defaultOpen={defaultOpen}>
        <AdminSidebar />
        <main className="flex-1 w-full flex flex-col">
          <Navbar name={userProfile?.name} />
          <div className="flex-1 px-32 py-8">
            {children}
          </div>
        </main>
      </SidebarProvider>
    )
}
