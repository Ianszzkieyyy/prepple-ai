import { createClient } from "@/lib/supabase/server";

type Kind = "count" | "dashboard" | "all" | "recent" | "active";

export default async function getRoomsData(id: string, kind?: Kind) {
    const supabase = await createClient();

    if (kind === "dashboard") {
      const { data: roomsDashboardData, error: roomsError } = await supabase
          .from('rooms')
          .select('id, room_title, room_code, room_status, start_date')
          .eq('hr_id', id)
          .order('start_date', { ascending: false });
      if (roomsError) {
        console.error('Error fetching rooms data:', roomsError);
      }

      return roomsDashboardData;
    }

    if (kind === "count") {
      const { count, error: roomsError } = await supabase
          .from('rooms')
          .select('*', { count: 'exact', head: true })
          .eq('hr_id', id);
      if (roomsError) {
        console.error('Error fetching rooms count:', roomsError);
      }

      return count;
    }

    if (kind === "recent") {
      const { data: recentRooms, error: roomsError } = await supabase
          .from('rooms')
          .select('id, room_title, room_code, room_status, start_date')
          .eq('hr_id', id)
          .order('start_date', { ascending: false })
          .limit(3);
      if (roomsError) {
        console.error('Error fetching recent rooms:', roomsError);
      }

      return recentRooms;
    }

    if (kind === "active") {
      const { data: activeRooms, error: roomsError } = await supabase
          .from('rooms')
          .select('id, room_title, room_code, room_status, start_date')
          .eq('hr_id', id)
          .eq('room_status', 'active')
          .order('start_date', { ascending: false });
      if (roomsError) {
        console.error('Error fetching active rooms:', roomsError);
      }
      
      return activeRooms;
    }
    // Default to fetching all rooms
    const { data: allRooms, error: roomsError } = await supabase
        .from('rooms')
        .select('*')
        .eq('hr_id', id);
    if (roomsError) {
        console.error('Error fetching all rooms:', roomsError);
    }

    return allRooms;
}