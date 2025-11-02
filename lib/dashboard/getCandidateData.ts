import { createClient } from "@/lib/supabase/server";

type Kind = "count" | "dashboard" | "all" | "recent" | "acceptedCount" | "averageScore";

export default async function getCandidatesData(id: string, kind?: Kind) {
    const supabase = await createClient();

    if (kind === "dashboard") {
        const { data: candidateData, error: candidatesError } = await supabase
            .from('candidates')
            .select('created_at, applied_room, rooms:applied_room(id, hr_id), users(name, email)')
            .eq('rooms.hr_id', id)
            .order('created_at', { ascending: true });
        if (candidatesError) {
            console.error('Error fetching candidates:', candidatesError);
        }

        return candidateData;
    }

    if (kind === "count") {
        const { count, error: candidatesError } = await supabase
            .from('candidates')
            .select('*, rooms!inner(hr_id)', { count: 'exact', head: true })
            .eq('rooms.hr_id', id);
        if (candidatesError) {
            console.error('Error fetching candidate count:', candidatesError);
        }

        return count;
    }

    if (kind === "recent") {
        const { data: recentCandidates, error: candidatesError } = await supabase
            .from('candidates')
            .select('created_at, applied_room, rooms:applied_room(id, hr_id), users(name, email)')
            .eq('rooms.hr_id', id)
            .order('created_at', { ascending: false })
            .limit(5);
        if (candidatesError) {
            console.error('Error fetching recent candidates:', candidatesError);
        }

        return recentCandidates;
    }

    if (kind === "averageScore") {
        const { data, error: rpcError } = await supabase
            .rpc('get_average_score_by_hr', { hr_uuid: id });

        if (rpcError) {
            console.error('Error fetching accepted candidate average score:', rpcError);
        }

        return data || 0;
    }

    if (kind === "acceptedCount") {
        const { count, error: candidatesCountError } = await supabase
            .from('candidates')
            .select('*, rooms!inner(hr_id)', { count: 'exact', head: true })
            .eq('rooms.hr_id', id)
            .eq('candidate_status', 'accepted');
        if (candidatesCountError) {
            console.error('Error fetching accepted candidate count:', candidatesCountError);
        }

        return count
    }

    // Default to fetching all candidates
    const { data: allCandidates, error: candidatesError } = await supabase
        .from('candidates')
        .select('*, rooms:applied_room(id, hr_id), users(name, email)')
        .eq('rooms.hr_id', id);
    if (candidatesError) {
        console.error('Error fetching all candidates:', candidatesError);
    }

    return allCandidates;
}