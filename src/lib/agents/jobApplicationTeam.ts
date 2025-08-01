import { AgentTeam } from './team';
import { AgentMessage } from './types';
import { JobDiscoveryAgent } from './jobDiscoveryAgent';
import { JDAnalyzerAgent } from './jdAnalyzerAgent';
import { CvOptimizerAgent } from './cvAgent';
import { ApplyAgent } from './applyAgent';
import { TrackerAgent } from './trackAgent';

export async function runJobApplicationTeam() {
  const team = new AgentTeam([
    new JobDiscoveryAgent(),
    new JDAnalyzerAgent(),
    new CvOptimizerAgent(),
    new ApplyAgent(),
    new TrackerAgent(),
  ]);

  await team.run({ content: 'start' });
}
