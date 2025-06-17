export interface AgentMessage {
  content: string;
  data?: Record<string, any>;
}

export interface Agent {
  name: string;
  act(message: AgentMessage): Promise<AgentMessage>;
}
