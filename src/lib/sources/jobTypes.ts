export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  platform: 'LinkedIn' | 'Glassdoor' | 'eFinancialCareers' | 'Indeed' | 'JobsDB' | 'Company';
  link: string;
  description?: string;
  salary?: string;
  postedAt?: string;
  easyApply?: boolean;
  remote?: boolean;
}

export interface SearchOptions {
  query?: string;
  location?: string;
  maxResults?: number;
  cookiesPath?: string;
}
