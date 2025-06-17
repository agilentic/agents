import { JobListing } from "./types";

export async function fetchEFinancialCareersJobs(): Promise<JobListing[]> {
  // Placeholder for eFinancialCareers scraping or API call
  return [
    {
      company: "Example Corp",
      title: "Software Engineer",
      link: "https://efinancialcareers.com/jobs/example",
      description: "Sample job description",
      platform: "eFinancialCareers",
    },
  ];
}
