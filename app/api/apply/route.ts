import { NextRequest, NextResponse } from "next/server";
import { analyzeJobDescription } from "../../../src/lib/llm/jdAnalyzer";
import { optimizeCv } from "../../../src/lib/llm/cvOptimizer";
import { applyLinkedIn } from "../../../src/lib/automation/linkedinApply";

import { db } from "../../../src/lib/db";

export async function POST(req: NextRequest) {
  const { jobLink, jobDescription, companyName, jobTitle, coverLetter } = await req.json();
=======
import { applyGlassdoor } from "../../../src/lib/automation/glassdoorApply";
import { applyIndeed } from "../../../src/lib/automation/indeedApply";
import { applyJobsDB } from "../../../src/lib/automation/jobsdbApply";
import { applyEFinancialCareers } from "../../../src/lib/automation/efcApply";
import { applyCompanySite } from "../../../src/lib/automation/companyApply";
import { db } from "../../../src/lib/db";

export async function POST(req: NextRequest) {
  const { jobLink, jobDescription, companyName, jobTitle, coverLetter, platform } = await req.json();
main

  const analysis = await analyzeJobDescription(jobDescription);
  const profile = await db.userProfile.findFirst();
  if (!profile) {
    return NextResponse.json({ error: "No profile" }, { status: 400 });
  }
  const optimizedCv = await optimizeCv(profile.resume, analysis.keywords);

  await applyLinkedIn({ jobLink, optimizedCv, coverLetter });

  const application = await db.jobApplication.create({
    data: { companyName, jobTitle, jobLink, platform: "LinkedIn", status: "applied" },
=======
  const opts = { jobLink, optimizedCv, coverLetter };
  switch (platform) {
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

  const application = await db.jobApplication.create({
    data: { companyName, jobTitle, jobLink, platform, status: "applied" },

  });

  return NextResponse.json({ success: true, application });
}
