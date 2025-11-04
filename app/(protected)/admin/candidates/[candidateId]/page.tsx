import { createClient } from "@/lib/supabase/server";
import { BreadcrumbHeader } from "@/components/breadcrumb-header";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

export default async function CandidatePage({ params }: { params: { candidateId: string } }) {
    const { candidateId } = await params;
    const supabase = await createClient();

    const { data: candidateData, error: candidateError } = await supabase
        .from("candidates")
        .select(`
            id,
            users (
                name,
                email
            ),
            interview_score,
            candidate_status,
            applied_room
        `)
        .eq("id", candidateId)
        .single();

    if (candidateError) {
        console.error('Error fetching candidate details:', candidateError);
        return null;
    }

    return (
        <div className="w-full">
            <BreadcrumbHeader items={[{ label: "Home", href: "/admin" }, { label: "Candidates", href: "/admin/candidates" }, { label: "Candidate Details", href: `/admin/candidates/${candidateId}` }]} />
            <div className="w-2xl mx-auto my-16">
                <Card>
                    <CardContent>
                        <CardTitle className="text-2xl mb-4">Candidate Details</CardTitle>
                        <div className="flex flex-col gap-4">
                            <p><strong>Name:</strong> {candidateData?.users.name}</p>
                            <p><strong>Email:</strong> {candidateData?.users.email}</p>
                            <p><strong>Interview Score:</strong> {candidateData?.interview_score ?? 'N/A'}</p>
                            <p><strong>Status:</strong> {candidateData?.candidate_status}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}