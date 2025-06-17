import { NextRequest, NextResponse } from "next/server";
import { analyzeJobDescription } from "../../../src/lib/llm/jdAnalyzer";
import { optimizeCv } from "../../../src/lib/llm/cvOptimizer";
import { applyLinkedIn } from "../../../src/lib/automation/linkedinApply";
import { db } from "../../../src/lib/db";

export async function POST(req: NextRequest) {
  const { jobLink, jobDescription, companyName, jobTitle, coverLetter } = await req.json();

  const analysis = await analyzeJobDescription(jobDescription);
  const profile = await db.userProfile.findFirst();
  if (!profile) {
    return NextResponse.json({ error: "No profile" }, { status: 400 });
  }
  const optimizedCv = await optimizeCv(profile.resume, analysis.keywords);
  await applyLinkedIn({ jobLink, optimizedCv, coverLetter });

  const application = await db.jobApplication.create({
    data: { companyName, jobTitle, jobLink, platform: "LinkedIn", status: "applied" },
  });

  return NextResponse.json({ success: true, application });
}
