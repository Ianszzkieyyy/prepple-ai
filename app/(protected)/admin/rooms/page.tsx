import RoomCard from "@/components/room-card";
import { BreadcrumbHeader } from "@/components/breadcrumb-header";
import getRoomsData from "@/lib/dashboard/getRoomsData";
import { RoomType } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default async function RoomsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const roomDashboardData = await getRoomsData(user?.id || "", "dashboard");
    const breadcrumbItems = [
        { label: "Home", href: "/admin" },
        { label: "Rooms", href: "/admin/rooms" },
    ]

    return (
        <div className="w-full">
            <BreadcrumbHeader items={breadcrumbItems} />
            <div className="flex flex-col gap-4 px-32 py-8">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-semibold">Rooms</h1>
                    <p className="text-muted-foreground">Manage your rooms, view activity and analytics.</p>
                    <div className="flex justify-between items-center gap-4">
                        <div className="flex gap-4">
                        <Button asChild><Link href="/admin/rooms/create">Create Room</Link></Button>
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
        </div>
    )
}