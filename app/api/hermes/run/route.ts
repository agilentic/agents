import { NextResponse } from 'next/server';
import { runHermesAutoResearch } from '../../../../src/lib/agents/hermesTeam';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const topic = typeof body?.topic === 'string' && body.topic.trim() ? body.topic.trim() : 'Agentic website automation';
    const objective =
      typeof body?.objective === 'string' && body.objective.trim()
        ? body.objective.trim()
        : 'Design a production-ready workflow for two cooperating Hermes agents.';

    const result = await runHermesAutoResearch({ topic, objective });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? 'Failed to run Hermes agents.' }, { status: 500 });
  }
}
