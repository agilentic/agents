import { Agent, AgentMessage } from './types';
import { fetchJobs } from '../sources/linkedin';

export class JobDiscoveryAgent implements Agent {
  name = 'jobDiscovery';

  async act(_: AgentMessage): Promise<AgentMessage> {
    const jobs = await fetchJobs();
    return { content: 'jobs found', data: { jobs } };
  }
}
