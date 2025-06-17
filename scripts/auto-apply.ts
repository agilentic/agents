import { runJobApplicationTeam } from '../src/lib/agents/jobApplicationTeam';

async function main() {
  await runJobApplicationTeam();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
