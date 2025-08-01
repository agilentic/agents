from dataclasses import dataclass
from apscheduler.schedulers.background import BackgroundScheduler
from typing import Callable

@dataclass
class SchedulerAgent:
    def __post_init__(self):
        self.scheduler = BackgroundScheduler()

    def daily(self, func: Callable, hour: int = 9):
        self.scheduler.add_job(func, 'cron', hour=hour)
        self.scheduler.start()

    def stop(self):
        self.scheduler.shutdown()
