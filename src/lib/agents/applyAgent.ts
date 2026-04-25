import { Agent, AgentMessage } from './types';
import { applyLinkedIn } from '../automation/linkedinApply';
import { applyGlassdoor } from '../automation/glassdoorApply';
import { applyIndeed } from '../automation/indeedApply';
import { applyJobsDB } from '../automation/jobsdbApply';
import { applyEFinancialCareers } from '../automation/efcApply';
import { applyCompanySite } from '../automation/companyApply';

export class ApplyAgent implements Agent {
  name = 'apply';

  async act(message: AgentMessage): Promise<AgentMessage> {
    const jobs = message.data?.jobs || [];
    for (const job of jobs) {
      const opts = {
        jobLink: job.link,
        optimizedCv: job.optimizedCv,
        coverLetter: job.coverLetter,
      };
      switch (job.platform) {
        case 'LinkedIn':
          await applyLinkedIn(opts);
          break;
        case 'Glassdoor':
          await applyGlassdoor(opts);
          break;
        case 'Indeed':
          await applyIndeed(opts);
          break;
        case 'JobsDB':
          await applyJobsDB(opts);
          break;
        case 'eFinancialCareers':
          await applyEFinancialCareers(opts);
          break;
        case 'Company':
          await applyCompanySite(opts);
          break;
        default:
          await applyLinkedIn(opts);
      }
    }
    return { content: 'applied', data: { jobs } };
  }
}
