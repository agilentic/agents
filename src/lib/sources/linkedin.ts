export interface JobListing {
  company: string;
  title: string;
  link: string;
  description: string;
}

/**
 * Fetch job listings from LinkedIn.
 * In production this could use the LinkedIn API or scraping.
 */
export async function fetchJobs(): Promise<JobListing[]> {
  // Placeholder implementation
  return [];
}
