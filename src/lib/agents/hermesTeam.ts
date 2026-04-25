import { Agent, AgentMessage } from './types';
import { AgentTeam } from './team';

export interface HermesAgentProfile {
  id: string;
  codename: string;
  avatar: string;
  mission: string;
  specialty: string;
}

export interface ResearchTask {
  topic: string;
  objective: string;
}

export interface HermesRunOutput {
  generatedAt: string;
  topic: string;
  objective: string;
  agents: HermesAgentProfile[];
  findings: { agentId: string; summary: string; nextAction: string }[];
  synthesis: string;
}

const DEFAULT_AGENTS: HermesAgentProfile[] = [
  {
    id: 'hermes-alpha',
    codename: 'Hermes Alpha',
    avatar: '🛰️',
    mission: 'Map current state and user intent before execution.',
    specialty: 'Breadth-first research and requirement decomposition',
  },
  {
    id: 'hermes-omega',
    codename: 'Hermes Omega',
    avatar: '🧠',
    mission: 'Pressure-test options and transform findings into action plans.',
    specialty: 'Depth analysis, risks, and implementation sequencing',
  },
];

class TaskIntakeAgent implements Agent {
  name = 'task-intake';

  async act(message: AgentMessage): Promise<AgentMessage> {
    const task = (message.data?.task ?? {
      topic: 'Agentic website automation',
      objective: 'Design a production-ready workflow for two cooperating Hermes agents.',
    }) as ResearchTask;

    return { content: 'task-ready', data: { ...message.data, task, agents: DEFAULT_AGENTS } };
  }
}

class AutoResearchAgent implements Agent {
  name = 'auto-research';

  async act(message: AgentMessage): Promise<AgentMessage> {
    const task = message.data?.task as ResearchTask;
    const agents = (message.data?.agents ?? DEFAULT_AGENTS) as HermesAgentProfile[];

    const findings = agents.map((agent, index) => ({
      agentId: agent.id,
      summary:
        index === 0
          ? `Scouted architecture patterns for ${task.topic}; recommended a split between orchestration APIs and a real-time UX surface.`
          : `Reviewed execution risks for ${task.topic}; recommended guardrails for long-running work, telemetry, and explicit approval boundaries.`,
      nextAction:
        index === 0
          ? 'Draft user-facing control panels and define task lifecycle states.'
          : 'Define safety policy, queue strategy, and recovery runbooks before scale-out.',
    }));

    return { content: 'research-complete', data: { ...message.data, findings } };
  }
}

class SynthesisAgent implements Agent {
  name = 'synthesis';

  async act(message: AgentMessage): Promise<AgentMessage> {
    const task = message.data?.task as ResearchTask;
    const findings = (message.data?.findings ?? []) as HermesRunOutput['findings'];

    const synthesis = `Use Hermes Alpha to continuously collect signals for \"${task.topic}\" and Hermes Omega to translate those signals into staged implementation decisions. Keep both agents observable with task states (queued, researching, proposing, approved, shipped) and require explicit human confirmation for external side effects.`;

    return {
      content: 'done',
      data: {
        ...message.data,
        synthesis,
      },
    };
  }
}

export async function runHermesAutoResearch(task: ResearchTask): Promise<HermesRunOutput> {
  const team = new AgentTeam([new TaskIntakeAgent(), new AutoResearchAgent(), new SynthesisAgent()]);
  const result = await team.run({ content: 'start', data: { task } });

  return {
    generatedAt: new Date().toISOString(),
    topic: task.topic,
    objective: task.objective,
    agents: (result.data?.agents ?? DEFAULT_AGENTS) as HermesAgentProfile[],
    findings: (result.data?.findings ?? []) as HermesRunOutput['findings'],
    synthesis: (result.data?.synthesis ?? 'No synthesis generated.') as string,
  };
}
