import { JobListing } from "./types";

export async function fetchIndeedJobs(): Promise<JobListing[]> {
  // Placeholder for Indeed scraping or API call
  return [
    {
      company: "Example Corp",
      title: "Software Engineer",
      link: "https://indeed.com/jobs/example",
      description: "Sample job description",
      platform: "Indeed",
    },
  ];
}
