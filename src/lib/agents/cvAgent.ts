import { Agent, AgentMessage } from './types';
import { optimizeCv } from '../llm/cvOptimizer';
import { db } from '../db';

export class CvOptimizerAgent implements Agent {
  name = 'cvOptimizer';

  async act(message: AgentMessage): Promise<AgentMessage> {
    const profile = await db.userProfile.findFirst();
    if (!profile) throw new Error('No user profile');
    const jobs = message.data?.jobs || [];
    const optimized = [] as any[];
    for (const job of jobs) {
      const optimizedCv = await optimizeCv(profile.resume, job.analysis.keywords);
      optimized.push({ ...job, optimizedCv, coverLetter: profile.coverLetterTemplate });
    }
    return { content: 'cv optimized', data: { jobs: optimized } };
  }
}
