import { Agent, AgentMessage } from './types';
import { analyzeJobDescription } from '../llm/jdAnalyzer';

export class JDAnalyzerAgent implements Agent {
  name = 'jdAnalyzer';

  async act(message: AgentMessage): Promise<AgentMessage> {
    const jobs = message.data?.jobs || [];
    const analyzed = [] as any[];
    for (const job of jobs) {
      const analysis = await analyzeJobDescription(job.description);
      analyzed.push({ ...job, analysis });
    }
    return { content: 'jobs analyzed', data: { jobs: analyzed } };
  }
}
