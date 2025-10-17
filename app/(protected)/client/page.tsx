import { createClient } from "@/lib/supabase/server"
import { JoinRoomCode } from "@/components/join-room-code";
import Link from "next/link";

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
    <div>
      <h1>Protected Client Page</h1>
      <p>You are currently logged in as {userProfile?.name}</p>
      <JoinRoomCode />
    </div>
  )
}