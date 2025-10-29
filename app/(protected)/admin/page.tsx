import { createClient } from "@/lib/supabase/server"
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { DailyJoinsChart } from "@/components/daily-activity-chart";

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
    <div>
      <h1 className="text-xl">Rooms</h1>
      <Button asChild>
        <Link href="/admin/create">Create Room</Link>
      </Button>
      <div className="grid grid-cols-6 grid-rows-5 gap-4">
        <div className="col-span-4 row-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Daily Candidate Joins</CardTitle>
            </CardHeader>
            <CardContent>
              <DailyJoinsChart data={chartData} />
            </CardContent>
          </Card>
        </div>
        <div className="col-span-2 row-span-3 col-start-5">
          <Card>
            <CardHeader>
              <CardTitle>No. of Rooms</CardTitle>
            </CardHeader>
          </Card>
        </div>
        <div className="col-span-2 row-span-2 row-start-4">3</div>
        <div className="col-span-2 row-span-2 col-start-3 row-start-4">4</div>
        <div className="col-span-2 row-span-2 col-start-5 row-start-4">5</div>
      </div>
    </div>
  )
}