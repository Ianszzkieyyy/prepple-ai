import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server';
import generateReport from '@/lib/generateReport'

const AGENT_API_KEY = process.env.AGENT_API_KEY

export async function POST(req: Request) {
    const supabase = await createClient();

    try {
        const apiKey = req.headers.get("x-api-key");
        if (apiKey !== AGENT_API_KEY) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const body = await req.json()
        const { roomId, candidateId, sessionHistory, usageMetrics } = body

        if (!roomId || !candidateId || !sessionHistory || !usageMetrics) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const report = await generateReport(roomId, candidateId, sessionHistory, usageMetrics);

        const { data: savedReport, error: saveError } = await supabase
              .from('ai_reports')
              .insert({
                candidate_id: candidateId,
                tone_analysis: report.tone_analysis,
                performance_summary: report.performance_summary,
                recommendation: report.recommendation,
              })
              .select('id')
              .single();
        if (saveError) {
            throw new Error('Error saving report');
        }

        await supabase
            .from('candidates')
            .update({
              interview_score: report.interview_score,
              report_url: `/reports/${savedReport.id}`,
            })
            .eq('id', candidateId);

        return NextResponse.json({
            message: 'Report generated and saved successfully',
            reportId: savedReport.id,
        });


    } catch (error) {
        console.error("Error process interview result:", error)
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }
        return NextResponse.json({ error: "An unknown error occurred" }, { status: 500 })
    }

}