interface RoomType {
    id: string;
    room_title: string;
    room_code: string;
    room_status: string;
    start_date: string;
    candidates: [{ count: number }]; 
}

export type { RoomType };