import { Agent, AgentMessage } from './types';
import { db } from '../db';

export class TrackerAgent implements Agent {
  name = 'tracker';

  async act(message: AgentMessage): Promise<AgentMessage> {
    const jobs = message.data?.jobs || [];
    for (const job of jobs) {
      await db.jobApplication.create({
        data: {
          companyName: job.company,
          jobTitle: job.title,
          jobLink: job.link,
          platform: job.platform,
          status: 'applied',
        },
      });
    }
    return { content: 'tracked', data: { jobs } };
  }
}
