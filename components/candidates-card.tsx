import { Card, CardContent } from "@/components/ui/card";
import { Button } from "./ui/button";
import toCapitalized from "@/lib/toCapitalized";
import Link from "next/link";

interface CandidatesCardProps {
    id: string;
    name: string;
    email: string;
    interview_score: number | null;
    candidate_status: string | null;
}


export default function CandidatesCard({ candidate }: { candidate: CandidatesCardProps }) {

    return (
        <Card>
            <CardContent className="flex py-4 px-8 justify-between items-center">
                <div className="flex flex-col">
                    <span className="font-medium">{candidate.name}</span>
                    <span className="text-sm text-muted-foreground">{candidate.email}</span>
                </div>
                <div className="flex gap-2 items-center">
                    <span className="font-medium">Interview Score:</span>
                    <span className="font-bold text-lg">{candidate.interview_score !== null ? candidate.interview_score : "N/A"}</span>
                </div>
                <div className="flex gap-2 items-center">
                    <span className="font-medium">Status:</span>
                    <span className={`font-semibold text-md ${candidate.candidate_status === "accepted" ? "text-green-500" : candidate.candidate_status === "pending" ? "text-gray-500" : "text-red-500"}`}>{candidate.candidate_status !== null ? toCapitalized(candidate.candidate_status) : "N/A"}</span>
                </div>
                <div>
                    <Button asChild><Link href={`/admin/candidates/${candidate.id}`}>View Report</Link></Button>
                </div>
            </CardContent>
        </Card>
    )
}