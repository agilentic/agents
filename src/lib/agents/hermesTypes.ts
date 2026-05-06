export interface HermesMessage {
  content: string;
  from?: string;
  to?: string | string[];
  data?: Record<string, any>;
}

export interface HermesRoute {
  match(msg: HermesMessage): boolean;
  to: string | string[];
  /** Run targets in series, passing each reply as input to the next. */
  sequential?: boolean;
}

export interface HermesAgent {
  name: string;
  act(message: HermesMessage): Promise<HermesMessage>;
}
