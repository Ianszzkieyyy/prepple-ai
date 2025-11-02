import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    return (
      <div className="relative min-h-screen">
      <SidebarProvider>
        <AppSidebar />
        {children}
      </SidebarProvider>
      </div>

    )
}
