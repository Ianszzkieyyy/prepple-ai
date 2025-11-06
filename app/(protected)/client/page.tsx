import { createClient } from "@/lib/supabase/server"
import { JoinRoomCode } from "@/components/join-room-code";
import Link from "next/link";
import ClientNavbar from "@/components/client-navbar";

export default async function Home() {
    const supabase = createClient();
    const { data: { user } } = await (await supabase).auth.getUser();

    // Fetch user profile
    const { data: userProfile, error: profileError } = await (await supabase)
        .from('users')
        .select('name, is_hr')
        .eq('id', user?.id)
        .single();
    if (profileError) {
        console.error('Error fetching user profile:', profileError);
    }

    // Check if user is HR and redirect if necessary
    if (userProfile?.is_hr) {
        return (
            <div>
                <h1>You are currently logged in as an Admin / HR</h1>
                <Link href="/admin">Go to HR Dashboard</Link>
            </div>
        );
    }


  return (
    <div className="w-full flex flex-col h-screen">
      <ClientNavbar name={userProfile?.name || ''} />
      <div className="flex flex-col flex-1 gap-8 justify-center items-center px-32 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-semibold mb-4">Prepple AI</h1>
          <p className="w-lg">The AI Interview platform that strengthens the bridge between you and your future employers.</p>
        </div>
        <JoinRoomCode />
      </div>
    </div>
  )
}