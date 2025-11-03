import { CreateRoomForm } from "@/components/create-room-form"
import { BreadcrumbHeader } from "@/components/breadcrumb-header";

export default async function CreateRoom() {
    return (
        <div className="w-full">
            <BreadcrumbHeader items={[{ label: "Home", href: "/admin" }, { label: "Create Room", href: "/admin/rooms/create" }]} />
            <CreateRoomForm className="flex justify-center my-16"/>
        </div>
    )
}