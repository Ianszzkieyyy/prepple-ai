import { NextResponse } from 'next/server'

const AGENT_API_KEY = process.env.AGENT_API_KEY

export async function POST(req: Request) {
    try {
        const apiKey = req.headers.get("x-api-key");
        if (apiKey !== AGENT_API_KEY) {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        const body = await req.json()
        const { roomId, candidateId, sessionHistory, usageMetrics } = body

        if (!roomId || !candidateId || !sessionHistory || !usageMetrics) {
            return new NextResponse('Missing required fields', { status: 400 })
        }

    } catch (error) {
        console.error("Error process interview result:", error)
        if (error instanceof Error) {
            return new NextResponse(error.message, { status: 500 })
        }
        return new NextResponse("An unknown error occurred", { status: 500 })
    }

}