import { AuditLoggingJobController } from './application/jobs/audit-logging.job-controller.js';
import { PgBossStatesMonitoringJobController } from './application/jobs/pgboss-states-monitoring.job-controller.js';
import { SendEmailJobController } from './mail/application/jobs/send-email.job-controller.js';

export const sharedJobControllers = [
  AuditLoggingJobController,
  PgBossStatesMonitoringJobController,
  SendEmailJobController,
];
