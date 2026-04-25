import { Agent, AgentMessage } from './types';
import { fetchLinkedInJobs } from '../sources/linkedin';
import { fetchGlassdoorJobs } from '../sources/glassdoor';
import { fetchIndeedJobs } from '../sources/indeed';
import { fetchJobsDBJobs } from '../sources/jobsdb';
import { fetchEFinancialCareersJobs } from '../sources/efinancialcareers';
import { fetchCompanyJobs } from '../sources/company';

export class JobDiscoveryAgent implements Agent {
  name = 'jobDiscovery';

  async act(_: AgentMessage): Promise<AgentMessage> {
    const results = await Promise.all([
      fetchLinkedInJobs(),
      fetchGlassdoorJobs(),
      fetchIndeedJobs(),
      fetchJobsDBJobs(),
      fetchEFinancialCareersJobs(),
      fetchCompanyJobs(),
    ]);
    const jobs = results.flat();
    return { content: 'jobs found', data: { jobs } };
  }
}
