import { createClient } from '@/lib/supabase/server'
import { GoogleGenAI } from '@google/genai'
import { parseResume } from './parseResume';
import { generateSignedResume } from './generateSignedResume';

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_API_KEY || '',
});

export interface InterviewReport {
  tone_analysis: {
    confidence_level: number;
    communication_clarity: number;
    enthusiasm: number;
    professionalism: number;
  };
  performance_summary: string;
  recommendation: 'strongly_recommend' | 'recommend' | 'neutral' | 'not_recommend';
  interview_score: number;
  key_highlights: string[];
  areas_for_improvement: string[];
}

export default async function generateReport(roomId: string, candidateId: string, sessionHistory: any[], usageMetrics: any): Promise<InterviewReport> {
    const supabase = await createClient();

    const { data: roomData, error: roomError } = await supabase
      .from('rooms')
      .select('id, room_title, interview_type, job_posting, ideal_length')
      .eq('id', roomId)
      .single();
    if (roomError) throw new Error('Error fetching room data');

    const { data: candidateData, error: candidateError } = await supabase
      .from('candidates')
      .select('id, resume_url, users(name)')
      .eq('id', candidateId)
      .single()
    if (candidateError) throw new Error('Error fetching candidate data')

    const resumeText = await parseResume(await generateSignedResume(candidateData.resume_url))
    const transcriptText = JSON.stringify(sessionHistory)

    const prompt = `You are an expert HR analyst evaluating an interview for Prepple AI, a platform that automates initial HR screening interviews.
      JOB POSTING:
      ${roomData.job_posting}

      CANDIDATE NAME: ${candidateData.users[0].name}
      POSITION: ${roomData.room_title}
      INTERVIEW TYPE: ${roomData.interview_type}

      CANDIDATE'S RESUME:
      ${resumeText || 'Resume not available'}

      INTERVIEW TRANSCRIPT:
      ${transcriptText}

      Generate a comprehensive JSON report with the following structure:
      {
        "tone_analysis": {
          "confidence_level": <0-100>,
          "communication_clarity": <0-100>,
          "enthusiasm": <0-100>,
          "professionalism": <0-100>
        },
        "performance_summary": "<2-3 paragraph narrative evaluation covering key strengths, areas of concern, and fit for the role>",
        "recommendation": "<one of: strongly_recommend, recommend, neutral, not_recommend>",
        "interview_score": <0-100>,
        "key_highlights": ["<highlight 1>", "<highlight 2>", "<highlight 3>"],
        "areas_for_improvement": ["<area 1>", "<area 2>", "<area 3>"]
      }

      Evaluation Criteria:
      - Relevance of candidate's responses to the job requirements
      - Technical competency (especially for technical interviews)
      - Communication skills and clarity
      - Cultural fit indicators
      - Professional demeanor and enthusiasm
      - Time management (interview duration vs. ideal length)
      - Alignment between resume experience and interview responses

      Respond ONLY with valid JSON.`

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-lite',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'object',
          properties: {
            tone_analysis: {
              type: 'object',
              properties: {
                confidence_level: {
                  type: 'number',
                  description: 'Candidate confidence level from 0-100'
                },
                communication_clarity: {
                  type: 'number',
                  description: 'Communication clarity score from 0-100'
                },
                enthusiasm: {
                  type: 'number',
                  description: 'Enthusiasm level from 0-100'
                },
                professionalism: {
                  type: 'number',
                  description: 'Professionalism score from 0-100'
                }
              },
              required: ['confidence_level', 'communication_clarity', 'enthusiasm', 'professionalism']
            },
            performance_summary: {
              type: 'string',
              description: '2-3 paragraph narrative evaluation of candidate performance'
            },
            recommendation: {
              type: 'string',
              enum: ['strongly_recommend', 'recommend', 'neutral', 'not_recommend'],
              description: 'HR hiring recommendation'
            },
            interview_score: {
              type: 'number',
              description: 'Overall interview score from 0-100'
            },
            key_highlights: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Key positive highlights from the interview'
            },
            areas_for_improvement: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Areas where candidate can improve'
            }
          },
          required: [
            'tone_analysis',
            'performance_summary',
            'recommendation',
            'interview_score',
            'key_highlights',
            'areas_for_improvement'
          ],
        },
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        
      }
    })

    const resultJson = response.text || ''

    return JSON.parse(resultJson) as InterviewReport

}