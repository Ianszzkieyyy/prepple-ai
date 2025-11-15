import CandidatesCard from "@/components/candidates-card";
import { BreadcrumbHeader } from "@/components/breadcrumb-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarInset } from "@/components/ui/sidebar";
import getCandidatesData from "@/lib/dashboard/getCandidateData";
import { CandidateType } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

type CandidateRow = CandidateType & {
	users?: {
		name: string | null;
		email: string | null;
	} | null;
};

export default async function CandidatesListPage() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	const rawCandidates = (await getCandidatesData(user?.id || "")) as
		| CandidateRow[]
		| null;

	const candidates = (rawCandidates ?? []).map((candidate) => ({
		id: candidate.id,
		name: candidate.name ?? candidate.users?.name ?? "Unnamed Candidate",
		email: candidate.email ?? candidate.users?.email ?? "No email on file",
		interview_score: candidate.interview_score,
		candidate_status: candidate.candidate_status,
	}));

	const totalCandidates = candidates.length;
	const acceptedCount = candidates.filter(
		(candidate) => candidate.candidate_status === "accepted"
	).length;
	const pendingCount = candidates.filter(
		(candidate) => candidate.candidate_status === "pending"
	).length;
	const rejectedCount = candidates.filter(
		(candidate) => candidate.candidate_status === "rejected"
	).length;

	const scoredCandidates = candidates.filter(
		(candidate) => typeof candidate.interview_score === "number"
	);
	const averageScore = scoredCandidates.length
		? (
				scoredCandidates.reduce(
					(sum, candidate) => sum + (candidate.interview_score ?? 0),
					0
				) / scoredCandidates.length
			).toFixed(1)
		: null;

	const breadcrumbItems = [
		{ label: "Home", href: "/admin" },
		{ label: "Candidates", href: "/admin/list" },
	];

	return (
		<SidebarInset>
			<BreadcrumbHeader items={breadcrumbItems} />
			<div className="w-full flex flex-col gap-8 px-32 py-8">
				<div className="flex flex-col gap-2">
					<h1 className="text-2xl font-semibold">Candidates</h1>
					<p className="text-muted-foreground">
						Track every applicant routed through your rooms and review their
						performance at a glance.
					</p>
				</div>

						<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
							<SummaryCard title="Total" value={totalCandidates} helper="No. of interviewees across all rooms"/>
							<SummaryCard title="Accepted" value={acceptedCount} helper="Number of accepted candidates"/>
							<SummaryCard title="Pending" value={pendingCount} helper="Number of pending candidates"/>
							<SummaryCard title="Rejected" value={rejectedCount} helper="Number of rejected candidates"/>
							<SummaryCard
								title="Average Score"
								value={averageScore ?? "N/A"}
								helper="Across scored candidates"
							/>
				</div>

				<div className="flex flex-col gap-4">
							<h2 className="text-xl font-semibold">All Candidates</h2>

					{candidates.length > 0 ? (
						<div className="flex flex-col gap-4">
							{candidates.map((candidate) => (
								<CandidatesCard key={candidate.id} candidate={candidate} />
							))}
						</div>
					) : (
						<Card>
							<CardContent className="py-10 text-center text-muted-foreground">
								No candidates yet. Share a room link to start collecting
								applications.
							</CardContent>
						</Card>
					)}
				</div>
			</div>
		</SidebarInset>
	);
}

interface SummaryCardProps {
	title: string;
	value: number | string;
	helper?: string;
}

function SummaryCard({ title, value, helper }: SummaryCardProps) {
	return (
		<Card>
			<CardHeader className="pb-2">
                <div className="flex justify-between">
                    <CardTitle className="text-base font-medium text-muted-foreground">
                        {title}
                    </CardTitle>
                    {helper && (
                        <Tooltip>
                            <TooltipTrigger>
                                <span className="text-muted-foreground cursor-pointer"><Info size={16} /></span>
                            </TooltipTrigger>
                            <TooltipContent side="top" align="center">
                                <p className="text-sm">{helper}</p>
                            </TooltipContent>
                        </Tooltip>
                    )}
                </div>
			</CardHeader>
			<CardContent>
				<p className="text-2xl font-semibold">{value}</p>
			</CardContent>
		</Card>
	);
}