import { NextResponse } from 'next/server';
import { AccessToken, type AccessTokenOptions, type VideoGrant } from 'livekit-server-sdk';
import { RoomConfiguration } from '@livekit/protocol';
import { createClient } from '@/lib/supabase/server';
import { generateSignedResume } from '@/lib/generateSignedResume';

// NOTE: you are expected to define the following environment variables in `.env.local`:
const API_KEY = process.env.LIVEKIT_API_KEY;
const API_SECRET = process.env.LIVEKIT_API_SECRET;
const LIVEKIT_URL = process.env.LIVEKIT_URL;

// don't cache the results
export const revalidate = 0;

export type ConnectionDetails = {
  serverUrl: string;
  roomName: string;
  participantName: string;
  participantToken: string;
};

export async function POST(req: Request) {
  try {
    if (LIVEKIT_URL === undefined) {
      throw new Error('LIVEKIT_URL is not defined');
    }
    if (API_KEY === undefined) {
      throw new Error('LIVEKIT_API_KEY is not defined');
    }
    if (API_SECRET === undefined) {
      throw new Error('LIVEKIT_API_SECRET is not defined');
    }

    // Parse agent configuration from request body
    const body = await req.json();
    const { roomId, candidateId } = body

    if (!roomId || !candidateId) {
      throw new Error('Room ID and Candidate ID are required');
    }

    const supabase = await createClient();
    const { data: roomData, error: roomError } = await supabase
      .from('rooms')
      .select('room_title, interview_type, job_posting, ai_instruction, ideal_length')
      .eq('id', roomId)
      .single();
    if (roomError) throw new Error('Error fetching room data');

    const { data: candidateData, error: candidateError } = await supabase
      .from('candidates')
      .select('resume_url, users(name)')
      .eq('id', candidateId)
      .single()
    if (candidateError) throw new Error('Error fetching candidate data');

    if (!candidateData?.resume_url) {
      throw new Error('Candidate resume not found');
    }

    // const signedResumeUrl = await convertResumeUrlToSignedUrl(
    //   supabase,
    //   candidateData.resume_url,
    // );

    const agentMetadata = JSON.stringify({
      room: roomData,
      candidate: {
        ...candidateData,
        resume_url: await generateSignedResume(candidateData.resume_url),
      },
    });


    // Generate participant token
    const participantName = 'user';
    const participantIdentity = `voice_assistant_user_${Math.floor(Math.random() * 10_000)}`;
    const roomName = `voice_assistant_room_${Math.floor(Math.random() * 10_000)}`;

    const participantToken = await createParticipantToken(
      { identity: participantIdentity, name: participantName },
      roomName,
      agentMetadata
    );

    // Return connection details
    const data: ConnectionDetails = {
      serverUrl: LIVEKIT_URL,
      roomName,
      participantToken: participantToken,
      participantName,
    };
    const headers = new Headers({
      'Cache-Control': 'no-store',
    });
    return NextResponse.json(data, { headers });
  } catch (error) {
    if (error instanceof Error) {
      console.error(error);
      return new NextResponse(error.message, { status: 500 });
    }
  }
}

function createParticipantToken(
  userInfo: AccessTokenOptions,
  roomName: string,
  agentMetadata?: string
): Promise<string> {
  const at = new AccessToken(API_KEY, API_SECRET, {
    ...userInfo,
    ttl: '15m',
  });
  const grant: VideoGrant = {
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canPublishData: true,
    canSubscribe: true,
  };
  at.addGrant(grant);

  if (agentMetadata) {
    at.roomConfig = new RoomConfiguration({
      agents: [{ metadata: agentMetadata }],
    });
  }

  return at.toJwt();
}
