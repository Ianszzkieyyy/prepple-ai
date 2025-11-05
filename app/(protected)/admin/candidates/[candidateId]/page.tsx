import { createClient } from "@/lib/supabase/server";
import { BreadcrumbHeader } from "@/components/breadcrumb-header";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import ToggleCandidateStatus from "@/components/toggle-candidate-status";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

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

        const { data: roomTitle, error: roomTitleError } = await supabase
            .from("rooms")
            .select("id, room_title")
            .eq("id", candidateData?.applied_room)
            .single();
        if (roomTitleError) {
            console.error('Error fetching room title:', roomTitleError);
            return null;
        }

        const { data: candidateReport, error: candidateReportError } = await supabase
            .from("ai_reports")
            .select("*")
            .eq("candidate_id", candidateId)
            .single()
        if (candidateReportError) {
            console.error('Error fetching candidate report:', candidateReportError);
        }

        console.log("Candidate Report Data:", candidateReport);

    const toneMetrics = candidateReport?.tone_analysis
        ? Object.entries(candidateReport.tone_analysis as Record<string, number>)
        : [];
    const customParameters = candidateReport?.custom_parameters_result
        ? Object.entries(candidateReport.custom_parameters_result as Record<string, string | number>)
        : [];
    const keyHighlights = (candidateReport?.key_highlights ?? []) as string[];
    const areasForImprovement = (candidateReport?.areas_for_improvement ?? []) as string[];
    const reportGeneratedAt = candidateReport?.created_at
        ? new Date(candidateReport.created_at).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
          })
        : null;

    const formatLabel = (value: string) =>
        value
            .split("_")
            .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
            .join(" ");

        const recommendationVariant: "default" | "secondary" | "destructive" | "outline" =
                candidateReport?.recommendation === "recommend"
                        ? "default"
                        : candidateReport?.recommendation === "reject"
                            ? "destructive"
                            : candidateReport?.recommendation
                                ? "secondary"
                                : "outline";

    return (
        <div className="w-full">
            <BreadcrumbHeader items={[{ label: "Home", href: "/admin" }, { label: "Candidates", href: "/admin/candidates" }, { label: "Candidate Details", href: `/admin/candidates/${candidateId}` }]} />
            <div className="flex flex-col gap-4 px-32 py-8">
                <div className="flex gap-16 justify-between items-center">
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-col flex-3">
                            <h1 className="text-3xl font-bold">{candidateData?.users.name}</h1>
                            <p className="text-muted-foreground">{candidateData?.users.email}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground text-sm mb-2">Status</p>
                            <ToggleCandidateStatus candidateId={candidateId} />
                        </div>
                    </div>
                    <div className="flex flex-col flex-1">
                        <div className="flex flex-col gap-1 items-start">
                            <p className="text-muted-foreground text-sm">Applied Room:</p>
                            <h2 className="font-semibold text-xl">{roomTitle?.room_title}</h2>
                            <Button variant="link" className="p-0 mt-1" asChild>
                                <Link href={`/admin/rooms/${roomTitle?.id}`}>View Room</Link>
                            </Button>
                        </div>
                    </div>
                    <div>
                        <Card className="flex-2">
                            <CardContent className="p-8">
                                <h1 className="text-lg">Interview Score</h1>
                                <p className="text-2xl font-bold">{candidateData?.interview_score ?? "N/A"}</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
                {candidateReport ? (
                    <div className="grid gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Interview Report</CardTitle>
                                {reportGeneratedAt ? (
                                    <CardDescription>Generated on {reportGeneratedAt}</CardDescription>
                                ) : null}
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {candidateReport.recommendation ? (
                                    <div className="flex flex-wrap items-center gap-3">
                                        <p className="text-sm text-muted-foreground">Recommendation</p>
                                        <Badge variant={recommendationVariant}>
                                            {formatLabel(candidateReport.recommendation)}
                                        </Badge>
                                    </div>
                                ) : null}
                                {candidateReport.performance_summary ? (
                                    <div className="space-y-2">
                                        <p className="text-sm text-muted-foreground">Performance Summary</p>
                                        <p className="leading-relaxed text-sm sm:text-base">
                                            {candidateReport.performance_summary}
                                        </p>
                                    </div>
                                ) : null}
                            </CardContent>
                        </Card>

                        {toneMetrics.length > 0 ? (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Tone Analysis</CardTitle>
                                    <CardDescription>Scores are out of 100 unless noted otherwise.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                        {toneMetrics.map(([metric, value]) => (
                                            <div key={metric} className="rounded-lg border p-4">
                                                <p className="text-sm text-muted-foreground">
                                                    {formatLabel(metric)}
                                                </p>
                                                <p className="text-2xl font-semibold">{value}</p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ) : null}

                        {(keyHighlights.length > 0 || areasForImprovement.length > 0) ? (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Highlights &amp; Improvements</CardTitle>
                                </CardHeader>
                                <CardContent className="grid gap-6 lg:grid-cols-2">
                                    {keyHighlights.length > 0 ? (
                                        <div>
                                            <h3 className="font-semibold mb-2 text-sm uppercase tracking-wide text-muted-foreground">
                                                Key Highlights
                                            </h3>
                                            <ul className="list-disc space-y-2 pl-4 text-sm sm:text-base">
                                                {keyHighlights.map((item) => (
                                                    <li key={item}>{item}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    ) : null}
                                    {areasForImprovement.length > 0 ? (
                                        <div>
                                            <h3 className="font-semibold mb-2 text-sm uppercase tracking-wide text-muted-foreground">
                                                Areas for Improvement
                                            </h3>
                                            <ul className="list-disc space-y-2 pl-4 text-sm sm:text-base">
                                                {areasForImprovement.map((item) => (
                                                    <li key={item}>{item}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    ) : null}
                                </CardContent>
                            </Card>
                        ) : null}

                        {customParameters.length > 0 ? (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Custom Parameters</CardTitle>
                                    <CardDescription>Client-specific insights generated for this interview.</CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-4">
                                    {customParameters.map(([parameter, value]) => (
                                        <div key={parameter} className="rounded-lg border p-4">
                                            <p className="text-sm font-medium">
                                                {parameter}
                                            </p>
                                            <p className="mt-2 text-sm text-muted-foreground">
                                                {String(value)}
                                            </p>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        ) : null}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="p-8">
                            <p className="text-sm text-muted-foreground">No AI report is available for this candidate yet.</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}