export interface HermesMessage {
  content: string;
  from?: string;
  to?: string | string[];
  data?: Record<string, any>;
}

export interface HermesRoute {
  match(msg: HermesMessage): boolean;
  to: string | string[];
}

export interface HermesAgent {
  name: string;
  act(message: HermesMessage): Promise<HermesMessage>;
}
