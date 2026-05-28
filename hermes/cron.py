"""APScheduler entry point. Run with: python -m hermes.cron"""
from __future__ import annotations

import logging

from apscheduler.schedulers.blocking import BlockingScheduler

from . import config as cfg_mod
from .jobs import draft_posts_job, poll_mentions_job, publish_approved_job

logging.basicConfig(level=logging.INFO,
                    format="%(asctime)s %(name)s %(levelname)s %(message)s")
log = logging.getLogger("hermes.cron")


def main() -> None:
    cfg = cfg_mod.load()
    sched = BlockingScheduler(timezone="UTC")
    sched.add_job(poll_mentions_job, "interval",
                  minutes=cfg.poll_interval_minutes, id="poll_mentions")
    sched.add_job(draft_posts_job, "interval",
                  hours=cfg.draft_interval_hours, id="draft_posts")
    sched.add_job(publish_approved_job, "interval",
                  minutes=max(cfg.poll_interval_minutes, 5), id="publish_approved")
    log.info("hermes cron starting (dry_run=%s, keywords=%s)",
             cfg.dry_run, cfg.keywords)
    sched.start()


if __name__ == "__main__":
    main()
