import { Agent, AgentMessage } from './types';

/**
 * Simple MCP-compliant team orchestrator implementing a basic A2A pipeline.
 */
export class AgentTeam {
  constructor(private agents: Agent[]) {}

  async run(initial: AgentMessage): Promise<void> {
    let msg = initial;
    for (const agent of this.agents) {
      msg = await agent.act(msg);
    }
  }
}
