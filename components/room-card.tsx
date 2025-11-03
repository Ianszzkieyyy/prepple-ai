"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EllipsisVertical } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

type RoomStatus = "active" | "paused" | "archived";

const ROOM_STATUS_OPTIONS: RoomStatus[] = ["active", "paused", "archived"];

const STATUS_COLOR_MAP: Record<RoomStatus, string> = {
    active: "bg-green-500",
    paused: "bg-yellow-500",
    archived: "bg-slate-400",
};

const formatStatusLabel = (status: RoomStatus) =>
    status.charAt(0).toUpperCase() + status.slice(1);

interface RoomCardProps {
    id: string;
    room_title: string;
    room_code: string;
    room_status: RoomStatus;
    start_date: string;
    candidates: {
        count: number;
    }[];
}

export default function RoomCard({ room }: { room: RoomCardProps }) {

    const supabase = createClient();
    const router = useRouter();
    const [currentStatus, setCurrentStatus] = useState<RoomStatus>(room.room_status);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        setCurrentStatus(room.room_status);
    }, [room.room_status]);

    const handleChangeStatus = async (status: RoomStatus) => {
        if (status === currentStatus || isUpdatingStatus || isDeleting) {
            return;
        }

        setIsUpdatingStatus(true);

        try {
            const { error } = await supabase
                .from("rooms")
                .update({ room_status: status })
                .eq("id", room.id);

            if (error) {
                toast.error(error.message ?? "Failed to update room status.");
                return;
            }

            setCurrentStatus(status);
            toast.success(`Room status set to ${formatStatusLabel(status)}.`);
            router.refresh();
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const handleDeleteRoom = async () => {
        console.log("Deleting room:", room.id);
        if (isDeleting) {
            return;
        }

        setIsDeleting(true);

        try {
            const { error } = await supabase
                .from("rooms")
                .delete()
                .eq("id", room.id);

            if (error) {
                console.log("Error deleting room:", error);
                toast.error(error.message ?? "Failed to delete room.");
                return;
            }

            toast.success("Room deleted.");
            router.refresh();
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Card>
            <CardContent className="flex py-4 px-8 justify-between items-center">
                <div className="flex gap-8 items-center">
                    <div className={`w-4 h-4 rounded-full ${STATUS_COLOR_MAP[currentStatus] ?? "bg-muted"}`}></div>
                    <div className="flex flex-col">
                        <h2 className="font-semibold">{room.room_title}</h2>
                        <div className="flex gap-8 text-sm text-muted-foreground">
                            <p>Code: {room.room_code}</p>
                            <p>Start Date: {room.start_date}</p>
                            <p>Candidates: {room.candidates[0]?.count}</p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-1">
                    <Button variant="outline" asChild><Link href={`/admin/rooms/${room.id}`}>View Room</Link></Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" aria-label="Open room actions">
                                <EllipsisVertical />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Set status</DropdownMenuLabel>
                            <DropdownMenuRadioGroup
                                value={currentStatus}
                                onValueChange={(value) => handleChangeStatus(value as RoomStatus)}
                            >
                                {ROOM_STATUS_OPTIONS.map((status) => (
                                    <DropdownMenuRadioItem
                                        key={status}
                                        value={status}
                                        disabled={isUpdatingStatus || isDeleting}
                                        className="capitalize"
                                    >
                                        {formatStatusLabel(status)}
                                    </DropdownMenuRadioItem>
                                ))}
                            </DropdownMenuRadioGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                variant="destructive"
                                onClick={() => handleDeleteRoom()}
                                disabled={isDeleting}
                            >
                                Delete room
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardContent>
        </Card>
    )
}