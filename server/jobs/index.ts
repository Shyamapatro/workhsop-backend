import { Agenda } from 'agenda';
import { defineNotificationJobs } from '@/server/jobs/notification.job';

export const registerAllJobs = (agenda: Agenda) => {
  defineNotificationJobs(agenda);
  // As your app scales, simply import and register new job files here:
  // defineEmailJobs(agenda);
  // defineReportingJobs(agenda);
};
