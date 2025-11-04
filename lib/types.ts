interface RoomType {
    id: string;
    room_title?: string;
    room_code?: string;
    room_status?: string;
    start_date?: string;
    end_date?: string;
    interview_type?: string;
    job_posting?: string;
    ai_instruction?: string;
    ideal_length?: number;
    custom_parameters?: Array<{ paramName: string; paramType: string; paramValue: string }>;
    candidates?: [{ count: number }]; 
}

interface CandidateType {
    id: string;
    name: string;
    email: string;
    resume_url: string;
    report_url: string | null;
    created_at: string;
    interview_score: number | null;
    applied_room: string;
    candidate_status: string | null;
}

export type { RoomType, CandidateType };