import { HermesAgent, HermesMessage, HermesRoute } from './hermesTypes';

export class Hermes {
  private registry = new Map<string, HermesAgent>();
  private routes: HermesRoute[] = [];

  register(agent: HermesAgent): this {
    this.registry.set(agent.name, agent);
    return this;
  }

  addRoute(route: HermesRoute): this {
    this.routes.push(route);
    return this;
  }

  /** Resolve target agent names for a message. */
  private resolve(msg: HermesMessage): string[] {
    if (msg.to) {
      return Array.isArray(msg.to) ? msg.to : [msg.to];
    }
    for (const route of this.routes) {
      if (route.match(msg)) {
        return Array.isArray(route.to) ? route.to : [route.to];
      }
    }
    // broadcast: deliver to all registered agents
    return [...this.registry.keys()];
  }

  /** Dispatch a message, fanning out to all resolved targets in parallel. */
  async dispatch(msg: HermesMessage): Promise<HermesMessage[]> {
    const targets = this.resolve(msg);
    return Promise.all(
      targets.map(async (name) => {
        const agent = this.registry.get(name);
        if (!agent) throw new Error(`Hermes: unknown agent "${name}"`);
        const reply = await agent.act({ ...msg, from: 'hermes', to: name });
        return { ...reply, from: name };
      })
    );
  }

  /**
   * Run a sequential pipeline through the registered agents in insertion order,
   * passing each agent's reply as input to the next.
   */
  async run(initial: HermesMessage): Promise<HermesMessage> {
    let msg: HermesMessage = initial;
    for (const [name, agent] of this.registry) {
      msg = await agent.act({ ...msg, from: 'hermes', to: name });
      msg = { ...msg, from: name };
    }
    return msg;
  }
}
