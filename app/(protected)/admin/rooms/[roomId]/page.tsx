import { createClient } from "@/lib/supabase/server";
import { BreadcrumbHeader } from "@/components/breadcrumb-header";
import { RoomType } from "@/lib/types";
import CandidatesCard from "@/components/candidates-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

export default async function RoomDetails({ params }: { params: { roomId: string } }) {
    const supabase = await createClient();
    const { roomId } = await params;
    console.log("Fetching details for room ID:", roomId);
    const { data: { user } } = await supabase.auth.getUser();

    const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', roomId)
        .eq('hr_id', user?.id)
        .single();

    if (roomError) {
        console.error('Error fetching room details:', roomError);
        return null;
    }

    const { data: candidatesData, error: candidatesError } = await supabase
        .from('candidates')
        .select('*, users(name, email)')
        .eq('applied_room', roomId);

    if (candidatesError) {
        console.error('Error fetching candidates for room:', candidatesError);
    }

    const { data: avgScore, error: rpcError } = await supabase
        .rpc('get_average_score_by_room', { room_uuid: roomId })
    if (rpcError) {
        console.error('Error fetching accepted candidate average score:', rpcError);
    }
    

    const room: RoomType | null = roomData;

    return (
        <div className="w-full">
            <BreadcrumbHeader items={[{ label: "Home", href: "/admin" }, { label: "Rooms", href: "/admin/rooms" }, { label: "Room Details", href: "#" }]} />
            <div className="flex flex-col gap-16 px-32 py-8">
                <div className="flex gap-8">
                    <div className="flex-4 flex flex-col gap-4">
                        <h1 className="text-2xl font-semibold">{room?.room_title}</h1>
                        <div className="flex">
                            <Button asChild><Link href={`/admin/rooms/${room?.id}/edit`}>Edit Room</Link></Button>
                            <Button variant="outline" asChild className="ml-2"><Link href={`/admin/rooms/${room?.id}/details`}>View Details</Link></Button>
                        </div>
                    </div>
                    <div className="flex flex-col gap-4 flex-5">
                        <div className="flex justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground">Room Code</p>
                                <p className="text-sm">{(room?.room_code)?.toUpperCase()}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Type</p>
                                <p className="text-sm">{room?.interview_type && room.interview_type.charAt(0).toUpperCase() + room.interview_type.slice(1).toLowerCase()}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Start Date</p>
                                <p className="text-sm">{(room?.start_date)?.toUpperCase()}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">End Date</p>
                                <p className="text-sm">{(room?.end_date)?.toUpperCase()}</p>
                            </div>
                        </div>
                        <div className="flex gap-4 justify-stretch">
                            <Card className="w-full px-8 py-4">
                                <CardTitle className="p-0 mb-1">No. of Candidates</CardTitle>
                                <CardContent className="p-0">
                                    <span className="font-bold text-2xl">{candidatesData ? candidatesData.length : 0}</span>
                                </CardContent>
                            </Card>
                            <Card className="w-full px-8 py-4">
                                <CardTitle className="p-0 mb-1">Average Score</CardTitle>
                                <CardContent className="p-0">
                                    <span className="font-bold text-2xl">{avgScore ? avgScore.toFixed(2) : 0}</span>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
                <div className="w-full">
                    <Card className="w-full h-full">
                        <CardContent className="p-4">
                            <h2 className="text-lg font-semibold">AI Report</h2>
                            <p className="text-sm text-muted-foreground">AI interview reports for candidates who have completed interviews in this room. Generation will be available after the duration of the room ends.</p>
                            <Button variant="outline" disabled={true} className="mt-4" asChild><Link href={`/admin/rooms/${room?.id}/ai-reports`}>Generate AI Report</Link></Button>
                        </CardContent>
                    </Card>
                </div>
                <div className="w-full">
                    <h1 className="text-2xl font-semibold">Candidates</h1>
                    <div className="flex flex-col gap-4 mt-4">
                        {candidatesData && candidatesData.length > 0 ? (
                            candidatesData.map((candidate) => (
                                <CandidatesCard key={candidate.id} candidate={{
                                    id: candidate.id,
                                    name: candidate.users.name,
                                    email: candidate.users.email,
                                    interview_score: candidate.interview_score,
                                    candidate_status: candidate.candidate_status,
                                }} />
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground">No candidates have applied to this room yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}