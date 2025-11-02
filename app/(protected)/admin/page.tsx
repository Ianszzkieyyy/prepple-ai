import { createClient } from "@/lib/supabase/server"
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { Sidebar } from "lucide-react";


export default async function Home() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  // Fetch user profile to get name and is_hr status
  const { data: userProfile, error: profileError } = await supabase
    .from('users')
    .select('name, is_hr')
    .eq('id', user?.id)
    .single();
  if (profileError) {
    console.error('Error fetching user profile:', profileError);
  }

  // Fetch rooms data for HR user
  const { data: roomsData, error: roomsError } = await supabase
    .from('rooms')
    .select('id, room_title, room_code, room_status, start_date')
    .eq('hr_id', user?.id);
  if (roomsError) {
    console.error('Error fetching rooms data:', roomsError);
  }

  const { data: candidateRows, error: candidatesError } = await supabase
    .from('candidates')
    .select('created_at, applied_room, rooms:applied_room(id, hr_id)')
    .eq('rooms.hr_id', user?.id);
  if (candidatesError) {
    console.error('Error fetching candidates:', candidatesError);
  }

  const activityData = (candidateRows ?? []).reduce<Record<string, number>>((acc, row) => {
    const key = new Date(row.created_at).toISOString().slice(0, 10);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
  const chartData = Object.entries(activityData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));

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
    <SidebarInset>
      <div className="w-full">
        <h1 className="text-xl">Rooms</h1>
        <Button asChild>
          <Link href="/admin/create">Create Room</Link>
        </Button>
        <SidebarTrigger/>
      </div>
    </SidebarInset>
  )
}