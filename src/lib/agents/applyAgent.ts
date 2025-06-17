import { Agent, AgentMessage } from './types';
import { applyLinkedIn } from '../automation/linkedinApply';

export class ApplyAgent implements Agent {
  name = 'apply';

  async act(message: AgentMessage): Promise<AgentMessage> {
    const jobs = message.data?.jobs || [];
    for (const job of jobs) {
      await applyLinkedIn({
        jobLink: job.link,
        optimizedCv: job.optimizedCv,
        coverLetter: job.coverLetter,
      });
    }
    return { content: 'applied', data: { jobs } };
  }
}
