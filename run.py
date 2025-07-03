import os
from ai_hawk.agents.job_scraper import JobScraperAgent
from ai_hawk.agents.job_matcher import JobMatcherAgent
from ai_hawk.agents.resume_writer import ResumeWriterAgent
from ai_hawk.agents.application_agent import ApplicationAgent
from ai_hawk.agents.tracker_agent import TrackerAgent
from ai_hawk.agents.feedback_agent import FeedbackAgent
from ai_hawk.agents.scheduler_agent import SchedulerAgent
from ai_hawk.utils import config

CV_PATH = os.path.join('data', 'cv.txt')


def load_cv():
    if not os.path.exists(CV_PATH):
        return ''
    with open(CV_PATH) as f:
        return f.read()


def pipeline():
    scraper = JobScraperAgent(sources=[
        'https://www.linkedin.com/jobs/search/?keywords={query}',
        'https://www.indeed.com/jobs?q={query}'
    ])
    jobs = scraper.scrape('software engineer')

    matcher = JobMatcherAgent(cv=load_cv())
    writer = ResumeWriterAgent(resume_template=load_cv())
    applier = ApplicationAgent()
    tracker = TrackerAgent(notion_db_id='your_notion_db', airtable_base='base', airtable_table='table')
    feedback = FeedbackAgent()

    for job in jobs:
        match = matcher.match(job)
        if '70' in match['score']:
            cover = writer.write_cover_letter(job)
            success = applier.apply(job, resume=load_cv(), cover_letter=cover)
            status = 'applied' if success else 'failed'
            tracker.log(job, status)
        else:
            continue


def main():
    scheduler = SchedulerAgent()
    scheduler.daily(pipeline)


if __name__ == '__main__':
    main()
