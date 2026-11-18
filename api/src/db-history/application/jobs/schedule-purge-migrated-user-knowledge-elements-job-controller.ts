import { config } from '../../../../config/config.js';
import { JobScheduleController } from '../../../shared/application/jobs/job-schedule-controller.js';
import { usecases } from '../../domain/usecases/index.js';

class SchedulePurgeMigratedUserKnowledgeElementsJobController extends JobScheduleController {
  constructor() {
    super('SchedulePurgeMigratedUserKnowledgeElementsJob', {
      jobCron: config.features.databaseHistory.schedulePurgeMigratedUserKnowledgeElements.cron,
    });
  }

  /** The job runs only where a cron is configured. */
  get isJobEnabled() {
    return Boolean(this.jobCron);
  }

  async handle() {
    await usecases.purgeExportedMigratedUserKnowledgeElements({
      retentionDays: config.migratedUserKnowledgeElementsPurge.retentionDays,
      batchSize: config.migratedUserKnowledgeElementsPurge.batchSize,
    });
  }
}

export { SchedulePurgeMigratedUserKnowledgeElementsJobController };
