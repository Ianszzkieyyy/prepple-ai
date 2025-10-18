import { createClient } from "@/lib/supabase/server";
import { JoinRoomForm } from "@/components/join-room-form";

export default async function Page({ params }: { params: Promise<{ roomId: string }> }) {
  const supabase = createClient()
  const { roomId } = await params
  const { data: room, error: roomError } = await (await supabase)
    .from("rooms")
    .select("*")
    .eq("id", roomId)
    .single();

  if (roomError || !room) {
    console.error("Error fetching room:", roomError);
    return <div>Error fetching room</div>;
  }

  return (
    <div>
      <h1>Interview Room</h1>
      <p>Room ID: {room.id}</p>
      <p>Room Title: {room.room_title}</p>
      <JoinRoomForm roomId={room.id} />
    </div>
  );
}