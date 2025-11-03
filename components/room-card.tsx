import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface RoomCardProps {
    id: string;
    room_title: string;
    room_code: string;
    room_status: string;
    start_date: string;
    candidates: {
        count: number;
    }[];
}

export default function RoomCard({ room }: { room: RoomCardProps }) {
    return (
        <Card>
            <CardContent className="flex py-4 px-8 justify-between items-center">
                <div className="flex gap-8 items-center">
                    <div className={`w-4 h-4 rounded-full ${room.room_status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <div className="flex flex-col">
                        <h2 className="font-semibold">{room.room_title}</h2>
                        <div className="flex gap-8 text-sm text-muted-foreground">
                            <p>Code: {room.room_code}</p>
                            <p>Start Date: {room.start_date}</p>
                            <p>Candidates: {room.candidates[0]?.count}</p>
                        </div>
                    </div>
                </div>
                <Button variant="outline">View Details</Button>
            </CardContent>
        </Card>
    )
}