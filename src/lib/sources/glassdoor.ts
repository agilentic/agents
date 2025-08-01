import { JobListing } from "./types";

export async function fetchGlassdoorJobs(): Promise<JobListing[]> {
  // Placeholder for Glassdoor scraping or API call
  return [
    {
      company: "Example Corp",
      title: "Software Engineer",
      link: "https://glassdoor.com/jobs/example",
      description: "Sample job description",
      platform: "Glassdoor",
    },
  ];
}
