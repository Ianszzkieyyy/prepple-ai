import { createClient } from "@/lib/supabase/server"
import { CreateRoomForm } from "@/components/create-room-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const supabase = createClient();

  const { data: { user } } = await (await supabase).auth.getUser();

  const { data: userProfile, error: profileError } = await (await supabase)
    .from('users')
    .select('name, is_hr')
    .eq('id', user?.id)
    .single();
  if (profileError) {
    console.error('Error fetching user profile:', profileError);
  }

  // Check if user is not HR and redirect if necessary
  if (!userProfile?.is_hr) {
    return (
      <div>
        <h1>You are currently logged in as a Client</h1>
        <Link href="/client">Go to Client Page</Link>
      </div>
    );
  }

  return (
    <div>
      <h1>Protected Admin Page</h1>
      <p>You are currently logged in as {userProfile?.name}</p>
      <Button className="bg-primary p-4"><Link href="/admin/create">Create Room</Link></Button>
    </div>
  )
}