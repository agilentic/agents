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

  private resolveRoute(msg: HermesMessage): { targets: string[]; sequential: boolean } {
    if (msg.to) {
      const targets = Array.isArray(msg.to) ? msg.to : [msg.to];
      return { targets, sequential: false };
    }
    for (const route of this.routes) {
      if (route.match(msg)) {
        const targets = Array.isArray(route.to) ? route.to : [route.to];
        return { targets, sequential: route.sequential ?? false };
      }
    }
    return { targets: [...this.registry.keys()], sequential: false };
  }

  /** Dispatch a message to resolved targets, sequentially or in parallel. */
  async dispatch(msg: HermesMessage): Promise<HermesMessage[]> {
    const { targets, sequential } = this.resolveRoute(msg);

    if (sequential) {
      let current = msg;
      const results: HermesMessage[] = [];
      for (const name of targets) {
        const agent = this.registry.get(name);
        if (!agent) throw new Error(`Hermes: unknown agent "${name}"`);
        current = await agent.act({ ...current, from: 'hermes', to: name });
        current = { ...current, from: name };
        results.push(current);
      }
      return results;
    }

    return Promise.all(
      targets.map(async (name) => {
        const agent = this.registry.get(name);
        if (!agent) throw new Error(`Hermes: unknown agent "${name}"`);
        const reply = await agent.act({ ...msg, from: 'hermes', to: name });
        return { ...reply, from: name };
      })
    );
  }

  /** Run all registered agents as a sequential pipeline. */
  async run(initial: HermesMessage): Promise<HermesMessage> {
    let msg: HermesMessage = initial;
    for (const [name, agent] of this.registry) {
      msg = await agent.act({ ...msg, from: 'hermes', to: name });
      msg = { ...msg, from: name };
    }
    return msg;
  }
}
