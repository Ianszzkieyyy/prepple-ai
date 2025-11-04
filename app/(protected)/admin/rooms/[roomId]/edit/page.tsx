import { EditRoomForm } from "@/components/edit-room-form";
import { BreadcrumbHeader } from "@/components/breadcrumb-header";
import { createClient } from "@/lib/supabase/server";

export default async function EditRoom({ params }: { params: { roomId: string } }) {
    const { roomId } = await params
    const supabase = await createClient()

    const { data: roomData, error: roomError } = await supabase
        .from("rooms")
        .select("*")
        .eq("id", roomId)
        .single()
    if (roomError) {
        console.error('Error fetching room details:', roomError);
        return null;
    }
    

    return (
        <div className="w-full">
            <BreadcrumbHeader items={[{ label: "Home", href: "/admin" }, { label: "Rooms", href: "/admin/rooms" }, { label: "Room Details", href: `/admin/rooms/${params.roomId}` }, { label: "Edit Room", href: `/admin/rooms/${params.roomId}/edit` }]} />
            <EditRoomForm className="w-2xl mx-auto my-16" roomData={roomData} />
        </div>
    )
}