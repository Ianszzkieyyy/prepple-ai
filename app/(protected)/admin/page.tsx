import { createClient } from "@/lib/supabase/server"
import Link from "next/link";

import { SidebarInset } from "@/components/ui/sidebar";
import { BreadcrumbHeader } from "@/components/breadcrumb-header";
import getCandidatesData from "@/lib/dashboard/getCandidateData";
import getRoomsData from "@/lib/dashboard/getRoomsData";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DailyJoinsChart } from "@/components/daily-activity-chart";
import RoomCard from "@/components/room-card";
import { Button } from "@/components/ui/button";
import { RoomType } from "@/lib/types";

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

  // Fetch candidate activity data for chart
  const candidateRows = await getCandidatesData(user?.id || "", "dashboard");
  const candidateCount = await getCandidatesData(user?.id || "", "count");
  const candidateAccepted = await getCandidatesData(user?.id || "", "acceptedCount");
  const candidateAvgScore = await getCandidatesData(user?.id || "", "averageScore");

  const roomCount = await getRoomsData(user?.id || "", "count");
  const roomDashboardData = await getRoomsData(user?.id || "", "recent");

  const activityData = (Array.isArray(candidateRows) ? candidateRows : []).reduce<Record<string, number>>((acc, row) => {
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

  const breadcrumbItems = [
    { label: "Home", href: "/admin" },
  ]

  return (
    <SidebarInset>
      <BreadcrumbHeader items={breadcrumbItems} />
      <div className="w-full flex flex-col gap-8 px-32 py-8">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="grid grid-cols-4 gap-4">
            <div >
              <Card>
                <CardTitle className="p-6">Total Candidates</CardTitle>
                <CardContent>
                  <span className="font-bold text-2xl">{candidateCount || 0}</span>
                </CardContent>
              </Card>
            </div>
            <div >
              <Card>
                <CardTitle className="p-6">Total Rooms</CardTitle>
                <CardContent>
                  <span className="font-bold text-2xl">{roomCount || 0}</span>
                </CardContent>
              </Card>
            </div>
            <div >
              <Card>
                <CardTitle className="p-6">Candidates Accepted</CardTitle>
                <CardContent>
                  <span className="font-bold text-2xl">{candidateAccepted || 0}</span>
                </CardContent>
              </Card>
            </div>
            <div >
              <Card>
                <CardTitle className="p-6">Average Score</CardTitle>
                <CardContent>
                  <span className="font-bold text-2xl">{candidateAvgScore.toFixed(2) || 0}</span>
                </CardContent>
              </Card>
            </div>
            <div className="col-span-4">
              <Card>
                <CardHeader>
                  <CardTitle>Daily Candidate Joins</CardTitle>
                </CardHeader>
                <CardContent>
                  <DailyJoinsChart data={chartData} />
                </CardContent>
              </Card>
            </div>
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold">Rooms</h1>
          <div className="flex justify-between items-center gap-4">
            <div className="flex gap-4">
              <Button asChild><Link href="/admin/rooms/create">Create Room</Link></Button>
              <Button asChild variant={"outline"}><Link href="/admin/rooms">View All Rooms</Link></Button>
            </div>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Filter by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date_desc">Date Descending</SelectItem>
                <SelectItem value="date_asc">Date Ascending</SelectItem>
                <SelectItem value="most_candidates">Most Candidates</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          {roomDashboardData && roomDashboardData.length > 0 ? (
              roomDashboardData.map((room: RoomType) => (
                <RoomCard key={room.id} room={room} />
              ))
          ) : (
            <p>No rooms available. Create a new room to get started.</p>
          )}
        </div>
      </div>
    </SidebarInset>
  )
}